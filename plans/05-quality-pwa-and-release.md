# Milestone 05: Quality, PWA, And Release

## Summary
Harden the project into a shippable PWA. This milestone closes testing gaps, validates mobile behavior, confirms resilience around Firebase-facing code, finalizes offline/install behavior, and defines the release checklist for deployment.

## Status
Implementation is in place for offline-aware UX, stale-data preservation, modal accessibility, reduced-motion handling, split production bundles, and Firebase Hosting SPA configuration. Final milestone closure still depends on completing the manual release checklist in [docs/release-checklist.md](/C:/Users/rpmmi/Documents/spartan/docs/release-checklist.md).

## Implementation Plan
### Test Matrix
- Finalize exhaustive unit coverage for `src/lib/ranks.ts` and `src/lib/xp.ts`.
- Add focused integration coverage for logging flow, snapshot-driven updates, rank-up triggering, and tour-available prompting.
- Keep component tests behavior-driven and avoid styling-only assertions.

### Firebase Mocking And Resilience
- Centralize reusable Firebase mocks under the test tree for auth, Firestore refs, `writeBatch`, and snapshot listeners.
- Verify tests never call real Firebase services.
- Cover error states for auth resolution, snapshot failure, and workout write failure so UI behavior is deliberate under degraded conditions.

### Mobile And Accessibility Validation
- Validate all primary flows at `390px` width: auth, home, log, info, rank-up, and tour advancement.
- Check touch-target sizes, input usability, text contrast, and dismiss behavior for full-screen modals and sheets.
- Confirm the app remains understandable when motion is busy, including whether any reduced-motion accommodations are appropriate.

### PWA Hardening
- Finalize manifest values, installability expectations, and service-worker behavior through `vite-plugin-pwa`.
- Remove duplicate manifest ownership so the generated PWA manifest is the only source of truth.
- Confirm app icons, theme colors, and caching behavior align with the product shell.
- Decide which routes and assets must be available offline versus which flows can degrade gracefully when Firebase is unavailable.

### Build, Deploy, And Release Gates
- Ensure `npm test` passes consistently.
- Ensure `npm run build` passes with no TypeScript errors.
- Ensure the build emits split chunks without the previous large-chunk warning.
- Validate Firebase hosting configuration and deployment prerequisites.
- Run a final qualitative review against the Halo 3 vibe bar before release.

## Interfaces And Files To Anchor
- `src/__tests__/ranks.test.ts`
- `src/__tests__/xp.test.ts`
- component/integration test files under `src/__tests__/components/`
- shared Firebase mocks under the test tree
- `vite.config.ts`
- `public/manifest.json`

## Acceptance Criteria
- Unit and integration coverage protect the progression rules and user-critical flows.
- Firebase is fully mocked in tests and failure states are intentional.
- Primary experiences are usable at `390px` width.
- PWA manifest and service worker settings are release-ready.
- Build and test gates pass cleanly before deployment.
- Firebase Hosting SPA config is committed without checking in project-specific aliases.

## Test Cases
- Full threshold coverage for rank and XP logic remains green.
- Logging a workout updates derived home-screen state through mocked snapshots.
- Rank-up and tour-available behaviors are verified end to end with mocked write helpers.
- Failure tests verify that partial-write behavior cannot occur through exposed helpers.
- Manifest and PWA configuration are smoke-checked in build output.
- Manual mobile QA confirms the app is legible and operable on a narrow viewport.

## Assumptions
- Offline support is primarily a shell/install concern unless later requirements call for queued write behavior.
- Accessibility improvements that materially affect the interaction model should be folded in here even if they require light component adjustments from earlier milestones.
