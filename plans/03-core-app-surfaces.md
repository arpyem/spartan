# Milestone 03: Core App Surfaces

## Summary
Deliver the functional app loop: authentication, home screen readouts, track navigation, workout logging, live XP preview, info surface structure, and real-time data refresh. This milestone should make the product usable end to end even before the full ceremony pass lands.

## Implementation Plan
### Auth Experience
- Build `AuthScreen.tsx` as the entry surface for signed-out users with Google sign-in as the only auth method.
- Keep the signed-in transition smooth and state-driven from the top-level auth gate rather than route hacks.

### Home Screen
- Build `HomeScreen.tsx` around three layers from the spec: global rank display, five track cards, and bottom CTA/banner area.
- Show global rank using averaged track rank indices and derived display data from pure rank helpers.
- Render track cards in a fixed canonical order with live progress from `useUserData`.
- Add the conditional Double XP banner state and the home info trigger.

### Track Cards And Global Display
- Build `TrackCard.tsx` to show track icon, current emblem, rank name, XP bar, and tour-available banner.
- Make the full card the tap target for navigation into `/log/:track`.
- Build `GlobalRank.tsx` to present the composite emblem and summary progression in a visually dominant but reusable form.

### Log Workout Flow
- Build `LogScreen.tsx` with track-specific labeling and inputs: minutes for cardio, sets for all other tracks.
- Show live XP preview as the user types, including doubled formatting during active Double XP periods.
- Add optional workout note input.
- On submit, call the Firestore logging helper, derive rank-up by comparing old and new rank ids, and surface the correct UI event payloads for later celebration components.
- Surface the tour-available prompt when `xpAfter >= 2000` and the user is below tour 6, but do not auto-advance.

### Info Surface
- Build `InfoModal.tsx` as a slide-up sheet with account, stats, tour status, full rank table, Double XP explanation, and sign-out sections.
- Scope the first pass to structure and real data bindings; the heavy visual ceremony remains in Milestone 04.

### Real-Time Wiring
- Use `useUserData` as the single source for home and track progression state.
- Avoid component-local rank or progress calculations beyond calling pure helper functions with snapshot data.
- Keep loading and empty states consistent so the app does not flicker or show placeholder logic gaps during auth or initial subscription.

## Interfaces And Files To Anchor
- `src/screens/AuthScreen.tsx`
- `src/screens/HomeScreen.tsx`
- `src/screens/LogScreen.tsx`
- `src/components/TrackCard.tsx`
- `src/components/GlobalRank.tsx`
- `src/components/InfoModal.tsx`
- `src/components/DoubleXPBanner.tsx`

## Acceptance Criteria
- Signed-out users see the auth surface; signed-in users land in the main app shell.
- Home screen shows all five tracks and the global rank from live snapshot data.
- Track cards navigate into the correct logging route.
- Log screen updates XP preview live and writes workouts through the atomic Firestore path.
- Rank-up and tour-available states are emitted correctly after successful logging.
- Info modal surfaces the required sections with live user-derived data where available.

## Test Cases
- Auth surface renders correctly for signed-out state and exits when auth state becomes valid.
- Home screen renders five track cards from mocked snapshot data and updates when snapshot data changes.
- Track card tap navigates to the correct `/log/:track` route.
- Log screen preview updates as users change minutes or sets.
- Submit flow triggers the Firestore helper and shows a rank-up modal trigger when the threshold is crossed.
- Submit flow surfaces a tour-available prompt when the post-write XP reaches 2000 and tour is below 6.
- Info modal opens, closes, and renders the required section headers.

## Assumptions
- Detailed modal animation polish is deferred to Milestone 04, but the event plumbing for those surfaces should be stable here.
- Home-screen stats that depend on workout history aggregation can start with straightforward derived queries or snapshot-fed counts as long as the data contract stays testable.
