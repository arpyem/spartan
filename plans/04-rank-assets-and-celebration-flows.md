# Milestone 04: Rank Assets And Celebration Flows

## Summary
This milestone is the product-defining pass. It turns the functional app into a Halo 3-inspired progression experience by implementing the emblem system, shield tiers, XP bar feel, rank-up ceremony, and tour advancement ceremony to the quality bar defined in [AGENTS.md](/C:/Users/rpmmi/Documents/spartan/AGENTS.md).

## Implementation Plan
### Rank Asset System
- Build `ShieldBackground.tsx` for tours 2 through 5 using the distinct shield silhouettes and palettes from the spec.
- Build `RankEmblem.tsx` as the composition layer that renders the shield behind the rank icon when `tour > 1`.
- Implement all 42 rank icons as geometric SVG recreations grouped by enlisted, officer, and general tiers to keep the asset system maintainable.
- Use placeholders only as temporary development scaffolding; define a cleanup checkpoint before this milestone is considered complete.

### XP Bar Experience
- Build `XPBar.tsx` with animated fill transitions from previous to new progress values.
- Add the subtle HUD scan-line or gloss treatment, edge glow, and Double XP color shift specified in the docs.
- Ensure motion uses spring or eased timing that feels weighted rather than mechanical.

### Rank-Up Sequence
- Build `RankUpModal.tsx` as a full-screen takeover with the required sequence: screen flash, emblem overshoot entry, `RANK UP` text reveal, delayed rank-name reveal, and a single outward glow pulse.
- Allow auto-dismiss after four seconds and tap-to-dismiss earlier.
- Drive sequencing through Framer Motion transitions or `useAnimate`, not `setTimeout`.

### Tour Advancement Sequence
- Build `TourModal.tsx` as a rarer, heavier ceremony distinct from rank-up.
- Sequence the old emblem fade-out, shield materialization, emblem return, gold particle burst, and final text reveal.
- Require explicit dismissal tap after the animation completes.
- Keep the advancement write separate from the celebratory surface so the modal remains presentation-only.

### Visual Fidelity And Review
- Audit all emblem and animation surfaces against the Halo 3 / Halo MCC references listed in the docs.
- Review for pacing, overshoot, glow behavior, and differentiation between common feedback and rare ceremonial moments.
- Treat any generic or placeholder-feeling motion as a blocker to milestone completion.

## Interfaces And Files To Anchor
- `src/components/ShieldBackground.tsx`
- `src/components/RankEmblem.tsx`
- `src/components/XPBar.tsx`
- `src/components/RankUpModal.tsx`
- `src/components/TourModal.tsx`

## Acceptance Criteria
- The app has a complete strategy for all 42 emblems and all 5 tour shields.
- XP bar transitions feel alive and game-like, including Double XP variants.
- Rank-up animation includes every required beat from the docs and feels fast, bright, and rewarding.
- Tour advancement feels rarer, darker, longer, and more ceremonial than rank-up.
- Presentation components remain free of Firestore or progression computations.

## Test Cases
- `RankEmblem` renders the correct shield/background combination for each tour state.
- `XPBar` animates when progress changes and switches styling for Double XP periods.
- Rank-up modal renders the provided rank payload and supports tap or timed dismissal behavior.
- Tour modal renders the provided tour payload and requires explicit dismissal after animation.
- Visual review at `390px` width confirms readability, animation containment, and touch-target viability.

## Assumptions
- Visual asset refinement may proceed tier by tier, but the milestone is only complete when no production placeholder art remains.
- If a canvas overlay is the cleanest path for the gold particle burst, it is acceptable so long as it is encapsulated and does not own business logic.
