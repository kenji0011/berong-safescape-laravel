<?php

use App\Http\Controllers\ProfileController;
use App\Models\BlogPost;
use App\Models\KidsModule;
use Illuminate\Foundation\Application;
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
        $modules = KidsModule::where('isActive', true)->orderBy('dayNumber')->get();
        return Inertia::render('KidsDashboard', [
            'modules' => $modules,
        ]);
    })->name('kids');

    Route::get('/kids/safescape', function () {
        return Inertia::render('Kids/CourseHub');
    })->name('kids.course');

    Route::get('/kids/safescape/{moduleNum}', function ($moduleNum) {
        $pageMap = [
            1 => 'Kids/ModuleOne',
            // 2 => 'Kids/ModuleTwo', // Add as each module is built
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
        $videos = \App\Models\Video::where('isActive', true)
            ->where('category', 'professional')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('ProfessionalDashboard', [
            'initialVideos' => $videos,
        ]);
    })->name('professional');
    
    // Admin routing
    Route::middleware('admin')->group(function () {
        Route::get('/admin', [\App\Http\Controllers\AdminController::class, 'dashboardPage'])->name('admin');
        Route::get('/admin/analytics', [\App\Http\Controllers\AdminController::class, 'analyticsPage'])->name('admin.analytics');
    });
});

require __DIR__.'/auth.php';

