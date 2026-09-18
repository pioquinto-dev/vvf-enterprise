<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\AppEventLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Public unsubscribe endpoint. Deliberately requires no session: the recipient
 * of a winback email has usually stopped logging in, and an opt-out behind a
 * login wall is not an opt-out.
 */
class EmailPreferenceController extends Controller
{
    public function unsubscribe(string $token): Response
    {
        $user = $this->resolve($token);

        if ($user->email_opted_out_at === null) {
            $user->forceFill(['email_opted_out_at' => now()])->save();

            AppEventLogger::result('email.unsubscribed', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        }

        return Inertia::render('EmailPreferences', [
            'state' => 'unsubscribed',
            'email' => $user->email,
            'token' => $token,
        ]);
    }

    /**
     * Undo, for the misclick. Same tokened route, so it also needs no login.
     */
    public function resubscribe(Request $request, string $token): Response
    {
        $user = $this->resolve($token);

        $user->forceFill(['email_opted_out_at' => null])->save();

        AppEventLogger::result('email.resubscribed', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return Inertia::render('EmailPreferences', [
            'state' => 'resubscribed',
            'email' => $user->email,
            'token' => $token,
        ]);
    }

    private function resolve(string $token): User
    {
        $user = User::query()->where('unsubscribe_token', $token)->first();

        if ($user === null) {
            throw new NotFoundHttpException('This unsubscribe link is no longer valid.');
        }

        return $user;
    }
}
