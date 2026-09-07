<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NewsletterSubscriptionController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        // Idempotent: a repeat signup with the same address is a no-op, so the
        // form always reports success without leaking whether we already had it.
        NewsletterSubscriber::query()->firstOrCreate([
            'email' => strtolower(trim($validated['email'])),
        ]);

        return back()->with('status', 'You\'re subscribed to the weekly viral digest.');
    }
}
