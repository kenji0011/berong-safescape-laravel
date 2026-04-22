<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Notification;

class NotificationController extends Controller
{
    /**
     * Fetch all notifications for the authenticated user.
     */
    public function index()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $notifications = Notification::where('userId', $userId)
            ->orderBy('createdAt', 'desc')
            ->get();

        return response()->json($notifications);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead($id)
    {
        $userId = Auth::id();

        $notification = Notification::where('id', $id)
            ->where('userId', $userId)
            ->first();

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $notification->update(['isRead' => true]);

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllAsRead()
    {
        $userId = Auth::id();

        if (!$userId) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        Notification::where('userId', $userId)
            ->where('isRead', false)
            ->update(['isRead' => true]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete a specific notification.
     */
    public function destroy($id)
    {
        $userId = Auth::id();

        $notification = Notification::where('id', $id)
            ->where('userId', $userId)
            ->first();

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $notification->delete();

        return response()->json(['success' => true]);
    }
}
