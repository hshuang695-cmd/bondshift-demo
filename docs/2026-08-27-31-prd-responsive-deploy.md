# BONDSHIFT 响应式开发与部署上线 PRD

| 项目 | 内容 |
|---|---|
| 文档版本 | v1.4（2026-08-30 晚间修订。核心变更：① 基线更新至 `b9ed89c`——8/29 三任务经监督人独立核实后落地 4 个本地检查点 commit（未推送）；② 8/30 白天窗口空转，当日计划压缩重排为「晚间冲刺」：D4-2 Lighthouse 今晚执行、D4-1-R Safari 手测顺延、冻结检查点顺延至 8/31 18:00；③ 8/31 缓冲日吸收全部顺延项，9/1、9/2 冻结与上线节点不变。完整变更见第 0 章 v1.4 变更记录） |
| 执行窗口 | 2026 年 8 月 27 日 — 9 月 2 日 24:00（原 8/31 截止，经方案 A「顺延保全」决策顺延 2 天，依据见 0.3 节时间线与 docs/daily/2026-08-28.md） |
| 执行者 | Codex（AI 编码代理）——负责本 PRD 中标注【执行方：Codex】的任务 |
| 监督人 | 产品负责人（本文档作者）——负责标注【执行方：监督人】的任务及每日 10:00/17:00 两个检查点 |
| 代码仓库 | 本地仓库 `/Users/huangshuang/Desktop/first-cc/bondshift` |
| 当前代码基线 | commit `b9ed89c`（8/29 检查点 4 commits：`a847c5c`/`17df882`/`0f326b0`/`b9ed89c` 已落地本地 main，**未推送**；质量门禁全绿：lint 0/0、build 主 JS 237.64KB、三套 e2e PASS） |
| 视觉设计依据 | `docs/BONDSHIFT-UI-Design-Prompts.md`（Dreamcore Romanticism 设计语言 v1.0，**视觉唯一权威来源**） |
| 部署目标 | Netlify 站点 `bondshift-demo`（配置已存在于 `netlify.toml`） |
| 技术方案冻结 | **事件驱动冻结（方案 A 条款）**：批 A（第 6 章 D1 全部）已于 8/28 完成并通过验收，**核心技术方案自此冻结**——布局策略（lg 双形态容器 + 组件级 lg: 前缀）、令牌表（3.1.1）、依赖清单（B-3 白名单）不得再变更；页面级视觉细节允许调整至 9/1 18:00；9/2 12:00 起全量代码冻结（仅允许修复阻断性问题） |

> **Codex 阅读指引（v1.4）**：本文档是唯一需求来源。**第 6 章中标注 ✅ 的任务已全部完成，禁止重复实施**（重复实施会破坏已有成果——例如重写 `@theme` 会覆盖已迁移的 Dreamcore 令牌）。截至 8/30 晚，D1-8-R、D4-3-R、D4-4 已完成并提交（`a847c5c`/`17df882`），PRD 进度 20/28；剩余工作是 D4 性能/人工 QA 与 D5 部署上线。**8/30 晚间冲刺的逐任务执行提示词见 `docs/2026-08-30-prd-evening-sprint.md`（今晚 Codex 会话请优先按该文档执行）**。第 2/3 章的需求描述与设计规范对剩余任务仍然有效，其中已完成的描述以「已完成」或 commit 标注。第 8 章附录 B 是必须遵守的硬性约束。凡本文档未提及的功能一律不做（见 2.5 超出范围清单）。

---

## 0. v1.4 变更记录（2026-08-30 晚）

| 编号 | 变更内容 | 影响范围 | 执行状态 |
|---|---|---|---|
| CH-09 | 基线更新：8/29 三任务（D1-8-R/D4-3-R/D4-4）经监督人独立核实（7 项声明 14 个事实点全过）后，落地 4 个本地检查点 commit（`a847c5c`/`17df882`/`0f326b0`/`b9ed89c`，23:13–23:17），未推送；PRD 进度 20/28 | 文档头、0.3、6.1、6.2 | ✅ 已落实 |
| CH-10 | 8/30 计划重排：白天窗口未启动（无 Codex 会话触发，D4-2/D4-1-R/18:00 冻结检查点均未执行），22:40 监督人介入启动晚间冲刺——D4-2 Lighthouse 双档今晚执行（只测量不修复）；D4-1-R 顺延至今晚或 8/31 上午（监督人）；冻结检查点顺延至 8/31 18:00；8/31 修复日吸收全部顺延项 | 6.2、7（R11） | ✅ 已落实 |
| CH-11 | 新增 8/30 晚间冲刺专项执行文档 `docs/2026-08-30-prd-evening-sprint.md`（含逐任务 Codex 提示词：Lighthouse 双档测量、日报与检查点提交）；本文档仅保留排期与验收基线，执行细节以专项文档为准 | 6.2 | ✅ 已落实 |

---

## 0. v1.3 变更记录

| 编号 | 变更内容 | 影响范围 | 执行状态 |
|---|---|---|---|
| CH-01 | 基线更新：全文「现状」描述由审计基线 `5f24923`（Codex 未开工）更新为终审基线 `7f757ad`（19/33 任务完成）；1.2 现状表、2.1/2.2 任务表、第 6 章排期、附录 A 资产地图逐项标注完成态与 commit 证据 | 1.2、2.1、2.2、2.4、6、附录 A | ✅ 已落实 |
| CH-02 | 时间线顺延（方案 A）：执行窗口 8/27–8/31 → 8/27–9/2；冻结条款「8/28 18:00」→「事件驱动（批 A 完成即冻结核心技术方案，页面级视觉细节宽限至 9/1 18:00，9/2 12:00 全量冻结）」；同步更新 1.4、5.5、第 6 章 | 文档头、1.4、5.5、6 | ✅ 已落实 |
| CH-03 | V-1 事实修正：core/data/utils 豁免层色值「约 10 处」→「实测约 55 处」，并明确判定规则为文件路径白名单而非数量 | 2.4 V-1、附录 B-2 | ✅ 已落实 |
| CH-04 | Recharts 失实断言删除：`src/` 全库无 recharts 使用（报告页为纯 CSS 条形/环形实现），修正 1.1 技术栈表、2.1 /report 行，**R4 风险作废**；禁止为图表目的引入 recharts 依赖 | 1.1、2.1、7（R4） | ✅ 已落实 |
| CH-05 | 人工任务执行主体标注：D4-1 跨浏览器（监督人为主）、D4-5 设计 QA（监督人）、D5-2 环境变量（监督人）等明确到人；可 CLI 化的验收项（Lighthouse、截图、viewport 切换）给出命令化路径，消除 v1.2 中 D5-2 与 R6 的矛盾 | 4.1、4.3、4.4、5.2、5.3、6 | ✅ 已落实 |
| CH-06 | 剩余任务重排：已完成 19 项冻结为事实记录；剩余工作（D1-8 补截图、D4 浓缩版、D5）按 8/29–9/2 逐日重排，每项附执行方、验收标准、边界条件 | 6 | ✅ 已落实 |
| CH-07 | P1 可选项正式入停车场：D1-9、D3-6（V-6 装饰符号库）、D4-7（V-7 氛围动效）、D5-6 本轮不实施；D4-6 已随批 B 完成（bc584bf） | 2.5、6 | ✅ 已落实 |
| CH-08 | 附录 B 补充：B-1 白名单对 `package.json`/`package-lock.json` 的历史矛盾予以澄清（依赖变更已随批 A 完成，剩余阶段禁止再动）；tests/ 目录扩充边界、scripts/ 目录许可明确化 | 附录 B | ✅ 已落实 |

### 0.3 已发生工作时间线（事实记录，供交接上下文）

**8/28 上午 · 执行审计（产品战略团队）**
- 对 PRD v1.2 与代码基线 `5f24923` 全量审计：33 项任务完成度 0/33，执行停滞于 Day 0；根因判定为「Codex 会话未触发 + 监督环未运转」（PRD v1.2 修订稿停留工作树未下发）。
- 决策 1：**方案 A「顺延保全」**——窗口顺延至 9/2；上线保底前置（M0：现有站点已可访问、DeepSeek 直连已通、/api/chat 代理已修复）；批 A（结构）/批 B（视觉）两批分验；P1 可选项入停车场。报告：`deliverables/product-strategy/prd-audit-responsive-deploy-2026-08-28.md`。

