
// Bank Balance Question Functions
const REQUIRED_GBP = 11000;
const REQUIRED_USD = 14000;
const REQUIRED_THB = 500000;

function updateRequiredAmount() {
    const currency = document.getElementById('currency-select').value;
    const display = document.getElementById('required-amount-display');
    
    if (currency === 'GBP') {
        display.innerHTML = `
            <strong>Required: £${REQUIRED_GBP.toLocaleString()} GBP</strong> (or ${REQUIRED_THB.toLocaleString()} THB)
            <br>
            <span class="currency-note">Amount can vary due to currency fluctuations. Proof of funds will be required.</span>
        `;
    } else if (currency === 'USD') {
        display.innerHTML = `
            <strong>Required: $${REQUIRED_USD.toLocaleString()} USD</strong> (or ${REQUIRED_THB.toLocaleString()} THB)
            <br>
            <span class="currency-note">Amount can vary due to currency fluctuations. Proof of funds will be required.</span>
        `;
    }
}

function submitFunds() {
    const currency = document.getElementById('currency-select').value;
    const amount = parseFloat(document.getElementById('funds-amount').value);
    
    if (isNaN(amount) || amount < 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    const requiredAmount = currency === 'GBP' ? REQUIRED_GBP : REQUIRED_USD;
    const isSufficient = amount >= requiredAmount;
    
    // Store answer
    answers['6'] = {
        currency: currency,
        amount: amount,
        sufficient: isSufficient
    };
    questionPath.push('6');
    
    // Calculate points based on amount
    let points = 0;
    if (amount >= requiredAmount) {
        points = 20;
    } else if (amount >= requiredAmount * 0.7) {
        points = 10;
    } else if (amount >= requiredAmount * 0.5) {
        points = 5;
    }
    
    updateProgress(points);
    
    // Hide current question and show final result
    document.querySelectorAll('.quiz-question').forEach(q => q.classList.remove('active'));
    calculateFinalResult();
}


// DTV Eligible Countries List
const DTV_ELIGIBLE_COUNTRIES = [
    'Andorra', 'Argentina', 'Australia', 'Austria', 'Bahrain', 'Belgium', 
    'Brazil', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Cuba', 
    'Czech Republic', 'Denmark', 'Dominican Republic', 'Ecuador', 'Estonia', 
    'Finland', 'France', 'Germany', 'Greece', 'Guatemala', 'Hong Kong', 
    'Hungary', 'Iceland', 'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 
    'Jamaica', 'Japan', 'Latvia', 'Lithuania', 'Luxembourg', 'Macau', 
    'Malaysia', 'Mauritius', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 
    'Norway', 'Oman', 'Panama', 'Peru', 'Philippines', 'Poland', 'Portugal', 
    'Romania', 'San Marino', 'Saudi Arabia', 'Singapore', 'Slovakia', 
    'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 
    'Turkey', 'United Arab Emirates', 'United Kingdom', 'United States', 
    'Uruguay', 'Vietnam'
];

// All countries (DTV eligible + others for the dropdown)
const ALL_COUNTRIES = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 
    'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 
    'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 
    'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 
    'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 
    'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 
    'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 
    'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 
    'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 
    'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 
    'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 
    'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 
    'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 
    'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 
    'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 
    'Macau', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 
    'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 
    'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 
    'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 
    'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 
    'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 
    'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 
    'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 
    'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 
    'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 
    'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 
    'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 
    'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 
    'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 
    'Yemen', 'Zambia', 'Zimbabwe'
].sort();

// Country dropdown functions
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('country-search');
    const dropdown = document.getElementById('country-dropdown');
    const selectedInput = document.getElementById('selected-country');
    const selectedDisplay = document.getElementById('selected-country-display');
    const continueBtn = document.getElementById('country-continue');
    
    if (!searchInput) return;
    
    function populateDropdown(filter = '') {
        dropdown.innerHTML = '';
        
        const filtered = ALL_COUNTRIES.filter(country => 
            country.toLowerCase().includes(filter.toLowerCase())
        );
        
        filtered.forEach(country => {
            const isEligible = DTV_ELIGIBLE_COUNTRIES.includes(country);
            const option = document.createElement('div');
            option.className = `country-option ${isEligible ? 'dtv-eligible' : 'not-eligible'}`;
            option.textContent = country + (isEligible ? '' : ' (Not eligible)');
            option.dataset.value = country;
            option.dataset.eligible = isEligible;
            
            option.addEventListener('click', function() {
                selectedInput.value = country;
                selectedDisplay.innerHTML = `<strong>${country}</strong><br><span style="color: ${isEligible ? 'var(--green-dark)' : '#cc0000'}">${isEligible ? '✓ DTV Eligible' : '✗ Not eligible for DTV'}</span>`;
                selectedDisplay.className = `selected-country-display active ${isEligible ? 'eligible' : 'not-eligible'}`;
                searchInput.value = country;
                dropdown.classList.remove('active');
                continueBtn.disabled = false;
            });
            
            dropdown.appendChild(option);
        });
        
        if (filtered.length > 0) {
            dropdown.classList.add('active');
        } else {
            dropdown.classList.remove('active');
        }
    }
    
    searchInput.addEventListener('focus', () => populateDropdown());
    searchInput.addEventListener('input', (e) => populateDropdown(e.target.value));
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.country-search-container')) {
            dropdown.classList.remove('active');
        }
    });
});

