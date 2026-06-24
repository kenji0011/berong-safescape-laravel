<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\KidsController;
use App\Http\Controllers\FloorPlanController;
use App\Http\Controllers\EngagementController;
use App\Http\Controllers\AuthApiController;
use App\Http\Controllers\SchoolAnalyticsController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here we wire the 50+ Endpoints handling all 11 logical domains
|
*/

// ==========================================
// PUBLIC Routes (no auth required)
// ==========================================

// Auth API — used by registration wizard
Route::prefix('auth')->group(function () {
    Route::middleware('throttle:auth')->get('/check-username', [AuthApiController::class, 'checkUsername']);
    Route::middleware('throttle:auth')->post('/validate-credentials', [AuthApiController::class, 'validateCredentials']);
    Route::middleware('throttle:auth')->post('/register', [AuthApiController::class, 'register']);
    Route::middleware('throttle:password-reset')->post('/reset-password', [AuthApiController::class, 'resetPassword']);
});

// Public content — home page carousel, assessment questions for pre-test
Route::get('/content/carousel', [ContentController::class, 'carousel']);
Route::get('/assessment/questions', [AssessmentController::class, 'index']);
Route::get('/quick-questions', [ContentController::class, 'questions']);

// Public schools list (for registration dropdowns)
Route::get('/schools', [SchoolAnalyticsController::class, 'index']);

Route::middleware(['auth:sanctum', 'throttle:api'])->get('/user', function (Request $request) {
    return $request->user();
});

