<?php

namespace App\Console\Commands\Testing;

use App\Models\EmailTemplate;
use App\Models\User;
use App\Services\Brevo\BrevoTransactionalEmailSender;
use App\Support\EmailSampleData;
use App\Support\EmailTemplateRegistry;
use Illuminate\Console\Command;
use Throwable;

/**
 * Sends a filled-in preview of any lifecycle template to a test inbox.
 *
 * Three things make this different from triggering the real thing:
 *
 *   It sends to whoever you tell it to, not to the person the data belongs to.
 *   With --user-id it reads a real account's searches and breakouts and puts
 *   them in an email addressed to you.
 *
 *   It skips what cannot send — no Brevo ID, disabled, deleted — and says which
 *   and why, rather than throwing on the first one. Previewing the set while
 *   half the templates are still being built in Brevo is the normal case.
 *
 *   Every merge field is filled. An empty field looks the same as a broken one,
 *   so a preview with gaps cannot tell you whether the template is right.
 *
 * It does NOT touch the email_sends ledger, so previewing does not consume
 * anyone's real send slot.
 */
class SendBrevoTestEmail extends Command
{
    protected $signature = 'testing:send-brevo-email
        {notification=all : A template key, or all}
        {--email= : Override the configured test recipient}
        {--name=Test User : Recipient name}
        {--user-id= : Build the payloads from this account\'s real data (searches, breakouts, subscription). The email still goes to the test recipient.}
        {--include-unsendable : Attempt templates with no Brevo ID too, so the failure is visible rather than skipped}
        {--dry-run : Build and report the payloads without sending anything}';

    protected $description = 'Send filled-in Brevo previews of the lifecycle emails to a test inbox.';

    public function __construct(private readonly BrevoTransactionalEmailSender $sender)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $email = (string) ($this->option('email') ?: config('services.brevo.test_recipient_email', ''));
        $name = (string) $this->option('name');

        if ($email === '') {
            $this->error('Set BREVO_TEST_RECIPIENT_EMAIL or pass --email=');

            return self::FAILURE;
        }

        $keys = $this->resolveKeys((string) $this->argument('notification'));

        if ($keys === null) {
            return self::FAILURE;
        }

        $sample = $this->sampleData($email, $name);

        if ($sample === null) {
            return self::FAILURE;
        }

        $this->line($sample->borrowedFromAccount()
            ? 'Using real account data: '.$sample->describeSubject()
            : 'Using sample data: '.$sample->describeSubject());

        foreach ($sample->notes() as $note) {
            $this->warn('  Substituted: '.$note);
        }

        $this->newLine();

        $sent = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($keys as $key) {
            $skipReason = $this->skipReason($key);

            if ($skipReason !== null && ! $this->option('include-unsendable')) {
                $this->line(sprintf('  <fg=yellow>skip</>    %-28s %s', $key, $skipReason));
                $skipped++;

                continue;
            }

            try {
                $payload = $sample->payload($key);
            } catch (Throwable $error) {
                $this->line(sprintf('  <fg=red>failed</>  %-28s could not build: %s', $key, $error->getMessage()));
                $failed++;

                continue;
            }

            if ($payload === null) {
                $this->line(sprintf('  <fg=yellow>skip</>    %-28s no preview is defined for this key', $key));
                $skipped++;

                continue;
            }

            if ($this->option('dry-run')) {
                $this->line(sprintf(
                    '  <fg=cyan>built</>   %-28s template #%s, %d params, subject: %s',
                    $key,
                    (string) ($payload['templateId'] ?? '?'),
                    count((array) ($payload['params'] ?? [])),
                    (string) ($payload['subject'] ?? ''),
                ));
                $this->reportEmptyParams($key, $payload);
                $sent++;

                continue;
            }

            try {
                $result = $this->sender->send($payload);
            } catch (Throwable $error) {
                $this->line(sprintf('  <fg=red>failed</>  %-28s %s', $key, $error->getMessage()));
                $failed++;

                continue;
            }

            $this->line(sprintf(
                '  <fg=green>sent</>    %-28s template #%s, message %s',
                $key,
                (string) ($payload['templateId'] ?? '?'),
                (string) ($result['messageId'] ?? '-'),
            ));
            $this->reportEmptyParams($key, $payload);
            $sent++;
        }

        $this->newLine();
        $this->info(sprintf(
            '%s: %d, skipped: %d, failed: %d — recipient %s',
            $this->option('dry-run') ? 'Built' : 'Sent',
            $sent,
            $skipped,
            $failed,
            $email,
        ));

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    /**
     * Which templates to preview. `all` walks the registry in config order, so a
     * new template is included the moment it is declared.
     *
     * @return array<int, string>|null
     */
    private function resolveKeys(string $notification): ?array
    {
        $declared = array_keys((array) config('brevo_notifications.notifications', []));

        if ($notification === 'all') {
            return $declared;
        }

        if (in_array($notification, $declared, true)) {
            return [$notification];
        }

        $this->error("Unknown template [{$notification}].");
        $this->line('Declared templates:');

        foreach ($declared as $key) {
            $this->line('  - '.$key);
        }

        return null;
    }

    /**
     * Why this template cannot be previewed, or null when it can.
     *
     * Checked against the row rather than config, because the row is what the
     * send would read. A soft-deleted row is reported as deleted rather than as
     * a missing ID: they need different fixes.
     */
    private function skipReason(string $key): ?string
    {
        $row = EmailTemplate::withTrashed()->whereKey($key)->first();

        if ($row !== null && $row->deleted_at !== null) {
            return 'deleted in Admin -> Email Templates, restore it to preview';
        }

        if (EmailTemplateRegistry::brevoTemplateId($key) === null) {
            return 'no Brevo template ID yet, enter it in Admin -> Email Templates';
        }

        if (! EmailTemplateRegistry::isEnabled($key)) {
            return 'disabled in Admin -> Email Templates';
        }

        return null;
    }

    /**
     * Names any declared merge field that went out empty.
     *
     * This is the actual point of the command. A blank field renders as a gap
     * that looks exactly like a broken tag, so a preview that does not tell you
     * which ones were blank is a preview you cannot trust.
     *
     * @param  array<string, mixed>  $payload
     */
    private function reportEmptyParams(string $key, array $payload): void
    {
        $params = (array) ($payload['params'] ?? []);
        $declared = (array) config("brevo_notifications.notifications.{$key}.params", []);

        $empty = [];

        foreach ($declared as $param) {
            $value = $params[$param] ?? null;

            if ($value === null || $value === '' || $value === []) {
                $empty[] = $param;
            }
        }

        if ($empty !== []) {
            $this->line('            <fg=yellow>empty:</> '.implode(', ', $empty));
        }
    }

    /**
     * Sample data, or a real account's data when --user-id is set.
     */
    private function sampleData(string $email, string $name): ?EmailSampleData
    {
        $userId = $this->option('user-id');

        if ($userId === null || $userId === '') {
            return EmailSampleData::invented($email, $name);
        }

        $account = User::withTrashed()->find($userId);

        if ($account === null) {
            $this->error("No user with id [{$userId}].");

            return null;
        }

        $this->line(sprintf(
            'Borrowing data from user #%s (%s). The email goes to %s, not to them.',
            (string) $account->id,
            (string) $account->email,
            $email,
        ));

        return EmailSampleData::borrowedFrom($account, $email, $name);
    }
}
