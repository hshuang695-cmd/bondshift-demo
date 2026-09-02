# D5-1 收尾 · Codex 执行指令 v4（最终版，2026-09-03 00:35 签发，替代 v3）

> 监督人签发。**本指令自包含，无需额外确认即可执行。** 仅本地提交，禁止推送。预计 20–30 分钟。

---

## 一、任务目标与背景

**目标**：完成 D5-1（最终门禁）与 D4-1-R（Safari 兼容四点）的文档收尾与提交归档，使工作区清空、PRD 进度推进至 22/28。

**背景**：8/31 修复循环已全部收口（R1 SEO `a53d81c` → R2 LCP fail-fast `4372442` → R3 对比度 `9b98ab5` → D4-5 设计 QA 归档 `a62869a`，当前 HEAD）。D5-1 的执行/测量部分与 D4-1-R 已由监督人于 9/3 00:05–00:25 **预执行完毕，结果全部 PASS**：

| 预执行项 | 结果 |
|---|---|
| lint | ✅ 0 error 0 warning |
| build | ✅ 9/1 监督人验证通过（主包 237.65KB / gzip 76.5KB）；自 R2 后业务源码零变更，磁盘 dist 即已验证产物 |
| e2e-onboarding / desktop-responsive / responsive-quality | ✅ 三套全 PASS（退出码 0） |
| 9 档 × 8 页零溢出矩阵 | ✅ **72/72 PASS**（`tests/d51-matrix-zero-overflow.mjs`，证据 `docs/evidence/after/responsive/matrix/` 共 73 项 = 72 图 + matrix-results.txt） |
| D4-1-R Safari 四点 | ✅ 全 PASS（WebKit 引擎自动化；报告 `docs/2026-09-03-d41r-safari-test-report.md`，证据 `docs/evidence/after/safari/` 9 张） |

D5-1 逾期原因：9/1 Codex 会话未触发；D4-1-R 改为 WebKit 引擎自动化执行。**你从下述步骤 P1 开始执行，禁止重跑门禁与矩阵。**

---

## 二、涉及文件与模块范围

**允许改动（白名单，仅限下列文件）**：

| 类别 | 文件 |
|---|---|
| 新建 | `docs/daily/2026-09-01.md` |
| 编辑回填 | `docs/2026-08-27-31-prd-responsive-deploy.md`（仅 6.1 / 6.2 节） |
| 纳入提交（已存在，不得修改内容） | 6 份监督文档：`docs/2026-09-01-d41r-safari-test-checklist.md`、`docs/2026-09-01-d51-final-gate-prompt.md`、`docs/2026-09-02-d51-execution-prompt.md`、`docs/2026-09-02-prd-deploy-day.md`、`docs/2026-09-02-today-plan-rev2.md`、`docs/2026-09-03-d41r-safari-test-report.md`、以及本指令 `docs/2026-09-03-d51-codex-handoff.md` |
| 纳入提交（已存在） | `tests/d41r-webkit-safari-check.mjs`、`tests/d51-matrix-zero-overflow.mjs`、`docs/evidence/after/` 全部（9 张 M 状态再生证据 + matrix/ 73 项 + safari/ 9 张） |

**禁止改动**：`src/` 全部、`netlify/`、`netlify.toml`、`index.html`、`package*.json`、`vite.config.ts`、`tsconfig*`、`dist/`、既有测试脚本内容、上述「纳入提交」文档的内容。

---

## 三、代码规范与约束条件（硬性，违反即停止）

1. **仅本地提交**：禁止 `git push`、`amend`、`rebase`、`--no-verify`。
2. **零业务代码修改**：全量代码冻结生效中（9/2 12:00 起），样式问题只登记不修复。
3. **依赖冻结**：不安装、不升级任何依赖；不动 Netlify 配置与环境变量。
4. **禁止重跑**：门禁三件套、e2e、9 档矩阵均不得重跑（监督人已预执行）。
5. **提交纪律**：commit message 前缀严格按下文给定文本，不得改写。
6. **异常即停**：执行前先 `git log --oneline -3` 确认 HEAD 为 `a62869a`、`git status --porcelain` 输出与本指令「背景」节描述的工作区清单一致（9 M + 7 ?? 文档 + 2 ?? 目录 + 2 ?? 脚本）；**任何不符 → 立即停止并报告，不得自行修复。**

---

## 四、执行步骤（按优先级严格按序，含预期产出与完成标准）

### P1｜9/1 日报（优先级最高：逾期补执行记录）