**8/28 中午 · 用户拍板**
- 用户确认采纳方案 A，指令立即推进完整代码实现。

**8/28 下午 · 批 A + 批 B 实施（当日一次性完成原定 3 天工作量）**
- 批 A（D1-0~D1-8）：依赖安装（playwright + 4 个 @fontsource）、`@theme` 全量迁移为 Dreamcore 令牌、四字体栈接入、AppShell 双形态容器、SideNav 新建、BottomNav/StatusBar `lg:hidden`、MotionConfig reducedMotion、ChatPage 100dvh 回退、按钮胶囊化。
- 批 B（D2-1~D2-3、D3-1~D3-5）：Landing/Setup/Match 三页视觉升级（Match 深色→浅色整页重构，保留全部 e2e 断言点）；Home/Swap/Chat/Report/Settings 五页响应式（lg 栅格）+ 新视觉 + UI 层硬编码色值清零。
- 实施期新增决策（记录于会话，均已被 v1.3 吸收）：SideNav 匿名 ID 只读 localStorage 键 `bondshift_anonymous_id_v1`（不触碰只读 service 层）；ChatPage 桌面容器 `lg:max-w-3xl` 居中 + `xl:` 右侧男友信息栏；新增 `tests/e2e-desktop-responsive.mjs`（D4-6 提前完成）；`@utility viewport-full`（100dvh 回退）与 `card-hover`（hover:hover 媒体查询）落入 index.css。
- 质量门禁：lint 0 error 0 warning；build 成功（主 JS 237.64KB，较基线 +0.7%）；`tests/e2e-onboarding.mjs` PASS；`tests/e2e-desktop-responsive.mjs` PASS（1440 SideNav / 375 BottomNav / 768 平板 / 1920 xl 信息栏 / 各档无水平溢出）。

**8/28 下午 · 交付前终审（产品战略团队）**
- 五维审查（需求清晰性 / 范围边界 / 验收可衡量性 / 技术约束 / 任务粒度）+ 现状一致性核对：PRD v1.2「不可原样交付，修订后交付」，4 项阻断级问题（基线过时 / 时间线冲突 / V-1 数字错误 / 人工任务无执行主体），新发现 Recharts 幽灵需求。报告：`deliverables/product-strategy/prd-final-review-2026-08-28.md`。
- 终审微修：commit `70ffd18`（HomePage:87 最后一处内联 hex → token 引用，UI 在用页面硬编码清零）。
- 用户指令代拟 v1.3 → **本文档**。

**8/29 深夜 · 检查点落地（监督人核实后，事实记录）**
- 22:43–22:48 监督人对 8/29 日报 7 项声明完成独立核实（25 张截图目视核对、三套 e2e 实跑 PASS、lint/build 复跑、包体积与 DEP0205 来源复现、变更边界 git 核对），全部属实。
- 23:13–23:17 Codex 落地 4 个本地检查点 commit：`a847c5c`（[D1-8-R]）、`17df882`（[D4-3-R][D4-4]）、`0f326b0`（[日报]）、`b9ed89c`（遗留文档归档）；未推送、未部署。
- 过程决策：`landing-1440.png` 属 e2e 重跑再生证据，经「异常即停」请示后纳入 [D1-8-R] 提交。

**8/30 · 白天窗口空转（事实记录）**
- 白天无 Codex 会话触发，D4-2 / D4-1-R / 18:00 冻结检查点均未启动；22:40 监督人介入，启动晚间冲刺（重排见 6.2，执行细节见 `docs/2026-08-30-prd-evening-sprint.md`）。

**8/29 – 9/2 · 剩余排期**：见第 6 章（计划态，实际进展以每日日报为准）。

---

## 1. 项目背景与目标

### 1.1 现有网站定位与功能

BONDSHIFT 是一款"可换乘男友模拟器"——面向女性用户的 AI 人格引擎 × 约会模拟类 Web 应用。核心用户旅程：

```
落地页(/) → 三道情绪情景题(/setup) → 确定性匹配揭晓(/match)
→ 首次相遇+AI对话(/chat/:boyfriendId) → 首页关系运营(/home)
→ 换乘决策(/swap) → 关系报告(/report) → 设置(/settings)
```

- AI 对话通过 Netlify Function（`netlify/functions/chat.mjs`）代理 DeepSeek API，失败时本地人格引擎降级并支持重试。
- 每位男友的消息、记忆、关系状态相互隔离，持久化在浏览器本地（匿名 ID）。
- 技术栈：React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Framer Motion 12 + Zustand 5 + react-router-dom 7 + lucide-react。**v1.3 修正**：报告页图表为纯 CSS/div 条形与 SVG 环形实现，**项目中没有 recharts**——禁止为任何图表目的引入该依赖（B-3 白名单约束）。

### 1.2 现状问题表（v1.3：截至终审基线 `7f757ad` 的逐条结算）

原 v1.2 的 8 条现状问题中，7 条已随批 A/批 B 解决：

| # | 原问题（v1.2 基线 5f24923） | 当前状态 | 解决证据 |
|---|---|---|---|
| 1 | AppShell 容器锁定 `max-w-[430px]` | ✅ 已解决 | `711de06`：双形态容器——`<lg` 保持 430px 居中，`≥lg` 全宽 + SideNav + 内容区 `max-w-6xl lg:px-8` |
| 2 | StatusBar 桌面端显假 | ✅ 已解决 | `711de06`：`StatusBar.tsx:19` 已加 `lg:hidden` |
| 3 | 仅 BottomNav 一种导航形态 | ✅ 已解决 | `711de06`：`SideNav.tsx` 已建成（240px、Fraunces Italic Logo、5 项导航复用 TAB_CONFIG、左侧 3px 激活竖条、底部匿名 ID） |
| 4 | 响应式现状分三档 | ✅ 已解决 | 批 B 后 8 页全部具备响应式：Home `lg:grid-cols-12`（7+5）、Swap `lg:grid-cols-2`、Chat `lg:max-w-3xl` + `xl:` 信息栏、Report `lg:grid-cols-2`、Settings `md:max-w-3xl`；Landing/Setup/Match 既有布局解锁生效 |
| 5 | 交互反馈不均衡 | ✅ 已解决 | `711de06`：全局 `:focus-visible` 描边（index.css）+ `card-hover`（`@media (hover:hover)` 上浮）+ `MotionConfig reducedMotion="user"`（App.tsx）+ ChatPage `viewport-full`（100dvh 回退） |
| 6 | 生产环境 DeepSeek 密钥尚未配置 | ⚠️ **仍成立（唯一遗留）** | D5-2 待执行（执行方：监督人，见 5.2） |
| 7 | 旧粉色系 + 20+ 种硬编码色值 | ✅ 已解决 | `c749208`：`@theme` 全量迁移（brand-500 `#B45A78`、mint/cream/gold/ink 新增、surface Cloud White/Paper Cream）；theme-color `#B45A78`；UI 在用页面硬编码 hex 已清零（`70ffd18` 终验：唯一残留为已隐藏 VRPage 的 1 处兜底色，不在在用路由） |
| 8 | MatchPage 深色沉浸式主题冲突 | ✅ 已解决 | `bf5f781`：整页重构为浅色 Dreamcore（Cloud White 底 + 柔光弥散 + Cormorant Italic 标题 + Script 签名），保留全部 e2e 断言点 |

**给 Codex 的指令**：上表 7 个已解决项**禁止回退或重复实施**。第 6 条是唯一遗留现状，由 D5-2 处理（非你的职责范围）。

### 1.3 本次开发核心目的（不变，v1.2 原文保留）

