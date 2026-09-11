<?php

namespace App\Services;

use App\Models\User;
use App\Models\AssessmentQuestion;
use App\Models\EngagementLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class AdminAnalyticsService
{
    /**
     * Fetch high-level platform summary statistics.
     */
    public function getSummaryAnalytics(): array
    {
        $todayStart = now()->startOfDay();
        $weekAgo = now()->subDays(7);

        // Fetch all basic user aggregates in one single fast query
        $stats = User::where('role', '!=', 'admin')
            ->selectRaw('
                COUNT(*) as total_users,
                SUM(CASE WHEN "profileCompleted" = true THEN 1 ELSE 0 END) as profiles_completed,
                SUM(CASE WHEN "preTestScore" IS NOT NULL THEN 1 ELSE 0 END) as pre_tests_taken,
                SUM(CASE WHEN "postTestScore" IS NOT NULL THEN 1 ELSE 0 END) as post_tests_taken,
                AVG("preTestScore") as avg_pre_test,
                AVG("postTestScore") as avg_post_test,
                SUM("engagementPoints") as total_engagement,
                AVG("engagementPoints") as avg_engagement
            ')
            ->first();

        $activeToday = EngagementLog::where('loggedAt', '>=', $todayStart)->distinct('userId')->count('userId');
        $activeThisWeek = EngagementLog::where('loggedAt', '>=', $weekAgo)->distinct('userId')->count('userId');

        // Calculate average improvement directly in the database
        $avgImprovementStats = User::where('role', '!=', 'admin')
            ->whereNotNull('preTestScore')
            ->whereNotNull('postTestScore')
            ->selectRaw('AVG("postTestScore" - "preTestScore") as avg_improvement')
            ->first();
            
        $avgImprovement = (float) ($avgImprovementStats->avg_improvement ?? 0);

        return [
            'totalUsers' => (int) ($stats->total_users ?? 0),
            'profilesCompleted' => (int) ($stats->profiles_completed ?? 0),
            'preTestsTaken' => (int) ($stats->pre_tests_taken ?? 0),
            'postTestsTaken' => (int) ($stats->post_tests_taken ?? 0),
            'averagePreTestScore' => round((float) ($stats->avg_pre_test ?? 0), 2),
            'averagePostTestScore' => round((float) ($stats->avg_post_test ?? 0), 2),
            'averageImprovement' => round($avgImprovement, 2),
            'totalEngagementPoints' => (int) ($stats->total_engagement ?? 0),
            'avgEngagementPerUser' => round((float) ($stats->avg_engagement ?? 0), 2),
            'activeUsersToday' => $activeToday,
            'activeUsersThisWeek' => $activeThisWeek,
        ];
    }

    /**
     * Fetch user metrics grouped by Santa Cruz, Laguna barangays.
     */
    public function getBarangayAnalytics(): array
    {
        $barangays = [
            'Alipit', 'Bagumbayan', 'Bubukal', 'Calian', 'Duhat', 'Gatid', 'Jasaan', 'Labuin', 'Malinao',
            'Oogong', 'Pagsawitan', 'Palasan', 'Patimbao', 'Poblacion I', 'Poblacion II', 'Poblacion III',
            'Poblacion IV', 'Poblacion V', 'San Jose', 'San Juan', 'San Pablo Norte', 'San Pablo Sur',
            'Santisima Cruz', 'Santo Angel Central', 'Santo Angel Norte', 'Santo Angel Sur'
        ];

        $stats = User::where('role', '!=', 'admin')
            ->whereIn('barangay', $barangays)
            ->selectRaw('
                barangay,
                COUNT(*) as user_count,
                SUM(CASE WHEN "profileCompleted" = true THEN 1 ELSE 0 END) as profiles_completed,
                AVG("preTestScore") as avg_pre_test,
                AVG("postTestScore") as avg_post_test,
                AVG(CASE WHEN "preTestScore" IS NOT NULL AND "postTestScore" IS NOT NULL THEN (("postTestScore" - "preTestScore") / 15.0) * 100 ELSE NULL END) as avg_improvement
            ')
            ->groupBy('barangay')
            ->get()
            ->keyBy('barangay');

        $barangayData = [];

        foreach ($barangays as $barangay) {
            $stat = $stats->get($barangay);

            if (!$stat) {
                $barangayData[] = [
                    'barangay' => $barangay,
                    'userCount' => 0,
                    'avgPreTestScore' => 0,
                    'avgPostTestScore' => 0,
                    'avgImprovement' => 0,
                    'profilesCompleted' => 0,
                ];
            } else {
                $barangayData[] = [
                    'barangay' => $barangay,
                    'userCount' => (int) $stat->user_count,
                    'avgPreTestScore' => round((float) $stat->avg_pre_test, 2),
                    'avgPostTestScore' => round((float) $stat->avg_post_test, 2),
                    'avgImprovement' => round((float) $stat->avg_improvement, 1),
                    'profilesCompleted' => (int) $stat->profiles_completed,
                ];
            }
        }

        usort($barangayData, fn($a, $b) => $b['userCount'] <=> $a['userCount']);
        return $barangayData;
    }

    /**
     * Fetch user demographic distribution (gender, age groups, occupations, schools).
     */
    public function getDemographicAnalytics(): array
    {
        $gender = User::where('role', '!=', 'admin')->where('profileCompleted', true)
            ->whereNotNull('gender')->groupBy('gender')
            ->selectRaw('gender, count(*) as count')->pluck('count', 'gender')->toArray();

        $occupations = User::where('role', '!=', 'admin')->where('profileCompleted', true)
            ->whereNotNull('occupation')->groupBy('occupation')
            ->selectRaw('occupation, count(*) as count')->pluck('count', 'occupation')->toArray();

        $schools = User::where('role', '!=', 'admin')->where('profileCompleted', true)
            ->whereNotNull('school')->groupBy('school')
            ->selectRaw('school, count(*) as count')->pluck('count', 'school')->toArray();

        $ageStats = User::where('role', '!=', 'admin')->where('profileCompleted', true)
            ->whereNotNull('age')
            ->selectRaw('
                SUM(CASE WHEN age < 10 THEN 1 ELSE 0 END) as "Under 10",
                SUM(CASE WHEN age >= 10 AND age < 15 THEN 1 ELSE 0 END) as "10 to 14",
                SUM(CASE WHEN age >= 15 AND age < 18 THEN 1 ELSE 0 END) as "15-17",
                SUM(CASE WHEN age >= 18 AND age < 25 THEN 1 ELSE 0 END) as "18-24",
                SUM(CASE WHEN age >= 25 AND age < 35 THEN 1 ELSE 0 END) as "25-34",
                SUM(CASE WHEN age >= 35 AND age < 45 THEN 1 ELSE 0 END) as "35-44",
                SUM(CASE WHEN age >= 45 AND age < 55 THEN 1 ELSE 0 END) as "45-54",
                SUM(CASE WHEN age >= 55 THEN 1 ELSE 0 END) as "55+"
            ')->first();

        $ageGroups = [
            "Under 10" => (int) ($ageStats->{'Under 10'} ?? 0),
            "10 to 14" => (int) ($ageStats->{'10 to 14'} ?? 0),
            "15-17" => (int) ($ageStats->{'15-17'} ?? 0),
            "18-24" => (int) ($ageStats->{'18-24'} ?? 0),
            "25-34" => (int) ($ageStats->{'25-34'} ?? 0),
            "35-44" => (int) ($ageStats->{'35-44'} ?? 0),
            "45-54" => (int) ($ageStats->{'45-54'} ?? 0),
            "55+" => (int) ($ageStats->{'55+'} ?? 0),
        ];

        return [
            'gender' => empty($gender) ? new \stdClass() : $gender,
            'ageGroups' => empty($ageGroups) ? new \stdClass() : $ageGroups,
            'occupations' => empty($occupations) ? new \stdClass() : $occupations,
            'schools' => empty($schools) ? new \stdClass() : $schools
        ];
    }

    /**
     * Fetch accuracy and gap analysis across knowledge assessment categories.
     */
    public function getKnowledgeAnalytics(): array
    {
        $categories = [
            'Fire Prevention', 'Emergency Response', 'Electrical Safety', 
            'Kitchen Safety', 'Evacuation Planning', 'Fire Extinguisher Use',
            'Smoke Detector Knowledge', 'General Safety Awareness'
        ];

        $questionCounts = AssessmentQuestion::where('isActive', true)
            ->whereIn('category', $categories)
            ->groupBy('category')
            ->selectRaw('category, count(*) as total')
            ->pluck('total', 'category');

        $stats = DB::table('user_answers')
            ->join('assessment_questions', 'user_answers.questionId', '=', 'assessment_questions.id')
            ->where('assessment_questions.isActive', true)
            ->whereIn('assessment_questions.category', $categories)
            ->selectRaw('
                assessment_questions.category, 
                count(user_answers.id) as total_answers, 
                sum(case when user_answers."isCorrect" = true then 1 else 0 end) as correct_answers
            ')
            ->groupBy('assessment_questions.category')
            ->get()
            ->keyBy('category');

        $knowledgeData = [];

        foreach ($categories as $category) {
            $totalQuestions = $questionCounts->get($category, 0);
            $stat = $stats->get($category);

            if ($totalQuestions === 0 || !$stat) {
                $knowledgeData[] = [
                    'category' => $category,
                    'avgScore' => 0,
                    'totalQuestions' => $totalQuestions,
                    'correctAnswers' => 0,
                    'incorrectAnswers' => 0,
                ];
                continue;
            }

            $totalAnswers = (int) $stat->total_answers;
            $correctAnswers = (int) $stat->correct_answers;

            $knowledgeData[] = [
                'category' => $category,
                'avgScore' => $totalAnswers > 0 ? round(($correctAnswers / $totalAnswers) * 100) : 0,
                'totalQuestions' => $totalQuestions,
                'correctAnswers' => $correctAnswers,
                'incorrectAnswers' => $totalAnswers - $correctAnswers,
            ];
        }

        usort($knowledgeData, fn($a, $b) => $a['avgScore'] <=> $b['avgScore']);
        return $knowledgeData;
    }

    /**
     * Retrieve cached analytics for a specific type with TTL.
     */
    public function getCachedAnalytics(string $type, int $ttlMinutes = 5): ?array
    {
        return Cache::remember("admin_analytics_{$type}", now()->addMinutes($ttlMinutes), function () use ($type) {
            return match ($type) {
                'summary' => $this->getSummaryAnalytics(),
                'barangay' => $this->getBarangayAnalytics(),
                'demographics' => $this->getDemographicAnalytics(),
                'knowledge' => $this->getKnowledgeAnalytics(),
                default => null,
            };
        });
    }

    /**
     * Create the CSV stream callback for export.
     */
    public function createCsvStreamCallback(array $summary, array $barangay, array $demographics, array $knowledge, ?array $schoolData, ?array $feedbackData): \Closure
    {
        return function () use ($summary, $barangay, $demographics, $knowledge, $schoolData, $feedbackData) {
            $out = fopen('php://output', 'w');

            // ── HEADER & TITLE ─────────────────────────────────────────
            fputcsv($out, ['SAFESCAPE PLATFORM ANALYTICS REPORT']);
            fputcsv($out, ['Exported Date:', now()->format('Y-m-d')]);
            fputcsv($out, ['Exported Time:', now()->format('H:i:s')]);
            fputcsv($out, ['Location:', 'Santa Cruz, Laguna, Philippines']);
            fputcsv($out, []);

            // ── SUMMARY ──────────────────────────────────────────────
            fputcsv($out, ['=== SUMMARY STATISTICS ===']);
            fputcsv($out, ['Metric', 'Value']);
            fputcsv($out, ['Total Users',              $summary['totalUsers']]);
            fputcsv($out, ['Profiles Completed',       $summary['profilesCompleted']]);
            fputcsv($out, ['Pre-Tests Taken',          $summary['preTestsTaken']]);
            fputcsv($out, ['Post-Tests Taken',         $summary['postTestsTaken']]);
            fputcsv($out, ['Avg Pre-Test Score',       $summary['averagePreTestScore']]);
            fputcsv($out, ['Avg Post-Test Score',      $summary['averagePostTestScore']]);
            fputcsv($out, ['Avg Improvement (points)', $summary['averageImprovement']]);
            fputcsv($out, ['Total Engagement Points',  $summary['totalEngagementPoints']]);
            fputcsv($out, ['Avg Engagement / User',    $summary['avgEngagementPerUser']]);
            fputcsv($out, ['Active Users Today',       $summary['activeUsersToday']]);
            fputcsv($out, ['Active Users This Week',   $summary['activeUsersThisWeek']]);
            fputcsv($out, []);

            // ── BY BARANGAY ───────────────────────────────────────────
            fputcsv($out, ['=== USERS BY BARANGAY ===']);
            fputcsv($out, ['Barangay', 'Users', 'Profiles Completed', 'Avg Pre-Test', 'Avg Post-Test', 'Percentage']);
            foreach ($barangay as $b) {
                if (($b['userCount'] ?? 0) === 0) continue;
                fputcsv($out, [
                    $b['barangay'],
                    $b['userCount'],
                    $b['profilesCompleted'],
                    $b['avgPreTestScore'],
                    $b['avgPostTestScore'],
                    ($b['avgImprovement'] >= 0 ? '+' : '') . $b['avgImprovement'] . '%',
                ]);
            }
            fputcsv($out, []);

            // ── DEMOGRAPHICS ──────────────────────────────────────────
            fputcsv($out, ['=== DEMOGRAPHICS ===']);

            fputcsv($out, ['Gender', 'Count']);
            foreach ((array)$demographics['gender'] as $label => $count) {
                fputcsv($out, [$label, $count]);
            }
            fputcsv($out, []);

            fputcsv($out, ['Age Group', 'Count']);
            foreach ((array)$demographics['ageGroups'] as $label => $count) {
                fputcsv($out, [$label, $count]);
            }
            fputcsv($out, []);

            fputcsv($out, ['Occupation', 'Count']);
            foreach ((array)$demographics['occupations'] as $label => $count) {
                fputcsv($out, [$label, $count]);
            }
            fputcsv($out, []);

            fputcsv($out, ['School', 'Count']);
            foreach ((array)$demographics['schools'] as $label => $count) {
                fputcsv($out, [$label, $count]);
            }
            fputcsv($out, []);

            // ── KNOWLEDGE GAPS ────────────────────────────────────────
            fputcsv($out, ['=== KNOWLEDGE GAP ANALYSIS ===']);
            fputcsv($out, ['Category', 'Avg Score (%)', 'Total Questions', 'Correct Answers', 'Incorrect Answers']);
            foreach ($knowledge as $k) {
                fputcsv($out, [
                    $k['category'],
                    $k['avgScore'],
                    $k['totalQuestions'],
                    $k['correctAnswers'],
                    $k['incorrectAnswers'],
                ]);
            }
            fputcsv($out, []);

            // ── SCHOOL ANALYTICS ──────────────────────────────────────
            fputcsv($out, ['=== SCHOOL LEADERBOARD ===']);
            fputcsv($out, ['Rank', 'School Name', 'Type', 'Students', 'Avg Pre-Test', 'Avg Post-Test', 'Increase', 'Completion Rate (%)']);
            
            if (isset($schoolData['schools']) && is_array($schoolData['schools'])) {
                $rank = 1;
                foreach ($schoolData['schools'] as $school) {
                    $increase = $school['averagePreTestScore'] > 0 
                        ? round((($school['averagePostTestScore'] - $school['averagePreTestScore']) / $school['averagePreTestScore']) * 100) 
                        : 0;
                        
                    $increaseStr = $increase > 0 ? "+{$increase}%" : "{$increase}%";
                        
                    fputcsv($out, [
                        $rank++,
                        $school['name'] ?? 'Unknown',
                        $school['type'] ?? 'Unknown',
                        $school['totalStudents'] ?? 0,
                        $school['averagePreTestScore'] ?? 0,
                        $school['averagePostTestScore'] ?? 0,
                        $increaseStr,
                        ($school['averageCompletionRate'] ?? 0) . '%'
                    ]);
                }
            }
            fputcsv($out, []);

            // ── FEEDBACK ANALYTICS ────────────────────────────────────
            fputcsv($out, ['=== FEEDBACK BY FEATURE ===']);
            fputcsv($out, ['Feature Name', 'Type', 'Average Rating', 'Total Reviews']);
            
            if (isset($feedbackData['byFeatureName']) && is_array($feedbackData['byFeatureName'])) {
                foreach ($feedbackData['byFeatureName'] as $feature) {
                    fputcsv($out, [
                        $feature['featureName'] ?? 'Unknown',
                        $feature['featureType'] ?? 'Unknown',
                        ($feature['avgRating'] ?? 0) . '/5',
                        $feature['totalCount'] ?? 0
                    ]);
                }
            }
            fputcsv($out, []);

            // Calculate highlights for narrative
            $lowestCategory = 'N/A';
            $lowestScore = 100;
            $highestCategory = 'N/A';
            $highestScore = 0;
            if (!empty($knowledge)) {
                foreach ($knowledge as $k) {
                    $score = $k['avgScore'];
                    if ($score < $lowestScore) {
                        $lowestScore = $score;
                        $lowestCategory = $k['category'];
                    }
                    if ($score > $highestScore) {
                        $highestScore = $score;
                        $highestCategory = $k['category'];
                    }
                }
            }

            $topSchool = 'N/A';
            $topSchoolScore = 0;
            if (isset($schoolData['schools']) && is_array($schoolData['schools']) && !empty($schoolData['schools'])) {
                $topS = $schoolData['schools'][0];
                $topSchool = $topS['name'] ?? 'Unknown';
                $topSchoolScore = $topS['averagePostTestScore'] ?? 0;
            }

            $topFeature = 'N/A';
            $topFeatureRating = 0;
            if (isset($feedbackData['byFeatureName']) && is_array($feedbackData['byFeatureName']) && !empty($feedbackData['byFeatureName'])) {
                $features = $feedbackData['byFeatureName'];
                usort($features, fn($a, $b) => ($b['avgRating'] ?? 0) <=> ($a['avgRating'] ?? 0));
                $topF = $features[0];
                $topFeature = $topF['featureName'] ?? 'Unknown';
                $topFeatureRating = $topF['avgRating'] ?? 0;
            }

            // ── EXECUTIVE SUMMARY & NARRATIVE REPORT ──────────────────
            fputcsv($out, ['=== EXECUTIVE SUMMARY & NARRATIVE REPORT ===']);
            
            fputcsv($out, ['Report Summary:']);
            $lines = explode("\n", wordwrap("This report details the learning and engagement progress on the Berong Safescape E-Learning platform in Santa Cruz, Laguna.", 80));
            foreach ($lines as $l) {
                fputcsv($out, [$l]);
            }
            fputcsv($out, []);

            fputcsv($out, ['1. PLATFORM REACH:']);
            $lines = explode("\n", wordwrap("A total of {$summary['totalUsers']} users are registered on the platform. Out of these, {$summary['profilesCompleted']} users have fully completed their profiles, showing strong adoption across targeted demographics.", 80));
            foreach ($lines as $l) {
                fputcsv($out, [$l]);
            }
            fputcsv($out, []);

            fputcsv($out, ['2. ASSESSMENT GRADUATION:']);
            $lines = explode("\n", wordwrap("{$summary['preTestsTaken']} users completed the pre-test, while {$summary['postTestsTaken']} users completed the post-test. The average score increased from {$summary['averagePreTestScore']}/15 to {$summary['averagePostTestScore']}/15, representing an average points improvement of +{$summary['averageImprovement']} per user.", 80));
            foreach ($lines as $l) {
                fputcsv($out, [$l]);
            }
            fputcsv($out, []);

            if ($lowestCategory !== 'N/A') {
                fputcsv($out, ['3. KNOWLEDGE GAP EVALUATION:']);
                $lines = explode("\n", wordwrap("The category requiring the most focus is '{$lowestCategory}' (average score of {$lowestScore}%), indicating an area for curriculum expansion. Conversely, users showed the highest mastery in '{$highestCategory}' (average score of {$highestScore}%).", 80));
                foreach ($lines as $l) {
                    fputcsv($out, [$l]);
                }
                fputcsv($out, []);
            }

            if ($topSchool !== 'N/A') {
                fputcsv($out, ['4. SCHOOL ADOPTION:']);
                $lines = explode("\n", wordwrap("'{$topSchool}' is the leading educational institution on the platform, achieving a top average post-test score of {$topSchoolScore}/15.", 80));
                foreach ($lines as $l) {
                    fputcsv($out, [$l]);
                }
                fputcsv($out, []);
            }

            if ($topFeature !== 'N/A') {
                fputcsv($out, ['5. USER FEEDBACK:']);
                $lines = explode("\n", wordwrap("The platform has received positive reviews. The highest-rated interactive feature is '{$topFeature}' with an average rating of {$topFeatureRating}/5.", 80));
                foreach ($lines as $l) {
                    fputcsv($out, [$l]);
                }
                fputcsv($out, []);
            }

            fputcsv($out, ['Conclusion:']);
            fputcsv($out, ['Report concluded successfully. Exported by Safescape Administrator.']);

            fclose($out);
        };
    }
}