- **动作**：新建 `docs/daily/2026-09-01.md`，结构沿用 `docs/daily/2026-08-31.md`：
  1. 今日目标：D5-1 最终门禁 + D4-1-R Safari 四点；
  2. 开工前差异：D5-1 逾期至 9/3 补执行（原因：9/1 Codex 会话未触发）；D4-1-R 改为 Playwright WebKit 引擎自动化执行（原 Safari 15 人工手测降级方案）；
  3. 执行记录：引用上文预执行结果表 + 截图路径（`docs/evidence/after/responsive/matrix/`、`docs/evidence/after/safari/`）+ Safari 报告路径；
  4. 问题与处理：C4 手册判定线修正说明（h1 设计上用 font-serif，Fraunces 用于品牌词、Petit Formal Script 用于标语——原判定线写错，实现正确）；
  5. 今日结果：PRD 进度 22/28，D4-1-R 与 D5-1 收口；
  6. 次日计划：D5-2 环境变量复核 → D5-3 生产冒烟 → D5-4 预算台账 → 上线判定（push 由监督人拍板）。
- **预期产出**：`docs/daily/2026-09-01.md`。
- **完成标准**：六节齐全；PRD 进度数字为 22/28；所有证据路径真实存在。

### P2｜回填主 PRD（依赖 P1 完成）

- **动作**：编辑 `docs/2026-08-27-31-prd-responsive-deploy.md`：
  1. **6.2 节**：补一行 9/1 执行结果小表（仿 8/29 格式，注明「补执行日期 2026-09-03」）；
  2. **6.1 表 I-6 行**（当前第 159 行附近，状态 🟡）：更新为 ✅，附证据路径 `docs/evidence/after/responsive/matrix/`（72/72 PASS，覆盖 320–1920 全部 9 档）；
  3. **6.1/6.2 的 D4-1-R 行**（第 399/407 行附近，状态 ⏳）：更新为 ✅，附证据路径 `docs/2026-09-03-d41r-safari-test-report.md` 与 `docs/evidence/after/safari/`（注明 WebKit 自动化代测）。
- **预期产出**：主 PRD 更新。
- **完成标准**：I-6 与 D4-1-R 两行状态为 ✅ 且带证据路径；除 6.1/6.2 外其余章节零改动。

### P3｜双 commit 提交（依赖 P1、P2 完成）

- **动作**（两个 commit，按序执行）：
  ```bash
  # Commit 1：监督人文档归档（7 份）
  git add docs/2026-09-01-d41r-safari-test-checklist.md \
          docs/2026-09-01-d51-final-gate-prompt.md \
          docs/2026-09-02-d51-execution-prompt.md \
          docs/2026-09-02-prd-deploy-day.md \
          docs/2026-09-02-today-plan-rev2.md \
          docs/2026-09-03-d41r-safari-test-report.md \
          docs/2026-09-03-d51-codex-handoff.md
  git commit -m "docs: 归档 9/1-9/3 监督人文档（Safari手测/D5-1指令/今日安排）"

  # Commit 2：D5-1 主体（预执行产物 + 日报 + PRD 回填）
  git add tests/d41r-webkit-safari-check.mjs \
          tests/d51-matrix-zero-overflow.mjs \
          docs/daily/2026-09-01.md \
          docs/2026-08-27-31-prd-responsive-deploy.md \
          docs/evidence/after/
  git commit -m "[D5-1] 最终门禁：三件套+e2e+9档全页矩阵72项零溢出+D4-1-R Safari四点全过（9/3补执行）"
  ```
- **预期产出**：基于 `a62869a` 的两个本地 commit。
- **完成标准**：见第五节验证清单全部通过。

---

## 五、终局验证（P3 后立即执行并回报）

1. `git status --porcelain` 输出为**空**。
2. `git log --oneline -3` 顶部依次为：`[D5-1]` commit、`docs:` 归档 commit、`a62869a`。
3. `git show --stat <归档commit>`：恰好 7 份文档，无串组。
4. `git show --stat <[D5-1]commit>`：含 2 脚本 + 日报 + 主 PRD + `docs/evidence/after/`（9 M + matrix 73 项 + safari 9 张）。
5. **回报格式**（回报给监督人，供 T3 收工核对）：两个 commit 哈希 + 两条 `git show --stat` 摘要 + 日报中的 PRD 进度数字。

---

## 六、依赖与注意事项

- **依赖**：无前置任务——所有测量与测试均已由监督人完成；本指令不依赖任何新环境变量、网络或构建产物。
- **注意事项**：
  1. 9 张 M 状态证据（如 `home-375.png`）是「最新一次通过的结果」，属预期再生，一并纳入 Commit 2，**不要还原**；
  2. 矩阵目录中 `matrix-results.txt` 与 72 张截图合计 73 项，属正常；
  3. 不要尝试重建 build 或清理 `dist/`（磁盘 dist 即 R2 后已验证产物）；
  4. 遇任何 git 冲突、文件缺失、HEAD 不符 → 异常即停，报告后等待监督人裁决；
  5. 完成后**不要**开启 9/3 任务（D5-2/D5-3/D5-4），等待下一份指令。
