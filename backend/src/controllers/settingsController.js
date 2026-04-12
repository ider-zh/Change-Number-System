const { getDatabase } = require('../db/connection');
const { getCooldownSeconds, setCooldownSeconds } = require('./applicationController');

/**
 * 获取功能开关状态
 * 公开访问，前端需要根据此接口渲染UI
 */
const getFeatureToggles = (req, res) => {
  try {
    const db = getDatabase();
    const settings = db.prepare(`
      SELECT setting_key, setting_value FROM system_settings
      WHERE setting_key IN ('allow_request_project', 'allow_request_number_type')
    `).all();

    const toggles = {
      allow_request_project: false,
      allow_request_number_type: false
    };

    settings.forEach(setting => {
      toggles[setting.setting_key] = setting.setting_value === 'true';
    });

    res.json({
      success: true,
      data: toggles
    });
  } catch (error) {
    console.error('Error fetching feature toggles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feature toggles'
    });
  }
};

/**
 * 更新功能开关状态
 * 需要管理员权限
 */
const updateFeatureToggles = (req, res) => {
  try {
    const db = getDatabase();
    const { allow_request_project, allow_request_number_type } = req.body;

    // 验证输入
    if (allow_request_project !== undefined && typeof allow_request_project !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'allow_request_project must be a boolean'
      });
    }

    if (allow_request_number_type !== undefined && typeof allow_request_number_type !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'allow_request_number_type must be a boolean'
      });
    }

    const updateSetting = db.prepare(`
      UPDATE system_settings
      SET setting_value = ?, updated_at = CURRENT_TIMESTAMP
      WHERE setting_key = ?
    `);

    if (allow_request_project !== undefined) {
      updateSetting.run(allow_request_project ? 'true' : 'false', 'allow_request_project');
    }
    if (allow_request_number_type !== undefined) {
      updateSetting.run(allow_request_number_type ? 'true' : 'false', 'allow_request_number_type');
    }

    // 返回更新后的状态
    const settings = db.prepare(`
      SELECT setting_key, setting_value FROM system_settings
      WHERE setting_key IN ('allow_request_project', 'allow_request_number_type')
    `).all();

    const toggles = {
      allow_request_project: false,
      allow_request_number_type: false
    };

    settings.forEach(setting => {
      toggles[setting.setting_key] = setting.setting_value === 'true';
    });

    res.json({
      success: true,
      message: 'Feature toggles updated successfully',
      data: toggles
    });
  } catch (error) {
    console.error('Error updating feature toggles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feature toggles'
    });
  }
};

module.exports = {
  getFeatureToggles,
  updateFeatureToggles,
  getCooldown,
  updateCooldown
};

/**
 * 获取冷却时间
 * 公开访问
 */
function getCooldown(req, res) {
  try {
    const cooldown = getCooldownSeconds();
    res.json({
      success: true,
      data: { cooldown_seconds: cooldown }
    });
  } catch (error) {
    console.error('Error fetching cooldown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cooldown'
    });
  }
}

/**
 * 更新冷却时间
 * 需要管理员权限
 */
function updateCooldown(req, res) {
  try {
    const { cooldown_seconds } = req.body;

    if (cooldown_seconds === undefined || typeof cooldown_seconds !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'cooldown_seconds must be a number'
      });
    }

    if (cooldown_seconds < 5 || cooldown_seconds > 60) {
      return res.status(400).json({
        success: false,
        message: 'cooldown_seconds must be between 5 and 60'
      });
    }

    setCooldownSeconds(cooldown_seconds);

    res.json({
      success: true,
      message: 'Cooldown updated successfully',
      data: { cooldown_seconds: getCooldownSeconds() }
    });
  } catch (error) {
    console.error('Error updating cooldown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cooldown'
    });
  }
}
