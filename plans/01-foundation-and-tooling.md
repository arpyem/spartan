# Milestone 01: Foundation And Tooling

## Summary
Build the project frame that later milestones depend on: app bootstrap, routing shell, design tokens, font loading, Firebase surface boundaries, env handling, testing conventions, and a minimal PWA baseline. This milestone should leave the repo ready for pure-logic work and UI implementation without forcing later structural rewrites.

## Implementation Plan
### App Shell And Routing
- Create the React app shell with routing for `/` and `/log/:track`.
- Add an auth gate at the top level so protected screens render only after auth state resolves.
- Reserve modal mounting strategy early so rank-up, tour, and info overlays can live above routed screens without reworking navigation.

### Shared Types And Constants
- Define `TrackKey` as the canonical union for `cardio`, `legs`, `push`, `pull`, and `core`.
- Define `TrackProgress`, `UserDoc`, `WorkoutDoc`, and `Rank` types in a shared location that both pure logic and UI can consume.
- Add canonical track metadata for labels, icons, and display order so UI surfaces do not duplicate string literals.

### Theme, Layout, And Typography
- Configure Tailwind and global styles around the Halo-inspired palette defined in the spec: near-black, HUD green, amber/gold, and steel blue.
- Load `Orbitron` for display text and `Share Tech Mono` for readout text.
- Establish reusable spacing, panel, glow, and typography primitives so later components inherit a consistent visual language.

### Firebase And Environment Contract
- Add `.env.example` covering all required `VITE_FIREBASE_*` variables from the spec and `AGENTS.md`.
- Implement `src/lib/firebase.ts` as the only Firebase initialization boundary for auth, Firestore, and provider exports.
- Persist Google auth sessions with `browserLocalPersistence` and document the first-sign-in user creation rule for Milestone 02.

### Test Harness And Conventions
- Configure Vitest and React Testing Library for the project baseline.
- Establish a shared Firebase mock strategy so later tests import reusable doubles instead of ad hoc mocks.
- Document the expectation that pure function tests come before component integration tests for progression features.

### PWA Baseline
- Add `vite-plugin-pwa` baseline setup, manifest wiring, and icon placeholders or final icons as available.
- Lock app orientation, theme color, and standalone display settings from the spec.
- Keep service-worker behavior conservative early; offline behavior can be expanded in Milestone 05.

## Interfaces And Files To Anchor
- `src/main.tsx`
- `src/App.tsx`
- `src/lib/firebase.ts`
- shared types/constants module for tracks, ranks, and doc shapes
- `vite.config.ts`
- `public/manifest.json`
- `.env.example`

## Acceptance Criteria
- The app boots through a stable shell with route support and auth-resolution handling.
- Theme tokens and font loading are in place so later component work does not invent local styling systems.
- Shared types cover the Firestore docs and UI payloads needed by later milestones.
- Firebase initialization and env contracts are centralized and documented.
- Test tooling is ready for pure logic and component integration work.
- PWA scaffolding exists without blocking later feature development.

## Test Cases
- App bootstrap renders without crashing under the test environment.
- Routing can render the home route and a track route with mocked dependencies.
- Missing env handling fails clearly in development-facing code paths.
- Firebase modules are mockable at the module boundary without reaching real services.

## Assumptions
- Shared domain types may live in a dedicated `src/lib/types.ts` or similarly central module as long as pure logic can import them without React coupling.
- Visual components built later will consume the theme primitives established here rather than redefining palettes locally.
- PWA icon assets can start as placeholders if the manifest contract and file paths are stable enough to refine later.
