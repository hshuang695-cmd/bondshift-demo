# BONDSHIFT 8/30 晚间冲刺 PRD（D4-2 Lighthouse 性能验收）

| 项目 | 内容 |
|---|---|
| 文档版本 | v1.0（2026-08-30 22:40 监督人签发） |
| 执行窗口 | 2026-08-30 22:40 — 24:00（晚间冲刺；白天窗口空转，见主 PRD CH-10） |
| 执行者 | Codex（T1/T2）+ 监督人（T3，可顺延 8/31 上午） |
| 代码基线 | commit `b9ed89c`（8/29 检查点已落地，未推送；lint/build/三套 e2e 全绿） |
| 主文档 | `docs/2026-08-27-31-prd-responsive-deploy.md`（v1.4）——排期与验收基线以主 PRD 为准，本文档提供执行细节与提示词 |
| 产出物 | `docs/evidence/after/responsive/lighthouse-mobile.json`、`lighthouse-desktop.json`、`docs/daily/2026-08-30.md`、本地 commit `[D4-2]` |

---

## 一、昨日（8/29）完成情况衔接

- ✅ **D1-8-R**（`a847c5c`）：24/24 标准断点截图 + chat-1920，5 张失真/过期证据已修复。
- ✅ **D4-3-R + D4-4**（`17df882`）：320/768/1440 三档主流程 PASS；999↔1025px 横跳 10 轮 PASS。
- ✅ **质量门禁**：lint 0/0；build 主 JS 237.64KB（gzip 76.48KB）；woff2 161.18KB；三套 e2e PASS（监督人独立复验）。
- ✅ **收尾**：8/29 日报 + PRD 20/28 回填 + 遗留文档归档（`0f326b0`/`b9ed89c`）。
- ⚠️ **8/30 白天窗口空转**：D4-2 / D4-1-R / 18:00 冻结检查点均未启动（无 Codex 会话触发）。根因与 8/27 停滞同型（会话未触发 + 监督环未运转），非技术阻塞。处置：今晚压缩 D4-2 为「纯测量不修复」，冻结检查点顺延 8/31 18:00，8/31 缓冲日吸收全部顺延项，9/1–9/2 节点不变。

## 二、今日目标

1. **P0 · D4-2 Lighthouse 双档测量**：移动端（375 仿真）与桌面端（1440）各跑一轮，JSON 证据归档，逐项对照门槛判定；不达标项登记后转 8/31，**今晚不做任何代码修复**。
2. **P0 · 收工三件套**：8/30 日报（避免触发「当日无日报 = 未完成」条款）+ 主 PRD 6.2 回填 + 本地检查点 commit `[D4-2]`（不推送）。
3. **P1 · D4-1-R Safari 15 手测四点**（监督人）：今晚或 8/31 上午完成即可，见第七节清单。

## 三、任务拆解

| # | 任务 | 优先级 | 执行方 | 依赖 | 预估 |
|---|---|---|---|---|---|
| T1 | D4-2 Lighthouse 移动+桌面双档测量、JSON 归档、结果判定与不达标项登记 | P0 | Codex | preview 服务（127.0.0.1:4173） | 15–25 min |
| T2 | 8/30 日报 + 主 PRD 6.2 回填 + 本地检查点 commit `[D4-2]` | P0 | Codex | T1 的测量结果 | 10–15 min |
| T3 | D4-1-R Safari 15 手测四点 + iOS 真机抽查 | P1 | 监督人 | 无（建议在 T1 后进行，避免争抢本机资源） | 15 min |
| T4 | 冻结检查点 | — | 监督人 | **顺延至 8/31 18:00**（检查 D4-2 + 修复循环是否全绿） | — |

## 四、验收标准

| 项 | 门槛 | 判定依据 |
|---|---|---|
| Performance（移动 375） | ≥ 85 | lighthouse-mobile.json |
| Performance（桌面 1440） | ≥ 90 | lighthouse-desktop.json |
| Accessibility / Best Practices / SEO | 各 ≥ 90 | 两档 JSON 均需达标 |
| LCP | < 2.5s | 两档 JSON |
| CLS | < 0.1 | 两档 JSON |
| 证据归档 | 两个 JSON 落盘 `docs/evidence/after/responsive/` | 文件存在且非空 |
| 质量门禁零回归 | 今晚不改代码，故三件套天然保持绿 | git diff 为空（T1 阶段） |
| 日报存在 | `docs/daily/2026-08-30.md` 含两档分数、LCP/CLS、不达标项清单、次日计划 | 文件内容 |
| 检查点落地 | 1 个本地 commit `[D4-2]`，工作树干净，未推送 | git log / git status |

**不达标处置**：单项未达标 → 登记后转 8/31 修复循环；连续 2 轮不达标 → 触发 M3 fail-fast（砍优化范围、问题记 baseline.md 待办）。

