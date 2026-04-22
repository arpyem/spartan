# 2026-04-22 - Halopedia Rank SVG Import

## Summary
- Imported the full Halo 3 rank SVG table from Halopedia into the repo and switched `RankEmblem` to render those source assets for all 42 rank ids.
- Kept the current home/log UI composition intact by preserving the existing shield, plate, glow, and motion wrapper around the imported emblem art.

## What Changed
- Added the full `H3_Rank_*.svg` asset set under [src/assets/ranks](/C:/Users/rpmmi/Documents/spartan/src/assets/ranks) so every Halo 3 rank now has a local source SVG in the app.
- Replaced the handcrafted rank-family switch in [src/components/RankEmblem.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/RankEmblem.tsx) with a table-driven asset mapping built from `import.meta.glob`.
- Preserved the current `ShieldBackground` composition and plate treatment so the imported rank art drops into the latest service-record layout rather than reverting older emblem sizing assumptions.
- Removed the temporary recruit-only duplicate asset now that the table-driven import owns every rank.

## Decisions
- Kept the imported SVGs as external `<image>` nodes inside the existing emblem stage instead of inlining and recoloring them. The Halopedia files already carry the original material gradients and highlights, so overriding that work would reduce fidelity.
- Limited this pass to the rank glyph source swap. Shield design, card layout, and ceremony sequencing were intentionally left unchanged.

## Verification
- `npm test`
- `npm run build`
- `npm run test:e2e -- e2e/home.spec.ts`

## Notes
- These rank SVGs are third-party source assets imported at direct user instruction for fidelity matching.
