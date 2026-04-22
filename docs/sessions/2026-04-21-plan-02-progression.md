# Session: Plan 02 Progression And Data Model

## What Was Done
- Added the Halo 3 rank ladder and pure progression helpers in `src/lib/ranks.ts`.
- Added deterministic XP and Double XP logic in `src/lib/xp.ts`, including a small derived status helper for active/upcoming banner state.
- Added Firestore helpers for initial track creation, idempotent user bootstrap, atomic workout logging, and Tour advancement in `src/lib/firestore.ts`.
- Added `useUserData` and `useDoubleXP` so later UI milestones can subscribe to real-time user docs and weekend state without duplicating logic.
- Expanded Firebase mocks and added Milestone 02 tests for ranks, XP, Firestore helpers, and hooks.
- Updated `README.md` to mark Plan 02 complete after tests and build passed.

## Decisions Made
- Kept invalid workout values strict in the pure XP layer: non-integer, zero, and negative values throw `RangeError`.
- Kept real sign-in UI work out of this milestone; only the idempotent auth-bootstrap helper landed here.
- Returned `xpBefore`, `xpAfter`, Tour state, and `tourAdvanceAvailable` from `logWorkout()` so later screens can drive rank-up and Tour prompts without extra reads.
- Stored only raw progression state in Firestore; rank and banner state remain derived client-side.

## Learnings
- The shared Firebase mock needed a richer Firestore surface than Plan 01 to test batch writes and snapshot subscriptions without touching real services.
- `useDoubleXP` performs an immediate refresh on mount in addition to its interval, so the hook test must account for both calls.
- Build verification caught mock typing issues that did not surface in Vitest alone, so both `cmd /c npm test -- --run` and `cmd /c npm run build` remain required checks in this environment.
