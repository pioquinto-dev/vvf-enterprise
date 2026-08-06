<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return redirect()->route('home')->with(
            'status',
            'Google login is configured as a placeholder. Wire Socialite user handling next.',
        );
    }

    public function callback(): RedirectResponse
    {
        return redirect()->route('home')->with(
            'status',
            'Google callback reached. Persist users and sessions when auth flows are ready.',
        );
    }
}
