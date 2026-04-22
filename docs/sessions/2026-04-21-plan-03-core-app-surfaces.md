# Session: Plan 03 Core App Surfaces

## What Was Done
- Added an auth session layer around Firebase redirect auth, sign-out, and idempotent user bootstrap so routed screens can consume signed-in user state without reaching into Firebase directly.
- Replaced the placeholder auth, home, and log screens with the first usable product loop: live global rank display, track cards, log input/preview flow, and Tour prompt handling.
- Added first-pass presentation components for rank emblems, shields, XP bars, global rank, Double XP banner, info modal, rank-up modal, and Tour modal with stable props for later fidelity work.
- Added `useWorkoutStats` to aggregate live workout history from the user workout subcollection without storing derived counters in Firestore.
- Expanded the shared Firebase mock to support redirect auth actions, collection snapshots, and automatic listener updates after batched writes.
- Added Plan 03 integration coverage for auth, home, info modal, log preview, rank-up triggering, Tour advancement, and the new workout-stats hook.
- Updated `README.md` to mark Plan 03 complete after verification.

## Decisions Made
- Kept Google sign-in on the redirect flow for Plan 03 to match the mobile/PWA constraint from the plan.
- Kept Plan 03 emblem and ceremony visuals intentionally lightweight; the component contracts are stable, but the final Halo-fidelity pass remains scoped to Plan 04.
- Used live client-side workout aggregation for the info sheet instead of stored totals so Firestore continues to persist only raw workout/progression state.
- Kept the bottom home `LOG WORKOUT` block non-actionable, with track cards remaining the real navigation path into `/log/:track`.
- Mocked Double XP in the App integration suite rather than coupling UI tests to wall-clock timing; the pure XP tests still cover the real weekend schedule.

## Learnings
- Making the Firestore mock behave more like the real SDK by emitting an immediate first snapshot changed hook expectations, so the subscription tests needed to assert `ready` with empty data instead of a persistent `loading` state.
- The Codex Windows environment still hits Vite/esbuild `spawn EPERM` under sandboxing for both `npm test` and `npm run build`; the reliable verification path remains rerunning those commands with escalation.
- The production build now succeeds, but Vite reports a large main chunk warning. That is not a release blocker for Plan 03, though it is worth revisiting during Plan 05 hardening.
