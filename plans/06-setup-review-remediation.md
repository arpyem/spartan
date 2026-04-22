# Plan 06: Setup Review Remediation

## Summary
This follow-up plan addresses the setup review findings without changing the product scope or Firestore schema. It hardens first-sign-in profile bootstrap behavior, fixes Tour-aware rank-up ceremony rendering, and closes the related test/documentation gaps.

## Status
Complete. The code now retries profile bootstrap safely in-session, surfaces actionable recovery UI when the initial Firestore profile write fails, preserves the active Tour shield in rank-up ceremonies, and removes timeout-driven rank-up dismissal.

## Key Changes
### Auth And Bootstrap Resilience
- Add explicit auth bootstrap state in `useAuthSession`: `idle`, `running`, `ready`, and `error`.
- Deduplicate concurrent bootstrap attempts per UID without marking success before `ensureUserDoc` finishes.
- Expose a retry entrypoint so signed-in screens can recover from a failed first profile write without forcing a reload.

### Signed-In Recovery UI
- Update `HomeScreen` so a missing profile document shows actionable retry UI when bootstrap fails.
- Keep the existing waiting state for in-flight bootstrap work and use clear copy for the recovery path.

### Rank-Up Ceremony Correctness
- Extend `RankUpEvent` with the active `tour`.
- Populate that Tour value from the logging flow and render the promoted emblem with the correct shield in `RankUpModal`.
- Replace timer-based rank-up auto-dismiss with a Framer Motion-owned completion timeline while preserving tap-to-dismiss.

### Planning And Documentation
- Add Plan 06 to the README status table and focused-plan index.
- Record the remediation session under `docs/sessions/`.
- Keep Plan 05 active until the manual release checklist is finished.

## Test Cases
- Signed-in bootstrap failure renders actionable retry UI instead of a passive waiting surface.
- Retrying bootstrap after a failed first write recovers the session without a reload.
- Rank-up modal preserves the current Tour shield for post-Tour-1 promotions.
- Rank-up modal still supports tap dismissal and auto-dismiss after the Framer Motion timeline completes.
- `npm test` and `npm run build` stay green after the remediation.

## Assumptions
- This plan is a focused remediation pass, not a new product milestone.
- No Firestore document shape changes or migrations are needed.
- Manual 390px and animation-feel QA remain required because the fixes touch the progression reward loop.
