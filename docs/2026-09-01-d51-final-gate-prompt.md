# D5-1 最终门禁 · Codex 执行指令（2026-09-01 签发）

> 监督人签发。执行窗口：9/1 当日，18:00 页面级视觉冻结前完成。仅本地提交，禁止推送。

## 一、任务背景

8/31 修复循环已全部收口：R1 SEO（`a53d81c`，两端 83→100）、R2 LCP fail-fast 终局（`4372442`，主包 237.65KB）、R3 对比度（`9b98ab5`，A11y 移动端 100）、D4-5 设计 QA 证据归档与页面级视觉冻结确认（`a62869a`）。PRD 有效任务 22/28（D4-5 归档后，请你在日报回填时更新此数）。剩余唯一 Codex 任务为 D5-1 最终门禁。

## 二、执行步骤（严格按序）

1. **三件套门禁**：`npm run lint`（0/0）→ `npm run build`（成功，主包应 ≈237.65KB / gzip ≈76.5KB）→ 依次运行 `node tests/e2e-onboarding.mjs`、`node tests/e2e-desktop-responsive.mjs`、`node tests/e2e-responsive-quality.mjs`（全部 PASS，需可审计输出；工具捕获失败即停止报告）。
2. **9 档全页矩阵（I-6 收口）**：在 `tests/` 新建一次性脚本（或扩展 `capture-responsive-evidence.mjs`，不改已有输出路径），对 8 个页面（landing/setup/match/chat/swap/report/settings/home）在 **320/375/390/768/834/1024/1280/1440/1920** 共 9 档宽度逐页断言 `document.documentElement.scrollWidth <= window.innerWidth`，截图存 `docs/evidence/after/responsive/matrix/`（命名 `<page>-<width>.png`）。**零溢出断言全过**为验收线；任何一档溢出 → 停止报告，不得自行修改样式。
3. **9/1 日报**：新建 `docs/daily/2026-09-01.md`（结构沿用 8/31）：今日目标（D5-1 最终门禁）、开工前差异（D4-5 由 Codex 16:25 归档 `a62869a`，冻结确认随附）、执行记录（三件套结果 + 矩阵 72 项结果 + 截图路径）、问题与处理、今日结果（PRD 进度 22/28）、次日计划（D5-2 监督人 → D5-3 生产冒烟 → 12:00 全量冻结）。
4. **回填主 PRD**：`docs/2026-08-27-31-prd-responsive-deploy.md` 6.2 节 9/1 表格补「执行结果」小表（仿 8/29 格式）；6.1 表 I-6 行状态更新为 ✅（附矩阵证据路径）。
5. **提交**：
   ```bash
   git add tests/ docs/daily/2026-09-01.md docs/2026-08-27-31-prd-responsive-deploy.md docs/evidence/after/responsive/
   git commit -m "[D5-1] 最终门禁：三件套+e2e+9档全页矩阵72项零溢出，I-6收口"
   ```
   （e2e/矩阵再生的既有证据截图一并随最新通过结果提交。）

## 三、工作范围

| 允许改动 | 禁止改动 |
|---|---|
| `tests/`（新增矩阵脚本）、`docs/daily/2026-09-01.md`（新）、主 PRD 6.1/6.2 回填、`docs/evidence/after/responsive/`（新增矩阵截图与再生证据） | `src/` 全部、`netlify/`、`netlify.toml`、`index.html`、`package*.json`、`vite.config.ts`、`tsconfig*` |

## 四、完成验证与回报

1. `git status --porcelain` 为空。
2. `git log --oneline -3` 顶部为 `[D5-1]` commit（基于 `a62869a`）。
3. `git show --stat` 核对：矩阵脚本 + 72 张截图 + 日报 + PRD 回填，无串组。
4. 回报格式：三件套结果 / 矩阵 72 项 PASS 明细（9 档 × 8 页一行汇总表）/ commit 哈希。

## 五、约束（硬性）

1. 仅本地提交；禁止 push、amend、rebase、--no-verify。
2. 零业务代码修改；样式问题只报告不修复。
3. 不安装、不升级任何依赖；不动 Netlify 配置与环境变量。
4. 异常即停：门禁失败、矩阵溢出、git 状态与清单不符 → 停止报告。
5. 完成后 18:00 前回报，页面级视觉冻结由监督人确认生效。
