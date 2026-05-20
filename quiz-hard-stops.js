// Quiz Logic with Hard Stops and Progress Percentage

// Hard Stop Questions (End quiz immediately)
const HARD_STOPS = {
    // Question 1: Residency
    'ineligible-country': {
        message: "Sorry, the Thailand DTV is not available for your country. The DTV is currently available for UK, Ireland, US, Canada, Australia, EU countries, and select others. Check with the Thai embassy for alternative visa options.",
        action: 'stop'
    },
    // Question 3: Remote work permission from employer
    'employer-denies-remote': {
        message: "Your employer doesn't allow remote work from abroad. You'll need to either:\n\n1. Request permission from your employer\n2. Find a new job that allows remote work\n3. Switch to self-employed/freelance work\n\nCome back once you have remote work permission.",
        action: 'stop'
    }
};

// Scoring Questions (Build up to 100%)
const SCORING_QUESTIONS = {
    'passport': { points: 15, max: 15 },           // 15 points
    'remote-income': { points: 30, max: 30 },    // 30 points
    'work-permission': { points: 20, max: 20 },   // 20 points
    'monthly-income': { points: 15, max: 15 },  // 15 points
    'bank-balance': { points: 20, max: 20 }      // 20 points
};

// Current score tracker
let currentScore = 0;
let maxPossibleScore = 80; // Total of all scoring questions

// Update progress bar with percentage
function updateProgressPercentage(justAnsweredQuestion, pointsEarned) {
    currentScore += pointsEarned;
    const percentage = Math.round((currentScore / maxPossibleScore) * 100);
    
    // Update progress bar
    const progressBar = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-percentage');
    
    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }
    if (progressText) {
        progressText.textContent = percentage + '% Ready';
    }
    
    // Store for later
    window.dtvReadinessScore = currentScore;
    window.dtvReadinessPercentage = percentage;
}

// Handle hard stops
function checkHardStop(questionId, answer) {
    // Question 1: Residency check
    if (questionId === '1') {
        const ineligibleCountries = ['other', 'none'];
        if (ineligibleCountries.includes(answer)) {
            showHardStop(HARD_STOPS['ineligible-country']);
            return true;
        }
    }
    
    // Question about employer remote work permission
    // This would be a new question after income type if employed
    if (questionId === 'employer-remote' && answer === 'no') {
        showHardStop(HARD_STOPS['employer-denies-remote']);
        return true;
    }
    
    return false;
}

// Show hard stop screen
function showHardStop(stopConfig) {
    // Hide quiz
    document.querySelectorAll('.quiz-question').forEach(q => q.classList.remove('active'));
    document.querySelector('.quiz-progress').style.display = 'none';
    
    // Show hard stop message
    const hardStopEl = document.getElementById('hard-stop-screen');
    const hardStopMessage = document.getElementById('hard-stop-message');
    
    if (hardStopEl && hardStopMessage) {
        hardStopMessage.innerHTML = stopConfig.message.replace(/\n/g, '<br>');
        hardStopEl.classList.add('show');
    } else {
        // Fallback - create alert
        alert(stopConfig.message);
    }
    
    // Log to console for debugging
    console.log('Hard stop triggered:', stopConfig);
}

// Calculate points for each answer
function calculatePoints(questionId, answer) {
    let points = 0;
    
    switch(questionId) {
        case '2': // Passport validity
            if (answer === '6plus') points = 15;
            break;
            
        case '3': // Remote income type
            if (['employed', 'self-employed', 'freelance'].includes(answer)) {
                points = 30;
            }
            break;
            
        case '4a': // Workplace permission
            if (answer === 'yes-have') points = 20;
            else if (answer === 'yes-can-get') points = 15;
            else if (answer === 'need-to-ask') points = 10;
            break;
            
        case '4c': // Tax docs (self-employed)
            if (['paye-payslips', 'self-filed', 'mix'].includes(answer)) points = 20;
            else if (answer === 'self-not-yet') points = 10;
            break;
            
        case '5': // Monthly income
            if (['1-2k', '2-3k', 'over-3k'].includes(answer)) points = 15;
            else if (answer === 'under-1k') points = 0; // Suggest increase at end
            break;
            
        case '6': // Bank balance
            if (answer === 'yes-have') points = 20;
            else if (answer === 'yes-spread') points = 15;
            else if (answer === 'soon') points = 10;
            break;
    }
    
    return points;
}

// Modified route function with hard stops and scoring
function routeQuiz(currentQId, answer) {
    // Check for hard stops first
    if (checkHardStop(currentQId, answer)) {
        return; // Quiz ends here
    }
    
    // Calculate and update score for scoring questions
    const points = calculatePoints(currentQId, answer);
    if (points > 0 || SCORING_QUESTIONS[currentQId]) {
        updateProgressPercentage(currentQId, points);
    }
    
    // Continue with routing logic
    questions.forEach(q => q.classList.remove('active'));
    
    // Update progress bar visual
    const progressIndex = questionPath.length;
    progressBars.forEach((bar, index) => {
        bar.classList.toggle('active', index < progressIndex);
    });
    
    // Routing logic continues...
    switch(currentQId) {
        case '1': // Residence - passed hard stop, continue
            showQuestion('2');
            break;
            
        case '2': // Passport
            if (answer === 'under-6' || answer === 'expired') {
                calculateTimelineAndShowResult('passport');
            } else {
                showQuestion('3');
            }
            break;
            
        case '3': // Remote income
            if (answer === 'no') {
                calculateTimelineAndShowResult('no-remote');
            } else if (answer === 'employed') {
                // Check employer permission first (new hard stop question)
                showQuestion('employer-remote-check');
            } else {
                showQuestion('4b'); // Self-employed
            }
            break;
            
        case 'employer-remote-check': // NEW: Employer remote permission
            if (answer === 'no') {
                showHardStop(HARD_STOPS['employer-denies-remote']);
            } else {
                showQuestion('4a'); // Continue to workplace permission details
            }
            break;
            
        // ... rest of existing routing
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HARD_STOPS,
        SCORING_QUESTIONS,
        calculatePoints,
        updateProgressPercentage,
        checkHardStop
    };
}