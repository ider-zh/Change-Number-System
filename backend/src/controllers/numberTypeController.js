const { getDatabase } = require('../db/connection');
const { successResponse, errorResponse } = require('../middlewares/response');

/**
 * 获取编号类型列表
 */
function getNumberTypes(req, res) {
  try {
    const { status } = req.query;
    const db = getDatabase();

    let query = 'SELECT * FROM number_types';
    const params = [];

    // 支持逗号分隔的多值状态过滤
    if (status) {
      const statusList = status.split(',').map(s => s.trim()).filter(Boolean);
      if (statusList.length > 0) {
        const placeholders = statusList.map(() => '?').join(', ');
        query += ` WHERE status IN (${placeholders})`;
        params.push(...statusList);
      }
    }

    query += ' ORDER BY CASE WHEN status = \'approved\' THEN 0 ELSE 1 END, created_at DESC';

    const numberTypes = db.prepare(query).all(...params);
    return successResponse(res, numberTypes);
  } catch (error) {
    console.error('Get number types error:', error);
    return errorResponse(res, 500, '获取编号类型列表失败');
  }
}

/**
 * 创建编号类型 (管理员)
 */
function createNumberType(req, res) {
  try {
    const { type_code, type_name, description } = req.body;

    if (!type_code || !type_name) {
      return errorResponse(res, 400, '编号类型代码和名称不能为空');
    }

    const db = getDatabase();
    const result = db.prepare(
      'INSERT INTO number_types (type_code, type_name, description, status, approved_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
    ).run(type_code, type_name, description || '', 'approved');

    const numberType = db.prepare('SELECT * FROM number_types WHERE id = ?').get(result.lastInsertRowid);
    return successResponse(res, numberType, '编号类型创建成功');
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint')) {
      return errorResponse(res, 409, '编号类型代码已存在');
    }
    console.error('Create number type error:', error);
    return errorResponse(res, 500, '创建编号类型失败');
  }
}

/**
 * 更新编号类型 (管理员)
 */
function updateNumberType(req, res) {
  try {
    const { id } = req.params;
    const { type_code, type_name, description, status } = req.body;

    const db = getDatabase();
    const numberType = db.prepare('SELECT * FROM number_types WHERE id = ?').get(id);

    if (!numberType) {
      return errorResponse(res, 404, '编号类型不存在');
    }

    const updateCode = type_code || numberType.type_code;
    const updateName = type_name || numberType.type_name;
    const updateDesc = description !== undefined ? description : numberType.description;
    const updateStatus = status || numberType.status;

    db.prepare(
      'UPDATE number_types SET type_code = ?, type_name = ?, description = ?, status = ? WHERE id = ?'
    ).run(updateCode, updateName, updateDesc, updateStatus, id);

    const updatedNumberType = db.prepare('SELECT * FROM number_types WHERE id = ?').get(id);
    return successResponse(res, updatedNumberType, '编号类型更新成功');
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint')) {
      return errorResponse(res, 409, '编号类型代码已存在');
    }
    console.error('Update number type error:', error);
    return errorResponse(res, 500, '更新编号类型失败');
  }
}

/**
 * 删除编号类型 (管理员)
 */
function deleteNumberType(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const result = db.prepare('DELETE FROM number_types WHERE id = ?').run(id);

    if (result.changes === 0) {
      return errorResponse(res, 404, '编号类型不存在');
    }

    return successResponse(res, null, '编号类型删除成功');
  } catch (error) {
    console.error('Delete number type error:', error);
    return errorResponse(res, 500, '删除编号类型失败');
  }
}

/**
 * 用户申请新编号类型
 */
async function requestNumberType(req, res) {
  try {
    const { type_code, type_name, description, capToken } = req.body;
    const userId = req.body.applicant_name || 'anonymous';

    if (!type_code || !type_name) {
      return errorResponse(res, 400, '编号类型代码和名称不能为空');
    }

    // 人机验证（如果提供了 capToken）
    if (capToken) {
      const cap = require('../cap');
      const { success } = await cap.validateToken(capToken, { keepToken: false });
      if (!success) {
        return errorResponse(res, 400, '人机验证失败，请重新验证');
      }
    }

    const db = getDatabase();

    // 插入到 number_types 表（pending 状态，所有用户可见）
    try {
      db.prepare(
        'INSERT INTO number_types (type_code, type_name, description, status, created_by) VALUES (?, ?, ?, ?, ?)'
      ).run(type_code, type_name, description || '', 'pending', userId);
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE constraint')) {
        return errorResponse(res, 409, '编号类型代码已存在');
      }
      throw err;
    }

    // 同时插入到 number_type_requests 表（用于管理员审核）
    const result = db.prepare(
      'INSERT INTO number_type_requests (user_id, type_code, type_name, description) VALUES (?, ?, ?, ?)'
    ).run(userId, type_code, type_name, description || '');

    const request = db.prepare('SELECT * FROM number_type_requests WHERE id = ?').get(result.lastInsertRowid);
    return successResponse(res, request, '编号类型申请已提交,等待管理员审核');
  } catch (error) {
    console.error('Request number type error:', error);
    return errorResponse(res, 500, '申请编号类型失败');
  }
}

/**
 * 获取待审核的编号类型申请列表 (管理员)
 */
function getPendingNumberTypeRequests(req, res) {
  try {
    const db = getDatabase();
    const requests = db.prepare(
      "SELECT * FROM number_type_requests WHERE status = 'pending' ORDER BY created_at DESC"
    ).all();
    return successResponse(res, requests);
  } catch (error) {
    console.error('Get pending number type requests error:', error);
    return errorResponse(res, 500, '获取待审核列表失败');
  }
}

/**
 * 审核编号类型申请 (管理员)
 */
function reviewNumberType(req, res) {
  try {
    const { id } = req.params;
    const { status, reviewer_note } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return errorResponse(res, 400, '审核状态只能是 approved 或 rejected');
    }

    const db = getDatabase();
    const request = db.prepare('SELECT * FROM number_type_requests WHERE id = ?').get(id);

    if (!request) {
      return errorResponse(res, 404, '申请不存在');
    }

    if (request.status !== 'pending') {
      return errorResponse(res, 400, '申请已审核');
    }

    // 更新申请状态
    db.prepare(
      'UPDATE number_type_requests SET status = ?, reviewer_note = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(status, reviewer_note || '', id);

    // 更新 number_types 表中的状态（用户申请时已插入）
    db.prepare(
      'UPDATE number_types SET status = ?, approved_at = CASE WHEN ? = \'approved\' THEN CURRENT_TIMESTAMP ELSE NULL END WHERE type_code = ?'
    ).run(status, status, request.type_code);

    const updatedRequest = db.prepare('SELECT * FROM number_type_requests WHERE id = ?').get(id);
    return successResponse(res, updatedRequest, status === 'approved' ? '审核通过' : '审核已拒绝');
  } catch (error) {
    console.error('Review number type error:', error);
    return errorResponse(res, 500, '审核失败');
  }
}

module.exports = {
  getNumberTypes,
  getPendingNumberTypeRequests,
  createNumberType,
  updateNumberType,
  deleteNumberType,
  requestNumberType,
  reviewNumberType,
};
