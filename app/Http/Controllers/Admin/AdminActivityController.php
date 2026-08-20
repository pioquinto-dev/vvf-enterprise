<?php

namespace App\Http\Controllers\Admin;

use App\Services\Admin\UserActivityService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminActivityController extends Controller
{
    public function __construct(private readonly UserActivityService $activity) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Admin/ActivityLog', [
            ...$this->activity->activityLogPayload($request),
            'adminUser' => $request->session()->get('admin.user'),
        ]);
    }
}
