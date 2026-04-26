<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

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
}
