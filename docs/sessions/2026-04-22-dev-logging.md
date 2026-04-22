# 2026-04-22 - Dev Logging For Browser QA

## Summary
- Added a dev-only structured logging system with session-persisted storage, console mirroring, and an in-app `DevLogPanel`.
- Instrumented the main runtime boundaries: app shell, route changes, auth/bootstrap, network status, Firestore subscriptions, workout writes, Tour writes, and celebration/prompt modal flows.
- Added documentation for using the dev log panel during manual browser QA and updated `AGENTS.md` to require boundary-only, sanitized dev logging on interactive/runtime changes.

## Decisions
- Kept the logger boundary-focused and out of pure domain logic such as rank math and XP rules.
- Defaulted logging to local dev without adding new environment variables.
- Stored only sanitized payloads so QA logs can be shared safely back to an agent.

## Notes
- React dev mode still produces some lifecycle duplication because of Strict Mode behavior, especially around mount/unmount boundaries. The log panel is still useful because user actions, snapshot results, and write outcomes remain explicit and timestamped.
- The app test suite now asserts selected dev-log events directly, in addition to the dedicated logger store and panel tests.