// All protected API routes
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    // Auth Profile Completion
    Route::post('/auth/complete-profile', [AuthApiController::class, 'completeProfile']);
    Route::get('/auth/user-scores', [AuthApiController::class, 'userScores']);
    Route::put('/auth/update-profile', [AuthApiController::class, 'updateProfile']);
    Route::put('/auth/update-avatar', [AuthApiController::class, 'updateAvatar']);
    Route::put('/auth/change-password', [AuthApiController::class, 'changePassword']);

    // ==========================================
    // Chatbot AI Domain
    // ==========================================
    Route::middleware('throttle:ai')->post('/chatbot/ai-response', [\App\Http\Controllers\ChatbotController::class, 'respond']);
    Route::middleware('throttle:ai')->post('/chatbot/tts', [\App\Http\Controllers\ChatbotController::class, 'generateSpeech']);

    // ==========================================
    // 1. Content Domain (Blog, Videos, FAQs, Carousel)
    // ==========================================
    Route::prefix('content')->group(function () {
        Route::get('/blogs', [ContentController::class, 'blogs']);
        Route::get('/blogs/{id}', [ContentController::class, 'showBlog']);
        Route::get('/videos', [ContentController::class, 'videos']);
        Route::get('/questions', [ContentController::class, 'questions']);
        Route::get('/manuals', [ContentController::class, 'manuals']);
        // Removed duplicate /carousel route as it needs to be public
    });

    // ==========================================
    // 2. Assessment Domain (Pre/Post tests, Scoring)
    // ==========================================
    Route::prefix('assessments')->group(function () {
        Route::get('/questions', [AssessmentController::class, 'index']);
        Route::post('/pre-test', [AssessmentController::class, 'submitPreTest']);
        Route::post('/post-test', [AssessmentController::class, 'submitPostTest']);
        Route::get('/history', [AssessmentController::class, 'history']);
        Route::get('/post-test-eligibility', [AssessmentController::class, 'postTestEligibility']);
    });

    // ==========================================
    // 3. Kids Domain (Modules, SafeScape Progress)
    // ==========================================
    Route::prefix('kids')->group(function () {
        Route::get('/modules', [KidsController::class, 'modules']);
        Route::get('/modules/{id}', [KidsController::class, 'showModule']);
        Route::post('/progress', [KidsController::class, 'updateProgress']);
        Route::get('/safescape', [KidsController::class, 'safeScapeProgress']);
        Route::post('/safescape', [KidsController::class, 'updateSafeScape']);
        Route::post('/quiz', [KidsController::class, 'submitQuiz']);
        Route::get('/adaptive-quiz/{module}', [KidsController::class, 'adaptiveQuiz']);
    });

    // ==========================================
    // 4. Floor Plan Simulation Domain
    // ==========================================
    Route::apiResource('floor-plans', FloorPlanController::class);
    Route::post('/floor-plans/{id}/clone', [FloorPlanController::class, 'clone']);
    Route::post('/floor-plans/{id}/simulate', [FloorPlanController::class, 'runSimulation']);
    Route::get('/floor-plans/{id}/status', [FloorPlanController::class, 'simulationStatus']);

    // ==========================================
    // 5. Engagement & Analytics Domain
    // ==========================================
    Route::prefix('engagement')->group(function () {
        Route::post('/log', [EngagementController::class, 'logEvent']);
        Route::get('/stats', [EngagementController::class, 'stats']);
        Route::get('/leaderboard', [EngagementController::class, 'leaderboard']);
        Route::get('/notifications', [EngagementController::class, 'notifications']);
        Route::post('/notifications/read', [EngagementController::class, 'readNotifications']);
    });

    // ==========================================
    // User Feedback Submission
    // ==========================================
    Route::post('/feedback', [FeedbackController::class, 'store']);

    // ==========================================
    // 6. Admin Control Panel (Role Protected)
    // ==========================================
    Route::middleware(['admin'])->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
        Route::patch('/users/{id}/permissions', [AdminController::class, 'updateUserPermissions']);
        Route::get('/analytics', [AdminController::class, 'analytics']);
        Route::get('/analytics/export', [AdminController::class, 'exportCsv']);

        // Content management
        Route::post('/upload', [AdminController::class, 'uploadImage']);
        Route::post('/upload-manual', [AdminController::class, 'uploadManual']);

        Route::get('/posts', [ContentController::class, 'blogs']);
        Route::post('/posts', [AdminController::class, 'createPost']);
        Route::put('/posts/{id}', [AdminController::class, 'updatePost']);
        Route::delete('/posts/{id}', [AdminController::class, 'deletePost']);

        // Aliases to match frontend fetch calls
        Route::get('/blogs', [ContentController::class, 'blogs']);
        Route::post('/blogs', [AdminController::class, 'createPost']);
        Route::put('/blogs/{id}', [AdminController::class, 'updatePost']);
        Route::delete('/blogs/{id}', [AdminController::class, 'deletePost']);

        Route::get('/videos', [ContentController::class, 'videos']);
        Route::post('/videos', [AdminController::class, 'createVideo']);
        Route::put('/videos/{id}', [AdminController::class, 'updateVideo']);
        Route::delete('/videos/{id}', [AdminController::class, 'deleteVideo']);

        Route::get('/questions', [ContentController::class, 'questions']);
        Route::post('/questions', [AdminController::class, 'createQuestion']);
        Route::put('/questions/{id}', [AdminController::class, 'updateQuestion']);
        Route::delete('/questions/{id}', [AdminController::class, 'deleteQuestion']);

        Route::get('/carousel', [ContentController::class, 'carousel']);
        Route::post('/carousel', [AdminController::class, 'createCarouselImage']);
        Route::put('/carousel/{id}', [AdminController::class, 'updateCarouselImage']);
        Route::delete('/carousel/{id}', [AdminController::class, 'deleteCarouselImage']);
        Route::post('/carousel/reorder', [AdminController::class, 'reorderCarousel']);

        Route::post('/blogs/reorder', [AdminController::class, 'reorderBlogs']);
        Route::post('/videos/reorder', [AdminController::class, 'reorderVideos']);

        // Quick Questions Alias
        Route::get('/quick-questions', [ContentController::class, 'questions']);
        Route::post('/quick-questions', [AdminController::class, 'createQuickQuestion']);
        Route::put('/quick-questions/{id}', [AdminController::class, 'updateQuickQuestion']);
        Route::delete('/quick-questions/{id}', [AdminController::class, 'deleteQuickQuestion']);

        // Fire Codes
        Route::get('/fire-codes', [AdminController::class, 'fireCodes']);
        Route::post('/fire-codes', [AdminController::class, 'createFireCode']);
        Route::put('/fire-codes/{id}', [AdminController::class, 'updateFireCode']);
        Route::delete('/fire-codes/{id}', [AdminController::class, 'deleteFireCode']);

        // School Analytics & Management
        Route::get('/school-analytics', [SchoolAnalyticsController::class, 'analytics']);
        Route::get('/school-analytics/{id}', [SchoolAnalyticsController::class, 'show']);
        Route::post('/schools', [SchoolAnalyticsController::class, 'store']);
        Route::put('/schools/{id}', [SchoolAnalyticsController::class, 'update']);
        Route::delete('/schools/{id}', [SchoolAnalyticsController::class, 'destroy']);

        // Feedback Analytics
        Route::get('/feedback-analytics', [FeedbackController::class, 'analytics']);
    });

    // ==========================================
    // 7. Notifications Domain
    // ==========================================
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });
});
