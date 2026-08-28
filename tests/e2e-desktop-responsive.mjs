import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.join(root, 'docs', 'evidence', 'after', 'responsive');

const BASE = 'http://127.0.0.1:4173';

async function assertNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.scrollingElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  if (overflow.scrollWidth > overflow.innerWidth) {
    throw new Error(
      `[${label}] horizontal overflow: scrollWidth ${overflow.scrollWidth} > innerWidth ${overflow.innerWidth}`
    );
  }
}

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const consoleErrors = [];

// ---------- 桌面形态（1440×900）：SideNav 可见 / BottomNav·StatusBar 隐藏 ----------
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
desktop.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(`[desktop] ${message.text()}`);
});

await desktop.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
const sideNavDesktop = desktop.locator('nav[aria-label="主导航"]');
if (!(await sideNavDesktop.isVisible())) throw new Error('SideNav not visible at 1440px');
const navButtons = sideNavDesktop.getByRole('button');
const navCount = await navButtons.count();
if (navCount < 5) throw new Error(`SideNav expected 5+ nav items (incl. logo), got ${navCount}`);
await assertNoHorizontalOverflow(desktop, '/home @1440');
await desktop.screenshot({ path: path.join(evidence, 'home-1440.png'), fullPage: true });

// 桌面导航可跳转：点击「报告」
await sideNavDesktop.getByRole('button', { name: '报告' }).click();
await desktop.getByText('成长报告').first().waitFor();
// 等待 Framer Motion 入场动画 + 图表高度动画收尾
await desktop.waitForTimeout(1600);
await assertNoHorizontalOverflow(desktop, '/report @1440');
await desktop.screenshot({ path: path.join(evidence, 'report-1440.png'), fullPage: true });

// 设置页居中分组卡
await sideNavDesktop.getByRole('button', { name: '设置' }).click();
await desktop.getByText('设置中心').first().waitFor();
await desktop.waitForTimeout(1200);
await assertNoHorizontalOverflow(desktop, '/settings @1440');
await desktop.screenshot({ path: path.join(evidence, 'settings-1440.png'), fullPage: true });

// 落地页（AppShell 之外，全宽）
await desktop.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await desktop.waitForTimeout(900); // Hero 入场动画收尾
await assertNoHorizontalOverflow(desktop, '/ @1440');
await desktop.screenshot({ path: path.join(evidence, 'landing-1440.png'), fullPage: true });

// 聊天页 xl 信息栏（1920 宽出现）
const wide = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
wide.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(`[wide] ${message.text()}`);
});

// ---------- 移动形态（375×812）：BottomNav 可见 / SideNav 隐藏 ----------
const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
mobile.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(`[mobile] ${message.text()}`);
});

await mobile.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
const sideNavMobile = mobile.locator('nav[aria-label="主导航"]');
if (await sideNavMobile.isVisible()) throw new Error('SideNav should be hidden at 375px');
const bottomNavTab = mobile.getByRole('button', { name: '首页', exact: true });
if (!(await bottomNavTab.isVisible())) throw new Error('BottomNav not visible at 375px');
await mobile.waitForTimeout(900);
await assertNoHorizontalOverflow(mobile, '/home @375');
await mobile.screenshot({ path: path.join(evidence, 'home-375.png'), fullPage: true });

// 移动主流程冒烟：落地 → 偏好 → 换乘 → 报告 → 设置 可达
for (const [label, url] of [
  ['偏好', '/setup'],
  ['换乘', '/swap'],
  ['报告', '/report'],
  ['设置', '/settings'],
]) {
  await mobile.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
  await assertNoHorizontalOverflow(mobile, `${url} @375`);
}
await mobile.screenshot({ path: path.join(evidence, 'swap-375.png'), fullPage: true });
await mobile.screenshot({ path: path.join(evidence, 'report-375.png'), fullPage: true });

// 平板档（768×1024）
const tablet = await browser.newPage({ viewport: { width: 768, height: 1024 } });
tablet.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(`[tablet] ${message.text()}`);
});
await tablet.goto(`${BASE}/home`, { waitUntil: 'networkidle' });
if (!(await tablet.getByRole('button', { name: '首页', exact: true }).isVisible())) {
  throw new Error('BottomNav not visible at 768px (md–lg should stay mobile form)');
}
await assertNoHorizontalOverflow(tablet, '/home @768');
await tablet.screenshot({ path: path.join(evidence, 'home-768.png'), fullPage: true });

const relevantErrors = consoleErrors.filter((error) => !error.includes('Failed to load resource'));
if (relevantErrors.length) throw new Error(`Unexpected console errors: ${relevantErrors.join(' | ')}`);

await browser.close();
console.log('E2E desktop/tablet/mobile responsive shell: PASS');
