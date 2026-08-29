import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.join(root, 'docs', 'evidence', 'after', 'responsive');
const BASE = 'http://127.0.0.1:4173';

const targets = [
  { page: 'setup', width: 375, height: 812 },
  { page: 'setup', width: 768, height: 1024 },
  { page: 'setup', width: 1440, height: 900 },
  { page: 'chat', width: 375, height: 812 },
  { page: 'chat', width: 768, height: 1024 },
  { page: 'chat', width: 1440, height: 900 },
  { page: 'chat', width: 1920, height: 1080 },
  { page: 'swap', width: 375, height: 812 },
  { page: 'swap', width: 768, height: 1024 },
  { page: 'swap', width: 1440, height: 900 },
  { page: 'settings', width: 375, height: 812 },
  { page: 'settings', width: 768, height: 1024 },
  { page: 'match', width: 375, height: 812 },
  { page: 'match', width: 768, height: 1024 },
  { page: 'match', width: 1440, height: 900 },
  { page: 'landing', width: 375, height: 812 },
  { page: 'landing', width: 768, height: 1024 },
  { page: 'report', width: 375, height: 812 },
  { page: 'report', width: 768, height: 1024 },
];

function recordConsoleErrors(page, label, errors) {
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`[${label}] ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`[${label}] ${error.message}`));
}

async function assertNoHorizontalOverflow(page, label) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.scrollingElement?.scrollWidth ?? document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));

  if (scrollWidth > innerWidth) {
    throw new Error(`[${label}] horizontal overflow: ${scrollWidth}px > ${innerWidth}px`);
  }
}

async function completeScenario(page) {
  await page.goto(`${BASE}/setup`, { waitUntil: 'networkidle' });
  await page.getByRole('radio', { name: /陪我把事情理清/ }).click();
  await page.getByRole('button', { name: '下一题' }).click();
  await page.getByRole('radio', { name: /偶尔来确认我还好吗/ }).click();
  await page.getByRole('button', { name: '下一题' }).click();
  await page.getByRole('radio', { name: /冷静听完彼此的理由/ }).click();
  await page.getByRole('button', { name: '查看我的陪伴匹配' }).click();
  await page.getByRole('heading', { name: /沉稳承接型的关系/ }).waitFor();
}

async function prepareTarget(page, target) {
  if (target.page === 'landing') {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  } else if (target.page === 'match' || target.page === 'chat') {
    await completeScenario(page);
    if (target.page === 'chat') {
      await page.getByRole('button', { name: '和 顾怀瑾 初次见面' }).click();
      await page.getByText('你来了。刚才的选择我认真看完了', { exact: false }).waitFor();
      await page.getByText('可以这样开始，也可以自由输入', { exact: true }).waitFor();
    }
  } else {
    await page.goto(`${BASE}/${target.page}`, { waitUntil: 'networkidle' });
  }

  await page.waitForTimeout(target.page === 'report' ? 1600 : 1200);
  await assertNoHorizontalOverflow(page, `${target.page}@${target.width}`);
}

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const consoleErrors = [];

try {
  for (const target of targets) {
    const context = await browser.newContext({
      viewport: { width: target.width, height: target.height },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const label = `${target.page}-${target.width}`;
    recordConsoleErrors(page, label, consoleErrors);
    await prepareTarget(page, target);
    await page.screenshot({ path: path.join(evidence, `${label}.png`), fullPage: true });
    console.log(`CAPTURED ${label}.png`);
    await context.close();
  }

  if (consoleErrors.length > 0) {
    throw new Error(`Console or page errors:\n${consoleErrors.join('\n')}`);
  }

  console.log(`Responsive evidence capture: PASS (${targets.length} files)`);
} finally {
  await browser.close();
}
