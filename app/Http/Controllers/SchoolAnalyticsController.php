<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;

class SchoolAnalyticsController extends Controller
{
    /**
     * Get all schools (for dropdowns etc.)
     * GET /api/schools
     */
    public function index()
    {
        $schools = School::where('isActive', true)
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'district', 'address']);

        return response()->json(['schools' => $schools]);
    }

    /**
     * Get Per-School Analytics leaderboard.
     * GET /api/admin/school-analytics
     */
    public function analytics()
    {
        // Cache the heavy analytics calculations for 5 minutes
        $data = \Illuminate\Support\Facades\Cache::remember('school_analytics_live', now()->addMinutes(5), function () {
            $schools = School::where('isActive', true)
                ->withCount(['users'])
                ->get();

            // Recalculate live analytics for each school
            foreach ($schools as $school) {
                $school->recalculateAnalytics();
            }

            // Reload after recalculation with fresh data
            $schools = School::where('isActive', true)
                ->orderByDesc('averagePostTestScore')
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
    }

    /**
     * Get analytics for a single school.
     * GET /api/admin/school-analytics/{id}
     */
    public function show(int $id)
    {
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

        $school = School::create($request->only([
            'name', 'address', 'region', 'district', 'type',
            'contactPerson', 'contactEmail', 'contactPhone',
        ]));

        return response()->json(['school' => $school], 201);
    }

    /**
     * Update an existing school.
     * PUT /api/admin/schools/{id}
     */
    public function update(Request $request, int $id)
    {
        $school = School::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:schools,name,' . $id,
            'type' => 'required|string|in:elementary,highschool,college',
        ]);

        $school->update($request->only([
            'name', 'address', 'region', 'district', 'type',
            'contactPerson', 'contactEmail', 'contactPhone', 'isActive',
        ]));

        return response()->json(['school' => $school]);
    }

    /**
     * Delete a school.
     * DELETE /api/admin/schools/{id}
     */
    public function destroy(int $id)
    {
        $school = School::findOrFail($id);
        // Nullify school_id for associated users before deleting
        User::where('school_id', $id)->update(['school_id' => null]);
        $school->delete();

        return response()->json(['success' => true]);
    }
}
