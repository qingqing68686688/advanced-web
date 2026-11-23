/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-23 | 大模型：TRAE DeepSeek-V4.1-Flash
 * 作用：知识库接口业务层（上传解析、文档管理、RAG 问答）
 */
const multer = require('multer');
const Wanghl_kbModel = require('../models/Wanghl_kbModel');
const Wanghl_kbParser = require('../services/Wanghl_kbParser');
const Wanghl_retriever = require('../services/Wanghl_kbRetriever');
const Wanghl_chatModel = require('../models/Wanghl_chatModel');

const Wanghl_MAX_SIZE = 15 * 1024 * 1024;

const Wanghl_uploader = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Wanghl_MAX_SIZE, files: 1 },
  fileFilter: function (req, file, Wanghl_cb) {
    if (!Wanghl_kbParser.Wanghl_isSupported(file.originalname)) {
      Wanghl_cb(
        new Error('仅支持 ' + Wanghl_kbParser.Wanghl_SUPPORTED.join('、') + ' 格式的文件')
      );
      return;
    }
    Wanghl_cb(null, true);
  }
});

// multer 默认按 latin1 解析文件名，这里修正中文乱码
function Wanghl_fixName(Wanghl_name) {
  if (!Wanghl_name) return '未命名文件';
  if (/[\u00c0-\u00ff]/.test(Wanghl_name)) {
    try {
      const Wanghl_fixed = Buffer.from(Wanghl_name, 'latin1').toString('utf8');
      if (!Wanghl_fixed.includes('\uFFFD')) return Wanghl_fixed;
    } catch (Wanghl_err) {
      // 转换失败时保留原文件名
    }
  }
  return Wanghl_name;
}

function Wanghl_uploadMiddleware(req, res, next) {
  Wanghl_uploader.single('file')(req, res, function (Wanghl_err) {
    if (Wanghl_err) {
      const Wanghl_msg =
        Wanghl_err.code === 'LIMIT_FILE_SIZE'
          ? '文件超过 15MB 限制'
          : Wanghl_err.message || '文件上传失败';
      res.json({ code: 1, msg: Wanghl_msg, data: null });
      return;
    }
    next();
  });
}

// GET /api/kb/info
async function Wanghl_getInfo(req, res) {
  try {
    const Wanghl_stats = await Wanghl_kbModel.Wanghl_getStats();
    res.json({
      code: 0,
      msg: '获取知识库配置成功',
      data: {
        supported: Wanghl_kbParser.Wanghl_SUPPORTED,
        maxSizeMB: 15,
        chunkSize: 420,
        chunkOverlap: 80,
        topK: 4,
        stats: Wanghl_stats,
        model: Wanghl_chatModel.Wanghl_getChatConfig()
      }
    });
  } catch (Wanghl_err) {
    console.error('[Wanghl] 获取知识库配置失败：', Wanghl_err.message);
    res.json({ code: 1, msg: '知识库数据表尚未初始化：' + Wanghl_err.message, data: null });
  }
}

// GET /api/kb/documents
async function Wanghl_getDocuments(req, res) {
  try {
    const Wanghl_docs = await Wanghl_kbModel.Wanghl_listDocuments();
    const Wanghl_stats = await Wanghl_kbModel.Wanghl_getStats();
    res.json({
      code: 0,
      msg: '获取知识库文档成功',
      data: { list: Wanghl_docs, stats: Wanghl_stats }
    });
  } catch (Wanghl_err) {
    console.error('[Wanghl] 获取知识库文档失败：', Wanghl_err.message);
    res.json({ code: 1, msg: '获取知识库文档失败：' + Wanghl_err.message, data: null });
  }
}

// GET /api/kb/chunks?name=xxx
async function Wanghl_getChunks(req, res) {
  const Wanghl_name = String((req.query && req.query.name) || '').trim();
  if (!Wanghl_name) {
    return res.json({ code: 1, msg: '缺少文档名称', data: null });
  }

  try {
    const Wanghl_chunks = await Wanghl_kbModel.Wanghl_listChunks(Wanghl_name);
    res.json({
      code: 0,
      msg: Wanghl_chunks.length ? '获取分块成功' : '未找到该文档的分块',
      data: { name: Wanghl_name, total: Wanghl_chunks.length, list: Wanghl_chunks }
    });
  } catch (Wanghl_err) {
    console.error('[Wanghl] 获取分块失败：', Wanghl_err.message);
    res.json({ code: 1, msg: '获取分块失败：' + Wanghl_err.message, data: null });
  }
}

// POST /api/kb/upload
async function Wanghl_upload(req, res) {
  const Wanghl_file = req.file;
  if (!Wanghl_file) {
    return res.json({ code: 1, msg: '请选择要上传的知识库文件', data: null });
  }

  const Wanghl_name = Wanghl_fixName(Wanghl_file.originalname);

  try {
    console.log('[Wanghl] 知识库上传：' + Wanghl_name + '（' + Wanghl_file.size + ' 字节）');
    const Wanghl_parsed = await Wanghl_kbParser.Wanghl_parseFile({
      buffer: Wanghl_file.buffer,
      originalname: Wanghl_name
    });

    const Wanghl_chunks = Wanghl_retriever.Wanghl_splitChunks(Wanghl_parsed.text);
    if (!Wanghl_chunks.length) {
      throw new Error('文件内容为空，未生成有效分块');
    }

    const Wanghl_count = await Wanghl_kbModel.Wanghl_saveDocument({
      name: Wanghl_name,
      ext: Wanghl_parsed.ext,
      size: Wanghl_file.size,
      chunks: Wanghl_chunks
    });
    const Wanghl_stats = await Wanghl_kbModel.Wanghl_getStats();

    console.log(
      '[Wanghl] 知识库入库完成：' + Wanghl_name + '，分块 ' + Wanghl_count + ' 个，字符 ' + Wanghl_parsed.text.length
    );

    res.json({
      code: 0,
      msg: '知识库文件已入库',
      data: {
        name: Wanghl_name,
        ext: Wanghl_parsed.ext,
        size: Wanghl_file.size,
        chunkCount: Wanghl_count,
        chars: Wanghl_parsed.text.length,
        preview: Wanghl_parsed.text.slice(0, 160),
        stats: Wanghl_stats
      }
    });
  } catch (Wanghl_err) {
    console.error('[Wanghl] 知识库上传解析失败：', Wanghl_err.message);
    res.json({ code: 1, msg: '解析失败：' + Wanghl_err.message, data: null });
  }
}

