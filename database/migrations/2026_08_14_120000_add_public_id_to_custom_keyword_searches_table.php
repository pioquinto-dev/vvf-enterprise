<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Gives each saved search a random, non-guessable public id used in its URL
 * (/results/{public_id}) instead of the sequential primary key. The bigint PK
 * stays as-is so foreign keys and the API's numeric {id} routes are untouched.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_keyword_searches', function (Blueprint $table): void {
            $table->string('public_id', 24)->nullable()->after('id');
        });

        // Backfill existing rows (including soft-deleted) with a random token.
        DB::table('custom_keyword_searches')
            ->orderBy('id')
            ->select('id')
            ->get()
            ->each(function ($row): void {
                DB::table('custom_keyword_searches')
                    ->where('id', $row->id)
                    ->update(['public_id' => Str::lower(Str::random(12))]);
            });

        Schema::table('custom_keyword_searches', function (Blueprint $table): void {
            $table->unique('public_id');
        });
    }

    public function down(): void
    {
        Schema::table('custom_keyword_searches', function (Blueprint $table): void {
            $table->dropUnique(['public_id']);
            $table->dropColumn('public_id');
        });
    }
};
