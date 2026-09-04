# BONDSHIFT 生产验收证据清单

## 生产环境

- 生产地址：`https://bondshift-demo.netlify.app/`
- 验收版本：`fbe8d006e7b03a19296949a821d0bc65b8c38f8c`
- 最终结论：生产冒烟9/9通过，满足可上线技术条件。

## 证据文件

| 文件 | 含义 | 结论 |
|---|---|---|
| `redirect/vr-redirect-final.png` | 旧`/vr`链接最终落到首页 | PASS |
| `redirect/voice-redirect-final.png` | 旧`/voice`链接最终落到首页 | PASS |
| `redirect/compare-redirect-final.png` | 旧`/compare`链接最终落到首页 | PASS |
| `lighthouse-mobile-report.html` | 生产移动端Lighthouse可视报告 | 97/100/100/100 |
| `lighthouse-mobile-report.json` | Lighthouse结构化原始结果 | LCP 1.405s，CLS 0 |
| `issues/chat-before-reload.png` | A-6修复前聊天页正常状态 | 根因对照 |
| `issues/chat-after-reload.png` | A-6修复前刷新后空白页 | P0复现证据 |
| `issues/chat-after-hotfix-reload.png` | A-6修复后刷新恢复聊天页 | PASS |
| `issues/home-after-hotfix-back.png` | A-6修复后返回进入首页 | PASS |

## 最终复验摘要

- ✅落地页渲染与浏览器Console正常。
- ✅三道题稳定得到顾怀瑾90%匹配并进入首次相遇。
- ✅刷新聊天页后消息恢复且页面非空白。
- ✅返回按钮进入`/home`，换乘页与报告页可达。
- ✅DeepSeek生产接口返回HTTP 200真实回复，无降级横幅。
- ✅真实回复后本地持久化共3条消息，刷新后用户消息与AI回复仍显示。
- ✅Netlify Function日志安全由监督人人工检查通过，未发现聊天正文或API密钥明文。
