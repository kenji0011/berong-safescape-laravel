<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KidsModule;
use App\Models\SafeScapeProgress;
use App\Models\AssessmentQuestion;
use App\Services\AdaptiveLearningService;

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
                
                if ($module->dayNumber == 4) {
                    $cardsCompleted = isset($sections['cardsCompleted']) && is_array($sections['cardsCompleted'])
                        ? count(array_filter($sections['cardsCompleted']))
                        : (!empty($sections['allCardsCompleted']) ? 5 : 0);
                        
                    $tfCompleted = isset($sections['tfAnswers']) && is_array($sections['tfAnswers'])
                        ? count(array_filter($sections['tfAnswers'], function($val) { return $val !== null && $val !== ''; }))
                        : (!empty($sections['finalCheckPassed']) ? 5 : 0);
                        
                    $percent = ($cardsCompleted + $tfCompleted) * 10;
                    $sectionProgress = $isCompleted ? 100 : min(max($percent, 0), 100);
                } else {
                    $moduleKeys = [
                        1 => ['videoWatched', 'section1Read', 'section2Read', 'section3Read', 'elementMixerCompleted', 'quizPassed'],
                        2 => ['videoWatched', 'soundDetectivePassed', 'networkMapViewed', 'rhythmGameCompleted', 'safeMeetingPlaceRead', 'quizPassed'],
                        3 => ['videoWatched', 'scannerInteracted', 'twoWaysOutRead', 'labyrinthEscaped', 'integrityPassed', 'quizPassed'],
                        5 => ['videoWatched', 'sdrCompleted', 'sdrTrapCompleted', 'hazardHuntCompleted', 'finalExamPassed'],
                    ];
                    
                    if (isset($moduleKeys[$module->dayNumber])) {
                        $keys = $moduleKeys[$module->dayNumber];
                        $completedSections = 0;
                        foreach ($keys as $key) {
                            if (isset($sections[$key]) && ($sections[$key] === true || $sections[$key] === 'true' || $sections[$key] === 1 || $sections[$key] === '1')) {
                                $completedSections++;
                            }
                        }
                        $totalSections = count($keys);
                        $sectionProgress = $isCompleted ? 100 : (int) round(($completedSections / $totalSections) * 100);
                    } else {
                        $completedSections = count(array_filter($sections, function($v, $k) {
                            return ($v === true || (is_numeric($v) && $v > 0) || (is_string($v) && strlen($v) > 0))
                                && strpos($k, 'quiz') === false;
                        }, ARRAY_FILTER_USE_BOTH));
                        $totalSections = 6;
                        $sectionProgress = $isCompleted ? 100 : (int) round(($completedSections / $totalSections) * 100);
                    }
                }
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
            'quizAnswers'   => 'nullable|array',
            'quizQuestions' => 'nullable|array',
        ]);

        // Extract module number from quizType (module_X_quiz)
        preg_match('/module_(\d+)_quiz/', $validated['quizType'], $matches);
        $moduleNum = isset($matches[1]) ? (int)$matches[1] : null;

        // Save to quiz_results table as a log
        \App\Models\QuizResult::create([
            'userId' => $user->id,
            'quizType' => $validated['quizType'],
            'score' => $validated['score'],
            'maxScore' => $validated['maxScore'],
        ]);

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
            if (!empty($validated['quizAnswers'])) {
                $sectionData['quizAnswers'] = $validated['quizAnswers'];
            }
            if (!empty($validated['quizQuestions'])) {
                $sectionData['quizQuestions'] = $validated['quizQuestions'];
            }
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

    /**
     * GET /api/kids/adaptive-quiz/{module}
     * Generate an AI-curated quiz based on the user's performance.
     */
    public function adaptiveQuiz(Request $request, $module)
    {
        $user = $request->user();
        $service = new AdaptiveLearningService();
        $difficulty = 'Medium'; // Default

        if ($module == 5) {
            // Final Exam: Predict based on age, grade, pre-assessment + Module 1-4 quiz scores
            $age = $user->age ?? 10;
            $preScore = $user->preTestScore ?? 0;
            
            $grade = 5;
            if (isset($user->gradeLevel) && preg_match('/(\d+)/', $user->gradeLevel, $matches)) {
                $grade = (int) $matches[1];
            } else {
                $grade = max(1, $age - 5);
            }

            $progressRecords = SafeScapeProgress::where('userId', $user->id)
                ->whereIn('moduleNum', [1, 2, 3, 4])
                ->get()
                ->keyBy('moduleNum');

            $scores = [];
            for ($i = 1; $i <= 4; $i++) {
                $p = $progressRecords->get($i);
                $score = 0;
                if ($p && $p->sectionData) {
                    $sd = json_decode($p->sectionData, true) ?? [];
                    $score = $sd['quizScore'] ?? 0;
                }
                $scores[] = $score;
            }

            $difficulty = $service->getFinalExamDifficulty($age, $grade, $preScore, $scores[0], $scores[1], $scores[2], $scores[3]);
        } else {
            // Modules 1-4: Predict based on pre-assessment score
            $preScore = $user->preTestScore ?? 0;
            $age = $user->age ?? 10;
            
            $grade = 5;
            if (isset($user->gradeLevel) && preg_match('/(\d+)/', $user->gradeLevel, $matches)) {
                $grade = (int) $matches[1];
            } else {
                $grade = max(1, $age - 5);
            }

            $difficulty = $service->getModuleDifficulty($age, $grade, $preScore);
        }

        // Fetch questions from database
        $categoryMap = [
            1 => 'Fire Basics',
            2 => 'Emergency Response',
            3 => 'Smoke Detector Knowledge',
            4 => 'Evacuation Planning',
            5 => 'Final Exam' // Fetch mix of questions for final exam
        ];

        $query = AssessmentQuestion::where('isActive', true)
            ->where('type', 'moduleQuiz')
            ->where('difficulty', $difficulty);
            
        if (isset($categoryMap[$module])) {
            $query->where('category', $categoryMap[$module]);
        }
        
        if ($module == 5) {
            $query->inRandomOrder()->limit(15);
        } else {
            $query->inRandomOrder()->limit(5);
        }

        $questions = $query->get()->map(function ($q) {
            // Randomize options unless it is a True/False question
            $originalOptions = $q->options;
            $correctOptionText = $originalOptions[$q->correctAnswer];
            $opts = $originalOptions;
            
            $isTrueFalse = count($opts) == 2 && in_array('True', $opts) && in_array('False', $opts);
            if (!$isTrueFalse) {
                shuffle($opts);
            } else {
                $opts = ['True', 'False'];
            }
            
            $newCorrectIndex = array_search($correctOptionText, $opts);
            
            return [
                'id' => $q->id,
                'text' => $q->question,
                'options' => $opts,
                'correctAnswer' => $newCorrectIndex,
                'explanation' => $q->explanation ?? 'Good job!',
                'difficulty' => $q->difficulty,
            ];
        });

        return response()->json([
            'predictedDifficulty' => $difficulty,
            'questions' => $questions
        ]);
    }
}
