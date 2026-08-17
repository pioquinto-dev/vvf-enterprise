<?php

namespace App\Http\Controllers;

use App\Http\Resources\SavedSearchPresenter;
use App\Models\ViralVideo;
use App\Services\ViralVideoAnalysis\VideoAnalysisManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class VideoAnalysisController extends Controller
{
    public function __construct(
        private readonly VideoAnalysisManager $analyses,
    ) {}

    public function store(Request $request, string $videoId): JsonResponse
    {
        $user = $request->user();

        if ($user === null) {
            throw ValidationException::withMessages([
                'auth' => 'Sign in before analyzing videos.',
            ]);
        }

        $video = ViralVideo::query()->visible()->findOrFail($videoId);

        $analysis = $this->analyses->request(
            user: $user,
            video: $video,
            forceRefresh: $request->boolean('force_refresh'),
        );

        return response()->json([
            'analysis' => $this->payload($analysis),
        ], 202);
    }

    public function show(Request $request, string $videoId): JsonResponse
    {
        $user = $request->user();

        if ($user === null) {
            throw ValidationException::withMessages([
                'auth' => 'Sign in before viewing video analysis.',
            ]);
        }

        $video = ViralVideo::query()->visible()->findOrFail($videoId);
        $analysis = $this->analyses->statusFor($user, $video);

        return response()->json([
            'analysis' => $analysis ? $this->payload($analysis) : null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(\App\Models\VideoAnalysis $analysis): array
    {
        return SavedSearchPresenter::analysisPayload($analysis);
    }
}
