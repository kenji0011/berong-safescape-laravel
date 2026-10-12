<?php

namespace App\Http\Controllers;

use App\Models\RightCallProgress;
use App\Models\User;
use App\Models\UserBadge;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RightCallProgressController extends Controller
{
    /**
     * Load cloud progress for a player.
     * GET /api/games/right-call/load?user_id=42
     */
    public function load(Request $request): JsonResponse
    {
        try {
            $userId = $request->query('user_id') ?: Auth::id();

            if (!$userId) {
                return response()->json(['error' => 'user_id is required'], 400);
            }

            $user = User::find($userId);
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            $progress = RightCallProgress::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'high_score'          => 0,
                    'total_calls_handled' => 0,
                    'successful_calls'    => 0,
                    'failed_calls'        => 0,
                    'accuracy_rate'       => 0.0,
                    'current_rank'        => 'Junior Dispatcher',
                    'completed_scenarios' => [],
                    'last_played_at'      => now(),
                ]
            );

            // Check if Dispatch Hero badge is already earned
            $hasBadge = UserBadge::where('userId', $user->id)
                ->where('badge_id', 'dispatch_hero')
                ->exists();

            return response()->json([
                'user_id'             => (int) $user->id,
                'player_name'         => $user->name,
                'high_score'          => $progress->high_score,
                'total_calls_handled' => $progress->total_calls_handled,
                'successful_calls'    => $progress->successful_calls,
                'failed_calls'        => $progress->failed_calls,
                'accuracy_rate'       => $progress->accuracy_rate,
                'current_rank'        => $progress->current_rank,
                'completed_scenarios' => $progress->completed_scenarios ?? [],
                'badge_unlocked'      => $hasBadge,
                'last_played_at'      => $progress->last_played_at,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error loading Right Call progress: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to load progress'], 500);
        }
    }

    /**
     * Save progress & scores to cloud database.
     * POST /api/games/right-call/save
     */
    public function save(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id'             => 'required|integer|exists:users,id',
            'score'               => 'nullable|integer|min:0',
            'calls_handled'       => 'nullable|integer|min:0',
            'successful_calls'    => 'nullable|integer|min:0',
            'failed_calls'        => 'nullable|integer|min:0',
            'completed_scenarios' => 'nullable|array',
            'game_state_data'     => 'nullable|array',
            'is_won'              => 'nullable|boolean',
        ]);

        try {
            $user = User::findOrFail($validated['user_id']);

            $result = DB::transaction(function () use ($user, $validated) {
                $progress = RightCallProgress::firstOrNew(['user_id' => $user->id]);

                // High score calculation (keeps best score)
                $incomingScore = $validated['score'] ?? 0;
                $progress->high_score = max($progress->high_score ?? 0, $incomingScore);

                // Cumulative counters
                $progress->total_calls_handled = ($progress->total_calls_handled ?? 0) + ($validated['calls_handled'] ?? 0);
                $progress->successful_calls = ($progress->successful_calls ?? 0) + ($validated['successful_calls'] ?? 0);
                $progress->failed_calls = ($progress->failed_calls ?? 0) + ($validated['failed_calls'] ?? 0);

                // Accuracy calculation
                if ($progress->total_calls_handled > 0) {
                    $progress->accuracy_rate = round(($progress->successful_calls / $progress->total_calls_handled) * 100, 2);
                }

                // Rank level progression based on cumulative successful calls
                if ($progress->successful_calls >= 20) {
                    $progress->current_rank = 'Chief Dispatcher';
                } elseif ($progress->successful_calls >= 10) {
                    $progress->current_rank = 'Senior Dispatcher';
                } elseif ($progress->successful_calls >= 5) {
                    $progress->current_rank = 'Dispatch Officer';
                } else {
                    $progress->current_rank = 'Junior Dispatcher';
                }

                // Merge completed scenarios without duplicates
                $existingScenarios = $progress->completed_scenarios ?? [];
                $newScenarios = $validated['completed_scenarios'] ?? [];
                $progress->completed_scenarios = array_values(array_unique(array_merge($existingScenarios, $newScenarios)));

                if (!empty($validated['game_state_data'])) {
                    $progress->game_state_data = $validated['game_state_data'];
                }

                $progress->last_played_at = now();
                $progress->save();

                // Award Dispatch Hero badge if won
                $isNewBadge = false;
                if (!empty($validated['is_won'])) {
                    $existingBadge = UserBadge::where('userId', $user->id)
                        ->where('badge_id', 'dispatch_hero')
                        ->exists();

                    if (!$existingBadge) {
                        UserBadge::create([
                            'userId'     => $user->id,
                            'badge_id'   => 'dispatch_hero',
                            'badge_name' => 'Dispatch Hero',
                            'badge_icon' => '/badges/dispatch_hall.webp?v=2',
                            'earnedAt'   => now(),
                        ]);
                        $isNewBadge = true;

                        // Add celebratory notification
                        Notification::create([
                            'userId'    => $user->id,
                            'title'     => 'Dispatch Hero Badge! 🏆',
                            'message'   => 'Outstanding dispatching! You earned the Dispatch Hero badge in The Right Call!',
                            'type'      => 'achievement',
                            'category'  => 'kids/badges',
                            'isRead'    => false,
                            'createdAt' => now(),
                        ]);
                    }
                }

                return [
                    'progress'     => $progress,
                    'is_new_badge' => $isNewBadge,
                ];
            });

            return response()->json([
                'status'       => 'saved',
                'progress'     => $result['progress'],
                'is_new_badge' => $result['is_new_badge'],
            ]);
        } catch (\Throwable $e) {
            Log::error('Error saving Right Call progress: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to save progress'], 500);
        }
    }

    /**
     * Top dispatchers leaderboard.
     * GET /api/games/right-call/leaderboard
     */
    public function leaderboard(): JsonResponse
    {
        try {
            $topPlayers = RightCallProgress::with('user:id,name,role,avatar')
                ->orderByDesc('high_score')
                ->orderByDesc('successful_calls')
                ->take(10)
                ->get();

            return response()->json($topPlayers);
        } catch (\Throwable $e) {
            Log::error('Error loading leaderboard: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to load leaderboard'], 500);
        }
    }
}
