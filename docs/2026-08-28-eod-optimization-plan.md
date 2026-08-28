# BONDSHIFT 当日优化执行计划（交付 Codex · 2026-08-28 收尾批）

> **执行前提**：本地基线 `085cb79`（main，领先 origin/main 12 个提交，含并行会话的 `965fa6e [D1-2 补遗]` 字体 Latin 子集限定）；工作区干净；质量门禁全绿（lint 0/0、build 主 JS 达标、两套 e2e PASS）。
> **执行纪律**：沿用 PRD v1.3 附录 B（B-6 每任务一 commit、B-4 门禁命令、B-1 改动白名单）；完成后写入当日日报。
> **背景数据**：今日完成率 94.4%（17/18）；PRD 整体 60.7%；新版浅色 Dreamcore 视觉尚未上线公开 Netlify 站点。

---

## 第一部分 · 今日必须完成（按优先级排序执行）

### P0-1 线上视觉版本同步（中等优先级 · 影响公开验收与线上可见性）

**处理顺序**：第 1 项执行（推送与部署是后续一切线上验证的前提）。

**目标结果**：公开 Netlify 站点与本地 `a51090d` 完全一致——落地页与匹配页呈现浅色 Dreamcore 视觉，公开验收不再看到旧深色匹配页。

**执行步骤**：
1. 门禁复核（推送前最后一次确认）：`npm run lint` → `npm run build` → `npm run preview -- --host 127.0.0.1 &` → `node tests/e2e-onboarding.mjs` → `node tests/e2e-desktop-responsive.mjs`，四项全绿才继续。
2. `git push origin main`（推送 12 个提交：`d6764eb`→`085cb79`，含批 A/批 B 全部实施、D1-2 补遗、终审报告、PRD v1.3、本计划）。
3. 等待 Netlify 自动构建（现有推送即部署流程，`netlify.toml` 勿动）；通过 `git rev-list --count origin/main..main` 确认归零。
4. 生产冒烟（可脚本化项，用 playwright 对生产 URL 执行）：
   - 落地页渲染浅色新视觉（brand-500 `#B45A78`、Cloud White 底、衬线标题），控制台 0 错误；
   - 走完三道题 → 匹配页为**浅色**（无 `#2f292e` 深底）→「修改答案」可用；
   - 旧链接 `/vr`、`/voice`、`/compare` 重定向回 `/home`；
   - 刷新后聊天记录仍在（本地持久化）。

**涉及文件**：无文件修改（纯推送与验证）；冒烟脚本可临时运行不落盘。

**验收标准**：
- [ ] `origin/main` 与本地 `main` 一致（领先数 0）
- [ ] 生产 URL 落地页呈新视觉、匹配页为浅色、无控制台错误
- [ ] 三个旧链接均 302/重定向至 `/home`
- [ ] 冒烟结果（含截图 2 张：生产 landing-375、match-375）记入当日日报

**边界条件**：`DEEPSEEK_API_KEY` 配置属监督人 D5-2 职责，本轮冒烟**不含**"真实 AI 回复"项（PRD R6 条款：密钥缺失不阻断发布，AI 验收顺延记日报）；若 Netlify 构建失败，核对日志后按 PRD 5.6 处理，禁止改 `netlify.toml`。

---

### P0-2 D1-8 响应式截图证据补齐（进行中 · 证据完整性）

**处理顺序**：第 2 项执行（可紧接 P0-1 之后；截图脚本跑本地 preview 即可，不依赖线上）。

**目标结果**：8 页 × 3 标准宽度（375/768/1440）= 24 张截图全部归档；PRD 缺口统计由误记 12 张修正为实际 14 张。

**实际缺口清单（14 张，已按目录实况核实）**：
```
setup-375.png / setup-768.png / setup-1440.png
chat-375.png  / chat-768.png  / chat-1440.png
swap-768.png  / swap-1440.png
settings-375.png / settings-768.png
match-768.png
landing-375.png / landing-768.png
report-768.png        ← PRD v1.3 缺口清单遗漏项，必须补拍
```

**执行步骤**：
1. 启动 `npm run preview -- --host 127.0.0.1`（注意：必须带 `--host 127.0.0.1`，默认仅绑 IPv6 会导致 127.0.0.1 拒连）。
2. 用 playwright 截图脚本补拍 14 张：
   - 普通页面（landing/report/settings/swap/home）直接 goto + 等待 900–1600ms 动画收尾后截图；
   - **setup/match/chat 有状态依赖**：需在同一浏览器上下文先走完三道题流程（参考 `tests/e2e-desktop-responsive.mjs` 与既有 match 截图做法），再逐档设置 viewport 截图；chat 需先经「初次见面」进入对话。
