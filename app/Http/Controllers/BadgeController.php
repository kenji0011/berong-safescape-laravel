<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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

        $badge = UserBadge::updateOrCreate(
            [
                'userId'   => Auth::id(),
                'badge_id' => $validated['badge_id'],
            ],
            [
                'badge_name' => $validated['badge_name'],
                'badge_icon' => $validated['badge_icon'],
                'earnedAt'   => now(),
            ]
        );

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
