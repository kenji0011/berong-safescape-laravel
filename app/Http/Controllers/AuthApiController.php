<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AssessmentQuestion;
use App\Models\UserAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthApiController extends Controller
{
    /**
     * Check if a username is available.
     * GET /api/auth/check-username?username=xxx
     */
    public function checkUsername(Request $request)
    {
        $username = $request->query('username');

        if (!$username) {
            return response()->json(['error' => 'Username is required'], 400);
        }

        $exists = User::where('username', $username)->exists();

        return response()->json(['available' => !$exists]);
    }

    /**
     * Validate credentials (username, email, password strength) before registration.
     * POST /api/auth/validate-credentials
     */
    public function validateCredentials(Request $request)
    {
        $errors = [];

        // Check username
        $username = $request->input('username');
        if (!$username || strlen($username) < 3 || strlen($username) > 20) {
            $errors['username'] = 'Username must be 3-20 characters';
        } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            $errors['username'] = 'Username can only contain letters, numbers, and underscores';
        } elseif (User::where('username', $username)->exists()) {
            $errors['username'] = 'Username is already taken';
        }

        // Check email
        $email = $request->input('email');
        if (!$email) {
            $errors['email'] = 'Email is required';
        } elseif (User::where('email', $email)->exists()) {
            $errors['email'] = 'Email is already registered';
        }

        // Check password
        $password = $request->input('password');
        if (!$password || strlen($password) < 8) {
            $errors['password'] = 'Password must be at least 8 characters';
        }

        if (!empty($errors)) {
            return response()->json(['valid' => false, 'errors' => $errors]);
        }

        return response()->json(['valid' => true]);
    }

    /**
     * Full registration with profile data and pre-test answers.
     * POST /api/auth/register
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|min:3|max:20|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'age' => 'required|integer|min:1|max:120',
            'gender' => 'required|string',
            'barangay' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first(),
            ], 422);
        }

        // Determine role based on age
        $age = $request->input('age');
        $role = $age < 18 ? 'kid' : 'adult';

        $name = $request->input('firstName') . ' ' . $request->input('lastName');
        if ($request->input('middleName')) {
            $name = $request->input('firstName') . ' ' . $request->input('middleName') . ' ' . $request->input('lastName');
        }

        $schoolName = $request->input('school') ?? $request->input('schoolOther');
        $schoolModel = null;
        if ($schoolName) {
            $schoolModel = \App\Models\School::firstOrCreate(
                ['name' => $schoolName],
                ['isActive' => true, 'type' => 'Other']
            );
        }

        $user = User::create([
            'username' => $request->input('username'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'name' => $name,
            'firstName' => $request->input('firstName'),
            'lastName' => $request->input('lastName'),
            'age' => $age,
            'role' => $role,
            'gender' => $request->input('gender'),
            'barangay' => $request->input('barangay'),
            'school' => $schoolName,
            'school_id' => $schoolModel ? $schoolModel->id : null,
            'occupation' => $request->input('occupation') ?? $request->input('occupationOther'),
            'profileCompleted' => true,
        ]);

        // Process pre-test answers
        $preTestAnswers = $request->input('preTestAnswers', []);
        $score = 0;
        $maxScore = count($preTestAnswers);

        foreach ($preTestAnswers as $questionId => $selectedAnswer) {
            $question = AssessmentQuestion::find($questionId);
            $isCorrect = false;

            if ($question) {
                $isCorrect = $question->correctAnswer == $selectedAnswer;
                if ($isCorrect) $score++;

                UserAnswer::create([
                    'userId' => $user->id,
                    'questionId' => $questionId,
                    'selectedAnswer' => $selectedAnswer,
                    'isCorrect' => $isCorrect,
                    'testType' => 'preTest',
                ]);
            }
        }

        // Update user's pre-test score
        $user->update(['preTestScore' => $score]);

        if ($schoolModel) {
            $schoolModel->recalculateAnalytics();
        }

        // Log in the user
        Auth::login($user);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'role' => $user->role,
                'age' => $user->age,
                'profileCompleted' => true,
            ],
            'preTestScore' => $score,
            'maxScore' => $maxScore,
        ]);
    }

    /**
     * Complete profile for existing users who skipped it.
     * POST /api/auth/complete-profile
     */
    public function completeProfile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'Unauthenticated'], 401);
        }

        $validator = Validator::make($request->all(), [
            'gender' => 'required|string',
            'barangay' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => 'Validation failed'], 422);
        }

        $schoolName = $request->input('school') ?? $request->input('schoolOther');
        $schoolModel = null;
        if ($schoolName) {
            $schoolModel = \App\Models\School::firstOrCreate(
                ['name' => $schoolName],
                ['isActive' => true, 'type' => 'Other']
            );
        }

        $user->update([
            'gender' => $request->input('gender'),
            'barangay' => $request->input('barangay'),
            'school' => $schoolName,
            'school_id' => $schoolModel ? $schoolModel->id : null,
            'occupation' => $request->input('occupation') ?? $request->input('occupationOther'),
            'profileCompleted' => true
        ]);

        $score = 0;
        $preTestAnswers = $request->input('preTestAnswers', []);
        $maxScore = count($preTestAnswers);

        foreach ($preTestAnswers as $questionId => $selectedAnswer) {
            $question = AssessmentQuestion::find($questionId);
            $isCorrect = false;

            if ($question) {
                $isCorrect = $question->correctAnswer == $selectedAnswer;
                if ($isCorrect) $score++;

                UserAnswer::updateOrCreate(
                    [
                        'userId' => $user->id,
                        'questionId' => $questionId,
                        'testType' => 'preTest'
                    ],
                    [
                        'selectedAnswer' => $selectedAnswer,
                        'isCorrect' => $isCorrect
                    ]
                );
            }
        }

        $user->update(['preTestScore' => $score]);

        if ($schoolModel) {
            $schoolModel->recalculateAnalytics();
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'role' => $user->role,
                'age' => $user->age,
                'profileCompleted' => true,
            ],
            'preTestScore' => $score,
            'maxScore' => $maxScore,
        ]);
    }

    /**
     * Get the authenticated user's assessment scores.
     * GET /api/auth/user-scores
     */
    public function userScores(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['success' => false, 'error' => 'Unauthenticated'], 401);
        }

        // Calculate max scores dynamically or assume 15
        $preTestMax = AssessmentQuestion::count(); // The seeder inserts 15 total questions. If you have category filters, adjust accordingly. We'll use 15 for now.
        if ($preTestMax > 15) $preTestMax = 15;
        if ($preTestMax == 0) $preTestMax = 15;
        
        // Find completion dates from UserAnswer logs
        $preTestCompletedAt = UserAnswer::where('userId', $user->id)
                                ->where('testType', 'preTest')
                                ->latest('answeredAt')
                                ->value('answeredAt');
                                
        $postTestCompletedAt = UserAnswer::where('userId', $user->id)
                                ->where('testType', 'postTest')
                                ->latest('answeredAt')
                                ->value('answeredAt');

        return response()->json([
            'success' => true,
            'scores' => [
                'preTestScore' => $user->preTestScore,
                'preTestMax' => $preTestMax,
                'preTestCompletedAt' => $preTestCompletedAt,
                'postTestScore' => $user->postTestScore,
                'postTestMax' => $preTestMax,
                'postTestCompletedAt' => $postTestCompletedAt,
                'engagementPoints' => $user->engagementPoints ?? 0,
            ]
        ]);
    }

    /**
     * Update the authenticated user's profile.
     * PUT /api/auth/update-profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'avatar' => 'nullable|string|max:50',
            'password' => 'required|string', // To confirm changes
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'error' => 'Incorrect password.'], 403);
        }

        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->has('avatar')) {
            $user->avatar = $request->avatar;
        }
        $user->save();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'role' => $user->role,
                'age' => $user->age,
                'profileCompleted' => $user->profileCompleted,
            ]
        ]);
    }

    /**
     * Update the authenticated user's avatar.
     * PUT /api/auth/update-avatar
     */
    public function updateAvatar(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'avatar' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        $user->avatar = $request->avatar;
        $user->save();

        return response()->json([
            'success' => true,
            'avatar' => $user->avatar
        ]);
    }

    /**
     * Change the authenticated user's password.
     * PUT /api/auth/change-password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'currentPassword' => 'required|string',
            'newPassword' => 'required|string|min:8',
            'confirmPassword' => 'required|same:newPassword',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        if (!Hash::check($request->currentPassword, $user->password)) {
            return response()->json(['success' => false, 'error' => 'Incorrect current password.'], 403);
        }

        $user->password = Hash::make($request->newPassword);
        $user->save();

        return response()->json(['success' => true]);
    }
}
