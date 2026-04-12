const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authMiddleware } = require('../middlewares/auth');

// 获取功能开关状态（公开访问）
router.get('/feature-toggles', settingsController.getFeatureToggles);

// 更新功能开关状态（需要管理员权限）
router.put('/feature-toggles', authMiddleware, settingsController.updateFeatureToggles);

// 获取冷却时间（公开访问）
router.get('/cooldown', settingsController.getCooldown);

// 更新冷却时间（需要管理员权限）
router.put('/cooldown', authMiddleware, settingsController.updateCooldown);

module.exports = router;
