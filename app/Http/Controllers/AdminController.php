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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Services\AdminAnalyticsService;

class AdminController extends Controller
{
    public function __construct(
        protected AdminAnalyticsService $analyticsService
    ) {}

    /**
     * Inertia Pages with Preloaded Data
     */
    public function dashboardPage()
    {
        return \Inertia\Inertia::render('AdminDashboard', [
            'initialCarouselImages' => \App\Models\CarouselImage::where('isActive', true)->orderBy('order', 'asc')->get(),
            'initialBlogPosts' => \App\Models\BlogPost::with('author:id,name')->orderBy('order', 'asc')->orderBy('created_at', 'desc')->take(100)->get(),
            'initialVideos' => \App\Models\Video::orderBy('order', 'asc')->orderBy('created_at', 'desc')->take(100)->get(),
            'initialUsers' => \App\Models\User::latest()->take(50)->get(),
            'initialQuickQuestions' => \App\Models\QuickQuestion::where('isActive', true)->orderBy('created_at', 'desc')->get(),
            'initialFireCodeSections' => \App\Models\FireCodeSection::orderBy('sectionNum')->get(),
        ]);
    }

    public function analyticsPage()
    {
        return \Inertia\Inertia::render('Admin/Analytics', [
            'initialSummaryData' => $this->analyticsService->getCachedAnalytics('summary'),
            'initialBarangayData' => $this->analyticsService->getCachedAnalytics('barangay'),
            'initialDemographicData' => $this->analyticsService->getCachedAnalytics('demographics'),
            'initialKnowledgeData' => $this->analyticsService->getCachedAnalytics('knowledge'),
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
        try {
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

            $perPage = min((int)$request->query('per_page', $request->query('limit', 50)), 100);
            $users = $query->latest()->paginate($perPage);

            return response()->json([
                'success' => true,
                'users' => $users,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error loading users: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to load users.'], 500);
        }
    }

    public function updateUserRole(Request $request, $id)
    {
        $request->validate(['role' => 'required|in:kid,adult,professional,admin']);

        try {
            $user = User::findOrFail($id);
            $user->update(['role' => $request->role]);

            return response()->json(['success' => true, 'user' => $user]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'User not found'], 404);
        } catch (\Throwable $e) {
            Log::error("Error updating user role for user {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to update user role'], 500);
        }
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

        try {
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

            // Send a welcome notification for new BFP Professional personnel
            if ($action === 'add' && $targetRole === 'professional') {
                // Only skip if there's already an unread welcome notification pending
                $unreadWelcomeExists = \App\Models\Notification::where('userId', $user->id)
                    ->where('category', 'professional')
                    ->where('title', 'Welcome BFP Personnel!')
                    ->where('isRead', false)
                    ->exists();

                if (!$unreadWelcomeExists) {
                    \App\Models\Notification::create([
                        'userId'    => $user->id,
                        'title'     => 'Welcome BFP Personnel!',
                        'message'   => 'Congratulations! You have been granted BFP Professional access. You can now access professional Training Videos, study the Training Manuals, and explore the dispatch game, "The Right Call".',
                        'type'      => 'success',
                        'category'  => 'professional',
                        'isRead'    => false,
                        'createdAt' => now(),
                    ]);
                }
            }

            return response()->json(['success' => true, 'user' => $user]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'User not found'], 404);
        } catch (\Throwable $e) {
            Log::error("Error updating permissions for user {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to update user permissions'], 500);
        }
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

        try {
            $imageUrl = strip_tags($request->input('imageUrl') ?? $request->input('image_url'));
            $post = BlogPost::create([
                'title' => strip_tags($request->input('title')),
                'excerpt' => strip_tags($request->input('excerpt')),
                'content' => $request->input('content'), // Keep HTML for rich text editor, rely on frontend sanitization
                'category' => strip_tags($request->input('category')),
                'imageUrl' => $imageUrl,
                'authorId' => $request->user()->id,
            ]);

            $targetRoles = ['admin'];
            if ($post->category === 'professional') {
                $targetRoles[] = 'professional';
            } elseif ($post->category === 'adult') {
                $targetRoles[] = 'adult';
            } else {
                $targetRoles[] = 'kid';
                $targetRoles[] = 'adult'; // Adults can also access Kids area
            }

            try {
                \App\Models\Notification::broadcast(
                    'New Article Published',
                    'A new article "' . $post->title . '" has been published. Check it out!',
                    'blog',
                    $post->category,
                    $targetRoles
                );
            } catch (\Throwable $notifEx) {
                Log::warning('Failed to broadcast article notification: ' . $notifEx->getMessage());
            }

            return response()->json(['success' => true, 'post' => $post], 201);
        } catch (\Throwable $e) {
            Log::error('Error creating blog post: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to create article.'], 500);
        }
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

        try {
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
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'Article not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error updating post {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to update article.'], 500);
        }
    }

    public function deletePost($id)
    {
        try {
            BlogPost::findOrFail($id)->delete();
            return response()->json(['success' => true, 'message' => 'Post deleted']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'Article not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error deleting post {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to delete article.'], 500);
        }
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

        try {
            $youtubeId = $request->input('youtubeId') ?? $request->input('youtube_id');
            $youtubeId = $this->extractYoutubeId($youtubeId);

            $video = Video::create([
                'title' => strip_tags($request->input('title')),
                'description' => strip_tags($request->input('description')),
                'category' => strip_tags($request->input('category')),
                'duration' => strip_tags($request->input('duration')),
                'youtubeId' => $youtubeId,
            ]);

            $targetRoles = ['admin'];
            if ($video->category === 'professional') {
                $targetRoles[] = 'professional';
            } elseif ($video->category === 'adult') {
                $targetRoles[] = 'adult';
            } else {
                $targetRoles[] = 'kid';
                $targetRoles[] = 'adult'; // Adults can also access Kids area
            }

            try {
                \App\Models\Notification::broadcast(
                    'New Video Added',
                    'A new video "' . $video->title . '" has been added.',
                    'video',
                    $video->category,
                    $targetRoles
                );
            } catch (\Throwable $notifEx) {
                Log::warning('Failed to broadcast video notification: ' . $notifEx->getMessage());
            }

            return response()->json(['success' => true, 'video' => $video], 201);
        } catch (\Throwable $e) {
            Log::error('Error creating video: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to create video.'], 500);
        }
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

