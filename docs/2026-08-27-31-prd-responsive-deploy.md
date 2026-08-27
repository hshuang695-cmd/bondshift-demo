# BONDSHIFT 响应式开发与部署上线 PRD

| 项目 | 内容 |
|---|---|
| 文档版本 | v1.1（2026-08-26 修订：视觉规范由 v1.0 的"沿用现有 tokens"改为"执行 BONDSHIFT-UI-Design-Prompts.md 设计手册"，同步调整需求范围、设计规范、验收标准、排期与风险） |
| 执行窗口 | 2026 年 8 月 27 日 — 8 月 31 日（共 5 个工作日） |
| 执行者 | Codex（AI 编码代理） |
| 监督人 | 产品负责人（本文档作者） |
| 代码仓库 | 本地仓库 `/Users/huangshuang/Desktop/first-cc/bondshift` |
| 视觉设计依据 | `docs/BONDSHIFT-UI-Design-Prompts.md`（Dreamcore Romanticism 设计语言 v1.0，**视觉唯一权威来源**） |
| 部署目标 | Netlify 站点 `bondshift-demo`（配置已存在于 `netlify.toml`） |
| 技术方案冻结日 | **2026 年 8 月 28 日 18:00 后不得更换任何核心技术方案**（引自 `docs/technical-decisions.md`） |

> **Codex 阅读指引**：本文档是唯一需求来源。第 2 章定义"做什么"（含 2.4 视觉系统改版需求），第 3 章定义"长什么样"（视觉细则以 `docs/BONDSHIFT-UI-Design-Prompts.md` 为唯一权威，两文冲突时以设计手册为准），第 4 章定义"怎样算完成"，第 6 章定义"每天做什么"，第 8 章附录 A/B 是你必须遵守的硬性约束。凡本文档未提及的功能一律不做（见 2.5 超出范围清单）。

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
- 技术栈：React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Framer Motion 12 + Zustand 5 + react-router-dom 7 + Recharts 3 + lucide-react。

### 1.2 现状问题（本次改造的直接动因）

| # | 问题 | 代码位置 |
|---|---|---|
| 1 | **AppShell 容器锁定 `max-w-[430px]`，桌面端（≥1024px）显示为居中"手机壳"**，两侧大量留白，未提供真正的桌面体验 | `src/components/layout/AppShell.tsx` 第 31 行 |
| 2 | StatusBar 是模拟手机状态栏（时间+信号+电量），在桌面端无意义且显假 | `src/components/layout/StatusBar.tsx` |
| 3 | 仅 BottomNav 一种导航形态，桌面端无侧边导航 | `src/components/layout/BottomNav.tsx` |
| 4 | 所有页面按单列移动布局编写，未使用 Tailwind 响应式前缀做桌面布局 | `src/pages/*.tsx` |
| 5 | 交互仅依赖 `:active` 触摸反馈，桌面端无 hover 态 | 全局 |
| 6 | 生产环境 DeepSeek 密钥尚未配置，真实调用未做生产冒烟验收 | Netlify 环境变量 |
| 7 | 现有视觉为基础粉色系（brand-500 `#e8547c` + Inter 字体），尚未落地 Dreamcore Romanticism 品牌语言：无艺术字体系、无装饰符号、阴影含黑色分量、按钮非胶囊形态；且存在硬编码色值（如 `BottomNav.tsx` 中的 `#e8547c` / `#b0b0b8`） | `src/index.css`、各页面组件 |

### 1.3 本次开发核心目的

1. **响应式适配**：让网站在手机、平板、桌面三类设备上均提供与设备形态匹配的原生体验，摆脱"桌面端手机壳"。
2. **视觉品牌升级**：按 `docs/BONDSHIFT-UI-Design-Prompts.md` 将全站视觉切换为 Dreamcore Romanticism（梦境浪漫主义）设计语言——新色彩令牌（玫瑰酒红主色 + Cloud White 底 + 墨绒紫文字）、四字体体系（Fraunces / Cormorant Garamond / Plus Jakarta Sans / Petit Formal Script）、艺术字规范、胶囊按钮、玫瑰色调阴影。
3. **部署上线**：完成 Netlify 生产环境配置与真实 AI 调用验收，使站点达到可公开测试状态。
4. **守住既有质量基线**：移动端（375px）**功能**零回归（交互流程、文案、可用性不变；视觉随全站统一切换新设计语言），`npm run lint` / `npm run build` / `tests/e2e-onboarding.mjs` 全部保持通过。

### 1.4 成功指标（整体）

- 8 月 31 日 24:00 前，生产 URL 在 320px–1920px 全宽度范围内无水平滚动、无布局破碎。
- 生产环境发送自由文本消息能收到真实 DeepSeek 回复（无降级横幅）。
- Lighthouse 移动端 Performance ≥ 85、桌面端 ≥ 90（见 4.3 性能指标）。
- 全站通过设计手册第 8 章"品牌一致性检查清单"10 项检查（Day 4 执行，证据存于 `docs/evidence/after/responsive/design-qa/`）。

---

## 2. 需求范围

### 2.1 需要适配的页面清单

共 8 个路由页面 + 3 个全局布局组件。所有页面均为 P0 必须适配，除非单独标注。

| 路由 | 组件文件 | 桌面端（≥1024px）目标布局 | 优先级 |
|---|---|---|---|
| `/` 落地页 | `src/pages/LandingPage.tsx` | 左右分栏 Hero：左侧文案+CTA+三步流程，右侧两位男友回应预览卡上下排列；内容区 `max-w-6xl mx-auto` | P0 |
| `/setup` 偏好测试 | `src/pages/SetupPage.tsx` | 保持单列对话流，容器 `md:max-w-2xl mx-auto` 卡片居中，进度指示条吸顶 | P0 |
| `/match` 匹配揭晓 | `src/pages/MatchPage.tsx` | 两栏：左为结果主卡（头像+姓名+90%分数），右为"为什么适合"3 条解释列表 | P0 |
| `/home` 首页 | `src/pages/HomePage.tsx` | `lg:grid lg:grid-cols-12 lg:gap-6`：当前男友主卡 `col-span-7`，推荐男友列表 `col-span-5` | P0 |
| `/swap` 换乘 | `src/pages/SwapPage.tsx` | 两栏对比布局：当前男友与候选换乘对象并排，换乘按钮跨栏居中 | P0 |
| `/chat/:boyfriendId` 聊天 | `src/pages/ChatPage.tsx` | 全屏路由保留：`lg:max-w-3xl mx-auto` 居中对话列；`xl:` 断点在右侧增加当前男友信息栏（头像、关系分、标签），`xl:` 以下隐藏 | P0 |
| `/report` 报告 | `src/pages/ReportPage.tsx` | `lg:grid-cols-2` 图表卡片网格；Recharts 使用 `ResponsiveContainer` 且父容器必须有明确 `min-height` | P0 |
| `/settings` 设置 | `src/pages/SettingsPage.tsx` | `md:max-w-3xl mx-auto`，分组卡片布局 | P0 |

