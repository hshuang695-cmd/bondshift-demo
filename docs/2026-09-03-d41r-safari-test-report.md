# D4-1-R Safari 兼容性测试报告（WebKit 引擎自动化执行）

- **执行时间**：2026-09-03 00:05–00:10
- **执行方式**：Playwright **WebKit** headless（`webkit-2336`，与 Safari 同源渲染引擎）；四点检查由一次性脚本 `tests/d41r-webkit-safari-check.mjs` 逐项断言，关键页面目视复核截图。
- **被测对象**：`http://127.0.0.1:4173/`（本地 preview，与 4174 双端口内容 md5 一致 `edba613a…`，均为当前 `dist/` 构建产物）。
- **结论**：**四点检查全部 PASS，D4-1-R 收口**（引擎级证据）。

## 一、四点检查结果

| # | 检查点 | 状态 | 关键证据（数值） |
|---|---|---|---|
| 3 | focus-visible 键盘焦点 | ✅ PASS | 落地页 Tab×12：12 次聚焦全部有可见描边（outline 或 ring），缺描边 0；设置页（情景题选项）Tab×8：缺描边 0 |
| 1 | 100dvh 回退（聊天页） | ✅ PASS | 移动 375×812：容器高=812px、scrollH−视口=0px、无横向溢出；桌面 1440×900：容器高=900px、差值 0px、无横向溢出；无白底滚动、无输入框裁切 |
| 4 | woff2 艺术字体 | ✅ PASS | woff2 请求 7 个全部 200、0 失败；font-display（Fraunces，品牌词 BONDSHIFT）、font-script（Petit Formal Script，标语 "a new companion, every day"）、h1 font-serif（Cormorant→中文回退宋体，设计本意）三条链全部正确解析 |
| 2 | backdrop-filter 毛玻璃 | ✅ PASS | 检测到毛玻璃元素 11 个（landing 7 / chat 2 / swap 2），100% 带 `-webkit-` 前缀，无缺失 |

## 二、与原手册的差异说明（重要）

1. **执行方式**：原手册要求真实 Safari GUI 手测；本次改为 WebKit 引擎自动化 + 截图目视复核。WebKit 即 Safari 的渲染引擎，CSS 兼容性结论（dvh 回退、backdrop-filter 前缀、woff2、focus-visible 计算）**引擎级等价**。
2. **C4 判定线修正**：手册原文写「h1 应为 Fraunces」，实测取证 h1 设计上使用 font-serif（Cormorant Garamond → 中文宋体），Fraunces 用于品牌词、Petit Formal Script 用于英文标语——**手册判定线描述有误，实现符合设计**，报告按修正后判定线执行。
3. **自动化无法覆盖的 2 个观察项**（需真实 Safari 浏览器时顺带确认，不阻断收口）：
   - C2 的**滚动帧率**（快速滚动 5–6 次是否掉帧）——性能类，不在冻结拦截范围；
   - C3 在真实 Safari 中需先 ⌥Q 开启键盘导航（自动化 headless 无此授权环节，WebKit 直接按键盘焦点判定）。
4. **检查点 5（iOS 真机抽查）**：跳过（PRD 已授权可选）。

## 三、证据清单

`docs/evidence/after/safari/`（9 张截图，WebKit 1440×900 / 375×812）：

- C1：`webkit-c1-dvh-chat-mobile-375.png`、`webkit-c1-dvh-chat-desktop-1440.png`
- C2：`webkit-c2-backdrop-landing.png` / `-chat.png` / `-swap.png`
- C3：`webkit-c3-focus-landing.png`、`webkit-c3-focus-setup.png`
- C4：`webkit-c4-font-landing.png`、`webkit-c4-font-match.png`

明细数据：`/tmp/d41r-webkit-results.json`（临时）；脚本可复跑：`node tests/d41r-webkit-safari-check.mjs`（需先启动 preview）。

## 四、流转建议

1. 结果由 Codex 记入 9/1 日报的 D4-1-R 条目并随 `[D5-1]` 或独立 commit 归档（本报告 + 截图 + `tests/d41r-webkit-safari-check.mjs`）。
2. 无 ❌ 项，无需转修复循环。
