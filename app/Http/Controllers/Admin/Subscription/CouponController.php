<?php

namespace App\Http\Controllers\Admin\Subscription;

use App\Http\Controllers\Admin\Controller;
use App\Services\Admin\Listings\AdminListingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function __construct(
        private readonly AdminListingService $listings,
    ) {}

    public function programs(Request $request): Response
    {
        return $this->render('coupon-programs', $request);
    }

    public function whitelist(Request $request): Response
    {
        return $this->render('coupon-whitelist', $request);
    }

    public function usage(Request $request): Response
    {
        return $this->render('coupon-usage', $request);
    }

    private function render(string $resource, Request $request): Response
    {
        return Inertia::render('Admin/Listing', [
            ...$this->listings->listing($resource, $request),
            'adminUser' => $request->session()->get('admin.user'),
        ]);
    }
}
