/**
 * 从请求中提取客户端 IP 地址
 * @param {import('express').Request} req - Express 请求对象
 * @returns {string|null} 客户端 IP 地址
 */
function getClientIP(req) {
  try {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      // X-Forwarded-For 可能包含多个 IP，取第一个
      const ip = forwarded.split(',')[0].trim();
      return ip || null;
    }
    
    return req.ip || req.connection?.remoteAddress || null;
  } catch (error) {
    console.error('Failed to extract client IP:', error.message);
    return null;
  }
}

/**
 * 验证 IP 地址格式 (IPv4 或 IPv6)
 * @param {string} ip - IP 地址
 * @returns {boolean} 是否为有效 IP
 */
function isValidIP(ip) {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  
  // IPv4 正则
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 正则
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  if (ipv6Regex.test(ip)) {
    return true;
  }
  
  return false;
}

module.exports = {
  getClientIP,
  isValidIP,
};
