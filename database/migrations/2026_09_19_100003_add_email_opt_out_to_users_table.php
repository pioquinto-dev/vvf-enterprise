<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Unsubscribe support for the lifecycle's marketing mail (the trial and
     * subscription winback flows). Transactional mail — billing, verification,
     * search results — ignores the opt-out.
     *
     * The token is stored rather than signed on the fly so the unsubscribe
     * link keeps working after a password change or a session expiry, and so a
     * recipient never needs to log in to opt out.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('unsubscribe_token', 64)->nullable()->unique()->after('remember_token');
            $table->timestamp('email_opted_out_at')->nullable()->after('unsubscribe_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn(['unsubscribe_token', 'email_opted_out_at']);
        });
    }
};
