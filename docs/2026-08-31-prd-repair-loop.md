# BONDSHIFT 8/31 修复循环 PRD（D4-2 不达标项 + 设计 QA 日）

| 项目 | 内容 |
|---|---|
| 文档版本 | v1.0（2026-08-31 00:15 监督人签发） |
| 执行窗口 | 2026-08-31 全天（18:00 冻结检查点） |
| 执行者 | Codex（P0-1 / P0-2 / P1 / 收尾）+ 监督人（D4-5 设计 QA、冻结检查点） |
| 代码基线 | `b9ed89c` + 8/30 晚间 `[D4-2]` 检查点（以 T2 收工后 git log 为准） |
| 输入 | 8/30 Lighthouse 双档测量：移动 92/95/100/83、LCP 3.23s、CLS 0；桌面 100/95/100/83、LCP 0.74s、CLS 0.0003。**9/12 达标，3 项未达标**：① SEO 两端 83（缺 meta description + robots.txt 返回 SPA index.html 15 条解析错误）；② 移动端 LCP 3.23s（LCP 元素为首屏标题「先聊过，再决定谁更适合你。」；≈1.03s 渲染延迟 + 154ms 阻塞 CSS + 55KiB 未使用 JS 估算影响 ≈600ms） |
| 主文档 | `docs/2026-08-27-31-prd-responsive-deploy.md`（v1.4）——验收门槛与附录 B 约束以主 PRD 为准 |
| M3 计数 | 8/30 为第 1 轮不达标；8/31 修复后复测若仍不达标即第 2 轮 → 触发 fail-fast（砍优化范围、记 baseline.md 待办、不阻塞 D5 主线） |

---

## 一、监督人授权决定（白名单窄豁免，仅限 8/31 修复循环）

主 PRD 附录 B-1 白名单中 `index.html` 仅允许 theme-color meta、且 `public/` 不在白名单。以下两项为达成 4.3 既定验收门槛（SEO ≥ 90）所必需的最小改动，**监督人特此授权窄豁免**，边界如下：

| # | 授权项 | 允许的改动 | 禁止事项 |
|---|---|---|---|
| A-1 | `index.html` 追加 `<meta name="description">` | 仅 1 个标签，content 为监督人指定文案（见提示词 1）；位置紧邻 theme-color meta | 不得改动其他任何标签、不得引入外链资源 |
| A-2 | 新建 `public/robots.txt` | 仅静态 robots 规则（内容见提示词 1） | 不得改动 netlify.toml 重定向、不得新建 sitemap |
| A-3 | `src/main.tsx` 字体 CSS 按需拆分（属 B-1 白名单内，无需豁免，仅作说明） | 将非首屏字体的 @fontsource import 移入使用它们的页面组件 | 不得删除任何权重、不得改字体栈 |

超出上述边界的任何改动（尤其 JS 依赖瘦身、路由重构、lucide 图标库调整）→ **必须先停下询问监督人**，不得自行实施。

## 二、今日目标

1. **P0-1 · SEO 修复**：meta description + robots.txt → 两端 SEO 预期 83→100。
2. **P0-2 · 移动端 LCP 优化**：3.23s → <2.5s（需砍 ≥0.73s）。首选字体 CSS 按需拆分（减少阻塞与首屏无效加载），复测；不达标则报告诊断明细再定第二线。
3. **P1 · 对比度修复**：落地页三步骤编号 4.21:1 → ≥4.5:1（改用现有 token，不新增色值）。
4. **监督人 · D4-5 设计 QA**：按手册第 8 章 10 项清单过检，证据存 `docs/evidence/after/responsive/design-qa/`。
5. **18:00 · 冻结检查点**：D4-2 复测全绿 → 页面级视觉冻结生效（9/1 18:00 前仍可调页面级视觉）。

## 三、任务拆解与依赖

