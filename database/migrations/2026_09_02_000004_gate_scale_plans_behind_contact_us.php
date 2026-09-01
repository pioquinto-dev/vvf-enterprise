<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Scale is not self-serve yet — it is gated behind a "Contact Us" flow. Flag the
 * existing plan rows so BillingService::checkout() refuses a direct-API attempt,
 * not just the hidden front-end button.
 */
return new class extends Migration
{
    /** @var array<int, string> */
    private const SCALE_SLUGS = ['scale', 'scale-annual'];

    public function up(): void
    {
        $this->setSelfServe(false);
    }

    public function down(): void
    {
        $this->setSelfServe(true);
    }

    private function setSelfServe(bool $selfServe): void
    {
        foreach (DB::table('plans')->whereIn('slug', self::SCALE_SLUGS)->get(['id', 'metadata']) as $plan) {
            $metadata = json_decode((string) $plan->metadata, true);
            $metadata = is_array($metadata) ? $metadata : [];

            data_set($metadata, 'settings.self_serve', $selfServe);
            data_set($metadata, 'settings.cta', $selfServe ? 'Choose Scale' : 'Contact Us');

            DB::table('plans')->where('id', $plan->id)->update(['metadata' => json_encode($metadata)]);
        }
    }
};
