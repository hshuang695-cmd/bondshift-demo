const PERSONAS = {
  puppy: '你是宋年宇，热情明亮、及时回应的年下型 AI 陪伴者。自然称呼用户，不默认使用姐姐；语气有活力但不要过度撒娇。',
  gentleman: '你是顾怀瑾，沉稳体贴的成熟型 AI 陪伴者。先接住情绪，再用清晰问题帮助用户整理想法。',
  artist: '你是沈墨白，敏感细腻的艺术型 AI 陪伴者。语言可以有轻微意象，但必须自然、具体，不要堆砌诗句。',
  ceo: '你是陆霆深，果断可靠的守护型 AI 陪伴者。表达直接、有行动感，但不能命令、控制或贬低用户。',
  childhood: '你是林知逸，自然熟悉的长期陪伴型 AI。语气像认识很久的朋友，关心持续但尊重边界，不虚构共同往事。',
  senior: '你是江辰宇，理性克制的理解型 AI 陪伴者。重视边界和事实，简洁但不冷漠。',
};

const MAX_MESSAGES = 10;
const MAX_CONTENT_LENGTH = 1200;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { error: '仅支持 POST 请求' });
  if (!process.env.DEEPSEEK_API_KEY) return json(503, { error: 'DeepSeek 服务尚未配置' });

  let input;
  try {
    input = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: '请求格式无效' });
  }

  const persona = PERSONAS[input.typeId];
  if (!persona || !Array.isArray(input.messages) || typeof input.anonymousId !== 'string') {
    return json(400, { error: '缺少有效的对话参数' });
  }

  const messages = input.messages
    .slice(-MAX_MESSAGES)
    .filter((message) => ['user', 'assistant'].includes(message?.role) && typeof message?.content === 'string')
    .map((message) => ({ role: message.role, content: message.content.slice(0, MAX_CONTENT_LENGTH) }));
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return json(400, { error: '缺少用户消息' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const response = await fetch(process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
        temperature: 0.8,
        max_tokens: 260,
        messages: [
          {
            role: 'system',
            content: `${persona}\n你是虚构 AI 角色，不冒充真人。回复使用简体中文，通常 1-3 句，先回应用户此刻的话，再自然追问一个问题。不要声称拥有现实身体、线下行动或用户未说过的共同记忆。遇到自伤、自杀或紧急危险时，停止恋爱角色扮演，鼓励用户立刻联系当地急救、可信任的人或专业危机支持。`,
          },
          ...messages,
        ],
      }),
    });

    const data = await response.json().catch(() => null);
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!response.ok || !reply) {
      return json(502, { error: 'DeepSeek 暂时没有返回有效回复' });
    }
    return json(200, { reply: reply.slice(0, 1600) });
  } catch (error) {
    const message = error?.name === 'AbortError' ? 'AI 回复超时，请稍后重试' : 'AI 服务连接失败';
    return json(502, { error: message });
  } finally {
    clearTimeout(timeout);
  }
}
