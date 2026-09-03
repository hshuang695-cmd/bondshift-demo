import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:4173';

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const context = await browser.newContext({
  viewport: { width: 375, height: 812 },
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const browserErrors = [];

page.on('console', (message) => {
  if (message.type() === 'error') browserErrors.push(`[console] ${message.text()}`);
});
page.on('pageerror', (error) => browserErrors.push(`[pageerror] ${error.message}`));

try {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.getByRole('link', { name: '开始陪伴测试' }).first().click();
  await page.getByRole('heading', { name: /今天真的撑不住了/ }).waitFor();

  await page.getByRole('radio', { name: /陪我把事情理清/ }).click();
  await page.getByRole('button', { name: '下一题' }).click();
  await page.getByRole('radio', { name: /偶尔来确认我还好吗/ }).click();
  await page.getByRole('button', { name: '下一题' }).click();
  await page.getByRole('radio', { name: /冷静听完彼此的理由/ }).click();
  await page.getByRole('button', { name: '查看我的陪伴匹配' }).click();

  await page.getByRole('heading', { name: /沉稳承接型的关系/ }).waitFor();
  await page.getByRole('button', { name: '和 顾怀瑾 初次见面' }).click();
  const firstMeetingMessage = page.getByText('你来了。刚才的选择我认真看完了', { exact: false });
  await firstMeetingMessage.waitFor();
  await page.waitForTimeout(500);

  const persistedBeforeReload = await page.evaluate(() => {
    const raw = localStorage.getItem('bondshift_state_v1');
    if (!raw) return false;
    const state = JSON.parse(raw);
    return state.chat?.messages?.some(
      (message) => message.sessionId === 'bf_gentleman_002' && message.source === 'seed',
    ) ?? false;
  });
  if (!persistedBeforeReload) throw new Error('First-meeting chat message was not persisted before reload');

  await page.reload({ waitUntil: 'networkidle' });
  await firstMeetingMessage.waitFor();
  if ((await page.locator('body').innerText()).trim().length === 0) {
    throw new Error('Chat page is blank after reload');
  }
  if (browserErrors.length > 0) {
    throw new Error(`Browser errors after reload:\n${browserErrors.join('\n')}`);
  }

  await page.getByRole('button', { name: '返回上一页' }).click();
  await page.waitForURL(`${BASE}/home`);
  await page.locator('nav:visible').getByRole('button', { name: '换乘', exact: true }).click();
  await page.waitForURL(`${BASE}/swap`);
  await page.getByText('换乘男友', { exact: true }).waitFor();
  await page.locator('nav:visible').getByRole('button', { name: '报告', exact: true }).click();
  await page.waitForURL(`${BASE}/report`);
  await page.getByText('成长报告', { exact: true }).first().waitFor();

  if (browserErrors.length > 0) {
    throw new Error(`Browser errors during navigation:\n${browserErrors.join('\n')}`);
  }

  console.log('E2E chat persistence and navigation hotfix: PASS');
} finally {
  await browser.close();
}
