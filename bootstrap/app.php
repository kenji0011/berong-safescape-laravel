<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        // API routes shouldn't be stateful as fetch requests from the frontend lack CSRF tokens.
        // BUT Axios handles CSRF, so we re-enable stateful cookies for the frontend SPA APIs.
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->report(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e) {
            \Illuminate\Support\Facades\Log::warning('Unusual Traffic Pattern Detected (Rate Limit Exceeded)', [
                'ip' => request()->ip(),
                'url' => request()->fullUrl(),
                'user_id' => request()->user() ? request()->user()->id : null
            ]);
        });

        $exceptions->report(function (\Throwable $e) {
            if (request()->is('api/*') && $e->getCode() >= 500) {
                \Illuminate\Support\Facades\Log::error('API Error: ' . $e->getMessage(), [
                    'url' => request()->fullUrl(),
                    'method' => request()->method(),
                    'ip' => request()->ip(),
                    'user_id' => request()->user() ? request()->user()->id : null,
                    'input' => request()->except(['password', 'password_confirmation', 'currentPassword', 'newPassword'])
                ]);
            }
        });
    })->create();