3. 同步修正文档统计（两处）：
   - `docs/2026-08-27-31-prd-responsive-deploy.md` 6.2 D1-8-R：缺口「12 张」→「14 张」，清单补入 `report-768`；
   - 同文件 6.1 表 D1-8 行：「12/24 张」→「10/24 张（补齐后 24/24）」；
   - `docs/daily/2026-08-28.md` 日报记录补齐结果。

**涉及文件**：
- `docs/evidence/after/responsive/`（新增 14 张 png）
- `docs/2026-08-27-31-prd-responsive-deploy.md`（D1-8-R 与 6.1 统计修正）
- `docs/daily/2026-08-28.md`（日报）

**验收标准**：
- [ ] `ls docs/evidence/after/responsive/` 含 8 页 × 3 档共 24 张（外加 chat-1920 共 25 张），命名 `<页面>-<宽度>.png`
- [ ] PRD 中无「12 张」旧统计残留（`grep -n "12 张" docs/2026-08-27-31-prd-responsive-deploy.md` 仅剩变更历史性引用或零命中）
- [ ] 截图内容为新视觉（浅色 Dreamcore），chat/match 截图非空、非 setup 页错拍

**边界条件**：不修改任何 `src/` 文件；截图脚本不新增依赖（playwright 已装）；若某档出现水平溢出或布局破碎，记录现象并作为 D4 修复项，**不得为截图通过而临时改样式**。

**Commit 划分**（B-6 纪律）：
- `[D1-8-R] 补齐 14 张响应式截图证据`（截图 + PRD 统计修正 + 日报）
- P0-1 推送后如产生新 commit（本计划内不应产生代码 commit），一并推送。

---

### P0-3 今日收尾动作（D4/D5 预启动）

**执行顺序**：P0-1、P0-2 完成后执行。

1. 更新 `docs/daily/2026-08-28.md` 收工记录：P0-1 冒烟结果、P0-2 补齐结果、明日（8/29）计划按 PRD 6.2 执行 D4-3-R（320/768/1440 e2e 全断点回归）与 D4-4（viewport 横跳脚本）。
2. 最终推送：`git push origin main`（含截图与文档修正 commit）。
3. 完成后状态预期：今日完成率 18/18（100%）；PRD 整体完成率由 60.7% 提升至约 63.6%（D1-8 结项，21/33）；线上/本地/文档三者一致。

---

## 第二部分 · 记录待办、后续复核（今日不做）

| # | 事项 | 严重度 | 处理建议 | 建议时间窗 |
|---|---|---|---|---|
| TBD-1 | `package.json:22` 声明 `recharts: ^3.8.1`，但 `src/` 零引用——与 PRD v1.3「项目没有 recharts」表述不一致 | 低 | **今日不动**（PRD CH-08：剩余阶段禁止改 package.json；该声明不影响 dist 产物体积，属依赖卫生问题）。记入 `docs/baseline.md` 待办清单；D5 上线完成后（9/2 后）经监督人批准执行 `npm uninstall recharts` + 三件套复验 + PRD 表述微调（「源码未使用、声明已于 D5 后移除」） | 9/2 之后 |
| TBD-2 | 构建出现 Node DEP0205 弃用警告，暂不影响产物 | 低 | 仅记录：写入 `docs/baseline.md` 待办（"Node 升级时复核 DEP0205 涉及的 http 弃用 API，出自 vite dev server 或 Netlify Function 侧"）；不阻塞任何 D4/D5 任务 | 下次 Node/Vite 升级窗口 |
| TBD-3 | Netlify `DEEPSEEK_API_KEY` 生产变量（PRD 1.2 现状表唯一遗留项） | 中（D5 前置） | 提醒监督人在 9/2 D5-2 前配置；Codex 无后台权限，仅可脚本化验证冒烟项 | 9/2 之前（监督人） |

---

## 第三部分 · 执行顺序总览

```
门禁复核（lint/build/两套 e2e）
  → P0-1 git push origin main → Netlify 自动构建 → 生产冒烟（可脚本化项）
  → P0-2 补拍 14 张截图（含 report-768）→ PRD 统计修正（12→14、10/24）
  → P0-3 日报收尾 → 最终推送
  → TBD-1/2/3 记入 baseline.md 待办（不改 package.json）
```

**硬约束重申**：本计划全部动作不修改 `src/` 业务代码、不动 `package.json`、不动 `netlify.toml`；任何偏离白名单的需求停下询问监督人（PRD B-1/B-7/B-8）。
