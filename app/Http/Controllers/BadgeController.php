<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\UserBadge;
use Illuminate\Support\Facades\Auth;

class BadgeController extends Controller
{
    /**
     * Award a badge to the authenticated user.
     */
    public function award(Request $request)
    {
        $validated = $request->validate([
            'badge_id'   => 'required|string',
            'badge_name' => 'required|string',
            'badge_icon' => 'required|string',
        ]);

        $user = Auth::user();
        
        // Check if the badge already exists for this user to avoid duplicate notifications
        $existingBadge = UserBadge::where('userId', $user->id)
            ->where('badge_id', $validated['badge_id'])
            ->exists();

        $badge = UserBadge::updateOrCreate(
            [
                'userId'   => $user->id,
                'badge_id' => $validated['badge_id'],
            ],
            [
                'badge_name' => $validated['badge_name'],
                'badge_icon' => $validated['badge_icon'],
                'earnedAt'   => now(),
            ]
        );

        // Implement a notification for obtaining badges only on a Kids Account
        if (!$existingBadge && $user->role === 'kid') {
            Notification::create([
                'userId' => $user->id,
                'title' => 'New Badge Earned! 🏆',
                'message' => "Congratulations! You've earned the {$validated['badge_name']} badge!",
                'type' => 'achievement',
                'category' => 'kids/badges',
                'isRead' => false,
                'createdAt' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'badge'   => $badge,
        ]);
    }

    /**
     * Get all badges for the authenticated user.
     */
    public function index()
    {
        $badges = UserBadge::where('userId', Auth::id())->get();
        return response()->json($badges);
    }
}
