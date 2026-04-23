# Spartan Gains — PWA Spec
> A Halo 3-themed workout tracker. Log workouts, earn EXP, rank up across five training tracks. Built as a PWA with Google Auth and Firebase persistence.

---

## Overview

Five independent rank tracks (Cardio, Legs, Push, Pull, Core) each with the full authentic Halo 3 EXP ladder — Recruit through 5-Star General. A sixth composite **Global Rank** is the average of all five tracks. Each track supports a six-tier Tour ladder: Base, Bronze, Silver, Gold, Platinum, and Diamond. Double XP weekends fire on a deterministic schedule.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| PWA | `vite-plugin-pwa` (Workbox) |
| Auth | Firebase Authentication (Google provider) |
| Database | Firestore |
| Hosting | Firebase Hosting |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | SVG components (hand-authored, see Rank Assets section) |

---

## Firebase Setup

### Auth
- Google Sign-In provider only
- Persist session with `browserLocalPersistence`
- On first sign-in, create user document in Firestore

### Firestore Rules
```
users/{uid} — read/write only if request.auth.uid == uid
```

### Firestore Data Model

```
users/{uid}
  displayName:     string
  email:           string
  photoURL:        string
  createdAt:       timestamp

  tracks: {
    cardio: { xp: number, tour: number }   // tour 1–6, starts at 1
    legs:   { xp: number, tour: number }
    push:   { xp: number, tour: number }
    pull:   { xp: number, tour: number }
    core:   { xp: number, tour: number }
  }

workouts/{workoutId}   (subcollection under users/{uid})
  track:      "cardio" | "legs" | "push" | "pull" | "core"
  value:      number        // minutes for cardio, sets for all others
  xpEarned:   number        // after double XP multiplier applied
  doubleXP:   boolean
  note:        string       // optional, e.g. "Back squats 5x5"
  timestamp:  timestamp
```

---

## Rank System

### The 42-Rank Ladder (authentic Halo 3 playlist EXP thresholds)

Each track uses this exact table. `xpRequired` is the **total cumulative XP** needed to hold that rank.

```javascript
export const RANKS = [
  { id: 0,  name: "Recruit",              xpRequired: 0    },
  { id: 1,  name: "Apprentice",           xpRequired: 2    },
  { id: 2,  name: "Apprentice G2",        xpRequired: 3    },
  { id: 3,  name: "Private",              xpRequired: 4    },
  { id: 4,  name: "Private G2",           xpRequired: 5    },
  { id: 5,  name: "Corporal",             xpRequired: 7    },
  { id: 6,  name: "Corporal G2",          xpRequired: 10   },
  { id: 7,  name: "Sergeant",             xpRequired: 12   },
  { id: 8,  name: "Sergeant G2",          xpRequired: 15   },
  { id: 9,  name: "Sergeant G3",          xpRequired: 20   },
  { id: 10, name: "Gunnery Sergeant",     xpRequired: 25   },
  { id: 11, name: "Gunnery Sergeant G2",  xpRequired: 30   },
  { id: 12, name: "Gunnery Sergeant G3",  xpRequired: 35   },
  { id: 13, name: "Master Gunnery Sgt",   xpRequired: 40   },
  { id: 14, name: "Lieutenant",           xpRequired: 50   },
  { id: 15, name: "Lieutenant G2",        xpRequired: 60   },
  { id: 16, name: "Lieutenant G3",        xpRequired: 70   },
  { id: 17, name: "First Lieutenant",     xpRequired: 80   },
  { id: 18, name: "Captain",              xpRequired: 100  },
  { id: 19, name: "Captain G2",           xpRequired: 110  },
  { id: 20, name: "Captain G3",           xpRequired: 120  },
  { id: 21, name: "Staff Captain",        xpRequired: 135  },
  { id: 22, name: "Major",                xpRequired: 150  },
  { id: 23, name: "Major G2",             xpRequired: 160  },
  { id: 24, name: "Major G3",             xpRequired: 170  },
  { id: 25, name: "Field Major",          xpRequired: 185  },
  { id: 26, name: "Commander",            xpRequired: 200  },
  { id: 27, name: "Commander G2",         xpRequired: 225  },
  { id: 28, name: "Commander G3",         xpRequired: 250  },
  { id: 29, name: "Strike Commander",     xpRequired: 275  },
  { id: 30, name: "Colonel",              xpRequired: 300  },
  { id: 31, name: "Colonel G2",           xpRequired: 325  },
  { id: 32, name: "Colonel G3",           xpRequired: 350  },
  { id: 33, name: "Force Colonel",        xpRequired: 375  },
  { id: 34, name: "Brigadier",            xpRequired: 400  },
  { id: 35, name: "Brigadier G2",         xpRequired: 425  },
  { id: 36, name: "Brigadier G3",         xpRequired: 450  },
  { id: 37, name: "Brigadier General",    xpRequired: 475  },
  { id: 38, name: "General",              xpRequired: 500  },
  { id: 39, name: "General G2",           xpRequired: 1000 },
  { id: 40, name: "General G3",           xpRequired: 1500 },
  { id: 41, name: "5-Star General",       xpRequired: 2000 },
];
```

