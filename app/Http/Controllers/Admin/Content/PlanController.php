<?php

namespace App\Http\Controllers\Admin\Content;

use App\Http\Controllers\Admin\Controller;
use App\Services\Admin\Listings\AdminListingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function __construct(
        private readonly AdminListingService $listings,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Listing', [
            ...$this->listings->listing('plans', $request),
            'adminUser' => $request->session()->get('admin.user'),
        ]);
    }
}
