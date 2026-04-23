# Production Phone Deploy Runbook

Use this runbook for the production mobile validation pass. The goal is to validate the live Firebase Hosting URL in both the iPhone browser shell and the installed standalone PWA against the production Firebase project.

## Pre-Deploy Audit
- Confirm `.env` contains all required `VITE_FIREBASE_*` values for the production Firebase project.
- Confirm Firebase Authentication has Google Sign-In enabled.
- Confirm the production Hosting domain is present in Firebase Authentication authorized domains so redirect auth can return successfully.
- Confirm Firestore rules allow signed-in users to read and write their own user and workout data.
- Confirm the local shell can run Firebase tooling. If `firebase` is not installed globally, use `npx firebase-tools`.
- If the shell is non-interactive, make sure a `FIREBASE_TOKEN` is available or use an already authenticated local shell; `firebase login` will not complete in a non-interactive agent session.

## Local Gates
- Run `npm test`.
- Run `npm run test:e2e`.
- Run `npm run build`.
- Confirm the build emits `dist/index.html`, `dist/manifest.webmanifest`, and `dist/sw.js`.

## Deploy
- Run the deploy from the repo root against the production project explicitly rather than relying on a local alias.
- Preferred command shape:

```bash
npx firebase-tools deploy --only hosting --project <production-project-id>
```

- If the shell cannot authenticate interactively, use a token-backed variant:

```bash
FIREBASE_TOKEN=... npx firebase-tools deploy --only hosting --project <production-project-id>
```

- Treat any auth-domain mismatch, cached stale service worker, or failed Hosting upload as a deployment blocker.

## Production Phone Browser Pass
- Open the production URL in an iPhone browser.
- Confirm the signed-out auth screen renders correctly on first load.
- Complete Google redirect sign-in and confirm the app returns to the authenticated shell.
- Validate the home screen layout, tappable track cards, Global Rank hero, and service-record entry points.
- Open the info modal and confirm it remains usable on the phone viewport.
- Open a log flow, confirm the XP preview updates as input changes, and submit a workout.
- Confirm Firestore-backed state updates return to the home screen correctly.
- Trigger at least one rank-up if test data allows it and confirm the celebration renders cleanly.
- Trigger a Tour advancement if test data allows it and confirm the prompt, write, and ceremony complete correctly.
- Reload once while online, then disconnect the network and confirm the shell and last synced state remain visible.
- Confirm signed-out offline state disables sign-in and signed-in offline state disables workout and Tour writes with clear copy.

## Production Install / Standalone Pass
- On desktop Chromium, confirm the auth or home surface shows the install call-to-action and that the browser install prompt opens successfully.
- Install the app from desktop Chromium and launch the installed window separately from the browser tab.
- Confirm the installed desktop window opens without browser chrome and lands in the same signed-in shell.
- On iPhone, use the browser share menu and choose `Add to Home Screen`, then launch the app from the new icon.
- Confirm the installed iPhone shell launches in standalone mode, preserves auth, and reaches the home screen without a redirect loop.
- From the installed shell, validate auth, home, log, rank-up, Tour, and return-home flows again.
- Load the installed app once while online, then disable network and relaunch from the installed icon to confirm the cached shell and last synced data still render.
- If a stale bundle is suspected, clear site data / uninstall the home-screen app and reinstall before continuing.

## Post-Pass Documentation
- Record what was validated, on which phone/browser, and any blockers discovered in `docs/sessions/`.
- Update [docs/release-checklist.md](/C:/Users/rpmmi/Documents/spartan/docs/release-checklist.md) if the production phone pass changes the remaining release gates.

## Remaining Follow-Up
- Safari-specific install heuristics beyond the current add-to-home-screen guidance if real-device behavior differs from Chrome on iPhone.
- Nicer installed-app update messaging if the production standalone pass exposes stale-service-worker confusion.
