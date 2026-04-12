const { errorResponse } = require('./response');

/**
 * 全局错误处理中间件
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // better-sqlite3 唯一性约束错误
  if (err.message && err.message.includes('UNIQUE constraint failed')) {
    const field = err.message.match(/UNIQUE constraint failed: (\w+)/);
    return errorResponse(res, 409, `${field ? field[1] : '记录'}已存在`);
  }

  // 默认 500 错误
  return errorResponse(res, 500, process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message);
}

/**
 * 404 处理中间件
 */
function notFoundHandler(req, res) {
  return errorResponse(res, 404, `路由 ${req.method} ${req.originalUrl} 不存在`);
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