        try {
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
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'Video not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error updating video {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to update video.'], 500);
        }
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
        try {
            Video::findOrFail($id)->delete();
            return response()->json(['success' => true, 'message' => 'Video deleted']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'Video not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error deleting video {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to delete video.'], 500);
        }
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

        try {
            $question = AssessmentQuestion::create($request->only(
                'question', 'options', 'correctAnswer', 'explanation',
                'category', 'difficulty', 'forRoles', 'type', 'order'
            ));
            return response()->json(['success' => true, 'question' => $question], 201);
        } catch (\Throwable $e) {
            Log::error('Error creating assessment question: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to create question.'], 500);
        }
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

        try {
            $question = AssessmentQuestion::findOrFail($id);
            $question->update($request->only(
                'question', 'options', 'correctAnswer', 'explanation',
                'category', 'difficulty', 'isActive', 'forRoles', 'type', 'order'
            ));
            return response()->json(['success' => true, 'question' => $question]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'Question not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error updating question {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to update question.'], 500);
        }
    }

    public function deleteQuestion($id)
    {
        try {
            AssessmentQuestion::findOrFail($id)->delete();
            return response()->json(['success' => true, 'message' => 'Question deleted']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'Question not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error deleting question {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to delete question.'], 500);
        }
    }

    public function createQuickQuestion(Request $request)
    {
        $payload = $request->validate([
            'category' => 'required|string',
            'questionText' => 'required|string',
            'responseText' => 'required|string',
            'isActive' => 'sometimes|boolean'
        ]);
        
        try {
            $question = \App\Models\QuickQuestion::create($payload);
            return response()->json(['success' => true, 'question' => $question], 201);
        } catch (\Throwable $e) {
            Log::error('Error creating quick question: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to create quick question.'], 500);
        }
    }

    public function updateQuickQuestion(Request $request, $id)
    {
        $payload = $request->validate([
            'category' => 'sometimes|required|string',
            'questionText' => 'sometimes|required|string',
            'responseText' => 'sometimes|required|string',
            'isActive' => 'sometimes|boolean'
        ]);

        try {
            $question = \App\Models\QuickQuestion::findOrFail($id);
            $question->update($payload);
            return response()->json(['success' => true, 'question' => $question]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'Quick question not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error updating quick question {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to update quick question.'], 500);
        }
    }

    public function deleteQuickQuestion($id)
    {
        try {
            \App\Models\QuickQuestion::findOrFail($id)->delete();
            return response()->json(['success' => true, 'message' => 'Question deleted']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'Quick question not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error deleting quick question {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to delete quick question.'], 500);
        }
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

        try {
            $image = CarouselImage::create($payload);
            return response()->json(['success' => true, 'image' => $image], 201);
        } catch (\Throwable $e) {
            Log::error('Error creating carousel image: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to create carousel image.'], 500);
        }
    }

    public function updateCarouselImage(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'altText' => 'nullable|string|max:255',
            'alt_text' => 'nullable|string|max:255',
            'alt' => 'nullable|string|max:255',
            'imageUrl' => 'nullable|string|max:2048',
            'url' => 'nullable|string|max:2048',
            'order' => 'nullable|integer|min:0',
        ]);

        try {
            $image = CarouselImage::findOrFail($id);

            $updates = [];

            if ($request->has('title')) {
                $updates['title'] = $request->input('title');
            }

            if ($request->hasAny(['altText', 'alt_text', 'alt'])) {
                $updates['altText'] = $request->input('altText')
                    ?? $request->input('alt_text')
                    ?? $request->input('alt');
            }

            if ($request->hasAny(['imageUrl', 'url'])) {
                $updates['imageUrl'] = $request->input('imageUrl')
                    ?? $request->input('url');
            }

            if ($request->has('order')) {
                $updates['order'] = $request->integer('order');
            }

            if ($request->has('isActive')) {
                $updates['isActive'] = $request->boolean('isActive');
            }

            $image->update($updates);

            return response()->json(['success' => true, 'image' => $image]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'Carousel image not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error updating carousel image {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to update carousel image.'], 500);
        }
    }

    public function deleteCarouselImage($id)
    {
        try {
            CarouselImage::findOrFail($id)->delete();
            return response()->json(['success' => true, 'message' => 'Image deleted']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'Carousel image not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error deleting carousel image {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to delete carousel image.'], 500);
        }
    }

    /**
     * Handle Image Upload
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'file' => 'required|file|image|mimes:jpeg,png,jpg,webp,gif|mimetypes:image/jpeg,image/png,image/webp,image/gif|max:15360', // 15MB max
        ]);

        try {
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                
                // Store file in non-executable public storage with random hash name
                $path = $file->store('uploads', 'public');
                $url = asset('storage/' . $path);

                return response()->json([
                    'success' => true,
                    'url' => $url
                ]);
            }

            return response()->json(['success' => false, 'error' => 'No file uploaded'], 400);
        } catch (\Throwable $e) {
            Log::error('Error uploading image: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Image upload failed.'], 500);
        }
    }

    /**
     * Analytics
     */
    public function analytics(Request $request)
    {
        $type = $request->query('type', 'summary');

        // Retrieve cached analytics through domain service
        $data = $this->analyticsService->getCachedAnalytics($type);

        if (!$data) {
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
        
        try {
            DB::transaction(function () use ($request) {
                foreach ($request->imageIds as $index => $id) {
                    CarouselImage::where('id', $id)->update(['order' => $index]);
                }
            });
            
            return response()->json(CarouselImage::orderBy('order')->get());
        } catch (\Throwable $e) {
            Log::error('Error reordering carousel: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to reorder carousel.'], 500);
        }
    }

    public function reorderBlogs(Request $request)
    {
        $request->validate(['blogIds' => 'required|array']);
        
        try {
            DB::transaction(function () use ($request) {
                foreach ($request->blogIds as $index => $id) {
                    BlogPost::where('id', $id)->update(['order' => $index]);
                }
            });
            
            $allBlogs = BlogPost::with('author:id,name')->orderBy('order', 'asc')->orderBy('created_at', 'desc')->get();
            return response()->json($allBlogs);
        } catch (\Throwable $e) {
            Log::error('Error reordering blogs: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to reorder blogs.'], 500);
        }
    }

    public function reorderVideos(Request $request)
    {
        $request->validate(['videoIds' => 'required|array']);
        
        try {
            DB::transaction(function () use ($request) {
                foreach ($request->videoIds as $index => $id) {
                    Video::where('id', $id)->update(['order' => $index]);
                }
            });
            
            $allVideos = Video::orderBy('order', 'asc')->orderBy('created_at', 'desc')->get();
            return response()->json($allVideos);
        } catch (\Throwable $e) {
            Log::error('Error reordering videos: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to reorder videos.'], 500);
        }
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
            'file' => 'required|file|mimes:pdf|mimetypes:application/pdf|max:51200', // 50MB max
        ]);

        try {
            if ($request->hasFile('file')) {
                $file = $request->file('file');

                // 1. Verify PDF Magic Bytes (%PDF-)
                $filePath = $file->getRealPath();
                $header = file_get_contents($filePath, false, null, 0, 4);
                if ($header !== '%PDF') {
                    return response()->json([
                        'success' => false,
                        'error' => 'The uploaded file is not a valid PDF document.'
                    ], 422);
                }

                // 2. Sanitize filename to prevent directory traversal or script execution
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $cleanSlug = Str::slug($originalName);
                if (empty($cleanSlug)) {
                    $cleanSlug = 'manual_document';
                }
                $cleanSlug = substr($cleanSlug, 0, 50);
                $filename = time() . '_' . $cleanSlug . '_' . Str::random(8) . '.pdf';
                
                // 3. Ensure the destination directory exists
                $destinationPath = public_path('modules/bfp_manuals');
                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }
                
                // 4. Move file securely
                $file->move($destinationPath, $filename);

                return response()->json([
                    'success' => true,
                    'filename' => $filename,
                    'url' => asset('modules/bfp_manuals/' . $filename)
                ]);
            }

            return response()->json(['success' => false, 'error' => 'No file uploaded'], 400);
        } catch (\Throwable $e) {
            Log::error('Error uploading manual: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to upload manual.'], 500);
        }
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

        try {
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
        } catch (\Throwable $e) {
            Log::error('Error creating fire code section: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to create fire code section.'], 500);
        }
    }

    public function updateFireCode(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:100',
            'sectionNum' => 'nullable|string|max:100',
            'content' => 'nullable|string',
            'description' => 'nullable|string',
            'filename' => ['nullable', 'string', 'max:255', 'regex:/\.pdf$/i'],
            'parentSectionId' => 'nullable|integer',
        ]);

        try {
            $section = \App\Models\FireCodeSection::findOrFail($id);
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
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'Section not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error updating fire code section {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to update fire code section.'], 500);
        }
    }

    public function deleteFireCode($id)
    {
        try {
            \App\Models\FireCodeSection::findOrFail($id)->delete();
            return response()->json(['success' => true, 'message' => 'Section deleted']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['success' => false, 'error' => 'Section not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error deleting fire code section {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to delete fire code section.'], 500);
        }
    }

    public function exportCsv()
    {
        $summary      = $this->analyticsService->getSummaryAnalytics();
        $barangay     = $this->analyticsService->getBarangayAnalytics();
        $demographics = $this->analyticsService->getDemographicAnalytics();
        $knowledge    = $this->analyticsService->getKnowledgeAnalytics();
        
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

        $callback = $this->analyticsService->createCsvStreamCallback(
            $summary, $barangay, $demographics, $knowledge, $schoolData, $feedbackData
        );

        return response()->stream($callback, 200, $headers);
    }

    private function getSummaryAnalytics()
    {
        return $this->analyticsService->getSummaryAnalytics();
    }

    private function getBarangayAnalytics()
    {
        return $this->analyticsService->getBarangayAnalytics();
    }

    private function getDemographicAnalytics()
    {
        return $this->analyticsService->getDemographicAnalytics();
    }

    private function getKnowledgeAnalytics()
    {
        return $this->analyticsService->getKnowledgeAnalytics();
    }

    public function getMaintenanceSettings()
    {
        $settings = \App\Models\SystemSetting::getVal('maintenance_mode', [
            'is_active' => false,
            'message' => "SafeScape is currently undergoing scheduled updates. We'll be back online shortly!",
            'warning_active' => false,
            'warning_message' => "Notice: The platform will be offline for scheduled maintenance in 15 minutes. Please save your progress."
        ]);

        return response()->json([
            'success' => true,
            'settings' => $settings
        ]);
    }

    public function updateMaintenanceSettings(Request $request)
    {
        $rules = [
            'is_active' => 'required|boolean',
            'message' => 'required|string|max:500',
            'warning_active' => 'required|boolean',
            'warning_message' => 'required|string|max:500',
            'scheduled_at' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:1|max:1440',
            'maintenance_duration_minutes' => 'nullable|integer|min:1|max:1440',
            'maintenance_until' => 'nullable|string',
        ];

        if ($request->is_active) {
            $rules['password'] = 'required|string';
        }

        $request->validate($rules);

        try {
            if ($request->is_active) {
                if (!\Illuminate\Support\Facades\Hash::check($request->password, $request->user()->password)) {
                    return response()->json([
                        'success' => false,
                        'errors' => [
                            'password' => ['Incorrect password confirmation.']
                        ]
                    ], 422);
                }
            }

            $settings = [
                'is_active' => $request->is_active,
                'message' => $request->message,
                'warning_active' => $request->warning_active,
                'warning_message' => $request->warning_message,
                'scheduled_at' => $request->scheduled_at,
                'duration_minutes' => $request->duration_minutes ?? 15,
                'maintenance_duration_minutes' => $request->maintenance_duration_minutes ?? 30,
                'maintenance_until' => $request->maintenance_until,
            ];

            \App\Models\SystemSetting::setVal('maintenance_mode', $settings, 'System maintenance mode settings');

            return response()->json([
                'success' => true,
                'message' => 'Maintenance configurations updated successfully.',
                'settings' => $settings
            ]);
        } catch (\Throwable $e) {
            Log::error('Error updating maintenance settings: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to update maintenance settings.'], 500);
        }
    }
}
