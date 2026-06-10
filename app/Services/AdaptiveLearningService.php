<?php

namespace App\Services;

class AdaptiveLearningService
{
    private array $preMean = [10.51, 5.5092, 8.1604];
    private array $preScale = [3.29215735, 3.3024711, 4.56406308];

    private array $finalMean = [11.2092, 6.2682, 8.6076, 2.967, 2.9704, 3.0178, 3.0112];
    private array $finalScale = [3.648703243619574, 3.6258335262391737, 4.254741148413144, 1.5125842125316526, 1.5120594697299443, 1.4826608378182788, 1.4852186909677647];

    // Each ML model was trained with a different label encoder,
    // so they have separate class mappings
    private array $preClasses = ['Easy', 'Hard', 'Medium'];
    private array $finalClasses = ['Easy', 'Hard', 'Medium'];


    /**
     * Get difficulty prediction for Modules 1-4 based on pre-assessment
     */
    public function getModuleDifficulty($age, $grade, $preAssessmentScore)
    {
        // 1. Scale the inputs
        $features = [
            (float)$age,
            (float)$grade,
            (float)$preAssessmentScore
        ];

        $scaledFeatures = [];
        for ($i = 0; $i < count($features); $i++) {
            $scaledFeatures[] = ($features[$i] - $this->preMean[$i]) / $this->preScale[$i];
        }

        // 2. Predict using the generated PHP function
        /** @noinspection PhpUndefinedFunctionInspection - loaded via composer autoload */
        $predictionVector = \scorePreAssessment($scaledFeatures);

        // 3. Find the argmax of the prediction vector
        $classIndex = $this->argmax($predictionVector);

        // 4. Decode the class
        return $this->preClasses[$classIndex];
    }

    /**
     * Get difficulty prediction for Final Exam based on age, grade, pre-assessment, and Modules 1-4 scores
     */
    public function getFinalExamDifficulty($age, $grade, $preAssessmentScore, $m1Score, $m2Score, $m3Score, $m4Score)
    {
        // 1. Scale the inputs (order must match training: age, gradeLevel, preAssessmentScore, m1, m2, m3, m4)
        $features = [
            (float)$age,
            (float)$grade,
            (float)$preAssessmentScore,
            (float)$m1Score,
            (float)$m2Score,
            (float)$m3Score,
            (float)$m4Score
        ];

        $scaledFeatures = [];
        for ($i = 0; $i < count($features); $i++) {
            $scaledFeatures[] = ($features[$i] - $this->finalMean[$i]) / $this->finalScale[$i];
        }

        // 2. Predict using the generated PHP function
        /** @noinspection PhpUndefinedFunctionInspection - loaded via composer autoload */
        $predictionVector = \scoreFinalExam($scaledFeatures);

        // 3. Find the argmax of the prediction vector
        $classIndex = $this->argmax($predictionVector);

        // 4. Decode the class
        return $this->finalClasses[$classIndex];
    }

    /**
     * Helper to find the index of the maximum value in an array
     */
    private function argmax(array $values)
    {
        $max = -INF;
        $maxIndex = 0;
        foreach ($values as $index => $value) {
            if ($value > $max) {
                $max = $value;
                $maxIndex = $index;
            }
        }
        return $maxIndex;
    }
}