### 2.2 全局布局组件改造

| 组件 | 文件 | 改造要求 | 优先级 |
|---|---|---|---|
| AppShell | `src/components/layout/AppShell.tsx` | 移除 `max-w-[430px]` 硬上限，改为：`<1024px` 保持居中窄容器（`max-w-[430px]`）；`≥1024px` 展开为全宽，内容区 `max-w-6xl mx-auto px-8`。页面转场动画（AnimatePresence）逻辑保留 | **P0·全项目最高优先级，Day 1 必须完成** |
| BottomNav | `src/components/layout/BottomNav.tsx` | 添加 `lg:hidden`，桌面端不渲染。`layoutId="tabIndicator"` 动画保留（移动端）；**清除文件内硬编码色值 `#e8547c`/`#b0b0b8`，改引用迁移后 token** | P0 |
| SideNav（新建） | `src/components/layout/SideNav.tsx` | 桌面端左侧导航：`hidden lg:flex`，宽 240px，含 Logo 文字（Fraunces Italic 艺术字，见 V-3）、5 个导航项（复用 `TAB_CONFIG`：偏好/首页/换乘/报告/设置，复用 `ICON_MAP` 图标）、底部匿名 ID 展示。激活态使用 brand-500（令牌迁移后即为玫瑰酒红 `#B45A78`），指示方式为左侧 3px 圆角竖条（对齐移动端 tabIndicator 视觉语言）；底色 Cloud White `#FBF7F4` + 右缘 1px Petal Pink 分隔线 | P0 |
| StatusBar | `src/components/layout/StatusBar.tsx` | 添加 `lg:hidden`；桌面端由 PageHeader 类常规标题替代，不新建假状态栏 | P0 |
| PageHeader | `src/components/layout/PageHeader.tsx` | 桌面端加大水平内边距（`lg:px-8`），字号保持 22px 不变 | P1（可选，时间允许才做） |

### 2.3 交互要求（全端通用）

| # | 要求 | 说明 |
|---|---|---|
| I-1 | **指针设备 hover 态** | 所有可点击元素（卡片、按钮、导航项）在 `@media (hover: hover)` 下增加 hover 反馈：卡片 `translateY(-2px)` + 阴影加深（玫瑰色阴影，见 3.1.3）；主按钮亮度 +10% + shadow-glow（手册 5.2 节） |
| I-2 | **键盘可达性** | 所有交互元素可通过 Tab 聚焦，`focus-visible` 显示 2px brand-400 描边外扩 2px；SideNav 导航项支持 Enter 触发 |
| I-3 | **触控目标** | 移动端可点击区域 ≥ 44×44px（现有 BottomNav 的 `min-w-[56px] py-2.5` 已满足，新增桌面元素不受此限） |
| I-4 | **减弱动效偏好** | 在应用根部（`src/App.tsx` 或 `main.tsx`）为 Framer Motion 包裹 `<MotionConfig reducedMotion="user">`，尊重系统"减弱动态效果"设置（同时覆盖手册 V-7 氛围动效） |
| I-5 | **视口高度** | 全屏页面（ChatPage）使用 `100dvh`，并通过 `@supports not (height: 100dvh)` 回退 `100vh`（兼容 iOS Safari 15.0–15.3） |
| I-6 | **无水平溢出** | 320 / 375 / 390 / 768 / 834 / 1024 / 1280 / 1440 / 1920 px 九档宽度下，任何页面 `document.scrollingElement.scrollWidth <= window.innerWidth + 0` |
| I-7 | **布局切换动画安全** | 拖拽浏览器窗口跨断点时，Framer Motion `layoutId` 指示器不得产生跳变残影；若出现，允许将 tabIndicator 从 `layoutId` 降级为普通条件渲染 |
| I-8 | **动效节律**（源自手册第 6 章） | 全站动效 ≤ 600ms、spring 柔和曲线；禁止弹跳/翻转/旋转等强刺激动效 |

### 2.4 视觉系统改版需求（Dreamcore Romanticism）

视觉细则（完整色值、字号节律、艺术字协调法则、组件规格、动效参数）以 `docs/BONDSHIFT-UI-Design-Prompts.md` 为唯一权威，本表只定义工程落地项与优先级分层：

| # | 模块 | 工程要求 | 优先级 |
|---|---|---|---|
| V-1 | 色彩令牌迁移 | 按 3.1.1 映射表重写 `src/index.css` 的 `@theme`；同步更新 `card` / `glass` / 三个渐变 utility 色值；`index.html` 的 `theme-color` 改为 `#B45A78`；全库排查并替换组件内硬编码色值 | **P0** |
| V-2 | 字体体系 | 接入 4 个拉丁字体（@fontsource 自托管、仅 latin 子集），建立 display / serif / sans / script 四条字体栈；中文一律系统字体栈（细则见 3.1.2） | **P0** |
| V-3 | 艺术字应用 | 手册第 3 章的 5 个允许位置全部落地：Logo（Fraunces Italic + 酒红）、Hero 主标题（Cormorant Italic）、章节分隔标题、情感卡片标语（Script）、角色签名（Script） | **P0** |
| V-4 | 按钮形态 | 全站按钮胶囊化（`border-radius: 999px`）；主 CTA 用 Wine Glow 径向渐变 + 1px `#B45A78` 内描边 + 玫瑰色阴影（hover → shadow-glow；active → scale 0.96） | **P0** |
| V-5 | 阴影体系 | `card` / `card-hover` 等阴影全部换为玫瑰色调 `rgba(180, 90, 120, α)` 四档（sm / md / lg / glow，色值见手册 4.1 节），移除现有黑色阴影分量 | **P0** |
| V-6 | 装饰符号库 | 丝带蝴蝶结、闪光星、手绘分隔线、樱花花瓣 SVG（currentColor 描边）+ Logo / 章节标题 / 空状态点缀 | P1（可选，可整体裁剪） |
| V-7 | 氛围动效 | 樱花飘落（仅落地页）、柔光呼吸（Hero 背景）、闪光星闪烁；全部遵守 I-8 与 reducedMotion | P1（可选，可整体裁剪） |

