<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\BlogPost;
use App\Models\Video;
use App\Models\AssessmentQuestion;
use App\Models\CarouselImage;
use App\Models\KidsModule;
use App\Models\UserAnswer;
use App\Models\EngagementLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Inertia Pages with Preloaded Data
     */
    public function dashboardPage()
    {
        return \Inertia\Inertia::render('AdminDashboard', [
            'initialCarouselImages' => \App\Models\CarouselImage::where('isActive', true)->orderBy('order', 'asc')->get(),
            'initialBlogPosts' => \App\Models\BlogPost::with('author:id,name')->orderBy('created_at', 'desc')->get(),
            'initialVideos' => \App\Models\Video::orderBy('order', 'asc')->orderBy('created_at', 'desc')->get(),
            'initialUsers' => \App\Models\User::latest()->paginate(20),
            'initialQuickQuestions' => \App\Models\QuickQuestion::where('isActive', true)->orderBy('created_at', 'desc')->get(),
            'initialFireCodeSections' => \App\Models\FireCodeSection::orderBy('sectionNum')->get(),
        ]);
    }

    public function analyticsPage()
    {
        return \Inertia\Inertia::render('Admin/Analytics', [
            'initialSummaryData' => $this->getSummaryAnalytics(),
            'initialBarangayData' => $this->getBarangayAnalytics(),
            'initialDemographicData' => $this->getDemographicAnalytics(),
            'initialKnowledgeData' => $this->getKnowledgeAnalytics(),
        ]);
    }

    /**
     * Dashboard stats
     */
    public function stats()
    {
        return response()->json([
            'success' => true,
            'stats' => [
                'totalUsers' => User::count(),
                'activeUsers' => User::where('isActive', true)->count(),
                'totalPosts' => BlogPost::count(),
                'totalVideos' => Video::count(),
                'totalQuestions' => AssessmentQuestion::count(),
                'usersByRole' => User::select('role', DB::raw('count(*) as count'))
                    ->groupBy('role')
                    ->pluck('count', 'role'),
            ],
        ]);
    }

    /**
     * User management
     */
    public function users(Request $request)
    {
        $query = User::query();

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('username', 'ilike', "%{$search}%");
            });
        }

        return response()->json([
            'success' => true,
            'users' => $query->latest()->paginate(20),
        ]);
    }

    public function updateUserRole(Request $request, $id)
    {
        $request->validate(['role' => 'required|in:kid,adult,professional,admin']);

        $user = User::findOrFail($id);
        $user->update(['role' => $request->role]);

        return response()->json(['success' => true, 'user' => $user]);
    }

    public function updateUserPermissions(Request $request, $id)
    {
        $request->validate([
            'permission' => 'required|string',
            'action' => 'nullable|string|in:add,remove',
            'adminPassword' => 'required|string',
        ]);

        $admin = $request->user();
        if (!\Illuminate\Support\Facades\Hash::check($request->adminPassword, $admin->password)) {
            return response()->json(['success' => false, 'error' => 'Incorrect admin password'], 400);
        }

        $user = User::findOrFail($id);
        $action = $request->input('action', 'add');
        
        $permissionToRoleMap = [
            'accessKids' => 'kid',
            'accessAdult' => 'adult',
            'accessProfessional' => 'professional',
            'isAdmin' => 'admin',
        ];

        if (!isset($permissionToRoleMap[$request->permission])) {
            return response()->json(['success' => false, 'error' => 'Invalid permission'], 400);
        }

        $targetRole = $permissionToRoleMap[$request->permission];
        $currentRoles = array_filter(array_map('trim', explode(',', $user->role ?? 'guest')));

        if ($action === 'remove') {
            $currentRoles = array_diff($currentRoles, [$targetRole]);
            if (empty($currentRoles)) {
                $currentRoles = ['guest'];
            }
        } else {
            $currentRoles = array_diff($currentRoles, ['guest']);
            if (!in_array($targetRole, $currentRoles)) {
                $currentRoles[] = $targetRole;
            }
        }

        $currentRoles = array_unique($currentRoles);
        $newRoleString = implode(',', $currentRoles);
        $user->update(['role' => $newRoleString]);

        return response()->json(['success' => true, 'user' => $user]);
    }

    /**
     * Content management (CRUD for blog, video, questions, carousel)
     */
    public function createPost(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'category' => 'required|string|max:50',
            'imageUrl' => 'nullable|string|max:2048',
            'image_url' => 'nullable|string|max:2048',
        ]);

        $imageUrl = strip_tags($request->input('imageUrl') ?? $request->input('image_url'));
        $post = BlogPost::create([
            'title' => strip_tags($request->input('title')),
            'excerpt' => strip_tags($request->input('excerpt')),
            'content' => $request->input('content'), // Keep HTML for rich text editor, rely on frontend sanitization
            'category' => strip_tags($request->input('category')),
            'imageUrl' => $imageUrl,
            'authorId' => $request->user()->id,
        ]);

        \App\Models\Notification::broadcast(
            'New Article Published',
            'A new article "' . $post->title . '" has been published. Check it out!',
            'blog',
            'adult',
            ['adult', 'professional', 'admin'] // Do not notify kids
        );

        return response()->json(['success' => true, 'post' => $post], 201);
    }

    public function updatePost(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'sometimes|required|string',
            'category' => 'sometimes|required|string|max:50',
            'isPublished' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
            'imageUrl' => 'nullable|string|max:2048',
            'image_url' => 'nullable|string|max:2048',
        ]);

        $post = BlogPost::findOrFail($id);
        $updates = $request->only('title', 'excerpt', 'content', 'category');
        if (isset($updates['title'])) $updates['title'] = strip_tags($updates['title']);
        if (isset($updates['excerpt'])) $updates['excerpt'] = strip_tags($updates['excerpt']);
        if (isset($updates['category'])) $updates['category'] = strip_tags($updates['category']);

        if ($request->has('isPublished') || $request->has('is_published')) {
            $updates['isPublished'] = $request->boolean($request->has('isPublished') ? 'isPublished' : 'is_published');
        }
        if ($request->has('imageUrl') || $request->has('image_url')) {
            $updates['imageUrl'] = $request->input('imageUrl') ?? $request->input('image_url');
        }
        
        $post->update($updates);
        return response()->json(['success' => true, 'post' => $post]);
    }

    public function deletePost($id)
    {
        BlogPost::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Post deleted']);
    }

    public function createVideo(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category' => 'required|string|max:50',
            'duration' => 'nullable|string|max:50',
            'youtubeId' => 'nullable|string|max:200', // Increased max length for URLs
            'youtube_id' => 'nullable|string|max:200',
        ]);

        $youtubeId = $request->input('youtubeId') ?? $request->input('youtube_id');
        $youtubeId = $this->extractYoutubeId($youtubeId);

        $video = Video::create([
            'title' => strip_tags($request->input('title')),
            'description' => strip_tags($request->input('description')),
            'category' => strip_tags($request->input('category')),
            'duration' => strip_tags($request->input('duration')),
            'youtubeId' => $youtubeId,
        ]);

        \App\Models\Notification::broadcast(
            'New Video Added',
            'A new video "' . $video->title . '" has been added.',
            'video',
            $video->category === 'professional' ? 'professional' : 'kids',
            $video->category === 'professional' ? ['professional', 'admin'] : ['kid', 'admin']
        );

        return response()->json(['success' => true, 'video' => $video], 201);
    }

    public function updateVideo(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'category' => 'sometimes|required|string|max:50',
            'duration' => 'nullable|string|max:50',
            'isActive' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'youtubeId' => 'nullable|string|max:200',
            'youtube_id' => 'nullable|string|max:200',
        ]);

        $video = Video::findOrFail($id);
        $updates = $request->only('title', 'description', 'category', 'duration');
        if (isset($updates['title'])) $updates['title'] = strip_tags($updates['title']);
        if (isset($updates['description'])) $updates['description'] = strip_tags($updates['description']);
        if (isset($updates['category'])) $updates['category'] = strip_tags($updates['category']);
        if (isset($updates['duration'])) $updates['duration'] = strip_tags($updates['duration']);
        
        if ($request->has('isActive') || $request->has('is_active')) {
            $updates['isActive'] = $request->boolean($request->has('isActive') ? 'isActive' : 'is_active');
        }
        
        if ($request->has('youtubeId') || $request->has('youtube_id')) {
            $youtubeId = $request->input('youtubeId') ?? $request->input('youtube_id');
            $updates['youtubeId'] = $this->extractYoutubeId($youtubeId);
        }
        
        $video->update($updates);
        return response()->json(['success' => true, 'video' => $video]);
    }

    private function extractYoutubeId($value)
    {
        if (!$value) return "";
        
        $value = trim($value);
        
        // Improved regex to handle watch, embed, shorts, live, and youtu.be
        $pattern = '/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([^&?\n]+)/';
        if (preg_match($pattern, $value, $matches)) {
            $value = $matches[1];
        } else if (str_contains($value, 'youtube.com') || str_contains($value, 'youtu.be')) {
            // Manual fallback if regex fails
            try {
                $parsed = parse_url($value);
                if (isset($parsed['host']) && str_contains($parsed['host'], 'youtube.com')) {
                    parse_str($parsed['query'] ?? "", $query);
                    $value = $query['v'] ?? basename($parsed['path'] ?? "") ?? $value;
                } else if (isset($parsed['host']) && str_contains($parsed['host'], 'youtu.be')) {
                    $value = ltrim($parsed['path'] ?? "", '/');
                }
            } catch (\Exception $e) {
                // Keep as is
            }
        }
        
        // Clean up any trailing junk
        if (str_contains($value, '?')) $value = explode('?', $value)[0];
        if (str_contains($value, '&')) $value = explode('&', $value)[0];
        
        return $value;
    }

    public function deleteVideo($id)
    {
        Video::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Video deleted']);
    }

    public function createQuestion(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:1000',
            'options' => 'required|array',
            'correctAnswer' => 'required|string|max:255',
            'explanation' => 'nullable|string|max:1000',
            'category' => 'required|string|max:255',
            'difficulty' => 'required|string|in:easy,medium,hard',
            'forRoles' => 'nullable|array',
            'type' => 'required|string|max:50',
            'order' => 'nullable|integer',
        ]);

        $question = AssessmentQuestion::create($request->only(
            'question', 'options', 'correctAnswer', 'explanation',
            'category', 'difficulty', 'forRoles', 'type', 'order'
        ));
        return response()->json(['success' => true, 'question' => $question], 201);
    }

    public function updateQuestion(Request $request, $id)
    {
        $request->validate([
            'question' => 'sometimes|required|string|max:1000',
            'options' => 'sometimes|required|array',
            'correctAnswer' => 'sometimes|required|string|max:255',
            'explanation' => 'nullable|string|max:1000',
            'category' => 'sometimes|required|string|max:255',
            'difficulty' => 'sometimes|required|string|in:easy,medium,hard',
            'isActive' => 'nullable|boolean',
            'forRoles' => 'nullable|array',
            'type' => 'sometimes|required|string|max:50',
            'order' => 'nullable|integer',
        ]);

        $question = AssessmentQuestion::findOrFail($id);
        $question->update($request->only(
            'question', 'options', 'correctAnswer', 'explanation',
            'category', 'difficulty', 'isActive', 'forRoles', 'type', 'order'
        ));
        return response()->json(['success' => true, 'question' => $question]);
    }

    public function deleteQuestion($id)
    {
        AssessmentQuestion::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Question deleted']);
    }

    public function createQuickQuestion(Request $request)
    {
        $payload = $request->validate([
            'category' => 'required|string',
            'questionText' => 'required|string',
            'responseText' => 'required|string',
            'isActive' => 'sometimes|boolean'
        ]);
        
        $question = \App\Models\QuickQuestion::create($payload);
        return response()->json(['success' => true, 'question' => $question], 201);
    }

    public function updateQuickQuestion(Request $request, $id)
    {
        $question = \App\Models\QuickQuestion::findOrFail($id);
        $payload = $request->validate([
            'category' => 'sometimes|required|string',
            'questionText' => 'sometimes|required|string',
            'responseText' => 'sometimes|required|string',
            'isActive' => 'sometimes|boolean'
        ]);
        
        $question->update($payload);
        return response()->json(['success' => true, 'question' => $question]);
    }

    public function deleteQuickQuestion($id)
    {
        \App\Models\QuickQuestion::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Question deleted']);
    }

    /**
     * Carousel management
     */
    public function createCarouselImage(Request $request)
    {
        $payload = [
            'title' => $request->input('title'),
            'altText' => $request->input('altText')
                ?? $request->input('alt_text')
                ?? $request->input('alt'),
            'imageUrl' => $request->input('imageUrl')
                ?? $request->input('imageUrl')
                ?? $request->input('url'),
            'order' => $request->input('order', (int) CarouselImage::max('order') + 1),
            'isActive' => $request->boolean('isActive', true),
        ];

        validator($payload, [
            'title' => 'required|string|max:255',
            'altText' => 'nullable|string|max:255',
            'imageUrl' => 'required|string|max:2048',
            'order' => 'nullable|integer|min:0',
            'isActive' => 'boolean',
        ])->validate();

        $image = CarouselImage::create($payload);

        return response()->json(['success' => true, 'image' => $image], 201);
    }

    public function updateCarouselImage(Request $request, $id)
    {
        $image = CarouselImage::findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'altText' => 'nullable|string|max:255',
            'alt_text' => 'nullable|string|max:255',
            'alt' => 'nullable|string|max:255',
            'imageUrl' => 'nullable|string|max:2048',
            'imageUrl' => 'nullable|string|max:2048',
            'url' => 'nullable|string|max:2048',
            'order' => 'nullable|integer|min:0',
        ]);

        $updates = [];

        if ($request->has('title')) {
            $updates['title'] = $request->input('title');
        }

        if ($request->hasAny(['altText', 'alt_text', 'alt'])) {
            $updates['altText'] = $request->input('altText')
                ?? $request->input('alt_text')
                ?? $request->input('alt');
        }

        if ($request->hasAny(['imageUrl', 'imageUrl', 'url'])) {
            $updates['imageUrl'] = $request->input('imageUrl')
                ?? $request->input('imageUrl')
                ?? $request->input('url');
        }

        if ($request->has('order')) {
            $updates['order'] = $request->integer('order');
        }

        if ($request->hasAny(['isActive', 'isActive'])) {
            $updates['isActive'] = $request->boolean(
                $request->has('isActive') ? 'isActive' : 'isActive'
            );
        }

        $image->update($updates);

        return response()->json(['success' => true, 'image' => $image]);
    }

    public function deleteCarouselImage($id)
    {
        CarouselImage::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Image deleted']);
    }

    /**
     * Handle Image Upload
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:15360', // 15MB max, block SVG and scripts
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            
            // For now, let's return a Base64 encoded string to match the current frontend handling 
            // or save to public storage and return the URL. 
            // The original Node.js version might have been using Base64 or a temporary service.
            // Let's go with local storage for production readiness.
            
            $path = $file->store('uploads', 'public');
            $url = asset('storage/' . $path);

            return response()->json([
                'success' => true,
                'url' => $url
            ]);
        }

        return response()->json(['success' => false, 'error' => 'No file uploaded'], 400);
    }

    /**
     * Analytics
     */
    public function analytics(Request $request)
    {
        $type = $request->query('type', 'summary');

        switch ($type) {
            case 'summary':
                $data = $this->getSummaryAnalytics();
                break;
            case 'barangay':
                $data = $this->getBarangayAnalytics();
                break;
            case 'demographics':
                $data = $this->getDemographicAnalytics();
                break;
            case 'knowledge':
                $data = $this->getKnowledgeAnalytics();
                break;
            default:
                return response()->json(['error' => 'Invalid type'], 400);
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function reorderCarousel(Request $request)
    {
        $request->validate(['imageIds' => 'required|array']);
        
        foreach ($request->imageIds as $index => $id) {
            CarouselImage::where('id', $id)->update(['order' => $index]);
        }
        
        return response()->json(CarouselImage::orderBy('order')->get());
    }

    public function reorderBlogs(Request $request)
    {
        $request->validate(['blogIds' => 'required|array']);
        return response()->json(['success' => true]);
    }

    public function reorderVideos(Request $request)
    {
        $request->validate(['videoIds' => 'required|array']);
        
        foreach ($request->videoIds as $index => $id) {
            Video::where('id', $id)->update(['order' => $index]);
        }
        
        return response()->json(['success' => true]);
    }

    /**
     * Fire Code Management
     */
    public function fireCodes()
    {
        // Return all fire code sections
        $sections = \App\Models\FireCodeSection::orderBy('sectionNum')->get();
        return response()->json(['success' => true, 'sections' => $sections]);
    }

    public function uploadManual(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf|max:102400', // 100MB max
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
            
            // Ensure the directory exists
            $destinationPath = public_path('modules/bfp_manuals');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            
            $file->move($destinationPath, $filename);

            return response()->json([
                'success' => true,
                'filename' => $filename,
                'url' => asset('modules/bfp_manuals/' . $filename)
            ]);
        }

        return response()->json(['success' => false, 'error' => 'No file uploaded'], 400);
    }

    public function createFireCode(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'sectionNum' => 'nullable|string|max:100',
            'content' => 'nullable|string',
            'description' => 'nullable|string',
            'filename' => ['nullable', 'string', 'max:255', 'regex:/\.pdf$/i'],
            'parentSectionId' => 'nullable|integer',
        ]);

        $section = \App\Models\FireCodeSection::create([
            'title' => strip_tags($request->title),
            'category' => strip_tags($request->category),
            'sectionNum' => $request->sectionNum ? strip_tags($request->sectionNum) : null,
            'content' => $request->input('content') ? strip_tags($request->input('content')) : null,
            'description' => $request->description ? strip_tags($request->description) : null,
            'filename' => $request->filename ? strip_tags($request->filename) : null,
            'parentSectionId' => $request->parentSectionId,
            'order' => $request->order ?? 0,
        ]);

        return response()->json(['success' => true, 'section' => $section], 201);
    }

    public function updateFireCode(Request $request, $id)
    {
        $section = \App\Models\FireCodeSection::findOrFail($id);
        
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'sectionNum' => 'nullable|string|max:100',
            'content' => 'nullable|string',
            'description' => 'nullable|string',
            'filename' => ['nullable', 'string', 'max:255', 'regex:/\.pdf$/i'],
            'parentSectionId' => 'nullable|integer',
        ]);

        $updates = [];
        if ($request->has('title')) {
            $updates['title'] = strip_tags($request->title);
        }
        if ($request->has('category')) {
            $updates['category'] = strip_tags($request->category);
        }
        if ($request->has('sectionNum')) {
            $updates['sectionNum'] = $request->sectionNum ? strip_tags($request->sectionNum) : null;
        }
        if ($request->has('content')) {
            $updates['content'] = $request->input('content') ? strip_tags($request->input('content')) : null;
        }
        if ($request->has('description')) {
            $updates['description'] = $request->description ? strip_tags($request->description) : null;
        }
        if ($request->has('filename')) {
            $updates['filename'] = $request->filename ? strip_tags($request->filename) : null;
        }
        if ($request->has('parentSectionId')) {
            $updates['parentSectionId'] = $request->parentSectionId;
        }

        $section->update($updates);

        return response()->json(['success' => true, 'section' => $section]);
    }

    public function deleteFireCode($id)
    {
        \App\Models\FireCodeSection::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Section deleted']);
    }

    private function getSummaryAnalytics()
    {
        $todayStart = now()->startOfDay();
        $weekAgo = now()->subDays(7);

        // Fetch all basic user aggregates in one single fast query
        $stats = User::where('role', '!=', 'admin')
            ->selectRaw('
                COUNT(*) as total_users,
                SUM(CASE WHEN "profileCompleted" = true THEN 1 ELSE 0 END) as profiles_completed,
                SUM(CASE WHEN "preTestScore" IS NOT NULL THEN 1 ELSE 0 END) as pre_tests_taken,
                SUM(CASE WHEN "postTestScore" IS NOT NULL THEN 1 ELSE 0 END) as post_tests_taken,
                AVG("preTestScore") as avg_pre_test,
                AVG("postTestScore") as avg_post_test,
                SUM("engagementPoints") as total_engagement,
                AVG("engagementPoints") as avg_engagement
            ')
            ->first();

        $activeToday = EngagementLog::where('loggedAt', '>=', $todayStart)->distinct('userId')->count('userId');
        $activeThisWeek = EngagementLog::where('loggedAt', '>=', $weekAgo)->distinct('userId')->count('userId');

        // Calculate average improvement directly in the database
        $avgImprovementStats = User::where('role', '!=', 'admin')
            ->whereNotNull('preTestScore')
            ->whereNotNull('postTestScore')
            ->selectRaw('AVG("postTestScore" - "preTestScore") as avg_improvement')
            ->first();
            
        $avgImprovement = (float) ($avgImprovementStats->avg_improvement ?? 0);

        return [
            'totalUsers' => (int) ($stats->total_users ?? 0),
            'profilesCompleted' => (int) ($stats->profiles_completed ?? 0),
            'preTestsTaken' => (int) ($stats->pre_tests_taken ?? 0),
            'postTestsTaken' => (int) ($stats->post_tests_taken ?? 0),
            'averagePreTestScore' => round((float) ($stats->avg_pre_test ?? 0), 2),
            'averagePostTestScore' => round((float) ($stats->avg_post_test ?? 0), 2),
            'averageImprovement' => round($avgImprovement, 2),
            'totalEngagementPoints' => (int) ($stats->total_engagement ?? 0),
            'avgEngagementPerUser' => round((float) ($stats->avg_engagement ?? 0), 2),
            'activeUsersToday' => $activeToday,
            'activeUsersThisWeek' => $activeThisWeek,
        ];
    }

    private function getBarangayAnalytics()
    {
        $barangays = [
            'Alipit', 'Bagumbayan', 'Bubukal', 'Calian', 'Duhat', 'Gatid', 'Jasaan', 'Labuin', 'Malinao',
            'Oogong', 'Pagsawitan', 'Palasan', 'Patimbao', 'Poblacion I', 'Poblacion II', 'Poblacion III',
            'Poblacion IV', 'Poblacion V', 'San Jose', 'San Juan', 'San Pablo Norte', 'San Pablo Sur',
            'Santisima Cruz', 'Santo Angel Central', 'Santo Angel Norte', 'Santo Angel Sur'
        ];

        $barangayData = [];

        foreach ($barangays as $barangay) {
            $users = User::where('role', '!=', 'admin')->where('barangay', $barangay)->get(['preTestScore', 'postTestScore', 'profileCompleted']);

            if ($users->count() === 0) {
                $barangayData[] = [
                    'barangay' => $barangay,
                    'userCount' => 0,
                    'avgPreTestScore' => 0,
                    'avgPostTestScore' => 0,
                    'avgImprovement' => 0,
                    'profilesCompleted' => 0,
                ];
                continue;
            }

            $withPre = $users->filter(fn($u) => !is_null($u->preTestScore));
            $withPost = $users->filter(fn($u) => !is_null($u->postTestScore));
            $withBoth = $users->filter(fn($u) => !is_null($u->preTestScore) && !is_null($u->postTestScore));

            $avgPre = $withPre->count() > 0 ? $withPre->avg('preTestScore') : 0;
            $avgPost = $withPost->count() > 0 ? $withPost->avg('postTestScore') : 0;
            
            $avgImprovement = 0;
            if ($withBoth->count() > 0) {
                $sum = 0;
                foreach ($withBoth as $u) {
                    $sum += ($u->postTestScore - $u->preTestScore);
                }
                $avgImprovement = (($sum / $withBoth->count()) / 15) * 100;
            }

            $barangayData[] = [
                'barangay' => $barangay,
                'userCount' => $users->count(),
                'avgPreTestScore' => round($avgPre, 2),
                'avgPostTestScore' => round($avgPost, 2),
                'avgImprovement' => round($avgImprovement, 1),
                'profilesCompleted' => $users->filter(fn($u) => $u->profileCompleted)->count(),
            ];
        }

        usort($barangayData, fn($a, $b) => $b['userCount'] <=> $a['userCount']);
        return $barangayData;
    }

    private function getDemographicAnalytics()
    {
        $users = User::where('role', '!=', 'admin')->where('profileCompleted', true)->get(['gender', 'age', 'occupation', 'school']);

        $gender = [];
        $ageGroups = [
            "Under 10" => 0, "10 to 14" => 0, "15-17" => 0, "18-24" => 0,
            "25-34" => 0, "35-44" => 0, "45-54" => 0, "55+" => 0,
        ];
        $occupations = [];
        $schools = [];

        foreach ($users as $user) {
            if ($user->gender) {
                $gender[$user->gender] = ($gender[$user->gender] ?? 0) + 1;
            }

            if ($user->age) {
                if ($user->age < 10) $ageGroups["Under 10"]++;
                elseif ($user->age < 15) $ageGroups["10 to 14"]++;
                elseif ($user->age < 18) $ageGroups["15-17"]++;
                elseif ($user->age < 25) $ageGroups["18-24"]++;
                elseif ($user->age < 35) $ageGroups["25-34"]++;
                elseif ($user->age < 45) $ageGroups["35-44"]++;
                elseif ($user->age < 55) $ageGroups["45-54"]++;
                else $ageGroups["55+"]++;
            }

            if ($user->occupation) {
                $occupations[$user->occupation] = ($occupations[$user->occupation] ?? 0) + 1;
            }

            if ($user->school) {
                $schools[$user->school] = ($schools[$user->school] ?? 0) + 1;
            }
        }

        return [
            'gender' => empty($gender) ? new \stdClass() : $gender,
            'ageGroups' => empty($ageGroups) ? new \stdClass() : $ageGroups,
            'occupations' => empty($occupations) ? new \stdClass() : $occupations,
            'schools' => empty($schools) ? new \stdClass() : $schools
        ];
    }

    private function getKnowledgeAnalytics()
    {
        $categories = [
            'Fire Prevention', 'Emergency Response', 'Electrical Safety', 
            'Kitchen Safety', 'Evacuation Planning', 'Fire Extinguisher Use',
            'Smoke Detector Knowledge', 'General Safety Awareness'
        ];

        $knowledgeData = [];

        foreach ($categories as $category) {
            $questions = AssessmentQuestion::where('category', $category)->where('isActive', true)->get(['id']);

            if ($questions->count() === 0) {
                $knowledgeData[] = [
                    'category' => $category,
                    'avgScore' => 0,
                    'totalQuestions' => 0,
                    'correctAnswers' => 0,
                    'incorrectAnswers' => 0,
                ];
                continue;
            }

            $questionIds = $questions->pluck('id')->toArray();

            $answers = UserAnswer::whereIn('questionId', $questionIds)->get(['isCorrect']);
            
            $correctAnswers = $answers->filter(fn($a) => $a->isCorrect)->count();
            $totalAnswers = $answers->count();

            $knowledgeData[] = [
                'category' => $category,
                'avgScore' => $totalAnswers > 0 ? round(($correctAnswers / $totalAnswers) * 100) : 0,
                'totalQuestions' => $questions->count(),
                'correctAnswers' => $correctAnswers,
                'incorrectAnswers' => $totalAnswers - $correctAnswers,
            ];
        }

        usort($knowledgeData, fn($a, $b) => $a['avgScore'] <=> $b['avgScore']);
        return $knowledgeData;
    }

    public function exportCsv()
    {
        $summary     = $this->getSummaryAnalytics();
        $barangay    = $this->getBarangayAnalytics();
        $demographics = $this->getDemographicAnalytics();
        $knowledge   = $this->getKnowledgeAnalytics();
        
        $schoolRes = app(\App\Http\Controllers\SchoolAnalyticsController::class)->analytics();
        $schoolData = json_decode($schoolRes->getContent(), true);
        
        $feedbackRes = app(\App\Http\Controllers\FeedbackController::class)->analytics();
        $feedbackData = json_decode($feedbackRes->getContent(), true);

        $filename = 'safescape_analytics_' . now()->format('Y-m-d') . '.csv';

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control'       => 'no-cache, no-store, must-revalidate',
        ];

        $callback = function () use ($summary, $barangay, $demographics, $knowledge, $schoolData, $feedbackData) {
            $out = fopen('php://output', 'w');

            // ── HEADER & TITLE ─────────────────────────────────────────
            fputcsv($out, ['SAFESCAPE PLATFORM ANALYTICS REPORT']);
            fputcsv($out, ['Exported Date:', now()->format('Y-m-d')]);
            fputcsv($out, ['Exported Time:', now()->format('H:i:s')]);
            fputcsv($out, ['Location:', 'Santa Cruz, Laguna, Philippines']);
            fputcsv($out, []);

            // ── SUMMARY ──────────────────────────────────────────────
            fputcsv($out, ['=== SUMMARY STATISTICS ===']);
            fputcsv($out, ['Metric', 'Value']);
            fputcsv($out, ['Total Users',              $summary['totalUsers']]);
            fputcsv($out, ['Profiles Completed',       $summary['profilesCompleted']]);
            fputcsv($out, ['Pre-Tests Taken',          $summary['preTestsTaken']]);
            fputcsv($out, ['Post-Tests Taken',         $summary['postTestsTaken']]);
            fputcsv($out, ['Avg Pre-Test Score',       $summary['averagePreTestScore']]);
            fputcsv($out, ['Avg Post-Test Score',      $summary['averagePostTestScore']]);
            fputcsv($out, ['Avg Improvement (points)', $summary['averageImprovement']]);
            fputcsv($out, ['Total Engagement Points',  $summary['totalEngagementPoints']]);
            fputcsv($out, ['Avg Engagement / User',    $summary['avgEngagementPerUser']]);
            fputcsv($out, ['Active Users Today',       $summary['activeUsersToday']]);
            fputcsv($out, ['Active Users This Week',   $summary['activeUsersThisWeek']]);
            fputcsv($out, []);

            // ── BY BARANGAY ───────────────────────────────────────────
            fputcsv($out, ['=== USERS BY BARANGAY ===']);
            fputcsv($out, ['Barangay', 'Users', 'Profiles Completed', 'Avg Pre-Test', 'Avg Post-Test', 'Percentage']);
            foreach ($barangay as $b) {
                if (($b['userCount'] ?? 0) === 0) continue;
                fputcsv($out, [
                    $b['barangay'],
                    $b['userCount'],
                    $b['profilesCompleted'],
                    $b['avgPreTestScore'],
                    $b['avgPostTestScore'],
                    ($b['avgImprovement'] >= 0 ? '+' : '') . $b['avgImprovement'] . '%',
                ]);
            }
            fputcsv($out, []);

            // ── DEMOGRAPHICS ──────────────────────────────────────────
            fputcsv($out, ['=== DEMOGRAPHICS ===']);

            fputcsv($out, ['Gender', 'Count']);
            foreach ((array)$demographics['gender'] as $label => $count) {
                fputcsv($out, [$label, $count]);
            }
            fputcsv($out, []);

            fputcsv($out, ['Age Group', 'Count']);
            foreach ((array)$demographics['ageGroups'] as $label => $count) {
                fputcsv($out, [$label, $count]);
            }
            fputcsv($out, []);

            fputcsv($out, ['Occupation', 'Count']);
            foreach ((array)$demographics['occupations'] as $label => $count) {
                fputcsv($out, [$label, $count]);
            }
            fputcsv($out, []);

            fputcsv($out, ['School', 'Count']);
            foreach ((array)$demographics['schools'] as $label => $count) {
                fputcsv($out, [$label, $count]);
            }
            fputcsv($out, []);

            // ── KNOWLEDGE GAPS ────────────────────────────────────────
            fputcsv($out, ['=== KNOWLEDGE GAP ANALYSIS ===']);
            fputcsv($out, ['Category', 'Avg Score (%)', 'Total Questions', 'Correct Answers', 'Incorrect Answers']);
            foreach ($knowledge as $k) {
                fputcsv($out, [
                    $k['category'],
                    $k['avgScore'],
                    $k['totalQuestions'],
                    $k['correctAnswers'],
                    $k['incorrectAnswers'],
                ]);
            }
            fputcsv($out, []);

            // ── SCHOOL ANALYTICS ──────────────────────────────────────
            fputcsv($out, ['=== SCHOOL LEADERBOARD ===']);
            fputcsv($out, ['Rank', 'School Name', 'Type', 'Students', 'Avg Pre-Test', 'Avg Post-Test', 'Increase', 'Completion Rate (%)']);
            
            if (isset($schoolData['schools']) && is_array($schoolData['schools'])) {
                $rank = 1;
                foreach ($schoolData['schools'] as $school) {
                    $increase = $school['averagePreTestScore'] > 0 
                        ? round((($school['averagePostTestScore'] - $school['averagePreTestScore']) / $school['averagePreTestScore']) * 100) 
                        : 0;
                        
                    $increaseStr = $increase > 0 ? "+{$increase}%" : "{$increase}%";
                        
                    fputcsv($out, [
                        $rank++,
                        $school['name'] ?? 'Unknown',
                        $school['type'] ?? 'Unknown',
                        $school['totalStudents'] ?? 0,
                        $school['averagePreTestScore'] ?? 0,
                        $school['averagePostTestScore'] ?? 0,
                        $increaseStr,
                        ($school['averageCompletionRate'] ?? 0) . '%'
                    ]);
                }
            }
            fputcsv($out, []);

            // ── FEEDBACK ANALYTICS ────────────────────────────────────
            fputcsv($out, ['=== FEEDBACK BY FEATURE ===']);
            fputcsv($out, ['Feature Name', 'Type', 'Average Rating', 'Total Reviews']);
            
            if (isset($feedbackData['byFeatureName']) && is_array($feedbackData['byFeatureName'])) {
                foreach ($feedbackData['byFeatureName'] as $feature) {
                    fputcsv($out, [
                        $feature['featureName'] ?? 'Unknown',
                        $feature['featureType'] ?? 'Unknown',
                        ($feature['avgRating'] ?? 0) . '/5',
                        $feature['totalCount'] ?? 0
                    ]);
                }
            }
            fputcsv($out, []);

            // Calculate highlights for narrative
            $lowestCategory = 'N/A';
            $lowestScore = 100;
            $highestCategory = 'N/A';
            $highestScore = 0;
            if (!empty($knowledge)) {
                foreach ($knowledge as $k) {
                    $score = $k['avgScore'];
                    if ($score < $lowestScore) {
                        $lowestScore = $score;
                        $lowestCategory = $k['category'];
                    }
                    if ($score > $highestScore) {
                        $highestScore = $score;
                        $highestCategory = $k['category'];
                    }
                }
            }

            $topSchool = 'N/A';
            $topSchoolScore = 0;
            if (isset($schoolData['schools']) && is_array($schoolData['schools']) && !empty($schoolData['schools'])) {
                $topS = $schoolData['schools'][0];
                $topSchool = $topS['name'] ?? 'Unknown';
                $topSchoolScore = $topS['averagePostTestScore'] ?? 0;
            }

            $topFeature = 'N/A';
            $topFeatureRating = 0;
            if (isset($feedbackData['byFeatureName']) && is_array($feedbackData['byFeatureName']) && !empty($feedbackData['byFeatureName'])) {
                $features = $feedbackData['byFeatureName'];
                usort($features, fn($a, $b) => ($b['avgRating'] ?? 0) <=> ($a['avgRating'] ?? 0));
                $topF = $features[0];
                $topFeature = $topF['featureName'] ?? 'Unknown';
                $topFeatureRating = $topF['avgRating'] ?? 0;
            }

            // ── EXECUTIVE SUMMARY & NARRATIVE REPORT ──────────────────
            fputcsv($out, ['=== EXECUTIVE SUMMARY & NARRATIVE REPORT ===']);
            
            fputcsv($out, ['Report Summary:']);
            $lines = explode("\n", wordwrap("This report details the learning and engagement progress on the Berong Safescape E-Learning platform in Santa Cruz, Laguna.", 80));
            foreach ($lines as $l) {
                fputcsv($out, [$l]);
            }
            fputcsv($out, []);

            fputcsv($out, ['1. PLATFORM REACH:']);
            $lines = explode("\n", wordwrap("A total of {$summary['totalUsers']} users are registered on the platform. Out of these, {$summary['profilesCompleted']} users have fully completed their profiles, showing strong adoption across targeted demographics.", 80));
            foreach ($lines as $l) {
                fputcsv($out, [$l]);
            }
            fputcsv($out, []);

            fputcsv($out, ['2. ASSESSMENT GRADUATION:']);
            $lines = explode("\n", wordwrap("{$summary['preTestsTaken']} users completed the pre-test, while {$summary['postTestsTaken']} users completed the post-test. The average score increased from {$summary['averagePreTestScore']}/15 to {$summary['averagePostTestScore']}/15, representing an average points improvement of +{$summary['averageImprovement']} per user.", 80));
            foreach ($lines as $l) {
                fputcsv($out, [$l]);
            }
            fputcsv($out, []);

            if ($lowestCategory !== 'N/A') {
                fputcsv($out, ['3. KNOWLEDGE GAP EVALUATION:']);
                $lines = explode("\n", wordwrap("The category requiring the most focus is '{$lowestCategory}' (average score of {$lowestScore}%), indicating an area for curriculum expansion. Conversely, users showed the highest mastery in '{$highestCategory}' (average score of {$highestScore}%).", 80));
                foreach ($lines as $l) {
                    fputcsv($out, [$l]);
                }
                fputcsv($out, []);
            }

            if ($topSchool !== 'N/A') {
                fputcsv($out, ['4. SCHOOL ADOPTION:']);
                $lines = explode("\n", wordwrap("'{$topSchool}' is the leading educational institution on the platform, achieving a top average post-test score of {$topSchoolScore}/15.", 80));
                foreach ($lines as $l) {
                    fputcsv($out, [$l]);
                }
                fputcsv($out, []);
            }

            if ($topFeature !== 'N/A') {
                fputcsv($out, ['5. USER FEEDBACK:']);
                $lines = explode("\n", wordwrap("The platform has received positive reviews. The highest-rated interactive feature is '{$topFeature}' with an average rating of {$topFeatureRating}/5.", 80));
                foreach ($lines as $l) {
                    fputcsv($out, [$l]);
                }
                fputcsv($out, []);
            }

            fputcsv($out, ['Conclusion:']);
            fputcsv($out, ['Report concluded successfully. Exported by Safescape Administrator.']);

            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }
}
