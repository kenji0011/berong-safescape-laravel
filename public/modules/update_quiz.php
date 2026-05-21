<?php
$files = [
    'public/modules/module_1/index.html',
    'public/modules/module_2/index.html',
    'public/modules/module_3/index.html'
];

$renderQuizTarget = "
            correctCount = 0;
            answeredCount = 0;
            selectedAnswers = [null, null, null, null, null];

            quizData.forEach((item, idx) => {";

$renderQuizReplacement = "
            const startDiv = document.createElement('div');
            startDiv.className = \"text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-yellow-300 shadow-sm\";
            startDiv.innerHTML = `
                <h3 class=\"text-xl font-black mb-4 dark:text-white\">Ready to test your knowledge?</h3>
                <p class=\"mb-6 text-slate-500\">Note: The module content will be hidden during the quiz to prevent cheating.</p>
                <button onclick=\"startQuizNow()\" class=\"font-black px-8 py-4 rounded-full bg-yellow-400 text-red-600 shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none border-[3px] border-white transition-all uppercase tracking-wide\">
                    Start Quiz
                </button>
            `;
            container.appendChild(startDiv);
        }

        function startQuizNow() {
            document.body.classList.add('quiz-active');
            
            const container = document.getElementById('quiz-container');
            container.innerHTML = '';
            
            correctCount = 0;
            answeredCount = 0;
            selectedAnswers = [null, null, null, null, null];

            quizData.forEach((item, idx) => {";

$submitQuizTarget = "function submitQuizAnswers() {
            // Disable all options";

$submitQuizReplacement = "function submitQuizAnswers() {
            document.body.classList.remove('quiz-active');
            // Disable all options";

foreach ($files as $file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        
        if (strpos($content, $renderQuizTarget) !== false) {
            $content = str_replace($renderQuizTarget, $renderQuizReplacement, $content);
            echo "Replaced renderQuiz in $file\n";
        }
        
        if (strpos($content, $submitQuizTarget) !== false) {
            $content = str_replace($submitQuizTarget, $submitQuizReplacement, $content);
            echo "Replaced submitQuizAnswers in $file\n";
        }
        
        file_put_contents($file, $content);
    }
}

// For module 4
$file4 = 'public/modules/module_4/index.html';
if (file_exists($file4)) {
    $content4 = file_get_contents($file4);
    
    $renderTFTarget = "
            selectedTFAnswers = [null, null, null, null, null];

            tfQuestions.forEach((q, idx) => {";
            
    $renderTFReplacement = "
            const startDiv = document.createElement('div');
            startDiv.className = \"text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-yellow-300 shadow-sm\";
            startDiv.innerHTML = `
                <h3 class=\"text-xl font-black mb-4 dark:text-white\">Ready to test your knowledge?</h3>
                <p class=\"mb-6 text-slate-500\">Note: The module content will be hidden during the quiz to prevent cheating.</p>
                <button onclick=\"startQuizNow()\" class=\"font-black px-8 py-4 rounded-full bg-yellow-400 text-red-600 shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none border-[3px] border-white transition-all uppercase tracking-wide\">
                    Start Quiz
                </button>
            `;
            container.appendChild(startDiv);
        }

        function startQuizNow() {
            document.body.classList.add('quiz-active');
            
            const container = document.getElementById('tf-questions');
            container.innerHTML = '';
            
            selectedTFAnswers = [null, null, null, null, null];

            tfQuestions.forEach((q, idx) => {";

    $submitTFTarget = "function submitTFQuizAnswers() {
            // Disable all options";
            
    $submitTFReplacement = "function submitTFQuizAnswers() {
            document.body.classList.remove('quiz-active');
            // Disable all options";
            
    if (strpos($content4, $renderTFTarget) !== false) {
        $content4 = str_replace($renderTFTarget, $renderTFReplacement, $content4);
        echo "Replaced renderTF in $file4\n";
    }
    
    if (strpos($content4, $submitTFTarget) !== false) {
        $content4 = str_replace($submitTFTarget, $submitTFReplacement, $content4);
        echo "Replaced submitTFQuizAnswers in $file4\n";
    }
    
    file_put_contents($file4, $content4);
}

// For module 5
$file5 = 'public/modules/module_5/index.html';
if (file_exists($file5)) {
    $content5 = file_get_contents($file5);
    
    $renderExamTarget = "
            correctCount = 0;
            answeredCount = 0;
            selectedAnswers = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];

            examData.forEach((item, idx) => {";
            
    $renderExamReplacement = "
            const startDiv = document.createElement('div');
            startDiv.className = \"text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-yellow-300 shadow-sm\";
            startDiv.innerHTML = `
                <h3 class=\"text-xl font-black mb-4 dark:text-white\">Ready to test your knowledge?</h3>
                <p class=\"mb-6 text-slate-500\">Note: The module content will be hidden during the exam to prevent cheating.</p>
                <button onclick=\"startQuizNow()\" class=\"font-black px-8 py-4 rounded-full bg-yellow-400 text-red-600 shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none border-[3px] border-white transition-all uppercase tracking-wide\">
                    Start Exam
                </button>
            `;
            container.appendChild(startDiv);
        }

        function startQuizNow() {
            document.body.classList.add('quiz-active');
            
            const container = document.getElementById('exam-container');
            container.innerHTML = '';
            
            correctCount = 0;
            answeredCount = 0;
            selectedAnswers = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];

            examData.forEach((item, idx) => {";

    $submitExamTarget = "function submitExamAnswers() {
            // Disable all options";
            
    $submitExamReplacement = "function submitExamAnswers() {
            document.body.classList.remove('quiz-active');
            // Disable all options";
            
    if (strpos($content5, $renderExamTarget) !== false) {
        $content5 = str_replace($renderExamTarget, $renderExamReplacement, $content5);
        echo "Replaced renderExam in $file5\n";
    }
    
    if (strpos($content5, $submitExamTarget) !== false) {
        $content5 = str_replace($submitExamTarget, $submitExamReplacement, $content5);
        echo "Replaced submitExamAnswers in $file5\n";
    }
    
    file_put_contents($file5, $content5);
}

echo "Done\n";
?>
