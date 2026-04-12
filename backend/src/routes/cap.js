const express = require('express');
const cap = require('../cap');

const router = express.Router();

/**
 * POST /cap/challenge
 * 生成验证挑战
 */
router.post('/challenge', async (req, res) => {
  try {
    const challengeData = await cap.createChallenge();
    res.json(challengeData);
  } catch (error) {
    console.error('Cap challenge error:', error);
    res.status(500).json({ success: false, error: '生成挑战失败' });
  }
});

/**
 * POST /cap/redeem
 * 验证解决方案
 */
router.post('/redeem', async (req, res) => {
  try {
    const { token, solutions } = req.body;
    if (!token || !solutions) {
      return res.status(400).json({ success: false, error: '缺少 token 或 solutions' });
    }
    const result = await cap.redeemChallenge({ token, solutions });
    res.json(result);
  } catch (error) {
    console.error('Cap redeem error:', error);
    res.status(500).json({ success: false, error: '验证失败' });
  }
});

module.exports = router;
