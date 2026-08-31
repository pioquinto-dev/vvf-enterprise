<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('managed_coupon_programs')
            ->whereIn('code', ['IGNITEBB', 'IVANVIP'])
            ->update(['collect_payment_method' => false]);
    }

    public function down(): void
    {
        DB::table('managed_coupon_programs')
            ->where('code', 'IVANVIP')
            ->update(['collect_payment_method' => true]);
    }
};
