<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('utm_page_visits', 'referrer_host')) {
            Schema::table('utm_page_visits', function (Blueprint $table) {
                $table->string('referrer_host')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('utm_page_visits', 'referrer_host')) {
            Schema::table('utm_page_visits', function (Blueprint $table) {
                $table->dropColumn('referrer_host');
            });
        }
    }
};