### 2.5 明确超出范围（禁止实施）

以下事项**不属于**本次执行范围，Codex 不得顺手实施，防止范围蔓延：

1. P0 产品功能：同题双人回应体验、留下/换乘决策闭环、关系画像分享卡、漏斗埋点接入（属产品迭代线，另行排期）。
2. 设计手册中属 P1 层级的装饰项（V-6 装饰符号库、V-7 氛围动效、复古邀请函边框、新增 3D 插画）：时间不足时**整体裁剪**，不得为赶工牺牲任何 P0 项质量。
3. 技术栈变更（8 月 28 日后冻结，且本轮根本不需要）：不换框架、不新增重型依赖（新增依赖仅限 B-3 白名单内 4 个字体包）。
4. VR / 语音 / 换乘对比页面的开发（已隐藏，保持现状重定向即可）。
5. 登录、跨设备同步、数据库等 P1 功能。
6. 任何用户可见文案的修改（受 e2e 保护，见 B-5）。

---

## 3. 设计规范

### 3.1 视觉风格：执行 Dreamcore Romanticism 设计手册

本轮视觉**全面切换**至 `docs/BONDSHIFT-UI-Design-Prompts.md` 定义的设计语言。完整规范（色彩氛围、字号节律、艺术字协调法则、动效参数、插画指南）以手册为准，本节固化工程执行要点。

#### 3.1.1 色彩令牌迁移表（重写 `src/index.css` 的 `@theme`）

| 语义角色 | token（建议命名） | 色值 | 替代的旧值 |
|---|---|---|---|
| 主行动色 | `--color-brand-500` | `#B45A78` 玫瑰酒红 | `#e8547c` |
| 主色浅域 | `--color-brand-100` / `--color-brand-200` | `#F5C6D6` 樱花粉 / `#FFD7E0` 花瓣粉 | 旧 brand-100/200 |
| 暖色背景 | `--color-cream-100` | `#FFE5D9` 奶油桃 | 旧 warm 系（弃用旧值） |
| 冷色点缀 | `--color-mint-100` / `--color-mint-200` | `#B8E0D2` 薄荷云 / `#D4E4D4` 鼠尾草 | 新增（旧 accent 蓝紫系弃用） |
| 金色点缀 | `--color-gold-300` | `#E6CFA7` 香槟金 | 新增 |
| 主文字 | `--color-text-primary` | `#2D1B2E` 墨绒紫 | `#2d2d2d` |
| 辅文字 | `--color-text-secondary` | `#6B5A6B` 灰紫 | `#8e8e93` |
| 弱文字 | `--color-text-tertiary` | `#B5A5B5` | `#b0b0b8` |
| 页面底色 | `--color-surface-50` / `--color-surface-100` | `#FBF7F4` Cloud White / `#F8F0E5` Paper Cream | `#fff7fa` 系 |
| 结构墨色 | `--color-ink` | `#2D1B2E` | 新增（替代一切纯黑） |

色彩硬规则（摘自手册 1.2 节，QA 违例即不通过）：

- 界面中**禁止出现纯黑 `#000` 与纯白 `#FFF`**（分别以墨绒紫 / Cloud White 替代）；
- 阴影一律玫瑰色调 `rgba(180, 90, 120, α)`——重写 `card` utility 时移除现有 `rgba(0, 0, 0, ...)` 分量；
- 渐变仅允许三种（重写现有三个渐变 utility）：`gradient-brand` → **Wine Glow**（`#B45A78 → #F5C6D6` 径向）、`gradient-accent` → **Sky Blush**（`#FCE4EC → #E8F4F8`）、`gradient-warm` → **Petal Mist**（`#FFD7E0 → #FFE5D9`）；`text-gradient` 重定义为 `#B45A78 → #F5C6D6` 文字渐变；
- 色彩配比遵守 70-20-8-2（主色域 / 冷色 / 强调 / 结构）；
- `#root` 全局背景渐变更新为 Cloud White → Petal Pink 调（替换现有 `#fff7fa → #fef0f4` 系）。

#### 3.1.2 字体体系（4 拉丁字体自托管 + 中文系统栈）

| 角色 | 字体 | 权重/形态 | 用途 |
|---|---|---|---|
| Display | Fraunces | 600 + Italic | Logo "BONDSHIFT" |
| Serif 标题 | Cormorant Garamond | 500 + Italic | Hero 主标题、章节分隔标题（拉丁字符生效） |
| Sans 正文 | Plus Jakarta Sans | 400 / 500 / 600 / 700 | 正文、按钮、表单、UI 元素 |
| Script 点缀 | Petit Formal Script | 400 | 情感标语、角色签名（拉丁字符生效） |

工程铁律：

- **加载方式：`@fontsource/*` npm 包自托管**（按权重引入 css，浏览器按 unicode-range 只下载用到的 latin 子集 woff2，随 Netlify 静态发布），**禁止外链 Google Fonts**（国内可达性风险，见 R13）；
- **中文禁止下载任何 webfont**（单字重 >4MB 会击穿性能指标），一律系统栈：`'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei'`；中文情感/签名类文案可用系统楷体栈 `'Kaiti SC', 'STKaiti', 'KaiTi'` 获得手写感（零下载成本）；
- 定义四条字体栈变量：`--font-display` / `--font-serif` / `--font-sans` / `--font-script`，全部以对应拉丁字体开头、系统中文字体收尾（标题拉丁字符呈衬线，中文回退加粗无衬线，属预期行为）；
- webfont 总传输量 ≤ 200KB；`font-display: swap`；标题元素固定 `line-height` 防字体切换 CLS。

#### 3.1.3 组件形态升级要点（详见手册第 4、5 章）

