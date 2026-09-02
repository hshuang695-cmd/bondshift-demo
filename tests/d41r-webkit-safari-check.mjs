// D4-1-R Safari 四点检查 · WebKit 自动化执行（监督人专用一次性脚本）
// 依据：docs/2026-09-01-d41r-safari-test-checklist.md（顺序 3→1→4→2）
// 注意：WebKit = Safari 同源引擎；结果为引擎级证据，真实 Safari 15 GUI 的 ⌥Q 授权等差异已在报告注明。
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { webkit } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.join(root, 'docs', 'evidence', 'after', 'safari');
fs.mkdirSync(evidence, { recursive: true });

const BASE = 'http://127.0.0.1:4173';
const results = [];
const log = (id, name, status, note) => {
  results.push({ id, name, status, note });
  console.log(`[${id}] ${name}: ${status} — ${note}`);
};

const browser = await webkit.launch({ headless: true });
const woff2Log = [];

async function trackWoff2(page) {
  page.on('response', (res) => {
    if (res.url().endsWith('.woff2')) woff2Log.push({ url: res.url().split('/').pop(), status: res.status() });
  });
}

async function gotoLanding(page) {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
}

async function runOnboarding(page) {
  await page.getByRole('link', { name: '开始陪伴测试' }).first().click();
  await page.getByRole('radio', { name: '陪我把事情理清 一起拆解压力，找到下一步能做的小事。' }).click();
  await page.getByRole('button', { name: '下一题' }).click();
  await page.getByRole('radio', { name: '偶尔来确认我还好吗 给我空间，但别让我觉得被忘记。' }).click();
  await page.getByRole('button', { name: '下一题' }).click();
  await page.getByRole('radio', { name: '冷静听完彼此的理由 不抢答、不回避，把误会一层层说清。' }).click();
  await page.getByRole('button', { name: '查看我的陪伴匹配' }).click();
  await page.getByText('90%', { exact: true }).waitFor({ timeout: 10_000 });
  await page.getByRole('button', { name: '和 顾怀瑾 初次见面' }).click();
  await page.waitForTimeout(1200); // 首次见面文案 + 动画
}

async function collectBackdrop(page, label) {
  const items = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      const bf = cs.backdropFilter || cs.webkitBackdropFilter || 'none';
      if (bf && bf !== 'none') {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 60) : '',
          bf,
          webkitPrefix: cs.webkitBackdropFilter || null,
        });
      }
    }
    return out;
  });
  const missingPrefix = items.filter((i) => !i.webkitPrefix || i.webkitPrefix === 'none');
  await page.screenshot({ path: path.join(evidence, `webkit-c2-backdrop-${label}.png`) });
  return { items, missingPrefix };
}

// ============ 检查点 3 · focus-visible（桌面 1440，落地页 + 设置页） ============
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await trackWoff2(page);
  await gotoLanding(page);

  const landing = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(120);
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return { tag: 'body', text: '', outline: '0px', shadow: 'none' };
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().slice(0, 24),
        outline: cs.outlineStyle === 'none' ? '0px' : cs.outlineWidth,
        shadow: cs.boxShadow,
      };
    });
    landing.push(info);
  }
  const landingMiss = landing.filter(
    (i) => i.tag !== 'body' && i.outline === '0px' && (i.shadow === 'none' || !i.shadow || i.shadow === '')
  );
  await page.screenshot({ path: path.join(evidence, 'webkit-c3-focus-landing.png') });

  // 设置页（三道情景题，按钮最密集）
  await gotoLanding(page);
  await page.getByRole('link', { name: '开始陪伴测试' }).first().click();
  await page.waitForTimeout(500);
  const setup = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(120);
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return { tag: 'body', text: '', outline: '0px', shadow: 'none' };
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().slice(0, 24),
        outline: cs.outlineStyle === 'none' ? '0px' : cs.outlineWidth,
        shadow: cs.boxShadow,
      };
    });
    setup.push(info);
  }
  const setupMiss = setup.filter(
    (i) => i.tag !== 'body' && i.outline === '0px' && (i.shadow === 'none' || !i.shadow || i.shadow === '')
  );
  await page.screenshot({ path: path.join(evidence, 'webkit-c3-focus-setup.png') });

  const totalMiss = landingMiss.length + setupMiss.length;
  log(
    'C3',
    'focus-visible 键盘焦点',
    totalMiss === 0 ? 'PASS' : (totalMiss <= 2 ? 'PARTIAL' : 'FAIL'),
    `落地页 Tab×12：${landing.length} 次聚焦、缺描边 ${landingMiss.length}（${landingMiss.map((m) => m.tag + ':' + m.text).join('; ') || '无'}）；设置页 Tab×8：缺描边 ${setupMiss.length}（${setupMiss.map((m) => m.tag + ':' + m.text).join('; ') || '无'}）。判定线：按钮类全有 brand-400 outline 或 ring。`
  );
  await ctx.close();
}