| # | 任务 | 执行方 | 依赖 | 提交 |
|---|---|---|---|---|
| R1 | SEO 修复 + 三件套 + Lighthouse 复测（仅看 SEO 项） | Codex | 无 | `[D4-2 补遗] SEO：meta description 与 robots.txt` |
| R2 | LCP 优化（字体 CSS 拆分起步）+ 三件套 + 移动端复测 | Codex | R1（避免交叉干扰，逐项一 commit） | `[D4-2 补遗] 移动端 LCP：首屏字体按需加载` |
| R3 | 对比度修复（步骤编号 token 替换）+ 三件套 | Codex | R2 | `[D4-2 补遗] 对比度：步骤编号色值达标` |
| R4 | 8/31 日报 + 主 PRD 6.2 回填 + 冻结检查点材料 | Codex | R1–R3 | `[日报] 2026-08-31 收工` |
| R5 | D4-5 设计 QA 过检 | 监督人 | R3（对比度修复后过检更准） | 截图入 design-qa/ |
| R6 | 冻结检查点 18:00 | 监督人 | R1–R4 | 日报记录 |

## 四、验收标准

- 两端 SEO ≥ 90（预期 100：meta-description 与 robots-txt 两审计全过）。
- 移动端 LCP < 2.5s；若两轮优化后仍不达标 → M3 fail-fast：记录 baseline.md 待办、砍 LCP 优化范围，**不阻塞 D5 上线主线**。
- A11y 复测 ≥ 90 保持；color-contrast 审计中步骤编号项通过（≥4.5:1）。
- 每项修复后三件套全绿（lint 0/0、build 成功主 JS ≤ 237.64KB×1.15、三套 e2e PASS）。
- 每项一 commit，工作树收工时干净。

## 五、约束条件

1. 修复仅限 CSS/组件层 + 第一节窄授权项；`src/core/`、`src/stores/`、`src/services/`、`src/data/`、`netlify/`、`netlify.toml`、`package*.json` 一律只读。
2. 零新增依赖；不做 JS 依赖瘦身/图标库重构（如确需 → 停下询问监督人）。
3. 视觉冻结条款：页面级视觉细节允许调整至 9/1 18:00；R3 的 token 替换属组件级合法调整。
4. 受 e2e 保护的文案（B-5 清单）不得修改；meta description 文案为监督人指定，原样写入。
5. 异常即停：任何复测回退、门禁失败、边界歧义 → 停止并报告。

---

## 六、Codex 提示词（按顺序逐条发送）

### 提示词 1 · R1：SEO 修复（meta description + robots.txt）

> **【任务背景】**
> 8/30 Lighthouse 双档测量：两端 SEO 均 83（门槛 ≥90），失败审计项为 `meta-description`（index.html 缺少 meta description）与 `robots-txt`（/robots.txt 返回 SPA index.html，15 条解析错误）。监督人已签发白名单窄豁免（见 `docs/2026-08-31-prd-repair-loop.md` 第一节）：允许 index.html 追加 1 个 meta description 标签、新建 public/robots.txt。本任务目标是两端 SEO 达到 100。
>
> **【具体要求】**
> 1. `index.html`：在 `<meta name="theme-color" content="#B45A78" />` 之后追加一行（文案由监督人指定，原样写入，不得改写）：
>    `<meta name="description" content="BONDSHIFT 可换乘男友模拟器——AI 人格引擎 × 女性向约会模拟。三道情绪情景题，匹配此刻最适合你的他，开始一段可以换乘的恋爱。" />`
>    除这一行外不得改动 index.html 任何内容。
> 2. 新建 `public/robots.txt`，内容：
>    ```
>    User-agent: *
>    Allow: /
>    Disallow: /api/
>    ```
> 3. 验证：`npm run preview -- --host 127.0.0.1` 后 `curl -s http://127.0.0.1:4173/robots.txt` 应返回上述内容（而非 HTML）；`curl -s http://127.0.0.1:4173/ | grep description` 应命中新标签。
> 4. 三件套门禁：`npm run lint`（0/0）→ `npm run build`（成功，主 JS ≤ 273KB）→ 三套 e2e 全 PASS（preview 起着时逐个跑，注意 `--host`）。
> 5. 复测：重跑两档 Lighthouse（命令与 8/30 相同，JSON 覆盖写入原路径 `docs/evidence/after/responsive/lighthouse-{mobile,desktop}.json`），确认 SEO = 100、其余类别分数无回退（Performance 移动 ≥85、桌面 ≥90，A11y ≥90，BP ≥90，LCP/CLS 记录本次值供 R2 对比）。
> 6. 停止 preview、释放 4173。
> 7. 提交：`git add index.html public/robots.txt docs/evidence/after/responsive/lighthouse-mobile.json docs/evidence/after/responsive/lighthouse-desktop.json`，message：`[D4-2 补遗] SEO：meta description 与 robots.txt 修复（两端 83→100）`。
> 8. 异常即停：任何门禁失败、SEO 未达 100、其他类别分数回退 >2 分 → 停止报告，不提交。
>
> **【涉及文件范围】**
> - 修改：`index.html`（仅新增 1 行 meta description）
> - 新增：`public/robots.txt`
> - 覆盖：`docs/evidence/after/responsive/lighthouse-mobile.json`、`lighthouse-desktop.json`（复测结果）
> - 禁止改动：`src/`、`tests/`、`package*.json`、`netlify/`、`netlify.toml` 及其他一切文件
>
> **【预期输出格式】**
> ① 两项修复的 diff 摘要；② curl 验证输出；③ 三件套门禁结果；④ 复测后两档六指标对照表（修复前→后）；⑤ commit 哈希 + `git show --stat`。

