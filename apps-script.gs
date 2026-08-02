// DTV Quiz - Google Apps Script
// Copy this entire file into your Google Apps Script project

// CORS workaround - Apps Script doesn't allow custom headers
// Use text/plain content type from client to avoid preflight

const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Replace with your actual Sheet ID
const SHEET_NAME = 'Quiz Submissions';
const PAID_SHEET_NAME = 'Paid - Personalised Guide';

// Main entry point
function doPost(e) {
  try {
    // Parse request - handle both JSON and plain text
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonResponse({ ok: false, error: 'invalid_json' });
    }

    // Validation
    const validation = validateSubmission(data);
    if (!validation.valid) {
      return jsonResponse({ ok: false, error: validation.error });
    }

    // Honeypot check
    if (data.honeypot) {
      // Silently drop spam submissions
      return jsonResponse({ ok: true }); // Pretend success
    }

    // Speed check (anti-bot)
    if (data.timestamp) {
      const timeTaken = Date.now() - parseInt(data.timestamp);
      if (timeTaken < 5000) { // Under 5 seconds
        return jsonResponse({ ok: false, error: 'too_fast' });
      }
    }

    // Calculate score server-side from raw answers
    const scoreResult = calculateScoreServerSide(data.answers);

    // Check for duplicate email
    const isDuplicate = checkDuplicate(data.email);
    if (isDuplicate) {
      // Update existing record rather than duplicate
      updateExistingRecord(data.email, data, scoreResult);
    } else {
      // Append new record
      appendToSheet(data, scoreResult);
    }

    return jsonResponse({ 
      ok: true, 
      score: scoreResult.percentage,
      status: scoreResult.status
    });

  } catch (err) {
    Logger.log('Error: ' + err.toString());
    return jsonResponse({ ok: false, error: 'server_error' });
  }
}

// Entry point for the Personalised Guide paywall checks
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'verifySession') {
      return jsonResponse(verifyStripeSession(e.parameter.session_id));
    }

    if (action === 'verifyEmail') {
      return jsonResponse(verifyPaidEmail(e.parameter.email));
    }

    return jsonResponse({ ok: false, error: 'unknown_action' });
  } catch (err) {
    Logger.log('Error: ' + err.toString());
    return jsonResponse({ ok: false, error: 'server_error' });
  }
}

// Reads the Stripe secret key from Script Properties - never hardcode it here,
// this file is committed to a public repo. Set it in the Apps Script editor:
// Project Settings -> Script Properties -> STRIPE_SECRET_KEY
function getStripeSecretKey() {
  return PropertiesService.getScriptProperties().getProperty('STRIPE_SECRET_KEY');
}

// Confirms a Stripe Checkout Session actually completed payment, then records
// the buyer's email so they can unlock again later from another device.
function verifyStripeSession(sessionId) {
  if (!sessionId) return { ok: false, error: 'missing_session_id' };

  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    Logger.log('STRIPE_SECRET_KEY script property is not set');
    return { ok: false, error: 'not_configured' };
  }

  try {
    const response = UrlFetchApp.fetch(
      'https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId),
      {
        method: 'get',
        headers: { Authorization: 'Basic ' + Utilities.base64Encode(secretKey + ':') },
        muteHttpExceptions: true
      }
    );

    if (response.getResponseCode() !== 200) {
      return { ok: false, error: 'session_not_found' };
    }

    const session = JSON.parse(response.getContentText());
    if (session.payment_status !== 'paid') {
      return { ok: false, error: 'not_paid' };
    }

    const email = session.customer_details && session.customer_details.email;
    if (!email) {
      return { ok: false, error: 'no_email_on_session' };
    }

    recordPaidAccess(email, sessionId);
    return { ok: true, email: email };
  } catch (err) {
    Logger.log('Error verifying Stripe session: ' + err.toString());
    return { ok: false, error: 'server_error' };
  }
}

// Looks up whether an email has a recorded paid purchase
function verifyPaidEmail(email) {
  if (!email) return { ok: false, error: 'missing_email' };
  return { ok: isEmailPaid(email) };
}

// Appends a paid record, skipping if this session was already recorded
function recordPaidAccess(email, sessionId) {
  try {
    const sheet = getOrCreatePaidSheet();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === sessionId) return; // already recorded
    }

    sheet.appendRow([email, sessionId, new Date()]);
  } catch (err) {
    Logger.log('Error recording paid access: ' + err.toString());
  }
}

// Checks the paid sheet for a matching email
function isEmailPaid(email) {
  try {
    const sheet = getOrCreatePaidSheet();
    const data = sheet.getDataRange().getValues();
    const normalized = email.trim().toLowerCase();

    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim().toLowerCase() === normalized) {
        return true;
      }
    }
    return false;
  } catch (err) {
    Logger.log('Error checking paid email: ' + err.toString());
    return false;
  }
}

function getOrCreatePaidSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(PAID_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(PAID_SHEET_NAME);
    sheet.appendRow(['Email', 'Stripe Session ID', 'Timestamp']);
  }
  return sheet;
}

// Calculate score from raw answers (single source of truth)
function calculateScoreServerSide(answers) {
  const SCORING = {
    '3': { '6plus': 15 },
    '4': { 'yes-employed': 30, 'yes-self': 30, 'yes-freelance': 30 },
    '5a': { 'yes-have': 20, 'yes-can-get': 15, 'need-to-ask': 10 },
    '5c': { 'paye-payslips': 20, 'self-filed': 20, 'mix': 20, 'self-not-yet': 10 },
    '5': { 'over-3k': 15, '2-3k': 15, '1-2k': 15, 'under-1k': 0 },
    '6': { 'yes-have': 20, 'yes-spread': 15, 'soon': 10 },
    '7': { 'sufficient': 20 }
  };

  const MAX_SCORE = 140;
  let score = 0;
  let issues = [];

  // Calculate points
  for (const [qId, answer] of Object.entries(answers || {})) {
    const q = SCORING[qId];
    if (q && q[answer]) {
      score += q[answer];
    }
  }

  // Handle funds object
  if (answers && answers['7']) {
    const funds = answers['7'];
    if (typeof funds === 'object' && funds.sufficient) {
      score += 20;
    }
  }

  const percentage = Math.round((score / MAX_SCORE) * 100);

  // Determine status
  let status;
  if (percentage >= 80) {
    status = 'Eligible';
  } else if (percentage >= 50) {
    status = 'Challenges';
  } else {
    status = 'Needs Work';
  }

  return { score, percentage, status, issues };
}

// Validation
function validateSubmission(data) {
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!data.email || !emailRegex.test(data.email)) {
    return { valid: false, error: 'invalid_email' };
  }

  // Country required
  if (!data.country) {
    return { valid: false, error: 'missing_country' };
  }

  return { valid: true };
}

// Check for duplicate email
function checkDuplicate(email) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) return false;

    const data = sheet.getDataRange().getValues();
    const emailColumn = 0; // Assuming email is first column

    for (let i = 1; i < data.length; i++) { // Skip header
      if (data[i][emailColumn] === email) {
        return true;
      }
    }
    return false;
  } catch (err) {
    Logger.log('Error checking duplicates: ' + err.toString());
    return false;
  }
}

// Update existing record
function updateExistingRecord(email, data, scoreResult) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const sheetData = sheet.getDataRange().getValues();

    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === email) {
        // Update row
        const row = i + 1;
        sheet.getRange(row, 2).setValue(new Date()); // Update timestamp
        sheet.getRange(row, 16).setValue(scoreResult.percentage + '%'); // Update score
        break;
      }
    }
  } catch (err) {
    Logger.log('Error updating record: ' + err.toString());
  }
}

// Append to sheet
function appendToSheet(data, scoreResult) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const answers = data.answers || {};

    // Extract funds data
    let fundsAmount = '';
    let fundsCurrency = '';
    let fundsSufficient = '';
    if (answers['7']) {
      const funds = answers['7'];
      if (typeof funds === 'object') {
        fundsAmount = funds.amount || '';
        fundsCurrency = funds.currency || '';
        fundsSufficient = funds.sufficient ? 'Yes' : 'No';
      }
    }

    const row = [
      data.email,
      new Date(),
      data.country || answers['2'] || '',
      answers['3'] || '', // Passport
      answers['4'] || '', // Remote income
      answers['5a'] || '', // Workplace permission
      answers['5c'] || '', // Tax docs
      answers['5'] || '', // Monthly income
      fundsAmount,
      fundsCurrency,
      fundsSufficient,
      scoreResult.percentage + '%',
      scoreResult.status,
      data.timestamp || '',
      data.timeTaken || '',
      JSON.stringify(answers) // Raw answers for debugging
    ];

    sheet.appendRow(row);
  } catch (err) {
    Logger.log('Error appending to sheet: ' + err.toString());
    throw err;
  }
}

// JSON response helper
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Test function
function testCalculation() {
  const testAnswers = {
    '3': '6plus',
    '4': 'yes-employed',
    '5a': 'yes-have',
    '5': 'over-3k',
    '7': { sufficient: true, amount: 15000, currency: 'GBP' }
  };

  const result = calculateScoreServerSide(testAnswers);
  Logger.log('Score: ' + result.score + ', Percentage: ' + result.percentage + '%');
}
