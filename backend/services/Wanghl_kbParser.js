/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-23 | 大模型：TRAE DeepSeek-V4.1-Flash
 * 作用：知识库文件解析，支持 txt/md/pdf/doc/docx/ppt/pptx
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const WordExtractor = require('word-extractor');
const { unzipSync, strFromU8 } = require('fflate');

const Wanghl_SUPPORTED = ['.txt', '.md', '.pdf', '.doc', '.docx', '.ppt', '.pptx'];

function Wanghl_getExt(Wanghl_name) {
  return path.extname(String(Wanghl_name || '')).toLowerCase();
}

function Wanghl_isSupported(Wanghl_name) {
  return Wanghl_SUPPORTED.includes(Wanghl_getExt(Wanghl_name));
}

function Wanghl_decodeXml(Wanghl_str) {
  return String(Wanghl_str || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function Wanghl_tidy(Wanghl_text) {
  return String(Wanghl_text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// pptx：解压后读取每页 slide 的 <a:t> 文本节点
function Wanghl_parsePptx(Wanghl_buffer) {
  const Wanghl_zip = unzipSync(new Uint8Array(Wanghl_buffer));
  const Wanghl_slideNames = Object.keys(Wanghl_zip)
    .filter(function (Wanghl_name) {
      return /^ppt\/(slides|notesSlides)\/[^/]+\.xml$/.test(Wanghl_name);
    })
    .sort(function (Wanghl_a, Wanghl_b) {
      return Wanghl_a.localeCompare(Wanghl_b, 'en', { numeric: true });
    });

  const Wanghl_parts = [];
  Wanghl_slideNames.forEach(function (Wanghl_name) {
    const Wanghl_xml = strFromU8(Wanghl_zip[Wanghl_name]);
    const Wanghl_nodes = Wanghl_xml.match(/<a:t>[\s\S]*?<\/a:t>/g) || [];
    const Wanghl_texts = Wanghl_nodes
      .map(function (Wanghl_node) {
        return Wanghl_decodeXml(Wanghl_node.replace(/<\/?a:t>/g, '')).trim();
      })
      .filter(Boolean);
    if (Wanghl_texts.length) {
      Wanghl_parts.push(Wanghl_texts.join('\n'));
    }
  });

  return Wanghl_parts.join('\n\n');
}

// 旧版 doc/ppt 为二进制格式：先尝试库解析，失败时退化为可读文本扫描
function Wanghl_scanBinaryText(Wanghl_buffer) {
  const Wanghl_found = [];
  const Wanghl_utf16 = [];

  for (let Wanghl_i = 0; Wanghl_i + 1 < Wanghl_buffer.length; Wanghl_i += 2) {
    let Wanghl_j = Wanghl_i;
    let Wanghl_run = '';

    while (Wanghl_j + 1 < Wanghl_buffer.length) {
      const Wanghl_code = Wanghl_buffer[Wanghl_j] | (Wanghl_buffer[Wanghl_j + 1] << 8);
      if (Wanghl_code === 0) break;
      const Wanghl_ch = String.fromCharCode(Wanghl_code);
      if (!/[\u4e00-\u9fa5A-Za-z0-9，。、；：？！“”‘’（）《》【】\-—,.!?:;()\[\]%/'"\s]/.test(Wanghl_ch)) {
        break;
      }
      Wanghl_run += Wanghl_ch;
      Wanghl_j += 2;
    }

    if (Wanghl_run.trim().length >= 4) {
      Wanghl_utf16.push(Wanghl_run.trim());
      Wanghl_i = Wanghl_j - 2;
    }
  }

  const Wanghl_ascii = Wanghl_buffer.toString('latin1').match(/[\x20-\x7e]{6,}/g) || [];
  const Wanghl_asciiTexts = Wanghl_ascii
    .map(function (Wanghl_str) {
      return Wanghl_str.trim();
    })
    .filter(function (Wanghl_str) {
      return /[A-Za-z]{3,}/.test(Wanghl_str) && !/^[A-Za-z0-9+/=]{40,}$/.test(Wanghl_str);
    });

  Wanghl_found.push.apply(Wanghl_found, Wanghl_utf16);
  Wanghl_found.push.apply(Wanghl_found, Wanghl_asciiTexts);

  const Wanghl_unique = [];
  const Wanghl_seen = new Set();
  Wanghl_found.forEach(function (Wanghl_line) {
    const Wanghl_key = Wanghl_line.slice(0, 80);
    if (Wanghl_seen.has(Wanghl_key)) return;
    Wanghl_seen.add(Wanghl_key);
    Wanghl_unique.push(Wanghl_line);
  });

  return Wanghl_unique.join('\n');
}

function Wanghl_writeTemp(Wanghl_buffer, Wanghl_ext) {
  const Wanghl_file = path.join(
    os.tmpdir(),
    'wanghl_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + Wanghl_ext
  );
  fs.writeFileSync(Wanghl_file, Wanghl_buffer);
  return Wanghl_file;
}

async function Wanghl_parseDoc(Wanghl_buffer) {
  const Wanghl_file = Wanghl_writeTemp(Wanghl_buffer, '.doc');
  try {
    const Wanghl_extractor = new WordExtractor();
    const Wanghl_doc = await Wanghl_extractor.extract(Wanghl_file);
    return Wanghl_doc.getBody();
  } catch (Wanghl_err) {
    console.warn('[Wanghl] doc 解析库失败，改用文本扫描：', Wanghl_err.message);
    return Wanghl_scanBinaryText(Wanghl_buffer);
  } finally {
    try {
      fs.unlinkSync(Wanghl_file);
    } catch (Wanghl_err) {
      // 临时文件已不存在时忽略
    }
  }
}

// 统一解析入口
async function Wanghl_parseFile(Wanghl_file) {
  if (!Wanghl_file || !Wanghl_file.buffer) {
    throw new Error('未读取到文件内容');
  }

  const Wanghl_ext = Wanghl_getExt(Wanghl_file.originalname);
  if (!Wanghl_isSupported(Wanghl_file.originalname)) {
    throw new Error('暂不支持该文件类型：' + (Wanghl_ext || '未知'));
  }

  let Wanghl_text = '';

  if (Wanghl_ext === '.txt' || Wanghl_ext === '.md') {
    Wanghl_text = Wanghl_file.buffer.toString('utf8');
  } else if (Wanghl_ext === '.pdf') {
    const Wanghl_pdf = await pdfParse(Wanghl_file.buffer);
    Wanghl_text = Wanghl_pdf.text || '';
  } else if (Wanghl_ext === '.docx') {
    const Wanghl_result = await mammoth.extractRawText({ buffer: Wanghl_file.buffer });
    Wanghl_text = Wanghl_result.value || '';
  } else if (Wanghl_ext === '.doc') {
    Wanghl_text = await Wanghl_parseDoc(Wanghl_file.buffer);
  } else if (Wanghl_ext === '.pptx') {
    Wanghl_text = Wanghl_parsePptx(Wanghl_file.buffer);
  } else if (Wanghl_ext === '.ppt') {
    Wanghl_text = Wanghl_scanBinaryText(Wanghl_file.buffer);
  }

  Wanghl_text = Wanghl_tidy(Wanghl_text);
  if (!Wanghl_text) {
    throw new Error('未能从文件中提取到文字内容，请确认文件不是纯图片或加密文档');
  }

  return { ext: Wanghl_ext, text: Wanghl_text };
}

module.exports = {
  Wanghl_SUPPORTED,
  Wanghl_getExt,
  Wanghl_isSupported,
  Wanghl_parseFile
};
