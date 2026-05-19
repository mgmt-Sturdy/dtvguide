// Read the current file
const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// New JavaScript for the quiz
const newScript = `    <script>
        // Quiz Logic
        const questions = document.querySelectorAll('.quiz-question');
        const progressBars = document.querySelectorAll('.quiz-progress-bar');
        const resultLikely = document.getElementById('result-likely');
        const resultChallenges = document.getElementById('result-challenges');
        const resultNoRemote = document.getElementById('result-no-remote');
        const resultNeedPermission = document.getElementById('result-need-permission');
        const resultLowIncome = document.getElementById('result-low-income');
        const resultPassport = document.getElementById('result-passport');
        
        let userEmail = '';
        let questionPath = [];
        const answers = {};

        // Save email and start quiz
        function saveEmailAndContinue() {
            const emailInput = document.getElementById('quiz-email');
            userEmail = emailInput.value;
            
            if (!userEmail || !userEmail.includes('@')) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Hide email question, show progress and first question
            document.querySelector('[data-question="0"]').classList.remove('active');
            document.querySelector('.quiz-progress').style.display = 'flex';
            showQuestion('1');
            questionPath.push('0');
        }

        // Handle option clicks
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', function() {
                const questionEl = this.closest('.quiz-question');
                const questionId = questionEl.dataset.question;
                
                // Store answer
                answers[questionId] = this.dataset.value;
                questionPath.push(questionId);
                
                // Visual selection
                questionEl.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                
                // Handle routing based on answers
                setTimeout(() => {
                    routeQuiz(questionId, this.dataset.value);
                }, 300);
            });
        });

        function routeQuiz(currentQId, answer) {
            // Hide current
            questions.forEach(q => q.classList.remove('active'));
            
            // Update progress bar
            const progressIndex = questionPath.length;
            progressBars.forEach((bar, index) => {
                bar.classList.toggle('active', index < progressIndex);
            });
            
            switch(currentQId) {
                case '1': // Residence
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
                    } else if (answer === 'yes-employed') {
                        showQuestion('4a');
                    } else {
                        showQuestion('4b');
                    }
                    break;
                    
                case '4a': // Workplace permission
                    if (answer === 'no') {
                        calculateTimelineAndShowResult('need-permission');
                    } else if (answer === 'need-to-ask') {
                        // Still let them continue but note they need to ask
                        showQuestion('4c');
                    } else {
                        showQuestion('4c');
                    }
                    break;
                    
                case '4b': // Self-employed duration
                    showQuestion('4c');
                    break;
                    
                case '4c': // Tax documentation
                    showQuestion('5');
                    break;
                    
                case '5': // Monthly income
                    if (answer === 'under-1k') {
                        calculateTimelineAndShowResult('low-income');
                    } else {
                        showQuestion('6');
                    }
                    break;
                    
                case '6': // Bank balance
                    showQuestion('7');
                    break;
                    
                case '7': // Timeline preference
                    calculateFinalResult();
                    break;
            }
        }

        function showQuestion(questionId) {
            const nextQuestion = document.querySelector('.quiz-question[data-question="' + questionId + '"');
            if (nextQuestion) {
                nextQuestion.classList.add('active');
            }
        }

        function calculateTimelineAndShowResult(resultId) {
            // Hide all questions
            questions.forEach(q => q.classList.remove('active'));
            document.querySelector('.quiz-progress').style.display = 'none';
            
            // Calculate timeline
            const timeline = calculateTimeline();
            
            // Show result with timeline
            const resultEl = document.getElementById('result-' + resultId);
            resultEl.classList.add('show');
            
            // Send email if we have one
            if (userEmail) {
                sendResultsEmail(userEmail, resultId, timeline);
            }
        }

        function calculateFinalResult() {
            // Hide all questions
            questions.forEach(q => q.classList.remove('active'));
            document.querySelector('.quiz-progress').style.display = 'none';
            
            // Calculate qualification score
            let score = 0;
            let issues = [];
            
            // Must have remote income
            if (answers['3'] && answers['3'] !== 'no') score += 1;
            
            // Bank balance
            if (['yes-have', 'yes-spread'].includes(answers['6'])) {
                score += 2;
            } else if (answers['6'] === 'soon') {
                score += 1;
                issues.push('funds-soon');
            } else {
                issues.push('funds-no');
            }
            
            // Workplace permission (for employed)
            if (answers['3'] === 'yes-employed') {
                if (['yes-have', 'yes-can-get'].includes(answers['4a'])) {
                    score += 2;
                } else {
                    issues.push('permission-unclear');
                }
            }
            
            // Self-employed tax status
            if (answers['3'] === 'yes-self' || answers['3'] === 'yes-freelance') {
                if (answers['4c'] === 'self-filed' || answers['4c'] === 'mix') {
                    score += 2;
                } else if (answers['4c'] === 'self-not-yet') {
                    score += 1;
                    issues.push('tax-pending');
                } else {
                    issues.push('tax-issue');
                }
            }
            
            // Income level
            if (['over-3k', '2-3k', '1-2k'].includes(answers['5'])) {
                score += 1;
            }
            
            // Calculate timeline
            const timeline = calculateTimeline();
            
            // Show appropriate result
            if (score >= 5 && issues.length === 0) {
                resultLikely.classList.add('show');
                document.getElementById('timeline-text').textContent = timeline;
            } else {
                resultChallenges.classList.add('show');
                document.getElementById('timeline-text-challenges').textContent = timeline;
            }
            
            // Send email
            if (userEmail) {
                const resultType = score >= 5 && issues.length === 0 ? 'likely' : 'challenges';
                sendResultsEmail(userEmail, resultType, timeline);
            }
        }

        function calculateTimeline() {
            const applicationTiming = answers['7'];
            const hasFunds = ['yes-have', 'yes-spread'].includes(answers['6']);
            const hasPermission = answers['4a'] === 'yes-have' || answers['4a'] === 'yes-can-get';
            const hasTaxDocs = answers['4c'] === 'paye-payslips' || answers['4c'] === 'self-filed' || answers['4c'] === 'mix';
            
            let weeks = 0;
            let stages = [];
            
            // Document gathering time
            if (!hasFunds) {
                stages.push('Save £11,000 (2-3 months)');
                weeks += 12;
            }
            
            if (!hasPermission && answers['3'] === 'yes-employed') {
                stages.push('Get workplace permission (1-2 weeks)');
                weeks += 2;
            }
            
            if (!hasTaxDocs) {
                stages.push('Gather tax documents (1-2 weeks)');
                weeks += 2;
            }
            
            // Application prep
            stages.push('Prepare DTV application (1-2 weeks)');
            weeks += 2;
            
            // Embassy processing
            stages.push('Embassy processing (15+ working days)');
            weeks += 3;
            
            // Total
            const totalMonths = Math.ceil(weeks / 4);
            
            if (applicationTiming === 'asap') {
                if (weeks <= 4) {
                    return 'You could be ready to apply in ' + weeks + ' weeks. Start now!';
                } else {
                    return 'You could be ready to apply in about ' + totalMonths + ' months.';
                }
            } else if (applicationTiming === '1-2-months') {
                return 'Target: Apply in 1-2 months. You should start preparing documents now.';
            } else if (applicationTiming === '3-6-months') {
                return 'Good planning window. Start gathering documents in ' + (totalMonths - 2) + ' months.';
            } else {
                return 'Estimated time to ready: ' + totalMonths + ' months when you decide to apply.';
            }
        }

        function sendResultsEmail(email, resultType, timeline) {
            // This would connect to your email service
            console.log('Sending results to:', email);
            console.log('Result:', resultType);
            console.log('Timeline:', timeline);
            // Implementation depends on your backend
        }

        // FAQ Accordion
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                const isOpen = item.classList.contains('open');
                
                // Close all
                document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
                
                // Open clicked if it was closed
                if (!isOpen) {
                    item.classList.add('open');
                }
            });
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    </script>`;

