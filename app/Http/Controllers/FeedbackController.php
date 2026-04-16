<?php

namespace App\Http\Controllers;

use App\Models\UserFeedback;
use Illuminate\Http\Request;

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

        $feedback = UserFeedback::create([
            'userId' => $request->user()->id,
            'featureName' => $request->input('featureName'),
            'featureType' => $request->input('featureType'),
            'rating' => $request->input('rating'),
            'comments' => $request->input('comments'),
            'sessionId' => $request->input('sessionId'),
        ]);

        return response()->json(['success' => true, 'feedback' => $feedback], 201);
    }

    /**
     * Get feedback analytics for the admin dashboard.
     * GET /api/admin/feedback-analytics
     */
    public function analytics()
    {
        // Overall average rating
        $overallAvg = round(UserFeedback::avg('rating') ?? 0, 1);
        $totalFeedback = UserFeedback::count();

        // Average rating per feature type
        $byFeatureType = UserFeedback::selectRaw("featureType, ROUND(AVG(rating), 1) as avgRating, COUNT(*) as totalCount")
            ->groupBy('featureType')
            ->orderByDesc('avgRating')
            ->get();

        // Average rating per specific feature name
        $byFeatureName = UserFeedback::selectRaw("featureName, featureType, ROUND(AVG(rating), 1) as avgRating, COUNT(*) as totalCount")
            ->groupBy('featureName', 'featureType')
            ->orderByDesc('avgRating')
            ->get();

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
    }
}
