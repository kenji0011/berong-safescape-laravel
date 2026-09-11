<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SchoolAnalyticsController extends Controller
{
    /**
     * Get all schools (for dropdowns etc.)
     * GET /api/schools
     */
    public function index()
    {
        try {
            $schools = School::where('isActive', true)
                ->orderBy('name')
                ->get(['id', 'name', 'type', 'district', 'address']);

            return response()->json(['schools' => $schools]);
        } catch (\Throwable $e) {
            Log::error('Error loading schools: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load schools list.'], 500);
        }
    }

    /**
     * Get Per-School Analytics leaderboard.
     * GET /api/admin/school-analytics
     */
    public function analytics()
    {
        try {
            // Cache the heavy analytics calculations for 5 minutes
            $data = Cache::remember('school_analytics_live', now()->addMinutes(5), function () {
                // Recalculate live analytics for all schools in 2 fast grouped queries
                School::recalculateAllAnalytics();

                // Reload after recalculation with fresh data, showing only active schools
                $schools = School::where('isActive', true)
                    ->where('totalStudents', '>', 0)
                    ->orderByDesc('averagePostTestScore')
                    ->orderByDesc('averageCompletionRate')
                    ->orderByDesc('totalStudents')
                    ->get();

                return [
                    'schools' => $schools,
                    'summary' => [
                        'totalSchools' => $schools->count(),
                        'totalStudents' => $schools->sum('totalStudents'),
                        'overallAvgPreTest' => round($schools->avg('averagePreTestScore'), 1),
                        'overallAvgPostTest' => round($schools->avg('averagePostTestScore'), 1),
                        'overallCompletionRate' => round($schools->avg('averageCompletionRate'), 1),
                    ]
                ];
            });

            return response()->json($data);
        } catch (\Throwable $e) {
            Log::error('Error loading school analytics: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to load school analytics.'], 500);
        }
    }

    /**
     * Get analytics for a single school.
     * GET /api/admin/school-analytics/{id}
     */
    public function show(int $id)
    {
        try {
            $school = School::findOrFail($id);
            $school->recalculateAnalytics();

            $users = User::where('school_id', $id)
                ->select('id', 'name', 'firstName', 'lastName', 'role', 'preTestScore', 'postTestScore', 'engagementPoints', 'created_at')
                ->orderByDesc('postTestScore')
                ->get();

            return response()->json([
                'school' => $school,
                'users' => $users,
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'School not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error loading school analytics for school {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to load school details.'], 500);
        }
    }

    /**
     * Create a new school.
     * POST /api/admin/schools
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:schools',
            'address' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'type' => 'required|string|in:elementary,highschool,college',
            'contactPerson' => 'nullable|string|max:255',
            'contactEmail' => 'nullable|email|max:255',
            'contactPhone' => 'nullable|string|max:20',
        ]);

        try {
            $school = School::create($request->only([
                'name', 'address', 'region', 'district', 'type',
                'contactPerson', 'contactEmail', 'contactPhone',
            ]));

            Cache::forget('school_analytics_live');

            return response()->json(['school' => $school], 201);
        } catch (\Throwable $e) {
            Log::error('Error creating school: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create school.'], 500);
        }
    }

    /**
     * Update an existing school.
     * PUT /api/admin/schools/{id}
     */
    public function update(Request $request, int $id)
    {
        try {
            $school = School::findOrFail($id);

            $request->validate([
                'name' => 'required|string|max:255|unique:schools,name,' . $id,
                'type' => 'required|string|in:elementary,highschool,college',
            ]);

            $school->update($request->only([
                'name', 'address', 'region', 'district', 'type',
                'contactPerson', 'contactEmail', 'contactPhone', 'isActive',
            ]));

            Cache::forget('school_analytics_live');

            return response()->json(['school' => $school]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'School not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error updating school {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to update school.'], 500);
        }
    }

    /**
     * Delete a school.
     * DELETE /api/admin/schools/{id}
     */
    public function destroy(int $id)
    {
        try {
            $school = School::findOrFail($id);

            DB::transaction(function () use ($school, $id) {
                // Nullify school_id for associated users before deleting
                User::where('school_id', $id)->update(['school_id' => null]);
                $school->delete();
            });

            Cache::forget('school_analytics_live');

            return response()->json(['success' => true]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'School not found.'], 404);
        } catch (\Throwable $e) {
            Log::error("Error deleting school {$id}: " . $e->getMessage());
            return response()->json(['error' => 'Failed to delete school.'], 500);
        }
    }
}
