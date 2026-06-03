// ─── 评分工具函数 ───
// 轻量级纯工具，不依赖 store / engine

/** 限制值在 [min, max] 并四舍五入 */
export function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

/** 将 0-100 的值映射为等级文本 */
export function scoreToRank(score: number): string {
  if (score >= 90) return 'S级 · 灵魂伴侣';
  if (score >= 80) return 'A级 · 高度契合';
  if (score >= 70) return 'B级 · 良好匹配';
  if (score >= 60) return 'C级 · 一般匹配';
  if (score >= 40) return 'D级 · 有待磨合';
  return 'E级 · 性格碰撞';
}

/** 将 0-100 的值映射为等级颜色 */
export function scoreToColor(score: number): string {
  if (score >= 80) return '#e8547c';
  if (score >= 60) return '#4f5fcf';
  if (score >= 40) return '#f56b33';
  return '#8e8e93';
}

/** 生成一个稳定的伪随机数 (基于种子字符串) */
export function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}
