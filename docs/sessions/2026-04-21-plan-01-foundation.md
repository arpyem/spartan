# Session: Plan 01 Foundation And Tooling

## What Was Done
- Bootstrapped the repo into a working Vite + React + TypeScript application.
- Added the app shell, auth gate, route tree, placeholder home/log/auth screens, and root layout.
- Added shared non-React modules for Firebase env parsing, Firebase initialization, track metadata, and core domain types.
- Added Tailwind v4 styling, Google Fonts wiring, a mobile-first HUD frame, and baseline PWA manifest/icon support.
- Added the Vitest + React Testing Library setup, Firebase boundary mocks, and the first smoke/integration tests.
- Updated `README.md` plan status to mark Plan 01 complete once the scaffold cleared its checks.

## Decisions Made
- Used React Router for `/` and `/log/:track` rather than local state navigation because the product spec already defines route-based surfaces.
- Kept Firebase setup limited to initialization and auth persistence in this milestone; first-sign-in document creation remains deferred to Plan 02.
- Used placeholder route surfaces instead of partial production components so the architecture could settle before deeper feature work.
- Used checked-in placeholder PWA icons with final manifest paths so later visual refinement does not need to change the contract.

## Learnings
- The local Windows environment exposed `node` and `npm` path issues. Verification succeeded by explicitly invoking the known-good Node runtime and using `--scripts-prepend-node-path=true` with npm.
- Vite/Vitest config needed `moduleResolution: "Bundler"` and `defineConfig` from `vitest/config` to keep TypeScript and test settings aligned.
- Running `tsc -b` without `noEmit` in the node tsconfig produced repo-noise artifacts; adding `noEmit` kept the workspace clean.
- Test stability improved after opting into the React Router future flags and wrapping the auth-state emission in `act(...)`.
