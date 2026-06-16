<?php

use App\Http\Controllers\ProfileController;
use App\Models\BlogPost;
use App\Models\KidsModule;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Models\CarouselImage;
use App\Http\Controllers\BadgeController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'carouselImages' => CarouselImage::where('isActive', true)
            ->select('id', 'title', 'imageUrl', 'altText')
            ->orderBy('order', 'asc')
            ->get()
    ]);
});

Route::get('/about', function () {
    return Inertia::render('About');
});

Route::get('/game', function () {
    return Inertia::render('GameDemo');
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
            $user = Auth::user();
            $userRoles = array_filter(array_map('trim', explode(',', $user->role ?? 'guest')));

            if (in_array('admin', $userRoles)) return redirect()->route('admin');
            if (in_array('professional', $userRoles)) return redirect()->route('professional');
            if (in_array('adult', $userRoles)) return redirect()->route('adult');
            if (in_array('kid', $userRoles)) return redirect()->route('kids');

            return redirect()->route('adult'); // default fallback
        })->name('dashboard');

    Route::get('/profile', function () {
        return Inertia::render('Profile');
    })->name('profile');

    Route::middleware('role:kid,adult')->group(function () {
        Route::get('/kids', function () {
            return Inertia::render('KidsDashboard', [
                'modules' => KidsModule::where('isActive', true)->orderBy('dayNumber')->get(),
                'progress' => [
                    'completedModules' => \App\Models\SafeScapeProgress::where('userId', Auth::id())
                        ->where('completed', true)
                        ->pluck('moduleNum')
                        ->values(),
                    'badges' => \App\Models\UserBadge::where('userId', Auth::id())->get()
                ],
            ]);
        })->name('kids');

    Route::post('/api/badges/award', [BadgeController::class, 'award'])->name('badges.award');
    Route::get('/api/badges', [BadgeController::class, 'index'])->name('badges.index');

    Route::get('/kids/safescape', function () {
        return Inertia::render('Kids/CourseHub', [
            'initialModules' => Inertia::defer(fn () => app(\App\Http\Controllers\KidsController::class)->modules(request())->getData()),
        ]);
    })->name('kids.course');

    Route::get('/kids/safescape/{moduleNum}', function ($moduleNum) {
        $moduleNum = (int) $moduleNum;
        if ($moduleNum > 1) {
            $previousCompleted = \App\Models\SafeScapeProgress::where('userId', Auth::id())
                ->where('moduleNum', $moduleNum - 1)
                ->where('completed', true)
                ->exists();
            if (!$previousCompleted) {
                return redirect()->route('kids.module', ['moduleNum' => 1])->with('error', 'Please complete the previous module first.');
            }
        }

        $pageMap = [
            1 => 'Kids/ModuleOne',
            2 => 'Kids/ModuleTwo',
            3 => 'Kids/ModuleThree',
            4 => 'Kids/ModuleFour',
            5 => 'Kids/ModuleFive',
        ];
        $page = $pageMap[$moduleNum] ?? null;
        if (!$page) abort(404);

        $user = Auth::user();
        $records = \App\Models\SafeScapeProgress::where('userId', $user->id)->get();
        $total = \App\Models\KidsModule::where('isActive', true)->count();
        $completedCount = $records->where('completed', true)->count();

        $initialProgress = [
            'completedModules' => $records->where('completed', true)->pluck('moduleNum')->values()->all(),
            'sectionData'      => $records->mapWithKeys(fn ($r) => [
                "module{$r->moduleNum}" => json_decode($r->sectionData, true) ?? [],
            ])->all(),
            'totalProgress'    => $total > 0 ? (int) round(($completedCount / $total) * 100) : 0,
        ];

        return Inertia::render($page, [
            'moduleNum' => $moduleNum,
            'initialProgress' => $initialProgress
        ]);
    })->name('kids.module');

    Route::get('/kids/videos', function () {
        return Inertia::render('Kids/Videos', [
            'initialVideos' => \App\Models\Video::where('isActive', true)
                ->where('category', 'kids')
                ->select('id', 'title', 'description', 'youtubeId', 'duration', 'category')
                ->orderBy('order', 'asc')
                ->get(),
            'watchedVideoIds' => \App\Models\EngagementLog::where('userId', Auth::id())
                ->where('eventType', 'VIDEO_WATCHED')
                ->get()
                ->map(function ($log) {
                    $data = is_string($log->eventData) ? json_decode($log->eventData, true) : $log->eventData;
                    return [
                        'id' => (string)($data['videoId'] ?? ''),
                        'category' => $data['category'] ?? null
                    ];
                })
                ->filter(function ($item) {
                    // If category is present, it must be kids. 
                    // If not present (old logs), we might want to check the video table, 
                    // but for now let's just match against current category videos.
                    return $item['id'] !== '' && ($item['category'] === 'kids' || $item['category'] === null);
                })
                ->pluck('id')
                ->unique()
                ->values(),
        ]);
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

    Route::get('/kids/hot-or-not', function () {
        return Inertia::render('Kids/HotOrNot');
    })->name('kids.hot_or_not');


    Route::get('/kids/the-right-call', function () {
        return Inertia::render('Kids/Games/RightCall');
    })->name('kids.right_call');

    Route::get('/kids/hazard-blitz', function () {
        return Inertia::render('Kids/Games/HazardBlitz');
    })->name('kids.hazard_blitz');

    Route::get('/kids/challenges', function () {
        return Inertia::render('Kids/Challenges', [
            'progress' => Inertia::defer(fn () => [
                'completedModules' => \App\Models\SafeScapeProgress::where('userId', Auth::id())
                    ->where('completed', true)
                    ->pluck('moduleNum')
                    ->values(),
                'earnedBadges' => \App\Models\UserBadge::where('userId', Auth::id())->get()
            ])
        ]);
    })->name('kids.challenges');

    Route::get('/kids/badges', function () {
        return Inertia::render('Kids/BadgeHall', [
            'completedModules' => \App\Models\SafeScapeProgress::where('userId', Auth::id())
                ->where('completed', true)
                ->pluck('moduleNum')
                ->values(),
            'earnedBadges' => \App\Models\UserBadge::where('userId', Auth::id())->get()
        ]);
    })->name('kids.badges');

    Route::get('/kids/task-master', function () {
        return Inertia::render('Kids/TaskMaster');
    })->name('kids.task-master');

    Route::get('/kids/certificate', function () {
        return Inertia::render('Kids/Certificate');
    })->name('kids.certificate');
    }); // End Kids role group

    Route::middleware('role:adult,professional')->group(function () {
        Route::get('/adult', function () {
        return Inertia::render('AdultDashboard', [
            'initialBlogs' => Inertia::defer(fn () => BlogPost::with('author:id,name')
                ->where('isPublished', true)
                ->select('id', 'title', 'excerpt', 'imageUrl', 'category', 'authorId', 'created_at')
                ->orderBy('created_at', 'desc')
                ->take(12)
                ->get()),
        ]);
    })->name('adult');

    Route::get('/adult/blog/{id}', function ($id) {
        $blog = BlogPost::with('author:id,name')->findOrFail($id);
        return Inertia::render('Adult/Article', [
            'blog' => $blog,
        ]);
    })->name('adult.blog.show');
    }); // End Adult role group

    Route::middleware('role:professional')->group(function () {
        Route::get('/professional', function () {
        return Inertia::render('ProfessionalDashboard', [
            'initialVideos' => Inertia::defer(fn () => \App\Models\Video::where('isActive', true)
                ->where('category', 'professional')
                ->select('id', 'title', 'description', 'youtubeId', 'duration', 'category')
                ->orderBy('created_at', 'desc')
                ->take(12)
                ->get()),
            'watchedVideoIds' => Inertia::defer(fn () => \App\Models\EngagementLog::where('userId', Auth::id())
                ->where('eventType', 'VIDEO_WATCHED')
                ->get()
                ->map(function ($log) {
                    $data = is_string($log->eventData) ? json_decode($log->eventData, true) : $log->eventData;
                    return $data['videoId'] ?? null;
                })
                ->filter()
                ->unique()
                ->values()),
        ]);
        })->name('professional');

        Route::get('/professional/the-right-call', function () {
            return Inertia::render('Kids/Games/RightCall');
        })->name('professional.right_call');
    }); // End Professional role group

    // Admin routing
    Route::middleware('admin')->group(function () {
        Route::get('/admin', [\App\Http\Controllers\AdminController::class, 'dashboardPage'])->name('admin');
        Route::get('/admin/analytics', [\App\Http\Controllers\AdminController::class, 'analyticsPage'])->name('admin.analytics');
    });
});

Route::get('/temp-clear-scores', function () {
    try {
        $affected = \Illuminate\Support\Facades\DB::table('users')->where('id', 10)->update([
            'competency_scores' => null,
            'preTestScore' => null,
            'postTestScore' => null,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Scores cleared successfully.',
            'rows_affected' => $affected
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

require __DIR__.'/auth.php';