1. **响应式适配**：让网站在手机、平板、桌面三类设备上均提供与设备形态匹配的原生体验，摆脱"桌面端手机壳"。→ 批 A/批 B 已完成骨架与页面落地，D4 验收收尾。
2. **视觉品牌升级**：按 `docs/BONDSHIFT-UI-Design-Prompts.md` 将全站视觉切换为 Dreamcore Romanticism（梦境浪漫主义）设计语言。→ 已完成（V-1~V-5），D4-5 设计 QA 过检收尾。
3. **部署上线**：完成 Netlify 生产环境配置与真实 AI 调用验收，使站点达到可公开测试状态。→ **D5 待执行（本 PRD 剩余核心）**。
4. **守住既有质量基线**：移动端（375px）**功能**零回归；`npm run lint` / `npm run build` / 两套 e2e 全部保持通过。→ 当前全绿，D4/D5 期间不得破坏。

### 1.4 成功指标（整体）

- **9 月 2 日 24:00 前**（v1.2 的 8/31 顺延，方案 A），生产 URL 在 320px–1920px 全宽度范围内无水平滚动、无布局破碎。
- 生产环境发送自由文本消息能收到真实 DeepSeek 回复（无降级横幅）。
- Lighthouse 移动端 Performance ≥ 85、桌面端 ≥ 90（见 4.3，执行路径已 CLI 化）。
- 全站通过设计手册第 8 章"品牌一致性检查清单"10 项检查（D4-5 执行，证据存于 `docs/evidence/after/responsive/design-qa/`）。

---

## 2. 需求范围

### 2.1 需要适配的页面清单（v1.3：完成态标注）

8 个路由页面 + 3 个全局布局组件。**全部页面已于批 A/批 B 完成适配与新视觉**，本表转为验收对照基线（D4 使用）：

| 路由 | 组件文件 | 桌面端（≥1024px）布局 | 状态 |
|---|---|---|---|
| `/` 落地页 | `src/pages/LandingPage.tsx` | `lg:grid-cols-[1.02fr_0.98fr]` 分栏 Hero、`md:grid-cols-3` 三步流程；Fraunces Italic Logo + Cormorant Italic Hero + Script 副标语 + Sky Blush 背景 + 胶囊 CTA | ✅ `bf5f781` |
| `/setup` 偏好测试 | `src/pages/SetupPage.tsx` | `max-w-[680px]` 居中；衬线标题、胶囊按钮、Paper Cream 选项卡 | ✅ `bf5f781` |
| `/match` 匹配揭晓 | `src/pages/MatchPage.tsx` | `lg:grid-cols-[0.85fr_1.15fr]` 两栏；浅色 Dreamcore 视觉（深色已重构） | ✅ `bf5f781` |
| `/home` 首页 | `src/pages/HomePage.tsx` | `lg:grid lg:grid-cols-12 lg:gap-6`：主卡 `col-span-7`，侧列 `col-span-5` | ✅ `58e5227` |
| `/swap` 换乘 | `src/pages/SwapPage.tsx` | `lg:grid-cols-2` 两栏对比：当前男友与推荐换乘并排，弹窗胶囊化 | ✅ `58e5227` |
| `/chat/:boyfriendId` 聊天 | `src/pages/ChatPage.tsx` | `lg:max-w-3xl` 居中对话列；`xl:` 右侧男友信息栏（头像/关系分/标签），`xl:` 以下隐藏 | ✅ `58e5227` |
| `/report` 报告 | `src/pages/ReportPage.tsx` | `lg:grid-cols-2` 图表卡片网格；**图表为纯 CSS 条形/SVG 环形实现，无 ResponsiveContainer**（v1.3 修正：原「Recharts 高度塌陷修复」需求不存在，R4 作废） | ✅ `58e5227` |
| `/settings` 设置 | `src/pages/SettingsPage.tsx` | `md:max-w-3xl mx-auto` 分组卡片；SettingRow tone 四档令牌化 | ✅ `58e5227` |

### 2.2 全局布局组件（v1.3：完成态标注）

| 组件 | 文件 | 改造要求 | 状态 |
|---|---|---|---|
| AppShell | `src/components/layout/AppShell.tsx` | 双形态容器（`<lg` 430px / `≥lg` 全宽 max-w-6xl）；AnimatePresence 转场保留 | ✅ `711de06` |
| BottomNav | `src/components/layout/BottomNav.tsx` | `lg:hidden`；`layoutId="tabIndicator"` 保留；硬编码色值已清除 | ✅ `711de06` |
| SideNav | `src/components/layout/SideNav.tsx` | **已存在**（v1.2 标注"新建"，v1.3 修正）；240px、Fraunces Italic Logo、5 项导航、全屏路由隐藏（复用 FULL_SCREEN_ROUTES）、底部匿名 ID（只读 `localStorage.bondshift_anonymous_id_v1`） | ✅ `711de06` |
| StatusBar | `src/components/layout/StatusBar.tsx` | `lg:hidden` | ✅ `711de06` |
| PageHeader | `src/components/layout/PageHeader.tsx` | D1-9（P1）**入停车场**：AppShell 内容包裹层已带 `lg:px-8`，单独调整 PageHeader 会造成双层 padding | 🅿️ 停车场 |

### 2.3 交互要求（全端通用，已实施，D4 验收对照）

| # | 要求 | 状态 |
|---|---|---|
| I-1 | 指针设备 hover 态：`card-hover` utility（`@media (hover:hover)` 上浮 + 阴影加深）；主按钮亮度 +10% + shadow-glow | ✅ 已实施（HomePage 快捷操作/发现更多、SwapPage 卡片等已挂 card-hover） |
| I-2 | 键盘可达性：全局 `:focus-visible` 2px brand-400 描边外扩 2px（index.css base 层） | ✅ 已实施 |
| I-3 | 触控目标 ≥ 44×44px | ✅ 原有满足 |
| I-4 | `MotionConfig reducedMotion="user"`（App.tsx）+ CSS `prefers-reduced-motion` 兜底 | ✅ 已实施 |
| I-5 | ChatPage `viewport-full` utility（100vh + `@supports` 100dvh 回退） | ✅ 已实施 |
| I-6 | 无水平溢出（9 档宽度） | ✅ 320/375/390/768/834/1024/1280/1440/1920 全页矩阵 72/72 PASS；证据：`docs/evidence/after/responsive/matrix/` |
| I-7 | 布局切换动画安全（viewport 横跳无残影） | ✅ 8/29 在 999↔1025px 循环 10 次通过，导航互斥且无 tabIndicator 残影 |
| I-8 | 动效 ≤ 600ms、无强刺激 | ✅ 已实施（现有动效 0.2–0.65s 柔和曲线） |

### 2.4 视觉系统改版需求（Dreamcore Romanticism）

| # | 模块 | 要求 | 状态 |
|---|---|---|---|
| V-1 | 色彩令牌迁移 | `@theme` 全量迁移（3.1.1 映射表已落地）；UI 层硬编码色值清零（终验 `70ffd18`：在用页面 0 处）。**core/data/utils 只读文件中的数据色值本轮不动——实测约 55 处**（`data/boyfriends.ts` 30、`utils/constants.ts` 16、`core/scoring.ts` 4、`core/avatarEngine.ts` 3、`core/analyticsEngine.ts` 2），判定规则为**文件路径白名单**（见附录 B-1），不以数量判断；留待下一轮数据层视觉专项 | ✅ 已完成（豁免层规则 v1.3 修正） |
| V-2 | 字体体系 | 4 个 @fontsource 包自托管（Fraunces 600/600i、Cormorant 500/500i、Plus Jakarta Sans 400/500/600/700、Petit Formal Script 400），四条字体栈变量，中文系统栈 | ✅ `c749208` |
| V-3 | 艺术字应用 | 5 个允许位置全部落地（Logo / Hero 主标题 / 章节分隔标题 / Script 副标语 / MatchPage 角色签名） | ✅ `bf5f781` |
| V-4 | 按钮形态 | 全站胶囊化 999px + Wine Glow 径向 + 1px #B45A78 内描边 + 玫瑰阴影（hover → glow；active → scale 0.96） | ✅ 已完成 |
| V-5 | 阴影体系 | `--shadow-rose-{sm,md,lg,glow}` 四档，黑色分量已移除 | ✅ `c749208` |
| V-6 | 装饰符号库 | **停车场**（方案 A 裁剪，见 CH-07） | 🅿️ 不实施 |
| V-7 | 氛围动效 | **停车场**（方案 A 裁剪，见 CH-07） | 🅿️ 不实施 |

