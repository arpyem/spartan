# 2026-04-21 — Plan 05 quality, PWA, and release hardening

## What changed
- Added offline-aware app behavior via `useNetworkStatus`, including signed-out auth blocking, signed-in stale-data banners, and disabled workout/Tour writes while offline.
- Hardened Firestore snapshot hooks to preserve the last good user/workout state after later listener failures instead of clearing the UI.
- Added modal accessibility plumbing across `InfoModal`, `TourAdvancePrompt`, `RankUpModal`, and `TourModal`: dialog semantics, focus entry/restore, Escape handling where allowed, and alert/live-region treatment.
- Added reduced-motion accommodations to the XP bar and celebration flows while preserving the core Halo-style reward feedback.
- Moved PWA manifest/workbox config into `src/lib/pwa.ts`, removed the duplicate static manifest file, replaced Google Fonts CDN usage with local `@fontsource/*` packages, and added Firebase Hosting SPA config via `firebase.json`.
- Split production bundles with lazy routes plus manual `firebase` / `framer-motion` chunks, then expanded tests to cover offline behavior, auth/write failures, stale listeners, dialog semantics, reduced motion, and PWA config.

## Decisions
- Offline support remains shell-first only. There is no queued workout write or offline Firestore persistence in this milestone.
- The app now keeps signed-in stale data visible after listener failures, but initial load failures without any user document still render a blocking error state.
- Manual release validation is documented in `docs/release-checklist.md` and should be completed before treating Plan 05 as fully shipped.

## Learnings
- Framer Motion’s reduced-motion hook is effectively memoized early in tests, so the animated components now combine Framer’s hook with a direct `matchMedia` fallback to keep the runtime behavior correct and the reduced-motion path testable.
- The generated manifest from `vite-plugin-pwa` and a committed `public/manifest.json` can drift silently; removing the static file avoids duplicate manifest links in the built HTML.
