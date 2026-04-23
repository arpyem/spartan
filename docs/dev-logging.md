# Dev Logging

Spartan includes a dev-only structured log system for manual browser QA and agent-assisted debugging.

## How To Open It
- Run the app with `npm run dev`.
- Use the `Dev Logs` button in the bottom-right corner of the browser.
- On wider screens the panel docks on the right.
- On narrow/mobile widths it opens as a bottom sheet.

## What It Captures
- App startup and route changes
- Firebase auth and bootstrap lifecycle
- Online/offline transitions
- Firestore snapshot subscribe/success/error/unsubscribe events
- Workout write and Tour advancement start/success/failure events
- Rank-up, Tour prompt, Tour ceremony, and info modal open/close events

## Sharing Logs During QA
- Use `Copy Visible Logs` to copy the currently filtered entries as JSON.
- Use `Download JSON` to save the currently visible entries to a file.
- Use the level/category filters to narrow the log to the flow you are testing.
- When reporting a manual browser issue back to another agent, include the copied log output along with the reproduction steps.

## Safety Rules
- Dev logs are enabled only in local dev.
- Logs are sanitized before storage and console output.
- Raw workout notes, full emails, tokens, Firebase config values, and full photo URLs must not appear in the log buffer.
