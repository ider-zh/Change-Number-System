const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authMiddleware, optionalAuthMiddleware } = require('../middlewares/auth');

// 获取项目列表 (支持可选认证)
router.get('/', optionalAuthMiddleware, projectController.getProjects);

// 创建项目 (需要管理员权限)
router.post('/', authMiddleware, projectController.createProject);

// 更新项目 (需要管理员权限)
router.put('/:id', authMiddleware, projectController.updateProject);

// 删除项目 (需要管理员权限)
router.delete('/:id', authMiddleware, projectController.deleteProject);

// 用户申请新项目
router.post('/request', projectController.requestProject);

// 获取待审核项目列表 (管理员)
router.get('/requests', authMiddleware, projectController.getPendingProjectRequests);

// 审核项目申请 (需要管理员权限)
router.put('/:id/review', authMiddleware, projectController.reviewProject);

module.exports = router;
