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

  await expect(page.getByRole('heading', { name: 'Service Record' })).toBeVisible();
  await expect(page.getByText('Cardio')).toBeVisible();
  await expect(page.getByText('Legs')).toBeVisible();
  await expect(page.getByText('Push')).toBeVisible();
  await expect(page.getByText('Pull')).toBeVisible();
  await expect(page.getByText('Core')).toBeVisible();
  await expect(page.getByText(/Tour advancement available/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Legs/i })).toHaveAttribute('data-selected', 'true');
  await expect(page.getByText('Log workout')).toHaveCount(0);

  await page.getByRole('button', { name: /Open service record/i }).click();

  await expect(page.getByRole('dialog', { name: 'Service Record' })).toBeVisible();
  await expect(page.getByText('Total workouts')).toBeVisible();
  await expect(page.getByText(/^2$/)).toBeVisible();
  await expect(page.getByText(/Global rank is the floor average of the five Spartan track rank indices/i)).toBeVisible();
  await expect(page.getByText(/Tap any track tile to log one session. Cardio uses minutes; strength tracks use sets./i)).toBeVisible();
  await expect(page.getByTestId('service-record-rank-table')).toBeVisible();
  await expect(page.getByTestId('service-record-tour-table')).toBeVisible();
  await expect(page.locator('.service-art-panel')).toHaveCount(0);

  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('dialog', { name: 'Service Record' })).toBeHidden();
});

test('keeps the full rank table reachable inside the service record sheet at 390px', async ({
  page,
}) => {
  await gotoApp(
    page,
    '/',
    createSignedInScenario({
      userDoc: {
        displayName: 'Master Chief Petty Officer John-117',
        email: 'master.chief.petty.officer.john.117@example.com',
        photoURL: 'https://example.com/chief.png',
        createdAt: '2026-04-01T00:00:00.000Z',
        tracks: {
          cardio: { xp: 0, tour: 1 },
          legs: { xp: 0, tour: 1 },
          push: { xp: 0, tour: 1 },
          pull: { xp: 0, tour: 1 },
          core: { xp: 0, tour: 1 },
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
      ],
    }),
  );

  await page.getByRole('button', { name: /Open service record/i }).click();

  const dialog = page.getByRole('dialog', { name: 'Service Record' });
  const scrollSurface = page.getByTestId('service-record-scroll');
  const rankTable = page.getByTestId('service-record-rank-table');
  const rankTableScroll = page.getByTestId('service-record-rank-table-scroll');
  const tourTable = page.getByTestId('service-record-tour-table');
  const tourTableScroll = page.getByTestId('service-record-tour-table-scroll');
  const currentRank = rankTable.locator('[aria-current="true"]');
  const finalRank = rankTable.getByText('5-Star General');
  const finalTour = tourTable.getByText('Diamond Tour');

  await expect(dialog).toBeVisible();
  await expect(scrollSurface).toBeVisible();
  await expect(rankTableScroll).toBeVisible();
  await expect(tourTableScroll).toBeVisible();

  const [rankTableBox, tourTableBox] = await Promise.all([
    rankTableScroll.boundingBox(),
    tourTableScroll.boundingBox(),
  ]);

  expect(rankTableBox).not.toBeNull();
  expect(tourTableBox).not.toBeNull();
  expect(rankTableBox!.height).toBeGreaterThanOrEqual(399);
  expect(rankTableBox!.height).toBeLessThanOrEqual(401);
  expect(tourTableBox!.height).toBeGreaterThanOrEqual(399);
  expect(tourTableBox!.height).toBeLessThanOrEqual(401);

  await rankTable.scrollIntoViewIfNeeded();
  await expect(rankTable).toBeVisible();
  await expect(currentRank).toContainText('Recruit');

  await finalRank.scrollIntoViewIfNeeded();
  await expect(finalRank).toBeVisible();

  await tourTable.scrollIntoViewIfNeeded();
  await expect(tourTable).toBeVisible();
  await finalTour.scrollIntoViewIfNeeded();
  await expect(finalTour).toBeVisible();
});

test('keeps the service record header inside the dialog bounds with long spartan details', async ({
  page,
}) => {
  await gotoApp(
    page,
    '/',
    createSignedInScenario({
      userDoc: {
        displayName: 'Master Chief Petty Officer John-117',
        email: 'master.chief.petty.officer.john.117@example.com',
        photoURL: 'https://example.com/chief.png',
        createdAt: '2026-04-01T00:00:00.000Z',
        tracks: {
          cardio: { xp: 0, tour: 1 },
          legs: { xp: 0, tour: 1 },
          push: { xp: 0, tour: 1 },
          pull: { xp: 0, tour: 1 },
          core: { xp: 0, tour: 1 },
        },
      },
    }),
  );

  await page.getByRole('button', { name: /Open service record/i }).click();

  const dialog = page.getByRole('dialog', { name: 'Service Record' });
  const header = page.getByTestId('service-record-header');
  const closeButton = dialog.getByRole('button', { name: 'Close' });
  const title = dialog.getByRole('heading', { name: 'Service Record' });

  await expect(dialog).toBeVisible();

  const [dialogBox, headerBox, closeBox, titleBox] = await Promise.all([
    dialog.boundingBox(),
    header.boundingBox(),
    closeButton.boundingBox(),
    title.boundingBox(),
  ]);

  expect(dialogBox).not.toBeNull();
  expect(headerBox).not.toBeNull();
  expect(closeBox).not.toBeNull();
  expect(titleBox).not.toBeNull();

  expect(headerBox!.x).toBeGreaterThanOrEqual(dialogBox!.x - 0.5);
  expect(headerBox!.x + headerBox!.width).toBeLessThanOrEqual(dialogBox!.x + dialogBox!.width + 0.5);
  expect(headerBox!.y).toBeGreaterThanOrEqual(dialogBox!.y - 0.5);
  expect(closeBox!.x + closeBox!.width).toBeLessThanOrEqual(dialogBox!.x + dialogBox!.width + 0.5);
  expect(titleBox!.y).toBeGreaterThanOrEqual(dialogBox!.y - 0.5);
});

test('keeps the desktop service record modal functional without the legacy art panel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await gotoApp(page, '/', createSignedInScenario());

  await page.getByRole('button', { name: /Open service record/i }).click();

  const dialog = page.getByRole('dialog', { name: 'Service Record' });

  await expect(dialog).toBeVisible();
  await expect(page.locator('.service-art-panel')).toHaveCount(0);
  await expect(page.getByTestId('service-record-rank-table')).toBeVisible();
  await expect(page.getByTestId('service-record-tour-table')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('keeps recruit track cards centered and compact on the 390px mobile layout', async ({
  page,
}) => {
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
          pull: { xp: 0, tour: 1 },
          core: { xp: 30, tour: 1 },
        },
      },
    }),
  );

  const pullCard = page.getByRole('button', {
    name: /Pull, Recruit, 0 EXP, 2 EXP to next rank/i,
  });

  await pullCard.scrollIntoViewIfNeeded();
  await expect(pullCard).toBeVisible();

  const rankNameSize = await pullCard
    .locator('p.font-display')
    .evaluate((node) => Number.parseFloat(window.getComputedStyle(node).fontSize));
  expect(rankNameSize).toBeLessThanOrEqual(13);
  await expect(pullCard.locator('[data-testid="rank-emblem"]')).toBeVisible();
});

