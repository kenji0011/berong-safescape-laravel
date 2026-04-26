<?php

use App\Http\Controllers\ProfileController;
use App\Models\BlogPost;
use App\Models\KidsModule;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::get('/about', function () {
    return Inertia::render('About');
});

    // Primary User Flow Routes
    Route::middleware(['auth'])->group(function () {
        Route::get('/assessment/{type}', function ($type) {
            if (!in_array($type, ['pre-test', 'post-test'])) {
                abort(404);
            }
            $mappedType = $type === 'pre-test' ? 'preTest' : 'postTest';
            return Inertia::render('Assessment', ['type' => $mappedType]);
        })->name('assessment.test');

        Route::get('/dashboard', function () {
            /** @var \App\Models\User $user */
            $user = request()->user();
            if ($user->role === 'admin') return redirect()->route('admin');
        if ($user->role === 'professional') return redirect()->route('professional');
        if ($user->role === 'kid') return redirect()->route('kids');
        return redirect()->route('adult');
    })->name('dashboard');

    Route::get('/profile', function () {
        return Inertia::render('Profile');
    })->name('profile');

    Route::get('/kids', function () {
        return Inertia::render('KidsDashboard', [
            'modules' => Inertia::defer(fn () => KidsModule::where('isActive', true)->orderBy('dayNumber')->get()),
            'progress' => Inertia::defer(fn () => [
                'completedModules' => \App\Models\SafeScapeProgress::where('userId', Auth::id())
                    ->where('completed', true)
                    ->pluck('moduleNum')
                    ->values()
            ]),
        ]);
    })->name('kids');

    Route::get('/kids/safescape', function () {
        return Inertia::render('Kids/CourseHub', [
            'initialModules' => Inertia::defer(fn () => app(\App\Http\Controllers\KidsController::class)->modules(request())->getData()),
        ]);
    })->name('kids.course');

    Route::get('/kids/safescape/{moduleNum}', function ($moduleNum) {
        $pageMap = [
            1 => 'Kids/ModuleOne',
            2 => 'Kids/ModuleTwo',
            3 => 'Kids/ModuleThree',
            4 => 'Kids/ModuleFour',
            5 => 'Kids/ModuleFive',
        ];
        $page = $pageMap[(int) $moduleNum] ?? null;
        if (!$page) abort(404);
        return Inertia::render($page, ['moduleNum' => (int) $moduleNum]);
    })->name('kids.module');

    Route::get('/kids/videos', function () {
        return Inertia::render('Kids/Videos');
    })->name('kids.videos');

    Route::get('/kids/quiz', function () {
        return Inertia::render('Kids/Quiz');
    })->name('kids.quiz');

    Route::get('/kids/memory-game', function () {
        return Inertia::render('Kids/MemoryGame');
    })->name('kids.memory');

    Route::get('/kids/smoke-crawl', function () {
        return Inertia::render('Kids/SmokeCrawl');
    })->name('kids.smoke_crawl');

    Route::get('/kids/challenges', function () {
        return Inertia::render('Kids/Challenges');
    })->name('kids.challenges');

    Route::get('/kids/certificate', function () {
        return Inertia::render('Kids/Certificate');
    })->name('kids.certificate');

    Route::get('/adult', function () {
        $blogs = BlogPost::with('author:id,name')->where('isPublished', true)->orderBy('created_at', 'desc')->get();
        return Inertia::render('AdultDashboard', [
            'initialBlogs' => $blogs,
        ]);
    })->name('adult');

    Route::get('/adult/blog/{id}', function ($id) {
        $blog = BlogPost::with('author:id,name')->findOrFail($id);
        return Inertia::render('Adult/Article', [
            'blog' => $blog,
        ]);
    })->name('adult.blog.show');
    
    Route::get('/professional', function () {
        return Inertia::render('ProfessionalDashboard', [
            'initialVideos' => Inertia::defer(fn () => \App\Models\Video::where('isActive', true)
                ->where('category', 'professional')
                ->orderBy('created_at', 'desc')
                ->get()),
        ]);
    })->name('professional');
    
    // Admin routing
    Route::middleware('admin')->group(function () {
        Route::get('/admin', [\App\Http\Controllers\AdminController::class, 'dashboardPage'])->name('admin');
        Route::get('/admin/analytics', [\App\Http\Controllers\AdminController::class, 'analyticsPage'])->name('admin.analytics');
    });
});

require __DIR__.'/auth.php';

