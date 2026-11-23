/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-23 | 大模型：TRAE DeepSeek-V4.1-Flash
 * 作用：知识库数据访问层（文档分块存储、列表、删除与检索）
 */
const Wanghl_pool = require('../config/db');
const Wanghl_retriever = require('../services/Wanghl_kbRetriever');

// 按文档聚合出知识库文件列表
async function Wanghl_listDocuments() {
  const Wanghl_sql = `
    SELECT
      Wanghl_doc_name AS name,
      Wanghl_doc_ext AS ext,
      MAX(Wanghl_doc_size) AS size,
      COUNT(*) AS chunkCount,
      MIN(Wanghl_created_at) AS createdAt
    FROM Wanghl_kb_chunks
    GROUP BY Wanghl_doc_name, Wanghl_doc_ext
    ORDER BY MIN(Wanghl_created_at) DESC, Wanghl_doc_name ASC
  `;
  const [Wanghl_rows] = await Wanghl_pool.query(Wanghl_sql);
  return Wanghl_rows;
}

async function Wanghl_listChunks(Wanghl_docName) {
  const Wanghl_hasFilter = Boolean(Wanghl_docName);
  const Wanghl_sql =
    `SELECT
       Wanghl_id AS id,
       Wanghl_doc_name AS docName,
       Wanghl_doc_ext AS ext,
       Wanghl_chunk_index AS chunkIndex,
       Wanghl_content AS content
     FROM Wanghl_kb_chunks` +
    (Wanghl_hasFilter ? ' WHERE Wanghl_doc_name = ?' : '') +
    ' ORDER BY Wanghl_doc_name ASC, Wanghl_chunk_index ASC';

  const [Wanghl_rows] = await Wanghl_pool.query(
    Wanghl_sql,
    Wanghl_hasFilter ? [Wanghl_docName] : []
  );
  return Wanghl_rows;
}

// 保存文档：同名文档视为覆盖，先删后插
async function Wanghl_saveDocument(Wanghl_doc) {
  const Wanghl_connection = await Wanghl_pool.getConnection();
  try {
    await Wanghl_connection.beginTransaction();
    await Wanghl_connection.query('DELETE FROM Wanghl_kb_chunks WHERE Wanghl_doc_name = ?', [
      Wanghl_doc.name
    ]);

    const Wanghl_values = Wanghl_doc.chunks.map(function (Wanghl_content, Wanghl_index) {
      return [Wanghl_doc.name, Wanghl_doc.ext, Wanghl_doc.size, Wanghl_index, Wanghl_content];
    });

    const Wanghl_sql =
      'INSERT INTO Wanghl_kb_chunks (Wanghl_doc_name, Wanghl_doc_ext, Wanghl_doc_size, Wanghl_chunk_index, Wanghl_content) VALUES ?';
    const [Wanghl_result] = await Wanghl_connection.query(Wanghl_sql, [Wanghl_values]);

    await Wanghl_connection.commit();
    return Wanghl_result.affectedRows;
  } catch (Wanghl_err) {
    await Wanghl_connection.rollback();
    throw Wanghl_err;
  } finally {
    Wanghl_connection.release();
  }
}

async function Wanghl_deleteDocument(Wanghl_docName) {
  const [Wanghl_result] = await Wanghl_pool.query(
    'DELETE FROM Wanghl_kb_chunks WHERE Wanghl_doc_name = ?',
    [Wanghl_docName]
  );
  return Wanghl_result.affectedRows;
}

async function Wanghl_getStats() {
  const [Wanghl_docRows] = await Wanghl_pool.query(
    'SELECT COUNT(DISTINCT Wanghl_doc_name) AS docs FROM Wanghl_kb_chunks'
  );
  const [Wanghl_chunkRows] = await Wanghl_pool.query(
    'SELECT COUNT(*) AS chunks, COALESCE(SUM(CHAR_LENGTH(Wanghl_content)), 0) AS chars FROM Wanghl_kb_chunks'
  );

  return {
    docs: Wanghl_docRows[0] ? Wanghl_docRows[0].docs : 0,
    chunks: Wanghl_chunkRows[0] ? Wanghl_chunkRows[0].chunks : 0,
    chars: Wanghl_chunkRows[0] ? Number(Wanghl_chunkRows[0].chars) : 0
  };
}

// 检索：支持限定单个知识库文件
async function Wanghl_search(Wanghl_question, Wanghl_docName, Wanghl_topK) {
  const Wanghl_chunks = await Wanghl_listChunks(Wanghl_docName);
  return Wanghl_retriever.Wanghl_rankChunks(Wanghl_question, Wanghl_chunks, Wanghl_topK || 4);
}

module.exports = {
  Wanghl_listDocuments,
  Wanghl_listChunks,
  Wanghl_saveDocument,
  Wanghl_deleteDocument,
  Wanghl_getStats,
  Wanghl_search
};
