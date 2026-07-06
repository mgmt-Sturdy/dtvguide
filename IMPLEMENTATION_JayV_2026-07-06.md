# DTV Guide Implementation Fixes
**From:** Jay V (@JAYVSOP_1)  
**Date:** 2026-07-06  
**Priority:** Business-critical fixes in order of impact

---

## 1. Email Capture — Highest Priority (Revenue Pipeline)

### Problem
`mode: 'no-cors'` means every submission is fire-and-forget. If Apps Script errors, quota-limits, or URL changes after redeploy, user sees "success" but email vanishes.

### Fix: Apps Script (Server-Side)

```javascript
// Apps Script doPost
function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  // Server-side email validation
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email || '');
  if (!emailOk) return jsonResponse({ ok: false, error: 'invalid_email' });

  // Recalculate score server-side from raw answers (see #2)
  const score = calculateScore(data.answers);

  // Dedupe: check sheet for existing email before appending
  // ... append row ...

  return jsonResponse({ ok: true, score: score });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Fix: Client-Side

Drop `no-cors`, await the response, show real error state ("Something went wrong — try again") with retry button instead of assuming success.

**Note:** Apps Script doesn't allow custom CORS headers directly. Use `Content-Type: text/plain` (stringify JSON yourself) to avoid preflight — standard workaround that works cross-origin with readable response.

---

## 2. Move Scoring Server-Side

### Problem
Anyone can flip their score in dev tools. Lead sheet scores become untrustworthy for segmentation (e.g., sending "you're eligible, buy the guide" emails to people who aren't).

### Fix
Submit raw answers, not computed score. Have Apps Script compute from single source of truth.

**Longer term:** Consider Cloudflare Worker + MailerLite/ConvertKit API for retries, dedupe, and tagging (if product grows).

---

## 3. Kill Dead Code — Unify Scoring Table

### Problem
Scoring logic in two places: unused `SCORING_QUESTIONS` constant and live `calculatePoints()` switch. Risk of drift when tweaking point values.

### Fix

```javascript
const SCORING = {
  '2': { '6plus': 15 },
  '3': { 'employed': 30, 'self-employed': 30, 'freelance': 30 },
  '5': { 'over-500k': 25, /* ... */ },
  // ...
};

function calculatePoints(questionId, answer) {
  return (SCORING[questionId] || {})[answer] || 0;
}
```

Keep this object in one file. Paste identical object into Apps Script so client preview and server truth can't drift.

---

## 4. Spam Protection — Cheap Wins

**Skip full CSRF** — overkill for public lead form.

**Do add:**
- **Honeypot field:** Hidden input; if filled, silently drop submission
- **Timestamp check:** Reject submissions completed in under ~5 seconds (no human answers 7 questions that fast)
- **Dedupe by email:** Check sheet before appending

**Skip CAPTCHA** — costs real leads.

---

## 5. Email Validation

### Client-Side
Regex above is fine. Don't over-engineer RFC-perfect email regex.

### Server-Side
Real validation happens server-side + natural dedupe.

### Optional Enhancement
If typo'd emails become problem, add lightweight "did you mean gmail.com?" suggestion for common domain typos rather than blocking.

---

## 6. Progressive Enhancement — Pragmatic Version

**Not worth:** Fully JS-free quiz (audience is digital nomads on modern browsers).

**Do:**
- Hide all questions/results by default in CSS, reveal via JS (fixes SEO problem of rejection text being crawlable first)
- Add `<noscript>` block with one-line message + mailto/link fallback
- Convert `href="#"` links to `<button type="button">` — 5-minute accessibility fix, stops page jumping to top on click

---

## 7. Question Numbering Fix

Since routing knows user's path, derive display number from position in path rather than question ID:

```javascript
function updateProgress(pathSoFar, totalEstimate) {
  progressLabel.textContent = `Step ${pathSoFar.length} of ${totalEstimate}`;
}
```

Users see "Step 4 of 7" — never see "4a/4c". Branch stays internal.

---

## 8. Build Process Fix (Unflagged Issue)

`quiz-logic-update.js` "Node script that patches HTML" pattern is fragile — repo HTML and deployed HTML can silently diverge.

**Fix:** Make script write to `dist/index.html` rather than patching original. Source stays canonical.

---

## Next Step

Jay offered to rewrite the Apps Script code with validation, dedupe, and server-side scoring if pasted here.

---

*Implementation guide derived from Jay V's code review feedback*
