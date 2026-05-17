<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('ai', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('password-reset', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });
        \Illuminate\Validation\Rules\Password::defaults(function () {
            return \Illuminate\Validation\Rules\Password::min(8)
                ->mixedCase()
                ->numbers()
                ->symbols();
        });

        // Enforce HTTPS in production
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // Security Logging: Authentication Attempts
        Event::listen(function (Login $event) {
            Log::info("User logged in: " . ($event->user->email ?? $event->user->username), ['ip' => request()->ip()]);
        });

        Event::listen(function (Failed $event) {
            Log::warning("Failed login attempt for username: " . ($event->credentials['username'] ?? 'unknown'), ['ip' => request()->ip()]);
        });

        Event::listen(function (Logout $event) {
            if ($event->user) {
                Log::info("User logged out: " . ($event->user->email ?? $event->user->username), ['ip' => request()->ip()]);
            }
        });

        Event::listen(function (Lockout $event) {
            Log::alert("Authentication rate limit lockout triggered", [
                'ip' => $event->request->ip(),
                'username' => $event->request->input('username')
            ]);
        });

        Vite::prefetch(concurrency: 3);
    }
}
