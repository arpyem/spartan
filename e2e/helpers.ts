import type { Page } from '@playwright/test';
import type { SpartanE2EScenario } from '../src/lib/e2e';
import type { TracksMap } from '../src/lib/types';

function createTracks(overrides: Partial<TracksMap> = {}): TracksMap {
  return {
    cardio: { xp: 0, tour: 1 as const },
    legs: { xp: 0, tour: 1 as const },
    push: { xp: 0, tour: 1 as const },
    pull: { xp: 0, tour: 1 as const },
    core: { xp: 0, tour: 1 as const },
    ...overrides,
  };
}

export function createSignedInScenario(overrides: SpartanE2EScenario = {}): SpartanE2EScenario {
  const user = overrides.auth?.user ?? {
    uid: 'spartan-117',
    displayName: 'Master Chief',
    email: 'chief@example.com',
    photoURL: 'https://example.com/chief.png',
  };

  return {
    auth: {
      status: 'signed_in',
      user,
      signInResult: user,
      ...overrides.auth,
    },
    userDoc: overrides.userDoc ?? {
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      createdAt: '2026-04-01T00:00:00.000Z',
      tracks: createTracks(overrides.userDoc?.tracks),
    },
    workouts: overrides.workouts ?? [],
    doubleXPStatus: overrides.doubleXPStatus,
    failures: overrides.failures,
  };
}

export async function seedScenario(page: Page, scenario: SpartanE2EScenario) {
  await page.addInitScript((seed) => {
    let currentScenario = structuredClone(seed);

    window.__SPARTAN_E2E__ = {
      getScenario: () => structuredClone(currentScenario),
      setScenario: (nextScenario) => {
        currentScenario = structuredClone(nextScenario);
      },
    };
  }, scenario);
}

export async function gotoApp(page: Page, route: string, scenario: SpartanE2EScenario) {
  await seedScenario(page, scenario);
  await page.goto(route);
}
