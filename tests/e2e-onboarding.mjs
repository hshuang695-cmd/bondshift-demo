import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.join(root, 'docs', 'evidence', 'after');

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
const consoleErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await page.getByRole('link', { name: '开始陪伴测试' }).first().click();
await page.getByRole('heading', { name: '当你说“今天真的撑不住了”，你更希望他怎么回应？' }).waitFor();

await page.getByRole('radio', { name: '陪我把事情理清 一起拆解压力，找到下一步能做的小事。' }).click();
await page.getByRole('button', { name: '下一题' }).click();
await page.getByRole('radio', { name: '偶尔来确认我还好吗 给我空间，但别让我觉得被忘记。' }).click();
await page.getByRole('button', { name: '下一题' }).click();
await page.getByRole('radio', { name: '冷静听完彼此的理由 不抢答、不回避，把误会一层层说清。' }).click();
await page.getByRole('button', { name: '查看我的陪伴匹配' }).click();

await page.getByRole('heading', { name: '你更需要一段 沉稳承接型的关系。' }).waitFor();
if (!(await page.getByText('顾怀瑾', { exact: true }).isVisible())) throw new Error('Stable match did not select 顾怀瑾');
if (!(await page.getByText('为什么适合', { exact: true }).isVisible())) throw new Error('Match reasons are missing');
if (!(await page.getByText('90%', { exact: true }).isVisible())) throw new Error('Expected deterministic 90% score');
await page.getByRole('button', { name: '修改答案' }).click();
await page.getByRole('button', { name: '查看我的陪伴匹配' }).click();
await page.getByRole('heading', { name: '你更需要一段 沉稳承接型的关系。' }).waitFor();
if (!(await page.getByText('90%', { exact: true }).isVisible())) throw new Error('Same answers produced a different score');
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(evidence, 'mobile-match-result.png'), fullPage: true });

await page.getByRole('button', { name: '和 顾怀瑾 初次见面' }).click();
await page.getByText('你来了。刚才的选择我认真看完了', { exact: false }).waitFor();
if (!(await page.getByText('可以这样开始，也可以自由输入', { exact: true }).isVisible())) throw new Error('Quick replies are missing');
await page.getByRole('button', { name: '有件事想慢慢说' }).click();
await page.getByText('DeepSeek 暂时未连接', { exact: false }).waitFor({ timeout: 10_000 });
if (!(await page.getByRole('button', { name: '重试真实 AI' }).isVisible())) throw new Error('Retry action is missing');
await page.screenshot({ path: path.join(evidence, 'mobile-first-meeting-fallback.png'), fullPage: true });

const relevantErrors = consoleErrors.filter((error) => !error.includes('Failed to load resource'));
if (relevantErrors.length) throw new Error(`Unexpected console errors: ${relevantErrors.join(' | ')}`);

await browser.close();
console.log('E2E onboarding, stable match, first meeting and fallback: PASS');
