/**
 * 统一响应格式中间件
 * 格式: { success, data, message, error }
 */

function successResponse(res, data = null, message = '操作成功') {
  return res.status(200).json({
    success: true,
    data,
    message,
    error: null,
  });
}

function errorResponse(res, statusCode = 500, message = '服务器内部错误', error = null) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error,
  });
}

module.exports = {
  successResponse,
  errorResponse,
};