### 2.5 明确超出范围（禁止实施）

以下事项**不属于**本次执行范围，Codex 不得顺手实施，防止范围蔓延：

1. P0 产品功能：同题双人回应体验、留下/换乘决策闭环、关系画像分享卡、漏斗埋点接入（属产品迭代线，另行排期）。
2. 停车场项（v1.3 正式确认，CH-07）：V-6 装饰符号库、V-7 氛围动效、D1-9 PageHeader 内边距、D5-6 方法论文档。**Codex 不得以"时间充裕"为由自行恢复这些项**。
3. 技术栈变更：核心技术方案已冻结（批 A 完成即冻结）；不换框架、不新增依赖（**尤其禁止引入 recharts**，见 CH-04）。
4. VR / 语音 / 换乘对比页面的开发（已隐藏，保持现状重定向即可）。
5. 登录、跨设备同步、数据库等 P1 功能。
6. 任何用户可见文案的修改（受 e2e 保护，见 B-5）。
7. core/data/utils 豁免层中约 55 处数据色值的修改（数据属性而非 UI 样式，留待数据层专项）。

---

## 3. 设计规范

### 3.1 视觉风格：执行 Dreamcore Romanticism 设计手册（已落地，本节转为 D4-5 QA 对照依据）

#### 3.1.1 色彩令牌迁移表（已随 `c749208` 落地为 `src/index.css` 现状）

| 语义角色 | token | 色值 | 状态 |
|---|---|---|---|
| 主行动色 | `--color-brand-500` | `#B45A78` 玫瑰酒红 | ✅ 已落地 |
| 主色浅域 | `--color-brand-100` / `--color-brand-200` | `#F5C6D6` 樱花粉 / `#FFD7E0` 花瓣粉 | ✅ 已落地 |
| 暖色背景 | `--color-cream-100`（`warm-*` 已重映射为桃色域） | `#FFE5D9` 奶油桃 | ✅ 已落地 |
| 冷色点缀 | `--color-mint-100` / `--color-mint-200`（accent 系已重映射为绿调） | `#B8E0D2` 薄荷云 / `#D4E4D4` 鼠尾草 | ✅ 已落地 |
| 金色点缀 | `--color-gold-300` | `#E6CFA7` 香槟金 | ✅ 已落地 |
| 主文字 | `--color-text-primary` | `#2D1B2E` 墨绒紫 | ✅ 已落地 |
| 辅文字 | `--color-text-secondary` | `#6B5A6B` 灰紫 | ✅ 已落地 |
| 弱文字 | `--color-text-tertiary` | `#B5A5B5` | ✅ 已落地 |
| 页面底色 | `--color-surface-50` / `--color-surface-100` | `#FBF7F4` Cloud White / `#F8F0E5` Paper Cream | ✅ 已落地 |
| 结构墨色 | `--color-ink` | `#2D1B2E` | ✅ 已落地 |

色彩硬规则（D4-5 QA 违例即不通过）：

- 界面中**禁止出现纯黑 `#000` 与纯白 `#FFF`**（分别以墨绒紫 / Cloud White 替代）；
- 阴影一律玫瑰色调 `rgba(180, 90, 120, α)` 四档（`--shadow-rose-*`，已落地）；
- 渐变仅允许三种：`gradient-brand` = Wine Glow（径向）、`gradient-accent` = Sky Blush、`gradient-warm` = Petal Mist；`text-gradient` = `#B45A78 → #F5C6D6`（均已落地）；
- `#root` 全局背景渐变为 Cloud White → Petal Pink 调（已落地）。

#### 3.1.2 字体体系（已落地）

四条字体栈：`--font-display`（Fraunces）/ `--font-serif`（Cormorant Garamond）/ `--font-sans`（Plus Jakarta Sans）/ `--font-script`（Petit Formal Script），全部以拉丁字体开头、中文系统栈收尾（中文情感文案回退系统楷体栈）。加载方式为 @fontsource 自托管（`src/main.tsx` 引入 9 个权重 css），禁止外链 Google Fonts，禁止下载中文 webfont。**D4-2 验收**：webfont 总传输量 ≤ 200KB（`npm run build` 后检查 `dist/assets/*.woff2` 体积合计）。

#### 3.1.3 组件形态（已落地，QA 对照）

- 按钮全部胶囊 `border-radius: 999px`；主 CTA = Wine Glow 径向 + 1px `#B45A78` 内描边 + shadow-rose-md（hover → glow + 亮度 +10%；active → scale 0.96）。
- 卡片圆角阶梯：大卡 24px / 中卡 16px（`card` utility 24px）。
- 艺术字仅 5 处（Logo / Hero 主标题 / 章节分隔标题 / 情感卡片标语 / 角色签名），禁止出现在按钮、表单、错误提示、价格、日期。
- 图标：lucide-react，1.5–2px 描边，激活 `#B45A78`，默认墨绒紫。
- 对话气泡：角色消息（左）Paper Cream 底 + 酒红描边；用户消息（右）酒红渐变底 + Cloud White 文字。

### 3.2 断点设置（不变）

`lg`（1024px）是"移动形态 ⇄ 桌面形态"的唯一分界线：导航形态、StatusBar 显隐、AppShell 容器宽度三者在 `lg` 同时切换（已实现，D4-4 验收横跳安全）。

### 3.3 布局结构规范（不变，已实现）

桌面端：SideNav 240px + 内容区 `max-w-6xl mx-auto px-8`；平板（md–lg）居中 672px 容器 + BottomNav；手机（<md）功能行为维持现状。圆角阶梯与玫瑰四档阴影全端统一。

### 3.4 用户体验要求（不变）

1. 移动端功能零回归（375px 下交互流程、文案、可用性不变）——e2e-onboarding 持续通过即为判据。
2. 低决策疲劳：单一页面同时呈现卡片数不超过 6。
3. 内容优先级：主行动元素始终视觉第一层级。
4. 渐进披露：聊天页 xl 信息栏默认展示，xl 以下隐藏不得以浮层替代（已实现）。
5. 文案不变（B-5 保护清单）。
6. 对比度：正文墨绒紫（Cloud White 底 ≈ 13:1）；灰紫仅辅助文字；CTA 白字按大号粗体 ≥ 3:1（D4-2 Lighthouse Accessibility ≥ 90 验证）。

---

## 4. 验收标准

### 4.1 各页面响应式表现验收矩阵（v1.3：附执行方与执行路径）

| 验收项 | 执行方 | 执行路径 |
|---|---|---|
| 4.1 矩阵（8 页 × 375/768/1440/1920 无水平滚动/无重叠/无截断/交互可完成） | **Codex** | `npm run preview -- --host 127.0.0.1` 后运行 `node tests/e2e-desktop-responsive.mjs`（已有）+ D1-8 截图脚本补齐（见 6 章 D1-8-R）；playwright 截图代替 DevTools 手动模拟 |
| 4.2 浏览器兼容矩阵 | **监督人为主**（真机 iOS/Android、Safari 手测），Codex 辅助（Chromium 系已由 e2e 覆盖） | 方案 A 降级版：Chrome（e2e 已覆盖）+ Safari 15（监督人手测 100dvh/字体/focus-visible/backdrop-filter 四点）；Edge/Firefox 记入已知问题延后 |
| 4.3 Lighthouse 四项分数 | **Codex** | `npx lighthouse http://127.0.0.1:4173/ --preset=perf --form-factor=mobile --screenEmulation.mobile --output=json --output-path=docs/evidence/after/responsive/lighthouse-mobile.json`（桌面同理）；`npx lighthouse` 属一次性 CLI 调用，不写入 package.json（B-3 约束） |
| 4.4 三件套门禁 | **Codex** | lint → build → 两套 e2e（`e2e-onboarding.mjs` + `e2e-desktop-responsive.mjs`），每任务完成前必跑 |

### 4.2 浏览器兼容性要求（方案 A 降级版）