// ============ 检查点 1 · 100dvh（移动 375×812 与桌面 1440，聊天页） ============
for (const vp of [{ w: 375, h: 812, label: 'mobile-375' }, { w: 1440, h: 900, label: 'desktop-1440' }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await trackWoff2(page);
  await gotoLanding(page);
  await runOnboarding(page);

  const m = await page.evaluate(() => {
    const doc = document.documentElement;
    const input = document.querySelector('form textarea, form input, textarea, [class*="input"]');
    const container = document.querySelector('[class*="viewport-full"], .viewport-full, #root > div, #root');
    const cs = container ? getComputedStyle(container) : null;
    return {
      innerW: window.innerWidth,
      scrollW: doc.scrollWidth,
      innerH: window.innerHeight,
      scrollH: doc.scrollHeight,
      containerHeight: cs ? cs.height : 'n/a',
      containerSelector: container ? container.tagName.toLowerCase() + '.' + (typeof container.className === 'string' ? container.className.split(' ').slice(0, 3).join('.') : '') : 'n/a',
      inputBottom: input ? Math.round(input.getBoundingClientRect().bottom) : null,
      inputVisible: input ? input.getBoundingClientRect().bottom <= window.innerHeight + 1 : null,
    };
  });
  await page.screenshot({ path: path.join(evidence, `webkit-c1-dvh-chat-${vp.label}.png`) });

  const hOverflow = m.scrollW > m.innerW;
  const vGap = m.scrollH - m.innerH;
  const clip = m.inputBottom != null && m.inputBottom > m.innerH + 2;
  const status = !hOverflow && !clip && Math.abs(vGap) < 4 ? 'PASS' : 'FAIL';
  log(
    `C1-${vp.label}`,
    '100dvh 回退（聊天页）',
    status,
    `视口 ${m.innerH}px / 容器高 ${m.containerHeight}（${m.containerSelector}）/ scrollH-视口=${vGap}px / 横向溢出=${hOverflow} / 输入框底边=${m.inputBottom}（视口内=${m.inputVisible}）。判定线：无白底滚动、无输入框裁切、无横向溢出。`
  );
  await ctx.close();
}

// ============ 检查点 4 · woff2 字体（落地页 + MatchPage） ============
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  woff2Log.length = 0;
  await trackWoff2(page);
  await gotoLanding(page);

  const hero = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const cs = h1 ? getComputedStyle(h1) : null;
    return cs ? { text: h1.textContent.trim().slice(0, 30), fontFamily: cs.fontFamily.slice(0, 120) } : null;
  });
  // 设计事实（2026-09-03 取证）：h1 用 font-serif（Cormorant → 中文回退宋体，本意如此）；
  // Fraunces 用于品牌词 BONDSHIFT（font-display）；Petit Formal Script 用于标语（font-script）。
  const brand = await page.evaluate(() => {
    const el = [...document.querySelectorAll('*')].find((e) => getComputedStyle(e).fontFamily.includes('Fraunces'));
    return el ? getComputedStyle(el).fontFamily.slice(0, 80) : null;
  });
  const scriptFont = await page.evaluate(() => {
    const el = [...document.querySelectorAll('*')].find((e) => getComputedStyle(e).fontFamily.includes('Petit Formal Script'));
    return el ? getComputedStyle(el).fontFamily.slice(0, 80) : null;
  });
  await page.screenshot({ path: path.join(evidence, 'webkit-c4-font-landing.png') });

  const failed = woff2Log.filter((w) => w.status !== 200);
  const ok = woff2Log.filter((w) => w.status === 200);
  const status = failed.length === 0 && brand && scriptFont ? 'PASS' : 'FAIL';
  log(
    'C4',
    'woff2 艺术字体渲染',
    status,
    `woff2 请求 ${woff2Log.length} 个：成功 ${ok.length}、失败 ${failed.length}${failed.length ? '（' + failed.map((f) => f.url + ':' + f.status).join(',') + '）' : ''}；font-display 链（Fraunces，品牌词）=${brand || '未找到'}；font-script 链（Petit Formal Script，标语）=${scriptFont || '未找到'}；h1 为 font-serif（Cormorant，中文回退宋体）属设计本意。判定线：woff2 全 200 + 三条字体链正确解析。`
  );
  await ctx.close();
}

// ============ 检查点 2 · backdrop-filter（Landing/Swap/Match/Chat） ============
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await trackWoff2(page);
  await gotoLanding(page);
  const landingBd = await collectBackdrop(page, 'landing');

  await runOnboarding(page);
  const chatBd = await collectBackdrop(page, 'chat');

  // SwapPage：聊天页底部导航进入换乘
  const swapLink = page.getByRole('link', { name: '换乘' }).first();
  if (await swapLink.isVisible().catch(() => false)) {
    await swapLink.click();
    await page.waitForTimeout(1200);
  }
  const swapBd = await collectBackdrop(page, 'swap');

  const all = [...landingBd.items, ...chatBd.items, ...swapBd.items];
  const missing = [...landingBd.missingPrefix, ...chatBd.missingPrefix, ...swapBd.missingPrefix];
  log(
    'C2',
    'backdrop-filter 毛玻璃',
    all.length > 0 && missing.length === 0 ? 'PASS' : (all.length === 0 ? 'FAIL' : 'PARTIAL'),
    `检测到毛玻璃元素 ${all.length} 个（landing ${landingBd.items.length} / chat ${chatBd.items.length} / swap ${swapBd.items.length}），均带 -webkit- 前缀=${missing.length === 0}；滚动掉帧为 GUI 人工观察项（自动化无法测帧率），交由真实 Safari 复核。`
  );
  await ctx.close();
}

await browser.close();

console.log('\n===== D4-1-R WebKit 检查汇总 =====');
for (const r of results) console.log(`${r.id} | ${r.status} | ${r.name}`);
fs.writeFileSync(
  '/tmp/d41r-webkit-results.json',
  JSON.stringify({ results, woff2: woff2Log }, null, 2)
);
console.log('明细 JSON: /tmp/d41r-webkit-results.json');
