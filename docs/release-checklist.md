# Release Checklist

Use this checklist before a production Firebase Hosting deploy.

## Automated Gates
- `npm test`
- `npm run build`
- Confirm the production build emits `manifest.webmanifest`, `sw.js`, and split chunks without the large-chunk warning.

## Manual QA
- Verify the auth, home, log, info modal, rank-up modal, and Tour ceremony flows at `390px` width.
- Verify offline shell behavior by loading the app once, disconnecting the network, and confirming the shell, local fonts, icons, and static styling still render.
- Verify signed-out offline behavior disables Google sign-in with clear copy.
- Verify signed-in offline behavior keeps the last synced data visible and disables workout logging / Tour advancement writes.
- Verify reduced-motion mode still preserves readable XP, rank-up, and Tour feedback without long flashes or particle-heavy motion.
- Verify dialog focus, keyboard dismissal, and focus return for `InfoModal`, `TourAdvancePrompt`, `RankUpModal`, and `TourModal`.

## Deploy Prep
- Fill `.env` with the production Firebase project values.
- Confirm the local Firebase CLI is authenticated to the intended project.
- Run `firebase deploy` from the repo root.
