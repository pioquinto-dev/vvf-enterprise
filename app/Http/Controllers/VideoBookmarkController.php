<?php

namespace App\Http\Controllers;

use App\Services\Bookmarks\BookmarkService;
use App\Services\Billing\BillingEntitlementService;
use App\Support\AppEventLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class VideoBookmarkController extends Controller
{
    public function __construct(
        private readonly BookmarkService $bookmarks,
        private readonly BillingEntitlementService $billing,
    ) {}

    public function store(Request $request, string $videoId): JsonResponse
    {
        $user = $request->user();

        if ($user === null) {
            throw ValidationException::withMessages([
                'auth' => 'Sign in before bookmarking videos.',
            ]);
        }

        $this->billing->ensureCanBookmark($user);
        $this->bookmarks->add($user, $videoId);

        AppEventLogger::result('video_bookmark.saved', [
            'user_id' => $user->id,
            'video_id' => $videoId,
            'bookmark_count' => $this->billing->videoBookmarkCount($user),
        ]);

        return response()->json([
            'bookmarked' => true,
            'bookmarkCount' => $this->billing->videoBookmarkCount($user),
        ]);
    }

    public function destroy(Request $request, string $videoId): JsonResponse
    {
        $user = $request->user();

        if ($user === null) {
            throw ValidationException::withMessages([
                'auth' => 'Sign in before changing bookmarks.',
            ]);
        }

        $this->bookmarks->remove($user, $videoId);

        AppEventLogger::result('video_bookmark.removed', [
            'user_id' => $user->id,
            'video_id' => $videoId,
            'bookmark_count' => $this->billing->videoBookmarkCount($user),
        ]);

        return response()->json([
            'bookmarked' => false,
            'bookmarkCount' => $this->billing->videoBookmarkCount($user),
        ]);
    }
}
