# 2026-04-23 PWA Installability Pass

## Summary
- Added a dedicated PWA session layer that detects standalone launches, captures the browser install prompt, and falls back to iPhone add-to-home-screen guidance when `beforeinstallprompt` is unavailable.
- Surfaced the install guidance on both the signed-out auth screen and the signed-in home screen so install can happen before or after authentication.
- Updated the generated manifest metadata and `index.html` mobile-web-app tags so installed launches have a stronger standalone contract, especially on iPhone.

## Implementation Notes
- Added `src/lib/pwa-runtime.ts` for pure installability and standalone detection helpers.
- Added `src/hooks/usePwaSession.tsx` to own browser install prompt state and PWA dev logging.
- Added `src/components/PwaInstallBanner.tsx` as the reusable install surface.
- Wired the install surface into `AuthScreen` and `HomeScreen`.
- Added dev-log events for install-state initialization, prompt availability, prompt request/completion, app install, and display-mode changes.

## Verification
- `npm test`
- `npm run build`

## Follow-Up
- Run the real-device production install pass from [docs/production-phone-deploy.md](/C:/Users/rpmmi/Documents/spartan/docs/production-phone-deploy.md).
- Validate both desktop Chromium install and iPhone add-to-home-screen launches against production hosting.
