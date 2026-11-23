<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\CarouselImage;
use App\Models\EngagementLog;
use App\Models\KidsModule;
use App\Models\SafeScapeProgress;
use App\Models\SystemSetting;
use App\Models\UserBadge;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class WebPageController extends Controller
{
    public function welcome()
    {
        $carouselImages = Cache::remember('carousel_images_active', now()->addHours(6), function () {
            return CarouselImage::where('isActive', true)
                ->select('id', 'title', 'imageUrl', 'altText', 'order', 'isActive')
                ->orderBy('order', 'asc')
                ->get();
        });

        return Inertia::render('Welcome', [
            'carouselImages' => $carouselImages,
        ]);
    }

    public function about()
    {
        return Inertia::render('About');
    }

    public function game()
    {
        return Inertia::render('GameDemo');
    }

    public function maintenance()
    {
        try {
            $config = SystemSetting::getVal('maintenance_mode');
            if (!$config || empty($config['is_active'])) {
                return redirect('/');
            }
            $message = $config['message'] ?? 'SafeScape is currently undergoing scheduled updates. We\'ll be back online shortly!';
            $until = $config['maintenance_until'] ?? null;
        } catch (\Throwable $e) {
            $message = 'SafeScape is currently undergoing scheduled updates. We\'ll be back online shortly!';
            $until = null;
        }

        return Inertia::render('Maintenance', [
            'message' => $message,
            'until' => $until,
        ]);
    }

    public function maintenanceStatus()
    {
        $default = [
            'is_active' => false,
            'message' => '',
            'warning_active' => false,
            'warning_message' => '',
        ];

        try {
            $config = SystemSetting::getVal('maintenance_mode', $default);
        } catch (\Throwable $e) {
            $config = $default;
        }

        return response()->json($config ?: $default);
    }

    public function currentUser(Request $request)
    {
        return $request->user();
    }

    public function assessment(string $type)
    {
        if (!in_array($type, ['pre-test', 'post-test'], true)) {
            abort(404);
        }

        $mappedType = $type === 'pre-test' ? 'preTest' : 'postTest';

        return Inertia::render('Assessment', ['type' => $mappedType]);
    }

    public function dashboard()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $userRoles = array_filter(array_map('trim', explode(',', $user->role ?? 'guest')));

        if (in_array('admin', $userRoles)) return redirect()->route('admin');
        if (in_array('professional', $userRoles)) return redirect()->route('professional');
        if (in_array('adult', $userRoles)) return redirect()->route('adult');
        if (in_array('kid', $userRoles)) return redirect()->route('kids');

        return redirect()->route('adult');
    }

    public function profile()
    {
        return Inertia::render('Profile');
    }

    public function kidsDashboard()
    {
        return Inertia::render('KidsDashboard', [
            'modules' => Cache::remember('active_kids_modules', now()->addHours(6), function () {
                return KidsModule::where('isActive', true)->orderBy('dayNumber')->get();
            }),
            'progress' => [
                'completedModules' => SafeScapeProgress::where('userId', Auth::id())
                    ->where('completed', true)
                    ->pluck('moduleNum')
                    ->values(),
                'badges' => UserBadge::where('userId', Auth::id())->get(),
            ],
        ]);
    }

    public function kidsCourse()
    {
        return Inertia::render('Kids/CourseHub', [
            'initialModules' => Inertia::defer(fn () => app(KidsController::class)->modules(request())->getData()),
        ]);
    }

    public function kidsModule(string $moduleNum)
    {
        $moduleNum = (int) $moduleNum;
        if ($moduleNum > 1) {
            $previousCompleted = SafeScapeProgress::where('userId', Auth::id())
                ->where('moduleNum', $moduleNum - 1)
                ->where('completed', true)
                ->exists();
            if (!$previousCompleted) {
                return redirect()->route('kids.module', ['moduleNum' => 1])
                    ->with('error', 'Please complete the previous module first.');
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
        if (!$page) {
            abort(404);
        }

        $user = Auth::user();
        $records = SafeScapeProgress::where('userId', $user->id)->get();
        $modules = Cache::remember('active_kids_modules', now()->addHours(6), function () {
            return KidsModule::where('isActive', true)->orderBy('dayNumber')->get();
        });
        $total = $modules->count();
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
            'initialProgress' => $initialProgress,
        ]);
    }

    public function kidsVideos()
    {
        return Inertia::render('Kids/Videos', [
            'initialVideos' => Video::where('isActive', true)
                ->where('category', 'kids')
                ->select('id', 'title', 'description', 'youtubeId', 'duration', 'category', 'order')
                ->orderBy('order', 'asc')
                ->orderBy('created_at', 'desc')
                ->get(),
            'watchedVideoIds' => EngagementLog::where('userId', Auth::id())
                ->where('eventType', 'VIDEO_WATCHED')
                ->pluck('eventData')
                ->map(function ($eventData) {
                    $data = is_string($eventData) ? json_decode($eventData, true) : $eventData;
                    return [
                        'id' => (string) ($data['videoId'] ?? ''),
                        'category' => $data['category'] ?? null,
                    ];
                })
                ->filter(fn ($item) => $item['id'] !== '' && ($item['category'] === 'kids' || $item['category'] === null))
                ->pluck('id')
                ->unique()
                ->values(),
        ]);
    }

    public function kidsQuiz() { return Inertia::render('Kids/Quiz'); }
    public function kidsMemory() { return Inertia::render('Kids/Games/MemoryGame'); }
    public function kidsSmokeCrawl() { return Inertia::render('Kids/Games/SmokeCrawl'); }
    public function kidsHotOrNot() { return Inertia::render('Kids/Games/HotOrNot'); }
    public function kidsRightCall() { return Inertia::render('Kids/Games/RightCall'); }
    public function kidsHazardBlitz() { return Inertia::render('Kids/Games/HazardBlitz'); }
    public function kidsTaskMaster() { return Inertia::render('Kids/Games/TaskMaster'); }
    public function kidsCertificate() { return Inertia::render('Kids/Certificate'); }

    public function kidsChallenges()
    {
        return Inertia::render('Kids/Challenges', [
            'progress' => Inertia::defer(fn () => [
                'completedModules' => SafeScapeProgress::where('userId', Auth::id())
                    ->where('completed', true)
                    ->pluck('moduleNum')
                    ->values(),
                'earnedBadges' => UserBadge::where('userId', Auth::id())->get(),
            ]),
        ]);
    }

    public function kidsBadges()
    {
        return Inertia::render('Kids/BadgeHall', [
            'completedModules' => SafeScapeProgress::where('userId', Auth::id())
                ->where('completed', true)
                ->pluck('moduleNum')
                ->values(),
            'earnedBadges' => UserBadge::where('userId', Auth::id())->get(),
        ]);
    }

    public function adultDashboard()
    {
        return Inertia::render('AdultDashboard', [
            'initialBlogs' => BlogPost::with('author:id,name')
                ->where('isPublished', true)
                ->select('id', 'title', 'excerpt', 'imageUrl', 'category', 'authorId', 'created_at', 'order')
                ->orderBy('order', 'asc')
                ->orderBy('created_at', 'desc')
                ->take(12)
                ->get(),
            'initialVideos' => Inertia::defer(fn () => Video::where('isActive', true)
                ->where('category', 'adult')
                ->select('id', 'title', 'description', 'youtubeId', 'duration', 'category', 'order', 'created_at')
                ->orderBy('order', 'asc')
                ->orderBy('created_at', 'desc')
                ->take(12)
                ->get()),
        ]);
    }

    public function adultBlogShow(string $id)
    {
        $blog = BlogPost::with('author:id,name')->findOrFail($id);
        $allBlogs = BlogPost::with('author:id,name')
            ->where('isPublished', true)
            ->select('id', 'title', 'excerpt', 'imageUrl', 'category', 'authorId', 'created_at', 'order')
            ->orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        if (!$allBlogs->contains('id', $blog->id)) {
            $allBlogs->prepend($blog);
        }

        return Inertia::render('Adult/Article', [
            'blog' => $blog,
            'allBlogs' => $allBlogs,
        ]);
    }

    public function professionalDashboard()
    {
        return Inertia::render('ProfessionalDashboard', [
            'initialVideos' => Inertia::defer(fn () => Video::where('isActive', true)
                ->where('category', 'professional')
                ->select('id', 'title', 'description', 'youtubeId', 'duration', 'category', 'order', 'created_at')
                ->orderBy('order', 'asc')
                ->orderBy('created_at', 'desc')
                ->take(12)
                ->get()),
            'watchedVideoIds' => Inertia::defer(fn () => EngagementLog::where('userId', Auth::id())
                ->where('eventType', 'VIDEO_WATCHED')
                ->pluck('eventData')
                ->map(function ($eventData) {
                    $data = is_string($eventData) ? json_decode($eventData, true) : $eventData;
                    return $data['videoId'] ?? null;
                })
                ->filter()
                ->unique()
                ->values()),
        ]);
    }
}
