const express = require('express');
const { getDatabase } = require('../db/connection');
const { successResponse, errorResponse } = require('../middlewares/response');
const { authMiddleware } = require('../middlewares/auth');
const { FixtureInputError, listKinds, issueNumbers, listRequests, getRequestStats, exportRequestsCSV } = require('./service');

const router = express.Router();

router.get('/kinds', (req, res) => {
  try {
    return successResponse(res, listKinds(getDatabase(), req.query.search));
  } catch (error) {
    console.error('List fixture kinds error:', error);
    return errorResponse(res, 500, '获取工装种类失败');
  }
});

router.get('/requests', (req, res) => {
  try {
    return successResponse(res, listRequests(getDatabase(), req.query));
  } catch (error) {
    if (error instanceof FixtureInputError) return errorResponse(res, error.status, error.message);
    console.error('List fixture requests error:', error);
    return errorResponse(res, 500, '获取工装申请记录失败');
  }
});

router.get('/stats', (req, res) => {
  try {
    return successResponse(res, getRequestStats(getDatabase()));
  } catch (error) {
    console.error('Get fixture stats error:', error);
    return errorResponse(res, 500, '获取工装申请统计失败');
  }
});

router.get('/export', authMiddleware, (req, res) => {
  try {
    const csv = exportRequestsCSV(getDatabase());
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="fixture_requests_${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Export fixture requests error:', error);
    return errorResponse(res, 500, '导出工装申请记录失败');
  }
});

router.post('/issue', async (req, res) => {
  try {
    const capToken = req.body?.capToken;
    if (typeof capToken !== 'string' || !capToken) {
      return errorResponse(res, 400, '请完成人机验证');
    }
    const cap = require('../cap');
    const { success } = await cap.validateToken(capToken, { keepToken: false });
    if (!success) return errorResponse(res, 400, '人机验证失败，请重新验证');
    return successResponse(res, issueNumbers(getDatabase(), req.body), '取号成功');
  } catch (error) {
    if (error instanceof FixtureInputError) return errorResponse(res, error.status, error.message);
    console.error('Issue fixture numbers error:', error);
    return errorResponse(res, 500, '工装取号失败');
  }
});

module.exports = router;
