# 📊 BONDSHIFT 首次体验埋点方案

📅版本：2026年8月18日定义稿。  
🎯目标：衡量首次体验完成率与传播转化。

## 🧭 核心漏斗

```text
landing_view
→ experience_start
→ quiz_start
→ quiz_complete
→ match_view
→ first_message_sent
→ five_turns_complete
→ swap_preview_view
→ first_swap_complete
→ share_card_generated
→ share_action
```

## 🏷️ 事件定义

| 🏷️事件 | 📍触发时机 | 📦必要属性 | 📊用途 |
|---|---|---|---|
| 🚪`landing_view` | 🌐落地页首次可见 | 🧾`session_id`、`source`、`device_type` | 📊计算访问基数与来源 |
| ▶️`experience_start` | 💗点击开始体验 | 🧾`session_id`、`source` | 📊计算开始体验率 |
| 🧩`quiz_start` | 💬第一道题可见 | 🧾`session_id` | 📊定位入口后流失 |
| 🧩`quiz_answered` | ✅提交每一道题 | 🧾`question_id`、`answer_id`、`step` | 📊分析题目卡点 |
| ✅`quiz_complete` | 🧠第三道题完成 | 🧾`duration_ms`、`result_type` | 📊计算测试完成率 |
| 💝`match_view` | 👤匹配结果可见 | 🧾`boyfriend_id`、`match_type` | 📊观察推荐曝光 |
| 💬`first_message_sent` | ⌨️用户首次发送消息 | 🧾`boyfriend_id`、`input_type` | 📊计算首条消息率 |
| 🔢`five_turns_complete` | 💬完成五轮用户消息 | 🧾`boyfriend_id`、`duration_ms` | 📊衡量核心体验完成 |
| 🔄`swap_preview_view` | 🚉同题双人回应可见 | 🧾`from_id`、`candidate_id` | 📊衡量换乘兴趣 |
| 🧭`swap_decision` | 💡选择留下或试乘 | 🧾`decision`、`reason` | 📊理解决策原因 |
| 🚇`first_swap_complete` | 💝首次换乘成功 | 🧾`from_id`、`to_id`、`duration_ms` | 📊衡量核心转化 |
| 🪪`share_card_generated` | 🎨画像卡生成成功 | 🧾`result_type`、`boyfriend_id` | 📊衡量传播意愿 |
| 📤`share_action` | 🔗保存图片或复制链接 | 🧾`method`、`referral_code` | 📊衡量真实传播动作 |
| ⚠️`ai_request_failed` | 🤖大模型请求失败 | 🧾`stage`、`error_type`、`retry_count` | 📊监控公开测试稳定性 |

## 📐 指标公式

📈开始体验率等于`experience_start`用户数除以`landing_view`用户数。  
📈情景题完成率等于`quiz_complete`用户数除以`quiz_start`用户数。  
📈首条消息发送率等于`first_message_sent`用户数除以`match_view`用户数。  
📈五轮对话完成率等于`five_turns_complete`用户数除以`first_message_sent`用户数。  
📈首次换乘完成率等于`first_swap_complete`用户数除以`experience_start`用户数。  
📈画像卡生成率等于`share_card_generated`用户数除以`first_swap_complete`用户数。  
📈分享动作率等于`share_action`用户数除以`share_card_generated`用户数。

## 🔒 隐私要求

🔒事件中不得上传完整聊天内容。  
🔒事件中不得上传真实姓名、手机号、邮箱或精确位置。  
🔒`session_id`必须是随机匿名标识。  
🔒如需记录输入类型，只允许记录`quick_reply`或`free_text`。  
🔒错误日志不得包含用户原始消息。

## 🧪 QA要求

✅同一页面刷新不应重复计算一次性转化事件。  
✅同一会话内`first_message_sent`只触发一次。  
✅五轮对话完成事件只触发一次。  
✅首次换乘完成事件只触发一次。  
✅测试环境事件应带有`environment=test`属性。
