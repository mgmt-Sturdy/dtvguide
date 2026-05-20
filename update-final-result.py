#!/usr/bin/env python3
"""
Update final result to show "Things that need attention" list with timeline
"""

with open('index.html', 'r') as f:
    content = f.read()

# Replace calculateFinalResult function
old_final = '''function calculateFinalResult() {
    questions.forEach(q => q.classList.remove('active'));
    progressContainer.style.display = 'none';
    
    const percentage = Math.round((currentScore / MAX_SCORE) * 100);
    
    // Check passport status for suggestion
    const passportAnswer = answers['2'];
    const needsPassportRenewal = (passportAnswer === 'under-6' || passportAnswer === 'expired');
    
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
        
        // Add passport suggestion if needed
        if (needsPassportRenewal) {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.className = 'suggestion-box';
            suggestionDiv.innerHTML = `
                <h4>🛂 Passport Renewal Needed</h4>
                <p>Your passport has less than 6 months validity or is expired. 
                You'll need to renew it before applying for the DTV. 
                Add 3-6 weeks for passport renewal to your timeline.</p>
            `;
            resultEl.insertBefore(suggestionDiv, resultEl.firstChild);
        }
    }
}'''

new_final = '''function calculateFinalResult() {
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
}'''

content = content.replace(old_final, new_final)

# Add CSS for issues section
issues_css = '''
        /* Issues Section Styles */
        .issues-section {
            background: var(--cream);
            border-radius: 12px;
            padding: 2rem;
            margin-bottom: 2rem;
            border: 1px solid var(--cream-dark);
        }
        
        .issues-section h3 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.5rem;
            color: var(--charcoal);
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .issues-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .issue-item {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            background: var(--white);
            padding: 1.25rem;
            border-radius: 8px;
            border-left: 4px solid var(--gold-deep);
        }
        
        .issue-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        
        .issue-content h4 {
            font-family: 'Cormorant Garamond', serif;
            font-size: 1.2rem;
            color: var(--charcoal);
            margin-bottom: 0.25rem;
        }
        
        .issue-content p {
            color: var(--charcoal-light);
            font-size: 0.95rem;
            margin-bottom: 0.5rem;
        }
        
        .issue-time {
            color: var(--gold-deep);
            font-weight: 500;
            font-size: 0.9rem;
        }
        
        .total-timeline {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 2px solid var(--cream-dark);
            text-align: center;
            font-size: 1.2rem;
            color: var(--charcoal);
        }
'''

# Insert before closing </style>
content = content.replace('</style>', issues_css + '</style>')

# Write file
with open('index.html', 'w') as f:
    f.write(content)

print("✅ Updated final result to show 'Things That Need Attention'")
print("Changes:")
print("- Lists all issues found (passport, income, permission, funds)")
print("- Shows estimated time for each issue")
print("- Calculates total timeline")
print("- Removed percentage display")
print("- Shows how the guide can help")
