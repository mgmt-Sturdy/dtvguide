// Bank Balance Question - Currency Selector Functions

const REQUIRED_GBP = 11000;
const REQUIRED_USD = 14000; // Approximate
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
    
    // Determine if sufficient
    let requiredAmount = currency === 'GBP' ? REQUIRED_GBP : REQUIRED_USD;
    let isSufficient = amount >= requiredAmount;
    
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
        points = 20; // Full amount
    } else if (amount >= requiredAmount * 0.7) {
        points = 10; // 70% or more
    } else if (amount >= requiredAmount * 0.5) {
        points = 5; // 50% or more
    }
    
    updateProgress(points);
    
    // Show next question
    showQuestion('7');
}

// Add input validation
document.addEventListener('DOMContentLoaded', function() {
    const fundsInput = document.getElementById('funds-amount');
    if (fundsInput) {
        fundsInput.addEventListener('input', function() {
            const amount = parseFloat(this.value);
            const currency = document.getElementById('currency-select').value;
            const required = currency === 'GBP' ? REQUIRED_GBP : REQUIRED_USD;
            
            // Could show live validation here if needed
        });
    }
});
