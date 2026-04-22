# 2026-04-22 - Home Header And Global Rank Cleanup

## Summary
- Simplified the home hero so `SERVICE RECORD` is now the only title text and the account-record trigger lives in the same title row.
- Reworked the Global Rank module into a more singular command surface with an info popover that now carries both the aggregate explanation and the logging guidance.
- Tightened track-card structure and aligned the account/service-record modal with the updated home hierarchy.

## What Changed
- Removed the `FIELD DECK` label, the dossier subtitle, and the standalone `Log workout` helper card from [src/screens/HomeScreen.tsx](/C:/Users/rpmmi/Documents/spartan/src/screens/HomeScreen.tsx).
- Added a click/tap-driven Global Rank info popover in [src/components/GlobalRank.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/GlobalRank.tsx) with outside-click and `Escape` dismissal, then promoted the remaining visible module into a stronger command-style surface.
- Rebuilt [src/components/TrackCard.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/TrackCard.tsx) so track identity and rank identity now share a top row above the XP bar, with a larger rank emblem and secondary EXP metadata below.
- Updated [src/components/InfoModal.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/InfoModal.tsx) to use the refreshed title-row treatment and the lighter glyph-style track badges used elsewhere on the home deck.
- Added supporting chrome for the command surface and popover in [src/styles.css](/C:/Users/rpmmi/Documents/spartan/src/styles.css).
- Updated Vitest and Playwright expectations to match the simplified home header, the moved helper content, and the modal heading contract.

## Decisions
- Kept the Global Rank help as a compact popover rather than another permanent card so the top of the home deck stays focused on progression state and action rows.
- Left the home track deck as a single-column stack; only the card internals changed in this pass.
- Preserved all progression, routing, and Firestore behavior. This was a UI-only cleanup pass.

## Verification
- `npm test`
- `npm run build`
- `npm run test:e2e`

## Follow-Ups
- Manual `390px` QA is still the main open release gate, especially to confirm the new title row, popover width, and enlarged rank emblems feel balanced on-device.
