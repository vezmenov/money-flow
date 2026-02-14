import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { chromium } from 'playwright-core';

import {
  SNAPSHOT_CATEGORIES,
  SNAPSHOT_RECURRING_EXPENSES_FOR_MONTH,
  SNAPSHOT_TRANSACTIONS,
} from './fixtures.mjs';

const PORT = Number(process.env.UI_SNAP_PORT ?? 4173);
const BASE_URL = String(process.env.UI_SNAP_BASE_URL ?? `http://127.0.0.1:${PORT}`);
const OUTPUT_DIR = path.resolve('Docs/Snapshots/latest');
const FIXED_NOW_ISO = String(process.env.UI_SNAP_NOW ?? '2026-02-13T12:00:00.000Z');

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800, isMobile: false },
  { name: 'mobile', width: 375, height: 812, isMobile: true },
];

const ROUTES = [
  { name: 'home', hash: '#/', ready: 'main.home' },
  { name: 'categories', hash: '#/categories', ready: 'main.categories' },
  { name: 'dashboards', hash: '#/dashboards', ready: 'main.dashboards' },
];

function attachGuards(page) {
  const errors = [];

  page.on('pageerror', (error) => {
    errors.push({ type: 'pageerror', text: error?.message ?? String(error) });
  });

  page.on('console', (message) => {
    if (message.type() !== 'error') {
      return;
    }
    errors.push({ type: 'console', text: message.text() });
  });

  return {
    clear() {
      errors.splice(0, errors.length);
    },
    assertNone(context) {
      if (errors.length === 0) {
        return;
      }
      const formatted = errors.map((entry) => `[${entry.type}] ${entry.text}`).join('\n');
      throw new Error(`[ui:snap] JS errors during "${context}":\n${formatted}`);
    },
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 20_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'follow' });
      if (res.ok) {
        return;
      }
    } catch {
      // ignore
    }
    await sleep(250);
  }
  throw new Error(`Preview server did not start within ${timeoutMs}ms at ${url}`);
}

function prepareOutput() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  for (const entry of fs.readdirSync(OUTPUT_DIR)) {
    if (entry.toLowerCase().endsWith('.png')) {
      fs.rmSync(path.join(OUTPUT_DIR, entry), { force: true });
    }
  }
}

function startPreviewServer() {
  const args = ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'];
  const child = spawn('npm', args, {
    stdio: 'inherit',
    env: process.env,
  });
  return child;
}

async function launchBrowser() {
  const channel = process.env.PLAYWRIGHT_CHANNEL ?? 'chrome';
  try {
    return await chromium.launch({ headless: true, channel });
  } catch {
    // Fall back to Playwright defaults if channel is unavailable.
    return await chromium.launch({ headless: true });
  }
}

function buildApiHandler() {
  const categories = SNAPSHOT_CATEGORIES;
  const transactions = SNAPSHOT_TRANSACTIONS;
  const recurring = SNAPSHOT_RECURRING_EXPENSES_FOR_MONTH;

  return async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;
    const method = request.method();

    if (pathname === '/api/categories') {
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(categories),
        });
        return;
      }
      await route.fulfill({ status: 204, body: '' });
      return;
    }

    if (pathname === '/api/transactions') {
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(transactions),
        });
        return;
      }
      await route.fulfill({ status: 204, body: '' });
      return;
    }

    if (pathname === '/api/recurring-expenses') {
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(recurring),
        });
        return;
      }
      if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(recurring[0]),
        });
        return;
      }
      await route.fulfill({ status: 204, body: '' });
      return;
    }

    if (pathname.startsWith('/api/categories/') || pathname.startsWith('/api/transactions/')) {
      await route.fulfill({ status: 204, body: '' });
      return;
    }

    if (pathname.startsWith('/api/recurring-expenses/')) {
      await route.fulfill({ status: 204, body: '' });
      return;
    }

    // If something else unexpectedly calls the API, fail fast so we notice.
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'snapshot: no fixture for this endpoint' }),
    });
  };
}

