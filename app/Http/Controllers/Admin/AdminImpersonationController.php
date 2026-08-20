<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use App\Services\Admin\AdminImpersonationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AdminImpersonationController extends Controller
{
    public function __construct(
        private readonly AdminImpersonationService $impersonation,
    ) {}

    public function start(Request $request, User $user): RedirectResponse
    {
        $this->impersonation->start($request, $user);

        return redirect()->route('dashboard');
    }

    public function stop(Request $request): RedirectResponse
    {
        $this->impersonation->stop($request);

        return redirect()->route('admin.dashboard');
    }
}
