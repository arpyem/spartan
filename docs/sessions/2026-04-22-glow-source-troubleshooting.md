# 2026-04-22 - Glow Source Troubleshooting

## Summary
- Troubleshot the detached emblem-glow issue with fresh Playwright screenshots from the live dashboard rather than relying on the uploaded reference alone.
- Confirmed the problematic haze was coming from surface background lighting, not the shared rank asset table.

## What Changed
- Updated [src/styles.css](/C:/Users/rpmmi/Documents/spartan/src/styles.css) so the Global Rank panel and track cards no longer place a localized radial haze near the emblem stage.
- Replaced that emblem-adjacent panel haze with more ambient corner lighting so the visible glow now comes from the shared [src/components/RankEmblem.tsx](/C:/Users/rpmmi/Documents/spartan/src/components/RankEmblem.tsx) stage.
- Captured fresh Playwright screenshots during troubleshooting, including [home-glow-inspect-desktop.png](/C:/Users/rpmmi/Documents/spartan/playwright-artifacts/home-glow-inspect-desktop.png).

## Decisions
- Treated this as a surface-lighting bug rather than another `RankEmblem` geometry issue after the live Playwright capture showed the detached glow was container-driven on desktop.

## Verification
- `npm test`
- `npm run build`
- `npm run test:e2e -- e2e/home.spec.ts`