async function main() {
  prepareOutput();

  const server = startPreviewServer();
  try {
    await waitForServer(BASE_URL);

    const browser = await launchBrowser();
    try {
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
          locale: 'ru-RU',
          timezoneId: 'Europe/Moscow',
          colorScheme: 'light',
          isMobile: vp.isMobile,
          hasTouch: vp.isMobile,
        });

        await context.addInitScript(
          ({ nowIso }) => {
            const fixed = new Date(nowIso).getTime();
            const OriginalDate = Date;

            class MockDate extends OriginalDate {
              constructor(...args) {
                if (args.length === 0) {
                  super(fixed);
                  return;
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                super(...args);
              }

              static now() {
                return fixed;
              }
            }

            MockDate.parse = OriginalDate.parse;
            MockDate.UTC = OriginalDate.UTC;

            // @ts-ignore - runtime patch for deterministic UI snapshots.
            globalThis.Date = MockDate;
            // @ts-ignore
            globalThis.__UI_SNAPSHOT__ = true;
          },
          { nowIso: FIXED_NOW_ISO },
        );

        await context.route('**/api/**', buildApiHandler());

        const page = await context.newPage();
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const guards = attachGuards(page);

        for (const route of ROUTES) {
          guards.clear();
          const url = `${BASE_URL}/${route.hash}`;
          await page.goto(url, { waitUntil: 'networkidle' });
          await page.waitForSelector(route.ready, { timeout: 10_000 });
          await page.addStyleTag({
            content: `
              * { animation: none !important; transition: none !important; }
              html { scroll-behavior: auto !important; }
            `,
          });

          await page.waitForTimeout(250);
          await page.screenshot({
            path: path.join(OUTPUT_DIR, `${route.name}-${vp.name}.png`),
            fullPage: !vp.isMobile,
          });

          if (route.name === 'home') {
            await page.click('[data-e2e="home.fab.add"]');
            await page.waitForSelector('dialog[open][data-e2e="add-expense.modal"]', { timeout: 10_000 });
            await page.waitForTimeout(150);
            await page.screenshot({
              path: path.join(OUTPUT_DIR, `home-add-modal-${vp.name}.png`),
              fullPage: false,
            });

            // Smoke-check: ensure amount input can be filled and "Сохранить" enables without runtime errors.
            await page.fill('[data-e2e="add-expense.amount"]', '5000');
            await page.waitForFunction(() => {
              const btn = document.querySelector('[data-e2e="add-expense.save"]');
              return btn instanceof HTMLButtonElement && !btn.disabled;
            });
            await page.fill('[data-e2e="add-expense.amount"]', '');
            await page.keyboard.press('Escape');
            guards.assertNone(`home-add-modal-${vp.name}`);

            await page.click('[data-e2e="home.recurring.add"]');
            await page.waitForSelector('dialog[open][data-e2e="add-expense.modal"]', { timeout: 10_000 });
            await page.waitForTimeout(150);
            await page.screenshot({
              path: path.join(OUTPUT_DIR, `home-add-recurring-modal-${vp.name}.png`),
              fullPage: false,
            });

            await page.fill('[data-e2e="add-expense.amount"]', '5000');
            await page.waitForFunction(() => {
              const btn = document.querySelector('[data-e2e="add-expense.save"]');
              return btn instanceof HTMLButtonElement && !btn.disabled;
            });
            await page.fill('[data-e2e="add-expense.amount"]', '');
            await page.keyboard.press('Escape');
            guards.assertNone(`home-add-recurring-modal-${vp.name}`);

            // Delete flow (smoke): open confirm modal for a transaction and recurring item.
            const firstTx = page.locator('[data-e2e="home.tx.item"]').first();
            if (!vp.isMobile) {
              await firstTx.hover();
            }
            await firstTx.locator('[data-e2e="home.tx.delete"]').click();
            await page.waitForSelector('dialog[open][data-e2e="delete.modal"]', { timeout: 10_000 });
            await page.waitForTimeout(150);
            await page.screenshot({
              path: path.join(OUTPUT_DIR, `home-delete-transaction-modal-${vp.name}.png`),
              fullPage: false,
            });
            await page.click('[data-e2e="delete.cancel"]');
            await page.waitForSelector('dialog[open][data-e2e="delete.modal"]', { state: 'hidden', timeout: 10_000 });
            guards.assertNone(`home-delete-transaction-modal-${vp.name}`);

            const firstRecurring = page.locator('[data-e2e="home.recurring.item"]').first();
            if (!vp.isMobile) {
              await firstRecurring.hover();
            }
            await firstRecurring.locator('[data-e2e="home.recurring.delete"]').click();
            await page.waitForSelector('dialog[open][data-e2e="delete.modal"]', { timeout: 10_000 });
            await page.waitForTimeout(150);
            await page.screenshot({
              path: path.join(OUTPUT_DIR, `home-delete-recurring-modal-${vp.name}.png`),
              fullPage: false,
            });
            await page.keyboard.press('Escape');
            guards.assertNone(`home-delete-recurring-modal-${vp.name}`);
          }

          guards.assertNone(`${route.name}-${vp.name}`);
        }

        await context.close();
      }
    } finally {
      await browser.close();
    }
  } finally {
    server.kill('SIGTERM');
    await sleep(250);
  }
}

main().catch((error) => {
  console.error('[ui:snap] failed:', error);
  process.exitCode = 1;
});
