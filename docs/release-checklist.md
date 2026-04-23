# Release Checklist

Use this checklist before a production Firebase Hosting deploy.

## Automated Gates
- `npm test`
- `npm run test:e2e`
- `npm run build`
- Confirm the production build emits `manifest.webmanifest`, `sw.js`, and split chunks without the large-chunk warning.

## Production Config Audit
- Confirm `.env` is populated with the intended production `VITE_FIREBASE_*` values.
- Confirm Firebase Authentication has Google Sign-In enabled for the production project.
- Confirm the production Hosting domain is added to Firebase Authentication authorized domains for redirect sign-in.
- Confirm Firestore reads and writes required by the signed-in home, log, rank-up, and Tour flows are allowed in the production project.
- Confirm the local Firebase CLI session targets the intended production project without relying on a checked-in `.firebaserc` alias.

## Manual QA: Production Phone Browser Pass
- Verify the production URL loads cleanly in an iPhone browser on a narrow viewport.
- Verify the auth, home, log, info modal, rank-up modal, and Tour ceremony flows at `390px` width.
- Verify Google redirect sign-in returns to the authenticated app without a redirect loop or dropped state.
- Verify the home screen remains legible and tappable, including Global Rank, status rail, track cards, and service-record entry points.
- Verify the log flow updates XP preview live and successfully writes a workout against production Firestore.
- Verify a workout that crosses a rank threshold shows the rank-up sequence correctly on-device.
- Verify a workout that unlocks Tour advancement shows the prompt, completes the write, and plays the Tour ceremony correctly on-device.
- Verify the app returns home after resolved log flows on the real production browser path.
- Verify offline shell behavior by loading the app once, disconnecting the network, and confirming the shell, local fonts, icons, and static styling still render.
- Verify signed-out offline behavior disables Google sign-in with clear copy.
- Verify signed-in offline behavior keeps the last synced data visible and disables workout logging / Tour advancement writes.
- Verify reduced-motion mode still preserves readable XP, rank-up, and Tour feedback without long flashes or particle-heavy motion.
- Verify dialog focus, keyboard dismissal, and focus return for `InfoModal`, `TourAdvancePrompt`, `RankUpModal`, and `TourModal`.

## Manual QA: Install / Standalone Pass
- Verify Chromium desktop shows the browser install prompt from the auth or home install surface.
- Verify the installed desktop app launches without browser chrome and reaches the authenticated home shell cleanly.
- Verify iPhone add-to-home-screen guidance is visible when the browser cannot raise a native install prompt.
- Verify the iPhone home-screen install launches in standalone mode and does not fall back to the browser tab.
- Verify standalone auth, home, log, rank-up, and Tour flows remain functional after install.
- Verify the installed shell keeps the last synced static shell visible after one online load and a later offline relaunch.

## Deploy Prep
- If the global Firebase CLI is unavailable, use `npx firebase-tools`.
- If the shell is non-interactive, provide a `FIREBASE_TOKEN` or run the deploy from an already authenticated local shell; `firebase login` cannot complete in this environment.
- Run the production deploy from the repo root with an explicit project, not a checked-in alias.
- Follow the full browser-pass runbook in [docs/production-phone-deploy.md](/C:/Users/rpmmi/Documents/spartan/docs/production-phone-deploy.md).

## Deferred For Later
- Installed-app update UX beyond the current service-worker auto-update path if real-device QA shows confusion around stale standalone shells.
- Safari-specific polish beyond the current iPhone add-to-home-screen guidance if the production install pass exposes Safari-only issues.
