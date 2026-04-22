# 2026-04-22 - Plan 06 setup review remediation

## What changed
- Hardened `useAuthSession` with explicit bootstrap lifecycle state, in-flight deduplication, and an in-session retry path for first-sign-in profile creation.
- Updated `HomeScreen` so signed-in users with a failed initial profile write see actionable retry UI instead of a passive bootstrap placeholder.
- Extended the rank-up event payload with the active Tour level and updated `RankUpModal` to render the promoted emblem with the correct shield.
- Replaced `setTimeout`-driven rank-up auto-dismiss with a Framer Motion-owned completion timeline.
- Added review-follow-up coverage for bootstrap failure recovery and Tour-aware rank-up rendering, then registered Plan 06 in the planning docs.

## Decisions
- Bootstrap failure state is kept separate from signed-out auth errors so sign-in/sign-out copy does not leak into signed-in recovery flows.
- Retry stays on the signed-in home surface instead of bouncing the user back to the auth screen because the auth session itself is still valid.
- Rank-up auto-dismiss remains four seconds long, but the lifecycle now belongs to Framer Motion instead of a manual timer.

## Learnings
- The original bootstrap logic was structurally correct for the happy path, but marking a UID as bootstrapped before `ensureUserDoc` succeeded created a one-failure dead end that tests did not previously cover.
- The rank-up modal tests were validating presence and dismissal behavior but not the emblem's Tour composition, which left the ceremony open to a product-critical visual regression.
