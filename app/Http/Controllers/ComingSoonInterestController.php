<?php

namespace App\Http\Controllers;

use App\Models\ComingSoonInterest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ComingSoonInterestController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        abort_unless(config('features.show_coming_soon'), 404);

        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        ComingSoonInterest::query()->firstOrCreate([
            'email' => strtolower(trim($validated['email'])),
        ]);

        return back()->with('status', 'Thanks. We\'ll let you know when we go live.');
    }
}
