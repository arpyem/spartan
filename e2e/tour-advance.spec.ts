import { expect, test } from '@playwright/test';
import { createSignedInScenario, gotoApp } from './helpers';

test('prompts for Tour advancement, commits it, and returns home after the ceremony', async ({ page }) => {
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
          cardio: { xp: 1999, tour: 1 },
          legs: { xp: 0, tour: 1 },
          push: { xp: 0, tour: 1 },
          pull: { xp: 0, tour: 1 },
          core: { xp: 0, tour: 1 },
        },
      },
    }),
  );

  await page.getByLabel('Enter minutes').fill('10');
  await page.getByRole('button', { name: 'Log It' }).click();

  await expect(page.getByRole('heading', { name: 'Advance Cardio' })).toBeVisible();
  await page.getByRole('button', { name: 'Advance Tour' }).click();

  await expect(page.getByText('Tour Advanced')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bronze Tour' })).toBeVisible();
  await expect(page.getByText(/Cardio reset to Recruit/i)).toBeVisible();
  await expect(page.getByText(/Tap anywhere to continue/i)).toBeVisible();

  await page.getByText('Tour Advanced').click();
  await expect(page.getByRole('heading', { name: 'Service Record' })).toBeVisible();
});
