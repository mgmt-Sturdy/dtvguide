#!/usr/bin/env python3
"""
Update DTV Quiz with Hard Stops and Progress Percentage
"""

import re

# Read current index.html
with open('index.html', 'r') as f:
    content = f.read()

# 1. Add progress bar CSS before </style>
progress_css = """
/* Progress Bar with Percentage */
.quiz-progress-container {
    position: fixed;
    top: 80px;
    left: 0;
    right: 0;
    background: var(--white);
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--cream-dark);
    z-index: 100;
    display: none;
}

.quiz-progress-container.active {
    display: block;
}

.progress-bar-wrapper {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.progress-bar-track {
    flex: 1;
    height: 8px;
    background: var(--cream-dark);
    border-radius: 4px;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--gold-deep), var(--gold-light));
    border-radius: 4px;
    transition: width 0.5s ease;
    width: 0%;
}

.progress-percentage {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--gold-deep);
    min-width: 100px;
    text-align: right;
}

/* Hard Stop Screen */
.hard-stop-screen {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--cream);
    z-index: 1000;
    padding: 6rem 1.5rem 2rem;
}

.hard-stop-screen.show {
    display: flex;
    align-items: center;
    justify-content: center;
}

.hard-stop-content {
    max-width: 600px;
    text-align: center;
    background: var(--white);
    padding: 3rem;
    border-radius: 12px;
    box-shadow: 0 20px 60px var(--shadow);
}

.hard-stop-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
}

.hard-stop-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem;
    font-weight: 600;
    color: var(--charcoal);
    margin-bottom: 1rem;
}

.hard-stop-message {
    font-size: 1.1rem;
    color: var(--charcoal-light);
    line-height: 1.7;
    margin-bottom: 2rem;
}

.hard-stop-btn {
    display: inline-block;
    background: var(--gold-deep);
    color: var(--white);
    padding: 1rem 2rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: background 0.2s;
    cursor: pointer;
    border: none;
}

.hard-stop-btn:hover {
    background: var(--charcoal);
}
"""

# Insert CSS before </style>
content = content.replace('</style>', progress_css + '\n</style>')

# 2. Find the quiz section and add progress bar HTML
quiz_section_pattern = r'(<div class="quiz-question[^"]*" data-question="0"[^>]*>)'
quiz_match = re.search(quiz_section_pattern, content)

if quiz_match:
    progress_html = '''<!-- Progress Bar -->
<div class="quiz-progress-container" id="progress-container">
    <div class="progress-bar-wrapper">
        <div class="progress-bar-track">
            <div class="progress-bar-fill" id="progress-bar-fill"></div>
        </div>
        <div class="progress-percentage" id="progress-percentage">0% Ready</div>
    </div>
</div>

<!-- Hard Stop Screen -->
<div class="hard-stop-screen" id="hard-stop-screen">
    <div class="hard-stop-content">
        <div class="hard-stop-icon">🚫</div>
        <h2 class="hard-stop-title">Not Eligible</h2>
        <div class="hard-stop-message" id="hard-stop-message"></div>
        <button class="hard-stop-btn" onclick="location.reload()">Start Over</button>
    </div>
</div>

'''
    content = content[:quiz_match.start()] + progress_html + content[quiz_match.start():]

# 3. Replace the quiz JavaScript logic
# Find the existing script section
script_pattern = r'(<script>.*?// Quiz Logic.*?</script>)'

