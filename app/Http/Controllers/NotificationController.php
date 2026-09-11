<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Notification;

class NotificationController extends Controller
{
    /**
     * Fetch all notifications for the authenticated user.
     */
    public function index()
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $limit = min((int)request()->query('limit', 50), 100);

            $notifications = Notification::where('userId', $userId)
                ->orderBy('createdAt', 'desc')
                ->limit($limit)
                ->get();

            return response()->json($notifications);
        } catch (\Throwable $e) {
            Log::error('Error fetching notifications: ' . $e->getMessage(), ['userId' => Auth::id()]);
            return response()->json(['error' => 'Failed to load notifications.'], 500);
        }
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead($id)
    {
        try {
            $userId = Auth::id();

            $notification = Notification::where('id', $id)
                ->where('userId', $userId)
                ->first();

            if (!$notification) {
                return response()->json(['error' => 'Notification not found'], 404);
            }

            $notification->update(['isRead' => true]);

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            Log::error("Error marking notification {$id} as read: " . $e->getMessage());
            return response()->json(['error' => 'Failed to mark notification as read.'], 500);
        }
    }

    /**
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllAsRead()
    {
        try {
            $userId = Auth::id();

            if (!$userId) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            Notification::where('userId', $userId)
                ->where('isRead', false)
                ->update(['isRead' => true]);

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            Log::error('Error marking all notifications as read: ' . $e->getMessage(), ['userId' => Auth::id()]);
            return response()->json(['error' => 'Failed to mark notifications as read.'], 500);
        }
    }

    /**
     * Delete a specific notification.
     */
    public function destroy($id)
    {
        try {
            $userId = Auth::id();

            $notification = Notification::where('id', $id)
                ->where('userId', $userId)
                ->first();

            if (!$notification) {
                return response()->json(['error' => 'Notification not found'], 404);
            }

            $notification->delete();

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            Log::error("Error deleting notification {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to delete notification.'], 500);
        }
    }
}
