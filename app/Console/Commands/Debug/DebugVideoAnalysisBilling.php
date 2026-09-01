<?php

namespace App\Console\Commands\Debug;

use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\BillingService;
use Illuminate\Console\Command;

class DebugVideoAnalysisBilling extends Command
{
    protected $signature = 'billing:debug-video-analysis
        {user : User ID or email}
        {--video= : Optional video_id to inspect matching analyses}';

    protected $description = 'Print subscription rows and video analysis usage for a user.';

    public function handle(BillingService $billing): int
    {
        $user = $this->resolveUser((string) $this->argument('user'));

        if ($user === null) {
            $this->error('User not found.');

            return self::FAILURE;
        }

        $limits = $billing->limitsForUser($user);
        $videoId = trim((string) $this->option('video'));

        $this->info("Video analysis billing debug for {$user->email} ({$user->id})");
        $this->table(['Field', 'Value'], [
            ['current_plan_slug', $billing->currentPlanSlug($user)],
            ['plan_renews_at', $billing->ensureSubscriptionRecord($user)->current_period_ends_at?->toIso8601String() ?? '(null)'],
            ['billing.videoAnalysisLimit', (string) ($limits['videoAnalysisLimit'] ?? 0)],
            ['billing.videoAnalysisUsed', (string) ($limits['videoAnalysisUsed'] ?? 0)],
            ['billing.searchCreditsLimit', (string) ($limits['searchCreditsLimit'] ?? 0)],
            ['billing.searchCreditsUsed', (string) ($limits['searchCreditsUsed'] ?? 0)],
        ]);

        $subscriptions = Subscription::query()
            ->with('plan')
            ->where('user_id', $user->id)
            ->orderByDesc('current_period_ends_at')
            ->get();

        $this->newLine();
        $this->info('Subscription rows');

        $this->table(
            ['Subscription ID', 'Status', 'Plan', 'Ends At', 'Video Used', 'Video Limit', 'Deleted'],
            $subscriptions->map(fn (Subscription $subscription): array => [
                $subscription->id,
                $subscription->status ?? '(null)',
                $subscription->plan?->slug ?? $subscription->plan_id ?? '(null)',
                $subscription->current_period_ends_at?->toIso8601String() ?? '(null)',
                (string) data_get($subscription->metadata, 'subscription.video_analysis.used', 0),
                (string) data_get($subscription->metadata, 'subscription.video_analysis.limit', 0),
                $subscription->deleted_at?->toIso8601String() ?? 'no',
            ])->all()
        );

        $analyses = $user->videoAnalyses()
            ->when($videoId !== '', fn ($query) => $query->where('video_id', $videoId))
            ->orderByDesc('updated_at')
            ->limit(10)
            ->get();

        $this->newLine();
        $this->info($videoId !== '' ? "Recent analyses for video_id={$videoId}" : 'Recent analyses');

        $this->table(
            ['Analysis ID', 'Video ID', 'Status', 'Updated At', 'Analyzed At', 'Error'],
            $analyses->map(fn ($analysis): array => [
                $analysis->id,
                $analysis->video_id,
                $analysis->status,
                $analysis->updated_at?->toIso8601String() ?? '(null)',
                $analysis->analyzed_at?->toIso8601String() ?? '(null)',
                $analysis->error_message ?? '(null)',
            ])->all()
        );

        return self::SUCCESS;
    }

    private function resolveUser(string $value): ?User
    {
        $query = User::query();

        if (filter_var($value, FILTER_VALIDATE_EMAIL)) {
            return $query->where('email', $value)->first();
        }

        if (ctype_digit($value)) {
            return $query->where('id', $value)->first();
        }

        return $query->where('email', $value)->first();
    }
}