// DELETE /api/kb/documents?name=xxx
async function Wanghl_removeDocument(req, res) {
  const Wanghl_name = String((req.query && req.query.name) || '').trim();
  if (!Wanghl_name) {
    return res.json({ code: 1, msg: '缺少文档名称', data: null });
  }

  try {
    const Wanghl_count = await Wanghl_kbModel.Wanghl_deleteDocument(Wanghl_name);
    if (!Wanghl_count) {
      return res.json({ code: 1, msg: '未找到该知识库文件', data: null });
    }
    const Wanghl_stats = await Wanghl_kbModel.Wanghl_getStats();
    console.log('[Wanghl] 已删除知识库文件：' + Wanghl_name + '（分块 ' + Wanghl_count + ' 个）');
    res.json({
      code: 0,
      msg: '已删除知识库文件',
      data: { name: Wanghl_name, removedChunks: Wanghl_count, stats: Wanghl_stats }
    });
  } catch (Wanghl_err) {
    console.error('[Wanghl] 删除知识库文件失败：', Wanghl_err.message);
    res.json({ code: 1, msg: '删除失败：' + Wanghl_err.message, data: null });
  }
}

// POST /api/kb/ask 基于知识库的问答（RAG）
async function Wanghl_ask(req, res) {
  const Wanghl_question = String((req.body && req.body.question) || '').trim().slice(0, 500);
  const Wanghl_docName = String((req.body && req.body.docName) || '').trim();

  if (!Wanghl_question) {
    return res.json({ code: 1, msg: '请输入要提问的问题', data: null });
  }

  try {
    const Wanghl_chunks = await Wanghl_kbModel.Wanghl_search(
      Wanghl_question,
      Wanghl_docName || null,
      4
    );

    console.log(
      '[Wanghl] 知识库检索结果：',
      Wanghl_chunks.map(function (Wanghl_item) {
        return {
          doc: Wanghl_item.docName,
          chunk: Wanghl_item.chunkIndex + 1,
          score: Number(Wanghl_item.score.toFixed(3))
        };
      })
    );

    if (!Wanghl_chunks.length) {
      return res.json({
        code: 0,
        msg: '未检索到相关内容',
        data: {
          answer: '知识库中没有检索到与该问题相关的内容，请尝试更换关键词，或先上传相关文档。',
          sources: [],
          usage: null,
          model: ''
        }
      });
    }

    const Wanghl_context = Wanghl_chunks
      .map(function (Wanghl_item, Wanghl_index) {
        return (
          '[' + (Wanghl_index + 1) + '] 文档：' + Wanghl_item.docName +
          '（片段 ' + (Wanghl_item.chunkIndex + 1) + '）\n' + Wanghl_item.content
        );
      })
      .join('\n\n');

    const Wanghl_messages = [
      {
        role: 'system',
        content:
          '你是「知乎的模仿与制作」项目的专属知识库客服。请严格依据提供的知识库片段回答：' +
          '1. 只使用片段中的信息，不要编造；' +
          '2. 若片段不足以回答，请明确说明「知识库中暂无相关信息」；' +
          '3. 用简洁中文分点回答，引用信息时在句末标注 [1]、[2]。'
      },
      {
        role: 'user',
        content: '【知识库片段】\n' + Wanghl_context + '\n\n【用户问题】\n' + Wanghl_question
      }
    ];

    const Wanghl_result = await Wanghl_chatModel.Wanghl_chatCompletion(Wanghl_messages);

    const Wanghl_sources = Wanghl_chunks.map(function (Wanghl_item, Wanghl_index) {
      return {
        index: Wanghl_index + 1,
        docName: Wanghl_item.docName,
        chunkIndex: Wanghl_item.chunkIndex,
        score: Number(Wanghl_item.score.toFixed(3)),
        snippet: Wanghl_item.content.slice(0, 120)
      };
    });

    res.json({
      code: 0,
      msg: '知识库问答成功',
      data: {
        answer: Wanghl_result.content,
        sources: Wanghl_sources,
        usage: Wanghl_result.usage,
        model: Wanghl_result.model
      }
    });
  } catch (Wanghl_err) {
    console.error('[Wanghl] 知识库问答失败：', Wanghl_err.message);
    res.json({ code: 1, msg: '知识库问答失败：' + Wanghl_err.message, data: null });
  }
}

module.exports = {
  Wanghl_uploadMiddleware,
  Wanghl_getInfo,
  Wanghl_getDocuments,
  Wanghl_getChunks,
  Wanghl_upload,
  Wanghl_removeDocument,
  Wanghl_ask
};
