/**
 * 将时间戳格式化为北京时间（UTC+8）显示
 * 无论用户浏览器时区设置如何，都统一显示北京时间
 * 
 * 注意：SQLite 的 CURRENT_TIMESTAMP 返回的是 UTC 时间，但格式为 "YYYY-MM-DD HH:mm:ss"（无时区标记）
 * 浏览器在 UTC+8 时区会错误地将其解析为北京时间，因此需要显式添加 'Z' 后缀
 */
export function formatBeijingTime(timestamp: string): string {
  if (!timestamp) return '';

  // SQLite 返回的 UTC 时间字符串无时区标记（如 "2026-04-12 18:42:20"）
  // 需要添加 'Z' 后缀告诉浏览器这是 UTC 时间
  const timestampWithZ = timestamp.endsWith('Z') ? timestamp : timestamp + 'Z';
  const date = new Date(timestampWithZ);
  
  if (isNaN(date.getTime())) return '';

  // 北京时间 = UTC + 8 小时
  const beijingTimestamp = date.getTime() + 8 * 3600000;
  const beijingTime = new Date(beijingTimestamp);

  // 使用 UTC 方法提取时间组件（因为 beijingTime 已经是 UTC+8 的时间值）
  const year = beijingTime.getUTCFullYear();
  const month = String(beijingTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getUTCDate()).padStart(2, '0');
  const hours = String(beijingTime.getUTCHours()).padStart(2, '0');
  const minutes = String(beijingTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(beijingTime.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
