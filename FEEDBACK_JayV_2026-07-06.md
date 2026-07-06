# DTV Guide Website Feedback
**From:** Jay V (@JAYVSOP_1)  
**Date:** 2026-07-06  
**Site Reviewed:** dtvguide.com

---

## Structure & SEO

### Critical Issues

1. **SEO Content Exposure**
   - Result screens ("DTV Not Available", "Remote Work Required") appear in initial HTML
   - Google indexes rejection messages as page content
   - "Sorry, the Thailand DTV is currently only available..." is visible to crawlers before hero content
   - **Recommendation:** Render result states dynamically via JS instead of shipping in initial HTML, or reorder DOM so hero/value prop comes first

2. **Title Tag Missing Primary Keyword**
   - Current: "DTV Visa Quiz — Check Your Eligibility"
   - Missing "Thailand" — people search "Thailand DTV visa", not "DTV visa quiz"
   - **Suggested:** "Thailand DTV Visa Eligibility Checker (2026) | DTV Guide"
   - Note: og:title actually performs better than the real <title>

3. **Missing Standard Meta Description**
   - Has og:description but lacks `<meta name="description">`

4. **Thin Content for Ranking**
   - Single quiz page won't compete for "DTV visa requirements", "DTV proof of funds", etc.
   - **Recommendation:** Add indexed content pages (requirements, document checklist, DTV vs Elite visa, tax implications) that funnel into the quiz
   - Add FAQ schema markup to those pages

5. **Canonical/Redirect**
   - dtvguide.com resolves to www.dtvguide.com
   - Ensure proper 301 redirect and canonical tag to avoid splitting authority

---

## Branding & Assets

6. **OG Image is Stock Flag**
   - Currently: Stock Thailand flag from flagcdn.com
   - **Recommendation:** Create custom branded share image (e.g., "Am I eligible for Thailand's 5-year DTV? Free 30-second check")
   - Would noticeably lift CTR from social shares

7. **Hotlinked Hero Image**
   - Hero image loaded from flagcdn.com (third-party)
   - **Recommendation:** Self-host all images for control

---

## Quiz UX

8. **Question Numbering Leaks Branching Logic**
   - Users see Q5a, Q5c, then Q5
   - Reads like a bug to users
   - **Recommendation:** Renumber dynamically based on path taken, or drop visible numbers in favor of progress bar ("Step 4 of 7")

9. **Currency Handling is Muddled**
   - Q5 mixes $ and £ in every option
   - Q6 asks them to pick a currency
   - **Recommendation:** Ask country first (already done in Q2), then localise all money figures from that answer

10. **Email Gate Before Results**
    - Current: Email required to see results
    - **GDPR Issue:** No visible privacy notice or consent checkbox
    - No privacy policy link visible on page
    - **Fix:** Add privacy notice, consent checkbox, and link to privacy policy

11. **Accessibility Issues**
    - "Start Over" and "Check eligibility" links use `href="#"` — should be `<button>` elements
    - Dropdowns (age, country) need proper `<label>` associations for screen readers

---

## Funnel

12. **No Post-Quiz Upsell Hint**
    - Page doesn't mention the paid guide and consultation tiers
    - **Recommendation:** Add subtle "Get the full DTV application guide" mention or testimonial strip
    - Gives the page purpose beyond quiz for visitors not ready to enter email

---

## Follow-up Needed

- **JS/Backend Review:** Jay offered to review actual source code (scoring logic, email validation, fallback behavior)
- Need access to: JavaScript files, server-side validation, error handling

---

*Received via Telegram from @JAYVSOP_1*
