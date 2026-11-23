/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-23 | 大模型：TRAE DeepSeek-V4.1-Flash
 * 作用：知识库管理页面逻辑（上传解析、文档管理、基于知识库的 RAG 问答）
 */
(function () {
  'use strict';

  var Wanghl_dropEl = document.getElementById('Wanghl_kbDrop');
  var Wanghl_fileEl = document.getElementById('Wanghl_kbFile');
  var Wanghl_uploadStateEl = document.getElementById('Wanghl_kbUploadState');
  var Wanghl_supportedEl = document.getElementById('Wanghl_kbSupported');
  var Wanghl_docListEl = document.getElementById('Wanghl_kbDocList');
  var Wanghl_docCountEl = document.getElementById('Wanghl_kbDocCount');
  var Wanghl_statDocsEl = document.getElementById('Wanghl_kbStatDocs');
  var Wanghl_statChunksEl = document.getElementById('Wanghl_kbStatChunks');
  var Wanghl_statCharsEl = document.getElementById('Wanghl_kbStatChars');
  var Wanghl_scopeEl = document.getElementById('Wanghl_kbScope');
  var Wanghl_modelTextEl = document.getElementById('Wanghl_kbModelText');
  var Wanghl_logEl = document.getElementById('Wanghl_kbLog');
  var Wanghl_formEl = document.getElementById('Wanghl_kbForm');
  var Wanghl_inputEl = document.getElementById('Wanghl_kbInput');
  var Wanghl_sendEl = document.getElementById('Wanghl_kbSend');
  var Wanghl_suggestsEl = document.getElementById('Wanghl_kbSuggests');

  var Wanghl_docs = [];
  var Wanghl_busy = false;

  /* ---------------- 工具函数 ---------------- */
  function Wanghl_escapeHtml(Wanghl_str) {
    return String(Wanghl_str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function Wanghl_inline(Wanghl_text) {
    return Wanghl_text
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(
        /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>'
      );
  }

  function Wanghl_markdown(Wanghl_raw) {
    var Wanghl_lines = Wanghl_escapeHtml(Wanghl_raw || '').split('\n');
    var Wanghl_html = '';
    var Wanghl_i = 0;

    while (Wanghl_i < Wanghl_lines.length) {
      var Wanghl_line = Wanghl_lines[Wanghl_i];

      if (/^```/.test(Wanghl_line.trim())) {
        var Wanghl_code = [];
        Wanghl_i++;
        while (Wanghl_i < Wanghl_lines.length && !/^```/.test(Wanghl_lines[Wanghl_i].trim())) {
          Wanghl_code.push(Wanghl_lines[Wanghl_i]);
          Wanghl_i++;
        }
        Wanghl_i++;
        Wanghl_html += '<pre><code>' + Wanghl_code.join('\n') + '</code></pre>';
        continue;
      }

      if (/^\s*$/.test(Wanghl_line)) {
        Wanghl_i++;
        continue;
      }

      var Wanghl_heading = Wanghl_line.match(/^(#{1,4})\s+(.*)$/);
      if (Wanghl_heading) {
        var Wanghl_tag = Wanghl_heading[1].length <= 3 ? 'h3' : 'h4';
        Wanghl_html +=
          '<' + Wanghl_tag + '>' + Wanghl_inline(Wanghl_heading[2]) + '</' + Wanghl_tag + '>';
        Wanghl_i++;
        continue;
      }

      if (/^\s*[-*]\s+/.test(Wanghl_line)) {
        var Wanghl_ul = [];
        while (Wanghl_i < Wanghl_lines.length && /^\s*[-*]\s+/.test(Wanghl_lines[Wanghl_i])) {
          Wanghl_ul.push(
            '<li>' + Wanghl_inline(Wanghl_lines[Wanghl_i].replace(/^\s*[-*]\s+/, '')) + '</li>'
          );
          Wanghl_i++;
        }
        Wanghl_html += '<ul>' + Wanghl_ul.join('') + '</ul>';
        continue;
      }

      if (/^\s*\d+\.\s+/.test(Wanghl_line)) {
        var Wanghl_ol = [];
        while (Wanghl_i < Wanghl_lines.length && /^\s*\d+\.\s+/.test(Wanghl_lines[Wanghl_i])) {
          Wanghl_ol.push(
            '<li>' + Wanghl_inline(Wanghl_lines[Wanghl_i].replace(/^\s*\d+\.\s+/, '')) + '</li>'
          );
          Wanghl_i++;
        }
        Wanghl_html += '<ol>' + Wanghl_ol.join('') + '</ol>';
        continue;
      }

      var Wanghl_para = [];
      while (
        Wanghl_i < Wanghl_lines.length &&
        !/^\s*$/.test(Wanghl_lines[Wanghl_i]) &&
        !/^```/.test(Wanghl_lines[Wanghl_i].trim()) &&
        !/^(#{1,4})\s+/.test(Wanghl_lines[Wanghl_i]) &&
        !/^\s*[-*]\s+/.test(Wanghl_lines[Wanghl_i]) &&
        !/^\s*\d+\.\s+/.test(Wanghl_lines[Wanghl_i])
      ) {
        Wanghl_para.push(Wanghl_lines[Wanghl_i]);
        Wanghl_i++;
      }
      Wanghl_html += '<p>' + Wanghl_inline(Wanghl_para.join('<br>')) + '</p>';
    }

    return Wanghl_html;
  }

  function Wanghl_formatBytes(Wanghl_bytes) {
    var Wanghl_num = Number(Wanghl_bytes) || 0;
    if (Wanghl_num < 1024) return Wanghl_num + ' B';
    if (Wanghl_num < 1024 * 1024) return (Wanghl_num / 1024).toFixed(1) + ' KB';
    return (Wanghl_num / 1024 / 1024).toFixed(2) + ' MB';
  }

  function Wanghl_formatNumber(Wanghl_num) {
    return (Number(Wanghl_num) || 0).toLocaleString('zh-CN');
  }

  function Wanghl_scrollBottom() {
    Wanghl_logEl.scrollTop = Wanghl_logEl.scrollHeight;
  }

  function Wanghl_setBusy(Wanghl_flag) {
    Wanghl_busy = Wanghl_flag;
    Wanghl_sendEl.disabled = Wanghl_flag;
    Wanghl_sendEl.textContent = Wanghl_flag ? '生成中…' : '提问';
    Wanghl_dropEl.classList.toggle('is-busy', Wanghl_flag);
  }

  function Wanghl_setUploadState(Wanghl_text, Wanghl_type) {
    Wanghl_uploadStateEl.textContent = Wanghl_text;
    Wanghl_uploadStateEl.classList.toggle('is-ok', Wanghl_type === 'ok');
    Wanghl_uploadStateEl.classList.toggle('is-bad', Wanghl_type === 'bad');
  }

  /* ---------------- 知识库信息与文档列表 ---------------- */
  function Wanghl_renderStats(Wanghl_stats) {
    var Wanghl_safe = Wanghl_stats || { docs: 0, chunks: 0, chars: 0 };
    Wanghl_statDocsEl.textContent = String(Wanghl_safe.docs || 0);
    Wanghl_statChunksEl.textContent = String(Wanghl_safe.chunks || 0);
    Wanghl_statCharsEl.textContent = Wanghl_formatNumber(Wanghl_safe.chars || 0);
    Wanghl_docCountEl.textContent = (Wanghl_safe.docs || 0) + ' 个';
  }

  function Wanghl_renderDocs(Wanghl_list) {
    Wanghl_docs = Array.isArray(Wanghl_list) ? Wanghl_list : [];
    Wanghl_docListEl.textContent = '';

    if (!Wanghl_docs.length) {
      var Wanghl_empty = document.createElement('li');
      Wanghl_empty.className = 'Wanghl_kb-empty';
      Wanghl_empty.textContent = '知识库还没有文件，先上传一个文档试试。';
      Wanghl_docListEl.appendChild(Wanghl_empty);
    } else {
      Wanghl_docs.forEach(function (Wanghl_doc) {
        var Wanghl_li = document.createElement('li');
        Wanghl_li.className = 'Wanghl_kb-doc';

        var Wanghl_ext = document.createElement('span');
        Wanghl_ext.className = 'Wanghl_kb-doc-ext';
        Wanghl_ext.textContent = String(Wanghl_doc.ext || '').replace('.', '') || 'DOC';

        var Wanghl_main = document.createElement('div');
        Wanghl_main.className = 'Wanghl_kb-doc-main';

        var Wanghl_name = document.createElement('span');
        Wanghl_name.className = 'Wanghl_kb-doc-name';
        Wanghl_name.textContent = Wanghl_doc.name;
        Wanghl_name.title = Wanghl_doc.name;

        var Wanghl_meta = document.createElement('span');
        Wanghl_meta.className = 'Wanghl_kb-doc-meta';
        Wanghl_meta.textContent =
          Wanghl_doc.chunkCount + ' 个分块 · ' + Wanghl_formatBytes(Wanghl_doc.size);

        Wanghl_main.appendChild(Wanghl_name);
        Wanghl_main.appendChild(Wanghl_meta);

        var Wanghl_del = document.createElement('button');
        Wanghl_del.type = 'button';
        Wanghl_del.className = 'Wanghl_kb-doc-del';
        Wanghl_del.title = '删除该文档';
        Wanghl_del.textContent = '×';
        Wanghl_del.addEventListener('click', function () {
          Wanghl_deleteDoc(Wanghl_doc.name);
        });

        Wanghl_li.appendChild(Wanghl_ext);
        Wanghl_li.appendChild(Wanghl_main);
        Wanghl_li.appendChild(Wanghl_del);
        Wanghl_docListEl.appendChild(Wanghl_li);
      });
    }

    Wanghl_renderScope();
  }

  function Wanghl_renderScope() {
    var Wanghl_selected = Wanghl_scopeEl.value;
    Wanghl_scopeEl.textContent = '';

    var Wanghl_all = document.createElement('option');
    Wanghl_all.value = '';
    Wanghl_all.textContent = '全部文档';
    Wanghl_scopeEl.appendChild(Wanghl_all);

    Wanghl_docs.forEach(function (Wanghl_doc) {
      var Wanghl_opt = document.createElement('option');
      Wanghl_opt.value = Wanghl_doc.name;
      Wanghl_opt.textContent = Wanghl_doc.name;
      Wanghl_scopeEl.appendChild(Wanghl_opt);
    });

    if (Wanghl_selected && Wanghl_docs.some(function (Wanghl_doc) {
      return Wanghl_doc.name === Wanghl_selected;
    })) {
      Wanghl_scopeEl.value = Wanghl_selected;
    }
  }

  function Wanghl_loadDocuments() {
    fetch(Wanghl_apiUrl('/api/kb/documents'))
      .then(function (Wanghl_res) {
        return Wanghl_res.json();
      })
      .then(function (Wanghl_data) {
        console.log('[Wanghl] /api/kb/documents 响应：', Wanghl_data);
        if (!Wanghl_data || Wanghl_data.code !== 0 || !Wanghl_data.data) {
          throw new Error((Wanghl_data && Wanghl_data.msg) || '接口返回异常');
        }
        Wanghl_renderDocs(Wanghl_data.data.list);
        Wanghl_renderStats(Wanghl_data.data.stats);
      })
      .catch(function (Wanghl_err) {
        console.error('[Wanghl] 获取知识库文档失败：', Wanghl_err);
        Wanghl_docListEl.textContent = '';
        var Wanghl_li = document.createElement('li');
        Wanghl_li.className = 'Wanghl_kb-empty';
        Wanghl_li.textContent = '知识库加载失败：' + Wanghl_err.message;
        Wanghl_docListEl.appendChild(Wanghl_li);
        Wanghl_modelTextEl.textContent = '知识库未就绪';
      });
  }

  function Wanghl_loadInfo() {
    fetch(Wanghl_apiUrl('/api/kb/info'))
      .then(function (Wanghl_res) {
        return Wanghl_res.json();
      })
      .then(function (Wanghl_data) {
        console.log('[Wanghl] /api/kb/info 响应：', Wanghl_data);
        if (!Wanghl_data || Wanghl_data.code !== 0 || !Wanghl_data.data) {
          throw new Error((Wanghl_data && Wanghl_data.msg) || '配置接口异常');
        }

        var Wanghl_info = Wanghl_data.data;
        if (Wanghl_supportedEl && Array.isArray(Wanghl_info.supported)) {
          Wanghl_supportedEl.textContent =
            '支持 ' + Wanghl_info.supported.join(' / ') + '，单文件 ≤ ' + Wanghl_info.maxSizeMB + 'MB';
        }
        var Wanghl_model = Wanghl_info.model && Wanghl_info.model.model ? Wanghl_info.model.model : '知识库检索';
        Wanghl_modelTextEl.textContent = Wanghl_model + ' · 检索 Top ' + Wanghl_info.topK;
      })
      .catch(function (Wanghl_err) {
        console.error('[Wanghl] 获取知识库配置失败：', Wanghl_err);
        Wanghl_modelTextEl.textContent = '知识库未就绪，请先执行初始化脚本';
      });
  }

  /* ---------------- 上传 ---------------- */
  function Wanghl_uploadFile(Wanghl_file) {
    if (!Wanghl_file || Wanghl_busy) return;

    var Wanghl_form = new FormData();
    Wanghl_form.append('file', Wanghl_file);

    Wanghl_setUploadState('正在上传并解析「' + Wanghl_file.name + '」…', '');
    Wanghl_setBusy(true);
    console.log('[Wanghl] 上传知识库文件：', Wanghl_file.name, Wanghl_file.size + ' 字节');

    fetch(Wanghl_apiUrl('/api/kb/upload'), {
      method: 'POST',
      body: Wanghl_form
    })
      .then(function (Wanghl_res) {
        return Wanghl_res.json();
      })
      .then(function (Wanghl_data) {
        console.log('[Wanghl] /api/kb/upload 响应：', Wanghl_data);
        if (!Wanghl_data || Wanghl_data.code !== 0) {
          throw new Error((Wanghl_data && Wanghl_data.msg) || '上传失败');
        }

        var Wanghl_info = Wanghl_data.data;
        Wanghl_setUploadState(
          '已入库「' + Wanghl_info.name + '」：' +
            Wanghl_info.chunkCount + ' 个分块，' +
            Wanghl_formatNumber(Wanghl_info.chars) + ' 字符',
          'ok'
        );
        Wanghl_renderStats(Wanghl_info.stats);
        Wanghl_loadDocuments();
      })
      .catch(function (Wanghl_err) {
        console.error('[Wanghl] 知识库上传失败：', Wanghl_err);
        Wanghl_setUploadState('上传失败：' + Wanghl_err.message, 'bad');
      })
      .finally(function () {
        Wanghl_setBusy(false);
        Wanghl_fileEl.value = '';
      });
  }

  function Wanghl_deleteDoc(Wanghl_name) {
    if (Wanghl_busy) return;
    if (!window.confirm('确定删除「' + Wanghl_name + '」的全部分块吗？此操作不可撤销。')) {
      return;
    }

    var Wanghl_url = Wanghl_apiUrl('/api/kb/documents?name=' + encodeURIComponent(Wanghl_name));
    console.log('[Wanghl] 删除知识库文档：', Wanghl_name);

    fetch(Wanghl_url, { method: 'DELETE' })
      .then(function (Wanghl_res) {
        return Wanghl_res.json();
      })
      .then(function (Wanghl_data) {
        console.log('[Wanghl] DELETE /api/kb/documents 响应：', Wanghl_data);
        if (!Wanghl_data || Wanghl_data.code !== 0) {
          throw new Error((Wanghl_data && Wanghl_data.msg) || '删除失败');
        }
        Wanghl_setUploadState('已删除「' + Wanghl_name + '」', 'ok');
        Wanghl_renderStats(Wanghl_data.data.stats);
        Wanghl_loadDocuments();
      })
      .catch(function (Wanghl_err) {
        console.error('[Wanghl] 删除知识库文档失败：', Wanghl_err);
        Wanghl_setUploadState('删除失败：' + Wanghl_err.message, 'bad');
      });
  }

  /* ---------------- 问答 ---------------- */
  function Wanghl_appendWelcome() {
    var Wanghl_welcome = document.createElement('div');
    Wanghl_welcome.className = 'Wanghl_kb-welcome';
    Wanghl_welcome.innerHTML =
      '你好，我是基于知识库的专属客服。我会先在你的文档中检索相关片段，再依据片段回答，' +
      '并列出引用来源。当前知识库包含 <strong>' +
      Wanghl_formatNumber(Wanghl_docs.length) +
      '</strong> 个文档，直接提问即可开始。';
    Wanghl_logEl.appendChild(Wanghl_welcome);
  }

  function Wanghl_renderSources(Wanghl_sources) {
    var Wanghl_box = document.createElement('div');
    Wanghl_box.className = 'Wanghl_kb-sources';

    var Wanghl_title = document.createElement('p');
    Wanghl_title.className = 'Wanghl_kb-sources-title';
    Wanghl_title.textContent = '引用来源';
    Wanghl_box.appendChild(Wanghl_title);

    Wanghl_sources.forEach(function (Wanghl_src) {
      var Wanghl_row = document.createElement('div');
      Wanghl_row.className = 'Wanghl_kb-source';

      var Wanghl_idx = document.createElement('span');
      Wanghl_idx.className = 'Wanghl_kb-source-idx';
      Wanghl_idx.textContent = '[' + Wanghl_src.index + ']';

      var Wanghl_body = document.createElement('div');
      Wanghl_body.className = 'Wanghl_kb-source-body';

      var Wanghl_doc = document.createElement('span');
      Wanghl_doc.className = 'Wanghl_kb-source-doc';
      Wanghl_doc.textContent = Wanghl_src.docName + ' · 片段 ' + (Wanghl_src.chunkIndex + 1);

      var Wanghl_score = document.createElement('span');
      Wanghl_score.className = 'Wanghl_kb-source-score';
      Wanghl_score.textContent = '相关度 ' + Wanghl_src.score;

      var Wanghl_text = document.createElement('span');
      Wanghl_text.className = 'Wanghl_kb-source-text';
      Wanghl_text.textContent = Wanghl_src.snippet + '…';

      Wanghl_doc.appendChild(Wanghl_score);
      Wanghl_body.appendChild(Wanghl_doc);
      Wanghl_body.appendChild(Wanghl_text);

      Wanghl_row.appendChild(Wanghl_idx);
      Wanghl_row.appendChild(Wanghl_body);
      Wanghl_box.appendChild(Wanghl_row);
    });

    return Wanghl_box;
  }

  function Wanghl_ask(Wanghl_question) {
    var Wanghl_content = (Wanghl_question || '').trim();
    if (!Wanghl_content || Wanghl_busy) return;

    var Wanghl_docName = Wanghl_scopeEl.value;

    var Wanghl_turn = document.createElement('div');
    Wanghl_turn.className = 'Wanghl_kb-turn';

    var Wanghl_q = document.createElement('div');
    Wanghl_q.className = 'Wanghl_kb-q';
    Wanghl_q.textContent = Wanghl_content;

    var Wanghl_a = document.createElement('div');
    Wanghl_a.className = 'Wanghl_kb-a';
    var Wanghl_loading = document.createElement('span');
    Wanghl_loading.className = 'Wanghl_kb-loading';
    Wanghl_loading.innerHTML = '<i></i><i></i><i></i>';
    Wanghl_a.appendChild(Wanghl_loading);

    Wanghl_turn.appendChild(Wanghl_q);
    Wanghl_turn.appendChild(Wanghl_a);
    Wanghl_logEl.appendChild(Wanghl_turn);
    Wanghl_scrollBottom();

    Wanghl_inputEl.value = '';
    Wanghl_resizeInput();
    Wanghl_setBusy(true);

    var Wanghl_payload = { question: Wanghl_content, docName: Wanghl_docName };
    console.log('[Wanghl] 发送给知识库问答接口的数据：', Wanghl_payload);

    fetch(Wanghl_apiUrl('/api/kb/ask'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Wanghl_payload)
    })
      .then(function (Wanghl_res) {
        return Wanghl_res.json();
      })
      .then(function (Wanghl_data) {
        console.log('[Wanghl] /api/kb/ask 响应：', Wanghl_data);
        if (!Wanghl_data || Wanghl_data.code !== 0 || !Wanghl_data.data) {
          throw new Error((Wanghl_data && Wanghl_data.msg) || '问答失败');
        }

        var Wanghl_result = Wanghl_data.data;
        Wanghl_a.innerHTML = Wanghl_markdown(Wanghl_result.answer || '');

        if (Array.isArray(Wanghl_result.sources) && Wanghl_result.sources.length) {
          Wanghl_a.appendChild(Wanghl_renderSources(Wanghl_result.sources));
        }

        if (Wanghl_result.usage) {
          var Wanghl_meta = document.createElement('span');
          Wanghl_meta.className = 'Wanghl_kb-hint';
          Wanghl_meta.style.display = 'block';
          Wanghl_meta.textContent =
            (Wanghl_result.model || '') +
            ' · 输入 ' + (Wanghl_result.usage.prompt_tokens || 0) +
            ' / 输出 ' + (Wanghl_result.usage.completion_tokens || 0) + ' tokens';
          Wanghl_a.appendChild(Wanghl_meta);
        }

        Wanghl_scrollBottom();
      })
      .catch(function (Wanghl_err) {
        console.error('[Wanghl] 知识库问答失败：', Wanghl_err);
        Wanghl_a.classList.add('is-error');
        Wanghl_a.textContent = '回答失败：' + Wanghl_err.message;
        Wanghl_scrollBottom();
      })
      .finally(function () {
        Wanghl_setBusy(false);
        Wanghl_inputEl.focus();
      });
  }

  function Wanghl_resizeInput() {
    Wanghl_inputEl.style.height = 'auto';
    Wanghl_inputEl.style.height = Math.min(Wanghl_inputEl.scrollHeight, 120) + 'px';
  }

  /* ---------------- 事件绑定 ---------------- */
  Wanghl_fileEl.addEventListener('change', function () {
    if (Wanghl_fileEl.files && Wanghl_fileEl.files[0]) {
      Wanghl_uploadFile(Wanghl_fileEl.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(function (Wanghl_eventName) {
    Wanghl_dropEl.addEventListener(Wanghl_eventName, function (Wanghl_event) {
      Wanghl_event.preventDefault();
      Wanghl_dropEl.classList.add('is-drag');
    });
  });

  ['dragleave', 'dragend'].forEach(function (Wanghl_eventName) {
    Wanghl_dropEl.addEventListener(Wanghl_eventName, function (Wanghl_event) {
      Wanghl_event.preventDefault();
      Wanghl_dropEl.classList.remove('is-drag');
    });
  });

  Wanghl_dropEl.addEventListener('drop', function (Wanghl_event) {
    Wanghl_event.preventDefault();
    Wanghl_dropEl.classList.remove('is-drag');
    if (Wanghl_event.dataTransfer && Wanghl_event.dataTransfer.files.length) {
      Wanghl_uploadFile(Wanghl_event.dataTransfer.files[0]);
    }
  });

  Wanghl_formEl.addEventListener('submit', function (Wanghl_event) {
    Wanghl_event.preventDefault();
    Wanghl_ask(Wanghl_inputEl.value);
  });

  Wanghl_inputEl.addEventListener('input', Wanghl_resizeInput);

  Wanghl_inputEl.addEventListener('keydown', function (Wanghl_event) {
    if (Wanghl_event.key === 'Enter' && !Wanghl_event.shiftKey) {
      Wanghl_event.preventDefault();
      Wanghl_ask(Wanghl_inputEl.value);
    }
  });

  Wanghl_suggestsEl.addEventListener('click', function (Wanghl_event) {
    var Wanghl_btn = Wanghl_event.target.closest('.Wanghl_kb-suggest');
    if (Wanghl_btn) Wanghl_ask(Wanghl_btn.textContent);
  });

  /* ---------------- 初始化 ---------------- */
  Wanghl_appendWelcome();
  Wanghl_loadInfo();
  Wanghl_loadDocuments();
  Wanghl_inputEl.focus();
})();