| 平台 | 浏览器 | 执行方 | 必测点 |
|---|---|---|---|
| macOS | Chrome ≥ 100 | Codex（e2e 已覆盖） | 全量 |
| macOS | Safari ≥ 15 | 监督人 | 100dvh 回退、backdrop-filter、focus-visible、woff2 渲染 |
| iOS | Safari 15 | 监督人（真机） | 视口、BottomNav 安全区、输入框聚焦缩放、楷体回退 |
| Windows | Edge / Firefox | 🅿️ 延后 | 记入已知问题（方案 A 裁剪，R11 预案授权） |

### 4.3 性能指标（不变，附 CLI 测量路径）

| 指标 | 目标值 | 测量方式（执行方：Codex） |
|---|---|---|
| 主入口 JS（未压缩） | < 300 KB（当前 237.64 KB，**不得再恶化超 15%**） | `npm run build` 输出 |
| 主入口 JS（gzip） | < 90 KB（当前 76.47 KB） | 同上 |
| 单路由异步 chunk | < 20 KB（当前全部达标） | 同上 |
| Webfont 传输量 | ≤ 200 KB | `ls -la dist/assets/*.woff2 | awk '{sum+=$5} END {print sum}'` |
| 首屏图片传输总量 | < 1.5 MB | DevTools Network（监督人抽查可选） |
| Lighthouse Performance（移动 375 / 桌面 1440） | ≥ 85 / ≥ 90 | lighthouse CLI（见 4.1） |
| Lighthouse A11y / Best Practices / SEO | 各 ≥ 90 | 同上 |
| LCP / CLS | < 2.5s / < 0.1 | 同上 |
| 控制台错误 | 0（两套 e2e consoleErrors 断言） | e2e |

### 4.4 质量门禁（每个任务"完成"的定义，不变）

```bash
npm run lint                                  # 0 error 0 warning
npm run build                                 # 成功，且主 JS 体积在目标内
npm run preview -- --host 127.0.0.1 &         # 端口 4173（注意必须 --host 127.0.0.1，
                                               # vite preview 默认仅绑 IPv6，e2e 连 127.0.0.1 会拒连）
node tests/e2e-onboarding.mjs                 # 全流程通过
node tests/e2e-desktop-responsive.mjs         # 响应式骨架通过
```

外加：该任务涉及页面在 375px 与 1440px 两档截图，存入 `docs/evidence/after/responsive/`，命名 `<页面名>-<宽度>.png`。

---

## 5. 部署上线要求

### 5.1 部署环境（不变）

| 项 | 值 |
|---|---|
| 平台 | Netlify（现有 `netlify.toml`，勿改动其 build/redirects 配置） |
| 构建命令 | `npm run build` |
| 发布目录 | `dist` |
| Functions | `netlify/functions/chat.mjs`（已有，勿改） |
| SPA 回退 / API 代理 | 已配置，无需新增 |

### 5.2 环境变量（**执行方：监督人**——v1.3 修正，消除 v1.2 中 D5-2 与 R6 的矛盾）

| 变量 | 必填 | 说明 | 执行方 |
|---|---|---|---|
| `DEEPSEEK_API_KEY` | 是 | 仅服务端，绝不 `VITE_` 前缀，绝不入 Git | **监督人**在 Netlify 后台 Site settings → Environment variables 配置 |
| `DEEPSEEK_MODEL` | 否 | 默认 `deepseek-v4-flash` | 监督人（可选） |
| `DEEPSEEK_API_URL` | 否 | 默认官方地址 | 监督人（可选） |

**边界条件**：Codex 无 Netlify 后台权限，**不得尝试**通过任何方式配置或猜测环境变量；发现变量缺失时在日报记录并等待监督人处理（R6 条款：密钥 24h 内无法取得则站点照常发布、AI 验收顺延记日报）。

### 5.3 上线流程（Day 5 = 9/2 执行）

```
Step 1  确认 main 分支包含全部已验收代码，本地三件套门禁全绿          [Codex]
Step 2  Netlify 后台配置环境变量（5.2），触发重新部署                  [监督人]
Step 3  打开生产 URL 执行「生产冒烟清单」（5.4）                       [监督人 + Codex（可脚本化项）]
Step 4  冒烟全过 → 标记上线成功；任一失败 → 回滚（5.6）并修复          [监督人决策，Codex 修复]
Step 5  更新 docs/baseline.md 达成状态，写入当日日报                    [Codex]
```

### 5.4 发布前检查清单（生产冒烟，逐项打勾；执行方标注）

- [x] 生产 URL 打开落地页正常渲染（玫瑰酒红主色 + Cloud White 底 + 衬线标题），无控制台错误【监督人】
- [x] 375px 与 1440px 下导航形态正确切换（BottomNav ⇄ SideNav）【监督人，可用 DevTools 响应式模式】
- [x] 完整走通：三道题 → 顾怀瑾 90% 匹配 → 首次相遇【监督人】
- [x] 发送一条自由文本，收到真实 DeepSeek 回复，页面无"DeepSeek 暂时未连接"降级横幅【监督人】
- [x] Netlify Function 日志中无聊天正文、无 API 密钥泄露【监督人】
- [x] 刷新页面后聊天记录仍在（本地持久化正常）【监督人】
- [x] 旧链接 `/vr`、`/voice`、`/compare` 均重定向回 `/home`【Codex 可用 playwright 验证】
- [x] Lighthouse 生产 URL 移动端四项分数达标（4.3）【Codex，lighthouse CLI】
- [x] DeepSeek 预算复核节点已在后台（或人工台账）标注：50 元 / 100 元 / 135 元（总上限 150 元）【监督人】

### 5.5 发布纪律（v1.3 时间线更新）

- **代码冻结**：9/1 18:00 后页面级视觉调整停止；**9/2 12:00 后仅允许修复阻断性问题**（冒烟清单失败项），不接受任何新布局或视觉调整。
- 每次生产变更必须先经过 Netlify Deploy Preview 验证再发布。

### 5.6 回滚方案（不变）

首选：Netlify 后台 Deploys → 上一个绿色部署 → Publish deploy。备选：`git revert` 后推送。回滚后重跑 5.4 冒烟第 1、4、6 三项。

---

## 6. 任务排期（v1.3：完成态冻结 + 剩余重排 8/29–9/2）

### 6.1 已完成任务（事实记录，**禁止重复实施**）

| 任务 | commit | 验收证据 |
|---|---|---|
| D1-0 环境准备 | `d6764eb` | playwright ^1.62.1 + 4 @fontsource 在 package.json；两份日报补齐 |
| D1-1 色彩令牌迁移 | `c749208` + `70ffd18` | @theme 全量 Dreamcore；UI 在用页面 hex 清零（grep 复验） |
| D1-2 字体接入 | `c749208` | 四字体栈 + 9 权重 css；build 含 woff2 |
| D1-3 AppShell 双形态 | `711de06` | 1440 无手机壳（e2e 断言） |
| D1-4 SideNav | `711de06` | 1440 可见 + 5 项跳转 + 全屏路由隐藏（e2e 断言） |
| D1-5 BottomNav/StatusBar lg:hidden | `711de06` | e2e 断言（375 可见/1440 隐藏） |
| D1-6 交互层 + MotionConfig + 100dvh | `711de06` | index.css :focus-visible + hover:hover；App.tsx MotionConfig；ChatPage viewport-full |
| D1-7 按钮胶囊化 | `c749208`~`58e5227` | 全站 CTA 胶囊 + Wine Glow |
| D2-1 落地页视觉升级 | `bf5f781` | 截图 landing-1440.png |
| D2-2 SetupPage 视觉升级 | `bf5f781` | e2e 三道题流程通过 |
| D2-3 MatchPage 浅色重构 | `bf5f781` | 截图 match-1440/375.png；e2e「修改答案」「90%」断言通过 |
| D3-1~D3-5 五页响应式+新视觉 | `58e5227` | 截图 home/report/settings/swap/chat；e2e 响应式骨架通过 |
| D1-8 响应式截图基线 | `bc584bf` + `a847c5c`（8/29 检查点） | ✅ 24/24 张标准断点截图，另有 `chat-1920.png`；8/29 同步修复 5 张误命名/过期证据；`tests/capture-responsive-evidence.mjs` 可复验 |
| D4-3-R 三档主流程 e2e | `17df882`（8/29 检查点） | ✅ 320/768/1440 三档 onboarding 全 PASS，console/page error = 0 |
| D4-4 viewport 横跳测试 | `17df882`（8/29 检查点） | ✅ 999↔1025px 横跳 10 轮 PASS；SideNav/BottomNav 互斥、无 tabIndicator 残影 |
| D4-6 桌面视口 e2e | `bc584bf` | tests/e2e-desktop-responsive.mjs PASS |
| D4-1-R Safari 兼容四点 | 随 `[D5-1]` 归档（2026-09-03 补执行） | ✅ Playwright WebKit 自动化四点全 PASS；报告：`docs/2026-09-03-d41r-safari-test-report.md`；证据：`docs/evidence/after/safari/` |
| D2-4 冻结前技术验证 | 被 D4 整体取代（方案 A） | — |
| D1-9 / D3-6 / D4-7 / D5-6 | 🅿️ 停车场（CH-07） | 不实施 |

