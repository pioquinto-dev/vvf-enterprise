<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utm_page_visits', function (Blueprint $table) {
            $table->id();
            $table->uuid('visit_key')->unique();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('referrer_host')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['created_at', 'utm_source']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utm_page_visits');
    }
};
