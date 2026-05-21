const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('c:/Users/Kean/OneDrive/Desktop/laravel-safescape/berong-safescape-laravel/public/modules/module_*/index.html');

for (let file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Replacement 1: renderQuiz prompt
    const renderQuizTarget = `
            correctCount = 0;
            answeredCount = 0;
            selectedAnswers = [null, null, null, null, null];

            quizData.forEach((item, idx) => {`;
            
    const renderQuizReplacement = `
            const startDiv = document.createElement('div');
            startDiv.className = "text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border-[3px] border-yellow-300 shadow-sm";
            startDiv.innerHTML = \`
                <h3 class="text-xl font-black mb-4 dark:text-white">Ready to test your knowledge?</h3>
                <p class="mb-6 text-slate-500">Note: The module content will be hidden during the quiz to prevent cheating.</p>
                <button onclick="startQuizNow()" class="font-black px-8 py-4 rounded-full bg-yellow-400 text-red-600 shadow-[0_4px_0_#b45309] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none border-[3px] border-white transition-all uppercase tracking-wide">
                    Start Quiz
                </button>
            \`;
            container.appendChild(startDiv);
        }

        function startQuizNow() {
            document.body.classList.add('quiz-active');
            
            const container = document.getElementById('quiz-container');
            container.innerHTML = '';
            
            correctCount = 0;
            answeredCount = 0;
            selectedAnswers = [null, null, null, null, null];

            quizData.forEach((item, idx) => {`;

    if (content.includes(renderQuizTarget)) {
        content = content.replace(renderQuizTarget, renderQuizReplacement);
        console.log('Replaced renderQuiz in ' + file);
    } else {
        console.log('Could not find renderQuizTarget in ' + file);
    }

    // Replacement 2: submitQuizAnswers body class removal
    const submitQuizTarget = `function submitQuizAnswers() {
            // Disable all options`;

    const submitQuizReplacement = `function submitQuizAnswers() {
            document.body.classList.remove('quiz-active');
            // Disable all options`;

    if (content.includes(submitQuizTarget)) {
        content = content.replace(submitQuizTarget, submitQuizReplacement);
        console.log('Replaced submitQuizAnswers in ' + file);
    } else {
        console.log('Could not find submitQuizTarget in ' + file);
    }

    fs.writeFileSync(file, content, 'utf8');
}
