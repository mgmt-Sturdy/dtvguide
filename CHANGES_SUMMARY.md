# DTV Guide — Changes Summary
**Date:** 2026-07-06  
**Changes by:** OpenClaw (implementing Jay V's fixes)

---

## Files Modified

### 1. `index.html` (Main file)
**Location:** `/Users/sturdyoff/.openclaw/workspace/dtvguide/index.html`  
**Also copied to:** `/Users/sturdyoff/.openclaw/workspace/dtvguide/dist/index.html`

#### SEO Fixes
- ✅ **Title tag updated:** "Thailand DTV Visa Eligibility Checker (2026) | DTV Guide"
- ✅ **Added meta description:** Standard meta tag for search engines
- ✅ **Added canonical tag:** `<link rel="canonical" href="https://dtvguide.com">`
- ✅ **Hide quiz content until JS loads:** Added `.js-loading` / `.js-loaded` classes to prevent rejection text from being indexed

#### Accessibility Fixes
- ✅ **Fixed href="#" links:** Added `event.preventDefault()` to prevent page jumps
- ✅ **Added noscript fallback:** Users without JS see a helpful message with mailto fallback

#### Email Capture Fixes (Revenue Pipeline)
- ✅ **Removed `mode: 'no-cors'`:** Now uses proper `text/plain` Content-Type to avoid preflight
- ✅ **Added async/await with error handling:** Shows error message on failure instead of assuming success
- ✅ **Better email validation:** Uses regex `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` instead of just checking for `@`
- ✅ **Added loading states:** Button shows "Submitting..." during request
- ✅ **Honeypot field:** Hidden input field to catch bots (silently drops spam)
- ✅ **Speed check:** Tracks quiz start time (anti-bot protection)
- ✅ **Privacy notice:** Added "Privacy Policy" link and consent messaging

#### Data Submission Changes
- ✅ **Sends raw answers:** Instead of computed score, sends `answers` object for server-side calculation
- ✅ **Sends metadata:** `honeypot`, `startTime`, `timeTaken`

---

## New Files Created

### 1. `shared-config.js`
**Location:** `/Users/sturdyoff/.openclaw/workspace/dtvguide/shared-config.js`

Unified scoring table — paste identical content into Google Apps Script to ensure client and server can't drift:

```javascript
const SCORING = {
  '3': { '6plus': 15 },
  '4': { 'yes-employed': 30, 'yes-self': 30, 'yes-freelance': 30 },
  '5a': { 'yes-have': 20, 'yes-can-get': 15, 'need-to-ask': 10 },
  '5c': { 'paye-payslips': 20, 'self-filed': 20, 'mix': 20, 'self-not-yet': 10 },
  '5': { 'over-3k': 15, '2-3k': 15, '1-2k': 15, 'under-1k': 0 },
  '6': { 'yes-have': 20, 'yes-spread': 15, 'soon': 10 },
  '7': { 'sufficient': 20 }
};
```

---

### 2. `apps-script.gs`
**Location:** `/Users/sturdyoff/.openclaw/workspace/dtvguide/apps-script.gs`

Complete Google Apps Script code with:
- ✅ Server-side scoring from raw answers
- ✅ Email validation and deduplication
- ✅ Honeypot and speed checks (anti-spam)
- ✅ Duplicate email handling (updates existing record)
- ✅ Proper JSON responses with error codes

**Setup Instructions:**
1. Open Google Apps Script (script.google.com)
2. Create new project
3. Replace code with contents of `apps-script.gs`
4. Update `SHEET_ID` constant with your actual Google Sheet ID
5. Deploy as web app
6. Update the fetch URL in `index.html` (line ~2000)

---

### 3. `dist/` folder
**Location:** `/Users/sturdyoff/.openclaw/workspace/dtvguide/dist/`

Build output folder per Jay's recommendation — copy `index.html` here instead of modifying source in-place. This ensures:
- Source files stay canonical
- Deployed files are separate
- No silent divergence between repo and production

---

## Still To Do (Not Yet Implemented)

### Question Numbering Fix
The question IDs still show internal branching (5a, 5c). The fix would be:
```javascript
function updateProgress(pathSoFar, totalEstimate) {
  progressLabel.textContent = `Step ${pathSoFar.length} of ${totalEstimate}`;
}
```
This requires refactoring the DOM structure — not included in this pass.

### Currency Localization
Currently Q5 mixes currencies. The fix per Jay:
- Ask country first (already done in Q2)
- Then localise all money figures from that answer

### Privacy Policy Page
The link points to `#privacy` — create an actual `/privacy` page with GDPR-compliant text.

### OG Image
Still using stock Thailand flag from flagcdn.com. Needs custom branded share image.

---

## Testing Checklist

- [ ] Deploy Apps Script and update URL in index.html
- [ ] Test email submission with valid email
- [ ] Test email submission with invalid email (should show error)
- [ ] Test submission failure (simulate network error)
- [ ] Fill honeypot field (should silently drop)
- [ ] Submit quiz in under 5 seconds (should reject)
- [ ] Submit same email twice (should update, not duplicate)
- [ ] Test with JavaScript disabled (should show noscript message)
- [ ] Verify rejection text is not in initial HTML (view source)

---

## Git Commands to Push

```bash
cd /Users/sturdyoff/.openclaw/workspace/dtvguide
git add -A
git commit -m "fix: Jay V review - email capture, SEO, accessibility, server-side scoring"
git push
```

---

*Changes based on feedback from Jay V (@JAYVSOP_1)*
