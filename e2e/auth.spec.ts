import { expect, test } from '@playwright/test';
import { gotoApp } from './helpers';

test('renders the signed-out shell and signs in without leaving the app in mock mode', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });

  await gotoApp(page, '/', {
    auth: {
      status: 'signed_out',
    },
  });

  await expect(page.getByRole('heading', { name: 'Spartan ID Required' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In With Google' })).toBeVisible();

  await page.getByRole('button', { name: 'Sign In With Google' }).click();

  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.getByRole('heading', { name: 'Service Record' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Open service record/i })).toBeVisible();
});
