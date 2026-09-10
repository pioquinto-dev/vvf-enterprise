<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CriticalErrorLog extends Model
{
    const UPDATED_AT = null;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'context' => 'array',
            'resolved_at' => 'datetime',
        ];
    }
}
