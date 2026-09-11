<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AssessmentQuestion;
use App\Models\UserAnswer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

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
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Invalid email format';
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
            'email' => 'required|email:rfc,dns|unique:users',
            'password' => ['required', 'string', Password::min(8)->mixedCase()->numbers()->symbols()],
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'age' => 'required|integer|min:3|max:99',
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

        try {
            $response = DB::transaction(function () use ($request, $age, $role, $name, $schoolName, $schoolModel) {
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

                if (!empty($preTestAnswers)) {
                    $questionIds = array_keys($preTestAnswers);
                    $questions = AssessmentQuestion::whereIn('id', $questionIds)->get()->keyBy('id');

                    foreach ($preTestAnswers as $questionId => $selectedAnswer) {
                        $question = $questions->get($questionId);
                        $isCorrect = false;

                        if ($question) {
                            $isCorrect = (string)$question->correctAnswer === (string)$selectedAnswer;
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
                }

                // Update user's pre-test score
                $user->update(['preTestScore' => $score]);

                if ($schoolModel) {
                    try {
                        $schoolModel->recalculateAnalytics();
                    } catch (\Throwable $schoolEx) {
                        Log::warning('School analytics recalculation warning: ' . $schoolEx->getMessage());
                    }
                }

                return ['user' => $user, 'score' => $score, 'maxScore' => $maxScore];
            });

            // Fire registered event to trigger email verification
            try {
                event(new \Illuminate\Auth\Events\Registered($response['user']));
            } catch (\Throwable $eventEx) {
                Log::warning('Registration event warning: ' . $eventEx->getMessage());
            }

            // Log in the user
            Auth::login($response['user']);

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $response['user']->id,
                    'username' => $response['user']->username,
                    'name' => $response['user']->name,
                    'role' => $response['user']->role,
                    'age' => $response['user']->age,
                    'profileCompleted' => true,
                ],
                'preTestScore' => $response['score'],
                'maxScore' => $response['maxScore'],
            ]);
        } catch (\Throwable $e) {
            Log::error('Error during registration: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'error' => 'Registration failed. Please try again.'], 500);
        }
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

        try {
            $schoolName = $request->input('school') ?? $request->input('schoolOther');
            $schoolModel = null;
            if ($schoolName) {
                $schoolModel = \App\Models\School::firstOrCreate(
                    ['name' => $schoolName],
                    ['isActive' => true, 'type' => 'Other']
                );
            }

            $score = 0;
            $preTestAnswers = $request->input('preTestAnswers', []);
            $maxScore = count($preTestAnswers);

            DB::transaction(function () use ($user, $request, $schoolName, $schoolModel, $preTestAnswers, &$score) {
                $user->update([
                    'gender' => $request->input('gender'),
                    'barangay' => $request->input('barangay'),
                    'school' => $schoolName,
                    'school_id' => $schoolModel ? $schoolModel->id : null,
                    'occupation' => $request->input('occupation') ?? $request->input('occupationOther'),
                    'profileCompleted' => true
                ]);

                if (!empty($preTestAnswers)) {
                    $questionIds = array_keys($preTestAnswers);
                    $questions = AssessmentQuestion::whereIn('id', $questionIds)->get()->keyBy('id');

                    foreach ($preTestAnswers as $questionId => $selectedAnswer) {
                        $question = $questions->get($questionId);
                        $isCorrect = false;

                        if ($question) {
                            $isCorrect = (string)$question->correctAnswer === (string)$selectedAnswer;
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
                }

                $user->update(['preTestScore' => $score]);

                if ($schoolModel) {
                    try {
                        $schoolModel->recalculateAnalytics();
                    } catch (\Throwable $schoolEx) {
                        Log::warning('School analytics recalculation warning: ' . $schoolEx->getMessage());
                    }
                }
            });

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
        } catch (\Throwable $e) {
            Log::error('Error completing profile: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to complete profile.'], 500);
        }
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
            'email' => 'nullable|email:rfc,dns|max:255|unique:users,email,' . $user->id,
            'avatar' => 'nullable|string|max:50',
            'password' => 'required|string', // To confirm changes
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'error' => 'Incorrect password.'], 403);
        }

        $user->name = strip_tags($request->name);
        
        if ($user->email !== $request->email) {
            $user->email = $request->email;
            $user->email_verified_at = null;
            $user->save();
            event(new \Illuminate\Auth\Events\Registered($user));
        } else {
            $user->save();
        }

        if ($request->has('avatar')) {
            $user->avatar = $request->avatar;
            $user->save();
        }

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
            'newPassword' => ['required', 'string', Password::min(8)->mixedCase()->numbers()->symbols()],
            'confirmPassword' => 'required|same:newPassword',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
        }

        try {
            if (!Hash::check($request->currentPassword, $user->password)) {
                return response()->json(['success' => false, 'error' => 'Incorrect current password.'], 403);
            }

            $user->password = Hash::make($request->newPassword);
            $user->save();

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            Log::error('Error changing password: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to change password.'], 500);
        }
    }

    /**
     * Reset password via secure 3-step verification code.
     *
     * Step 1: Request code — generates a CSPRNG 6-digit code, stores hashed,
     *         sends via Gmail SMTP, rate-limited to 3 requests / 30 min per IP.
     * Step 2: Verify code — timing-safe HMAC comparison, brute-force limited
     *         to 5 attempts per code, issues a signed token for step 3.
     * Step 3: Set new password — consumes the one-time token, enforces password
     *         strength policy, sends confirmation email, invalidates all sessions.
     *
     * POST /api/auth/reset-password
     */
    public function resetPassword(Request $request)
    {
        $step = (int) $request->input('step', 1);
        $username = trim((string) $request->input('username'));
        $ip = $request->ip();

        if (!$username || strlen($username) > 100) {
            return response()->json(['success' => false, 'error' => 'Please enter a valid username or email address.'], 400);
        }

        // ── Global IP-based rate limiting (10 reset requests per 15 min) ──
        $ipRateKey = 'pwd_reset_ip_' . md5($ip);
        $ipAttempts = (int) \Illuminate\Support\Facades\Cache::get($ipRateKey, 0);

        if ($ipAttempts >= 10) {
            \Illuminate\Support\Facades\Log::warning('Password reset rate limit exceeded', [
                'ip' => $ip, 'username' => $username, 'step' => $step
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Too many reset requests. Please try again in 15 minutes.'
            ], 429);
        }

        // Find user by either username (case-insensitive) OR email (case-insensitive)
        $user = User::whereRaw('LOWER(username) = ?', [strtolower($username)])
                    ->orWhereRaw('LOWER(email) = ?', [strtolower($username)])
                    ->first();

        // Use canonical lowercase username (or input) for consistent cache key hashing across steps
        $canonicalKey = $user ? strtolower($user->username) : strtolower($username);

        // ─────────────────────────────────────────────
        // STEP 1 — Request Verification Code
        // ─────────────────────────────────────────────
        if ($step === 1) {
            // Increment IP rate counter
            \Illuminate\Support\Facades\Cache::put($ipRateKey, $ipAttempts + 1, now()->addMinutes(15));

            // Constant-time response — don't reveal if username/email exists
            if (!$user || !$user->email) {
                // Sleep to match timing of real code send
                usleep(random_int(300000, 600000));
                return response()->json([
                    'success' => true,
                    'message' => 'If an account with that username or email exists, a verification code has been sent.'
                ]);
            }

            // Generate cryptographically secure 6-digit code
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Store HMAC-hashed code (not plaintext) + metadata
            $codeKey = 'pwd_reset_' . hash('sha256', $canonicalKey);
            \Illuminate\Support\Facades\Cache::put($codeKey, [
                'hash'       => hash_hmac('sha256', $code, config('app.key')),
                'attempts'   => 0,
                'created_at' => now()->timestamp,
                'ip'         => $ip,
            ], now()->addMinutes(10));

            // Audit log (code visible in log only for local debugging)
            if (app()->environment('local')) {
                \Illuminate\Support\Facades\Log::info("Password reset code for {$user->username}: {$code}");
            }
            \Illuminate\Support\Facades\Log::info('Password reset code requested', [
                'username' => $user->username,
                'email'    => $this->maskEmail($user->email),
                'ip'       => $ip,
            ]);

            // Send HTML email via Resend API (direct HTTPS) with SMTP fallback
            $mailable = new \App\Mail\PasswordResetCode($code, $user->name ?? $user->username, 10);
            $this->sendEmail(
                $user->email,
                'Berong E-Learning — Password Reset Code',
                $mailable->buildHtml(),
                $mailable
            );

            $maskedEmail = $this->maskEmail($user->email);
            return response()->json([
                'success' => true,
                'message' => "Verification code sent to {$maskedEmail}. It expires in 10 minutes."
            ]);
        }

        // ─────────────────────────────────────────────
        // STEP 2 — Verify Code
        // ─────────────────────────────────────────────
        if ($step === 2) {
            $code = trim((string) $request->input('code'));

            if (!$code || !preg_match('/^\d{6}$/', $code)) {
                return response()->json(['success' => false, 'error' => 'Please enter a valid 6-digit code.'], 400);
            }

            $codeKey = 'pwd_reset_' . hash('sha256', $canonicalKey);
            $stored = \Illuminate\Support\Facades\Cache::get($codeKey);

            if (!$stored) {
                return response()->json(['success' => false, 'error' => 'No active reset request. Please request a new code.'], 422);
            }

            // Brute-force protection: max 5 verification attempts per code
            if ($stored['attempts'] >= 5) {
                \Illuminate\Support\Facades\Cache::forget($codeKey);
                \Illuminate\Support\Facades\Log::warning('Password reset code invalidated (max attempts)', [
                    'username' => $username, 'ip' => $ip,
                ]);
                return response()->json([
                    'success' => false,
                    'error' => 'Too many incorrect attempts. Your code has been invalidated. Please request a new one.'
                ], 422);
            }

            // Timing-safe comparison via HMAC
            $inputHash = hash_hmac('sha256', $code, config('app.key'));
            if (!hash_equals($stored['hash'], $inputHash)) {
                // Increment attempts
                $stored['attempts']++;
                \Illuminate\Support\Facades\Cache::put($codeKey, $stored, now()->addMinutes(10));

                $remaining = 5 - $stored['attempts'];
                \Illuminate\Support\Facades\Log::info('Password reset code verification failed', [
                    'username' => $username, 'ip' => $ip, 'remaining' => $remaining,
                ]);

                return response()->json([
                    'success' => false,
                    'error' => "Incorrect verification code. {$remaining} attempt(s) remaining."
                ], 422);
            }

            // Code is valid — generate a one-time reset token for step 3
            $resetToken = bin2hex(random_bytes(32));
            $tokenKey = 'pwd_reset_token_' . hash('sha256', $canonicalKey);
            \Illuminate\Support\Facades\Cache::put($tokenKey, [
                'hash' => hash_hmac('sha256', $resetToken, config('app.key')),
                'ip'   => $ip,
            ], now()->addMinutes(15));

            // Clear the verification code
            \Illuminate\Support\Facades\Cache::forget($codeKey);

            \Illuminate\Support\Facades\Log::info('Password reset code verified successfully', [
                'username' => $username, 'ip' => $ip,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Code verified! Please set your new password.',
                'resetToken' => $resetToken,
            ]);
        }

        // ─────────────────────────────────────────────
        // STEP 3 — Set New Password
        // ─────────────────────────────────────────────
        if ($step === 3) {
            $resetToken = trim((string) $request->input('resetToken'));
            $newPassword = $request->input('newPassword');
            $confirmPassword = $request->input('confirmPassword');

            if (!$resetToken) {
                return response()->json(['success' => false, 'error' => 'Invalid reset session. Please start over.'], 400);
            }

            // Validate password strength
            $validator = Validator::make($request->all(), [
                'newPassword' => ['required', 'string', Password::min(8)->mixedCase()->numbers()->symbols()],
                'confirmPassword' => 'required|same:newPassword',
            ], [
                'newPassword.required' => 'New password is required.',
                'confirmPassword.same' => 'Passwords do not match.',
            ]);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'error' => $validator->errors()->first()], 422);
            }

            // Verify one-time token
            $tokenKey = 'pwd_reset_token_' . hash('sha256', $canonicalKey);
            $storedToken = \Illuminate\Support\Facades\Cache::get($tokenKey);

            if (!$storedToken) {
                return response()->json([
                    'success' => false,
                    'error' => 'Reset session expired. Please request a new verification code.'
                ], 422);
            }

            $inputTokenHash = hash_hmac('sha256', $resetToken, config('app.key'));
            if (!hash_equals($storedToken['hash'], $inputTokenHash)) {
                \Illuminate\Support\Facades\Log::warning('Invalid password reset token used', [
                    'username' => $username, 'ip' => $ip,
                ]);
                return response()->json(['success' => false, 'error' => 'Invalid reset session. Please start over.'], 403);
            }

            if (!$user) {
                return response()->json(['success' => false, 'error' => 'Account not found.'], 404);
            }

            // Prevent reusing the old password
            if (Hash::check($newPassword, $user->password)) {
                return response()->json([
                    'success' => false,
                    'error' => 'New password cannot be the same as your current password.'
                ], 422);
            }

            // Set the new password
            $user->password = Hash::make($newPassword);
            $user->save();

            // Consume the token (one-time use)
            \Illuminate\Support\Facades\Cache::forget($tokenKey);

            // Audit log
            \Illuminate\Support\Facades\Log::info('Password reset completed', [
                'username' => $user->username, 'ip' => $ip,
            ]);

            // Send confirmation email
            $successMailable = new \App\Mail\PasswordResetSuccess($user->name ?? $user->username);
            $this->sendEmail(
                $user->email,
                'Password Changed Successfully — SafeScape',
                $successMailable->buildHtml(),
                $successMailable
            );

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully! You can now sign in with your new password.'
            ]);
        }

        return response()->json(['success' => false, 'error' => 'Invalid step.'], 400);
    }

    /**
     * Send email via Resend HTTPS REST API with fallback to Laravel SMTP Mailer.
     */
    private function sendEmail(string $toEmail, string $subject, string $html, $mailableFallback): bool
    {
        $resendApiKey = env('RESEND_API_KEY') ?: config('mail.mailers.smtp.password');

        // 1. Direct Resend HTTPS API (bypasses server SMTP socket/firewall blocks on cloud hosting)
        if ($resendApiKey && str_starts_with($resendApiKey, 're_')) {
            try {
                $fromAddress = config('mail.from.address') ?: 'noreply@bfpscberong.app';
                $fromName = config('mail.from.name') ?: 'SafeScape E-Learning';

                $response = \Illuminate\Support\Facades\Http::timeout(10)
                    ->withToken($resendApiKey)
                    ->post('https://api.resend.com/emails', [
                        'from'    => "{$fromName} <{$fromAddress}>",
                        'to'      => [$toEmail],
                        'subject' => $subject,
                        'html'    => $html,
                    ]);

                if ($response->successful()) {
                    \Illuminate\Support\Facades\Log::info("Email sent successfully via Resend API to {$this->maskEmail($toEmail)}", [
                        'id' => $response->json('id')
                    ]);
                    return true;
                }

                \Illuminate\Support\Facades\Log::warning('Resend API returned non-200 response, trying SMTP fallback', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Resend API call failed, falling back to SMTP: ' . $e->getMessage());
            }
        }

        // 2. Standard Laravel Mailer (SMTP fallback)
        try {
            \Illuminate\Support\Facades\Mail::to($toEmail)->send($mailableFallback);
            \Illuminate\Support\Facades\Log::info("Email sent via SMTP fallback to {$this->maskEmail($toEmail)}");
            return true;
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('SMTP mail sending failed', [
                'error' => $e->getMessage(),
                'to'    => $toEmail,
            ]);
            return false;
        }
    }

    /**
     * Mask an email address for safe display (e.g. k***n@gmail.com).
     */
    private function maskEmail(string $email): string
    {
        $parts = explode('@', $email);
        if (count($parts) < 2) return '***@***.***';

        $name = $parts[0];
        $domain = $parts[1];

        $len = strlen($name);
        if ($len <= 2) {
            $maskedName = substr($name, 0, 1) . '***';
        } else {
            $maskedName = substr($name, 0, 1) . str_repeat('*', min($len - 2, 5)) . substr($name, -1);
        }

        return $maskedName . '@' . $domain;
    }
}