### 提示词 2 · R2：移动端 LCP 优化（首屏字体按需加载）

> **【任务背景】**
> 8/30 移动端 LCP 3.23s（门槛 <2.5s），LCP 元素为落地页首屏标题「先聊过，再决定谁更适合你。」。审计线索：标题渲染延迟 ≈1.03s、阻塞 CSS ≈154ms、55KiB 未使用 JS 估算影响 ≈600ms。注意：该标题为中文文本，使用系统字体栈回退渲染（拉丁 webfont 不覆盖中文字形），故 LCP 主要矛盾是**首屏渲染路径上的阻塞资源**，而非字体下载本身。`src/main.tsx` 当前同步引入 9 个 @fontsource 权重 CSS（B-1 白名单允许修改 main.tsx 与页面组件）。
>
> **【具体要求】**
> 1. 先做诊断不动代码：从最新 lighthouse-mobile.json 提取 `render-blocking-resources`、`unused-javascript`（列出 Top 5 未使用模块与各自体积）、`largest-contentful-paint` 的 phase 明细，汇报后按以下策略实施（允许在同一步内完成，无需等待批复）：
> 2. **策略（首选）——字体 CSS 按需拆分**：保留首屏必需权重（落地页 Hero 用到的：Fraunces 600/600i、Cormorant 500/500i、Plus Jakarta Sans 常用权重、Petit Formal Script 400 若落地页 B 副标语用到）在 `src/main.tsx`；其余权重的 @fontsource import 移至实际使用它们的页面组件（如 ChatPage/ReportPage 等懒加载路由组件，Vite 会随路由 chunk 拆分 CSS）。**9 个权重一个都不能删**，只是挪位置；改完 `npm run build` 确认 dist 内 9 个 woff2 全部仍在。
> 3. 三件套门禁全绿（同 R1 第 4 步）。
> 4. 复测移动端 Lighthouse（JSON 覆盖写原路径），目标 LCP < 2.5s。记录 SEO/A11y/BP 分数确认无回退。
> 5. **若 LCP 仍 ≥ 2.5s**：不继续盲改，输出诊断报告（unused-javascript 明细 + render-blocking 明细 + LCP phase 分解 + 你的第二线建议），停下等待监督人决策。这是 M3 fail-fast 第 2 轮触发点，砍范围与否由监督人裁定。
> 6. 达标则停止 preview、提交：`git add src/main.tsx <涉及页面组件> docs/evidence/after/responsive/lighthouse-mobile.json`，message：`[D4-2 补遗] 移动端 LCP：首屏字体按需加载（3.23s→<实测>s）`。
> 7. 异常即停：任何 e2e 失败、字体缺失（build 后 woff2 数量不对、页面字体回退异常）、门禁失败 → 停止报告。
>
> **【涉及文件范围】**
> - 修改：`src/main.tsx`（@fontsource import 位置调整）、`src/pages/*.tsx`（仅限新增 import 语句行）
> - 覆盖：`docs/evidence/after/responsive/lighthouse-mobile.json`
> - 禁止改动：`src/core/`、`src/stores/`、`src/services/`、`src/data/`、`src/components/layout/`、`index.html`、`tests/`、`package*.json`、`netlify/`
>
> **【预期输出格式】**
> ① 诊断摘要（改造前）；② import 迁移清单（哪个权重 → 哪个文件）；③ build 产物验证（woff2 数量与合计体积）；④ 三件套结果；⑤ 复测 LCP 与六指标对照表；⑥ commit 哈希或（若不达标）诊断报告全文。