new_quiz_logic = '''<script>
// Quiz Logic with Hard Stops and Progress Percentage
const questions = document.querySelectorAll('.quiz-question');
const progressContainer = document.getElementById('progress-container');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressText = document.getElementById('progress-percentage');
const hardStopScreen = document.getElementById('hard-stop-screen');
const hardStopMessage = document.getElementById('hard-stop-message');

let currentScore = 0;
const MAX_SCORE = 80; // Total of all scoring questions
let userEmail = '';
let questionPath = [];
const answers = {};

// Hard Stop Configurations
const HARD_STOPS = {
    'ineligible-country': {
        title: 'DTV Not Available',
        message: 'Sorry, the Thailand DTV is currently only available for UK, Ireland, US, Canada, Australia, EU countries, and select others. Please check with the Thai embassy for alternative visa options that may suit your situation.'
    },
    'employer-denies-remote': {
        title: 'Remote Work Required',
        message: 'Your employer doesn\\'t allow remote work from abroad. You\\'ll need to either:<br><br>1. Request permission from your employer<br>2. Find a new job that allows remote work<br>3. Switch to self-employed/freelance work<br><br>Come back once you have remote work permission.'
    }
};

// Scoring configuration
const SCORING = {
    'passport': { max: 15 },
    'remote-income': { max: 30 },
    'work-permission': { max: 20 },
    'monthly-income': { max: 15 },
    'bank-balance': { max: 20 }
};

function calculatePoints(questionType, answer) {
    let points = 0;
    
    switch(questionType) {
        case 'passport':
            if (answer === '6plus') points = 15;
            break;
        case 'remote-income':
            if (['employed', 'self-employed', 'freelance'].includes(answer)) points = 30;
            break;
        case 'work-permission':
            if (answer === 'yes-have') points = 20;
            else if (answer === 'yes-can-get') points = 15;
            else if (answer === 'need-to-ask') points = 10;
            break;
        case 'tax-docs':
            if (['paye-payslips', 'self-filed', 'mix'].includes(answer)) points = 20;
            else if (answer === 'self-not-yet') points = 10;
            break;
        case 'monthly-income':
            if (['1-2k', '2-3k', 'over-3k'].includes(answer)) points = 15;
            break;
        case 'bank-balance':
            if (answer === 'yes-have') points = 20;
            else if (answer === 'yes-spread') points = 15;
            else if (answer === 'soon') points = 10;
            break;
    }
    
    return points;
}

function updateProgress(points) {
    currentScore += points;
    const percentage = Math.round((currentScore / MAX_SCORE) * 100);
    
    if (progressBarFill) {
        progressBarFill.style.width = percentage + '%';
    }
    if (progressText) {
        progressText.textContent = percentage + '% Ready';
    }
}

function showHardStop(stopKey) {
    const config = HARD_STOPS[stopKey];
    if (hardStopMessage && hardStopScreen) {
        hardStopMessage.innerHTML = config.message;
        hardStopScreen.querySelector('.hard-stop-title').textContent = config.title;
        hardStopScreen.classList.add('show');
    }
}

function saveEmailAndContinue() {
    const emailInput = document.getElementById('quiz-email');
    userEmail = emailInput.value;
    
    if (!userEmail || !userEmail.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    document.querySelector('[data-question="0"]').classList.remove('active');
    progressContainer.classList.add('active');
    showQuestion('1');
    questionPath.push('0');
}

function showQuestion(questionId) {
    questions.forEach(q => q.classList.remove('active'));
    const nextQuestion = document.querySelector('.quiz-question[data-question="' + questionId + '"]');
    if (nextQuestion) {
        nextQuestion.classList.add('active');
    }
}

function routeQuiz(currentQId, answer) {
    // Check hard stops
    if (currentQId === '1') {
        if (answer === 'other') {
            showHardStop('ineligible-country');
            return;
        }
    }
    
    // Calculate points for scoring questions
    const points = calculatePoints(currentQId, answer);
    if (points > 0) {
        updateProgress(points);
    }
    
    // Store answer
    answers[currentQId] = answer;
    questionPath.push(currentQId);
    
    // Routing logic
    questions.forEach(q => q.classList.remove('active'));
    
    switch(currentQId) {
        case '0': // Email
            showQuestion('1');
            break;
        case '1': // Residence - passed hard stop
            showQuestion('2');
            break;
        case '2': // Passport
            if (answer === 'under-6' || answer === 'expired') {
                calculateTimelineAndShowResult('passport');
            } else {
                updateProgress(calculatePoints('passport', '6plus'));
                showQuestion('3');
            }
            break;
        case '3': // Remote income
            if (answer === 'no') {
                calculateTimelineAndShowResult('no-remote');
            } else {
                updateProgress(calculatePoints('remote-income', answer));
                if (answer === 'employed') {
                    showQuestion('employer-remote-check');
                } else {
                    showQuestion('4c');
                }
            }
            break;
        case 'employer-remote-check':
            if (answer === 'no') {
                showHardStop('employer-denies-remote');
            } else {
                showQuestion('4a');
            }
            break;
        case '4a': // Workplace permission
            updateProgress(calculatePoints('work-permission', answer));
            if (answer === 'no') {
                calculateTimelineAndShowResult('need-permission');
            } else {
                showQuestion('5');
            }
            break;
        case '4c': // Tax docs
            updateProgress(calculatePoints('tax-docs', answer));
            showQuestion('5');
            break;
        case '5': // Monthly income
            updateProgress(calculatePoints('monthly-income', answer));
            if (answer === 'under-1k') {
                calculateTimelineAndShowResult('low-income');
            } else {
                showQuestion('6');
            }
            break;
        case '6': // Bank balance
            updateProgress(calculatePoints('bank-balance', answer));
            showQuestion('7');
            break;
        case '7': // Timeline
            calculateFinalResult();
            break;
    }
}

// Initialize click handlers
document.querySelectorAll('.quiz-option').forEach(option => {
    option.addEventListener('click', function() {
        const questionEl = this.closest('.quiz-question');
        const questionId = questionEl.dataset.question;
        
        questionEl.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        
        setTimeout(() => {
            routeQuiz(questionId, this.dataset.value);
        }, 300);
    });
});

function calculateTimelineAndShowResult(resultId) {
    questions.forEach(q => q.classList.remove('active'));
    progressContainer.style.display = 'none';
    
    const resultEl = document.getElementById('result-' + resultId);
    if (resultEl) {
        resultEl.classList.add('show');
    }
}

function calculateFinalResult() {
    questions.forEach(q => q.classList.remove('active'));
    progressContainer.style.display = 'none';
    
    const percentage = Math.round((currentScore / MAX_SCORE) * 100);
    
    let resultId;
    if (percentage >= 70) {
        resultId = 'likely';
    } else if (percentage >= 50) {
        resultId = 'challenges';
    } else {
        resultId = 'challenges';
    }
    
    const resultEl = document.getElementById('result-' + resultId);
    if (resultEl) {
        resultEl.classList.add('show');
        const timelineText = resultEl.querySelector('[id^="timeline-text"]');
        if (timelineText) {
            timelineText.textContent = 'Your DTV Readiness: ' + percentage + '%';
        }
    }
}

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.parentElement;
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) {
            item.classList.add('open');
        }
    });
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
</script>'''

# Replace script section
content = re.sub(script_pattern, new_quiz_logic, content, flags=re.DOTALL)

# Write updated file
with open('index.html', 'w') as f:
    f.write(content)

print("✅ Updated index.html with hard stops and progress percentage")
print("Changes made:")
print("- Added progress bar (0-80% scoring)")
print("- Added hard stop screens")
print("- Updated quiz routing with scoring logic")
print("- Ineligible country = hard stop")
print("- Employer denies remote = hard stop")
