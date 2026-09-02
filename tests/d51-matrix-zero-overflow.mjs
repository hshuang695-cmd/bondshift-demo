// D5-1 · 9 档 × 8 页 全页零溢出矩阵（I-6 收口）——监督人预执行版
// 依据：docs/2026-09-02-d51-execution-prompt.md 步骤 2；导航逻辑复用 capture-responsive-evidence.mjs
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.join(root, 'docs', 'evidence', 'after', 'responsive', 'matrix');
fs.mkdirSync(evidence, { recursive: true });
const BASE = 'http://127.0.0.1:4173';

const PAGES = ['landing', 'setup', 'match', 'chat', 'swap', 'report', 'settings', 'home'];
const WIDTHS = [
  [320, 700], [375, 812], [390, 844], [768, 1024], [834, 1112],
  [1024, 768], [1280, 800], [1440, 900], [1920, 1080],
];

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

async function navigate(page, pageName) {
  if (pageName === 'landing') {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  } else if (pageName === 'match' || pageName === 'chat') {
    await completeScenario(page);
    if (pageName === 'chat') {
      await page.getByRole('button', { name: '和 顾怀瑾 初次见面' }).click();
      await page.getByText('你来了。刚才的选择我认真看完了', { exact: false }).waitFor();
    }
  } else {
    await page.goto(`${BASE}/${pageName}`, { waitUntil: 'networkidle' });
  }
  await page.waitForTimeout(pageName === 'report' ? 1600 : 1000);
}

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const failures = [];
const rows = [];
let count = 0;

for (const [width, height] of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  for (const pageName of PAGES) {
    const label = `${pageName}@${width}`;
    try {
      await navigate(page, pageName);
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.scrollingElement?.scrollWidth ?? document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      if (scrollWidth > innerWidth) {
        failures.push(`${label}: ${scrollWidth}px > ${innerWidth}px`);
        rows.push(`${label} | FAIL | ${scrollWidth}>${innerWidth}`);
        console.log(`FAIL ${label} (${scrollWidth} > ${innerWidth})`);
      } else {
        rows.push(`${label} | PASS | ${scrollWidth}<=${innerWidth}`);
        count++;
      }
      await page.screenshot({ path: path.join(evidence, `${pageName}-${width}.png`) });
    } catch (err) {
      failures.push(`${label}: ERROR ${err.message.split('\n')[0]}`);
      rows.push(`${label} | ERROR | ${err.message.split('\n')[0]}`);
      console.log(`ERROR ${label}: ${err.message.split('\n')[0]}`);
    }
  }
  await context.close();
}
await browser.close();

fs.writeFileSync(path.join(evidence, 'matrix-results.txt'), rows.join('\n') + '\n');
console.log(`\n===== 矩阵结果：${count}/72 PASS，${failures.length} 项异常 =====`);
if (failures.length) {
  console.log(failures.join('\n'));
  process.exit(1);
}
console.log('MATRIX PASS: 9 widths x 8 pages, zero horizontal overflow (72/72)');