- **按钮**：全部胶囊型 `border-radius: 999px`；主 CTA = Wine Glow 径向渐变 + 1px `#B45A78` 内描边 + shadow-md（hover → shadow-glow + 亮度 +10%；active → scale 0.96）；次级按钮 = Petal Pink `#FFD7E0` 底 + 1.5px 酒红描边；幽灵按钮 = 透明底 + 1.5px 酒红描边。
- **卡片圆角阶梯**：大卡 24px / 中卡 16px（现有 `card` utility 的 24px 保留）。
- **艺术字边界**：仅 5 处可用（Logo / Hero 主标题 / 章节分隔标题 / 情感卡片标语 / 角色签名），**禁止出现在按钮、表单、错误提示、价格、日期**；艺术字周围保留 ≥ 48px 呼吸空间。
- **图标**：沿用 lucide-react 现有图标与 1.5–2px 描边，激活态换 `#B45A78`，默认色换墨绒紫。
- **对话气泡**（手册 4.5 节）：角色消息（左）Paper Cream 底 + 酒红描边；用户消息（右）酒红渐变底 + Cloud White 文字。

### 3.2 断点设置（采用 Tailwind 默认断点，禁止自定义）

| 断点 | 宽度 | 设备假设 | 导航形态 | 容器策略 |
|---|---|---|---|---|
| 默认 | < 640px | 手机 | BottomNav | `max-w-[430px] mx-auto`（现状保留） |
| `sm` | ≥ 640px | 大屏手机 | BottomNav | 同上 |
| `md` | ≥ 768px | 平板竖屏 | BottomNav | `max-w-[672px] mx-auto`，内容卡片可双列 |
| `lg` | ≥ 1024px | 平板横屏/小桌面 | **SideNav** | 全宽布局，内容区 `max-w-6xl mx-auto px-8` |
| `xl` | ≥ 1280px | 桌面 | SideNav | 同 lg；ChatPage 右侧信息栏出现 |
| `2xl` | ≥ 1536px | 大桌面 | SideNav | 同 xl |

**布局模式切换的单一事实来源**：`lg`（1024px）是"移动形态 ⇄ 桌面形态"的分界线。导航形态、StatusBar 显隐、AppShell 容器宽度三者在 `lg` 同时切换，禁止出现混搭（例如 lg 下同时显示 SideNav 和 BottomNav）。

移动端容器宽度维持现有 `max-w-[430px]`（手册 4.1 节的 480pt 为建议值，为控制回归面维持现状，不作为本轮改动项）。

### 3.3 布局结构规范

```
桌面端（≥lg）整体结构：

┌────────┬──────────────────────────────────────┐
│        │  PageHeader（lg:px-8）                │
│ SideNav│  ┌────────────────────────────────┐  │
│ 240px  │  │  页面内容（max-w-6xl mx-auto）    │  │
│        │  │  栅格见 2.1 各页布局定义           │  │
│ Logo   │  └────────────────────────────────┘  │
│ 偏好    │                                      │
│ 首页    │  背景：#root 渐变（Cloud White→Petal Pink）│
│ 换乘    │                                      │
│ 报告    │                                      │
│ 设置    │                                      │
│ 匿名ID │                                      │
└────────┴──────────────────────────────────────┘

平板（md–lg）：居中 672px 容器 + BottomNav，首页/报告页卡片可两列。
手机（<md）：功能行为维持现状，视觉随全站统一切换新设计语言。
```

栅格细则：使用 Tailwind 原生 `grid` / `grid-cols-12` / `gap-6`；卡片间距桌面 `gap-6`（24px）、移动维持现状（约 `gap-4`/16px）；圆角阶梯（大卡 24px / 中卡 16px / 按钮 999px 胶囊）与玫瑰色四档阴影（sm/md/lg/glow）**全端统一**，禁止为桌面端另设一套。

### 3.4 用户体验要求

1. **移动端功能零回归**：375px 下所有交互流程与改造前行为等价（同样的操作可完成、文案不变、无新报错）；视觉随全站统一切换为 Dreamcore Romanticism 新设计语言，**不再要求与旧版像素级一致**。每日收工前对 `/`、`/home`、`/chat/*` 做 375px 截图检查：新视觉一致性 + 无布局破碎。
2. **低决策疲劳原则**（手册设计哲学）：桌面端信息密度可以高于移动端（两栏、网格），但单一页面同时呈现的卡片数不超过 6 张，保持大量留白的呼吸感。
3. **内容优先级**：跨断点重排时，"主行动"元素（CTA、当前男友、发送框）必须始终位于视觉第一层级，不得被装饰性内容挤压。
4. **渐进披露**：桌面端聊天页右侧男友信息栏默认展示，`xl` 以下隐藏时不得以浮层替代（避免复杂度）。
5. **文案不变**：所有用户可见文案（按钮、标题、提示语）本轮一律不修改——它们被 e2e 脚本断言依赖（见附录 B-5）。
6. **对比度**：正文用墨绒紫 `#2D1B2E`（Cloud White 底上 ≈ 13:1）；灰紫 `#6B5A6B` 仅用于辅助说明文字；主 CTA 白字按大号粗体文本标准（≥ 3:1）校验，渐变浅端不足时加深终止色。

---

## 4. 验收标准

### 4.1 各页面响应式表现验收矩阵

验收方式：`npm run dev` 后用浏览器 DevTools 设备模拟 + 真实窗口缩放逐项检查。每格"通过"标准 = 无水平滚动 + 无元素重叠 + 无文字截断 + 交互可完成。

| 页面 | 375×812 | 768×1024 | 1440×900 | 1920×1080 |
|---|---|---|---|---|
| `/` 落地页 | 单列（新视觉） | 居中 672px | 左右分栏 Hero | 同 1440，内容区居中 |
| `/setup` | 单列（新视觉） | 居中卡片 | 居中 max-w-2xl 卡片 | 同 1440 |
| `/match` | 纵向（新视觉） | 纵向、卡片加宽 | 两栏（结果卡/解释列表） | 同 1440 |
| `/home` | 纵向（新视觉） | 卡片可两列 | 12 栅格 7+5 | 同 1440 |
| `/swap` | 纵向（新视觉） | 纵向、卡片加宽 | 两栏对比 | 同 1440 |
| `/chat/:id` | 全屏（新视觉） | 居中加宽 | 居中 max-w-3xl | 右侧男友信息栏出现 |
| `/report` | 纵向（新视觉） | 图表两列 | 图表两列网格 | 同 1440 |
| `/settings` | 纵向（新视觉） | 居中 max-w-3xl | 居中 max-w-3xl 分组卡 | 同 1440 |
| 导航 | BottomNav | BottomNav | SideNav，无 BottomNav/StatusBar | 同 1440 |

