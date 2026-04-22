# 2026-04-22 - Emblem Stage Alignment Pass

## Summary
- Corrected the emblem glow-stage alignment so the halo is centered behind the rank art by default, instead of shifting visually based on the imported SVG shape.
- Removed extra surface-level emblem nudges on the home hero and track cards so the shared `RankEmblem` component owns its own stage geometry.

## What Changed
- Updated [src/components/RankEmblem.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/RankEmblem.tsx) to:
  - move the glow treatment onto a dedicated background plate rather than applying the glow filter to the glyph art itself
  - use shared stage metrics for plate and glyph placement
  - switch the imported SVG placement to a square, centered box for more consistent cross-rank alignment
  - add a radial plate fill so the glow reads more like a mounted emblem stage than a soft flat disc
- Updated [src/components/GlobalRank.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/GlobalRank.tsx) to reduce hero-only translation offsets and rely on the centered emblem stage.
- Updated [src/components/TrackCard.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/TrackCard.tsx) to remove the per-card emblem translation so track tiles inherit the same default alignment.

## Decisions
- Treated the misalignment as a component-level problem, not a per-surface layout problem. The emblem stage should be self-consistent anywhere it is rendered.
- Kept this pass focused on centering and glow ownership rather than rank-by-rank SVG tuning.

## Verification
- `npm test`
- `npm run build`
- `npm run test:e2e -- e2e/home.spec.ts`
