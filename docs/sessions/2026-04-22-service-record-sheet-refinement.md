# 2026-04-22 - Service Record Sheet Refinement

## Summary
- Refactored the service record modal into a single-scroll sheet so the full rank table is reachable on mobile.
- Removed the decorative service art panel and replaced that space with a current-rank summary plus an in-flow rank table.
- Hardened the header strip and account layout against long Spartan names and email addresses without changing modal behavior or data contracts.

## What Changed
- Reworked [src/components/InfoModal.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/InfoModal.tsx) so the dialog uses one primary vertical scroll surface instead of split panes with nested scrolling.
- Added a compact current global-rank summary ahead of the rank table and redesigned the table rows for stacked mobile readability while keeping the current rank highlighted.
- Constrained the full rank table to a fixed `400px` viewport with vertical scrolling so the table remains usable without consuming the entire sheet.
- Added a matching `400px` tour-background reference table that shows the full Base-through-Diamond shield ladder alongside current track counts.
- Removed the legacy `.service-art-panel` treatment from [src/styles.css](/C:/Users/rpmmi/Documents/spartan/src/styles.css) and added sticky/current-rank table styling plus a safer service-record header strip variant.
- Expanded [src/__tests__/milestone04-components.test.tsx](/C:/Users/rpmmi/Documents/spartan/src/__tests__/milestone04-components.test.tsx) and [e2e/home.spec.ts](/C:/Users/rpmmi/Documents/spartan/e2e/home.spec.ts) to cover the single-scroll sheet structure, the in-flow rank table, the header bounds scenario, and the absence of the art panel.
- Updated [README.md](/C:/Users/rpmmi/Documents/spartan/README.md) and [plans/05-quality-pwa-and-release.md](/C:/Users/rpmmi/Documents/spartan/plans/05-quality-pwa-and-release.md) to reflect the new service-record refinement state within Plan 05.

## Decisions
- Kept the service record as a modal sheet instead of turning the rank table into a separate route or drill-in view.
- Treated the global-rank summary as the hero content for the sheet instead of reintroducing decorative filler, which keeps the Halo 3 service-record tone while prioritizing usable progression information.
- Left the existing sign-out flow, dialog semantics, and modal open/close behavior intact so the refinement stays presentation-only.

## Verification
- `cmd /c npm test`
- `cmd /c npm run build`
- `cmd /c npm run test:e2e -- e2e/home.spec.ts`

## Follow-Ups
- Manual release-checklist QA is still needed for the broader `390px`, offline-shell, and installability passes outside the targeted home/service-record Playwright lane.
