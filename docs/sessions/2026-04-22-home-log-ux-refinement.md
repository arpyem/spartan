# 2026-04-22 - Home And Log UX Refinement

## Summary
- Refined the post-log flow so successful workout logging now resolves back to the home screen once any rank-up or Tour ceremony is complete.
- Tightened the home screen for narrow mobile widths and reworked track cards into a more compact Halo-style layout.
- Rebuilt the logging form around centered numeric entry and simple optional subtrack presets instead of an EXP preview panel and free-text notes.

## What Changed
- Added `getXpToNextRank` in `src/lib/ranks.ts` and updated tests so track cards and log headers can show remaining EXP cleanly without duplicating rank math in components.
- Extended `src/lib/tracks.ts` with stable preset metadata and added `SubtrackPresetIcon` so each training track now offers a simple optional preset picker.
- Reworked `TrackBadge` with a lighter `glyph` mode and rebuilt `TrackCard` so the layout now reads left-to-right as track glyph, progress state, and emblem with the rank name below it.
- Removed visible Tour copy from track cards and let the selected/glow treatment plus the emblem/shield composition communicate Tour-readiness instead.
- Compressed the home hero and global rank module for `390px` behavior, while moving the dev-log launcher away from the lower-right track-card area on narrow screens.
- Rebuilt `LogScreen` so the input strip is horizontal with preset increment buttons, the EXP preview UI is gone, workout notes are replaced by single-select preset tokens, and successful log flows now navigate home with `replace` semantics after the relevant modal sequence finishes.
- Updated Vitest and Playwright coverage to match the new home heading contract, the compact card content, the preset note token behavior, and the revised rank-up/Tour return-home flow.

## Decisions
- Kept the Firestore schema unchanged by encoding preset selections into the legacy `note` field as `preset:<trackKey>:<presetKey>`.
- Preserved Tour readiness as a visual state on the card rather than a textual banner so the home surface stays cleaner and closer to the Halo reference.
- Left the underlying logging, rank-up, and Tour gating rules untouched; the changes in this pass are presentation and navigation behavior only.

## Verification
- `npm test`
- `npm run build`
- `npm run test:e2e`

## Follow-Ups
- Manual `390px` browser QA is still needed to validate spacing and touch-target quality against the release checklist.
- If the next pass focuses on polish rather than flow, the strongest remaining opportunities are icon fidelity tuning and final typography/spacing adjustments under the home hero.
