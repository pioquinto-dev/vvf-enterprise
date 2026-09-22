<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * One row per lifecycle email. Replaces the per-notification env vars that
 * config/brevo_notifications.php used to read.
 */
class EmailTemplate extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $guarded = [];

    /** Columns that together describe when this email goes out. */
    public const SCHEDULE_COLUMNS = [
        'send_trigger', 'send_offset_days', 'send_offset_hours', 'send_at',
        'send_weekday', 'send_interval_weeks', 'send_anchor_date',
        'send_immediate', 'send_timezone',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'extra_fields' => 'array',
            'is_transactional' => 'boolean',
            'is_enabled' => 'boolean',
            'send_offset_days' => 'integer',
            'send_offset_hours' => 'integer',
            'send_interval_weeks' => 'integer',
            'send_anchor_date' => 'date',
            'send_immediate' => 'boolean',
        ];
    }

    /**
     * True when this row carries a schedule of its own.
     *
     * The schedule columns were added after the table, and config is still the
     * fallback, so "has an admin set this?" is a real question rather than an
     * assumption. `send_immediate` alone counts: turning it on is a decision.
     *
     * @return bool
     */
    public function hasOwnSchedule(): bool
    {
        return $this->send_trigger !== null
            || $this->send_at !== null
            || $this->send_offset_days !== null
            || $this->send_offset_hours !== null
            || $this->send_weekday !== null
            || $this->send_interval_weeks !== null
            || $this->send_immediate === true;
    }

    /**
     * The schedule in the shape LifecycleSchedule reads.
     *
     * Same keys as a config/email_lifecycle.php entry, so the two are
     * interchangeable and nothing downstream has to know which one it got.
     *
     * @return array<string, mixed>
     */
    public function scheduleSpec(): array
    {
        $spec = [
            'trigger' => $this->send_trigger,
            'offset_days' => $this->send_offset_days,
            'offset_hours' => $this->send_offset_hours,
            'at' => $this->send_at,
            'weekday' => $this->send_weekday,
            'interval_weeks' => $this->send_interval_weeks,
            'anchor' => $this->send_anchor_date?->toDateString(),
            'immediate' => $this->send_immediate === true ? true : null,
            'timezone' => $this->send_timezone,
        ];

        // Null means "not set", not "set to nothing": a key left in would make
        // isset() checks downstream see a schedule that is not there.
        return array_filter($spec, static fn ($value): bool => $value !== null && $value !== '');
    }

    /**
     * A template the code can actually send.
     *
     * Every key the application sends by is declared in
     * config/brevo_notifications.php, so a row whose key is not there was
     * created by hand in the admin screen and nothing references it yet.
     */
    public function isWiredToCode(): bool
    {
        return array_key_exists($this->key, (array) config('brevo_notifications.notifications', []));
    }

    /**
     * Deep link into the Brevo editor for this template, so an admin can jump
     * from the registry straight into the content.
     */
    public function brevoEditUrl(): ?string
    {
        return $this->brevo_template_id === null
            ? null
            : 'https://app.brevo.com/templates/email/edit/'.$this->brevo_template_id;
    }
}