### Rank Calculation

```javascript
// Get current rank object from total XP
export function getRankFromXP(xp) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.xpRequired) rank = r;
    else break;
  }
  return rank;
}

// Get XP needed for next rank (null if at max)
export function getNextRankXP(xp) {
  const next = RANKS.find(r => r.xpRequired > xp);
  return next ? next.xpRequired : null;
}

// Progress percentage within current rank tier (0–100)
export function getRankProgress(xp) {
  const current = getRankFromXP(xp);
  const next = RANKS.find(r => r.xpRequired > xp);
  if (!next) return 100;
  const tierSize = next.xpRequired - current.xpRequired;
  const tierProgress = xp - current.xpRequired;
  return Math.floor((tierProgress / tierSize) * 100);
}
```

### Global Rank

Global Rank is the **average rank index** across all five tracks, rounded down. Display it using the same RANKS table.

```javascript
export function getGlobalRankIndex(tracks) {
  const indices = Object.values(tracks).map(t => getRankFromXP(t.xp).id);
  return Math.floor(indices.reduce((a, b) => a + b, 0) / indices.length);
}
```

Global Rank **does not have prestige** — it's a pure composite readout.

---

## Tour System (Prestige)

Directly adapted from the **Halo: MCC Tour system** — the faithful Bungie implementation of prestige. When a track reaches **5-Star General (2,000 XP)**, the player can advance to the next Tour. XP resets to 0 but a new **backing shield** is permanently unlocked for that track's emblem, visually displayed behind the rank icon.

### Tour Shields (per track)

| Tour | Shield Style | Color / Feel |
|---|---|---|
| 1 | No shield — bare emblem | Base — unprestiged |
| 2 | Compact beveled shield | Bronze — committed |
| 3 | Refined shield with cool rim | Silver — veteran |
| 4 | Brighter trim and crown edge | Gold — elite |
| 5 | Sharper alloy shell | Platinum — mythic |
| 6 | Platinum-derived shield with crystalline accents | Diamond — maxed |

Tours are per-track and fully independent. A user can be Tour 4 in Lifting and Tour 1 in Core simultaneously.

### Tour Advancement Flow
- At 5-Star General (2,000 XP): a "TOUR ADVANCEMENT AVAILABLE" banner pulses on that track's card
- User taps to confirm — shows a preview of the new shield they'll earn
- `xp` resets to `0`, `tour` increments by 1 (max 6)
- Full-screen Tour advancement animation plays (distinct from rank-up): shield materializes from the center outward, new shield slot fills in
- Track card immediately re-renders with the new shield behind the (now Recruit) emblem

---

## XP Economy

### Base Conversion Logic

Halo 3 awarded **1 EXP per win**. Average match length was ~8 minutes. We use this as the conversion unit: **1 EXP = 1 "game equivalent"**.

