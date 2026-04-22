# 2026-04-22 - Home Dashboard Visual Refresh

## Summary
- Reworked the signed-in home surface into a more visual dashboard with one dominant Global Rank hero and five smaller track tiles.
- Compressed home-only sync and Double XP messaging into status chips so rank emblems and XP bars carry more of the screen.
- Preserved the existing Firestore, navigation, and celebration flows while updating the home presentation and its integration expectations.

## What Changed
- Rebuilt [src/screens/HomeScreen.tsx](/C:/Users/rpmmi/Documents/spartan/src/screens/HomeScreen.tsx) into a desktop-first dashboard shell with a minimal top utility strip, a compact status rail, a large Global Rank hero, and a responsive five-tile track grid.
- Added [src/components/HomeStatusRail.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/HomeStatusRail.tsx) to keep offline, live-sync, and Double XP state visible without using the previous full-width banner blocks.
- Reworked [src/components/GlobalRank.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/GlobalRank.tsx) into a more emblem-led hero surface with a larger rank treatment and shorter popover copy.
- Rebuilt [src/components/TrackCard.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/TrackCard.tsx) into vertical tiles that prioritize emblem, rank name, and XP bar while keeping the full-card logging action and accessible progression label.
- Added supporting dashboard, tile, and status-chip styling in [src/styles.css](/C:/Users/rpmmi/Documents/spartan/src/styles.css).
- Updated [src/__tests__/app.test.tsx](/C:/Users/rpmmi/Documents/spartan/src/__tests__/app.test.tsx), [README.md](/C:/Users/rpmmi/Documents/spartan/README.md), and [plans/05-quality-pwa-and-release.md](/C:/Users/rpmmi/Documents/spartan/plans/05-quality-pwa-and-release.md) to match the new home-screen treatment.

## Decisions
- Kept the home-screen heading accessible via a screen-reader-only `Service Record` heading so the visual hierarchy could stay focused on the dashboard cards without dropping the page landmark.
- Left all track-card data contracts and progression logic intact; the refactor only changes presentation and accessible labeling.
- Kept status visibility on the home screen itself rather than pushing it into the info modal, but reduced it to compact chips so it no longer dominates the layout.

## Verification
- `npm test`
- `npm run build`

## Follow-Ups
- Manual `390px` QA is still required to confirm that the fifth full-width mobile tile, the larger Global Rank hero, and the compact status rail feel balanced on-device.
