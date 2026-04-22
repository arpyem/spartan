# 2026-04-22 - Track Card Center And Type Tuning

## Summary
- Tightened the home track-card layout so the emblem sits in a more stable centered stage on narrow tiles.
- Reduced the rank-name treatment to better fit the mobile card width without dominating the tile.

## What Changed
- Updated [src/components/TrackCard.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/TrackCard.tsx) to use a three-row grid layout instead of spacing the card with `justify-between`, which gives the emblem a dedicated center stage between the header and the XP footer.
- Constrained the emblem stage width and reduced the emblem size slightly so the rank mark reads as centered in the tile rather than drifting against the footer copy.
- Reduced the rank-name font size and tightened the footer metrics block so labels fit the mobile card width more cleanly.
- Adjusted [src/components/RankEmblem.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/RankEmblem.tsx) so the early diamond-family ranks render lower inside the emblem plate, which fixes the optical top-heaviness visible on Recruit and Apprentice.
- Added a focused mobile Playwright regression in [e2e/home.spec.ts](/C:/Users/rpmmi/Documents/spartan/e2e/home.spec.ts) that checks recruit-card typography and emblem alignment on the 390px layout, plus updated the stale Global Rank popover expectation to match the current copy.
- Swapped the custom Recruit glyph over to a downloaded Halopedia source asset as an interim fix; that recruit-only import was later superseded by the full table-driven rank SVG set under [src/assets/ranks](/C:/Users/rpmmi/Documents/spartan/src/assets/ranks).
- Adjusted [src/styles.css](/C:/Users/rpmmi/Documents/spartan/src/styles.css) stage heights to keep the tightened card layout balanced at desktop and mobile widths.

## Decisions
- Kept the track header left-aligned to preserve the existing service-record card language while centering the emblem and progression stack beneath it.
- Treated this as a presentation-only refinement; no progression logic, Firestore flow, or accessibility label contract changed.

## Verification
- `npm test`

## Follow-Ups
- Manual `390px` browser QA is still needed to confirm the optical centering feels right on-device, especially for the wider shielded Tours and longer officer-rank names.
