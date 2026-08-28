<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('managed_coupon_whitelist_entries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('managed_coupon_program_id')
                ->constrained('managed_coupon_programs')
                ->cascadeOnDelete();
            $table->string('email', 191)->index();
            $table->string('note', 255)->nullable();
            $table->string('added_by', 191)->nullable();
            $table->timestamps();

            $table->unique(['managed_coupon_program_id', 'email'], 'managed_coupon_whitelist_unique_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('managed_coupon_whitelist_entries');
    }
};
