// Bottom Progress Bar Functions

const TOTAL_QUESTIONS = 6;

function updateBottomProgress(currentQ, percentage) {
    const bottomProgress = document.getElementById('bottom-progress');
    const questionDisplay = bottomProgress.querySelector('.question-number-display');
    const percentDisplay = bottomProgress.querySelector('.progress-percent-display');
    const progressFill = document.getElementById('bottom-progress-fill');
    const dots = document.querySelectorAll('.question-dots .dot');
    
    // Show progress bar
    bottomProgress.classList.add('active');
    
    // Update question number
    const qNum = parseInt(currentQ) || 0;
    questionDisplay.textContent = `Q${qNum} of ${TOTAL_QUESTIONS}`;
    
    // Update percentage
    percentDisplay.textContent = percentage + '%';
    
    // Update progress fill
    progressFill.style.width = percentage + '%';
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.remove('active', 'completed');
        if (index < qNum) {
            dot.classList.add('completed');
        } else if (index === qNum) {
            dot.classList.add('active');
        }
    });
}

function hideBottomProgress() {
    const bottomProgress = document.getElementById('bottom-progress');
    if (bottomProgress) {
        bottomProgress.classList.remove('active');
    }
}

// Override the existing updateProgress to also update bottom bar
const originalUpdateProgress = updateProgress;
updateProgress = function(points) {
    originalUpdateProgress(points);
    
    // Calculate current question from questionPath
    const currentQ = questionPath.length;
    const percentage = Math.round((currentScore / MAX_SCORE) * 100);
    
    updateBottomProgress(currentQ, percentage);
};

// Override showQuestion to update progress
const originalShowQuestion = showQuestion;
showQuestion = function(questionId) {
    originalShowQuestion(questionId);
    
    // Update bottom bar
    const qNum = parseInt(questionId) || 0;
    const percentage = Math.round((currentScore / MAX_SCORE) * 100);
    updateBottomProgress(qNum, percentage);
};

// Override calculateFinalResult to hide bottom bar
const originalCalculateFinalResult = calculateFinalResult;
calculateFinalResult = function() {
    hideBottomProgress();
    originalCalculateFinalResult();
};

// Show bottom bar when starting quiz
const originalSaveEmail = saveEmailAndContinue;
saveEmailAndContinue = function() {
    originalSaveEmail();
    updateBottomProgress(1, 0);
};