### 6.2 剩余任务排期（8/29 – 9/2，每项附执行方 / 验收标准 / 边界条件）

**8/29（周六）· 证据补齐 + 自动化验收收尾** —— 全部【执行方：Codex】

| 任务 | 内容 | 验收标准 | 边界条件 |
|---|---|---|---|
| D1-8-R 截图补齐 | 补拍 14 张缺口截图：setup-375/768/1440、chat-375/768/1440（另有 1920 证据）、swap-768/1440（已有 375）、settings-375/768（已有 1440）、match-768（已有 375/1440）、landing-375/768（已有 1440）、report-768（已有 375/1440） | `docs/evidence/after/responsive/` 达到 8 页 × 3 档完整覆盖（24 张，另保留 chat-1920）；命名 `<页面>-<宽度>.png`；chat/match 页需先在同一浏览器上下文走完 setup 流程再截图（localStorage 状态依赖，参考 e2e-desktop-responsive.mjs 的做法） | 用 playwright 截图脚本（可放 `tests/` 或临时脚本，不新增依赖）；截图前等待 900–1600ms 动画收尾；不修改任何 src/ 文件 |
| D4-3-R e2e 全断点回归 | 在 320/768/1440 三档重跑 `e2e-onboarding.mjs` 主流程（参数化 viewport，临时运行不落盘新增用例） | 三档全 PASS，console 错误 0 | 只改运行参数不改脚本断言；若 320 出现水平溢出，修复仅限 CSS 层且过三件套门禁 |
| D4-4 viewport 横跳测试 | playwright 脚本：viewport 在 999↔1025px 循环切换 10 次，检查 SideNav/BottomNav 无同时可见、tabIndicator 无残影 | 10 次循环后 DOM 断言通过（SideNav 与 BottomNav 互斥、无孤儿 layoutId 元素） | 若 I-7 残影出现，允许将 tabIndicator 从 layoutId 降级为条件渲染（I-7 预案）；脚本可并入 e2e-desktop-responsive.mjs |

**8/29 执行结果（2026-08-29 更新，2026-08-30 v1.4 补注 commit 证据）**

| 任务 | 状态 | 结果与证据 |
|---|---|---|
| D1-8-R | ✅ 已完成（`a847c5c`） | `docs/evidence/after/responsive/` 共 25 张：8 页 × 375/768/1440 = 24 张，另有 `chat-1920.png`；`tests/capture-responsive-evidence.mjs` 可复验 |
| D4-3-R | ✅ 已完成（`17df882`） | 320/768/1440 三档首次体验全 PASS；情景题、顾怀瑾 90% 匹配、首次见面与无水平溢出断言通过；console/page error = 0 |
| D4-4 | ✅ 已完成（`17df882`） | 999↔1025px 横跳 10 轮 PASS；SideNav/BottomNav 始终互斥，移动 tabIndicator 在桌面形态不可见 |
| 质量门禁 | ✅ 已完成 | Lint 0 error；Build 成功；主 JS 237.64KB / gzip 76.48KB；woff2 161.18KB；三套 e2e 均 PASS（监督人 8/29 22:43 独立复验通过） |

**8/30（周日）· 晚间冲刺（v1.4 重排：白天窗口空转，22:40 启动；执行细节见 `docs/2026-08-30-prd-evening-sprint.md`）**

| 任务 | 执行方 | 内容 | 验收标准 | 边界条件 |
|---|---|---|---|---|
| D4-2 Lighthouse 达标 | Codex | lighthouse CLI 跑移动/桌面两档（命令见 4.1），输出 JSON 存 `docs/evidence/after/responsive/` | Performance 移动 ≥ 85 / 桌面 ≥ 90；A11y/BP/SEO ≥ 90；LCP < 2.5s；CLS < 0.1 | 优化手段限于：图片懒加载复核、CLS 复核、按需微调；**不得**引入新依赖或改动 core 层；**今晚只测量与登记，不达标项不在深夜抢修**，统一转 8/31 修复循环（防疲劳作战引入回归）；连续 2 轮不达标 → 触发 M3 fail-fast（砍优化范围、问题记 baseline.md 待办，见 7 章 R11 更新） |
| D4-1-R 跨浏览器（降级版） | 监督人 | Safari 15 手测四点（100dvh / backdrop-filter / focus-visible / woff2）+ iOS 真机抽查（视口/安全区/输入缩放） | 四点通过，记录于日报；发现的问题转 Codex 修复 | 今晚或 8/31 上午完成即可（v1.4 顺延授权）；Edge/Firefox 延后（方案 A 授权）；Codex 侧 Chrome 已由 e2e 覆盖 |
| 冻结检查点 | 监督人 | ~~18:00 检查~~ → **顺延至 8/31 18:00**（8/30 18:00 未执行） | D4-2 + 8/31 修复循环全绿 → 页面级视觉冻结生效；未绿 → 继续 8/31 修复日处理 | 9/1 18:00 页面级视觉冻结节点不变 |

**8/30 执行结果（2026-08-30 更新）**

| 任务 | 状态 | 结果与证据 |
|---|---|---|
| D4-2 Lighthouse | ✅ 测量完成（9/12 达标，3 项转 8/31 修复） | 移动端 92/95/100/83，LCP 3.23s、CLS 0；桌面端 100/95/100/83，LCP 0.74s、CLS 0.0003；证据：`docs/evidence/after/responsive/lighthouse-mobile.json`、`docs/evidence/after/responsive/lighthouse-desktop.json` |
| D4-1-R 跨浏览器 | ✅ 2026-09-03 补执行完成 | Playwright WebKit 自动化四点全 PASS；报告：`docs/2026-09-03-d41r-safari-test-report.md`；证据：`docs/evidence/after/safari/` |
| 冻结检查点 | ⏳ 顺延至 8/31 18:00 | D4-2 修复循环全绿后由监督人判定页面级视觉冻结是否生效 |

**8/31（周一）· 缓冲与修复日（v1.4：吸收 8/30 顺延项）** —— 视 D4 结果动态分配

| 任务 | 执行方 | 内容 | 边界条件 |
|---|---|---|---|
| 修复循环 | Codex | 处理 8/30 Lighthouse 不达标项 + Safari 兼容项 + e2e 失败项（如有），每项一 commit | 修复仅限 CSS/组件层；每项修完重跑三件套 + 复测 Lighthouse 对应档位 |
| D4-5 设计 QA 过检 | 监督人 | 按手册第 8 章 10 项清单逐页过检（⑧装饰项随 V-6 豁免）；证据存 `docs/evidence/after/responsive/design-qa/`（新建目录，截图+清单勾选记录） | Codex 职责：准备过检材料（各页 375/1440 截图已归档）并按监督人结论执行样式修复；主观判定权在监督人 |
| 冻结检查点（顺延） | 监督人 | 18:00 检查：D4-2 与修复循环是否全绿 | 全绿 → 页面级视觉冻结生效 |

