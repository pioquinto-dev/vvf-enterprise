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

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'extra_fields' => 'array',
            'is_transactional' => 'boolean',
            'is_enabled' => 'boolean',
        ];
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
