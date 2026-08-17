<?php

namespace App\Http\Controllers;

use App\Models\ViralVideo;
use App\Services\ViralVideoAnalysis\VideoAnalysisManager;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class VideoAnalysisPageController extends Controller
{
    public function __construct(
        private readonly VideoAnalysisManager $analyses,
    ) {}

    public function show(Request $request, string $videoId): Response
    {
        $video = ViralVideo::query()->visible()->findOrFail($videoId);
        $analysis = $request->user() ? $this->analyses->statusFor($request->user(), $video) : null;

        return Inertia::render('VideoAnalysis/Show', [
            'video' => $video->toCardArray(),
            'analysis' => $analysis ? [
                'id' => $analysis->id,
                'status' => $analysis->status,
                'result' => $analysis->result,
                'transcript' => $analysis->transcript,
                'transcript_segments' => $analysis->transcript_segments,
                'error_message' => $analysis->error_message,
                'analyzed_at' => $analysis->analyzed_at?->toIso8601String(),
            ] : null,
            'tabs' => [
                ['key' => 'why', 'label' => 'Why It Went Viral'],
                ['key' => 'hook', 'label' => 'Hook'],
                ['key' => 'transcript', 'label' => 'Transcript'],
                ['key' => 'strategist', 'label' => 'Creative Strategist'],
            ],
        ]);
    }
}
