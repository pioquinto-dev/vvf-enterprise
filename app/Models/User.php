<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'stripe_customer_id', 'current_plan_slug', 'monthly_credits_remaining', 'plan_renews_at', 'free_search_used_at', 'preferences', 'deletion_requested_at', 'deletion_scheduled_for'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'plan_renews_at' => 'datetime',
            'free_search_used_at' => 'datetime',
            'preferences' => 'array',
            'deletion_requested_at' => 'datetime',
            'deletion_scheduled_for' => 'datetime',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function videoBookmarks(): HasMany
    {
        return $this->hasMany(VideoBookmark::class);
    }

    public function customKeywordSearches(): HasMany
    {
        return $this->hasMany(CustomKeywordSearch::class);
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    public function videoAnalyses(): HasMany
    {
        return $this->hasMany(VideoAnalysis::class);
    }
}
