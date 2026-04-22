# Home Screen Command Strip Layout

## Summary

- replaced the oversized home Global Rank hero with a compact top command strip that keeps `Record`, the Spartan name, the global-rank readout, the info trigger, and the emblem in a single home-screen header
- removed the hard-coded home card grid placements and rebuilt the track deck as a centered wrap layout so the five track cards naturally settle into `3 over 2` on wider screens while collapsing cleanly on smaller widths
- preserved the existing home-screen interaction contracts, including the service-record modal trigger, the global-rank popover, and the per-track navigation behavior
- tightened the global and per-track emblem stages so less card area is spent on empty space around the art
- relaxed the short-height landscape rules so horizontal mobile uses fluid wrapping instead of a forced row pattern
- consolidated the old `Record` button and username into a single service-record surface in the home strip, with the user name itself now serving as the record entry point
- moved the former global-rank hover/help copy into a dedicated `Info` section inside the service-record modal
- reduced emblem glow intensity and switched the rank-plate blur to a true backlight so it sits behind the emblem art instead of reading like an overlay
- widened the track-card XP readouts so each progress bar spans the width of its card content area instead of staying constrained to a narrow center column
- removed the extra inset border from the overall mobile/app shell so the main surface reads as a single framed container instead of a double-bordered shell
- retitled the home-strip heading treatment to `Spartan` and removed the old `Spartan gains` copy from the interactive service-record trigger
- simplified the service-record trigger copy so it now reads only `Service record` plus the username, matching the requested profile-button treatment
- tightened the home-strip rank/emblem spacing so the global-rank text block sits visibly closer to the emblem stage on wider layouts
- removed the remaining `Spartan` label from the rank strip so the home screen currently carries no explicit app-title text
- switched the service-strip layout to a wrapped `space-between` flex arrangement, with the action cluster and the rank/emblem cluster internally center-justified so the header stays balanced when it breaks across lines
- increased the track-card header icon and track-name sizing by roughly fifteen percent to improve legibility without materially changing the card density
- refined the strip again so widths around `400px` keep the record cluster and global-rank cluster on a single row where possible, only falling back to wrapping below the tighter `360px` breakpoint
- reduced the emblem backlight slightly and removed stage overflow clipping so the rank glow no longer gets cropped vertically inside the home cards
- replaced the remaining SVG-filter-driven glow with a wrapper backlight layer behind the emblem SVG, which removed the last vertical cropping artifact that still showed up in narrow mobile captures
- added a final `<= 420px` mobile-only backlight reduction so the emblem halo at `400px` width stays comfortably inside its stage instead of reading flattened at the edges
- reshaped the halo from a full-surface gradient wash into a smaller centered orb with blur and glow, which eliminated the remaining square-looking backlight artifact on the `400px` mobile layout
- diagnosed the last apparent `400px` glow cutoff as a track-card row-lighting issue rather than another `RankEmblem` issue, then moved the track-card ambient light off the middle stage row and onto a tight emblem wrapper so the glow no longer appears clipped by the title rows
- tightened the service-home-strip layout again so the global-rank cluster no longer expands through the middle of the header; it now hugs the right side and leaves the intended space between the service-record surface and the rank surface
- restored the visibility of the track-card emblem glow after the tighter wrapper pass by strengthening the emblem-owned halo itself rather than bringing back the old row-bounded stage haze
- increased the track-card emblem glow again with brighter screen-blended wrapper halos and a stronger emblem backlight after the prior pass still read as effectively glow-free in the real `400px` mobile view

## Decision

- kept the composite progress XP bar in the header strip even though the sketch does not show it, because removing it would hide a useful piece of progression feedback that already fits cleanly beneath the reorganized header
- used Playwright-backed seeded screenshots to verify the actual rendered mobile and desktop layouts instead of relying only on unit and integration assertions
- encoded landscape mobile as a wrap requirement rather than a fixed `3 over 2` mandate, since the important UX goal is that the deck reflows cleanly across narrow-height screens
- removed the separate home-screen info affordance rather than relocating it inside the header, because the service-record modal is now the single place for explanatory copy and account-level context
- removed the remaining app-title label entirely after the follow-up UI pass, since the current direction is to keep the home header free of product-title copy
- kept the remaining home-strip global-rank stage lighting unchanged because the reproduced boundary artifact was isolated to the track-card stage row, not the strip-level global-rank stage
- kept this as a CSS-only flex sizing change because the issue was caused by the rank cluster owning elastic width, not by the `GlobalRank` markup structure
- kept the glow restoration on the emblem wrapper layers so the light reads clearly again while still avoiding the old cutoff at the track title and rank title rows
- accepted a more visible halo on the track cards because a subtle effect that disappears in the actual mobile composition is not meeting the UI requirement

## Learnings

- Do not diagnose emblem-lighting bugs from CSS alone. The main failure this session was mistaking a row-bounded stage haze for an emblem-glow problem; the fix only became correct once the rendered `400px` Playwright capture was treated as the source of truth.
- Avoid row-scoped ambient lighting for the track cards. Effects attached to `.service-track-card-stage` read like clipping at the track-title and rank-title boundaries, even when `overflow` is technically visible.
- Do not overcorrect toward “safe subtle.” Several glow passes were technically present but visually absent on real mobile composition. If the glow cannot be seen immediately in the narrow screenshot, it is too weak.
- Keep layout fixes local to the owning flex item. The service-strip spacing issue was caused by the rank cluster consuming elastic width; solving it in flex sizing was cleaner and safer than changing the `GlobalRank` markup.
- Re-verify the exact failing viewport after every visual tweak. The reliable loop for this surface was: change CSS, rerun `e2e/home.spec.ts`, inspect `playwright-artifacts/home-layout-400x827.png`, and only then decide whether the adjustment actually worked.

## Verification

- passed: `npm test`
- passed: `npm run build`
- passed: `npm run test:e2e -- e2e/home.spec.ts`
- passed: `npm run test:e2e -- e2e/home.spec.ts e2e/auth.spec.ts e2e/offline.spec.ts`
- captured and reviewed: `playwright-artifacts/home-layout-mobile.png`
- captured and reviewed: `playwright-artifacts/home-layout-desktop.png`
- captured and reviewed: `playwright-artifacts/home-layout-mobile-landscape.png`
- passed again after the shell/title/spacing pass: `npm test`
- passed again after the shell/title/spacing pass: `npm run build`
- passed again after the shell/title/spacing pass: `npm run test:e2e -- e2e/home.spec.ts e2e/auth.spec.ts e2e/offline.spec.ts`
- passed in this pass: `npm test`
- passed in this pass: `npm run build`
- passed in this pass: `npm run test:e2e -- e2e/home.spec.ts`
- captured and reviewed in this pass: `playwright-artifacts/home-layout-400x827.png`
- passed again after the service-strip alignment pass: `npm test`
- passed again after the service-strip alignment pass: `npm run build`
- passed again after the service-strip alignment pass: `npm run test:e2e -- e2e/home.spec.ts`
- passed again after the track-card glow visibility pass: `npm test`
- passed again after the track-card glow visibility pass: `npm run build`
- passed again after the track-card glow visibility pass: `npm run test:e2e -- e2e/home.spec.ts`
- captured and reviewed again after the track-card glow visibility pass: `playwright-artifacts/home-layout-400x827.png`
