<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EngagementController extends Controller
{
    /**
     * Get engagement stats including total students and simulated online count.
     */
    public function stats()
    {
        try {
            $totalStudents = \App\Models\User::where('role', 'student')->count();
            
            // Since we don't have a real websocket/online tracking system yet, 
            // we simulate a believable "Online Now" count based on total users.
            $onlineCount = max(12, round($totalStudents * 0.12) + rand(3, 9));

            return response()->json([
                'onlineCount' => $onlineCount,
                'totalStudents' => $totalStudents
            ]);
        } catch (\Throwable $e) {
            Log::error('EngagementController@stats failed: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['onlineCount' => 0, 'totalStudents' => 0], 500);
        }
    }

    /**
     * Log an engagement event.
     */
    public function logEvent(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthenticated'], 401);
            }

            $activityType = $request->activityType;
            $points = \App\Http\Controllers\EngagementController::getPointsForActivity($activityType);

            // Only allow one DAILY_LOGIN points grant per day
            if ($activityType === 'DAILY_LOGIN') {
                $alreadyLoggedToday = \App\Models\EngagementLog::where('userId', $user->id)
                    ->where('eventType', 'DAILY_LOGIN')
                    ->whereDate('loggedAt', \Carbon\Carbon::today())
                    ->exists();

                if ($alreadyLoggedToday) {
                    return response()->json(['success' => true, 'message' => 'Daily login already logged for today.']);
                }
            }

            \Illuminate\Support\Facades\DB::transaction(function () use ($user, $activityType, $points, $request) {
                \App\Models\EngagementLog::create([
                    'userId' => $user->id,
                    'eventType' => $activityType, // Map activityType from frontend to eventType in DB
                    'eventData' => $request->metadata ?? [],
                    'points' => $points,
                    'loggedAt' => now(),
                ]);

                // Increment the user's total engagement points
                $user->increment('engagementPoints', $points);
            });

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            Log::error('Engagement log error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['success' => false, 'message' => 'Internal Server Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get engagement leaderboard.
     */
    public function leaderboard()
    {
        try {
            $leaders = \App\Models\User::where('role', 'student')
                ->select('id', 'name', 'avatar', 'engagementPoints')
                ->orderBy('engagementPoints', 'desc')
                ->limit(10)
                ->get();

            return response()->json($leaders);
        } catch (\Throwable $e) {
            Log::error('EngagementController@leaderboard error: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json([], 500);
        }
    }

    /**
     * Alias to user notifications for backwards compatibility.
     */
    public function notifications()
    {
        return app(NotificationController::class)->index();
    }

    /**
     * Alias to mark all notifications as read.
     */
    public function readNotifications()
    {
        return app(NotificationController::class)->markAllAsRead();
    }

    /**
     * Helper to get points for an activity.
     */
    public static function getPointsForActivity($type)
    {
        $points = [
            'MODULE_COMPLETION' => 50,
            'QUIZ_COMPLETION' => 30,
            'VIDEO_WATCHED' => 10,
            'GAME_PLAYED' => 20,
            'DAILY_LOGIN' => 5,
        ];
        return $points[$type] ?? 0;
    }
}
