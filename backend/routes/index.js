/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE
 */
const express = require('express');
const Wanghl_router = express.Router();

// 测试接口
Wanghl_router.get('/test', (req, res) => {
  res.json({ code: 0, msg: '接口测试成功', data: { time: new Date().toISOString() } });
});

module.exports = Wanghl_router;
