<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * A signed-out visitor's free-search allowance. The session token alone is
     * worthless as a quota key — logging out regenerates the session and mints
     * a brand new identity. This row is keyed on a hashed IP + user agent, so
     * it survives logout, cookie clears and a fresh browser profile.
     *
     * It is deliberately coarse: shared IPs and VPNs make it imperfect in both
     * directions. It exists so abuse costs real effort and so a scrape is never
     * started with no server-side check at all.
     */
    public function up(): void
    {
        Schema::create('guest_search_grants', function (Blueprint $table): void {
            $table->id();

            // sha256 of IP + user agent, salted with the app key. Raw values are
            // never stored.
            $table->char('fingerprint', 64)->unique();

            $table->unsignedInteger('searches_used')->default(0);

            // Set once the grant is folded into an account, so the same visitor
            // signing out cannot start over.
            $table->foreignId('claimed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('claimed_at')->nullable();

            $table->timestamp('last_search_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guest_search_grants');
    }
};
