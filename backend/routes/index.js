/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE DeepSeek-V4.1-Flash
 */
const express = require('express');
const Wanghl_router = express.Router();
const Wanghl_dbController = require('../controllers/Wanghl_dbController');
const Wanghl_newsController = require('../controllers/Wanghl_newsController');
const Wanghl_galleryController = require('../controllers/Wanghl_galleryController');
const Wanghl_chatController = require('../controllers/Wanghl_chatController');
const Wanghl_kbController = require('../controllers/Wanghl_kbController');

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

// AI 在线客服：对话配置（不含密钥）
Wanghl_router.get('/chat/info', Wanghl_chatController.Wanghl_getChatInfo);

// AI 在线客服：对话
Wanghl_router.post('/chat', Wanghl_chatController.Wanghl_chat);

// AI 在线客服：流式对话（SSE）
Wanghl_router.post('/chat/stream', Wanghl_chatController.Wanghl_chatStream);

// 知识库：配置与统计
Wanghl_router.get('/kb/info', Wanghl_kbController.Wanghl_getInfo);

// 知识库：文档列表
Wanghl_router.get('/kb/documents', Wanghl_kbController.Wanghl_getDocuments);

// 知识库：查看某个文档的分块
Wanghl_router.get('/kb/chunks', Wanghl_kbController.Wanghl_getChunks);

// 知识库：上传并解析文档
Wanghl_router.post('/kb/upload', Wanghl_kbController.Wanghl_uploadMiddleware, Wanghl_kbController.Wanghl_upload);

// 知识库：删除文档
Wanghl_router.delete('/kb/documents', Wanghl_kbController.Wanghl_removeDocument);

// 知识库：基于知识库的问答（RAG）
Wanghl_router.post('/kb/ask', Wanghl_kbController.Wanghl_ask);

module.exports = Wanghl_router;
