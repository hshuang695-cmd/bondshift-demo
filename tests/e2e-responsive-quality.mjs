import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:4173';

const viewports = [
  { width: 320, height: 720 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

function recordErrors(page, label, errors) {
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

async function runOnboarding(browser, viewport, errors) {
  const label = `onboarding-${viewport.width}`;
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  recordErrors(page, label, errors);

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await assertNoHorizontalOverflow(page, `${label}:landing`);
  await page.getByRole('link', { name: '开始陪伴测试' }).first().click();
  await page.getByRole('heading', { name: /今天真的撑不住了/ }).waitFor();
  await assertNoHorizontalOverflow(page, `${label}:setup-1`);

  await page.getByRole('radio', { name: /陪我把事情理清/ }).click();
  await page.getByRole('button', { name: '下一题' }).click();
  await page.getByRole('radio', { name: /偶尔来确认我还好吗/ }).click();
  await page.getByRole('button', { name: '下一题' }).click();
  await page.getByRole('radio', { name: /冷静听完彼此的理由/ }).click();
  await page.getByRole('button', { name: '查看我的陪伴匹配' }).click();

  await page.getByRole('heading', { name: /沉稳承接型的关系/ }).waitFor();
  if (!(await page.getByText('顾怀瑾', { exact: true }).isVisible())) {
    throw new Error(`[${label}] expected deterministic match 顾怀瑾`);
  }
  if (!(await page.getByText('90%', { exact: true }).isVisible())) {
    throw new Error(`[${label}] expected deterministic score 90%`);
  }
  await assertNoHorizontalOverflow(page, `${label}:match`);

  await page.getByRole('button', { name: '和 顾怀瑾 初次见面' }).click();
  await page.getByText('你来了。刚才的选择我认真看完了', { exact: false }).waitFor();
  await page.getByText('可以这样开始，也可以自由输入', { exact: true }).waitFor();
  await assertNoHorizontalOverflow(page, `${label}:chat`);

  await context.close();
  console.log(`ONBOARDING PASS @${viewport.width}px`);
}

async function getNavigationState(page) {
  return page.evaluate(() => {
    const isVisible = (element) => {
      if (!(element instanceof HTMLElement)) return false;
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };

    const sideNav = document.querySelector('nav[aria-label="主导航"]');
    const bottomNav = [...document.querySelectorAll('nav')].find(
      (nav) => !nav.hasAttribute('aria-label') && nav.querySelectorAll('button').length === 5,
    );
    const visibleIndicators = bottomNav
      ? [...bottomNav.querySelectorAll('div')].filter((element) => {
          if (!isVisible(element)) return false;
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return Math.round(rect.height) === 3 && style.borderRadius !== '0px';
        }).length
      : 0;

    return {
      sideVisible: isVisible(sideNav),
      bottomVisible: isVisible(bottomNav),
      visibleIndicators,
    };
  });
}

async function assertNavigationState(page, width, cycle) {
  const state = await getNavigationState(page);
  const expectedDesktop = width >= 1024;
  if (state.sideVisible !== expectedDesktop || state.bottomVisible === expectedDesktop) {
    throw new Error(`[cycle ${cycle} @${width}] navigation forms are not mutually exclusive: ${JSON.stringify(state)}`);
  }
  const expectedIndicators = expectedDesktop ? 0 : 1;
  if (state.visibleIndicators !== expectedIndicators) {
    throw new Error(`[cycle ${cycle} @${width}] expected ${expectedIndicators} visible tab indicator, got ${state.visibleIndicators}`);
  }
  await assertNoHorizontalOverflow(page, `cycle-${cycle}@${width}`);
}

async function runBreakpointJumps(browser, errors) {
  const context = await browser.newContext({ viewport: { width: 999, height: 900 } });
  const page = await context.newPage();
  recordErrors(page, 'breakpoint-jump', errors);
  await page.goto(`${BASE}/home`, { waitUntil: 'networkidle' });

  for (let cycle = 1; cycle <= 10; cycle += 1) {
    await page.setViewportSize({ width: 999, height: 900 });
    await page.waitForTimeout(180);
    await assertNavigationState(page, 999, cycle);
    await page.setViewportSize({ width: 1025, height: 900 });
    await page.waitForTimeout(180);
    await assertNavigationState(page, 1025, cycle);
  }

  await context.close();
  console.log('BREAKPOINT JUMP PASS (999px <-> 1025px x10)');
}

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const errors = [];

try {
  for (const viewport of viewports) await runOnboarding(browser, viewport, errors);
  await runBreakpointJumps(browser, errors);
  if (errors.length > 0) throw new Error(`Console or page errors:\n${errors.join('\n')}`);
  console.log('Responsive quality gate: PASS (3 onboarding viewports + 10 breakpoint cycles)');
} finally {
  await browser.close();
}
