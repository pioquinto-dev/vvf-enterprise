<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactInquiryController extends Controller
{
    public function create(Request $request): Response
    {
        $component = $request->user() ? 'Contact' : 'LandingContact';

        return Inertia::render($component, [
            'categories' => [
                ['value' => 'general', 'label' => 'General'],
                ['value' => 'account', 'label' => 'Account'],
                ['value' => 'billing', 'label' => 'Billing'],
                ['value' => 'feature-request', 'label' => 'Feature request'],
                ['value' => 'bug-report', 'label' => 'Bug report'],
            ],
            'defaults' => [
                'name' => (string) ($request->user()?->name ?? ''),
                'email' => (string) ($request->user()?->email ?? ''),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'category' => ['required', 'string', 'in:general,account,billing,feature-request,bug-report'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        Inquiry::create([
            ...$data,
            'user_id' => $request->user()?->id,
            'subject' => blank($data['subject'] ?? null) ? null : $data['subject'],
        ]);

        return redirect()->route('contact.create')->with('status', 'Your inquiry was sent. We will follow up by email.');
    }
}
