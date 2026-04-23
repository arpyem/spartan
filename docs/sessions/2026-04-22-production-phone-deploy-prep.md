# 2026-04-22 - Production phone deploy prep

## What changed
- Updated [docs/release-checklist.md](/C:/Users/rpmmi/Documents/spartan/docs/release-checklist.md) to make the first release gate explicitly production-phone-browser-first, with redirect-auth, Firestore write, offline-shell, and deferred installability expectations called out.
- Added [docs/production-phone-deploy.md](/C:/Users/rpmmi/Documents/spartan/docs/production-phone-deploy.md) as a concrete runbook for the production Firebase Hosting deploy and real-phone browser pass.
- Updated [README.md](/C:/Users/rpmmi/Documents/spartan/README.md) so the remaining Plan 05 work reflects the production phone-browser pass rather than a generic installability-only closeout.
- Fixed a real mobile auth-surface bug in [src/screens/AuthScreen.tsx](/C:/Users/rpmmi/Documents/spartan/src/screens/AuthScreen.tsx) by making the decorative deployment-note panel ignore pointer events, so it can no longer intercept taps on the Google sign-in CTA.
- Followed up on a real-phone report where the sign-in CTA was missing below the fold on iPhone-sized screens by moving the Google sign-in button earlier in the auth flow on mobile, hiding the decorative art panel below `md`, and allowing the auth shell to scroll vertically when viewport height is tight.
- Updated phone-facing smoke coverage in [e2e/tour-advance.spec.ts](/C:/Users/rpmmi/Documents/spartan/e2e/tour-advance.spec.ts) and current home-surface expectations in [src/__tests__/app.test.tsx](/C:/Users/rpmmi/Documents/spartan/src/__tests__/app.test.tsx) to match the live UI copy and current return-home affordance.
- Tightened [e2e/auth.spec.ts](/C:/Users/rpmmi/Documents/spartan/e2e/auth.spec.ts) to run at a shorter phone-height viewport so the auth CTA remains covered by smoke tests when vertical space is constrained.
- Added [src/__tests__/firebase-auth-domain.test.ts](/C:/Users/rpmmi/Documents/spartan/src/__tests__/firebase-auth-domain.test.ts) and updated [src/lib/firebase.ts](/C:/Users/rpmmi/Documents/spartan/src/lib/firebase.ts) so production auth uses the active hosting origin when the deployed domain differs from the configured default auth domain, which fixes redirect auth on storage-partitioned mobile browsers.
- Updated [src/hooks/useAuthSession.tsx](/C:/Users/rpmmi/Documents/spartan/src/hooks/useAuthSession.tsx) and [src/lib/runtime.ts](/C:/Users/rpmmi/Documents/spartan/src/lib/runtime.ts) to recover when redirect auth succeeds but the Firebase auth observer is delayed, to fall back to `auth.currentUser` when available, and to surface an actionable timeout instead of hanging forever on the boot screen when auth never settles.
- Switched production desktop browsers back to popup-based Google sign-in in [src/lib/runtime.ts](/C:/Users/rpmmi/Documents/spartan/src/lib/runtime.ts) while preserving redirect auth for mobile-class browsers, so desktop no longer depends on the phone-oriented redirect path.
- Updated [src/lib/pwa.ts](/C:/Users/rpmmi/Documents/spartan/src/lib/pwa.ts) to denylist Firebase `"/__/"` routes from Workbox navigation fallback so the Google auth popup reaches the real Firebase handler instead of recursively loading the app shell.
- Expanded [src/__tests__/app.test.tsx](/C:/Users/rpmmi/Documents/spartan/src/__tests__/app.test.tsx) and [src/__tests__/pwa.test.ts](/C:/Users/rpmmi/Documents/spartan/src/__tests__/pwa.test.ts) to cover delayed auth observers, `currentUser` recovery, auth timeout escape behavior, desktop-vs-mobile sign-in strategy selection, and the Firebase auth-handler denylist.

## Verification
- passed: `npm test`
- passed: `npm run build`
- passed outside sandbox after Windows `spawn EPERM`: `npm run test:e2e`
- passed outside sandbox after the follow-up auth layout fix: `npm run test:e2e -- e2e/auth.spec.ts`
- confirmed build output still emits `dist/manifest.webmanifest` and `dist/sw.js`
- confirmed local `.env` already contains all required `VITE_FIREBASE_*` values without exposing them in output
- confirmed `npx firebase-tools --version` works in this shell after on-demand install
- passed after production auth hardening and desktop popup/PWA fixes: `npm test`
- passed after production auth hardening and desktop popup/PWA fixes: `npm run build`

## Blockers
- The initial production deploy from the agent shell was blocked on Firebase credentials, but the deploy was completed later from an authenticated local shell.
- Real-device QA then exposed a sequence of production issues that required follow-up fixes: hidden auth CTA on phone, redirect-domain mismatch, Google OAuth redirect mismatch, delayed auth observer hangs, desktop popup loops, and service-worker interception of Firebase auth handler routes.

## Decisions
- Kept deploy guidance explicit-project-first and did not add a checked-in `.firebaserc`, matching the milestone guidance against project-specific aliases.
- Treated the auth CTA interception as a product bug, not a flaky test artifact, because it directly affects real phone usability.
- Documented token-backed deploy guidance in the runbook because this agent environment cannot complete Firebase interactive login.
- Split production sign-in behavior by device class: mobile keeps redirect auth because it is the stable phone path, while desktop uses popup auth to avoid unnecessary redirect churn in full browsers.
- Treated Firebase `"/__/"` routes as reserved infrastructure paths that must bypass SPA/PWA navigation fallback, because auth handler interception manifests as nested popup recursion rather than a readable app error.
