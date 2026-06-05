<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user) {
            abort(403, 'Unauthorized action. Admin role required.');
        }

        $userRoles = array_filter(array_map('trim', explode(',', $user->role ?? 'guest')));

        if (!in_array('admin', $userRoles)) {
            abort(403, 'Unauthorized action. Admin role required.');
        }

        return $next($request);
    }
}
