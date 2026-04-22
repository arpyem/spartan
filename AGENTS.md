# AGENTS.md — Spartan Gains

This file governs how agents work on this codebase. Read it fully before writing any code. It covers architecture rules, workflow, testing requirements, and the animation quality bar that this project demands.

---

## What This Project Is

A Halo 3-themed workout tracker PWA. Users log workouts, earn EXP, and rank up across five independent training tracks (Cardio, Legs, Push, Pull, Core) using the authentic Halo 3 EXP ladder. A composite Global Rank averages all five. Each track supports 5 Tours (prestige system adapted from Halo MCC). Double XP weekends fire on a deterministic client-side schedule.

The full product spec lives in `SPARTAN-GAINS-SPEC.md`. Read it before touching any feature area.

**The defining quality bar for this project: the animations and interactions must feel as satisfying as the real Halo 3 rank-up experience.** This is not a stretch goal — it is the core product. A rank-up that doesn't feel electric is a failed feature, regardless of whether the logic is correct.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| PWA | `vite-plugin-pwa` (Workbox) |
| Auth | Firebase Authentication (Google) |
| Database | Firestore |
| Hosting | Firebase Hosting |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Testing | Vitest + React Testing Library |

---

## Repository Layout

```
spartan-gains/
├── SPARTAN-GAINS-SPEC.md     # Product spec — source of truth
├── AGENTS.md                 # This file
├── public/
│   ├── icons/
│   └── manifest.json
├── src/
│   ├── lib/                  # Pure logic — NO React imports allowed here
│   │   ├── ranks.ts
│   │   ├── xp.ts
│   │   └── firestore.ts
│   ├── components/
│   ├── screens/
│   ├── hooks/
│   ├── App.tsx
│   └── main.tsx
├── src/__tests__/
│   ├── ranks.test.ts
│   ├── xp.test.ts
│   └── components/
├── .env
├── vite.config.ts
└── package.json
```

---

## Architecture Rules

### 1. Pure Logic Lives in `src/lib/` — No Exceptions

All rank math, XP calculation, Double XP detection, and global rank computation must live as **pure TypeScript functions** in `src/lib/`. These files must have zero React imports. This is non-negotiable because:

- It makes the logic trivially unit-testable without mounting components
- It prevents business logic from leaking into UI components
- Other agents can work on logic and UI in parallel without conflicts

```ts
// ✅ CORRECT — pure function in src/lib/ranks.ts
export function getRankFromXP(xp: number): Rank { ... }

// ❌ WRONG — logic inside a component
const MyComponent = () => {
  const rank = RANKS.find(r => xp >= r.xpRequired) // don't do this
}
```

### 2. Firestore Writes Are Always Batched

Never write to Firestore with two separate calls when data must stay consistent. Use `writeBatch` any time you're updating both a workout document and the parent user's XP. Use `writeBatch` for Tour advancement (zero XP + increment tour atomically). A partial write that crashes mid-way corrupts user data permanently.

```ts
// ✅ CORRECT
const batch = writeBatch(db);
batch.set(workoutRef, workoutData);
batch.update(userRef, { [`tracks.${track}.xp`]: newXP });
await batch.commit();

// ❌ WRONG
await setDoc(workoutRef, workoutData);
await updateDoc(userRef, { ... }); // if this fails, data is inconsistent
```

### 3. Real-Time Data via `onSnapshot`

`useUserData` must use Firestore's `onSnapshot` listener, not one-shot `getDoc` calls. The XP bar and rank emblem must update in real-time the moment a workout is written — this is part of the satisfaction loop. Clean up the listener in the hook's `useEffect` return.

### 4. Rank-Up Detection Happens in the Log Flow

After a successful Firestore write, compare `getRankFromXP(xpBefore).id` vs `getRankFromXP(xpAfter).id`. If they differ, set state to trigger `RankUpModal`. This logic lives in the `LogScreen` submit handler, not in a Firestore trigger or a hook.

### 5. No Business Logic in Modals

`RankUpModal` and `TourModal` are pure presentation components. They receive the new rank / new tour as props and play the animation. They do not read from Firestore or compute anything.

### 6. Environment Variables

All Firebase config comes from `.env` via `import.meta.env.VITE_*`. Never hardcode API keys. Never commit `.env`. The `.env.example` file must stay up to date with all required keys.

---

## Workflow

### Before Starting Any Task

