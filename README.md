# Spartan Gains

Spartan Gains is a Halo 3-themed workout tracker PWA. Users log workouts across Cardio, Legs, Push, Pull, and Core, earn EXP against the Halo 3 rank ladder, and eventually prestige each track with Tour shields. The project is still in active build-out, so this repository is both the app source and the execution guide for the remaining milestones.

## Current App Status
- Plan 01 is complete: the repo now has a working React/Vite/Tailwind/Firebase foundation, route shell, test harness, and PWA baseline.
- Plan 02 is complete: rank math, XP rules, deterministic Double XP state, Firestore write contracts, auth bootstrap helpers, and real-time hook boundaries are now implemented and tested.
- Plan 03 is complete: Google redirect auth, live home and log screens, real-time workout aggregates, info modal data, and rank-up/Tour prompt plumbing are now implemented and tested.
- Plan 04 is complete: the app now has production-facing emblem/shield compositions, weighted XP bar treatment, a dedicated Tour confirmation prompt, and distinct rank-up/Tour celebration ceremonies.
- Plan 05 is active: offline-aware UX, stale-data handling, modal accessibility, reduced-motion support, split production bundles, hosting config, and release documentation are now implemented.
- Plan 06 is complete: setup review remediation now hardens first-sign-in profile bootstrap retries and keeps rank-up ceremonies aligned with the active Tour shield.
- The current app now includes the full progression ceremony loop plus release-hardening code. The remaining work is the manual release checklist in [docs/release-checklist.md](/C:/Users/rpmmi/Documents/spartan/docs/release-checklist.md), especially 390px/mobile QA, offline shell verification, and final installability review.

## Repo Structure
- `src/lib`
  Pure TypeScript domain/config code. This is where rank math, XP logic, Firebase wiring, and other non-React logic must live.
- `src/components`
  Shared UI building blocks and layout primitives such as boot surfaces, modal hosts, and future rank/tour components.
- `src/screens`
  Route-level screens. These map directly to app surfaces like home, auth, and workout logging.
- `src/hooks`
  Reserved for React hooks that coordinate app state and subscriptions without pushing business logic into components.
- `src/__tests__`
  Unit and integration tests. Pure logic tests and Firebase-boundary mocks live here.
- `public`
  Static assets such as the PWA manifest and icons.
- `plans/`
  The implementation roadmap: one master plan plus milestone-specific plans that are refined and executed one at a time.
- `scripts/`
  Repository automation entrypoints, including the cross-platform bootstrap workflow.
- `docs/sessions/`
  Session records describing what changed, what decisions were made, and what did not work cleanly during implementation.

## Core Docs
- Product spec: [spartans_spec.md](/C:/Users/rpmmi/Documents/spartan/spartans_spec.md)
- Agent and engineering rules: [AGENTS.md](/C:/Users/rpmmi/Documents/spartan/AGENTS.md)
- Master roadmap: [plans/implementation-plan.md](/C:/Users/rpmmi/Documents/spartan/plans/implementation-plan.md)
- Focused milestones:
  [01 Foundation And Tooling](/C:/Users/rpmmi/Documents/spartan/plans/01-foundation-and-tooling.md),
  [02 Progression And Data Model](/C:/Users/rpmmi/Documents/spartan/plans/02-progression-and-data-model.md),
  [03 Core App Surfaces](/C:/Users/rpmmi/Documents/spartan/plans/03-core-app-surfaces.md),
  [04 Rank Assets And Celebration Flows](/C:/Users/rpmmi/Documents/spartan/plans/04-rank-assets-and-celebration-flows.md),
  [05 Quality, PWA, And Release](/C:/Users/rpmmi/Documents/spartan/plans/05-quality-pwa-and-release.md),
  [06 Setup Review Remediation](/C:/Users/rpmmi/Documents/spartan/plans/06-setup-review-remediation.md)

## Bootstrap And Local Development
### First-time setup
Run the bootstrap entrypoint from the repo root:

```bash
npm run bootstrap
```

What bootstrap does:
- validates that your Node version satisfies the repo requirement
- installs dependencies using `package-lock.json`
- creates `.env` from `.env.example` if `.env` is missing
- stops with a clear message if the Firebase values in `.env` are still blank

Bootstrap is safe to rerun. If `.env` already exists, it leaves local values untouched.

### Common local commands
```bash
npm run dev
npm test
npm run build
npm run preview
```

## Environment Setup
The app expects these Firebase variables in `.env`:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

`npm run bootstrap` will create `.env` from `.env.example` if needed, but it will not fill in real secrets for you. After bootstrap creates the file, add your Firebase project values before trying to use the authenticated app flows.

Minimum local runtime:
- Node `>=20`
- npm compatible with that Node installation

## Testing And Build Commands
Use these commands as the standard local checks:

```bash
npm test
npm run coverage
npm run build
```

The baseline expectation for feature work is:
- tests stay green
- the build stays type-safe
- Firebase stays mocked in tests
- the app remains usable at mobile-first widths

## Milestone Plans And Status
This table is the project-level status source for the implementation plans.

| Plan | Scope | Status |
|---|---|---|
| [Implementation Plan](/C:/Users/rpmmi/Documents/spartan/plans/implementation-plan.md) | Master roadmap, guardrails, milestone sequencing, release gates | Active |
| [01 Foundation And Tooling](/C:/Users/rpmmi/Documents/spartan/plans/01-foundation-and-tooling.md) | App shell, routing, theme, env contract, Firebase surface, test/PWA baseline | Complete |
| [02 Progression And Data Model](/C:/Users/rpmmi/Documents/spartan/plans/02-progression-and-data-model.md) | Rank logic, XP economy, Firestore model, auth bootstrap, atomic write flows | Complete |
| [03 Core App Surfaces](/C:/Users/rpmmi/Documents/spartan/plans/03-core-app-surfaces.md) | Auth, home, log flow, info modal, real-time UI wiring | Complete |
| [04 Rank Assets And Celebration Flows](/C:/Users/rpmmi/Documents/spartan/plans/04-rank-assets-and-celebration-flows.md) | Emblems, shields, XP bar feel, rank-up and tour ceremonies | Complete |
| [05 Quality, PWA, And Release](/C:/Users/rpmmi/Documents/spartan/plans/05-quality-pwa-and-release.md) | Test hardening, offline UX, accessibility, PWA completion, release readiness | Active |
| [06 Setup Review Remediation](/C:/Users/rpmmi/Documents/spartan/plans/06-setup-review-remediation.md) | Bootstrap retry hardening, Tour-correct rank-up ceremony state, review follow-up tests/docs | Complete |

Status meanings:
- `Planned`: documented and approved, but not started
- `Active`: currently being refined or executed
- `Blocked`: waiting on a missing dependency or decision
- `Complete`: done to the plan's acceptance criteria

## Working Conventions
- Read [AGENTS.md](/C:/Users/rpmmi/Documents/spartan/AGENTS.md) before touching implementation. It is the source of truth for repo rules.
- Keep business logic in `src/lib`. Do not move progression math or Firebase write rules into UI components.
- Firestore updates that must stay in sync need batched writes.
- Keep `README.md`, `plans/`, and `docs/sessions/` current as the project evolves.
- The animation bar is part of the product, not polish. Generic motion is not considered done in this repo.