## 五、依赖关系

```
preview 服务(4173, --host 127.0.0.1)
   ├──► T1 移动端测量 ──► T1 桌面端测量 ──► T1 结果判定/登记
   │                                          │
   │                                          ▼
   └────────────────────────────► T2 日报+PRD回填+commit [D4-2]
T3 Safari 手测（独立，建议 T1 后、与 T2 并行均可）
T4 冻结检查点（8/31 18:00，依赖 8/31 修复循环收尾）
```

- T1 内部顺序：先移动后桌面（移动端门槛更紧，先拿到风险信号）。
- 若 T1 触发「顺手修复」冲动 → 违反边界条件，禁止；修复统一在 8/31 修复循环（每项一 commit + 重跑三件套 + 复测 Lighthouse）。
- 8/31 全部工作依赖 T1 的不达标项清单作为输入。

## 六、约束条件（今晚生效的硬性边界）

1. **零代码修改**：今晚 Codex 只产出测量 JSON、日报、PRD 回填；`src/`、`tests/`、`package*.json`、`netlify/`、`netlify.toml`、`vite.config.ts`、`tsconfig*` 一律只读。
2. `npx lighthouse` 属一次性 CLI 调用（主 PRD B-3 授权），**不得写入 package.json**。
3. 仅本地 commit，禁止 push / 部署 / 远端操作；提交纪律遵循 B-6（`[D4-2] 摘要`）。
4. 异常即停：CLI 下载失败、浏览器找不到、preview 拒连、JSON 未生成 → 停止并报告监督人。
5. 其余未列出事项一律遵循主 PRD v1.4 附录 B 全部硬约束。

---

## 七、Codex 提示词（按顺序逐条发送）

### 提示词 1 · T1：D4-2 Lighthouse 双档测量与证据归档

> **【任务背景】**
> BONDSHIFT 响应式改造已完成 20/28（主 PRD v1.4，基线 `b9ed89c`），今晚（8/30）P0 任务是 D4-2 Lighthouse 性能验收。本机为 macOS，系统 Chrome 位于 `/Applications/Google Chrome.app`。Lighthouse 通过 `npx lighthouse` 一次性调用（B-3 授权不视为依赖变更），目标页面为落地页 `/`（SPA 入口）。**今晚只测量、登记、汇报，不做任何代码修复**——不达标项统一转 8/31 修复循环。
>
> **【具体要求】**
> 1. 启动预览服务器：`npm run preview -- --host 127.0.0.1`（后台运行，端口 4173；必须带 `--host`，否则默认仅绑 IPv6 会导致拒连）。
> 2. 依次执行两档测量（工作目录为仓库根）：
>    - 移动端：
>      `npx lighthouse http://127.0.0.1:4173/ --preset=perf --form-factor=mobile --screenEmulation.mobile --output=json --output-path=docs/evidence/after/responsive/lighthouse-mobile.json`
>    - 桌面端：
>      `npx lighthouse http://127.0.0.1:4173/ --preset=perf --form-factor=desktop --screenEmulation.desktop --output=json --output-path=docs/evidence/after/responsive/lighthouse-desktop.json`
>    - 若 lighthouse 报找不到浏览器：追加环境变量 `CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"` 重试。
> 3. 从两个 JSON 中提取并汇报：Performance / Accessibility / Best Practices / SEO 四项分数（保留整数）+ LCP + CLS，并给出最大内容元素（LCP element）与 CLS 主要来源（若 JSON 含 audit 明细）。
> 4. 逐项对照门槛判定：Performance 移动 ≥85 / 桌面 ≥90；A11y / BP / SEO ≥90；LCP <2.5s；CLS <0.1。输出 ✅/❌ 对照表。
> 5. 不达标项逐一登记：指标名 / 实测值 / 差距 / 疑似原因（可参考：落地页头像图已用 `dist/avatars-optimized/*.jpg` 约 64–92KB；`dist/avatars/*.png` 为 1.8–2.2MB 未被在用代码引用）。**不修复。**
> 6. 测量完成后停止 preview 进程，确认 4173 端口释放。
> 7. 异常即停：npx 下载失败、JSON 未生成、preview 无法启动、指标提取报错 → 停止并报告，不得自行改代码或改命令参数范围。
>
> **【涉及文件范围】**
> - 新增（唯一允许的产出）：`docs/evidence/after/responsive/lighthouse-mobile.json`、`docs/evidence/after/responsive/lighthouse-desktop.json`
> - 只读：主 PRD 4.3 节（指标门槛）、`src/` 全部、`netlify.toml`
> - 禁止修改：`src/`、`tests/`、`package.json`、`package-lock.json`、`netlify/`、`netlify.toml` 及任何已有文件
>
> **【预期输出格式】**
> 汇报文本，包含：① 两档四项分数表 + LCP/CLS 数值表；② 对照门槛的逐项 ✅/❌ 判定表；③ 不达标项清单（指标/实测/差距/疑似原因），无则写「全绿」；④ 两个 JSON 文件路径确认 + preview 已停止、端口已释放确认；⑤ 一句话结论（是否需要 8/31 修复循环介入）。

