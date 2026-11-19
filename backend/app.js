/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE DeepSeek-V4.1-Flash
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Wanghl_app = express();
const Wanghl_PORT = 8731;

// 中间件
Wanghl_app.use(cors());
Wanghl_app.use(express.json());
Wanghl_app.use(express.urlencoded({ extended: true }));

// 统一响应格式中间件（需在路由之前定义）
Wanghl_app.use((req, res, next) => {
  res.Wanghl_success = (data = null, msg = 'success') => {
    res.json({ code: 0, msg, data });
  };
  res.Wanghl_fail = (msg = 'error', code = 1) => {
    res.json({ code, msg, data: null });
  };
  next();
});

// 托管前端静态文件
Wanghl_app.use(express.static(path.join(__dirname, '../frontend')));

// API 路由前缀
Wanghl_app.use('/api', require('./routes/index'));

// 404 处理
Wanghl_app.use((req, res) => {
  res.status(404).json({ code: 404, msg: '接口不存在', data: null });
});

Wanghl_app.listen(Wanghl_PORT, () => {
  console.log(`服务器运行在 http://localhost:${Wanghl_PORT}`);
});

module.exports = Wanghl_app;
