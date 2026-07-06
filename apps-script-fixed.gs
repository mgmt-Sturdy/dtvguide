// DTV Quiz - Google Apps Script (Fixed Version)
// Copy this entire file into your Google Apps Script project

const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // REPLACE THIS with your actual Sheet ID
const SHEET_NAME = 'Quiz Submissions';

function doPost(e) {
  try {
    // Parse the request data
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonResponse({ ok: false, error: 'invalid_json' });
    }

    // Validate required fields
    if (!data.email || data.email.indexOf('@') === -1) {
      return jsonResponse({ ok: false, error: 'invalid_email' });
    }

    // Honeypot check - silently drop spam
    if (data.honeypot && data.honeypot !== '') {
      return jsonResponse({ ok: true }); // Pretend success
    }

    // Speed check - reject if completed too fast (under 5 seconds)
    if (data.timestamp) {
      var timeTaken = Date.now() - parseInt(data.timestamp);
      if (timeTaken < 5000) {
        return jsonResponse({ ok: false, error: 'too_fast' });
      }
    }

    // Calculate score server-side from raw answers
    var scoreResult = calculateScore(data.answers);

    // Try to save to sheet (don't fail if sheet not set up)
    try {
      saveToSheet(data, scoreResult);
    } catch (sheetErr) {
      Logger.log('Sheet save error (non-critical): ' + sheetErr.toString());
    }

    return jsonResponse({ 
      ok: true, 
      score: scoreResult.percentage,
      status: scoreResult.status
    });

  } catch (err) {
    Logger.log('Fatal error: ' + err.toString());
    return jsonResponse({ ok: false, error: 'server_error' });
  }
}

function calculateScore(answers) {
  var score = 0;
  var maxScore = 140;
  
  // Q3: Passport validity
  if (answers && answers['3'] === '6plus') {
    score += 15;
  }
  
  // Q4: Remote income type
  if (answers && answers['4']) {
    var income = answers['4'];
    if (income === 'yes-employed' || income === 'yes-self' || income === 'yes-freelance') {
      score += 30;
    }
  }
  
  // Q5a: Workplace permission
  if (answers && answers['5a']) {
    var perm = answers['5a'];
    if (perm === 'yes-have') score += 20;
    else if (perm === 'yes-can-get') score += 15;
    else if (perm === 'need-to-ask') score += 10;
  }
  
  // Q5c: Tax docs
  if (answers && answers['5c']) {
    var tax = answers['5c'];
    if (tax === 'paye-payslips' || tax === 'self-filed' || tax === 'mix') {
      score += 20;
    } else if (tax === 'self-not-yet') {
      score += 10;
    }
  }
  
  // Q5: Monthly income
  if (answers && answers['5']) {
    var inc = answers['5'];
    if (inc === 'over-3k' || inc === '2-3k' || inc === '1-2k') {
      score += 15;
    }
  }
  
  // Q6: Bank balance
  if (answers && answers['6']) {
    var funds = answers['6'];
    if (funds === 'yes-have') score += 20;
    else if (funds === 'yes-spread') score += 15;
    else if (funds === 'soon') score += 10;
  }
  
  // Q7: Funds sufficient (object)
  if (answers && answers['7'] && typeof answers['7'] === 'object') {
    if (answers['7'].sufficient === true) {
      score += 20;
    }
  }
  
  var percentage = Math.round((score / maxScore) * 100);
  
  var status;
  if (percentage >= 80) status = 'Eligible';
  else if (percentage >= 50) status = 'Challenges';
  else status = 'Needs Work';
  
  return { score: score, percentage: percentage, status: status };
}

function saveToSheet(data, scoreResult) {
  // Make sure we have a sheet ID
  if (SHEET_ID === 'YOUR_SHEET_ID_HERE') {
    Logger.log('Warning: SHEET_ID not configured');
    return;
  }
  
  var sheet;
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    sheet = ss.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      // Add headers
      sheet.appendRow([
        'Email', 'Timestamp', 'Country', 'Passport', 'Remote Income', 
        'Workplace Permission', 'Tax Docs', 'Monthly Income',
        'Funds Amount', 'Funds Currency', 'Funds Sufficient',
        'Score %', 'Status', 'Time Taken (ms)', 'Raw Answers'
      ]);
    }
  } catch (err) {
    Logger.log('Error opening sheet: ' + err.toString());
    return;
  }
  
  // Extract data
  var answers = data.answers || {};
  var fundsData = answers['7'] || {};
  var fundsAmount = '';
  var fundsCurrency = '';
  var fundsSufficient = '';
  
  if (typeof fundsData === 'object') {
    fundsAmount = fundsData.amount || '';
    fundsCurrency = fundsData.currency || '';
    fundsSufficient = fundsData.sufficient ? 'Yes' : 'No';
  }
  
  // Check for duplicate email
  var existingData = sheet.getDataRange().getValues();
  var isDuplicate = false;
  for (var i = 1; i < existingData.length; i++) {
    if (existingData[i][0] === data.email) {
      isDuplicate = true;
      // Update existing row
      sheet.getRange(i + 1, 2).setValue(new Date()); // Update timestamp
      sheet.getRange(i + 1, 12).setValue(scoreResult.percentage + '%');
      break;
    }
  }
  
  // Append new row if not duplicate
  if (!isDuplicate) {
    sheet.appendRow([
      data.email,
      new Date(),
      data.country || answers['2'] || '',
      answers['3'] || '',
      answers['4'] || '',
      answers['5a'] || '',
      answers['5c'] || '',
      answers['5'] || '',
      fundsAmount,
      fundsCurrency,
      fundsSufficient,
      scoreResult.percentage + '%',
      scoreResult.status,
      data.timeTaken || '',
      JSON.stringify(answers)
    ]);
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Test function - run this to check if it works
function testDoPost() {
  var testData = {
    email: 'test@example.com',
    honeypot: '',
    timestamp: Date.now() - 10000, // 10 seconds ago
    answers: {
      '2': 'United Kingdom',
      '3': '6plus',
      '4': 'yes-employed',
      '5a': 'yes-have',
      '5': 'over-3k',
      '7': { sufficient: true, amount: 15000, currency: 'GBP' }
    }
  };
  
  var mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  var result = doPost(mockEvent);
  Logger.log('Test result: ' + result.getContent());
}
