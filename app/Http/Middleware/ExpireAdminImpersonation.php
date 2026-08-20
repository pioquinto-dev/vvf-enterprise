<?php

namespace App\Http\Middleware;

use App\Services\Admin\AdminImpersonationService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExpireAdminImpersonation
{
    public function __construct(
        private readonly AdminImpersonationService $impersonation,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $this->impersonation->expireInvalidSession($request);

        return $next($request);
    }
}
