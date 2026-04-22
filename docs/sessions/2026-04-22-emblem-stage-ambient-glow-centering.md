# Emblem Stage Ambient Glow Centering

## Summary

- removed the detached top-left ambient radial from `.service-track-card`
- moved the ambient haze onto the dedicated emblem stages so the glow now centers behind the emblem instead of the card header
- applied the same stage-owned glow treatment to the global rank surface and preserved a warmer selected-card variant

## Decision

- the surface-level radial looked good as atmosphere but read as a broken emblem glow on narrow cards because it lived near the track header
- centering the haze on the emblem stage keeps the effect while aligning it with the visual subject it is supposed to support

## Learnings

- ambient panel lighting and emblem lighting need different ownership boundaries; when a surface-level radial sits near the header, users read it as a broken emblem glow even if the emblem asset itself is correct
- for this dashboard, stage-owned glow is more robust than panel-owned glow because it keeps the visual effect attached to the emblem across global and track surfaces without relying on card-specific background positioning
- Playwright screenshots were necessary here because the CSS looked reasonable in isolation while the rendered composition still made the glow read as detached

## Verification

- passed: `npm test`
- passed: `npm run build`
- passed: Playwright desktop screenshot check via [home-stage-glow-desktop.png](/C:/Users/rpmmi/Documents/spartan/playwright-artifacts/home-stage-glow-desktop.png)
- passed: `npm run test:e2e -- e2e/home.spec.ts`
