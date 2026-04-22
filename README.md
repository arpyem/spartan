# Spartan Gains

Halo 3-themed workout tracker PWA. Users log workouts, earn EXP across five independent training tracks, rank up through the Halo 3 ladder, and unlock tour shields as they prestige each track.

## Core Docs
- Product spec: [spartans_spec.md](/C:/Users/rpmmi/Documents/spartan/spartans_spec.md)
- Agent rules: [AGENTS.md](/C:/Users/rpmmi/Documents/spartan/AGENTS.md)
- Master implementation plan: [plans/implementation-plan.md](/C:/Users/rpmmi/Documents/spartan/plans/implementation-plan.md)

## Plan Status
This table is the project-level status source for the implementation plans. Keep it current as work begins, changes state, or completes.

| Plan | Scope | Status |
|---|---|---|
| [Implementation Plan](/C:/Users/rpmmi/Documents/spartan/plans/implementation-plan.md) | Master roadmap, guardrails, milestone sequencing, release gates | Active |
| [01 Foundation And Tooling](/C:/Users/rpmmi/Documents/spartan/plans/01-foundation-and-tooling.md) | App shell, routing, theme, env contract, Firebase surface, test/PWA baseline | Planned |
| [02 Progression And Data Model](/C:/Users/rpmmi/Documents/spartan/plans/02-progression-and-data-model.md) | Rank logic, XP economy, Firestore model, auth bootstrap, atomic write flows | Planned |
| [03 Core App Surfaces](/C:/Users/rpmmi/Documents/spartan/plans/03-core-app-surfaces.md) | Auth, home, log flow, info modal, real-time UI wiring | Planned |
| [04 Rank Assets And Celebration Flows](/C:/Users/rpmmi/Documents/spartan/plans/04-rank-assets-and-celebration-flows.md) | Emblems, shields, XP bar feel, rank-up and tour ceremonies | Planned |
| [05 Quality, PWA, And Release](/C:/Users/rpmmi/Documents/spartan/plans/05-quality-pwa-and-release.md) | Test hardening, mobile QA, PWA completion, release readiness | Planned |

## Status Definitions
- `Planned`: documented and approved for future work, but not started.
- `Active`: currently being refined or executed.
- `Blocked`: cannot move forward until an external dependency or decision is resolved.
- `Complete`: finished to the acceptance criteria defined in the corresponding plan.

## Focused Plans
### [Implementation Plan](/C:/Users/rpmmi/Documents/spartan/plans/implementation-plan.md)
Use this as the roadmap and dependency index. It defines the cross-cutting rules that every milestone inherits.

### [01 Foundation And Tooling](/C:/Users/rpmmi/Documents/spartan/plans/01-foundation-and-tooling.md)
Use this when setting up the app shell, types, theme, Firebase boundary, test harness, and PWA baseline.

### [02 Progression And Data Model](/C:/Users/rpmmi/Documents/spartan/plans/02-progression-and-data-model.md)
Use this when implementing the rank ladder, XP rules, Firestore document shapes, and atomic progression flows.

### [03 Core App Surfaces](/C:/Users/rpmmi/Documents/spartan/plans/03-core-app-surfaces.md)
Use this when building the signed-in app experience: auth, home, track cards, log flow, and info surfaces.

### [04 Rank Assets And Celebration Flows](/C:/Users/rpmmi/Documents/spartan/plans/04-rank-assets-and-celebration-flows.md)
Use this when implementing the emblem system and the Halo 3-style progression moments that define the product.

### [05 Quality, PWA, And Release](/C:/Users/rpmmi/Documents/spartan/plans/05-quality-pwa-and-release.md)
Use this when hardening tests, validating mobile/PWA behavior, and preparing the project for deployment.

## Working Agreement
- Keep `README.md` and `plans/` synchronized with actual project state.
- Update milestone statuses in the same change that materially advances or completes a plan.
- Do not treat placeholder art or generic motion as release-ready; the animation bar in `AGENTS.md` still governs completion.
