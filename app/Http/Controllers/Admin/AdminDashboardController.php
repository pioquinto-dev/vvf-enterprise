<?php

namespace App\Http\Controllers\Admin;

use App\Services\Admin\AdminDashboardService;
use App\Services\Admin\DashboardSnapshotService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __construct(
        private readonly AdminDashboardService $dashboard,
    ) {}

    public function __invoke(Request $request): Response
    {
        return Inertia::render('Admin/Dashboard', [
            ...$this->dashboard->dashboardPayload($request->query('range')),
            'adminUser' => $request->session()->get('admin.user'),
        ]);
    }

    /**
     * Manual "refresh report" action. Rewrites today's snapshot row in place,
     * so pressing it repeatedly cannot inflate the trend series.
     */
    public function refresh(DashboardSnapshotService $snapshots): RedirectResponse
    {
        $snapshots->capture();

        return back()->with('status', 'Snapshot refreshed.');
    }
}