**每个页面在每个断点必须验证的交互**：落地页 CTA 可点击进入 `/setup`；三道题可作答并前进/返回；匹配页"修改答案"可用；聊天页可发送消息并收到回复（本地降级即可）；换乘页可发起换乘；报告页图表渲染无空白；设置页各入口可点击。

**视觉验收（全断点适用，Day 4 逐页过检）**：设计手册第 8 章 QA 清单 10 项——① 全站无纯黑/纯白大色块 ② 阴影为玫瑰色调 ③ 四字体栈正确加载 ④ 艺术字仅出现在 5 个允许位置 ⑤ 按钮为胶囊形态 ⑥ 动效 ≤ 600ms 无强刺激 ⑦ 背景/卡片使用 Cloud White/Paper Cream 系 ⑨ 文字层级 H1/Body/Caption 齐全 ⑩ 375px 模拟通过。（⑧ 装饰元素项随 V-6 可选层一并豁免或执行。）

### 4.2 浏览器兼容性要求

| 平台 | 浏览器 | 最低版本 | 必测点 |
|---|---|---|---|
| macOS / Windows | Chrome | 100 | 全量 |
| macOS | Safari | 15 | `100dvh` 回退、`backdrop-filter`（glass utility 已含 `-webkit-` 前缀）、`focus-visible`、woff2 字体渲染 |
| Windows | Edge | 100 | 全量 |
| macOS / Linux | Firefox | 100 | `backdrop-filter`、栅格 |
| iOS | Safari | 15 | 视口、BottomNav 安全区（`pb-safe`）、输入框聚焦缩放、系统楷体回退 |
| Android | Chrome | 100 | 触控目标、横竖屏切换 |

已知需处理的兼容点：`100dvh` 在 Safari 15.0–15.3 不支持 → 用 `@supports` 回退（见 I-5）；其余 CSS 特性由 Tailwind 4 / Lightning CSS 自动降级，无需手写。

### 4.3 性能指标（沿用 `docs/baseline.md` 既定目标）

| 指标 | 目标值 | 测量方式 |
|---|---|---|
| 主入口 JS（未压缩） | < 300 KB（当前基线 235.89 KB，不得恶化超 15%） | `npm run build` 输出 |
| 主入口 JS（gzip） | < 90 KB | 同上 |
| 单路由异步 chunk | < 20 KB | 同上 |
| Webfont 传输量 | ≤ 200 KB（4 个拉丁字体 latin 子集 woff2，自托管） | build 输出 + DevTools Network |
| 首屏图片传输总量 | < 1.5 MB（当前约 460 KB） | DevTools Network |
| Lighthouse Performance（移动 375 / 桌面 1440） | ≥ 85 / ≥ 90 | DevTools Lighthouse 面板 |
| Lighthouse Accessibility / Best Practices / SEO | 各 ≥ 90 | 同上 |
| LCP | < 2.5s（移动端 Slow 4G 模拟） | 同上 |
| CLS | < 0.1（头像图片必须有 width/height 或 aspect-ratio；标题固定 line-height 防字体 swap 抖动） | 同上 |
| 控制台错误 | 0（e2e 已有 consoleErrors 断言，必须继续为 0） | `tests/e2e-onboarding.mjs` |

### 4.4 质量门禁（每个任务"完成"的定义）

任何任务标记完成前，必须同时满足：

```bash
npm run lint    # 0 error 0 warning
npm run build   # 成功，且主 JS 体积在目标内
node tests/e2e-onboarding.mjs   # 全流程通过（先 npm run preview 于 4173 端口）
```

外加：该任务涉及页面在 375px 与 1440px 两档截图，存入 `docs/evidence/after/responsive/`，命名规则 `<页面名>-<宽度>.png`（如 `home-1440.png`）。

---

## 5. 部署上线要求

### 5.1 部署环境

| 项 | 值 |
|---|---|
| 平台 | Netlify（现有 `netlify.toml`，勿改动其 build/redirects 配置） |
| 构建命令 | `npm run build` |
| 发布目录 | `dist`（含 @fontsource 打包的 woff2 静态资源，随站点一同发布） |
| Functions | `netlify/functions/chat.mjs`（已有，勿改） |
| SPA 回退 | 已配置 `/* → /index.html`，无需新增 |
| API 代理 | `/api/chat → /.netlify/functions/chat`，已配置 |

### 5.2 环境变量（Netlify 后台 Site settings → Environment variables）

| 变量 | 必填 | 说明 |
|---|---|---|
| `DEEPSEEK_API_KEY` | **是** | 仅服务端，绝不使用 `VITE_` 前缀，绝不写入 Git |
| `DEEPSEEK_MODEL` | 否 | 默认 `deepseek-v4-flash` |
| `DEEPSEEK_API_URL` | 否 | 默认官方 Chat Completions 地址 |

### 5.3 上线流程（Day 5 执行）

```
Step 1  确认 main 分支包含全部已验收代码，本地三件套门禁通过
Step 2  Netlify 后台配置环境变量（5.2），触发重新部署
Step 3  等待构建完成，打开生产 URL 做「生产冒烟清单」（5.4）
Step 4  冒烟全过 → 标记上线成功；任一失败 → 回滚（5.6）并修复
Step 5  更新 docs/baseline.md 的"8月31日对比目标"达成状态，写入当日日报
```

### 5.4 发布前检查清单（生产冒烟，逐项打勾）

- [ ] 生产 URL 打开落地页正常渲染（新视觉：玫瑰酒红主色 + Cloud White 底 + 衬线标题），无控制台错误
- [ ] 375px 与 1440px 下导航形态正确切换（BottomNav ⇄ SideNav）
- [ ] 完整走通：三道题 → 顾怀瑾 90% 匹配 → 首次相遇
- [ ] **发送一条自由文本，收到真实 DeepSeek 回复，页面无"DeepSeek 暂时未连接"降级横幅**
- [ ] Netlify Function 日志中无聊天正文、无 API 密钥泄露
- [ ] 刷新页面后聊天记录仍在（本地持久化正常）
- [ ] 旧链接 `/vr`、`/voice`、`/compare` 均重定向回 `/home`
- [ ] Lighthouse 生产 URL 移动端四项分数达标（4.3）
- [ ] DeepSeek 预算复核节点已在后台（或人工台账）标注：50 元 / 100 元 / 135 元（总上限 150 元，触顶暂停公开模型调用）

### 5.5 发布纪律