function submitCountry() {
    const selectedCountry = document.getElementById('selected-country').value;
    const isEligible = DTV_ELIGIBLE_COUNTRIES.includes(selectedCountry);
    
    if (isEligible) {
        answers['1'] = selectedCountry;
        questionPath.push('1');
        document.querySelector('[data-question="1"]').classList.remove('active');
        showQuestion('2');
    } else {
        // Hard stop
        document.querySelector('.quiz-progress').style.display = 'none';
        document.querySelectorAll('.quiz-question').forEach(q => q.classList.remove('active'));
        const hardStop = document.getElementById('hard-stop-country');
        if (hardStop) hardStop.classList.add('show');
    }
}

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
        message: 'Your employer doesn\'t allow remote work from abroad. You\'ll need to either:<br><br>1. Request permission from your employer<br>2. Find a new job that allows remote work<br>3. Switch to self-employed/freelance work<br><br>Come back once you have remote work permission.'
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
    userEmail = emailInput.value.trim();
    
    if (!userEmail || !userEmail.includes('@')) {
        alert('Please enter a valid email address');
        emailInput.focus();
        return;
    }
    
    const q0 = document.querySelector('[data-question="0"]');
    if (q0) q0.classList.remove('active');
    
    const progressEl = document.getElementById('progress-container');
    if (progressEl) progressEl.style.display = 'block';
    
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
            // All passport answers continue - no hard stop
            if (answer === '6plus') {
                updateProgress(calculatePoints('passport', '6plus'));
            } else {
                // Under 6 months or expired gets 0 points but continues
                // Suggestion will show at the end if needed
                updateProgress(0);
            }
            showQuestion('3');
            break;
        case '3': // Remote income
            if (answer === 'no') {
                calculateTimelineAndShowResult('no-remote');
            } else {
                updateProgress(calculatePoints('remote-income', answer));
                if (answer === 'yes-employed') {
                    showQuestion('4a'); // Go straight to workplace permission
                } else {
                    showQuestion('4c');
                }
            }
            break;
        case '4a': // Workplace permission
            if (answer === 'no') {
                // Hard stop - can't get permission
                showHardStop('employer-denies-remote');
            } else {
                updateProgress(calculatePoints('work-permission', answer));
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
        case '6': // Bank balance - after submitFunds, calculate final result
            // submitFunds() already called, now calculate final result
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
    
    // Build list of things that need attention
    const issues = [];
    let totalWeeks = 0;
    
    // Check passport
    const passportAnswer = answers['2'];
    if (passportAnswer === 'under-6' || passportAnswer === 'expired') {
        issues.push({
            icon: '🛂',
            title: 'Passport Renewal',
            description: 'Your passport has less than 6 months validity.',
            time: '4 weeks',
            weeks: 4
        });
        totalWeeks += 4;
    }
    
    // Check income
    const incomeAnswer = answers['5'];
    if (incomeAnswer === 'under-1k') {
        issues.push({
            icon: '💰',
            title: 'Increase Income',
            description: 'You need to show £1,000+ monthly income.',
            time: '8 weeks',
            weeks: 8
        });
        totalWeeks += 8;
    }
    
    // Check workplace permission
    const permissionAnswer = answers['4a'];
    if (permissionAnswer === 'need-to-ask') {
        issues.push({
            icon: '📝',
            title: 'Workplace Permission Letter',
            description: 'You need written permission from your employer.',
            time: '1 week',
            weeks: 1
        });
        totalWeeks += 1;
    }
    
    // Check funds
    const fundsAnswer = answers['6'];
    if (fundsAnswer && !fundsAnswer.sufficient) {
        const neededAmount = fundsAnswer.currency === 'GBP' ? '£11,000' : '$14,000';
        const shortfall = Math.round((11000 - fundsAnswer.amount) / 1000) * 1000;
        issues.push({
            icon: '🏦',
            title: 'Build Up Savings',
            description: `You need ${neededAmount} in your account.`,
            time: '4 weeks',
            weeks: 4
        });
        totalWeeks += 4;
    }
    
    // Determine result type based on number of issues
    let resultId = issues.length === 0 ? 'likely' : 'challenges';
    
    const resultEl = document.getElementById('result-' + resultId);
    if (resultEl) {
        resultEl.classList.add('show');
        
        // Build the issues list HTML
        let issuesHTML = '';
        if (issues.length > 0) {
            issuesHTML = `
                <div class="issues-section">
                    <h3>📋 Things That Need Attention</h3>
                    <div class="issues-list">
                        ${issues.map(issue => `
                            <div class="issue-item">
                                <div class="issue-icon">${issue.icon}</div>
                                <div class="issue-content">
                                    <h4>${issue.title}</h4>
                                    <p>${issue.description}</p>
                                    <span class="issue-time">⏱️ ${issue.time}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="total-timeline">
                        <strong>Estimated time to ready: ${Math.ceil(totalWeeks / 4)} months</strong>
                    </div>
                </div>
            `;
        } else {
            issuesHTML = `
                <div class="issues-section">
                    <h3>✅ You're Ready!</h3>
                    <p>You meet all the basic requirements. You can start your DTV application now.</p>
                </div>
            `;
        }
        
        // Insert issues section at the beginning
        const issuesDiv = document.createElement('div');
        issuesDiv.innerHTML = issuesHTML;
        resultEl.insertBefore(issuesDiv, resultEl.firstChild);
        
        // Update timeline text
        const timelineText = resultEl.querySelector('[id^="timeline-text"]');
        if (timelineText) {
            timelineText.textContent = issues.length === 0 ? 'Ready to Apply' : 'Action Required';
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
