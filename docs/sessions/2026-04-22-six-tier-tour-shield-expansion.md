# Six-Tier Tour Shield Expansion

## Summary

- expanded progression from five Tour values to six Tour states so the ladder now runs Base, Bronze, Silver, Gold, Platinum, and Diamond
- centralized Tour metadata in `src/lib/tours.ts` so labels, materials, max-tier rules, and advancement gating stay consistent across Firestore helpers, runtime mocks, and UI surfaces
- redesigned the shield backing as a restrained Halo 3-style accessory family that stays behind the rank emblem and differentiates tiers through material, trim, and facet treatment instead of oversized silhouettes
- refined the shield family again so it behaves more like a perimeter frame around the emblem plate than a filled backplate, with progressively richer crown, rail, shoulder, and lower-point detailing as Tours increase
- translated the next design pass toward an additive prestige-ring system inspired by the external `tour-frames-v2` reference, replacing most of the shield silhouette language with ring segments, bracket arcs, diagonal diamonds, cardinal pips, and Diamond halo accents around the emblem
- eased the ring treatment back after the first reference-style pass by pushing the frame outward slightly and lowering ring/glow opacity, so the emblem plate and glyph stay more clearly in the foreground
- enlarged the Tour frame once more and reduced the shielded emblem stage slightly so every rank gets more breathing room inside the prestige perimeter, especially the denser officer and general emblems
- increased the Tour frame geometry by another 10% while keeping the emblem centered, pushing the prestige perimeter farther out without changing the surrounding UI composition
- increased the frame another 5% and reduced its visual weight by lowering opacity and glow strength, keeping the emblem centered while making the prestige layer more subdued
- enlarged the Tour frame another 5%, muted the perimeter again, and reworked Gold so Bronze, Silver, and Gold now read as one additive progression instead of Gold swapping to a separate frame language

## Decisions

- kept compatibility simple by treating existing persisted `tour: 5` records as Platinum, with Diamond unlocked only through a real `5 -> 6` Tour advancement
- surfaced named Tour labels in the UI (`Base Tour`, `Bronze Tour`, `Silver Tour`, `Gold Tour`, `Platinum Tour`, `Diamond Tour`) rather than leaving the new tiering implicit
- preserved the existing celebration flow split: Tour confirmation stays separate from the ceremony, and the new Diamond tier only changed the payloads and visuals, not the modal sequencing model
- shifted the visual emphasis away from broad filled shields and toward thin H3-style outline geometry so the rank emblem stays dominant and the Tour layer reads as an earned frame
- kept the reference implementation as inspiration only rather than importing the demo directly, so the live app still uses the existing `RankEmblem` and `ShieldBackground` pipeline, test hooks, and ceremony surfaces
- favored hierarchy over spectacle in the final spacing tweak: more gap between emblem and Tour frame, less frame intensity, and no extra ornament
- kept the progression additive rather than tier-replacing: Gold now builds directly from the Silver perimeter cues, and Platinum/Diamond add on top of that instead of discarding the earlier structure

## Learnings

- the cleanest way to add a real Diamond tier without introducing inconsistent `tour < 6` checks everywhere was to make Tour metadata a first-class domain helper instead of encoding labels and max-state logic directly in screens
- the shield reads more like a Halo service-record accessory when the silhouette stays compact and the tiers differentiate through bevel, rim, and accent language rather than larger outer shapes
- the max-tier integration case still triggers a normal rank-up at `1999 -> 2000` on Diamond, so the regression test needed to assert only that Tour advancement does not appear, not that all celebrations disappear
- because the rank glyph hides most of the center, the crown, shoulders, side rails, and lower tip carry almost all of the Tour readability; pushing variation into those perimeter zones creates clearer progression at card size than adding center detail
- the external ring demo solved the readability problem more cleanly than the first shield-outline pass because it concentrated all progression cues on the outer perimeter, which remains visible even on the denser officer and general emblems
- once the perimeter language is working, the fastest way to improve legibility is not adding more detail but backing the frame off slightly so the emblem has room to breathe
- Gold was the weakest tier when it abandoned the Silver structure too abruptly; keeping the same outer family and adding one more layer reads more like earned Halo prestige than swapping to a new silhouette

## Verification

- passed: `npm test`
- passed: `npm run build`
