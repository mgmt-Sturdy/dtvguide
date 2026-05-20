#!/usr/bin/env python3
"""
Update Question 6 - Bank Balance with Currency Selector
"""

import re

with open('index.html', 'r') as f:
    content = f.read()

# Old Question 6
old_question_6 = '''                <!-- Question 6: Bank Balance -->
                <div class="quiz-question" data-question="6">
                    <h3>Can you show 500,000 THB (approx. £11,000–£12,000) in a bank account?</h3>
                    <div class="quiz-options">
                        <div class="quiz-option" data-value="yes-have">Yes, already have it</div>
                        <div class="quiz-option" data-value="yes-spread">Yes, spread across accounts</div>
                        <div class="quiz-option" data-value="soon">Will have it in 2-3 months</div>
                        <div class="quiz-option" data-value="no">No, won't be possible</div>
                    </div>
                </div>'''

# New Question 6 with currency selector
new_question_6 = '''                <!-- Question 6: Bank Balance with Currency Selector -->
                <div class="quiz-question" data-question="6">
                    <h3>This visa requires proof of funds. Can you show in your application the required amount?</h3>
                    <p>Select your currency and enter how much you can show.</p>
                    
                    <div class="funds-input-container">
                        <div class="currency-selector">
                            <select id="currency-select" onchange="updateRequiredAmount()">
                                <option value="GBP">🇬🇧 GBP (British Pounds)</option>
                                <option value="USD">🇺🇸 USD (US Dollars)</option>
                            </select>
                        </div>
                        
                        <div class="amount-input-wrapper">
                            <input type="number" 
                                   id="funds-amount" 
                                   class="funds-amount-input" 
                                   placeholder="Enter amount"
                                   min="0"
                                   step="100">
                        </div>
                        
                        <div class="required-amount-display" id="required-amount-display">
                            <strong>Required: £11,000 GBP</strong> (or 500,000 THB)
                            <br>
                            <span class="currency-note">Amount can vary due to currency fluctuations. Proof of funds will be required.</span>
                        </div>
                        
                        <button class="btn btn-primary" id="funds-continue" onclick="submitFunds()">Continue</button>
                    </div>
                </div>'''

content = content.replace(old_question_6, new_question_6)

# Add styles for the new question
funds_styles = '''
        /* Funds Question Styles */
        .funds-input-container {
            max-width: 400px;
            margin: 2rem auto;
            text-align: center;
        }
        
        .currency-selector {
            margin-bottom: 1rem;
        }
        
        .currency-selector select {
            padding: 0.75rem 1rem;
            font-size: 1rem;
            border: 2px solid var(--cream-dark);
            border-radius: 8px;
            background: var(--white);
            color: var(--charcoal);
            cursor: pointer;
            width: 100%;
        }
        
        .amount-input-wrapper {
            margin-bottom: 1rem;
        }
        
        .funds-amount-input {
            width: 100%;
            padding: 1rem;
            font-size: 1.5rem;
            text-align: center;
            border: 2px solid var(--cream-dark);
            border-radius: 8px;
            background: var(--white);
            color: var(--charcoal);
        }
        
        .funds-amount-input:focus {
            outline: none;
            border-color: var(--gold-deep);
        }
        
        .required-amount-display {
            background: var(--cream);
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            border-left: 4px solid var(--gold-deep);
        }
        
        .currency-note {
            font-size: 0.85rem;
            color: var(--charcoal-light);
        }
'''

# Insert before closing </style>
content = content.replace('</style>', funds_styles + '\n</style>')

# Add JavaScript for funds question before the main quiz logic
funds_js = '''
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
    
    if (isNaN(amount) || amount <= 0) {
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
    
    // Show next question
    showQuestion('7');
}

'''

# Find the script section and add funds functions
script_pattern = r'(<script>)'
content = re.sub(script_pattern, r'\1\n' + funds_js, content)

# Update the routing for case '6' in routeQuiz function
old_case_6 = """        case '6': // Bank balance
            updateProgress(calculatePoints('bank-balance', answer));
            showQuestion('7');
            break;"""

new_case_6 = """        case '6': // Bank balance - handled by submitFunds() function
            // This is handled by the submitFunds() function above
            break;"""

content = content.replace(old_case_6, new_case_6)

# Write updated file
with open('index.html', 'w') as f:
    f.write(content)

print("✅ Updated Question 6 with currency selector")
print("Changes:")
print("- New question text: 'This visa requires proof of funds...'")
print("- Currency selector: GBP or USD")
print("- Amount input field (user enters number)")
print("- Shows required amount: £11,000 GBP / $14,000 USD / 500,000 THB")
print("- Note about currency fluctuations and proof of funds")
