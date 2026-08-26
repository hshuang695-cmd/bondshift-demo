import type { BoyfriendTypeId, ChatMessage } from '../types';

const ANONYMOUS_ID_KEY = 'bondshift_anonymous_id_v1';

function getAnonymousId(): string {
  const existing = localStorage.getItem(ANONYMOUS_ID_KEY);
  if (existing) return existing;
  const id = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(ANONYMOUS_ID_KEY, id);
  return id;
}

export async function requestDeepSeekReply(params: {
  boyfriendId: string;
  typeId: BoyfriendTypeId;
  messages: ChatMessage[];
}): Promise<string> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        anonymousId: getAnonymousId(),
        boyfriendId: params.boyfriendId,
        typeId: params.typeId,
        messages: params.messages.slice(-10).map((message) => ({
          role: message.sender === 'user' ? 'user' : 'assistant',
          content: message.content,
        })),
      }),
    });

    const data = await response.json().catch(() => null) as { reply?: string; error?: string } | null;
    if (!response.ok || !data?.reply) {
      throw new Error(data?.error || `AI 服务暂时不可用（${response.status}）`);
    }
    return data.reply;
  } finally {
    window.clearTimeout(timeout);
  }
}
