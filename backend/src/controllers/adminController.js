const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../db/connection');
const { successResponse, errorResponse } = require('../middlewares/response');

/**
 * 管理员登录
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return errorResponse(res, 400, '用户名和密码不能为空');
    }

    const db = getDatabase();
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);

    if (!admin) {
      return errorResponse(res, 401, '用户名或密码错误');
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return errorResponse(res, 401, '用户名或密码错误');
    }

    // 生成 JWT token
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        isAdmin: true,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return successResponse(res, { token, username: admin.username }, '登录成功');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, '登录失败');
  }
}

/**
 * 管理员登出
 */
function logout(req, res) {
  // JWT 是无状态的,客户端需要自行清除 token
  return successResponse(res, null, '登出成功');
}

/**
 * 初始化默认管理员
 */
async function initializeDefaultAdmin() {
  const db = getDatabase();
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admins').get();

  if (adminCount.count === 0) {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'Aa123456';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', passwordHash);

    console.log('========================================');
    console.log('Default admin created:');
    console.log('Username: admin');
    console.log(`Password: ${defaultPassword}`);
    console.log('Please change this password immediately!');
    console.log('========================================');
  }
}

module.exports = {
  login,
  logout,
  initializeDefaultAdmin,
};
