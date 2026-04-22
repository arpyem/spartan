# 2026-04-22 - Home Dashboard Proportion Pass

## Summary
- Rebalanced the Global Rank hero panel so the title block, info affordance, emblem scale, and progress footer read as one composition.
- Tightened track-card typography and emblem staging to reduce crowding on longer rank names and keep the card center of gravity lower.
- Strengthened the XP bar treatment so progress carries more visual weight against the imported Halo 3 emblem art.

## What Changed
- Updated [src/components/GlobalRank.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/GlobalRank.tsx) to split parenthetical grade labels into a smaller secondary line, shrink and inline the info button with the section header, reduce hero emblem size, and anchor the composite progress bar with its own divider.
- Updated [src/components/TrackCard.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/TrackCard.tsx) to reduce track-card rank type, slightly lower the emblem stage, and tighten the footer metrics block.
- Updated [src/components/XPBar.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/XPBar.tsx) to give compact card bars stronger border contrast, clearer scan ticks, a brighter top-edge highlight, and a more visible moving gloss edge.
- Updated [src/styles.css](/C:/Users/rpmmi/Documents/spartan/src/styles.css) to support the new hero panel background balance, smaller inline icon button sizing, and slightly deeper track-card stage placement.

## Decisions
- Kept the imported Halopedia SVGs untouched in this pass. The goal here was layout and proportion, not emblem redrawing.
- Treated parenthetical grade text as subordinate information in the hero panel because the full one-line title block was visually overpowering the dashboard.

## Verification
- `npm test`
- `npm run build`
- `npm run test:e2e -- e2e/home.spec.ts`
