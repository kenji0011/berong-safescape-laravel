<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KidsModule;
use App\Models\SafeScapeProgress;

class KidsController extends Controller
{
    /**
     * GET /api/kids/modules
     * Returns all active modules with per-user locked/completed/progress status.
     */
    public function modules(Request $request)
    {
        $user = $request->user();
        $modules = KidsModule::where('isActive', true)->orderBy('dayNumber')->get();

        // Get all progress records keyed by moduleNum
        $progressRecords = SafeScapeProgress::where('userId', $user->id)
            ->get()
            ->keyBy('moduleNum');

        // Adaptive Learning mapping: Module dayNumber -> Assessment Category
        $categoryMapping = [
            1 => 'General Safety Awareness',
            2 => 'Emergency Response',
            3 => 'Smoke Detector Knowledge',
            4 => 'Evacuation Planning',
            5 => 'Fire Prevention'
        ];
        $scores = $user->competency_scores ?? [];

        return response()->json($modules->map(function ($module) use ($progressRecords, $categoryMapping, $scores) {
            $progress = $progressRecords->get($module->dayNumber);
            $isCompleted = $progress && $progress->completed;

            // Module 1 is always unlocked; later ones require the previous to be completed
            $isLocked = false;
            if ($module->dayNumber > 1) {
                $prevProgress = $progressRecords->get($module->dayNumber - 1);
                $isLocked = !($prevProgress && $prevProgress->completed);
            }

            // Calculate section progress from sectionData JSON
            $sectionProgress = 0;
            if ($progress && $progress->sectionData) {
                $sections = json_decode($progress->sectionData, true) ?? [];
                $completedSections = count(array_filter($sections, fn($v) => $v === true));
                $totalSections = max(count($sections), 1);
                $sectionProgress = $isCompleted ? 100 : (int) round(($completedSections / $totalSections) * 100);
            }

            // Adaptive Learning logic
            $recommendedAction = null;
            $cat = $categoryMapping[$module->dayNumber] ?? null;
            if ($cat && isset($scores[$cat])) {
                if ($scores[$cat] <= 50) {
                    $recommendedAction = 'Priority Review';
                } elseif ($scores[$cat] < 75) {
                    $recommendedAction = 'Needs Practice';
                } elseif ($scores[$cat] >= 90) {
                    $recommendedAction = 'Mastered';
                }
            }

            return [
                'id'          => $module->id,
                'title'       => $module->title,
                'description' => $module->description,
                'dayNumber'   => $module->dayNumber,
                'content'     => $module->content,
                'isActive'    => $module->isActive,
                'isCompleted' => $isCompleted,
                'isLocked'    => $isLocked,
                'progress'    => $isCompleted ? 100 : $sectionProgress,
                'sections'    => [],
                'recommendedAction' => $recommendedAction,
            ];
        }));
    }

    /**
     * GET /api/kids/modules/{id}
     */
    public function showModule(Request $request, $id)
    {
        $user = $request->user();
        $module = KidsModule::where('isActive', true)->where('id', $id)->firstOrFail();
        $progress = SafeScapeProgress::where('userId', $user->id)
            ->where('moduleNum', $module->dayNumber)
            ->first();

        return response()->json([
            'id'          => $module->id,
            'title'       => $module->title,
            'description' => $module->description,
            'dayNumber'   => $module->dayNumber,
            'content'     => $module->content,
            'isCompleted' => $progress && $progress->completed,
            'isLocked'    => false,
            'progress'    => ($progress && $progress->completed) ? 100 : 0,
            'sections'    => [],
        ]);
    }

    /**
     * POST /api/kids/progress
     * Mark a module as completed (legacy compatibility endpoint).
     */
    public function updateProgress(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'moduleId'  => 'required|integer|exists:kids_modules,id',
            'completed' => 'required|boolean',
            'score'     => 'nullable|integer',
        ]);

        $module = KidsModule::findOrFail($validated['moduleId']);

        $existing = SafeScapeProgress::where('userId', $user->id)
            ->where('moduleNum', $module->dayNumber)
            ->first();

        $isCompleted = $validated['completed'];
        if ($existing && $existing->completed) {
            $isCompleted = true; // Never un-complete a module
        }

        SafeScapeProgress::updateOrCreate(
            ['userId' => $user->id, 'moduleNum' => $module->dayNumber],
            [
                'sectionData'  => json_encode([]),
                'completed'    => $isCompleted,
                'completedAt'  => $isCompleted ? ($existing->completedAt ?? now()) : null,
            ]
        );

        return response()->json(['success' => true, 'message' => 'Progress updated.']);
    }

    /**
     * GET /api/kids/safescape
     * Returns the current user's full SafeScape progress summary.
     */
    public function safeScapeProgress(Request $request)
    {
        $user = $request->user();
        $records = SafeScapeProgress::where('userId', $user->id)->get();

        $total = KidsModule::where('isActive', true)->count();
        $completedCount = $records->where('completed', true)->count();

        return response()->json([
            'completedModules' => $records->where('completed', true)->pluck('moduleNum')->values(),
            'sectionData'      => $records->mapWithKeys(fn ($r) => [
                "module{$r->moduleNum}" => json_decode($r->sectionData, true) ?? [],
            ]),
            'totalProgress'    => $total > 0 ? (int) round(($completedCount / $total) * 100) : 0,
        ]);
    }

    /**
     * POST /api/kids/safescape
     * Upsert the current user's progress for a specific module.
     * Accepts: { moduleNum, sectionData, completed }
     */
    public function updateSafeScape(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'moduleNum'   => 'required|integer|min:1',
            'sectionData' => 'nullable|array',
            'completed'   => 'required|boolean',
        ]);

        $existing = SafeScapeProgress::where('userId', $user->id)
            ->where('moduleNum', $validated['moduleNum'])
            ->first();

        $isCompleted = $validated['completed'];
        if ($existing && $existing->completed) {
            $isCompleted = true; // Never un-complete a module
        }

        SafeScapeProgress::updateOrCreate(
            ['userId' => $user->id, 'moduleNum' => $validated['moduleNum']],
            [
                'sectionData' => json_encode($validated['sectionData'] ?? []),
                'completed'   => $isCompleted,
                'completedAt' => $isCompleted ? ($existing->completedAt ?? now()) : null,
            ]
        );

        return response()->json(['success' => true]);
    }
}