### 提示词 2 · T2：8/30 日报 + 主 PRD 回填 + 检查点提交

> **【任务背景】**
> 8/30 晚间冲刺 T1 已完成：`lighthouse-mobile.json` / `lighthouse-desktop.json` 已归档至 `docs/evidence/after/responsive/`，测量结论为【此处由监督人粘贴 T1 汇报的结论行：两档分数 + 不达标项】。现需按每日交付纪律收工：写 8/30 日报、回填主 PRD、创建本地检查点。**仅本地提交，禁止推送。**
>
> **【具体要求】**
> 1. 新建 `docs/daily/2026-08-30.md`，结构沿用 8/29 日报（今日目标 / 昨日任务核对 / 开工前差异与决策 / 执行记录 / 问题与处理 / 今日结果与进度 / 次日计划），必须包含：
>    - 今日目标：P0 D4-2 Lighthouse 双档；P1 D4-1-R Safari 手测【监督人】；冻结检查点顺延 8/31 18:00。
>    - 开工前差异：白天窗口空转、22:40 启动晚间冲刺（v1.4 CH-10）；今晚「只测量不修复」边界。
>    - 执行记录：两档四项分数 + LCP/CLS 实测值 + JSON 路径。
>    - 问题与处理：不达标项逐条列出并注明「转 8/31 修复循环」；全绿则写明。
>    - 次日计划：8/31 修复循环（如需）+ D4-5 设计 QA【监督人】+ 冻结检查点 18:00。
> 2. 回填主 PRD `docs/2026-08-27-31-prd-responsive-deploy.md`：在 6.2 节「8/30 晚间冲刺」表格之后新增「**8/30 执行结果（2026-08-30 更新）**」小表（仿 8/29 执行结果表格式）：D4-2 状态 / 两档分数 / LCP/CLS / JSON 证据路径；D4-1-R 状态（监督人手测结果或「顺延 8/31 上午」）。
> 3. 创建本地 commit，message：`[D4-2] Lighthouse 双档测量与证据归档（移动 <分数>/桌面 <分数>）`；内容 = 2 个 JSON + 8/30 日报 + 主 PRD 回填。若 D4-1-R 监督人手测今晚已完成并有记录，另行单独 commit `[D4-1-R]`（无则不做）。
> 4. 完成后验证：`git status --porcelain` 为空；`git log --oneline -3` 显示新 commit；`git show --stat` 核对文件归属无串组。
> 5. 向监督人回报：commit 哈希 + 两档分数汇总 + 不达标项清单 + 次日建议。
>
> **【涉及文件范围】**
> - 新增：`docs/daily/2026-08-30.md`、`docs/evidence/after/responsive/lighthouse-mobile.json`、`lighthouse-desktop.json`（若 T1 后未提交）
> - 修改：`docs/2026-08-27-31-prd-responsive-deploy.md`（**仅** 6.2 节新增「8/30 执行结果」小表）
> - 禁止修改：`src/`、`tests/`、`package*.json`、`netlify/` 及上述清单外的任何文件
>
> **【预期输出格式】**
> ① 8/30 日报全文；② 主 PRD 回填的 diff 摘要（新增小表内容）；③ commit 哈希 + `git show --stat` 输出；④ 回报文本（分数汇总 / 不达标项 / 次日建议）。

## 八、监督人任务 · T3：D4-1-R Safari 15 手测四点（今晚或 8/31 上午）

对 `http://127.0.0.1:4173/`（本机 `npm run preview -- --host 127.0.0.1`）在 Safari 15+ 中逐项检查并记录（结果告知 Codex 记入日报）：

1. **100dvh 回退**：聊天页（走完三道情景题进入）在 Safari 下无高度塌陷/底部裁切（`viewport-full` 的 `@supports` 回退生效）。
2. **backdrop-filter**：带毛玻璃效果的元素（如导航/弹窗）渲染正常，无白块或性能卡顿。
3. **focus-visible**：Tab 键遍历导航与按钮，焦点描边（brand-400 2px）清晰可见。
4. **woff2 渲染**：标题衬线字体（Fraunces/Cormorant）正常显示为艺术字体，无系统字体回退。
5. （可选）iOS 真机抽查：视口无水平滚动、BottomNav 安全区、输入框聚焦不缩放、中文楷体回退正常。

发现的问题 → 记录截图与现象，转 Codex 在 8/31 修复循环处理（仅限 CSS/组件层）。

---

*本文档为 8/30 晚间冲刺一次性执行文档；8/31 起恢复以主 PRD v1.4 第 6.2 节排期为准。*
