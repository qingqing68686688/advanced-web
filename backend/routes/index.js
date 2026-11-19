/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE DeepSeek-V4.1-Flash
 */
const express = require('express');
const Wanghl_router = express.Router();
const Wanghl_dbController = require('../controllers/Wanghl_dbController');
const Wanghl_newsController = require('../controllers/Wanghl_newsController');
const Wanghl_galleryController = require('../controllers/Wanghl_galleryController');

// 测试接口
Wanghl_router.get('/test', (req, res) => {
  res.json({ code: 0, msg: '接口测试成功', data: { time: new Date().toISOString() } });
});

// 数据库连接配置（不含密码）
Wanghl_router.get('/db/info', Wanghl_dbController.Wanghl_getInfo);

// 数据库连接测试
Wanghl_router.post('/db/test', Wanghl_dbController.Wanghl_testConnection);

// 科技新闻列表
Wanghl_router.get('/news', Wanghl_newsController.Wanghl_getNewsList);

// 图文列表
Wanghl_router.get('/gallery', Wanghl_galleryController.Wanghl_getGalleryList);

module.exports = Wanghl_router;
