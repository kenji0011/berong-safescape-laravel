<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        if (!$user) {
            return redirect('/login');
        }

        $userRoles = array_filter(array_map('trim', explode(',', $user->role ?? 'guest')));

        // Admin can access all
        if (in_array('admin', $userRoles)) {
            return $next($request);
        }

        // Check if user has any of the required roles
        foreach ($roles as $role) {
            if (in_array($role, $userRoles)) {
                return $next($request);
            }
            // If checking kid role, professional also qualifies
            if ($role === 'kid' && in_array('professional', $userRoles)) {
                return $next($request);
            }
            // If checking adult role, professional also qualifies
            if ($role === 'adult' && in_array('professional', $userRoles)) {
                return $next($request);
            }
        }

        return redirect('/dashboard');
    }
}
