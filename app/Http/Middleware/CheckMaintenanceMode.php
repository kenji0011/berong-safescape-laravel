<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\SystemSetting;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            // SystemSetting::getVal() caches for 30s and safely handles DB/table errors
            $config = SystemSetting::getVal('maintenance_mode');
            
            if ($config && isset($config['is_active']) && $config['is_active']) {
                // Determine if user is admin
                $isAdmin = \Illuminate\Support\Facades\Auth::check() && str_contains(\Illuminate\Support\Facades\Auth::user()->role, 'admin');

                // Determine if route is a login or maintenance related bypass route
                $isBypass = $request->is('login') || 
                            $request->is('logout') || 
                            $request->is('maintenance') || 
                            $request->is('api/auth/*') ||
                            $request->is('api/login') ||
                            $request->is('api/logout');

                if (!$isAdmin && !$isBypass) {
                    if ($request->expectsJson() || $request->is('api/*')) {
                        return response()->json([
                            'message' => $config['message'] ?? 'The site is under maintenance.'
                        ], 503);
                    }

                    return redirect()->route('maintenance');
                }
            }
        } catch (\Throwable $e) {
            // Silently fall back to normal processing if database is unreachable or error occurs
            \Illuminate\Support\Facades\Log::error('Maintenance mode middleware error: ' . $e->getMessage());
        }

        return $next($request);
    }
}
