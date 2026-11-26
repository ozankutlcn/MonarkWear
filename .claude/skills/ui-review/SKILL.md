---
name: ui-review
description: Manually run a rendered UI/UX design quality audit with mobile/desktop screenshots, objective browser checks, independent reviewer findings and bounded correction cycles.
disable-model-invocation: true
---
Use this for UI/UX-only review after a concept proof or selected design implementation.

1. Determine true app start command and localhost URL from the repo. Never make up a successful test. Verify app serves expected route. Do not change server/backend/config to make the audit pass.
2. Capture full-page screenshot at desktop 1440x900, tablet 768x1024 and mobile 390x844. Prefer existing Playwright test tools. If Playwright is installed, optionally run `node ui-system/tools/capture.mjs <local-url> <output-dir>`; inspect the generated JSON and PNGs. If unavailable, label capture not run and use an available manual browser path; never treat descriptive guesses as actual screenshots.
3. Exercise real keyboard tab order, mobile navigation, clickable links, visible focus, forms if present, empty/loading/error state if present. Check page-level horizontal overflow, console/page errors and broken images. Audit WCAG contrast if test tools can verify it; otherwise mark contrast unverified, not passed. Consider reduced-motion behavior.
4. Delegate to `ui-visual-auditor` with actual screenshots + browser report + brief, excluding the original builder's self-evaluation where possible. Have it classify problems P0 (release blocker), P1 (high priority), P2 (polish) with evidence and concrete corrections.
5. Return findings to `ui-crafter` within already-approved UI paths only. Run at most two audit/fix/capture cycles, each with a concise before/after issue register. Never let the reviewer change code; review a fresh screenshot after fixes.
6. Final output must include PASS/CONDITIONAL/FAIL, commands actually run, missing tests, responsive findings, score rationale, backend protection check, and screenshots/paths. Do not claim visual quality verified without rendered evidence.
