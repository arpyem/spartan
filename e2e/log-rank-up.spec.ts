import { expect, test } from '@playwright/test';
import { createSignedInScenario, gotoApp } from './helpers';

test('updates the cardio XP preview and shows the rank-up ceremony', async ({ page }) => {
  await gotoApp(
    page,
    '/log/cardio',
    createSignedInScenario({
      userDoc: {
        displayName: 'Master Chief',
        email: 'chief@example.com',
        photoURL: 'https://example.com/chief.png',
        createdAt: '2026-04-01T00:00:00.000Z',
        tracks: {
          cardio: { xp: 1, tour: 2 },
          legs: { xp: 0, tour: 1 },
          push: { xp: 0, tour: 1 },
          pull: { xp: 0, tour: 1 },
          core: { xp: 0, tour: 1 },
        },
      },
    }),
  );

  await expect(page.getByRole('heading', { name: 'Cardio' })).toBeVisible();

  const minutesInput = page.getByLabel('Enter minutes');
  await minutesInput.fill('10');

  await expect(page.getByText(/^1 EXP$/)).toBeVisible();

  await page.getByRole('button', { name: 'Log It' }).click();

  await expect(page.getByRole('heading', { name: 'Apprentice' })).toBeVisible();
  await expect(page.getByText(/Cardio advanced from Recruit/i)).toBeVisible();
  await expect(page.getByText(/Apprentice \| Tour 2/i)).toBeVisible();
});
