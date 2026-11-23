/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-23 | 大模型：TRAE DeepSeek-V4.1-Flash
 * 作用：调用七牛云 AI 大模型（OpenAI 兼容接口）完成对话
 */
const Wanghl_BASE_URL = process.env.QINIU_BASE_URL || 'https://api.qnaigc.com/v1';
const Wanghl_MODEL = process.env.QINIU_MODEL || 'qiniu/conatus-free';

// 发送对话消息，返回模型回复
async function Wanghl_chatCompletion(Wanghl_messages) {
  const Wanghl_apiKey = process.env.QINIU_API_KEY;
  if (!Wanghl_apiKey) {
    throw new Error('未配置 QINIU_API_KEY，请检查 backend/.env');
  }

  const Wanghl_payload = {
    model: Wanghl_MODEL,
    messages: Wanghl_messages,
    temperature: 0.7,
    max_tokens: 1024,
    stream: false
  };

  console.log('[Wanghl] 发送给大模型的数据：', JSON.stringify(Wanghl_payload, null, 2));

  const Wanghl_res = await fetch(Wanghl_BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + Wanghl_apiKey
    },
    body: JSON.stringify(Wanghl_payload),
    signal: AbortSignal.timeout(60000)
  });

  const Wanghl_text = await Wanghl_res.text();
  console.log('[Wanghl] 从大模型接收到的数据：', Wanghl_text);

  if (!Wanghl_res.ok) {
    let Wanghl_msg = '大模型接口请求失败（HTTP ' + Wanghl_res.status + '）';
    try {
      const Wanghl_errJson = JSON.parse(Wanghl_text);
      if (Wanghl_errJson.error && Wanghl_errJson.error.message) {
        Wanghl_msg = Wanghl_errJson.error.message;
      }
    } catch (Wanghl_parseErr) {
      // 非 JSON 错误体，保留默认提示
    }
    throw new Error(Wanghl_msg);
  }

  let Wanghl_data;
  try {
    Wanghl_data = JSON.parse(Wanghl_text);
  } catch (Wanghl_parseErr) {
    throw new Error('大模型返回内容不是合法 JSON');
  }

  const Wanghl_choice = Wanghl_data.choices && Wanghl_data.choices[0];
  const Wanghl_content = Wanghl_choice && Wanghl_choice.message ? Wanghl_choice.message.content : '';
  if (!Wanghl_content) {
    throw new Error('大模型未返回有效回复');
  }

  return {
    content: Wanghl_content,
    model: Wanghl_data.model || Wanghl_MODEL,
    usage: Wanghl_data.usage || null,
    finishReason: Wanghl_choice.finish_reason || ''
  };
}

// 流式对话：每收到一段增量内容就回调 Wanghl_onDelta
async function Wanghl_chatCompletionStream(Wanghl_messages, Wanghl_onDelta, Wanghl_signal) {
  const Wanghl_apiKey = process.env.QINIU_API_KEY;
  if (!Wanghl_apiKey) {
    throw new Error('未配置 QINIU_API_KEY，请检查 backend/.env');
  }

  const Wanghl_payload = {
    model: Wanghl_MODEL,
    messages: Wanghl_messages,
    temperature: 0.7,
    max_tokens: 1024,
    stream: true
  };

  console.log('[Wanghl] 发送给大模型的数据（流式）：', JSON.stringify(Wanghl_payload, null, 2));

  const Wanghl_timeout = AbortSignal.timeout(90000);
  const Wanghl_signalCombined = Wanghl_signal
    ? AbortSignal.any([Wanghl_signal, Wanghl_timeout])
    : Wanghl_timeout;

  const Wanghl_res = await fetch(Wanghl_BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + Wanghl_apiKey
    },
    body: JSON.stringify(Wanghl_payload),
    signal: Wanghl_signalCombined
  });

  if (!Wanghl_res.ok) {
    const Wanghl_errText = await Wanghl_res.text();
    console.log('[Wanghl] 从大模型接收到的错误数据：', Wanghl_errText);
    let Wanghl_msg = '大模型接口请求失败（HTTP ' + Wanghl_res.status + '）';
    try {
      const Wanghl_errJson = JSON.parse(Wanghl_errText);
      if (Wanghl_errJson.error && Wanghl_errJson.error.message) {
        Wanghl_msg = Wanghl_errJson.error.message;
      }
    } catch (Wanghl_parseErr) {
      // 非 JSON 错误体，保留默认提示
    }
    throw new Error(Wanghl_msg);
  }

  const Wanghl_reader = Wanghl_res.body.getReader();
  const Wanghl_decoder = new TextDecoder('utf-8');
  let Wanghl_buffer = '';
  let Wanghl_fullText = '';
  let Wanghl_model = Wanghl_MODEL;
  let Wanghl_usage = null;
  let Wanghl_finishReason = '';

  while (true) {
    const Wanghl_read = await Wanghl_reader.read();
    if (Wanghl_read.done) break;

    const Wanghl_chunk = Wanghl_decoder.decode(Wanghl_read.value, { stream: true });
    console.log('[Wanghl] 从大模型接收到的数据片段：', Wanghl_chunk);

    Wanghl_buffer += Wanghl_chunk;
    const Wanghl_lines = Wanghl_buffer.split('\n');
    Wanghl_buffer = Wanghl_lines.pop();

    for (const Wanghl_line of Wanghl_lines) {
      const Wanghl_trimmed = Wanghl_line.trim();
      if (!Wanghl_trimmed || !Wanghl_trimmed.startsWith('data:')) continue;

      const Wanghl_dataText = Wanghl_trimmed.slice(5).trim();
      if (Wanghl_dataText === '[DONE]') continue;

      let Wanghl_json;
      try {
        Wanghl_json = JSON.parse(Wanghl_dataText);
      } catch (Wanghl_parseErr) {
        continue;
      }

      if (Wanghl_json.model) Wanghl_model = Wanghl_json.model;
      if (Wanghl_json.usage) Wanghl_usage = Wanghl_json.usage;

      const Wanghl_choice = Wanghl_json.choices && Wanghl_json.choices[0];
      if (!Wanghl_choice) continue;

      const Wanghl_delta = Wanghl_choice.delta && Wanghl_choice.delta.content;
      if (Wanghl_delta) {
        Wanghl_fullText += Wanghl_delta;
        Wanghl_onDelta(Wanghl_delta);
      }
      if (Wanghl_choice.finish_reason) {
        Wanghl_finishReason = Wanghl_choice.finish_reason;
      }
    }
  }

  console.log('[Wanghl] 大模型流式接收完毕，完整内容：', Wanghl_fullText);

  if (!Wanghl_fullText) {
    throw new Error('大模型未返回有效回复');
  }

  return {
    content: Wanghl_fullText,
    model: Wanghl_model,
    usage: Wanghl_usage,
    finishReason: Wanghl_finishReason
  };
}

// 返回对话配置（不含密钥）
function Wanghl_getChatConfig() {
  return {
    model: Wanghl_MODEL,
    baseUrl: Wanghl_BASE_URL,
    configured: Boolean(process.env.QINIU_API_KEY)
  };
}

module.exports = {
  Wanghl_chatCompletion,
  Wanghl_chatCompletionStream,
  Wanghl_getChatConfig
};
