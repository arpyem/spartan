# 2026-04-22 - Dashboard Height And Header Pass

## Summary
- Tightened the track-card header treatment so the track badge and label read as one centered marker.
- Reduced track rank-name typography to a smaller, cooler HUD treatment.
- Increased the Global Rank emblem footprint while capping the overall desktop dashboard stack height to preserve a more mobile-horizontal proportion.
- Made the `RECORD` and global-rank info buttons explicitly pointer-driven.

## What Changed
- Updated [src/components/TrackCard.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/TrackCard.tsx) to center the track badge and label, enlarge the badge slightly, and reduce rank-name copy to `0.6rem` with a grayer tone closer to the track label treatment.
- Updated [src/components/GlobalRank.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/GlobalRank.tsx) to give the hero emblem more visual space inside the global-rank panel.
- Updated [src/screens/HomeScreen.tsx](/C:/Users/rpmmi/Documents/spartan/src/screens/HomeScreen.tsx) to cap the desktop dashboard composition height and let the right-side track grid stretch within that frame.
- Updated [src/styles.css](/C:/Users/rpmmi/Documents/spartan/src/styles.css) so service buttons and icon buttons use `cursor: pointer`.

## Verification
- `npm test`
- `npm run build`
- `npm run test:e2e -- e2e/home.spec.ts`