### 提示词 3 · R3 + R4：对比度修复 + 8/31 日报收尾

> **【任务背景】**
> R1/R2 已完成并提交。遗留 P1 项：落地页三步骤编号颜色对比度 4.21:1（WCAG AA 要求 ≥4.5:1，A11y 总分 95 达标但该审计项未过）。随后需完成 8/31 收工（日报 + PRD 回填 + 冻结检查点材料）。当日基准：8/30 测量 9/12 达标，3 项未达标经 R1/R2 处理后以复测结果为准。
>
> **【具体要求】**
> 1. **对比度修复**：定位落地页三步骤编号元素（`src/pages/LandingPage.tsx`），将其颜色从当前低对比 token（疑似 text-tertiary `#B5A5B5`）改用现有 `--color-text-secondary`（#6B5A6B，对 Cloud White 约 7:1）。**只允许换用 token 表（3.1.1）内已有色值，禁止新增色值或改 token 定义**（令牌表冻结）。若该元素本就用的不是 text-tertiary，报告实际值后再改。
> 2. 三件套门禁全绿；复测移动端 Lighthouse 确认 A11y 分数 ≥90 且 color-contrast 相关审计改善（SEO/Perf 无回退）。
> 3. 提交 R3：`git add src/pages/LandingPage.tsx docs/evidence/after/responsive/lighthouse-mobile.json`，message：`[D4-2 补遗] 对比度：落地页步骤编号改用 text-secondary（4.21→≥4.5:1）`。
> 4. **8/31 日报**：新建 `docs/daily/2026-08-31.md`（结构沿用 8/30）：今日目标（R1 SEO / R2 LCP / R3 对比度 / D4-5 设计 QA【监督人】/ 18:00 冻结检查点）、执行记录（每项修复前后指标）、问题与处理（LCP 若触发 M3 fail-fast 需写明）、冻结检查点结论（全绿与否 → 页面级视觉冻结状态）、次日计划（9/1 D5-1 最终门禁）。
> 5. **主 PRD 回填**：`docs/2026-08-27-31-prd-responsive-deploy.md` 6.2 节新增「8/31 执行结果」小表（R1/R2/R3 状态 + 复测指标 + commit 哈希）。
> 6. 提交 R4：`git add docs/daily/2026-08-31.md docs/2026-08-27-31-prd-responsive-deploy.md`，message：`[日报] 2026-08-31 收工：D4-2 修复循环 + 冻结检查点`。
> 7. 验证与回报：`git status --porcelain` 为空；`git log --oneline -8`；回报各 commit 哈希 + 修复前后指标总表 + 冻结检查点判定材料（供监督人 18:00 拍板）。
>
> **【涉及文件范围】**
> - 修改：`src/pages/LandingPage.tsx`（仅步骤编号颜色一行）、`docs/daily/2026-08-31.md`（新增）、`docs/2026-08-27-31-prd-responsive-deploy.md`（仅 6.2 回填）、`docs/evidence/after/responsive/lighthouse-mobile.json`（复测覆盖）
> - 禁止改动：上述之外的任何文件
>
> **【预期输出格式】**
> ① R3 diff 摘要 + 复测 A11y/color-contrast 结果；② 8/31 日报全文；③ PRD 回填 diff 摘要；④ 全部 commit 哈希 + git show --stat；⑤ 冻结检查点判定材料汇总表。

## 七、监督人任务

1. **D4-5 设计 QA（白天任意时段，建议 R3 后）**：按 `docs/BONDSHIFT-UI-Design-Prompts.md` 第 8 章 10 项清单逐页过检（375/1440 截图已归档于 responsive/）；证据（截图+勾选记录）存 `docs/evidence/after/responsive/design-qa/`（新目录）；发现问题 → 转 Codex 按「仅样式修复」处理，每项一 commit。
2. **冻结检查点（18:00）**：核对 R4 回报的复测总表——全绿 → 宣布页面级视觉冻结生效（9/1 18:00 前仍可调页面级视觉细节）；LCP 未绿 → 裁定 M3 fail-fast 范围并记 baseline.md。
3. **Safari 15 手测四点**（若 8/30 晚未做）：100dvh / backdrop-filter / focus-visible / woff2 渲染，结果告知 Codex 记入 8/31 日报。