1. Read `SPARTAN-GAINS-SPEC.md` for the relevant feature area
2. Read this file if you haven't recently
3. Run `npm test` — all existing tests must pass before you write new code
4. Identify which `src/lib/` functions the feature depends on and check they're tested
5. Read `README.md` for the current implementation-plan status table and update it whenever a milestone or focused plan changes state

### Making Changes

- **One concern per commit.** Don't mix a logic change with a style change.
- **Logic first, UI second.** If a feature needs new `src/lib/` functions, write and test those before building the component that uses them.
- **Never skip the animation.** If a component has an animation spec in `SPARTAN-GAINS-SPEC.md`, the animation is required, not optional. A component without its animation is not done.
- **Maintain planning docs.** Keep `README.md` and the files under `plans/` in sync with implementation progress. If a milestone starts, is blocked, or completes, update its status in `README.md` as part of the same change.

### Definition of Done for a Feature

A feature is complete when:
- [ ] All relevant `src/lib/` functions are implemented and unit-tested
- [ ] The component renders correctly with real data
- [ ] All animations specified in the spec are implemented and feel correct
- [ ] The feature works on a real mobile device (or mobile Chrome DevTools at 390px width)
- [ ] `npm test` passes
- [ ] `npm run build` produces no TypeScript errors

---

## Testing

### Philosophy

Test the logic exhaustively. Test the UI minimally. The pure functions in `src/lib/` are the highest-value test targets — they are the game's rules and must be provably correct. Component tests should focus on integration behaviour (does the rank-up modal appear when XP crosses a threshold?) not implementation details (does this div have this class?).

### Test Runner

```bash
npm test           # run all tests (Vitest)
npm run test:watch # watch mode during development
npm run coverage   # coverage report
```

### Required Tests — `src/__tests__/ranks.test.ts`

Every function in `src/lib/ranks.ts` must be tested. At minimum:

```ts
describe('getRankFromXP', () => {
  it('returns Recruit at 0 XP')
  it('returns Recruit at 1 XP (below Apprentice threshold)')
  it('returns Apprentice at exactly 2 XP')
  it('returns 5-Star General at exactly 2000 XP')
  it('returns 5-Star General above 2000 XP (no overflow)')
  it('handles every rank threshold boundary — test all 42')
})

describe('getRankProgress', () => {
  it('returns 0 at the start of a rank tier')
  it('returns 100 at max rank')
  it('returns correct midpoint percentage')
})

describe('getGlobalRankIndex', () => {
  it('returns 0 when all tracks are at 0 XP')
  it('returns correct average of mixed track ranks')
  it('floors the result correctly')
})
```

### Required Tests — `src/__tests__/xp.test.ts`

```ts
describe('getBaseXP', () => {
  it('cardio: returns correct EXP for each minute bracket')
  it('lifting: returns correct EXP for each set bracket')
  it('cardio: boundary values (exactly 10, 20, 30, 45, 60, 90, 120 minutes)')
  it('lifting: boundary values (exactly 1, 5, 9, 13, 17, 21, 25 sets)')
})

describe('isDoubleXPWeekend', () => {
  it('returns true on a known Double XP Friday')
  it('returns true on a known Double XP Saturday')
  it('returns true on a known Double XP Sunday')
  it('returns false on a known non-Double XP weekend')
  it('returns false on a weekday even during a Double XP week')
})

describe('calculateXP', () => {
  it('doubles XP during Double XP weekend')
  it('does not double XP on a normal day')
})
```

### Component Tests

Use React Testing Library. Focus on behaviour, not markup:

```ts
// ✅ Good component test
it('shows RankUpModal when XP crosses a rank threshold on submit')
it('XP preview updates live as user types in the input')
it('Tour advancement banner appears when XP reaches 2000')

// ❌ Bad component test
it('renders a div with class xp-bar')
it('has the correct font-size on the rank name')
```

### Firebase / Firestore

Never hit real Firebase in tests. Mock `src/lib/firebase.ts` at the module level using Vitest's `vi.mock`. Keep a `src/__tests__/mocks/firebase.ts` with reusable mock implementations.

---

## Animation Quality Standard

**This section is critical. Do not skip it.**

The animations in this app are the product. A rank-up in Halo 3 felt like an event. Our rank-up must feel like an event. The XP bar filling must feel satisfying every single time. These are not "nice to have" — they are the reason the app is fun to use.

### The Standard

Before shipping any animated component, ask: *if a Halo 3 player saw this, would it feel at home?* The answer must be yes. If the animation feels generic, corporate, or like a standard progress bar, it is not done.

