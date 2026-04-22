import { expect, test } from '@playwright/test';
import { createSignedInScenario, gotoApp } from './helpers';

test('shows the offline banner on signed-in home surfaces when the browser goes offline', async ({ page }) => {
  await gotoApp(page, '/', createSignedInScenario());
  await expect(page.getByRole('heading', { name: 'Service Record' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Open service record/i })).toBeVisible();

  await page.context().setOffline(true);
  await page.evaluate(() => {
    window.dispatchEvent(new Event('offline'));
  });

  await expect(page.getByText(/^Offline$/)).toBeVisible();
  await expect(page.getByText(/showing your last synced Spartan record/i)).toBeVisible();
});

test('disables workout logging and Tour advancement while offline', async ({ page }) => {
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
  await expect(page.getByRole('heading', { name: 'Cardio' })).toBeVisible();

  await page.context().setOffline(true);
  await page.evaluate(() => {
    window.dispatchEvent(new Event('offline'));
  });

  await expect(page.getByRole('button', { name: 'Log It' })).toBeDisabled();
  await expect(page.getByText(/Workout logging is disabled while the device is offline/i)).toBeVisible();

  await page.context().setOffline(false);
  await page.evaluate(() => {
    window.dispatchEvent(new Event('online'));
  });

  await page.getByLabel('Enter minutes').fill('10');
  await page.getByRole('button', { name: 'Log It' }).click();
  await expect(page.getByRole('heading', { name: 'Advance Cardio' })).toBeVisible();

  await page.context().setOffline(true);
  await page.evaluate(() => {
    window.dispatchEvent(new Event('offline'));
  });

  await expect(page.getByRole('button', { name: 'Advance Tour' })).toBeDisabled();
  await expect(page.getByText(/Reconnect to commit the Tour advancement write/i)).toBeVisible();
});
