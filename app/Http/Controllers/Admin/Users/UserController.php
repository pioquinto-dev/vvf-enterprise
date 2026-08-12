<?php

namespace App\Http\Controllers\Admin\Users;

use App\Http\Controllers\Admin\Controller;
use App\Services\Admin\Listings\AdminListingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        private readonly AdminListingService $listings,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Admin/Listing', [
            ...$this->listings->listing('users', $request),
            'adminUser' => $request->session()->get('admin.user'),
        ]);
    }
}
