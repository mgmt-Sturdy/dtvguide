// Read the current file
const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

// New quiz section
const newQuizSection = `            <div class="quiz-box">
                <!-- Email Capture (Question 0) -->
                <div class="quiz-question active" data-question="0">
                    <h3>Let's check your DTV eligibility</h3>
                    <p style="color: var(--charcoal-light); margin-bottom: 1.5rem;">Enter your email and we'll send you your results so you can come back to them.</p>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <input type="email" id="quiz-email" placeholder="your@email.com" style="padding: 1rem; border: 2px solid var(--cream-dark); border-radius: 8px; font-size: 1rem;">
                        <button class="btn btn-primary" onclick="saveEmailAndContinue()" style="width: 100%;">Start the Quiz</button>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--charcoal-light); margin-top: 1rem;">Takes 2 minutes. No spam, unsubscribe anytime.</p>
                </div>

                <div class="quiz-progress" style="display: none;">
                    <div class="quiz-progress-bar"></div>
                    <div class="quiz-progress-bar"></div>
                    <div class="quiz-progress-bar"></div>
                    <div class="quiz-progress-bar"></div>
                    <div class="quiz-progress-bar"></div>
                    <div class="quiz-progress-bar"></div>
                    <div class="quiz-progress-bar"></div>
                    <div class="quiz-progress-bar"></div>
                </div>

                <!-- Question 1: Residence -->
                <div class="quiz-question" data-question="1">
                    <h3>Where are you currently resident?</h3>
                    <div class="quiz-options">
                        <div class="quiz-option" data-value="uk-citizen">UK — I'm a British citizen</div>
                        <div class="quiz-option" data-value="uk-visa">UK — I'm here on a visa</div>
                        <div class="quiz-option" data-value="ireland">Ireland</div>
                        <div class="quiz-option" data-value="other">Other country</div>
                    </div>
                </div>

                <!-- Question 2: Passport Validity -->
                <div class="quiz-question" data-question="2">
                    <h3>Does your passport have at least 6 months validity?</h3>
                    <div class="quiz-options">
                        <div class="quiz-option" data-value="yes">Yes, 6+ months remaining</div>
                        <div class="quiz-option" data-value="under-6">Less than 6 months</div>
                        <div class="quiz-option" data-value="expired">Expired / don't have one</div>
                    </div>
                </div>

                <!-- Question 3: Remote Income -->
                <div class="quiz-question" data-question="3">
                    <h3>Do you currently have remote income?</h3>
                    <div class="quiz-options">
                        <div class="quiz-option" data-value="yes-employed">Yes — employed and work remotely</div>
                        <div class="quiz-option" data-value="yes-self">Yes — self-employed / run my own business</div>
                        <div class="quiz-option" data-value="yes-freelance">Yes — freelancer with clients</div>
                        <div class="quiz-option" data-value="no">No, I don't have remote income</div>
                    </div>
                </div>

                <!-- Question 4a: Workplace Permission (for employed) -->
                <div class="quiz-question" data-question="4a">
                    <h3>Can you get written permission from your employer to work from Thailand?</h3>
                    <div class="quiz-options">
                        <div class="quiz-option" data-value="yes-have">Yes, I already have it in writing</div>
                        <div class="quiz-option" data-value="yes-can-get">Yes, I can get it — they're flexible</div>
                        <div class="quiz-option" data-value="need-to-ask">I need to ask / not sure</div>
                        <div class="quiz-option" data-value="no">No, definitely not allowed</div>
                    </div>
                </div>

                <!-- Question 4b: Self-Employed Duration -->
                <div class="quiz-question" data-question="4b">
                    <h3>How long have you been self-employed or running your business?</h3>
                    <div class="quiz-options">
                        <div class="quiz-option" data-value="over-2-years">Over 2 years</div>
                        <div class="quiz-option" data-value="1-2-years">1–2 years</div>
                        <div class="quiz-option" data-value="6-12-months">6–12 months</div>
                        <div class="quiz-option" data-value="under-6-months">Under 6 months</div>
                    </div>
                </div>

                <!-- Question 4c: Tax Documentation -->
                <div class="quiz-question" data-question="4c">
                    <h3>What tax documentation do you have?</h3>
                    <div class="quiz-options">
                        <div class="quiz-option" data-value="paye-payslips">PAYE — 12 months of payslips</div>
                        <div class="quiz-option" data-value="self-filed">Self-employed — tax return filed</div>
                        <div class="quiz-option" data-value="self-not-yet">Self-employed — not filed yet (business new)</div>
                        <div class="quiz-option" data-value="mix">Mix of salary and dividends</div>
                    </div>
                </div>

                <!-- Question 5: Monthly Income (with dividends) -->
                <div class="quiz-question" data-question="5">
                    <h3>What's your average monthly income? (Include salary, dividends, all sources)</h3>
                    <div class="quiz-options">
                        <div class="quiz-option" data-value="over-3k">£3,000+ / month</div>
                        <div class="quiz-option" data-value="2-3k">£2,000–£3,000 / month</div>
                        <div class="quiz-option" data-value="1-2k">£1,000–£2,000 / month</div>
                        <div class="quiz-option" data-value="under-1k">Under £1,000 / month</div>
                    </div>
                </div>

                <!-- Question 6: Bank Balance -->
                <div class="quiz-question" data-question="6">
                    <h3>Can you show 500,000 THB (approx. £11,000–£12,000) in a bank account?</h3>
                    <div class="quiz-options">
                        <div class="quiz-option" data-value="yes-have">Yes, already have it</div>
                        <div class="quiz-option" data-value="yes-spread">Yes, spread across accounts</div>
                        <div class="quiz-option" data-value="soon">Will have it in 2-3 months</div>
                        <div class="quiz-option" data-value="no">No, won't be possible</div>
                    </div>
                </div>

                <!-- Question 7: Timeline -->
                <div class="quiz-question" data-question="7">
                    <h3>When do you want to apply for the DTV?</h3>
                    <div class="quiz-options">
                        <div class="quiz-option" data-value="asap">ASAP — I have documents ready</div>
                        <div class="quiz-option" data-value="1-2-months">In 1–2 months</div>
                        <div class="quiz-option" data-value="3-6-months">In 3–6 months</div>
                        <div class="quiz-option" data-value="researching">Just researching for now</div>
                    </div>
                </div>

                <!-- Result: No Remote Income -->
                <div class="quiz-result" id="result-no-remote">
                    <div class="quiz-result-icon">🎯</div>
                    <h3>The DTV Remote Work visa isn't right for you</h3>
                    <p>But don't worry — there are other options. The DTV has a different category called <strong>DTV2 — Thai Soft Power</strong> that covers:</p>
                    <ul style="text-align: left; margin: 1.5rem 0; color: var(--charcoal-light);">
                        <li>Muay Thai training</li>
                        <li>Thai cooking classes</li>
                        <li>Thai language courses</li>
                        <li>Medical treatment</li>
                    </ul>
                    <p>Same 5-year visa, same £300 fee — just a different purpose.</p>
                    <p style="margin-top: 1.5rem;"><strong>Want help figuring out your best option?</strong></p>
                    <a href="#consultation" class="btn btn-primary">Book a Consultation</a>
                </div>

                <!-- Result: Need Passport Renewal -->
                <div class="quiz-result" id="result-passport">
                    <div class="quiz-result-icon">🛂</div>
                    <h3>Renew your passport first</h3>
                    <p>The Thai Embassy requires at least 6 months validity on your passport. You'll need to renew before applying for the DTV.</p>
                    <p><strong>Estimated timeline:</strong> 3–6 weeks for passport renewal, then 2–4 weeks for DTV application.</p>
                    <p style="margin-top: 1.5rem;"><strong>Want the guide ready for when your passport arrives?</strong></p>
                    <a href="#products" class="btn btn-primary">Get the Guide</a>
                </div>

                <!-- Result: Need Workplace Permission -->
                <div class="quiz-result" id="result-need-permission">
                    <div class="quiz-result-icon">⏸️</div>
                    <h3>Get workplace permission first</h3>
                    <p>The Thai Embassy requires written proof that your employer allows remote work from Thailand. Without this, you can't get the DTV.</p>
                    <p><strong>Your next step:</strong> Ask your employer for a letter confirming you're authorized to work remotely from Thailand.</p>
                    <p style="margin-top: 1rem;">If they won't allow it, the DTV2 (Soft Power) route might work — cooking, Muay Thai, language courses, etc.</p>
                    <a href="#products" class="btn btn-primary">Get the Guide</a>
                </div>

                <!-- Result: Low Income Warning -->
                <div class="quiz-result" id="result-low-income">
                    <div class="quiz-result-icon">💡</div>
                    <h3>You may need additional income sources</h3>
                    <p>Under £1,000/month might be tight for Thailand living + the £11,000 bank requirement. The Embassy wants to see you can support yourself.</p>
                    <p>You're not disqualified — but consider:</p>
                    <ul style="text-align: left; margin: 1.5rem 0; color: var(--charcoal-light);">
                        <li>Building up additional income streams</li>
                        <li>Waiting until your business earns more</li>
                        <li>Looking at DTV2 Soft Power options instead</li>
                    </ul>
                    <a href="#products" class="btn btn-primary">Get the Guide</a>
                </div>

                <!-- Result: Likely Qualify -->
                <div class="quiz-result" id="result-likely">
                    <div class="quiz-result-icon">✅</div>
                    <h3>You likely qualify for the DTV Remote Work visa</h3>
                    <p>Based on your answers, you're in a strong position to apply. You have remote income, the right documentation, and can meet the financial requirements.</p>
                    <div id="timeline-display" style="background: var(--cream); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; text-align: left;">
                        <strong>Your estimated timeline:</strong>
                        <p id="timeline-text" style="margin-top: 0.5rem; margin-bottom: 0;">Calculating...</p>
                    </div>
                    <p>Next step: Get your documents formatted correctly. The Thai Embassy is strict — the £300 fee is non-refundable, and missing or poorly formatted documents = delays or rejection.</p>
                    <a href="#products" class="btn btn-primary">Get the Guide</a>
                </div>

                <!-- Result: Challenges -->
                <div class="quiz-result" id="result-challenges">
                    <div class="quiz-result-icon">⚠️</div>
                    <h3>You may face some challenges</h3>
                    <p>Not disqualifying, but worth addressing before applying. Common issues: bank balance timing, documentation format, or employment proof.</p>
                    <div id="timeline-display-challenges" style="background: var(--cream); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; text-align: left;">
                        <strong>Your estimated timeline:</strong>
                        <p id="timeline-text-challenges" style="margin-top: 0.5rem; margin-bottom: 0;">Calculating...</p>
                    </div>
                    <a href="#products" class="btn btn-primary">Get the Guide</a>
                </div>
            </div>`;

// Replace the quiz section
const startMarker = '<div class="quiz-box">';
const endMarker = '</section>';
const quizStart = content.indexOf(startMarker, content.indexOf('id="quiz"'));
const sectionEnd = content.indexOf('<!-- Products Section -->');

if (quizStart !== -1 && sectionEnd !== -1) {
    const beforeQuiz = content.substring(0, quizStart);
    const afterQuiz = content.substring(sectionEnd);
    const newContent = beforeQuiz + newQuizSection + '\n        </div>\n    </section>\n\n    ' + afterQuiz;
    fs.writeFileSync('index.html', newContent);
    console.log('Quiz section updated successfully');
} else {
    console.log('Could not find quiz section markers');
    console.log('quizStart:', quizStart, 'sectionEnd:', sectionEnd);
}