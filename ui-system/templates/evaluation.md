# UI Pilot — Evaluation Contract (not a promise of quality)

## Mandatory evidence / hard gates
- [ ] Browser screenshot evidence at 1440×900, 768×1024, and 390×844 (or marked not-run)
- [ ] Three proposed concepts differ in ≥4/6 structural axes (composition, typography, palette, navigation, density, media strategy)
- [ ] One human-approved direction BEFORE production UI work
- [ ] No unauthorized backend/auth/database/API/infra/business-logic diff (`git diff --name-only` review)
- [ ] No fabricated professional credentials, experience, clients, metrics, CV or capabilities
- [ ] No horizontal scrolling at tested viewport widths unless purposeful/contained
- [ ] Keyboard navigation, focus visibility, tap-targets and labels manually or automatically tested; untested criteria marked not-run
- [ ] Contrast and reduced-motion reviewed; claims of WCAG AA only if verified by appropriate testing
- [ ] Screenshot-based independent audit completed, with concrete P0/P1/P2 issue list

## Rubric — each scored 1 (poor) to 5 (excellent) with evidence
1. Distinctiveness: avoids mechanically repeated layout, default gradients/cards/hero without rationale.
2. Product fit: developer portfolio credibility, scan-friendly proof of work, targeted navigation.
3. Visual craft: type hierarchy, rhythm, alignment, spacing, visual cohesion.
4. Responsive experience: content readable and interactions workable at 390/768/1440 widths.
5. UX & accessibility: navigation clarity, keyboard support, content readability, functional states.

## Comparison record (only enter actually measured values)
| Metric | Existing/baseline | New workflow | Evidence/source |
|---|---|---|---|
| User interventions | not measured | not measured | |
| Rework cycles | not measured | not measured | |
| End-to-end elapsed time | not measured | not measured | |
| P0/P1 issues remaining | not measured | not measured | |
| Independent preference/score | not measured | not measured | |
| Backend scope violations | not measured | not measured | |

## Graduation rule
- First portfolio pilot: functional and aesthetic feasibility only.
- Replicate on at least two intentionally DIFFERENT products before claiming a reusable system.
- Compare blind/side-by-side to the old workflow when feasible. Improve or remove instructions that add time without measurable benefit.
- Flag portability limitations (e.g., mobile native differs from responsive web).
