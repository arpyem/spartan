import { expect, test } from '@playwright/test';
import { createSignedInScenario, gotoApp } from './helpers';

test('renders the home screen from seeded data and opens the info modal', async ({ page }) => {
  await gotoApp(
    page,
    '/',
    createSignedInScenario({
      userDoc: {
        displayName: 'Master Chief',
        email: 'chief@example.com',
        photoURL: 'https://example.com/chief.png',
        createdAt: '2026-04-01T00:00:00.000Z',
        tracks: {
          cardio: { xp: 45, tour: 1 },
          legs: { xp: 2000, tour: 1 },
          push: { xp: 120, tour: 2 },
          pull: { xp: 500, tour: 1 },
          core: { xp: 30, tour: 1 },
        },
      },
      workouts: [
        {
          id: 'w1',
          track: 'cardio',
          value: 30,
          xpEarned: 4,
          doubleXP: false,
          note: '',
          timestamp: '2026-04-01T12:00:00.000Z',
        },
        {
          id: 'w2',
          track: 'legs',
          value: 10,
          xpEarned: 2,
          doubleXP: false,
          note: '',
          timestamp: '2026-04-02T12:00:00.000Z',
        },
      ],
    }),
  );

  await expect(page.getByRole('heading', { name: 'Field Deck' })).toBeVisible();
  await expect(page.getByText('Cardio')).toBeVisible();
  await expect(page.getByText('Legs')).toBeVisible();
  await expect(page.getByText('Push')).toBeVisible();
  await expect(page.getByText('Pull')).toBeVisible();
  await expect(page.getByText('Core')).toBeVisible();
  await expect(page.getByText(/Tour advancement available/i)).toBeVisible();

  await page.getByRole('button', { name: 'Open service record' }).click();

  await expect(page.getByRole('heading', { name: 'Spartan Details' })).toBeVisible();
  await expect(page.getByText('Total workouts')).toBeVisible();
  await expect(page.getByText(/^2$/)).toBeVisible();

  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('heading', { name: 'Spartan Details' })).toBeHidden();
});
