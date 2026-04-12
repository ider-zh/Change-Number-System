const express = require('express');
const router = express.Router();
const numberTypeController = require('../controllers/numberTypeController');
const { authMiddleware, optionalAuthMiddleware } = require('../middlewares/auth');

// 获取编号类型列表 (支持可选认证)
router.get('/', optionalAuthMiddleware, numberTypeController.getNumberTypes);

// 创建编号类型 (需要管理员权限)
router.post('/', authMiddleware, numberTypeController.createNumberType);

// 更新编号类型 (需要管理员权限)
router.put('/:id', authMiddleware, numberTypeController.updateNumberType);

// 删除编号类型 (需要管理员权限)
router.delete('/:id', authMiddleware, numberTypeController.deleteNumberType);

// 用户申请新编号类型
router.post('/request', numberTypeController.requestNumberType);

// 获取待审核编号类型列表 (管理员)
router.get('/requests', authMiddleware, numberTypeController.getPendingNumberTypeRequests);

// 审核编号类型申请 (需要管理员权限)
router.put('/:id/review', authMiddleware, numberTypeController.reviewNumberType);

module.exports = router;
