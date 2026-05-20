#!/usr/bin/env python3
"""
Remove Question 7 and add hard stop for 4a "no"
"""

with open('index.html', 'r') as f:
    content = f.read()

# Remove Question 7 HTML
import re
question7_pattern = r'''                <!-- Question 7: Timeline -->
                <div class="quiz-question" data-question="7">
                    <h3>When do you want to apply for the DTV\?</h3>
                    <div class="quiz-options">
                        <div class="quiz-option" data-value="asap">ASAP — I have documents ready</div>
                        <div class="quiz-option" data-value="1-2-months">In 1–2 months</div>
                        <div class="quiz-option" data-value="3-6-months">In 3–6 months</div>
                        <div class="quiz-option" data-value="researching">Just researching for now</div>
                    </div>
                </div>

'''

content = re.sub(question7_pattern, '', content)

# Update case 4a to have hard stop for "no"
old_4a = """        case '4a': // Workplace permission
            updateProgress(calculatePoints('work-permission', answer));
            if (answer === 'no') {
                calculateTimelineAndShowResult('need-permission');
            } else {
                showQuestion('5');
            }
            break;"""

new_4a = """        case '4a': // Workplace permission
            if (answer === 'no') {
                // Hard stop - can't get permission
                showHardStop('employer-denies-remote');
            } else {
                updateProgress(calculatePoints('work-permission', answer));
                showQuestion('5');
            }
            break;"""

content = content.replace(old_4a, new_4a)

# Update case 6 to go straight to final result
old_case_6 = """        case '6': // Bank balance - handled by submitFunds() function
            // This is handled by the submitFunds() function above
            break;"""

new_case_6 = """        case '6': // Bank balance - after submitFunds, calculate final result
            // submitFunds() already called, now calculate final result
            calculateFinalResult();
            break;"""

content = content.replace(old_case_6, new_case_6)

# Remove references to question 7 in calculateFinalResult
old_final = """        case '7': // Timeline
            calculateFinalResult();
            break;
    }
}"""

new_final = """    }
}"""

content = content.replace(old_final, new_final)

# Write file
with open('index.html', 'w') as f:
    f.write(content)

print("✅ Removed Question 7 (timeline)")
print("✅ Question 4a 'no' now hard stops")
print("✅ Quiz ends after Question 6 (funds)")