**Cardio** (input: minutes):
```
10–19 min  →  1 EXP   (~1 game)
20–29 min  →  2 EXP
30–44 min  →  4 EXP
45–59 min  →  5 EXP
60–89 min  →  8 EXP
90–119 min → 12 EXP
120+ min   → 16 EXP
```

**Lifting** (input: sets — each set ≈ ~2.5 min of active work):
```
1–4 sets   →  1 EXP
5–8 sets   →  2 EXP
9–12 sets  →  3 EXP
13–16 sets →  4 EXP
17–20 sets →  5 EXP
21–24 sets →  6 EXP
25+ sets   →  8 EXP
```

### Double XP Weekends

Double XP fires on a **deterministic schedule** — no server config needed, same result for every client on a given date.

```javascript
export function isDoubleXPWeekend(date = new Date()) {
  // Epoch week number
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weekNum = Math.floor(date.getTime() / weekMs);
  const day = date.getDay(); // 0=Sun, 5=Fri, 6=Sat
  const isWeekend = day === 5 || day === 6 || day === 0;
  // Every 5th week is a Double XP weekend
  return weekNum % 5 === 0 && isWeekend;
}

export function calculateXP(track, value, date = new Date()) {
  const base = getBaseXP(track, value);
  const multiplier = isDoubleXPWeekend(date) ? 2 : 1;
  return base * multiplier;
}
```

**UI behavior for Double XP:**
- Thursday midnight: amber "DOUBLE XP THIS WEEKEND" banner appears on home screen
- Friday–Sunday: banner turns active green, all XP awards show "2x" badge
- XP preview on log screen shows both base and doubled amount during active period

---

## App Surfaces

### 1. Home Screen (`/`)

**Layout:** Dark, atmospheric. Three rows:
- Top: Global Rank emblem (large, centered) with rank name and composite XP bar
- Middle: Five track emblems in a row — Cardio 🫀 · Legs 🦵 · Push 🫸 · Pull 🤜 · Core 🧱 — each showing rank icon, rank name, XP bar, and prestige numeral if applicable
- Bottom: "LOG WORKOUT" CTA button + Double XP banner (conditional)

Tapping any track emblem navigates to that track's log screen.

### 2. Log Workout Screen (`/log/:track`)

**Header:** Track name + current rank emblem for that track

**Input:**
- Cardio: large number input for minutes (tap +/- or type)
- All others: large number input for sets

**XP Preview:** Live calculation displayed below input — "= 4 EXP" — updates as user types. During Double XP: show "4 × 2 = **8 EXP** 🔥"

**Optional note field:** Single text input, placeholder "What did you do? (optional)"

**Submit button:** "LOG IT" — triggers XP award flow

**XP Award Flow (on submit):**
1. Write to Firestore
2. Animate XP number flying up into the track's XP bar
3. XP bar fills with a smooth animation
4. If rank-up occurred: trigger rank-up modal
5. If prestige now available: show prestige prompt

### 3. Rank-Up Modal

Full-screen takeover. Shows:
- New rank emblem (large, pulsing glow animation)
- "RANK UP" text in Halo-style typography
- New rank name
- Brief flash of white/gold screen edge

Dismiss by tapping anywhere. Auto-dismisses after 4 seconds.

### 4. Info Modal (slide-up sheet)

Triggered by an info icon (ⓘ) in the top-right corner of home screen.

**Sections:**
1. **Account** — Google avatar, display name, email, member since date
2. **Your Stats** — total workouts logged, breakdown by track (e.g., "47 cardio sessions · 312 total minutes")
3. **Tour Status** — current Tour per track (1–6), with shield preview icons
4. **Full Rank Table** — all 42 ranks with EXP thresholds, current rank highlighted
5. **Double XP Schedule** — brief explanation of the weekend system
6. **Sign Out** button

---

## Rank Emblems (SVG)

Each of the 42 ranks needs an SVG emblem component. These should be faithful recreations of the Halo 3 rank icons using basic SVG shapes (chevrons, bars, stars, shields, skulls for higher ranks).

