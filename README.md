# BONDSHIFT

BONDSHIFT 是一款面向长期 AI 陪伴用户的关系换乘体验。新用户通过三道情绪支持情景题了解自己的陪伴偏好，获得稳定匹配，并在首次相遇后进入真实 AI 对话。

## 本地运行

```bash
npm install
npm run dev
```

只检查前端和安全降级时，Vite 即可运行。需要连同 Netlify Function 测试 DeepSeek 时，请安装 Netlify CLI 后使用 `netlify dev`。

## DeepSeek 服务端配置

在 Netlify 项目设置的环境变量中配置：

- `DEEPSEEK_API_KEY`：必填，只能存在于服务端，不使用 `VITE_` 前缀。
- `DEEPSEEK_MODEL`：可选，默认 `deepseek-chat`。
- `DEEPSEEK_API_URL`：可选，默认 DeepSeek Chat Completions 地址。

本地变量格式见 `.env.example`。不要提交真实密钥。

## 工程检查

```bash
npm run lint
npm run build
```

核心首次体验的浏览器验收脚本是 `tests/e2e-onboarding.mjs`。它覆盖三道情景题、返回修改、确定性匹配、首次相遇、快捷回复以及 AI 未连接时的降级与重试入口。

## 数据与隐私

- 匿名 ID 只保存在当前浏览器，不包含姓名、手机号或邮箱。
- 对话和记忆按男友 ID 隔离并保存在浏览器本地。
- 每次请求只向服务端发送当前男友最近 10 条对话。
- DeepSeek 不可用时保留用户消息，并使用本地人格回复降级。
