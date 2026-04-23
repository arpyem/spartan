# Milestone 02: Progression And Data Model

## Summary
Lock the game's rules before heavy UI work begins. This milestone covers rank math, XP conversion, deterministic Double XP, global rank computation, Firestore document shapes, auth bootstrap behavior, and the atomic write paths for workout logging and tour advancement.

## Implementation Plan
### Rank System
- Implement the 42-rank `RANKS` table exactly as defined in the spec.
- Add pure helpers for current rank, next-rank threshold, rank progress percentage, and global rank index.
- Define max-rank behavior explicitly so XP above 2000 still resolves to `5-Star General` and progress returns `100`.

### XP Economy
- Implement `getBaseXP` for cardio minute brackets and lifting set brackets exactly at the specified boundaries.
- Implement `isDoubleXPWeekend(date)` using the deterministic five-week cadence from the spec.
- Implement `calculateXP(track, value, date)` so UI and write paths share the same logic source.
- Decide and document input validation behavior for zero, negative, and non-integer values before UI hooks depend on it.

### Firestore Shapes And Data Ownership
- Model `users/{uid}` and `workouts/{workoutId}` data exactly around raw values needed by the app: identity fields, `tracks.{track}.xp`, `tracks.{track}.tour`, and workout history entries.
- Keep rank, tier progress, global rank, and Double XP status derived client-side except for the historical `doubleXP` flag stored on each workout.
- Document server timestamp usage for `createdAt` and workout `timestamp`.

### Auth Bootstrap
- On first successful Google sign-in, create the user document with all five tracks initialized to `xp: 0` and `tour: 1`.
- Keep first-run creation idempotent so repeat logins do not overwrite track progress.

### Atomic Write Flows
- Define `logWorkout()` so it batches workout history creation and parent track XP update atomically.
- Define `advanceTour()` so it batches `xp -> 0` and `tour -> tour + 1` atomically, capped at tour 6 so the ladder can reach Diamond.
- Document the payloads these functions return so the log flow can compare `xpBefore` and `xpAfter` for rank-up and tour-available detection without adding duplicate reads.

### Hook Contracts
- Define `useUserData` around `onSnapshot` with clear loading, data, and error states.
- Define `useDoubleXP` as a lightweight derived hook that reports current status and near-term banner state without persisting schedule flags.

## Interfaces And Files To Anchor
- `src/lib/ranks.ts`
- `src/lib/xp.ts`
- `src/lib/firestore.ts`
- `src/hooks/useUserData.ts`
- `src/hooks/useDoubleXP.ts`
- shared types/constants module

## Acceptance Criteria
- Rank and XP math live entirely in pure functions with no UI coupling.
- Firestore document shapes are minimal and do not persist computed progression state.
- Workout logging and tour advancement are atomic and return enough information for UI follow-up flows.
- First-sign-in bootstrap and real-time user reads are defined without hidden component logic.
- Edge behavior at max rank, max tour, and Double XP boundaries is explicit.

## Test Cases
- `getRankFromXP` covers all 42 threshold boundaries plus overflow above 2000 XP.
- `getRankProgress` covers tier starts, mid-tier values, and max-rank behavior.
- `getGlobalRankIndex` covers mixed-track averages and flooring.
- `getBaseXP` covers every cardio and lifting threshold boundary.
- `isDoubleXPWeekend` covers known Friday, Saturday, Sunday, non-eligible weekends, and weekdays.
- `calculateXP` covers normal and doubled payouts.
- Firestore tests verify that `logWorkout()` and `advanceTour()` use batch writes and avoid partial-update paths.
- `useUserData` tests verify snapshot subscription setup and cleanup with mocked Firebase modules.

## Assumptions
- Track input validation should reject or neutralize invalid values before writes occur; the exact UX can be refined in the UI milestone as long as the pure functions remain deterministic.
- Returned Firestore helper payloads can include precomputed `xpBefore`, `xpAfter`, and `tourBefore` values if that keeps screen logic thin without violating the pure-logic boundary.
