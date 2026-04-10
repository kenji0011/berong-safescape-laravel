<?php

namespace App\Http\Controllers;

use App\Models\AssessmentQuestion;
use App\Models\UserAnswer;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AssessmentController extends Controller
{
    /**
     * GET /api/assessment/questions?role=kid|adult&type=preTest|postTest
     */
    public function index(Request $request)
    {
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
    }

    /**
     * POST /api/assessments/pre-test
     */
    public function submitPreTest(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $answers = $request->input('answers', []);
        $score = 0;
        $maxScore = count($answers);

        foreach ($answers as $answer) {
            $question = AssessmentQuestion::find($answer['questionId']);
            $isCorrect = false;

            if ($question) {
                $isCorrect = $question->correctAnswer == $answer['selectedAnswer'];
                if ($isCorrect) $score++;

                UserAnswer::create([
                    'userId' => $user->id,
                    'questionId' => $answer['questionId'],
                    'selectedAnswer' => $answer['selectedAnswer'],
                    'isCorrect' => $isCorrect,
                    'testType' => 'preTest',
                ]);
            }
        }

        $user->update(['preTestScore' => $score]);

        return response()->json([
            'score' => $score,
            'maxScore' => $maxScore,
            'percentage' => $maxScore > 0 ? round(($score / $maxScore) * 100) : 0,
        ]);
    }

    /**
     * POST /api/assessments/post-test
     */
    public function submitPostTest(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        $answers = $request->input('answers', []);
        $score = 0;
        $maxScore = count($answers);

        foreach ($answers as $answer) {
            $question = AssessmentQuestion::find($answer['questionId']);
            $isCorrect = false;

            if ($question) {
                $isCorrect = $question->correctAnswer == $answer['selectedAnswer'];
                if ($isCorrect) $score++;

                UserAnswer::create([
                    'userId' => $user->id,
                    'questionId' => $answer['questionId'],
                    'selectedAnswer' => $answer['selectedAnswer'],
                    'isCorrect' => $isCorrect,
                    'testType' => 'postTest',
                ]);
            }
        }

        $user->update(['postTestScore' => $score]);

        return response()->json([
            'score' => $score,
            'maxScore' => $maxScore,
            'percentage' => $maxScore > 0 ? round(($score / $maxScore) * 100) : 0,
        ]);
    }

    /**
     * GET /api/assessments/post-test-eligibility
     */
    public function postTestEligibility(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();
        
        $isAdult = $user->age >= 18 && $user->role !== 'kid';
        
        // Count how many modules the kid completed
        $modulesCompleted = \App\Models\UserProgress::where('userId', $user->id)->where('isCompleted', true)->count();
        $engagementPoints = $user->engagementPoints ?? 0;
        
        $minModules = 3;
        $minPoints = 50; 
        
        $alreadyCompleted = !is_null($user->postTestScore);
        
        $postTestCompletedAt = null;
        if ($alreadyCompleted) {
            $postTestCompletedAt = UserAnswer::where('userId', $user->id)
                                ->where('testType', 'postTest')
                                ->latest('created_at')
                                ->value('created_at');
        }
        
        $eligible = true;
        if (is_null($user->preTestScore)) $eligible = false;
        if (!$isAdult && $modulesCompleted < $minModules) $eligible = false;
        if ($engagementPoints < $minPoints) $eligible = false;
        
        return response()->json([
            'eligible' => $eligible,
            'alreadyCompleted' => $alreadyCompleted,
            'reason' => $eligible ? 'Eligible' : 'Requirements not met',
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
    }

    /**
     * GET /api/assessments/history
     */
    public function history(Request $request)
    {
        $user = Auth::user();

        $answers = UserAnswer::where('userId', $user->id)
            ->with('question:id,question,correctAnswer,explanation')
            ->orderBy('answeredAt', 'desc')
            ->get();

        return response()->json($answers);
    }

    // Resource stubs for admin CRUD
    public function store(Request $request) { }
    public function show(string $id) { }
    public function update(Request $request, string $id) { }
    public function destroy(string $id) { }
}