// Replace the script section
const startMarker = '<script>';
const endMarker = '</script>';
const scriptStart = content.lastIndexOf(startMarker);
const scriptEnd = content.lastIndexOf(endMarker);

if (scriptStart !== -1 && scriptEnd !== -1 && scriptEnd > scriptStart) {
    const beforeScript = content.substring(0, scriptStart);
    const afterScript = content.substring(scriptEnd + 9);
    const newContent = beforeScript + newScript + afterScript;
    fs.writeFileSync('index.html', newContent);
    console.log('JavaScript updated successfully');
} else {
    console.log('Could not find script markers');
}

// Also save a local backup of the quiz structure
const quizBackup = {
    version: '2.0',
    lastUpdated: new Date().toISOString(),
    questions: [
        { id: '0', type: 'email', text: 'Enter your email' },
        { id: '1', type: 'residence', text: 'Where are you resident?' },
        { id: '2', type: 'passport', text: 'Passport validity?' },
        { id: '3', type: 'income_type', text: 'Remote income?' },
        { id: '4a', type: 'workplace_permission', text: 'Can you get workplace permission?', condition: 'employed' },
        { id: '4b', type: 'self_employed_duration', text: 'How long self-employed?', condition: 'self_employed' },
        { id: '4c', type: 'tax_docs', text: 'What tax documentation?' },
        { id: '5', type: 'monthly_income', text: 'Monthly income (incl dividends)?' },
        { id: '6', type: 'bank_balance', text: 'Can you show £11k?' },
        { id: '7', type: 'timeline', text: 'When do you want to apply?' }
    ],
    results: ['likely', 'challenges', 'no-remote', 'need-permission', 'low-income', 'passport'],
    logic: 'see JavaScript for routing rules'
};

fs.writeFileSync('quiz-structure-backup.json', JSON.stringify(quizBackup, null, 2));
console.log('Quiz structure backup saved to quiz-structure-backup.json');
