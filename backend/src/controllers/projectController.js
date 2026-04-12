const { getDatabase } = require('../db/connection');
const { successResponse, errorResponse } = require('../middlewares/response');

/**
 * 获取项目列表
 */
function getProjects(req, res) {
  try {
    const { status } = req.query;
    const db = getDatabase();

    let query = 'SELECT * FROM projects';
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

    const projects = db.prepare(query).all(...params);
    return successResponse(res, projects);
  } catch (error) {
    console.error('Get projects error:', error);
    return errorResponse(res, 500, '获取项目列表失败');
  }
}

/**
 * 创建项目 (管理员)
 */
function createProject(req, res) {
  try {
    const { code, name } = req.body;

    if (!code) {
      return errorResponse(res, 400, '项目代号不能为空');
    }

    const db = getDatabase();
    const projectName = name || '';
    const result = db.prepare(
      'INSERT INTO projects (code, name, status, approved_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)'
    ).run(code, projectName, 'approved');

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    return successResponse(res, project, '项目创建成功');
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint')) {
      return errorResponse(res, 409, '项目代号已存在');
    }
    console.error('Create project error:', error);
    return errorResponse(res, 500, '创建项目失败');
  }
}

/**
 * 更新项目 (管理员)
 */
function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { code, name, status } = req.body;

    const db = getDatabase();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);

    if (!project) {
      return errorResponse(res, 404, '项目不存在');
    }

    const updateCode = code || project.code;
    const updateName = name || project.name;
    const updateStatus = status || project.status;
    const approvedAt = updateStatus === 'approved' && project.status !== 'approved' ? 'CURRENT_TIMESTAMP' : 'approved_at';

    db.prepare(
      `UPDATE projects SET code = ?, name = ?, status = ?, approved_at = CASE WHEN ? = 'approved' AND status != ? THEN CURRENT_TIMESTAMP ELSE approved_at END WHERE id = ?`
    ).run(updateCode, updateName, updateStatus, updateStatus, updateStatus, id);

    const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    return successResponse(res, updatedProject, '项目更新成功');
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint')) {
      return errorResponse(res, 409, '项目代号已存在');
    }
    console.error('Update project error:', error);
    return errorResponse(res, 500, '更新项目失败');
  }
}

/**
 * 删除项目 (管理员)
 */
function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    if (result.changes === 0) {
      return errorResponse(res, 404, '项目不存在');
    }

    return successResponse(res, null, '项目删除成功');
  } catch (error) {
    console.error('Delete project error:', error);
    return errorResponse(res, 500, '删除项目失败');
  }
}

/**
 * 用户申请新项目
 */
async function requestProject(req, res) {
  try {
    const { project_code, project_name, capToken } = req.body;
    const userId = req.body.applicant_name || 'anonymous';

    if (!project_code || !project_name) {
      return errorResponse(res, 400, '项目代号和名称不能为空');
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
    
    // 插入到 projects 表（pending 状态，所有用户可见）
    try {
      db.prepare(
        'INSERT INTO projects (code, name, status, created_by) VALUES (?, ?, ?, ?)'
      ).run(project_code, project_name, 'pending', userId);
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE constraint')) {
        return errorResponse(res, 409, '项目代号已存在');
      }
      throw err;
    }

    // 同时插入到 project_requests 表（用于管理员审核）
    const result = db.prepare(
      'INSERT INTO project_requests (user_id, project_code, project_name) VALUES (?, ?, ?)'
    ).run(userId, project_code, project_name);

    const request = db.prepare('SELECT * FROM project_requests WHERE id = ?').get(result.lastInsertRowid);
    return successResponse(res, request, '项目申请已提交,等待管理员审核');
  } catch (error) {
    console.error('Request project error:', error);
    return errorResponse(res, 500, '申请项目失败');
  }
}

/**
 * 获取待审核的项目申请列表 (管理员)
 */
function getPendingProjectRequests(req, res) {
  try {
    const db = getDatabase();
    const requests = db.prepare(
      "SELECT * FROM project_requests WHERE status = 'pending' ORDER BY created_at DESC"
    ).all();
    return successResponse(res, requests);
  } catch (error) {
    console.error('Get pending project requests error:', error);
    return errorResponse(res, 500, '获取待审核列表失败');
  }
}

/**
 * 审核项目申请 (管理员)
 */
function reviewProject(req, res) {
  try {
    const { id } = req.params;
    const { status, reviewer_note } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return errorResponse(res, 400, '审核状态只能是 approved 或 rejected');
    }

    const db = getDatabase();
    const request = db.prepare('SELECT * FROM project_requests WHERE id = ?').get(id);

    if (!request) {
      return errorResponse(res, 404, '申请不存在');
    }

    if (request.status !== 'pending') {
      return errorResponse(res, 400, '申请已审核');
    }

    // 更新申请状态
    db.prepare(
      'UPDATE project_requests SET status = ?, reviewer_note = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(status, reviewer_note || '', id);

    // 更新 projects 表中的状态（用户申请时已插入）
    db.prepare(
      'UPDATE projects SET status = ?, approved_at = CASE WHEN ? = \'approved\' THEN CURRENT_TIMESTAMP ELSE NULL END WHERE code = ?'
    ).run(status, status, request.project_code);

    const updatedRequest = db.prepare('SELECT * FROM project_requests WHERE id = ?').get(id);
    return successResponse(res, updatedRequest, status === 'approved' ? '审核通过' : '审核已拒绝');
  } catch (error) {
    console.error('Review project error:', error);
    return errorResponse(res, 500, '审核失败');
  }
}

module.exports = {
  getProjects,
  getPendingProjectRequests,
  createProject,
  updateProject,
  deleteProject,
  requestProject,
  reviewProject,
};
