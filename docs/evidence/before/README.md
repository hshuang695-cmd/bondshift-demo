# 📸 BONDSHIFT 改版前视觉证据清单

📅基线日期：2026年8月18日。  
🎯用途：支持作品集中的改版前后对比和问题说明。

## 📱 移动端截图

- 📸`mobile-home.png`记录默认首页与首屏信息层级。
- 📸`mobile-setup-step1.png`记录16项MBTI首次认知负担。
- ✅`mobile-chat.jpg`已记录模板聊天与输入区布局。
- ✅`mobile-swap.jpg`已记录当前换乘列表和确认流程。
- ✅`mobile-swap-confirm.jpg`已记录换乘理由与确认弹窗，作为原对比占位页截图的替代证据。
- ✅`mobile-report.jpg`已记录报告的信息密度。
- ✅`mobile-voice-placeholder.jpg`已记录虚假通话状态。
- ✅`mobile-vr-placeholder.jpg`已记录VR占位状态。

## 🖥️ 桌面端截图

- ✅`desktop-home.png`已记录430像素手机容器在桌面环境中的呈现。
- ✅`desktop-setup1.png`、`desktop-setup2.png`和`desktop-setup3.png`已记录三步偏好设置。
- ✅`desktop-swap.png`已记录桌面端换乘页面布局。

## 🧭 截图要求

📐移动端建议使用390乘844像素视口。  
📐桌面端建议使用1440乘900像素视口。  
🔒截图中不要包含真实姓名、账号、聊天隐私或API信息。  
🗂️文件名必须与本清单一致。  
📝每张截图完成后应在下方记录一个主要问题。

## 🛠️ 2026年8月18日执行说明

⚠️自动截图流程受到本机Playwright缓存目录权限限制，系统不允许在用户级缓存目录创建浏览器会话。  
🛡️本次执行没有修改系统目录权限，也没有运行管理员命令。  
📌截图需要在普通浏览器中手动完成，或在后续具备可写浏览器缓存环境时补充。  
🌐本地截图时可运行`npm run dev -- --host 127.0.0.1 --port 4173`并访问`http://127.0.0.1:4173/`。  
📐请先截取390乘844像素移动视口，再截取1440乘900像素桌面视口。

## 📝 观察记录

- 📝`mobile-home.png`主要问题：首次访问直接看到默认男友，且同时暴露语音与VR占位入口。
- 📝`mobile-setup-step1.jpg`主要问题：首次设置一次展示16个MBTI选项，认知负担偏高。
- 📝`mobile-chat.jpg`主要问题：回复呈现较模板化，未体现长期记忆能力。
- 📝`mobile-swap.jpg`主要问题：展示虚构“已换”人数与非零初始换乘次数。
- 📝`mobile-swap-confirm.jpg`主要问题：换乘确认没有说明旧关系和记忆如何保留，并继续展示虚构社会证明。
- 📝`mobile-report.jpg`主要问题：首次用户面对的信息量较大，核心行动不明确。
- 📝`mobile-voice-placeholder.jpg`主要问题：固定显示通话中与00:42，容易被误解为真实能力。
- 📝`mobile-vr-placeholder.jpg`主要问题：页面明确暴露占位组件，降低公开作品可信度。
- 📝`desktop-home.png`主要问题：桌面端仍是固定窄屏手机容器，两侧存在大量空白。
