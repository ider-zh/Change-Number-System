const jwt = require('jsonwebtoken');
const { errorResponse } = require('./response');

/**
 * 管理员认证中间件
 * 验证 JWT token
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, '未提供认证令牌');
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return errorResponse(res, 401, '未提供认证令牌');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.isAdmin) {
      return errorResponse(res, 403, '权限不足');
    }

    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, '令牌已过期');
    }
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, '无效的令牌');
    }
    return errorResponse(res, 401, '认证失败');
  }
}

/**
 * 可选认证中间件
 * 如果有 token 则验证,没有则继续
 */
function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded && decoded.isAdmin) {
        req.admin = decoded;
        req.isAdmin = true;
      }
    }
  } catch (error) {
    // 忽略错误,继续执行
  }
  
  next();
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
};