### Framer Motion — Key Patterns

**XP Bar Fill** — the most-seen animation in the app. Must feel weighty:
```ts
// Use a spring with low damping for that elastic "thunk" at the end
animate={{ width: `${progress}%` }}
transition={{ type: "spring", stiffness: 60, damping: 12, mass: 1.2 }}
```

**Rank-Up Emblem** — must feel like a reward moment:
```ts
// Scale punch: small → overshoot → settle
animate={{ scale: [0.8, 1.25, 1.0], opacity: [0, 1, 1] }}
transition={{ duration: 0.5, times: [0, 0.6, 1], ease: "easeOut" }}
```

**Tour Shield Materialization** — the biggest moment in the app, must earn it:
```ts
// Shield appears from nothing, overshoots, settles — stagger inner details
<motion.g
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: [0, 1.3, 1.0], opacity: [0, 1, 1] }}
  transition={{ duration: 1.4, times: [0, 0.7, 1], ease: "easeOut" }}
/>
```

**Glow Effects** — use SVG `<filter>` with `feGaussianBlur` + `feComposite` for the emblem glow, not CSS box-shadow (SVG elements don't respect box-shadow correctly):
```svg
<filter id="emblem-glow">
  <feGaussianBlur stdDeviation="4" result="blur" />
  <feComposite in="SourceGraphic" in2="blur" operator="over" />
</filter>
```

**Screen Flash on Rank-Up** — a full-viewport white/gold overlay that fades in 80ms and out 300ms:
```ts
<motion.div
  className="fixed inset-0 bg-amber-300 pointer-events-none z-50"
  initial={{ opacity: 0 }}
  animate={{ opacity: [0, 0.6, 0] }}
  transition={{ duration: 0.38, times: [0, 0.2, 1] }}
/>
```

### Reference Material

Before building any animated component, look at these resources to calibrate your eye:

**Halo 3 Rank-Up Moment (what we're evoking):**
- Search YouTube: `"Halo 3 rank up" service record` — watch how the emblem appears, the brief flash, the emblem glow. That's the feeling.
- Search YouTube: `"Halo MCC tour advancement"` — watch the shield materialize. Note how it feels ceremonial and earned.

**Framer Motion — production animation patterns:**
- Docs: https://www.framer.com/motion/ — specifically the `keyframes`, `spring`, and `staggerChildren` sections
- `useAnimate` hook: https://www.framer.com/motion/use-animate/ — use this for the multi-step rank-up sequence where you need precise control over timing across multiple elements
- Layout animations: https://www.framer.com/motion/layout-animation/ — use for XP bar reflow when tracks change

**Game UI animation references (for calibrating feel):**
- Search YouTube: `"satisfying game UI animations" OR "game HUD animation breakdown"` — pay attention to timing curves and the use of overshoot/spring
- Search: `"Halo infinite career rank up animation"` — 343i's modern version of the same feeling

**CSS Glow / Scan-line effects:**
- For the HUD scan-line texture on the home screen background, search: `"CSS scanline effect codepen"` — pick one that uses `repeating-linear-gradient` and keep it subtle (3–5% opacity max)
- For the green phosphor glow on XP numbers, search: `"CSS text glow green terminal effect"` — use `text-shadow` with multiple layered shadows at different blur radii

### Animation Don'ts

- **No linear easing on anything visible to the user.** Linear motion feels mechanical and cheap. Always use spring, ease-out, or a custom cubic-bezier.
- **No instant state changes.** If a number changes (XP awarded, rank name), animate the transition. Use `AnimatePresence` with exit animations for anything that leaves the DOM.
- **Don't over-animate idle state.** The home screen should breathe slightly (slow emblem pulse, subtle glow variation) but not be distracting. Animation should reward action, not demand attention.
- **Don't use the same animation for rank-up and Tour advancement.** These must feel meaningfully different in weight and duration. Tour advancement is rarer and should feel proportionally more epic.

---

## Specific Component Notes

### `XPBar.tsx`
The XP bar is seen every time the user opens the app. It must:
- Animate from old value to new value when XP is awarded (not jump)
- Show a subtle scan-line or gloss overlay to feel like a HUD element
- Turn amber/gold during Double XP weekends
- Have a faint pulsing glow at the fill edge (not distracting, just alive)

### `RankEmblem.tsx` + `ShieldBackground.tsx`
All 42 rank SVGs must be implemented. Do not ship placeholder circles to production — build the real shapes. Reference images:
- Search: `"Halo 3 rank icons all" site:halopedia.org` or `"Halo 3 rank emblems SVG"`
- The Halopedia rank page (https://www.halopedia.org/Rank_(Halo_3)) has emblem images for each rank — use these as shape references, then recreate geometrically in SVG. Do not hotlink external images.

The five Tour shields must be clearly distinct from each other. When a user is Tour 5, their emblem should look visually impressive at a glance.

### `RankUpModal.tsx`
This is the most important moment in the app. It must:
1. Flash the screen (amber/white overlay, ~380ms)
2. Fade in the new rank emblem from scale 0 with overshoot
3. Display "RANK UP" in Orbitron with a staggered letter reveal or a fast scale-in
4. Show the new rank name below with a slight delay
5. Play a glow pulse on the emblem that radiates outward once
6. Auto-dismiss after 4 seconds OR on tap

Do not skip any of these steps. Each step exists because Halo 3's rank-up felt satisfying for exactly these reasons.

### `TourModal.tsx`
Rarer and more ceremonial than rank-up. Sequence:
1. Darken the entire screen (near-black overlay)
2. Display the old emblem fading out (scale 1 → 0.8, opacity 1 → 0)
3. New shield materializes from center (scale 0 → 1.3 → 1.0, 1400ms)
4. Rank emblem fades back in on top of the shield
5. Gold particle burst radiates from center (use Framer Motion `useAnimate` with staggered point animations, or a canvas-based particle system)
6. "TOUR ADVANCED" + new Tour name text fades in last
7. Require explicit user tap to dismiss — this moment should not auto-close

For the particle burst, if Framer Motion feels limiting, use a small canvas overlay:
- Search: `"canvas particle burst javascript" codepen` — find a radial burst pattern and adapt it to fire once on mount
- Keep particles gold (`#ffd700`) on the dark overlay background

### `TrackCard.tsx`
Each of the five track cards on the home screen must show:
- Track icon (emoji or custom SVG)
- Current rank emblem (with Tour shield if applicable)
- Rank name
- XP bar with current progress
- A subtle "TOUR ADVANCEMENT AVAILABLE" pulse banner when at 2000 XP

The card tap target must be the full card, navigating to `LogScreen` for that track.

---

## Common Mistakes to Avoid

**Do not call `getDoc` in a render path.** All Firestore reads go through `useUserData`'s `onSnapshot`. If you find yourself calling `getDoc` inside a component, you're doing it wrong.

**Do not compute rank inside a component.** Call `getRankFromXP(track.xp)` from `src/lib/ranks.ts`. Never inline the RANKS lookup.

**Do not store computed values in Firestore.** Store raw `xp` and `tour` only. Rank name, rank index, progress percentage — all derived in the client from pure functions.

**Do not make the Tour advancement automatic.** The user must confirm. The confirmation tap is part of the ceremony.

**Do not use `setTimeout` for animation sequencing.** Use Framer Motion's `transition.delay` or `useAnimate` with an async sequence. `setTimeout`-based animation is fragile and hard to maintain.

**Do not animate on every render.** Use `AnimatePresence` and conditional mounting, or `useAnimation` controls that fire only on specific events. Constant ambient animation (beyond the subtle idle pulse) is distracting.

---

## Dev Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (localhost:5173)
npm test             # run Vitest test suite
npm run test:watch   # watch mode
npm run coverage     # coverage report
npm run build        # production build (must pass tsc with no errors)
npm run preview      # preview production build locally
firebase deploy      # deploy to Firebase Hosting
```

---

## Environment Setup

Copy `.env.example` to `.env` and fill in your Firebase project values:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firebase project requirements:
- Authentication: enable Google Sign-In provider
- Firestore: create database in production mode, apply security rules from spec
- Hosting: initialize with `firebase init hosting`, set `dist` as public directory

---

## Questions an Agent Should Ask Before Shipping

Before marking any task complete, an agent should be able to answer yes to all of these:

- Does `npm test` pass with no failures?
- Does `npm run build` complete with no TypeScript errors?
- If this feature has an animation, does it match the spec and feel satisfying on a real (or simulated) mobile screen?
- If this feature writes to Firestore, is the write batched if multiple fields are updated?
- If this feature introduces new logic, does that logic live in `src/lib/` as a pure function with unit tests?
- Does the feature work correctly at 390px viewport width?
- Would a Halo 3 player recognize the vibe?
