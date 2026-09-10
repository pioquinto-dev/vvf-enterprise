<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\Brevo\BrevoLifecycleEmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendRegistrationEmails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var array<int, int> */
    public array $backoff = [30, 120];

    public function __construct(
        public readonly int $userId,
        public readonly bool $sendVerificationEmail = false,
    ) {}

    public function handle(BrevoLifecycleEmailService $emails): void
    {
        $user = User::find($this->userId);

        if ($user === null) {
            return;
        }

        $emails->sendNewRegistration($user);

        if ($this->sendVerificationEmail) {
            $emails->sendVerifyEmail($user);
        }
    }
}
