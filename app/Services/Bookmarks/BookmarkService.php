<?php

namespace App\Services\Bookmarks;

use App\Models\User;
use App\Models\VideoBookmark;
use App\Models\ViralVideo;
use App\Services\Admin\UserActivityService;
use App\Services\Billing\BillingEntitlementService;

class BookmarkService
{
    public function __construct(private readonly BillingEntitlementService $billing, private readonly UserActivityService $activity) {}

    /**
     * @return array<int, int>
     */
    public function idsForUser(?User $user): array
    {
        if ($user === null) {
            return [];
        }

        return VideoBookmark::query()
            ->where('user_id', $user->id)
            ->pluck('viral_video_id')
            ->all();
    }

    public function add(User $user, string $videoId): bool
    {
        $video = ViralVideo::query()->findOrFail($videoId);
        $existing = VideoBookmark::query()
            ->where('user_id', $user->id)
            ->where('viral_video_id', $video->id)
            ->first();

        if ($existing !== null) {
            return false;
        }

        $this->billing->ensureCanBookmark($user);

        VideoBookmark::query()->create([
            'user_id' => $user->id,
            'viral_video_id' => $video->id,
        ]);

        $this->billing->consumeVideoBookmark($user);
        $this->activity->record($user, 'engagement', 'video_bookmarked', 'Bookmarked a video.', ['video_id' => $video->id]);

        return true;
    }

    public function remove(User $user, string $videoId): void
    {
        $video = ViralVideo::query()->findOrFail($videoId);

        VideoBookmark::query()
            ->where('user_id', $user->id)
            ->where('viral_video_id', $video->id)
            ->delete();

    }
}