**Emblem component signature:**
```tsx
<RankEmblem rankId={number} tour={1|2|3|4|5|6} size={number} />
```

Tour 1 = bare emblem, no shield
Tour 2–6 = shield SVG rendered behind rank icon, upgrading per tier

```tsx
// Internal structure
<g className="emblem-root">
  {tour > 1 && <ShieldBackground tour={tour} />}  // SVG shield layer behind
  <RankIcon rankId={rankId} />                     // rank emblem on top
</g>
```

**Shield color palette:**
- Tour 1: no shield
- Tour 2 (Bronze): `#b9855a` stroke over a matte bronze shell
- Tour 3 (Silver): `#c7d2de` stroke over a cool steel shell
- Tour 4 (Gold): `#f0c45b` stroke over a warm alloy shell
- Tour 5 (Platinum): `#dae4f2` stroke over a sharp platinum shell
- Tour 6 (Diamond): `#dff3ff` stroke with icy crystalline accents

**Color palette:**
- Enlisted ranks (0–13): silver/grey palette
- Officer ranks (14–37): blue/steel palette  
- General ranks (38–41): gold palette
- Prestige variant: bright gold + glow filter

**Suggested emblem shapes per tier (simplified recreation):**
- Recruit: single small chevron
- Apprentice/Private: 1–2 chevrons
- Corporal: 2 chevrons + small bar
- Sergeant series: 3 chevrons variants
- Gunnery Sergeant series: chevrons + crossed rifles motif
- Lieutenant series: single bar variants
- Captain series: double bar variants
- Major series: diamond/lozenge
- Commander series: diamond + bar
- Colonel series: eagle motif (simplified)
- Brigadier series: star variants
- General series: multi-star + shield

All emblems should be clean geometric SVG — not photorealistic, stylized like the game UI.

---

## Visual Design

