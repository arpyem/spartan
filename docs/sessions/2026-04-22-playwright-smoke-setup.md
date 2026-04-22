# 2026-04-22 — Playwright Smoke Setup

## Summary
- Added a first Playwright lane for deterministic mobile smoke coverage.
- Introduced an app runtime seam so browser tests can run without booting real Firebase.
- Kept the existing Vitest suite as the main logic and failure-path safety net.

## What Changed
- Added `@playwright/test`, `playwright.config.ts`, and npm scripts for install, headless runs, and headed debugging.
- Added `e2e/` smoke specs for:
  - signed-out auth to signed-in shell
  - signed-in home screen and info modal
  - log preview and rank-up ceremony
  - Tour advancement ceremony
  - offline banner plus disabled write actions
- Added a test-only `window.__SPARTAN_E2E__` scenario contract and a mocked in-memory runtime.
- Refactored auth and Firestore-facing hooks/components to consume the runtime boundary instead of importing Firebase directly in UI-facing code paths.
- Made Firebase initialization lazy behind `getFirebaseServices()` so the mocked Playwright lane does not require real Firebase env values to boot.

## Decisions
- Chose mocked browser runtime over Firebase emulators for the first Playwright pass.
- Scoped the first lane to a single Chromium mobile project at the repo’s `390px` QA target.
- Stored no screenshot baselines in this pass; traces, screenshots, and videos are retained only on failure.

## Verification
- `npm test`
- `npm run build`
- `npm run test:e2e`

## Follow-Ups
- Manual mobile and installability QA from the release checklist is still required to close Plan 05.
- Cross-browser Playwright coverage and visual regression snapshots remain deferred.
