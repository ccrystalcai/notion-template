// 通用工具函数

/**
 * 分转元（价格显示用）
 * 数据库中价格以"分"存储，前端以"元"展示
 */
export function centsToYuan(cents: number): string {
  return (cents / 100).toFixed(0);
}

/**
 * 格式化大数字：1000+ → "1.0k"
 */
export function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

/**
 * 从文件名获取扩展名
 */
export function getExt(fileName: string): string {
  return fileName.split(".").pop() || "jpg";
}

/**
 * 生成随机文件名
 */
export function randomFileName(prefix: string, ext: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
}
