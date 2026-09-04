# 【裁决与授权 A-6】D5-3 生产冒烟 P0 热修复 —— 回复 Codex 指令

> 监督人签发 · 2026-09-03 22:40 · 授权记录已入 `docs/2026-08-31-prd-repair-loop.md` 第八章
> 以下正文可直接整段复制发给 Codex（push 授权段见第 5 节，由监督人确认后发出）

---

你的停止正确，两项 P0 均经监督人独立复核属实，准予进入冻结期热修复。按下方 A-6 窄豁免白名单执行。

## 一、监督人复核结论（声明 → 证据 → 结论）

| 你的声明 | 复核证据 | 结论 |
|---|---|---|
| 刷新后 `Maximum update depth exceeded`、页面空白 | `docs/evidence/production/issues/chat-after-reload.png`（整页空白）vs `chat-before-reload.png`（正常渲染 1 条消息 + 快捷回复）；根因定位 `src/pages/ChatPage.tsx` L48-50：selector 兜底 `?? []` 每次返回新引用，zustand v5（useSyncExternalStore）下 quickReplies 未持久化时形成不稳定快照 → 无限更新循环 | ✅ 属实，P0 |
| `navigate(-1)` 导航闭环 | 同文件 L96（男友未找到兜底）与 L111（Header 返回键）两处 `navigate(-1)`，聊天页隐藏全局导航 | ✅ 属实，P0 |
| localStorage 持久化正常（刷新前后保留 1 条消息） | 截图佐证 | ✅ |
| 复现证据已归档 | `docs/evidence/production/issues/` 2 张 | ✅ |

准确状态采纳你的表述：**数据已持久化，但恢复渲染失败**。不回滚，按热修复推进（理由与你不谋而合：旧版本同类问题未验证，当前修复范围小且已定位）。

## 二、A-6 授权范围（白名单，超出即异常即停）

1. **仅允许修改 `src/pages/ChatPage.tsx`**：
   - 修复 1：L48-50 selector 兜底空数组改为模块级常量稳定引用（如 `const EMPTY_QUICK_REPLIES: string[] = []` 后 `?? EMPTY_QUICK_REPLIES`）；如你认为 useMemo 方案更优可说明理由后采用，但禁止引入新依赖或改动 store 定义；
   - 修复 2：L96 与 L111 两处 `navigate(-1)` → `navigate('/home')`（两处同属导航闭环问题，一并修）。
2. **新增 1 条回归测试**（放 `tests/`，与现有 e2e 同栈）：进入聊天 → 刷新 → 聊天记录仍显示 → 无 Console 错误且非空白页 → 点返回落在 `/home` → 可进入换乘页与报告页。
3. `docs/evidence/production/` 已有证据不得改动。
4. 除上述外，零改动：禁碰 `src/` 其他文件、store、样式、依赖、Netlify 配置。

## 三、门禁（提交前必须全绿，回报数值证据）

1. `npm run lint` → 0 error 0 warning；
2. `npm run build` → 主包体积 ≤273KB（报实际 KB 与 gzip）；
3. 三套 e2e（onboarding / desktop-responsive / responsive-quality）→ 全 PASS；
4. 新增回归测试 → PASS。

## 四、提交纪律

- **单个 commit**：
  ```
  [D5-HOTFIX] P0热修复：聊天页刷新无限渲染崩溃（zustand不稳定快照兜底）+ 返回改导航至/home解除闭环（附回归测试）
  ```
- 两份计划文档（`docs/2026-09-03-day-plan.md`、`docs/2026-09-03-day-plan-execution.md`）**本次不提交**，留待 D5-5 与日报一并归档；
- 验收标准调整：原「`git status --porcelain` 为空」改为「**除上述两份计划文档外全部清空**」。

## 五、push 与重新部署（需监督人最终确认，见下方条件授权）

- **条件授权**：门禁四项全绿 + commit 完成后，**授权 `git push origin main`**（此前禁 push 约束就此一次性解除，仅限本次）；push 后 Netlify 自动部署，等部署变绿。
- **生产复验**（push 后必做）：①聊天页刷新恢复渲染（原 P0-1）；②返回落 `/home` 且可达换乘/报告页（原 P0-2）；③冒烟第 3 项核心链路、第 4 项 DeepSeek 真实回复、第 6 项持久化抽查。

## 六、回报格式

1. 门禁四项数值（lint 0/0、build 体积、e2e 3/3、回归测试结果）；
2. commit 哈希 + `git show --stat`；
3. push 后部署链接与复验 5 项结果；
4. 异常即停条款不变：门禁任一失败、发现需超出白名单的改动、生产复验再失败 → 停止并报告。预计 30–45 分钟。
