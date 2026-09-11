<?php

namespace App\Http\Controllers;

use App\Models\AssessmentQuestion;
use App\Models\UserAnswer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AssessmentController extends Controller
{
    /**
     * GET /api/assessment/questions?role=kid|adult&type=preTest|postTest
     */
    public function index(Request $request)
    {
        try {
            $role = $request->query('role', 'adult');
            $type = $request->query('type', 'preTest');

            $query = AssessmentQuestion::where('isActive', true);

            // Filter by role
            if ($role) {
                $query->whereJsonContains('forRoles', $role);
            }

            // Filter by type
            if ($type) {
                $query->where('type', $type);
            }

            $questions = $query->orderBy('order', 'asc')->get()->map(function ($q) {
                return [
                    'id' => $q->id,
                    'question' => $q->question,
                    'options' => $q->options,
                    'correctAnswer' => $q->correctAnswer,
                    'category' => $q->category,
                    'explanation' => $q->explanation,
                ];
            });

            return response()->json(['questions' => $questions]);
        } catch (\Throwable $e) {
            Log::error('Error loading assessment questions: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to load assessment questions.'], 500);
        }
    }

    /**
     * POST /api/assessments/pre-test
     */
    public function submitPreTest(Request $request)
    {
        $request->validate([
            'answers' => 'required|array',
            'answers.*.questionId' => 'required|integer',
            'answers.*.selectedAnswer' => 'required|string|max:1000',
        ]);

        /** @var User $user */
        $user = Auth::user();
        $answers = $request->input('answers', []);
        $maxScore = count($answers);

        try {
            $result = DB::transaction(function () use ($user, $answers, $maxScore) {
                $questionIds = array_column($answers, 'questionId');
                $questions = AssessmentQuestion::whereIn('id', $questionIds)->get()->keyBy('id');

                $score = 0;
                $userAnswersToInsert = [];
                $now = now();

                foreach ($answers as $answer) {
                    $question = $questions->get($answer['questionId']);
                    $isCorrect = false;

                    if ($question) {
                        $isCorrect = (string)$question->correctAnswer === (string)$answer['selectedAnswer'];
                        if ($isCorrect) $score++;

                        $userAnswersToInsert[] = [
                            'userId' => $user->id,
                            'questionId' => $answer['questionId'],
                            'selectedAnswer' => $answer['selectedAnswer'],
                            'isCorrect' => $isCorrect,
                            'testType' => 'preTest',
                            'answeredAt' => $now,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }
                }

                if (!empty($userAnswersToInsert)) {
                    UserAnswer::insert($userAnswersToInsert);
                }

                $user->update(['preTestScore' => $score]);

                // Adaptive Learning: Update competency scores per category
                $this->updateCompetencyScores($user);

                return [
                    'score' => $score,
                    'maxScore' => $maxScore,
                    'percentage' => $maxScore > 0 ? round(($score / $maxScore) * 100) : 0,
                ];
            });

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('Error submitting pre-test: ' . $e->getMessage(), ['userId' => $user->id, 'exception' => $e]);
            return response()->json(['error' => 'Failed to submit pre-test. Please try again.'], 500);
        }
    }

    /**
     * POST /api/assessments/post-test
     */
    public function submitPostTest(Request $request)
    {
        $request->validate([
            'answers' => 'required|array',
            'answers.*.questionId' => 'required|integer',
            'answers.*.selectedAnswer' => 'required|string|max:1000',
        ]);

        /** @var User $user */
        $user = Auth::user();
        $answers = $request->input('answers', []);
        $maxScore = count($answers);

        try {
            $result = DB::transaction(function () use ($user, $answers, $maxScore) {
                $questionIds = array_column($answers, 'questionId');
                $questions = AssessmentQuestion::whereIn('id', $questionIds)->get()->keyBy('id');

                $score = 0;
                $userAnswersToInsert = [];
                $now = now();

                foreach ($answers as $answer) {
                    $question = $questions->get($answer['questionId']);
                    $isCorrect = false;

                    if ($question) {
                        $isCorrect = (string)$question->correctAnswer === (string)$answer['selectedAnswer'];
                        if ($isCorrect) $score++;

                        $userAnswersToInsert[] = [
                            'userId' => $user->id,
                            'questionId' => $answer['questionId'],
                            'selectedAnswer' => $answer['selectedAnswer'],
                            'isCorrect' => $isCorrect,
                            'testType' => 'postTest',
                            'answeredAt' => $now,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }
                }

                if (!empty($userAnswersToInsert)) {
                    UserAnswer::insert($userAnswersToInsert);
                }

                $user->update(['postTestScore' => $score]);

                // Adaptive Learning: Update competency scores per category
                $this->updateCompetencyScores($user);

                return [
                    'score' => $score,
                    'maxScore' => $maxScore,
                    'percentage' => $maxScore > 0 ? round(($score / $maxScore) * 100) : 0,
                ];
            });

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('Error submitting post-test: ' . $e->getMessage(), ['userId' => $user->id, 'exception' => $e]);
            return response()->json(['error' => 'Failed to submit post-test. Please try again.'], 500);
        }
    }

    /**
     * GET /api/assessments/post-test-eligibility
     */
    public function postTestEligibility(Request $request)
    {
        try {
            /** @var User $user */
            $user = Auth::user();
            $userRoles = array_filter(array_map('trim', explode(',', $user->role ?? 'guest')));
            $isLearner = in_array('kid', $userRoles) || in_array('adult', $userRoles);
            $isAdult = !$isLearner; // For frontend compatibility, treat non-learners (professionals/admins) as 'isAdult'
            
            // Count how many modules the user completed
            $modulesCompleted = \App\Models\SafeScapeProgress::where('userId', $user->id)->where('completed', true)->count();
            $engagementPoints = $user->engagementPoints ?? 0;
            
            $minModules = 5;
            $minPoints = 0; 
            
            $alreadyCompleted = !is_null($user->postTestScore);
            
            $postTestCompletedAt = null;
            if ($alreadyCompleted) {
                $postTestCompletedAt = UserAnswer::where('userId', $user->id)
                                    ->where('testType', 'postTest')
                                    ->latest('answeredAt')
                                    ->value('answeredAt');
            }
            
            $eligible = true;
            if (!$isLearner) $eligible = false;
            if (is_null($user->preTestScore)) $eligible = false;
            if ($isLearner && $modulesCompleted < $minModules) $eligible = false;
            
            return response()->json([
                'eligible' => $eligible,
                'alreadyCompleted' => $alreadyCompleted,
                'reason' => $eligible ? 'Eligible' : (!$isLearner ? 'Post-Test is not applicable for this profile type' : 'Requirements not met'),
                'requirements' => [
                    'minEngagementPoints' => $minPoints,
                    'minModulesCompleted' => $minModules,
                    'minQuizzesCompleted' => 0,
                ],
                'current' => [
                    'engagementPoints' => $engagementPoints,
                    'modulesCompleted' => $modulesCompleted,
                    'quizzesCompleted' => 0,
                ],
                'progress' => [
                    'engagementPoints' => min(100, max(0, ($engagementPoints / max(1, $minPoints)) * 100)),
                    'modulesCompleted' => min(100, max(0, ($modulesCompleted / max(1, $minModules)) * 100)),
                    'quizzesCompleted' => 0,
                ],
                'preTestScore' => $user->preTestScore,
                'postTestScore' => $user->postTestScore,
                'completedAt' => $postTestCompletedAt,
                'isAdult' => $isAdult,
            ]);
        } catch (\Throwable $e) {
            Log::error('Error checking post-test eligibility: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to check eligibility.'], 500);
        }
    }

    /**
     * GET /api/assessments/history
     */
    public function history(Request $request)
    {
        try {
            $user = Auth::user();

            $answers = UserAnswer::where('userId', $user->id)
                ->with('question:id,question,correctAnswer,explanation')
                ->orderBy('answeredAt', 'desc')
                ->get();

            return response()->json($answers);
        } catch (\Throwable $e) {
            Log::error('Error fetching assessment history: ' . $e->getMessage(), ['exception' => $e]);
            return response()->json(['error' => 'Failed to fetch assessment history.'], 500);
        }
    }

    /**
     * Compute per-category competency scores from all user answers.
     * Stores as JSON: {"Fire Prevention": 80, "Evacuation Planning": 60, ...}
     */
    private function updateCompetencyScores(User $user): void
    {
        $answers = UserAnswer::where('userId', $user->id)
            ->with('question:id,category')
            ->get();

        $categories = [];
        foreach ($answers as $answer) {
            if (!$answer->question || !$answer->question->category) continue;
            $cat = $answer->question->category;
            if (!isset($categories[$cat])) {
                $categories[$cat] = ['correct' => 0, 'total' => 0];
            }
            $categories[$cat]['total']++;
            if ($answer->isCorrect) {
                $categories[$cat]['correct']++;
            }
        }

        $scores = [];
        foreach ($categories as $cat => $data) {
            $scores[$cat] = $data['total'] > 0
                ? (int) round(($data['correct'] / $data['total']) * 100)
                : 0;
        }

        $user->update(['competency_scores' => $scores]);
    }
}