### Aesthetic Direction
Dark military sci-fi. Near-black backgrounds (#0a0c0f), Halo HUD green (#00ff41) for XP bars and active states, amber/gold (#f5a623) for Double XP and prestige, cool steel blue (#4a90d9) for officer-tier UI accents. Rank emblems glow with a subtle radial light.

### Typography
- Display / rank names: `"Orbitron"` (Google Fonts) — geometric, futuristic, evokes the H3 HUD
- Body / stats: `"Share Tech Mono"` (Google Fonts) — monospaced, military readout feel
- Both available via Google Fonts CDN

### Key Animations (Framer Motion)

```
XP bar fill:     ease-out, 600ms, triggered on workout log
Rank-up flash:   scale 0.8→1.2→1.0, 400ms, with glow pulse
Tour advancement: shield materializes from center outward (scale 0→1.3→1.0), 1400ms, with radial particle burst
Emblem hover:    subtle rotate ±3deg + glow intensify
Modal entry:     slide up from bottom, spring physics
Double XP banner: slow amber pulse every 3s
```

### PWA Manifest

```json
{
  "name": "Spartan Gains",
  "short_name": "SpartanGains",
  "theme_color": "#0a0c0f",
  "background_color": "#0a0c0f",
  "display": "standalone",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

App icon: a Spartan helmet silhouette in green on black.

---

## Project Structure

```
spartan-gains/
├── public/
│   ├── icons/               # PWA icons
│   └── manifest.json
├── src/
│   ├── lib/
│   │   ├── firebase.ts      # Firebase init + exports
│   │   ├── ranks.ts         # RANKS table + getRankFromXP, getNextRankXP, etc.
│   │   ├── xp.ts            # calculateXP, isDoubleXPWeekend, getBaseXP
│   │   └── firestore.ts     # logWorkout(), getUserData(), advanceTour()
│   ├── components/
│   │   ├── RankEmblem.tsx   # SVG emblem + ShieldBackground layer
│   │   ├── ShieldBackground.tsx  # Tour shield SVG (Tour 1 = none, 2–6 = bronze/silver/gold/platinum/diamond)
│   │   ├── XPBar.tsx        # Animated XP progress bar
│   │   ├── TrackCard.tsx    # Single track emblem + bar for home screen
│   │   ├── GlobalRank.tsx   # Large center composite rank display
│   │   ├── RankUpModal.tsx  # Full-screen rank-up celebration
│   │   ├── TourModal.tsx    # Full-screen Tour advancement animation + shield reveal
│   │   ├── InfoModal.tsx    # Slide-up info/stats sheet
│   │   └── DoubleXPBanner.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── LogScreen.tsx    # Receives :track param
│   │   └── AuthScreen.tsx   # Google sign-in splash
│   ├── hooks/
│   │   ├── useUserData.ts   # Firestore real-time listener
│   │   └── useDoubleXP.ts   # Returns { active, isThisWeekend }
│   ├── App.tsx
│   └── main.tsx
├── .env                     # VITE_FIREBASE_* keys
├── vite.config.ts
└── package.json
```

---

## Environment Variables

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Build & Deploy

```bash
npm install
npm run dev          # local dev
npm run build        # production build
firebase deploy      # deploy to Firebase Hosting
```

---

## Implementation Order

Build in this sequence — each step is independently testable:

1. **`src/lib/ranks.ts`** — RANKS table + all pure rank calculation functions. Test in isolation with unit tests.
2. **`src/lib/xp.ts`** — XP calculation + Double XP logic. Unit test edge cases (exact thresholds, weekend boundary times).
3. **Firebase project** — create project, enable Google Auth, create Firestore database, add `.env`.
4. **`src/lib/firebase.ts` + `src/lib/firestore.ts`** — init, auth helpers, `logWorkout()`, `getUserData()`, `prestige()`.
5. **`AuthScreen.tsx`** — Google sign-in button, handles first-time user document creation.
6. **`ShieldBackground.tsx` + `RankEmblem.tsx`** — Build the 6 Tour states first (Base plus five shield-backed prestige tiers), then all 42 rank icons. Compose them via the `<RankEmblem>` wrapper. Start simple (chevrons/bars), refine later.
7. **`XPBar.tsx` + `TrackCard.tsx`** — Static display components, no data yet.
8. **`HomeScreen.tsx`** — Wire up real data via `useUserData` hook. All five tracks + global rank.
9. **`LogScreen.tsx`** — Input + XP preview + submit flow.
10. **`RankUpModal.tsx`** — Rank-up detection + celebration animation.
11. **`InfoModal.tsx`** — Stats, rank table, sign out.
12. **`DoubleXPBanner.tsx`** — Conditional banner.
13. **PWA config** — `vite-plugin-pwa` setup, manifest, service worker, app icons.
14. **Deploy** — `firebase deploy`.

---

## Notes for Claude Code

- Keep all rank/XP logic as **pure functions** in `src/lib/` with no React dependencies — makes them trivially testable and reusable.
- `useUserData` should use Firestore's `onSnapshot` for real-time updates so the XP bar reacts immediately after a workout is logged.
- The `logWorkout()` Firestore write should use a **batch write** to update both the workout subcollection document and the parent user's `tracks.{track}.xp` field atomically.
- Rank-up detection: compare `getRankFromXP(xpBefore).id` vs `getRankFromXP(xpAfter).id` in the log flow — if they differ, trigger the modal.
- Tour advancement detection: after a workout write, if `xpAfter >= 2000` and `track.tour < 6`, surface the `TourModal` — don't auto-advance, let the user confirm so the moment feels deliberate.
- The `advanceTour()` Firestore call should batch-write `xp → 0` and `tour → tour + 1` atomically.
- Double XP weekends are fully client-side deterministic — no Firestore field needed. Just call `isDoubleXPWeekend(new Date())` at log time and store the result in the workout document for history display.
- For the SVG emblems: prioritize getting all 42 shapes in place first (even simplified), then refine aesthetics. A placeholder grey circle with the rank number is acceptable during early development.
