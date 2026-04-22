# Spartan Gains Implementation Plan

## Summary
This document is the execution index for Spartan Gains. It translates the product and engineering rules from [spartans_spec.md](/C:/Users/rpmmi/Documents/spartan/spartans_spec.md) and [AGENTS.md](/C:/Users/rpmmi/Documents/spartan/AGENTS.md) into a milestone-driven delivery plan. The plan is dependency-ordered so the team builds stable foundations first, keeps game logic pure and testable, wires Firebase flows atomically, and treats the Halo 3-style progression ceremony as a release requirement rather than optional polish.

The focused plans under `plans/` are intended to be drilled into one at a time. They are scoped by milestone, not by file inventory, so each document can drive a coherent slice of implementation from interfaces through testing and acceptance.

## Product Guardrails
- `src/lib/` owns all progression and XP logic as pure TypeScript with no React imports.
- Firestore writes that touch both workout history and track progression must be atomic via `writeBatch`.
- Real-time user state flows through `useUserData` with `onSnapshot`; components do not issue ad hoc reads in render paths.
- Only raw `xp` and `tour` values persist for progression. Rank, global rank, tier progress, and display strings are derived client-side.
- Rank-up detection happens in the log submit flow after a successful write by comparing pre-write and post-write rank ids.
- `RankUpModal` and `TourModal` are presentation-only surfaces. They receive payloads and sequence animations; they do not own business logic.
- Animation quality is a hard acceptance gate. Generic, linear, or placeholder-feeling motion is not shippable.

## Canonical Interfaces And Boundaries
### Routes
- `/` for the home screen and top-level app shell.
- `/log/:track` for the track-specific logging flow.
- Auth entry flow at app boot before protected surfaces render.
- Modal-driven secondary surfaces for rank-up, tour advancement, and info display.

### Core Modules
- `src/lib/firebase.ts`
- `src/lib/ranks.ts`
- `src/lib/xp.ts`
- `src/lib/firestore.ts`
- `src/hooks/useUserData.ts`
- `src/hooks/useDoubleXP.ts`

### Core Components
- `RankEmblem`
- `ShieldBackground`
- `XPBar`
- `TrackCard`
- `GlobalRank`
- `RankUpModal`
- `TourModal`
- `InfoModal`
- `DoubleXPBanner`

### Domain Types
- `TrackKey`
- `TrackProgress`
- `UserDoc`
- `WorkoutDoc`
- `Rank`
- UI payload types for rank-up and tour advancement events

## Milestone Sequence
### 1. Foundation And Tooling
Establish the app shell, shared types, environment contract, theme system, routing skeleton, test harness, Firebase surface area, and PWA baseline. This milestone creates the project frame that every later milestone plugs into.

Focused plan: [01-foundation-and-tooling.md](/C:/Users/rpmmi/Documents/spartan/plans/01-foundation-and-tooling.md)

### 2. Progression And Data Model
Implement the rank ladder, XP economy, Double XP schedule, global rank math, Firestore shapes, auth bootstrap, and atomic write contracts. This milestone locks the game's rules before UI wiring gets deep.

Focused plan: [02-progression-and-data-model.md](/C:/Users/rpmmi/Documents/spartan/plans/02-progression-and-data-model.md)

### 3. Core App Surfaces
Build the authenticated product flow: home screen, track cards, global rank display, log screen, info modal structure, and real-time hook integration. This milestone delivers the base app experience without the final ceremony polish.

Focused plan: [03-core-app-surfaces.md](/C:/Users/rpmmi/Documents/spartan/plans/03-core-app-surfaces.md)

### 4. Rank Assets And Celebration Flows
Build the 42 emblem system, shield progression, XP bar feel, rank-up sequence, and tour advancement ceremony. This is the milestone where the product moves from functional to faithful.

Focused plan: [04-rank-assets-and-celebration-flows.md](/C:/Users/rpmmi/Documents/spartan/plans/04-rank-assets-and-celebration-flows.md)

### 5. Quality, PWA, And Release
Harden tests, mobile behavior, accessibility, offline/PWA behavior, and release readiness. This milestone closes the loop on shippability.