- **代码冻结**：8 月 31 日 12:00 后仅允许修复阻断性问题（冒烟清单失败项），不接受任何新布局或视觉调整。
- 每次生产变更必须先经过 Netlify Deploy Preview 验证再发布（当前推送即部署的流程不变，但 Day 5 内的多次修复应逐次验证）。

### 5.6 回滚方案

- 首选：Netlify 后台 Deploys 列表 → 选中上一个绿色部署 → **Publish deploy**（一键回滚，无需改代码）。
- 备选：`git revert <commit>` 后推送触发新构建。
- 回滚后必须重新执行 5.4 冒烟清单的 1、4、6 三项，确认基础体验未受影响。

---

## 6. 任务排期（2026-08-27 → 08-31）

依赖关系总览：

```
D1 设计系统迁移 + 响应式骨架 ──→ D2 核心链路页面（新视觉+响应式）──┐
        │                                                        ├──→ D4 兼容/性能/回归/设计QA ──→ D5 部署上线
        └──────────────→ D3 主功能页面（新视觉+响应式）────────────┘
```

### Day 1（8/27）· 设计系统迁移 + 响应式基础设施 【必须实现，全项目关键路径】

| 编号 | 任务 | 涉及文件 | 验收 |
|---|---|---|---|
| D1-1 (P0) | **色彩令牌迁移（V-1）**：按 3.1.1 映射表重写 `@theme`；更新 `card`/`glass`/三渐变/`text-gradient` utility；`index.html` `theme-color` → `#B45A78`；`#root` 背景渐变换新；全库 `git grep -E '#e8547c|#fff7fa|#8e8e93|#2d2d2d|#b0b0b8'` 清零（改 token 引用） | `src/index.css`、`index.html`、含硬编码色值的组件 | 旧主色引用清零；全站换新色后无样式报错 |
| D1-2 (P0) | **字体接入（V-2）**：安装 4 个 @fontsource 包，按权重引 css；定义四条字体栈变量；Logo/PageHeader/标题组件接入对应字体栈 | `package.json`、`src/index.css`、`src/main.tsx`、`AppShell.tsx` | 标题与 Logo 呈新字体；webfont 总量 ≤ 200KB |
| D1-3 (P0) | AppShell 双形态容器：`<lg` 保持 430px 居中，`≥lg` 全宽 + `max-w-6xl` 内容区 | `AppShell.tsx` | 1440px 下任意页面不再是手机壳；375px 容器宽度不变 |
| D1-4 (P0) | 新建 SideNav（240px，Cloud White 底 + Petal Pink 分隔线 + 左侧 3px 竖条激活态，复用 TAB_CONFIG 与图标），接入 AppShell | 新建 `SideNav.tsx`，改 `AppShell.tsx` | lg 下五项导航全部可跳转且激活态正确 |
| D1-5 (P0) | BottomNav、StatusBar 加 `lg:hidden`（BottomNav 硬编码色值已在 D1-1 清除） | 两个文件 | lg 下两者不渲染，无混搭 |
| D1-6 (P0) | 全局 hover/focus-visible 交互层（I-1、I-2）+ `MotionConfig reducedMotion="user"`（I-4）+ ChatPage `100dvh` Safari 回退（I-5） | `index.css`、`App.tsx`、`ChatPage.tsx` | 键盘 Tab 可遍历导航；iOS Safari 15 模拟无高度异常 |
| D1-7 (P0) | **按钮胶囊化（V-4）**：全站按钮统一 999px 圆角；主 CTA 换 Wine Glow 渐变 + 玫瑰色阴影（含 hover/active 态） | 各页面按钮 | 手册 5.2/5.3 节形态达成；e2e 按钮文案不受影响 |
| D1-8 (P0) | 建立响应式 + 新视觉基线：9 档宽度全页面跑一遍，归档骨架态截图 | `docs/evidence/after/responsive/` | 目录含全部页面 × 375/768/1440 截图 |
| D1-9 (P1·可选) | PageHeader `lg:px-8` 内边距调整 | `PageHeader.tsx` | — |

**D1 收工门禁**：4.4 三件套 + `git diff` 中不出现任何 core engine 文件改动。

### Day 2（8/28）· 核心转化链路页面（新视觉 + 响应式）【必须实现；今日 18:00 技术方案冻结】

| 编号 | 任务 | 涉及文件 | 验收 |
|---|---|---|---|
| D2-1 (P0) | 落地页桌面分栏 Hero + 新视觉：Fraunces Italic Logo、Cormorant Italic Hero 主标题、Sky Blush 背景区、Script 副标语（V-3 前三个艺术字位置） | `LandingPage.tsx` | 1440px 两栏无重叠；艺术字仅出现在允许位置；e2e 落地页用例通过 |
| D2-2 (P0) | SetupPage 居中 `md:max-w-2xl` 卡片化 + 新视觉（Paper Cream 卡片、衬线标题） | `SetupPage.tsx` | 768/1440 居中；e2e 三道题流程通过 |
| D2-3 (P0) | MatchPage 桌面两栏（结果卡 ｜ 解释列表）+ 新视觉（角色签名 Script 字体） | `MatchPage.tsx` | 1440px 两栏；e2e "修改答案"用例通过 |
| D2-4 (P0) | **冻结前技术验证**：三页在 9 档宽度全过一遍 + 手册第 8 章 QA 清单试运行，确认布局与视觉方案无需返工 | — | 验证记录写入当日日报 |

### Day 3（8/29）· 主功能页面（新视觉 + 响应式）【必须实现】

| 编号 | 任务 | 涉及文件 | 验收 |
|---|---|---|---|
| D3-1 (P0) | HomePage `lg:grid-cols-12`（7+5）双栏 + 新视觉 | `HomePage.tsx` | 1440px 主卡与推荐列并排；头像图 CLS=0 |
| D3-2 (P0) | SwapPage 桌面两栏对比 + 换乘按钮跨栏（胶囊 Wine Glow 主按钮） | `SwapPage.tsx` | 1440px 对比布局；换乘流程可完成 |
| D3-3 (P0) | ChatPage 桌面 `lg:max-w-3xl` 居中 + `xl:` 右侧男友信息栏；气泡按 3.1.3 双色方案（Paper Cream 左 / 酒红渐变右） | `ChatPage.tsx` | 1920px 信息栏出现；375px 输入区不被遮挡 |
| D3-4 (P0) | ReportPage `lg:grid-cols-2` 图表网格，修复 ResponsiveContainer 高度塌陷 | `ReportPage.tsx` | 图表无空白；768px 起两列 |
| D3-5 (P0) | SettingsPage `md:max-w-3xl` 分组卡片 + 新视觉 | `SettingsPage.tsx` | 居中布局；各入口可点击 |
| D3-6 (P1·可选) | 装饰符号库（V-6）：丝带蝴蝶结、闪光星、手绘分隔线 SVG + Logo/章节标题/空状态点缀 | 新建 `src/components/decorations/` | 手册 3.3 节符号齐备 |

