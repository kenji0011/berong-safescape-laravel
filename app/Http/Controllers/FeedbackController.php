<?php

namespace App\Http\Controllers;

use App\Models\UserFeedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FeedbackController extends Controller
{
    /**
     * Submit user feedback for a feature.
     * POST /api/feedback
     */
    public function store(Request $request)
    {
        $request->validate([
            'featureName' => 'required|string|max:255',
            'featureType' => 'required|string|in:module,chatbot,quiz,video,general',
            'rating' => 'required|integer|min:1|max:5',
            'comments' => 'nullable|string|max:2000',
        ]);

        try {
            $feedback = UserFeedback::create([
                'userId' => $request->user()->id,
                'featureName' => strip_tags($request->input('featureName')),
                'featureType' => $request->input('featureType'),
                'rating' => $request->input('rating'),
                'comments' => strip_tags($request->input('comments')),
                'sessionId' => strip_tags($request->input('sessionId')),
            ]);

            return response()->json(['success' => true, 'feedback' => $feedback], 201);
        } catch (\Throwable $e) {
            Log::error('Error saving feedback: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to submit feedback.'], 500);
        }
    }

    /**
     * Get feedback analytics for the admin dashboard.
     * GET /api/admin/feedback-analytics
     */
    public function analytics()
    {
        try {
            // Overall average rating
            $overallAvg = round(UserFeedback::avg('rating') ?? 0, 1);
            $totalFeedback = UserFeedback::count();

            // Average rating per feature type
            $byFeatureType = UserFeedback::selectRaw('"featureType", ROUND(AVG(rating), 1) as "avgRating", COUNT(*) as "totalCount"')
                ->groupBy('featureType')
                ->orderByDesc('avgRating')
                ->get();

            // Average rating per specific feature name
            $byFeatureName = UserFeedback::selectRaw('"featureName", "featureType", ROUND(AVG(rating), 1) as "avgRating", COUNT(*) as "totalCount"')
                ->groupBy('featureName', 'featureType')
                ->orderByDesc('avgRating')
                ->get();
                
            // Attach recent reviews to each feature
            foreach ($byFeatureName as $feature) {
                $feature->reviews = UserFeedback::with('user:id,name,firstName,lastName')
                    ->where('featureName', $feature->featureName)
                    ->where('featureType', $feature->featureType)
                    ->orderByDesc('created_at')
                    ->limit(10)
                    ->get();
            }

            // Recent feedback with user names
            $recentFeedback = UserFeedback::with('user:id,name,firstName,lastName')
                ->orderByDesc('created_at')
                ->limit(20)
                ->get();

            // Rating distribution (how many 1-star, 2-star, etc.)
            $ratingDistribution = [];
            for ($i = 1; $i <= 5; $i++) {
                $ratingDistribution[$i] = UserFeedback::where('rating', $i)->count();
            }

            return response()->json([
                'overallAverage' => $overallAvg,
                'totalFeedback' => $totalFeedback,
                'byFeatureType' => $byFeatureType,
                'byFeatureName' => $byFeatureName,
                'recentFeedback' => $recentFeedback,
                'ratingDistribution' => $ratingDistribution,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error calculating feedback analytics: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to load feedback analytics.'], 500);
        }
    }
}