Focused plan: [05-quality-pwa-and-release.md](/C:/Users/rpmmi/Documents/spartan/plans/05-quality-pwa-and-release.md)

### 6. Setup Review Remediation
Address post-review gaps in bootstrap resilience and celebration correctness without changing the product scope or Firestore schema. This follow-up plan hardens first-sign-in recovery, keeps rank-up visuals Tour-accurate, and closes the review-driven test/documentation loop.

Focused plan: [06-setup-review-remediation.md](/C:/Users/rpmmi/Documents/spartan/plans/06-setup-review-remediation.md)

## Milestone Exit Criteria
### Foundation And Tooling
- Routing, app shell, theming, env keys, and Firebase initialization boundaries are in place.
- Shared types exist for tracks, ranks, user docs, workouts, and celebration payloads.
- Test runner and mocking conventions are configured and documented.
- PWA configuration has a baseline manifest and service worker plan, even if assets are still provisional.

### Progression And Data Model
- Rank and XP rules are implemented as pure functions with boundary coverage.
- Firestore document shapes and atomic write flows are defined and testable.
- Auth bootstrap rules are clear for first sign-in document creation.
- Tour advancement rules are explicit, including max tour behavior and user-confirmed advancement.

### Core App Surfaces
- Auth gating, home screen, log flow, and info surfaces are wired to real-time data contracts.
- Track and global progression readouts derive from pure functions rather than duplicated UI logic.
- Log flow produces the right UI payloads for rank-up and tour-available states after successful writes.

### Rank Assets And Celebration Flows
- All rank and shield assets have an implementation strategy that reaches production fidelity.
- XP bar, rank-up, and tour advancement animations meet the Halo 3 quality bar in sequence, pacing, and visual feedback.
- Placeholder emblem shortcuts are no longer treated as release-ready.

### Quality, PWA, And Release
- `npm test` passes.
- `npm run build` passes with no TypeScript errors.
- Mobile behavior is validated at `390px` width for the core progression flows.
- PWA install/offline behavior, Firebase mocking, and release checks are complete.

## Cross-Cutting Test Gates
- Pure-function coverage lands first for `src/lib/ranks.ts` and `src/lib/xp.ts`, including all threshold boundaries and deterministic Double XP cases.
- Firestore-facing logic is tested with module-level mocks only; no tests call real Firebase services.
- Integration tests focus on behavior: XP preview updates live, rank-up modal triggers at thresholds, tour-available prompt appears at 2000 XP, and home state reacts after logging.
- Visual and interaction checks run at `390px` width for home, log, rank-up, and tour advancement flows.
- Animation review is part of release sign-off, not a post-feature cleanup task.

## Planning Conventions
- Reference [spartans_spec.md](/C:/Users/rpmmi/Documents/spartan/spartans_spec.md) as the active product spec filename unless the repo intentionally renames it later.
- Use milestone documents to make decisions complete before implementation starts in that area.
- Keep file references limited to the modules that actually anchor the work so plans stay readable.
- Treat the note in the spec about numbered placeholder emblems as an early development allowance only; [AGENTS.md](/C:/Users/rpmmi/Documents/spartan/AGENTS.md) defines the production quality bar.

## Focused Plan Index
1. [Foundation And Tooling](/C:/Users/rpmmi/Documents/spartan/plans/01-foundation-and-tooling.md)
2. [Progression And Data Model](/C:/Users/rpmmi/Documents/spartan/plans/02-progression-and-data-model.md)
3. [Core App Surfaces](/C:/Users/rpmmi/Documents/spartan/plans/03-core-app-surfaces.md)
4. [Rank Assets And Celebration Flows](/C:/Users/rpmmi/Documents/spartan/plans/04-rank-assets-and-celebration-flows.md)
5. [Quality, PWA, And Release](/C:/Users/rpmmi/Documents/spartan/plans/05-quality-pwa-and-release.md)
6. [Setup Review Remediation](/C:/Users/rpmmi/Documents/spartan/plans/06-setup-review-remediation.md)
