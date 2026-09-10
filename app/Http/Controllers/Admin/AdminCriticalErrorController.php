<?php

namespace App\Http\Controllers\Admin;

use App\Models\CriticalErrorLog;
use App\Services\Admin\CriticalErrorLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminCriticalErrorController extends Controller
{
    public function __construct(private readonly CriticalErrorLogService $errors) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Admin/CriticalErrors', [
            ...$this->errors->logPayload($request),
            'adminUser' => $request->session()->get('admin.user'),
        ]);
    }

    public function resolve(CriticalErrorLog $criticalError): RedirectResponse
    {
        $this->errors->resolve($criticalError);

        return back()->with('status', 'Marked resolved.');
    }
}