### Day 4（8/30）· 兼容性 / 性能 / 回归 / 设计 QA 【必须实现】

| 编号 | 任务 | 验收 |
|---|---|---|
| D4-1 (P0) | 跨浏览器测试（4.2 矩阵全量，含字体渲染与楷体回退），修复发现的问题 | 矩阵逐格打勾记录于日报 |
| D4-2 (P0) | Lighthouse 达标冲刺：图片懒加载复核、CLS 复核（含字体 swap）、按需微调 | 4.3 全指标达标，截图存证 |
| D4-3 (P0) | e2e 回归 + 扩展：现有脚本通过后，在 768/1440 两档重走主流程 | 全断点主流程可完成 |
| D4-4 (P0) | 布局切换压力测试：拖拽窗口在 999↔1025px 反复横跳 10 次 | 无残影、无导航混搭（I-7） |
| D4-5 (P0) | **设计 QA 全站过检**：手册第 8 章清单 10 项逐页执行（见 4.1 视觉验收） | 10 项全过，证据存 `docs/evidence/after/responsive/design-qa/` |
| D4-6 (P1·可选) | 为 e2e 新增桌面视口用例（viewport 1440） | 脚本通过 |
| D4-7 (P1·可选) | 氛围动效（V-7）：樱花飘落（仅落地页）、柔光呼吸、闪光星闪烁 | 手册第 6 章参数达成；reducedMotion 生效 |

### Day 5（8/31）· 部署上线 【必须实现】

| 编号 | 任务 | 验收 |
|---|---|---|
| D5-1 (P0) | 最终门禁三件套 + 9 档宽度截图归档 | 全绿 |
| D5-2 (P0) | Netlify 环境变量配置并重新部署（5.2、5.3） | 部署成功 |
| D5-3 (P0) | 生产冒烟清单 9 项逐项打勾（5.4） | 9/9 通过 |
| D5-4 (P0) | 预算复核节点台账建立（50/100/135 元） | 台账就位 |
| D5-5 (P0) | 文档收尾：更新 `docs/baseline.md` 对比目标状态 + 当日日报 | 文档更新完成 |
| D5-6 (P1·可选) | 将"响应式 + 设计系统迁移"方法论沉淀为 `docs/` 下的经验文档 | — |

**每日交付纪律**：
1. 每日收工将进展、阻塞、次日计划写入 `docs/daily/YYYY-MM-DD.md`（已有目录与格式惯例，照抄 `2026-08-26.md` 结构）。
2. 当日任务未完成且为 P0 → 必须在日报"阻塞"小节写明原因与补救方案，禁止静默延期。
3. 截图证据统一入 `docs/evidence/after/responsive/`。

---

## 7. 风险预案

| # | 风险 | 概率 | 影响 | 触发信号 | 应对方案 |
|---|---|---|---|---|---|
| R1 | 移动端**功能**回归（最核心风险；注意：视觉按计划全站变更，回归指交互/流程/文案/报错） | 中 | 高 | e2e 失败 / 375px 主流程手动走查失败 | 每日 4.4 门禁 + 375px 主流程走查；功能回归优先于一切视觉与桌面优化；必要时 revert 当日提交 |
| R2 | 8/28 技术方案冻结后发现布局方案不可行 | 低 | 高 | D2-4 验证不通过 | D1 采用的"令牌层 + 容器双形态 + 组件级 lg: 前缀"是纯 CSS 层方案，无架构绑定；若失败退回"居中加宽容器"保底方案（布局降级但新视觉保留） |
| R3 | Framer Motion `layoutId` 跨断点动画残影 | 中 | 中 | D4-4 压力测试出现指示器错位 | 按 I-7 预案降级为条件渲染；该降级不影响功能验收 |
| R4 | Recharts 在栅格中高度塌陷/溢出 | 高 | 中 | 报告页图表空白或横向滚动 | 父容器固定 `min-height`（建议 280px）+ `ResponsiveContainer width="100%" height="100%"`；仍失败则图表卡片改固定高度 |
| R5 | Safari 15 兼容问题（100dvh / focus-visible / 字体） | 中 | 中 | Safari 测试异常 | I-5 的 `@supports` 回退已纳入 D1-6；`focus-visible` 降级为 outline 兜底；字体仅 woff2（Safari 12+ 支持） |
| R6 | `DEEPSEEK_API_KEY` 未及时配置，生产冒烟 D5-3 第 4 项无法通过 | 中 | 高 | Netlify 后台无该变量 | 上线门槛不放松：密钥由监督人当日配置；若 24h 内无法取得密钥，站点照常发布（降级路径可用），但需在日报标注"真实 AI 验收顺延"并保持 D5-3 其余 8 项通过 |
| R7 | DeepSeek 预算超支（上限 150 元） | 低 | 高 | 后台用量接近节点值 | 50/100/135 元三级人工复核；触顶立即在 Function 侧暂停调用（现有降级接管），不影响站点可用性 |
| R8 | 范围蔓延（改业务文案 / 动 core 逻辑 / 引入白名单外依赖或色值 / 实施 2.5 清单内容） | 中 | 高 | diff 中出现 2.5 清单或 B-2/B-3 之外内容 | 附录 B 硬约束 + 每日 diff 审查；违反即回退相关提交 |
| R9 | 主 JS 体积因桌面代码恶化超限 | 低 | 中 | build 输出 > 300KB | SideNav 等桌面组件必须走 lazy 加载（仅 lg 用户下载）；图标复用 lucide 现有导入，禁止整包引入 |
| R10 | Netlify 构建失败（Node 版本 / 环境变量拼写 / 字体包安装失败） | 低 | 中 | Deploy 日志报错 | 核对 `netlify.toml` 未被改动；变量名逐字符比对 5.2 表格；失败超 2 次启用 5.6 回滚 |
| R11 | 视觉改版与响应式双目标叠加导致工期溢出 | 中 | 高 | D3 结束时仍有 P0 页面未达标 | P0/P1 分层兜底：V-6 装饰符号、V-7 氛围动效（及 D3-6/D4-7）整体裁剪不影响上线；每日日报预警进度偏差，必要时砍 2.1 页面的"桌面增强项"保布局正确 |
| R12 | 误下中文 webfont 导致体积失控（单字重 >4MB） | 中 | 高 | build 产物含中文字符集 woff2 | B-2 硬约束：中文只用系统字体栈（含楷体签名方案）；webfont 仅限 4 个拉丁包 latin 子集 |
| R13 | 外链 Google Fonts 国内不可达导致字体阻塞/白屏 | 中 | 中 | 国内网络测试长时间 FOUT 或阻塞 | B-2 硬约束：一律 @fontsource 自托管随 dist 发布；禁止 index.html 外链字体 CDN |
| R14 | 新底色上文字对比度不足（灰紫辅助字 / CTA 渐变浅端白字） | 中 | 中 | Lighthouse Accessibility < 90 | 3.4.6 规则：正文一律墨绒紫；灰紫仅辅助文字；CTA 白字按大文本 3:1 校验，不足则加深渐变终止色 |

