<?php

namespace App\Http\Controllers;

use App\Services\Support\SupportAssistant;
use App\Services\Support\SupportKnowledgeBase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;

class SupportAssistantController extends Controller
{
    public function __construct(
        private readonly SupportAssistant $assistant,
        private readonly SupportKnowledgeBase $knowledge,
    ) {}

    public function show(Request $request): Response
    {
        $key = $this->key($request, 'session');
        $available = ! RateLimiter::tooManyAttempts($key, (int) config('support_assistant.session_attempts', 2));

        if ($available) {
            RateLimiter::hit($key, (int) config('support_assistant.session_decay_seconds', 60));
        }

        return Inertia::render('Support', [
            'sessionAvailable' => $available,
            'retryAfter' => $available ? 0 : RateLimiter::availableIn($key),
            'commonQuestions' => $this->knowledge->entries(),
        ]);
    }

    public function reply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'min:2', 'max:600'],
        ]);

        $key = $this->key($request, 'message');
        $attempts = (int) config('support_assistant.message_attempts', 8);

        if (RateLimiter::tooManyAttempts($key, $attempts)) {
            return response()->json([
                'message' => 'The support assistant is receiving too many messages. Please try again shortly.',
                'retryAfter' => RateLimiter::availableIn($key),
            ], 429);
        }

        RateLimiter::hit($key, (int) config('support_assistant.message_decay_seconds', 60));

        return response()->json($this->assistant->reply((string) $validated['question']));
    }

    private function key(Request $request, string $scope): string
    {
        $fingerprint = hash('sha256', implode('|', [
            (string) $request->ip(),
            (string) $request->userAgent(),
        ]));

        return "support-assistant:{$scope}:{$fingerprint}";
    }
}
