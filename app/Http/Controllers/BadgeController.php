<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\UserBadge;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

        try {
            $result = DB::transaction(function () use ($user, $validated) {
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
                $userRoles = array_filter(array_map('trim', explode(',', $user->role ?? 'guest')));
                if (!$existingBadge && in_array('kid', $userRoles)) {
                    Notification::create([
                        'userId' => $user->id,
                        'title' => 'New Badge Earned! 🏆',
                        'message' => "Congratulations! You've earned the {$validated['badge_name']} badge!",
                        'type' => 'achievement',
                        'category' => 'kids/badges',
                        'isRead' => false,
                        'createdAt' => now(),
                    ]);

                    // Robust Hero Rank Level Up Check
                    $totalBadges = UserBadge::where('userId', $user->id)->count();
                    
                    $ranks = [
                        8 => ['name' => 'Legendary Hero', 'icon' => '🌟'],
                        5 => ['name' => 'Master Hero', 'icon' => '🏆'],
                        3 => ['name' => 'Safety Elite', 'icon' => '🛡️'],
                        1 => ['name' => 'Fire Scout', 'icon' => '🔥'],
                    ];

                    foreach ($ranks as $threshold => $rankInfo) {
                        if ($totalBadges >= $threshold) {
                            // Check if they already have this specific rank notification
                            $exists = Notification::where('userId', $user->id)
                                ->where('category', 'kids/rank')
                                ->where('message', 'LIKE', "%{$rankInfo['name']}%")
                                ->exists();
                            
                            if (!$exists) {
                                Notification::create([
                                    'userId' => $user->id,
                                    'title' => "Hero Rank Up! {$rankInfo['icon']}",
                                    'message' => "Amazing! You've reached the rank of {$rankInfo['name']}!",
                                    'type' => 'achievement',
                                    'category' => 'kids/rank',
                                    'isRead' => false,
                                    'createdAt' => now(),
                                ]);
                                // Stop after notifying for the highest achieved rank
                                break; 
                            }
                        }
                    }
                }

                return [
                    'badge' => $badge,
                    'is_new' => !$existingBadge,
                ];
            });

            return response()->json([
                'success' => true,
                'badge'   => $result['badge'],
                'is_new'  => $result['is_new'],
            ]);
        } catch (\Throwable $e) {
            Log::error('Error awarding badge: ' . $e->getMessage(), ['userId' => $user->id, 'exception' => $e]);
            return response()->json(['error' => 'Failed to award badge.'], 500);
        }
    }

    /**
     * Get all badges for the authenticated user.
     */
    public function index()
    {
        try {
            $badges = UserBadge::where('userId', Auth::id())->get();
            return response()->json($badges);
        } catch (\Throwable $e) {
            Log::error('Error loading badges: ' . $e->getMessage(), ['userId' => Auth::id(), 'exception' => $e]);
            return response()->json(['error' => 'Failed to load badges.'], 500);
        }
    }
}
