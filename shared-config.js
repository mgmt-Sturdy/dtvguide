// Shared Config - Used by both client and Apps Script
// Paste identical content into Google Apps Script

const SCORING = {
  '3': { '6plus': 15 },
  '4': { 'yes-employed': 30, 'yes-self': 30, 'yes-freelance': 30 },
  '5a': { 'yes-have': 20, 'yes-can-get': 15, 'need-to-ask': 10 },
  '5c': { 'paye-payslips': 20, 'self-filed': 20, 'mix': 20, 'self-not-yet': 10 },
  '5': { 'over-3k': 15, '2-3k': 15, '1-2k': 15, 'under-1k': 0 },
  '6': { 'yes-have': 20, 'yes-spread': 15, 'soon': 10 },
  '7': { 'sufficient': 20 }
};

const MAX_SCORE = 140; // Sum of all max points

const HARD_STOPS = {
  '2': { 'other': 'country', 'none': 'country' }, // Country check
  '4': { 'no': 'remote-work' } // No remote income
};

function calculatePoints(questionId, answer) {
  const q = SCORING[questionId];
  if (!q) return 0;
  return q[answer] || 0;
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SCORING, MAX_SCORE, HARD_STOPS, calculatePoints };
}
