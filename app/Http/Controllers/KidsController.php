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
                // Count any truthy value (true, number > 0, non-empty string)
                $completedSections = count(array_filter($sections, function($v) {
                    return $v === true || (is_numeric($v) && $v > 0) || (is_string($v) && strlen($v) > 0);
                }));
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

        // Merge section data instead of overwriting to prevent progress loss
        $sectionData = [];
        if ($existing && $existing->sectionData) {
            $sectionData = json_decode($existing->sectionData, true) ?? [];
        }
        $newSectionData = array_merge($sectionData, $validated['sectionData'] ?? []);

        $isCompleted = $validated['completed'];
        if ($existing && $existing->completed) {
            $isCompleted = true; // Never un-complete a module
        }

        SafeScapeProgress::updateOrCreate(
            ['userId' => $user->id, 'moduleNum' => $validated['moduleNum']],
            [
                'sectionData' => json_encode($newSectionData),
                'completed'   => $isCompleted,
                'completedAt' => $isCompleted ? (($existing && $existing->completedAt) ? $existing->completedAt : now()) : null,
            ]
        );

        return response()->json(['success' => true]);
    }

    /**
     * POST /api/kids/quiz
     * Submit a quiz result and sync with module progress.
     */
    public function submitQuiz(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'quizType' => 'required|string', // e.g. "module_2_quiz"
            'score'    => 'required|integer',
            'maxScore' => 'required|integer',
        ]);

        // Extract module number from quizType (module_X_quiz)
        preg_match('/module_(\d+)_quiz/', $validated['quizType'], $matches);
        $moduleNum = isset($matches[1]) ? (int)$matches[1] : null;

        if ($moduleNum) {
            $passed = true; // Any quiz submission is a pass/completion

            // Update SafeScape progress automatically
            $existing = SafeScapeProgress::where('userId', $user->id)
                ->where('moduleNum', $moduleNum)
                ->first();

            $sectionData = [];
            if ($existing && $existing->sectionData) {
                $sectionData = json_decode($existing->sectionData, true) ?? [];
            }
            
            $sectionData['quizScore'] = $validated['score'];
            $sectionData['quizPassed'] = $passed;
            if ($moduleNum === 4) {
                $sectionData['finalCheckPassed'] = true;
            }

            $isCompleted = $passed;
            if ($existing && $existing->completed) {
                $isCompleted = true;
            }

            SafeScapeProgress::updateOrCreate(
                ['userId' => $user->id, 'moduleNum' => $moduleNum],
                [
                    'sectionData' => json_encode($sectionData),
                    'completed'   => $isCompleted,
                    'completedAt' => $isCompleted ? (($existing && $existing->completedAt) ? $existing->completedAt : now()) : null,
                ]
            );
        }

        return response()->json(['success' => true, 'passed' => $passed ?? false]);
    }
}