---

## 8. 附录

### 附录 A · 现有代码资产地图（Codex 快速导航）

```
src/
├── App.tsx / main.tsx                # 应用入口（D1-2 字体引入 / D1-6 MotionConfig 挂载点）
├── routes/index.tsx                  # 全部路由与懒加载（勿改路由路径）
├── components/
│   ├── ProductRuntime.tsx            # 匿名会话引导（勿动）
│   ├── decorations/                  # D3-6 可选：装饰 SVG 组件（新建）
│   └── layout/
│       ├── AppShell.tsx              # ★ D1-3 主改造对象（容器双形态）
│       ├── SideNav.tsx               # D1-4 新建（桌面侧边导航）
│       ├── BottomNav.tsx             # D1-5 加 lg:hidden + D1-1 清硬编码色值
│       ├── StatusBar.tsx             # D1-5 加 lg:hidden
│       └── PageHeader.tsx            # D1-9（可选）
├── pages/                            # 8 个页面，D2/D3 逐个适配（新视觉 + 响应式）
├── index.css                         # ★ D1-1 主改造对象：@theme 令牌全量迁移 + utilities 重写
├── core/                             # ★ 业务引擎，禁止改动（见 B-1）
├── stores/                           # Zustand 状态，禁止改动
├── services/chatApi.ts               # AI 请求封装，禁止改动
└── utils/constants.ts                # TAB_CONFIG 在此（SideNav 复用）

netlify/functions/chat.mjs            # DeepSeek 代理（禁止改动）
tests/e2e-onboarding.mjs              # 375×812 主流程 e2e（运行方式见 B-4）
docs/BONDSHIFT-UI-Design-Prompts.md   # ★ 视觉唯一权威来源（色彩/字体/艺术字/组件/动效全规范）
docs/baseline.md                      # 质量基线与目标对照
docs/evidence/after/responsive/       # 本轮截图证据目录（新建）
```

### 附录 B · Codex 硬性执行约束

1. **改动白名单**：只允许修改 `src/components/layout/*`、`src/components/decorations/*`（新建）、`src/pages/*`、`src/index.css`、`src/App.tsx`（仅字体引入与 MotionConfig）、`src/main.tsx`（仅字体引入）、`index.html`（仅 theme-color meta）、`tests/`（仅桌面视口用例新增）。`src/core/`、`src/stores/`、`src/services/`、`src/data/`、`netlify/`、`netlify.toml` 一律只读。
2. **视觉执行边界**：视觉设计以 `docs/BONDSHIFT-UI-Design-Prompts.md` 为唯一权威；色彩只能引用 3.1.1 迁移后的 token 表（禁止引入表外色值，禁止纯黑纯白）；字体只能使用 3.1.2 四条字体栈（中文系统栈、楷体签名栈除外）；艺术字仅限 5 个允许位置；动效 ≤ 600ms 且尊重 reducedMotion；禁止外链任何字体 CDN、禁止下载中文字体。
3. **依赖白名单**：新增 npm 依赖仅限 `@fontsource/fraunces`、`@fontsource/cormorant-garamond`、`@fontsource/plus-jakarta-sans`、`@fontsource/petit-formal-script` 四个（服务 V-2）；其余任何新增依赖必须停下询问监督人。
4. **构建与测试命令**：
   - 开发：`npm run dev`
   - 门禁：`npm run lint` → `npm run build`
   - e2e：先 `npm run preview`（端口 4173 保持前台或后台运行），另开终端 `node tests/e2e-onboarding.mjs`（依赖本机 Chrome 与 playwright）
5. **受 e2e 保护的文案（禁止修改）**："开始陪伴测试"、"下一题"、"查看我的陪伴匹配"、"修改答案"、"和 顾怀瑾 初次见面"、"重试真实 AI"、"为什么适合"、"90%"，以及三道题的选项文案与标题。
6. **提交纪律**：每个任务编号一个 commit，message 格式 `[D<天数>-<编号>] 摘要`（如 `[D1-4] 新增桌面侧边导航 SideNav`），便于逐任务回滚。
7. **遇到歧义**：以本文档为准，视觉细则以设计手册为准；两文未覆盖的实现细节由 Codex 按"最小改动 + 新设计语言惯例"自行决策并记录在当日日报，无需等待确认；但涉及 2.5 范围外内容或 B-1/B-3 白名单外改动时必须停下询问监督人。

---

*本 PRD 自发布起为唯一执行依据，修订需在文档头部更新版本号并注明变更内容。v1.0 → v1.1 变更摘要：① 新增 2.4 视觉系统改版需求（V-1~V-7，P0/P1 分层）② 3.1 由"沿用现有 tokens"重写为"设计手册执行要点"（令牌迁移表 / 字体工程铁律 / 组件升级）③ 3.4.1 "移动端像素级零回归"改为"功能零回归"（视觉全站升级为既定计划）④ 排期 D1 注入设计系统迁移任务、D2/D3 双目标（新视觉+响应式）、D4 新增设计 QA 过检 ⑤ 风险新增 R11~R14（工期溢出 / 中文字体体积 / 字体 CDN 可达性 / 对比度）⑥ 附录 B 约束同步改写。*
