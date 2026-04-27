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
        $totalStudents = \App\Models\User::where('role', 'student')->count();
        
        // Since we don't have a real websocket/online tracking system yet, 
        // we simulate a believable "Online Now" count based on total users.
        $onlineCount = max(12, round($totalStudents * 0.12) + rand(3, 9));

        return response()->json([
            'onlineCount' => $onlineCount,
            'totalStudents' => $totalStudents
        ]);
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

            \App\Models\EngagementLog::create([
                'userId' => $user->id,
                'eventType' => $request->activityType, // Map activityType from frontend to eventType in DB
                'eventData' => $request->metadata ?? [],
                'points' => \App\Http\Controllers\EngagementController::getPointsForActivity($request->activityType),
                'loggedAt' => now(),
            ]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Engagement log error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Internal Server Error: ' . $e->getMessage()], 500);
        }
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
