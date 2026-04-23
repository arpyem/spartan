# 2026-04-23 App Name Rename

## Summary
- Renamed the app-facing product name from `Spartan Gains` to `Spartan`.
- Updated the PWA manifest, install banner, browser title, and Apple standalone title so installs and browser tabs now present the shorter name consistently.
- Updated core project docs and spec headings to match the new product name.

## Verification
- `npm test`

## Notes
- This pass intentionally changed the visible product name and documentation references only. Package identifiers and Firebase project ids were left unchanged.
