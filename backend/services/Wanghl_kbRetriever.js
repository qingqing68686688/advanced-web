/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-23 | 大模型：TRAE DeepSeek-V4.1-Flash
 * 作用：知识库文本分块与本地 BM25 检索（RAG 的召回环节）
 */
const Wanghl_CHUNK_SIZE = 420;
const Wanghl_CHUNK_OVERLAP = 80;

// 按句子边界切分，超长时滑动窗口并保留重叠，保证语义连贯
function Wanghl_splitChunks(Wanghl_text) {
  const Wanghl_clean = String(Wanghl_text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!Wanghl_clean) return [];

  const Wanghl_sentences = Wanghl_clean.split(/(?<=[。！？!?；;.\n])/);
  const Wanghl_chunks = [];
  let Wanghl_current = '';

  Wanghl_sentences.forEach(function (Wanghl_sentence) {
    if (!Wanghl_sentence) return;

    if ((Wanghl_current + Wanghl_sentence).length > Wanghl_CHUNK_SIZE && Wanghl_current) {
      Wanghl_chunks.push(Wanghl_current.trim());
      const Wanghl_tail = Wanghl_current.slice(
        Math.max(0, Wanghl_current.length - Wanghl_CHUNK_OVERLAP)
      );
      Wanghl_current = Wanghl_tail + Wanghl_sentence;
    } else {
      Wanghl_current += Wanghl_sentence;
    }
  });

  if (Wanghl_current.trim()) {
    Wanghl_chunks.push(Wanghl_current.trim());
  }

  return Wanghl_chunks;
}

// 中文按单字 + 二元组切词，英文按单词切词
function Wanghl_tokenize(Wanghl_text) {
  const Wanghl_lower = String(Wanghl_text || '').toLowerCase();
  const Wanghl_tokens = [];
  const Wanghl_latin = Wanghl_lower.match(/[a-z0-9_]{2,}/g) || [];
  Wanghl_tokens.push.apply(Wanghl_tokens, Wanghl_latin);

  const Wanghl_cjk = Wanghl_lower.replace(/[^\u4e00-\u9fa5]/g, ' ');
  Wanghl_cjk.split(/\s+/).forEach(function (Wanghl_seg) {
    if (!Wanghl_seg) return;
    for (let Wanghl_i = 0; Wanghl_i < Wanghl_seg.length; Wanghl_i++) {
      Wanghl_tokens.push(Wanghl_seg[Wanghl_i]);
      if (Wanghl_i + 1 < Wanghl_seg.length) {
        Wanghl_tokens.push(Wanghl_seg.slice(Wanghl_i, Wanghl_i + 2));
      }
    }
  });

  return Wanghl_tokens;
}

// BM25 打分，返回最相关的若干片段
function Wanghl_rankChunks(Wanghl_question, Wanghl_chunks, Wanghl_topK) {
  const Wanghl_top = Wanghl_topK || 4;
  if (!Array.isArray(Wanghl_chunks) || Wanghl_chunks.length === 0) return [];

  const Wanghl_queryTokens = Array.from(new Set(Wanghl_tokenize(Wanghl_question)));
  if (Wanghl_queryTokens.length === 0) return [];

  const Wanghl_docTokens = Wanghl_chunks.map(function (Wanghl_chunk) {
    return Wanghl_tokenize(Wanghl_chunk.content);
  });

  const Wanghl_N = Wanghl_chunks.length;
  const Wanghl_avgLen =
    Wanghl_docTokens.reduce(function (Wanghl_sum, Wanghl_tokens) {
      return Wanghl_sum + Wanghl_tokens.length;
    }, 0) / Wanghl_N || 1;

  const Wanghl_df = new Map();
  Wanghl_docTokens.forEach(function (Wanghl_tokens) {
    new Set(Wanghl_tokens).forEach(function (Wanghl_token) {
      Wanghl_df.set(Wanghl_token, (Wanghl_df.get(Wanghl_token) || 0) + 1);
    });
  });

  const Wanghl_k1 = 1.5;
  const Wanghl_b = 0.75;

  return Wanghl_chunks
    .map(function (Wanghl_chunk, Wanghl_index) {
      const Wanghl_tokens = Wanghl_docTokens[Wanghl_index];
      const Wanghl_tf = new Map();
      Wanghl_tokens.forEach(function (Wanghl_token) {
        Wanghl_tf.set(Wanghl_token, (Wanghl_tf.get(Wanghl_token) || 0) + 1);
      });

      let Wanghl_score = 0;
      Wanghl_queryTokens.forEach(function (Wanghl_token) {
        const Wanghl_f = Wanghl_tf.get(Wanghl_token) || 0;
        if (!Wanghl_f) return;

        const Wanghl_docFreq = Wanghl_df.get(Wanghl_token) || 0;
        const Wanghl_idf = Math.log(
          1 + (Wanghl_N - Wanghl_docFreq + 0.5) / (Wanghl_docFreq + 0.5)
        );
        // 二元词更具区分度，权重略高
        const Wanghl_weight = Wanghl_token.length >= 2 ? 1.4 : 1;

        Wanghl_score +=
          Wanghl_weight *
          Wanghl_idf *
          ((Wanghl_f * (Wanghl_k1 + 1)) /
            (Wanghl_f + Wanghl_k1 * (1 - Wanghl_b + (Wanghl_b * Wanghl_tokens.length) / Wanghl_avgLen)));
      });

      return {
        id: Wanghl_chunk.id,
        docName: Wanghl_chunk.docName,
        chunkIndex: Wanghl_chunk.chunkIndex,
        content: Wanghl_chunk.content,
        score: Wanghl_score
      };
    })
    .filter(function (Wanghl_item) {
      return Wanghl_item.score > 0;
    })
    .sort(function (Wanghl_a, Wanghl_b) {
      return Wanghl_b.score - Wanghl_a.score;
    })
    .slice(0, Wanghl_top);
}

module.exports = {
  Wanghl_splitChunks,
  Wanghl_tokenize,
  Wanghl_rankChunks
};
