<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table): void {
            $table->ulid('id')->primary();
            $table->string('slug');
            $table->string('name');
            $table->string('stripe_product_id')->nullable();
            $table->string('stripe_price_id')->nullable();
            $table->integer('price_cents');
            $table->string('currency', 3)->default('usd');
            $table->string('interval')->default('month');
            $table->smallInteger('interval_count')->default(1);
            $table->boolean('is_active')->default(true);
            $table->json('features')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->string('plan_type')->nullable();
            $table->text('description')->nullable();
            $table->decimal('amount', 10, 2)->default(0);
            $table->decimal('annual_amount', 10, 2)->default(0);
            $table->decimal('saved_amount', 10, 2)->default(0);
            $table->integer('unit_amount')->default(0);
            $table->string('duration')->default('monthly');
            $table->string('plan_environment')->default('production');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
