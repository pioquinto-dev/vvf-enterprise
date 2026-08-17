<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class EmailVerificationController extends Controller
{
    public function __invoke(Request $request, int $id, string $hash): RedirectResponse
    {
        $user = User::query()->findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(403);
        }

        if ($user->email_verified_at === null) {
            $user->forceFill([
                'email_verified_at' => now(),
            ])->save();
        }

        if ($request->user()?->is($user)) {
            return redirect('/dashboard')->with('status', 'Email verified successfully.');
        }

        return redirect('/login')->with('status', 'Email verified successfully. You can sign in now.');
    }
}