**8/31 执行结果（2026-08-31 更新）**

| 任务 | 状态 | 结果与证据 |
|---|---|---|
| R1 · SEO | ✅ 已完成（`a53d81c`） | meta description 与有效 `public/robots.txt` 已落地；SEO 移动/桌面均由83→100。复测：移动90/95/100/100、LCP 3.291s、CLS 0；桌面100/95/100/100、LCP 0.715s、CLS 0.000020 |
| R2 · 移动端 LCP | ✅ 按 M3 fail-fast 收口（`4372442`） | A-4 静态导入因主包366.15KB撤销，采用 A-4' 预载 + A-5 首屏动画去渐隐；主 JS 237.65KB。复测：移动91/95/100/100、LCP 3.229s、CLS 0；桌面100/95/100/100、LCP 0.699s、CLS 0.000345。LCP 仍高于2.5s，已记 `docs/baseline.md` 且不阻塞 D4-2 |
| R3 · 对比度 | ✅ 已完成（`9b98ab5`） | 三步骤编号由实际 `text-brand-500` 改用既有 `text-text-secondary`；移动端 Accessibility 95→100，`color-contrast` 审计0→1、失败元素3→0；复测90/100/100/100、LCP 3.263s、CLS 0 |
| 质量门禁 | ✅ 全绿 | R2/R3 均为 Lint 0/0、Build 成功（主 JS 237.65KB）、三套 e2e PASS，含320/768/1440主流程与999↔1025px横跳10轮 |
| D4-5 设计 QA | ⏳ 待监督人确认 | 375/1440页面证据已具备；当前无独立过检完成证据，不提前记为完成 |
| 冻结检查点 | ⏳ 待监督人18:00拍板 | 自动化材料全绿；移动 LCP 已按 M3 fail-fast 收口，页面级视觉冻结是否生效仍由监督人判定 |

**9/1（周二）· 最终门禁 + 全量归档** —— 【执行方：Codex】

| 任务 | 内容 | 验收标准 |
|---|---|---|
| D5-1 最终门禁 | 三件套 + 两套 e2e + 9 档宽度截图全量复核（320/375/390/768/834/1024/1280/1440/1920，8 页全过 `scrollWidth <= innerWidth`） | 全绿；截图目录完整；18:00 页面级视觉调整截止 |

**9/1 执行结果（2026-09-03 补执行）**

| 任务 | 状态 | 结果与证据 |
|---|---|---|
| D5-1 最终门禁 | ✅ 补执行完成 | Lint 0 error / 0 warning；Build 成功（主 JS 237.65KB / gzip 76.5KB）；三套 e2e 全 PASS；9档 × 8页零溢出矩阵72/72 PASS。证据：`docs/evidence/after/responsive/matrix/` |
| D4-1-R Safari 兼容四点 | ✅ 补执行完成 | Playwright WebKit 自动化检查 100dvh、backdrop-filter、focus-visible、woff2 四点全 PASS。报告：`docs/2026-09-03-d41r-safari-test-report.md`；证据：`docs/evidence/after/safari/` |
| 归档结论 | ✅ 收口 | I-6 与 D4-1-R 均有可复核证据；计入 D4-1-R 与 D5-1 后，PRD 有效任务进度校正为24/28；全量代码冻结保持生效 |

**9/2（周三）· 部署上线**

| 任务 | 执行方 | 内容 | 验收标准 |
|---|---|---|---|
| D5-2 环境变量 | **监督人** | Netlify 后台配置 `DEEPSEEK_API_KEY`（5.2），触发重新部署 | 部署成功；12:00 全量代码冻结生效 |
| D5-3 生产冒烟 | 监督人 + Codex | 5.4 清单 9 项逐项打勾（可脚本化项由 Codex 用 playwright/lighthouse CLI 执行） | 9/9 通过；任一失败 → 5.6 回滚 |
| D5-4 预算台账 | 监督人 | DeepSeek 用量标注 50/100/135 元三级节点 | 台账就位 |
| D5-5 文档收尾 | Codex | 更新 `docs/baseline.md` 对比目标状态 + 9/2 日报 | 文档更新完成 |

**9/3–9/4 执行结果（2026-09-04 收尾更新）**

| 任务 | 状态 | 结果与证据 |
|---|---|---|
| D5-2 环境变量 | ✅ 已完成 | `DEEPSEEK_API_KEY` 存在；`DEEPSEEK_MODEL=deepseek-v4-flash`；API URL留空；All deploy contexts；生产为Published |
| D5-3 生产冒烟 | ✅ 9/9通过 | 初测发现聊天刷新崩溃与导航闭环两项P0，经A-6热修复提交`fbe8d00`后，监督人与Codex独立复验均通过；生产证据：`docs/evidence/production/` |
| D5-4 预算台账 | ✅ 已完成 | 当前累计0.02元；50/100/135元三级节点已建立；总预算上限150元 |
| D5-5 文档收尾 | ✅ 已完成 | 上线基线、9/3日报、主PRD状态与生产证据随本次`[D5-5]`提交归档 |
| 有效任务进度 | ✅ 28/28 | 8/29后20/28，依次计入D4-2、D4-5、D4-1-R、D5-1、D5-2、D5-3、D5-4、D5-5，共28/28；停车场项不计入有效任务 |
| 上线判定材料 | ✅ 满足条件 | 生产冒烟9/9、Lighthouse四项达标、真实AI回复与刷新持久化通过；正式上线结论由监督人确认 |

**每日交付纪律（不变）**：
1. 每日收工将进展、阻塞、次日计划写入 `docs/daily/YYYY-MM-DD.md`。
2. 当日 P0 任务未完成 → 必须在日报"阻塞"小节写明原因与补救方案，禁止静默延期。
3. **当日无日报 = 当日任务自动判定未完成**（v1.3 新增，方案 A R-6 条款）；监督人次日 10:00 前介入。
4. 截图证据统一入 `docs/evidence/after/responsive/`。

---

## 7. 风险预案（v1.3 状态更新）

| # | 风险 | 概率 | 影响 | v1.3 状态 | 应对方案 |
|---|---|---|---|---|---|
| R1 | 移动端功能回归 | 中 | 高 | 活跃 | 每日三件套 + e2e-onboarding；回归优先于一切视觉优化 |
| R2 | 冻结后发现布局方案不可行 | — | — | **已解除** | 批 A 已完成并验收，布局方案（令牌层+容器双形态+lg 前缀）已被实践验证 |
| R3 | layoutId 跨断点残影 | 低 | 中 | ✅ 8/29 验收关闭 | 999↔1025px 循环 10 次未复现；I-7 降级预案保留 |
| R4 | Recharts 高度塌陷 | — | — | **作废（CH-04）** | 项目无 recharts；报告页为纯 CSS 实现，无此风险 |
| R5 | Safari 15 兼容 | 中 | 中 | 活跃 | I-5 @supports 回退已实施；D4-1-R 监督人手测四点 |
| R6 | 密钥未及时配置 | 中 | 高 | 活跃 | D5-2 执行方已明确为监督人；24h 不可得则站点照常发布、AI 验收顺延记日报 |
| R7 | DeepSeek 预算超支 | 低 | 高 | 活跃 | 50/100/135 三级复核；触顶暂停公开调用 |
| R8 | 范围蔓延 | 中 | 高 | 活跃 | 附录 B 硬约束 + 每日 diff 审查；**特别注意：不得引入 recharts、不得恢复停车场项** |
| R9 | 主 JS 体积恶化 | 低 | 中 | 活跃 | 当前 237.64KB；剩余阶段禁止新增依赖 |
| R10 | Netlify 构建失败 | 低 | 中 | 活跃 | 核对 netlify.toml 未动；失败超 2 次启用 5.6 回滚 |
| R11 | 工期溢出 | 中 | 高 | **重新活跃（v1.4 更新）** | 8/30 白天窗口损失由 8/31 缓冲日吸收（晚间冲刺压缩 D4-2 为纯测量）；9/1 18:00 视觉冻结与 9/2 12:00 全量冻结节点不变；若 8/31 修复量超预期 → 按 M3 fail-fast 砍优化范围保 D5 上线主线 |
| R12 | 误下中文 webfont | 低 | 高 | 活跃 | B-2 硬约束不变 |
| R13 | 外链字体 CDN | 低 | 中 | 活跃 | 已自托管（合规）；保持禁止外链 |
| R14 | 新底色对比度不足 | 中 | 中 | 活跃 | D4-2 Lighthouse A11y ≥ 90 验证；不足则加深渐变终止色 |
| R15 | MatchPage 重构破坏 e2e | — | — | **已解除** | bf5f781 重构完成，e2e 全断言通过 |
| RN-1 | 顺延期需求漂移 | 中 | 中 | 活跃（v1.3 新增） | 9/1 18:00 后仅接受 P0 缺陷；新想法一律入停车场（写入日报固定小节） |
| RN-2 | 交接误操作破坏已完成成果 | 中 | 高 | 活跃（v1.4 更新） | 新 Codex 会话必须从本文档 v1.4 启动（6.1 完成态冻结 + 阅读指引）；8/30 晚间会话优先按 `docs/2026-08-30-prd-evening-sprint.md` 执行；严禁从 v1.2/v1.3 或旧日报推断任务状态 |