test('keeps the track-card emblem glow inside the card composition at 400px width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 400, height: 827 });
  await gotoApp(
    page,
    '/',
    createSignedInScenario({
      userDoc: {
        displayName: 'Arpyem',
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
    }),
  );

  const cardioCard = page.getByRole('button', {
    name: /^Cardio,/i,
  });
  const cardioStage = cardioCard.locator('.service-track-card-stage');
  const cardioGlow = cardioCard.locator('.service-track-card-emblem-wrap');

  await cardioCard.scrollIntoViewIfNeeded();
  await expect(cardioCard).toBeVisible();

  const [stageBox, glowBox] = await Promise.all([cardioStage.boundingBox(), cardioGlow.boundingBox()]);

  expect(stageBox).not.toBeNull();
  expect(glowBox).not.toBeNull();
  expect(glowBox!.y).toBeGreaterThanOrEqual(stageBox!.y - 0.5);
  expect(glowBox!.y + glowBox!.height).toBeLessThanOrEqual(stageBox!.y + stageBox!.height + 0.5);

  await page.screenshot({ path: 'playwright-artifacts/home-layout-400x827.png', fullPage: true });
});

test('keeps track cards wrapped across multiple rows on landscape mobile screens', async ({
  page,
}) => {
  await page.setViewportSize({ width: 844, height: 390 });
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
    }),
  );

  const cardioCard = page.getByRole('button', {
    name: /^Cardio,/i,
  });
  const legsCard = page.getByRole('button', {
    name: /^Legs,/i,
  });
  const pushCard = page.getByRole('button', {
    name: /^Push,/i,
  });
  const pullCard = page.getByRole('button', {
    name: /^Pull,/i,
  });
  const coreCard = page.getByRole('button', {
    name: /^Core,/i,
  });

  await expect(cardioCard).toBeVisible();
  await expect(legsCard).toBeVisible();
  await expect(pushCard).toBeVisible();
  await expect(pullCard).toBeVisible();
  await expect(coreCard).toBeVisible();

  const [cardioBox, legsBox, pushBox, pullBox, coreBox] = await Promise.all([
    cardioCard.boundingBox(),
    legsCard.boundingBox(),
    pushCard.boundingBox(),
    pullCard.boundingBox(),
    coreCard.boundingBox(),
  ]);

  expect(cardioBox).not.toBeNull();
  expect(legsBox).not.toBeNull();
  expect(pushBox).not.toBeNull();
  expect(pullBox).not.toBeNull();
  expect(coreBox).not.toBeNull();

  const rowPositions = [
    cardioBox?.y ?? 0,
    legsBox?.y ?? 0,
    pushBox?.y ?? 0,
    pullBox?.y ?? 0,
    coreBox?.y ?? 0,
  ].reduce<number[]>((rows, yPosition) => {
    if (!rows.some((existing) => Math.abs(existing - yPosition) < 8)) {
      rows.push(yPosition);
    }

    return rows;
  }, []);

  expect(rowPositions.length).toBeGreaterThan(1);
});
