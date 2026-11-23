/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-23 | 大模型：TRAE DeepSeek-V4.1-Flash
 * 作用：AI 在线客服对话接口的业务层（普通对话与流式对话）
 */
const Wanghl_chatModel = require('../models/Wanghl_chatModel');

const Wanghl_MAX_MESSAGES = 20;
const Wanghl_MAX_CHARS = 4000;

// 校验并规范化消息数组，返回 null 表示无有效内容
function Wanghl_normalizeMessages(Wanghl_rawMessages) {
  if (!Array.isArray(Wanghl_rawMessages) || Wanghl_rawMessages.length === 0) {
    return null;
  }

  const Wanghl_messages = [];
  Wanghl_rawMessages.slice(-Wanghl_MAX_MESSAGES).forEach((Wanghl_item) => {
    if (!Wanghl_item || typeof Wanghl_item.content !== 'string') return;
    const Wanghl_role =
      Wanghl_item.role === 'assistant' || Wanghl_item.role === 'system'
        ? Wanghl_item.role
        : 'user';
    const Wanghl_content = Wanghl_item.content.trim().slice(0, Wanghl_MAX_CHARS);
    if (!Wanghl_content) return;
    Wanghl_messages.push({ role: Wanghl_role, content: Wanghl_content });
  });

  return Wanghl_messages.length ? Wanghl_messages : null;
}

// POST /api/chat AI 对话
async function Wanghl_chat(req, res) {
  const Wanghl_messages = Wanghl_normalizeMessages(req.body && req.body.messages);
  if (!Wanghl_messages) {
    return res.json({ code: 1, msg: '没有有效的对话内容', data: null });
  }

  try {
    const Wanghl_result = await Wanghl_chatModel.Wanghl_chatCompletion(Wanghl_messages);
    res.json({ code: 0, msg: '对话成功', data: Wanghl_result });
  } catch (Wanghl_err) {
    console.error('[Wanghl] 调用大模型失败：', Wanghl_err.message);
    res.json({
      code: 1,
      msg: '调用大模型失败：' + Wanghl_err.message,
      data: null
    });
  }
}

// POST /api/chat/stream 流式对话（SSE）
async function Wanghl_chatStream(req, res) {
  const Wanghl_messages = Wanghl_normalizeMessages(req.body && req.body.messages);

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const Wanghl_send = (Wanghl_payload) => {
    res.write('data: ' + JSON.stringify(Wanghl_payload) + '\n\n');
  };

  if (!Wanghl_messages) {
    Wanghl_send({ error: '没有有效的对话内容' });
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  const Wanghl_controller = new AbortController();
  // req 的 close 在请求体读完后就会触发，必须用 res 判断客户端是否真的断开
  res.on('close', () => {
    if (!res.writableEnded) {
      Wanghl_controller.abort();
    }
  });

  try {
    const Wanghl_result = await Wanghl_chatModel.Wanghl_chatCompletionStream(
      Wanghl_messages,
      (Wanghl_delta) => Wanghl_send({ delta: Wanghl_delta }),
      Wanghl_controller.signal
    );

    Wanghl_send({
      done: true,
      model: Wanghl_result.model,
      usage: Wanghl_result.usage,
      finishReason: Wanghl_result.finishReason
    });
    res.write('data: [DONE]\n\n');
  } catch (Wanghl_err) {
    if (Wanghl_err.name === 'AbortError') {
      console.log('[Wanghl] 客户端已中断流式响应');
    } else {
      console.error('[Wanghl] 流式调用大模型失败：', Wanghl_err.message);
      Wanghl_send({ error: Wanghl_err.message });
      res.write('data: [DONE]\n\n');
    }
  } finally {
    res.end();
  }
}

// GET /api/chat/info 对话配置（不含密钥）
async function Wanghl_getChatInfo(req, res) {
  res.json({
    code: 0,
    msg: '获取对话配置成功',
    data: Wanghl_chatModel.Wanghl_getChatConfig()
  });
}

module.exports = {
  Wanghl_chat,
  Wanghl_chatStream,
  Wanghl_getChatInfo
};