---

## 8. 附录

### 附录 A · 代码资产地图（v1.3 更新至基线 `7f757ad`）

```
src/
├── App.tsx / main.tsx                # 入口（MotionConfig 已挂 / @fontsource 9 权重已引入）
├── routes/index.tsx                  # 全部路由与懒加载（勿改路由路径）
├── components/
│   ├── ProductRuntime.tsx            # 匿名会话引导（勿动）
│   ├── decorations/                  # 不存在（V-6 停车场，勿创建）
│   └── layout/
│       ├── AppShell.tsx              # ✅ 双形态容器已实现
│       ├── SideNav.tsx               # ✅ 已存在（v1.2 标"新建"已过时）
│       ├── BottomNav.tsx             # ✅ lg:hidden + token 化已实现
│       ├── StatusBar.tsx             # ✅ lg:hidden 已实现
│       └── PageHeader.tsx            # D1-9 停车场，勿动
├── pages/                            # ✅ 8 个在用页面全部完成新视觉+响应式
│                                     #    （VRPage/VoiceCallPage/ComparePage 已隐藏重定向，勿动）
├── index.css                         # ✅ @theme Dreamcore 令牌 + 玫瑰阴影 + viewport-full 等 utility
├── core/                             # ★ 业务引擎，禁止改动（B-1）
├── stores/                           # Zustand 状态，禁止改动
├── services/chatApi.ts               # AI 请求封装，禁止改动
└── utils/constants.ts                # TAB_CONFIG（SideNav 已复用）

tests/
├── e2e-onboarding.mjs                # 375×812 主流程 e2e（PASS）
├── e2e-desktop-responsive.mjs        # ✅ 桌面/平板/移动骨架 e2e（PASS；8/29 修复移动截图时机）
├── e2e-responsive-quality.mjs        # ✅ 320/768/1440 主流程 + 999↔1025 横跳门禁
└── capture-responsive-evidence.mjs   # ✅ 响应式证据生成器（含状态依赖页面）

netlify/functions/chat.mjs            # DeepSeek 代理（禁止改动）
docs/BONDSHIFT-UI-Design-Prompts.md   # ★ 视觉唯一权威来源
docs/baseline.md                      # 质量基线（D5-5 更新）
docs/evidence/after/responsive/       # ✅ 24/24 张标准断点截图 + chat-1920，共 25 张
deliverables/product-strategy/        # 审计报告与终审报告（参考文档，勿删）
```

### 附录 B · Codex 硬性执行约束

1. **改动白名单**：只允许修改 `src/components/layout/*`、`src/pages/*`、`src/index.css`、`src/App.tsx`、`src/main.tsx`、`index.html`（仅 theme-color meta）、`tests/`（e2e 用例新增与参数化）、`scripts/`（**v1.3 新增许可**：仅允许 node 内置模块的检查/截图脚本，如日报检查脚本）、`docs/`（日报与证据）。`src/core/`、`src/stores/`、`src/services/`、`src/data/`、`src/utils/constants.ts`（MBTI 色等 55 处数据色值）、`netlify/`、`netlify.toml` 一律只读。**package.json/package-lock.json**：v1.2 白名单未列但 D1-0/D1-2 需要改动，此历史矛盾 v1.3 澄清——依赖变更已随批 A 完成（`d6764eb`），**剩余阶段禁止再动**（任何新依赖需求必须停下询问监督人）。
2. **视觉执行边界**：视觉以 `docs/BONDSHIFT-UI-Design-Prompts.md` 为唯一权威；色彩只能引用 3.1.1 token（禁止表外色值、禁止纯黑纯白）；字体只用四条字体栈（中文系统栈、楷体签名栈除外）；艺术字仅限 5 个允许位置；动效 ≤ 600ms 且尊重 reducedMotion；禁止外链字体 CDN、禁止下载中文字体；**禁止引入 recharts**（CH-04）。
3. **依赖白名单**：全部依赖变更已完成（playwright + 4 个 @fontsource）。剩余阶段**零新增依赖**；`npx lighthouse` 等一次性 CLI 调用不视为依赖变更（不写入 package.json）。
4. **构建与测试命令**：
   - 门禁：`npm run lint` → `npm run build`
   - e2e：先 `npm run preview -- --host 127.0.0.1`（**必须带 --host**，默认仅 IPv6 会导致 127.0.0.1 拒连），另开终端 `node tests/e2e-onboarding.mjs` 与 `node tests/e2e-desktop-responsive.mjs`
5. **受 e2e 保护的文案（禁止修改）**："开始陪伴测试"、"下一题"、"查看我的陪伴匹配"、"修改答案"、"和 顾怀瑾 初次见面"、"重试真实 AI"、"为什么适合"、"90%"，以及三道题的选项文案与标题。
6. **提交纪律**：每个任务编号一个 commit，message 格式 `[D<天数>-<编号>] 摘要`（补遗类可用 `[D1-1 补遗]` 格式，见 `70ffd18` 先例）。
7. **遇到歧义**：以本文档为准，视觉细则以设计手册为准；两文未覆盖的实现细节按"最小改动 + 新设计语言惯例"自行决策并记录在当日日报；涉及 2.5 范围外内容或 B-1/B-3 白名单外改动时必须停下询问监督人。
8. **基线纪律（v1.3 新增）**：任何新会话开始前先 `git log --oneline -10` 确认基线包含 `7f757ad`；若发现工作树与本文档 6.1 完成态不符（如 @theme 不是 Dreamcore 令牌、SideNav 不存在），**立即停止并询问监督人**，不得自行"修复"。

---

*v1.0 → v1.1 → v1.2 变更摘要见 git 历史与文档历史版本。*

*v1.2 → v1.3 变更摘要（2026-08-28 交付前终审后）：① **基线更新**——全文现状描述由「Codex 未开工的 5f24923」更新为「批 A/批 B 完成的 7f757ad」，19/33 任务标注 commit 证据，6.1 完成态冻结禁止重复实施；② **时间线顺延（方案 A）**——窗口 8/27–9/2，冻结改事件驱动（批 A 已完成即核心技术方案冻结；页面级视觉宽限至 9/1 18:00；9/2 12:00 全量冻结）；③ **V-1 事实修正**——core/data 豁免层「约 10 处」→「实测 55 处」，判定规则改为文件路径白名单；④ **Recharts 失实断言删除**——1.1/2.1/R4 修正，禁止引入该依赖；⑤ **人工任务执行主体标注**——D4-1/D4-5/D5-2 归监督人，可 CLI 化验收项给出命令路径，消除 v1.2 的 D5-2/R6 矛盾；⑥ **剩余任务重排**——8/29–9/2 逐日排期，每项附执行方/验收标准/边界条件；⑦ **停车场正式化**——D1-9/D3-6/D4-7/D5-6 不实施；⑧ **新增 0 章变更记录与 8/28 时间线、RN-1/RN-2 风险、B-7/B-8 基线纪律、preview --host 说明**。*
