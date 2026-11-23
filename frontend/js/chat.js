/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-23 | 大模型：TRAE DeepSeek-V4.1-Flash
 * 作用：AI 在线客服，三栏布局、本地会话、流式输出、简易 Markdown
 */
(function () {
  'use strict';

  var Wanghl_STORAGE_KEY = 'Wanghl_chatSessions_v1';
  var Wanghl_CURRENT_KEY = 'Wanghl_chatCurrentId_v1';
  var Wanghl_SYSTEM_PROMPT =
    '你是「知乎的模仿与制作」课程项目的 AI 在线客服。项目由王慧琳（学号 24001010731）完成，' +
    '前端使用原生 HTML、CSS、JavaScript，后端使用 Node.js + Express，数据库为 MySQL。' +
    '已实现页面：首页、数据库连接测试、科技新闻列表、图文列表、AI 在线客服。' +
    '接口统一以 /api 开头，响应格式为 { code, msg, data }，code 为 0 表示成功。' +
    '请用简洁、友好的中文回答，介绍项目相关问题时尽量具体。';

  var Wanghl_messagesEl = document.getElementById('Wanghl_chatMessages');
  var Wanghl_formEl = document.getElementById('Wanghl_chatForm');
  var Wanghl_inputEl = document.getElementById('Wanghl_chatInput');
  var Wanghl_sendBtn = document.getElementById('Wanghl_chatSend');
  var Wanghl_clearBtn = document.getElementById('Wanghl_chatClear');
  var Wanghl_newBtn = document.getElementById('Wanghl_newSession');
  var Wanghl_sessionListEl = document.getElementById('Wanghl_sessionList');
  var Wanghl_turnsEl = document.getElementById('Wanghl_chatTurns');
  var Wanghl_usagePromptEl = document.getElementById('Wanghl_usagePrompt');
  var Wanghl_usageCompletionEl = document.getElementById('Wanghl_usageCompletion');

  var Wanghl_sessions = [];
  var Wanghl_currentId = '';
  var Wanghl_streaming = false;
  var Wanghl_abortController = null;
  var Wanghl_streamState = null;

  /* ---------------- 本地会话存储 ---------------- */
  function Wanghl_uid() {
    return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function Wanghl_newSession() {
    return {
      id: Wanghl_uid(),
      title: '新对话',
      messages: [],
      usage: { prompt: 0, completion: 0 },
      updatedAt: Date.now()
    };
  }

  function Wanghl_loadSessions() {
    var Wanghl_data = null;
    try {
      Wanghl_data = JSON.parse(localStorage.getItem(Wanghl_STORAGE_KEY) || 'null');
    } catch (Wanghl_err) {
      console.warn('[Wanghl] 读取本地会话失败：', Wanghl_err);
    }

    if (!Array.isArray(Wanghl_data) || Wanghl_data.length === 0) {
      Wanghl_data = [Wanghl_newSession()];
    }

    Wanghl_data.forEach(function (Wanghl_item) {
      if (!Array.isArray(Wanghl_item.messages)) Wanghl_item.messages = [];
      if (!Wanghl_item.usage) Wanghl_item.usage = { prompt: 0, completion: 0 };
      if (!Wanghl_item.title) Wanghl_item.title = '新对话';
    });

    Wanghl_sessions = Wanghl_data;

    var Wanghl_savedId = localStorage.getItem(Wanghl_CURRENT_KEY);
    Wanghl_currentId = Wanghl_sessions.some(function (Wanghl_item) {
      return Wanghl_item.id === Wanghl_savedId;
    })
      ? Wanghl_savedId
      : Wanghl_sessions[0].id;
  }

  function Wanghl_saveSessions() {
    try {
      localStorage.setItem(Wanghl_STORAGE_KEY, JSON.stringify(Wanghl_sessions));
      localStorage.setItem(Wanghl_CURRENT_KEY, Wanghl_currentId);
    } catch (Wanghl_err) {
      console.warn('[Wanghl] 保存本地会话失败：', Wanghl_err);
    }
  }

  function Wanghl_current() {
    return Wanghl_sessions.find(function (Wanghl_item) {
      return Wanghl_item.id === Wanghl_currentId;
    }) || Wanghl_sessions[0];
  }

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

  // 简易 Markdown：代码块、标题、列表、加粗、行内代码、链接
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

  function Wanghl_formatTime(Wanghl_ts) {
    var Wanghl_date = new Date(Wanghl_ts);
    var Wanghl_pad = function (Wanghl_n) {
      return Wanghl_n < 10 ? '0' + Wanghl_n : String(Wanghl_n);
    };
    return (
      Wanghl_pad(Wanghl_date.getMonth() + 1) +
      '-' +
      Wanghl_pad(Wanghl_date.getDate()) +
      ' ' +
      Wanghl_pad(Wanghl_date.getHours()) +
      ':' +
      Wanghl_pad(Wanghl_date.getMinutes())
    );
  }

  function Wanghl_scrollBottom() {
    Wanghl_messagesEl.scrollTop = Wanghl_messagesEl.scrollHeight;
  }

  function Wanghl_copyText(Wanghl_text, Wanghl_btn) {
    var Wanghl_done = function () {
      Wanghl_btn.textContent = '已复制';
      setTimeout(function () {
        Wanghl_btn.textContent = '复制';
      }, 1400);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(Wanghl_text).then(Wanghl_done).catch(function () {
        Wanghl_fallbackCopy(Wanghl_text, Wanghl_done);
      });
    } else {
      Wanghl_fallbackCopy(Wanghl_text, Wanghl_done);
    }
  }

  function Wanghl_fallbackCopy(Wanghl_text, Wanghl_done) {
    var Wanghl_area = document.createElement('textarea');
    Wanghl_area.value = Wanghl_text;
    Wanghl_area.style.position = 'fixed';
    Wanghl_area.style.opacity = '0';
    document.body.appendChild(Wanghl_area);
    Wanghl_area.select();
    try {
      document.execCommand('copy');
      Wanghl_done();
    } catch (Wanghl_err) {
      console.error('[Wanghl] 复制失败：', Wanghl_err);
    }
    document.body.removeChild(Wanghl_area);
  }

  /* ---------------- 消息渲染 ---------------- */
  function Wanghl_createMessage(Wanghl_role, Wanghl_text, Wanghl_opts) {
    var Wanghl_optsSafe = Wanghl_opts || {};
    var Wanghl_wrap = document.createElement('div');
    Wanghl_wrap.className = 'Wanghl_msg Wanghl_msg--' + (Wanghl_role === 'user' ? 'user' : 'assistant');

    var Wanghl_avatar = document.createElement('span');
    Wanghl_avatar.className = 'Wanghl_msg-avatar';
    Wanghl_avatar.textContent = Wanghl_role === 'user' ? '我' : 'AI';

    var Wanghl_body = document.createElement('div');
    Wanghl_body.className = 'Wanghl_msg-body';

    var Wanghl_bubble = document.createElement('div');
    Wanghl_bubble.className =
      'Wanghl_msg-bubble' + (Wanghl_optsSafe.error ? ' Wanghl_msg-bubble--error' : '');

    if (Wanghl_role === 'user') {
      Wanghl_bubble.innerHTML = Wanghl_escapeHtml(Wanghl_text).replace(/\n/g, '<br>');
    } else if (Wanghl_optsSafe.empty) {
      Wanghl_bubble.innerHTML = '';
    } else {
      Wanghl_bubble.innerHTML = Wanghl_markdown(Wanghl_text);
    }
    Wanghl_bubble.dataset.raw = Wanghl_text || '';

    Wanghl_body.appendChild(Wanghl_bubble);
    Wanghl_wrap.appendChild(Wanghl_avatar);
    Wanghl_wrap.appendChild(Wanghl_body);

    if (Wanghl_role === 'assistant' && Wanghl_optsSafe.actions) {
      var Wanghl_actions = document.createElement('div');
      Wanghl_actions.className = 'Wanghl_msg-actions';

      var Wanghl_copyBtn = document.createElement('button');
      Wanghl_copyBtn.type = 'button';
      Wanghl_copyBtn.className = 'Wanghl_msg-action';
      Wanghl_copyBtn.textContent = '复制';
      Wanghl_copyBtn.addEventListener('click', function () {
        Wanghl_copyText(Wanghl_bubble.dataset.raw || '', Wanghl_copyBtn);
      });
      Wanghl_actions.appendChild(Wanghl_copyBtn);

      if (Wanghl_optsSafe.canRegenerate) {
        var Wanghl_regenBtn = document.createElement('button');
        Wanghl_regenBtn.type = 'button';
        Wanghl_regenBtn.className = 'Wanghl_msg-action';
        Wanghl_regenBtn.textContent = '重新生成';
        Wanghl_regenBtn.addEventListener('click', Wanghl_regenerate);
        Wanghl_actions.appendChild(Wanghl_regenBtn);
      }

      Wanghl_body.appendChild(Wanghl_actions);
    }

    return { wrap: Wanghl_wrap, body: Wanghl_body, bubble: Wanghl_bubble };
  }

  function Wanghl_renderWelcome() {
    var Wanghl_welcome = Wanghl_createMessage(
      'assistant',
      '你好，我是本项目的 AI 在线客服，可以介绍页面功能、接口设计、数据库结构，也能帮你梳理答辩思路。你想先了解哪一部分？'
    );
    Wanghl_messagesEl.appendChild(Wanghl_welcome.wrap);

    var Wanghl_suggests = document.createElement('div');
    Wanghl_suggests.className = 'Wanghl_chat-suggests';

    [
      '这个项目用到了哪些技术？',
      '图文列表的数据表是怎么设计的？',
      '流式输出是怎么实现的？'
    ].forEach(function (Wanghl_text) {
      var Wanghl_btn = document.createElement('button');
      Wanghl_btn.type = 'button';
      Wanghl_btn.className = 'Wanghl_suggest';
      Wanghl_btn.textContent = Wanghl_text;
      Wanghl_suggests.appendChild(Wanghl_btn);
    });

    Wanghl_messagesEl.appendChild(Wanghl_suggests);
  }

  function Wanghl_renderMessages() {
    var Wanghl_session = Wanghl_current();
    Wanghl_messagesEl.innerHTML = '';

    if (Wanghl_session.messages.length === 0) {
      Wanghl_renderWelcome();
    } else {
      Wanghl_session.messages.forEach(function (Wanghl_msg, Wanghl_index) {
        var Wanghl_isLast = Wanghl_index === Wanghl_session.messages.length - 1;
        Wanghl_messagesEl.appendChild(
          Wanghl_createMessage(Wanghl_msg.role, Wanghl_msg.content, {
            actions: Wanghl_msg.role === 'assistant',
            canRegenerate: Wanghl_isLast && Wanghl_msg.role === 'assistant'
          }).wrap
        );
      });
    }

    Wanghl_scrollBottom();
    Wanghl_updateMeta();
  }

  function Wanghl_renderSessionList() {
    Wanghl_sessionListEl.innerHTML = '';

    Wanghl_sessions.forEach(function (Wanghl_session) {
      var Wanghl_li = document.createElement('li');
      Wanghl_li.className =
        'Wanghl_session-item' + (Wanghl_session.id === Wanghl_currentId ? ' is-active' : '');
      Wanghl_li.dataset.id = Wanghl_session.id;

      var Wanghl_main = document.createElement('div');
      Wanghl_main.className = 'Wanghl_session-main';

      var Wanghl_title = document.createElement('span');
      Wanghl_title.className = 'Wanghl_session-title';
      Wanghl_title.textContent = Wanghl_session.title;

      var Wanghl_time = document.createElement('span');
      Wanghl_time.className = 'Wanghl_session-time';
      Wanghl_time.textContent = Wanghl_formatTime(Wanghl_session.updatedAt);

      Wanghl_main.appendChild(Wanghl_title);
      Wanghl_main.appendChild(Wanghl_time);

      var Wanghl_del = document.createElement('button');
      Wanghl_del.type = 'button';
      Wanghl_del.className = 'Wanghl_session-del';
      Wanghl_del.title = '删除会话';
      Wanghl_del.textContent = '×';

      Wanghl_li.appendChild(Wanghl_main);
      Wanghl_li.appendChild(Wanghl_del);
      Wanghl_sessionListEl.appendChild(Wanghl_li);
    });
  }

  function Wanghl_updateMeta() {
    var Wanghl_session = Wanghl_current();
    var Wanghl_turns = Wanghl_session.messages.filter(function (Wanghl_msg) {
      return Wanghl_msg.role === 'user';
    }).length;

    if (Wanghl_turnsEl) Wanghl_turnsEl.textContent = String(Wanghl_turns);
    if (Wanghl_usagePromptEl) {
      Wanghl_usagePromptEl.textContent = String(Wanghl_session.usage.prompt || 0);
    }
    if (Wanghl_usageCompletionEl) {
      Wanghl_usageCompletionEl.textContent = String(Wanghl_session.usage.completion || 0);
    }
  }

  /* ---------------- 会话操作 ---------------- */
  function Wanghl_switchSession(Wanghl_id) {
    if (Wanghl_streaming || Wanghl_id === Wanghl_currentId) return;
    Wanghl_currentId = Wanghl_id;
    Wanghl_saveSessions();
    Wanghl_renderSessionList();
    Wanghl_renderMessages();
    Wanghl_inputEl.focus();
  }

  function Wanghl_addSession() {
    if (Wanghl_streaming) return;
    var Wanghl_session = Wanghl_newSession();
    Wanghl_sessions.unshift(Wanghl_session);
    Wanghl_currentId = Wanghl_session.id;
    Wanghl_saveSessions();
    Wanghl_renderSessionList();
    Wanghl_renderMessages();
    Wanghl_inputEl.focus();
  }

  function Wanghl_deleteSession(Wanghl_id) {
    if (Wanghl_streaming) return;

    var Wanghl_index = Wanghl_sessions.findIndex(function (Wanghl_session) {
      return Wanghl_session.id === Wanghl_id;
    });
    if (Wanghl_index < 0) return;

    Wanghl_sessions.splice(Wanghl_index, 1);

    if (Wanghl_sessions.length === 0) {
      Wanghl_sessions.push(Wanghl_newSession());
    }
    if (!Wanghl_sessions.some(function (Wanghl_session) {
      return Wanghl_session.id === Wanghl_currentId;
    })) {
      Wanghl_currentId = Wanghl_sessions[0].id;
    }

    Wanghl_saveSessions();
    Wanghl_renderSessionList();
    Wanghl_renderMessages();
  }

  function Wanghl_clearCurrent() {
    if (Wanghl_streaming) return;
    var Wanghl_session = Wanghl_current();
    Wanghl_session.messages = [];
    Wanghl_session.usage = { prompt: 0, completion: 0 };
    Wanghl_session.updatedAt = Date.now();
    Wanghl_saveSessions();
    Wanghl_renderSessionList();
    Wanghl_renderMessages();
    console.log('[Wanghl] 当前会话已清空');
  }

  /* ---------------- 输入框 ---------------- */
  function Wanghl_resizeInput() {
    Wanghl_inputEl.style.height = 'auto';
    Wanghl_inputEl.style.height = Math.min(Wanghl_inputEl.scrollHeight, 132) + 'px';
  }

  function Wanghl_setStreaming(Wanghl_flag) {
    Wanghl_streaming = Wanghl_flag;
    Wanghl_sendBtn.classList.toggle('is-stop', Wanghl_flag);
    Wanghl_sendBtn.textContent = Wanghl_flag ? '停止' : '发送';
    Wanghl_clearBtn.disabled = Wanghl_flag;
    Wanghl_newBtn.disabled = Wanghl_flag;
  }

  function Wanghl_appendTyping() {
    var Wanghl_node = Wanghl_createMessage('assistant', '', { empty: true });
    var Wanghl_typing = document.createElement('div');
    Wanghl_typing.className = 'Wanghl_typing';
    Wanghl_typing.innerHTML = '<i></i><i></i><i></i>';
    Wanghl_node.bubble.appendChild(Wanghl_typing);
    Wanghl_messagesEl.appendChild(Wanghl_node.wrap);
    Wanghl_scrollBottom();
    return Wanghl_node;
  }

  function Wanghl_scheduleStreamRender() {
    if (!Wanghl_streamState || Wanghl_streamState.raf) return;
    Wanghl_streamState.raf = window.requestAnimationFrame(function () {
      if (!Wanghl_streamState) return;
      Wanghl_streamState.raf = null;
      Wanghl_streamState.bubble.innerHTML =
        Wanghl_markdown(Wanghl_streamState.text) + '<span class="Wanghl_cursor"></span>';
      Wanghl_scrollBottom();
    });
  }

  /* ---------------- 发送与流式接收 ---------------- */
  function Wanghl_buildHistory() {
    var Wanghl_session = Wanghl_current();
    return [{ role: 'system', content: Wanghl_SYSTEM_PROMPT }].concat(
      Wanghl_session.messages.slice(-19)
    );
  }

  function Wanghl_runStream() {
    var Wanghl_session = Wanghl_current();
    var Wanghl_payload = { messages: Wanghl_buildHistory() };
    var Wanghl_typingNode = Wanghl_appendTyping();

    Wanghl_streamState = { bubble: Wanghl_typingNode.bubble, text: '', raf: null };
    Wanghl_abortController = new AbortController();
    Wanghl_setStreaming(true);

    console.log('[Wanghl] 发送给后端的数据：', Wanghl_payload);

    fetch(Wanghl_apiUrl('/api/chat/stream'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Wanghl_payload),
      signal: Wanghl_abortController.signal
    })
      .then(function (Wanghl_res) {
        if (!Wanghl_res.ok || !Wanghl_res.body) {
          throw new Error('后端返回 HTTP ' + Wanghl_res.status);
        }

        var Wanghl_reader = Wanghl_res.body.getReader();
        var Wanghl_decoder = new TextDecoder('utf-8');
        var Wanghl_buffer = '';
        var Wanghl_meta = null;

        function Wanghl_handleChunk(Wanghl_text) {
          Wanghl_buffer += Wanghl_text;
          var Wanghl_index = Wanghl_buffer.indexOf('\n\n');

          while (Wanghl_index >= 0) {
            var Wanghl_raw = Wanghl_buffer.slice(0, Wanghl_index).trim();
            Wanghl_buffer = Wanghl_buffer.slice(Wanghl_index + 2);

            if (Wanghl_raw.indexOf('data:') === 0) {
              var Wanghl_dataText = Wanghl_raw.slice(5).trim();
              if (Wanghl_dataText && Wanghl_dataText !== '[DONE]') {
                var Wanghl_event = JSON.parse(Wanghl_dataText);
                if (Wanghl_event.error) {
                  throw new Error(Wanghl_event.error);
                }
                if (Wanghl_event.delta) {
                  Wanghl_streamState.text += Wanghl_event.delta;
                  Wanghl_scheduleStreamRender();
                }
                if (Wanghl_event.done) {
                  Wanghl_meta = Wanghl_event;
                }
              }
            }

            Wanghl_index = Wanghl_buffer.indexOf('\n\n');
          }
        }

        function Wanghl_pump() {
          return Wanghl_reader.read().then(function (Wanghl_read) {
            if (Wanghl_read.done) return;
            Wanghl_handleChunk(Wanghl_decoder.decode(Wanghl_read.value, { stream: true }));
            return Wanghl_pump();
          });
        }

        return Wanghl_pump().then(function () {
          return Wanghl_meta;
        });
      })
      .then(function (Wanghl_meta) {
        var Wanghl_reply = Wanghl_streamState.text;

        if (!Wanghl_reply) {
          throw new Error('未收到有效回复');
        }

        if (Wanghl_meta && Wanghl_meta.usage) {
          Wanghl_session.usage.prompt += Wanghl_meta.usage.prompt_tokens || 0;
          Wanghl_session.usage.completion += Wanghl_meta.usage.completion_tokens || 0;
        }

        Wanghl_finishMessage(Wanghl_reply, Wanghl_meta);

        console.log('[Wanghl] 从后端接收到的完整回复：', Wanghl_reply);
        if (Wanghl_meta) {
          console.log('[Wanghl] 模型与用量：', Wanghl_meta);
        }
      })
      .catch(function (Wanghl_err) {
        var Wanghl_partial = Wanghl_streamState ? Wanghl_streamState.text : '';

        if (Wanghl_err.name === 'AbortError') {
          console.log('[Wanghl] 用户已停止生成');
          if (Wanghl_partial) {
            Wanghl_finishMessage(Wanghl_partial, null, true);
          } else {
            Wanghl_removeTyping();
          }
          return;
        }

        console.error('[Wanghl] 流式请求失败：', Wanghl_err);
        if (Wanghl_partial) {
          Wanghl_finishMessage(Wanghl_partial, null, true);
        } else {
          Wanghl_removeTyping();
          Wanghl_messagesEl.appendChild(
            Wanghl_createMessage(
              'assistant',
              '抱歉，本次回复失败：' + Wanghl_err.message,
              { error: true }
            ).wrap
          );
          Wanghl_scrollBottom();
        }
      })
      .finally(function () {
        Wanghl_streamState = null;
        Wanghl_abortController = null;
        Wanghl_setStreaming(false);
        Wanghl_inputEl.focus();
      });
  }

  function Wanghl_removeTyping() {
    if (Wanghl_streamState && Wanghl_streamState.bubble) {
      var Wanghl_wrap = Wanghl_streamState.bubble.closest('.Wanghl_msg');
      if (Wanghl_wrap && Wanghl_wrap.parentNode) {
        Wanghl_wrap.parentNode.removeChild(Wanghl_wrap);
      }
    }
  }

  function Wanghl_finishMessage(Wanghl_text, Wanghl_meta, Wanghl_stopped) {
    var Wanghl_session = Wanghl_current();

    if (Wanghl_streamState && Wanghl_streamState.bubble) {
      Wanghl_streamState.bubble.innerHTML = Wanghl_markdown(Wanghl_text);
      Wanghl_streamState.bubble.dataset.raw = Wanghl_text;

      var Wanghl_wrap = Wanghl_streamState.bubble.closest('.Wanghl_msg');
      var Wanghl_body = Wanghl_streamState.bubble.parentNode;

      var Wanghl_actions = document.createElement('div');
      Wanghl_actions.className = 'Wanghl_msg-actions';

      var Wanghl_copyBtn = document.createElement('button');
      Wanghl_copyBtn.type = 'button';
      Wanghl_copyBtn.className = 'Wanghl_msg-action';
      Wanghl_copyBtn.textContent = '复制';
      Wanghl_copyBtn.addEventListener('click', function () {
        Wanghl_copyText(Wanghl_text, Wanghl_copyBtn);
      });
      Wanghl_actions.appendChild(Wanghl_copyBtn);

      var Wanghl_regenBtn = document.createElement('button');
      Wanghl_regenBtn.type = 'button';
      Wanghl_regenBtn.className = 'Wanghl_msg-action';
      Wanghl_regenBtn.textContent = '重新生成';
      Wanghl_regenBtn.addEventListener('click', Wanghl_regenerate);
      Wanghl_actions.appendChild(Wanghl_regenBtn);

      Wanghl_body.appendChild(Wanghl_actions);

      if (Wanghl_meta && Wanghl_meta.usage) {
        var Wanghl_metaEl = document.createElement('span');
        Wanghl_metaEl.className = 'Wanghl_msg-meta';
        Wanghl_metaEl.textContent =
          (Wanghl_meta.model || '') +
          ' · 输入 ' + (Wanghl_meta.usage.prompt_tokens || 0) +
          ' / 输出 ' + (Wanghl_meta.usage.completion_tokens || 0) + ' tokens';
        Wanghl_body.appendChild(Wanghl_metaEl);
      }

      if (Wanghl_stopped) {
        var Wanghl_stopEl = document.createElement('span');
        Wanghl_stopEl.className = 'Wanghl_msg-meta';
        Wanghl_stopEl.textContent = '已停止生成';
        Wanghl_body.appendChild(Wanghl_stopEl);
      }

      if (Wanghl_wrap) {
        Wanghl_wrap.classList.remove('Wanghl_msg--streaming');
      }
    }

    Wanghl_session.messages.push({ role: 'assistant', content: Wanghl_text });
    Wanghl_session.updatedAt = Date.now();
    Wanghl_saveSessions();
    Wanghl_renderSessionList();
    Wanghl_updateMeta();
    Wanghl_scrollBottom();
  }

  function Wanghl_send(Wanghl_text) {
    var Wanghl_content = (Wanghl_text || '').trim();
    if (!Wanghl_content || Wanghl_streaming) return;

    var Wanghl_session = Wanghl_current();
    Wanghl_session.messages.push({ role: 'user', content: Wanghl_content });
    if (Wanghl_session.title === '新对话') {
      Wanghl_session.title = Wanghl_content.slice(0, 16);
    }
    Wanghl_session.updatedAt = Date.now();

    Wanghl_saveSessions();
    Wanghl_renderSessionList();
    Wanghl_renderMessages();

    Wanghl_inputEl.value = '';
    Wanghl_resizeInput();

    Wanghl_runStream();
  }

  function Wanghl_regenerate() {
    if (Wanghl_streaming) return;

    var Wanghl_session = Wanghl_current();
    var Wanghl_lastUser = -1;

    for (var Wanghl_i = Wanghl_session.messages.length - 1; Wanghl_i >= 0; Wanghl_i--) {
      if (Wanghl_session.messages[Wanghl_i].role === 'user') {
        Wanghl_lastUser = Wanghl_i;
        break;
      }
    }

    if (Wanghl_lastUser < 0) return;

    Wanghl_session.messages = Wanghl_session.messages.slice(0, Wanghl_lastUser + 1);
    Wanghl_saveSessions();
    Wanghl_renderMessages();
    Wanghl_runStream();
  }

  /* ---------------- 事件绑定 ---------------- */
  Wanghl_formEl.addEventListener('submit', function (Wanghl_event) {
    Wanghl_event.preventDefault();
    if (Wanghl_streaming) {
      if (Wanghl_abortController) Wanghl_abortController.abort();
      return;
    }
    Wanghl_send(Wanghl_inputEl.value);
  });

  Wanghl_inputEl.addEventListener('input', Wanghl_resizeInput);

  Wanghl_inputEl.addEventListener('keydown', function (Wanghl_event) {
    if (Wanghl_event.key === 'Enter' && !Wanghl_event.shiftKey) {
      Wanghl_event.preventDefault();
      if (!Wanghl_streaming) Wanghl_send(Wanghl_inputEl.value);
    }
  });

  Wanghl_messagesEl.addEventListener('click', function (Wanghl_event) {
    var Wanghl_btn = Wanghl_event.target.closest('.Wanghl_suggest');
    if (Wanghl_btn) Wanghl_send(Wanghl_btn.textContent);
  });

  Wanghl_sessionListEl.addEventListener('click', function (Wanghl_event) {
    var Wanghl_item = Wanghl_event.target.closest('.Wanghl_session-item');
    if (!Wanghl_item) return;

    if (Wanghl_event.target.closest('.Wanghl_session-del')) {
      Wanghl_deleteSession(Wanghl_item.dataset.id);
      return;
    }

    Wanghl_switchSession(Wanghl_item.dataset.id);
  });

  Wanghl_newBtn.addEventListener('click', Wanghl_addSession);
  Wanghl_clearBtn.addEventListener('click', Wanghl_clearCurrent);

  /* ---------------- 模型配置 ---------------- */
  (function Wanghl_loadChatInfo() {
    var Wanghl_modelEl = document.getElementById('Wanghl_chatModel');
    var Wanghl_baseUrlEl = document.getElementById('Wanghl_chatBaseUrl');
    var Wanghl_keyEl = document.getElementById('Wanghl_chatKeyState');
    var Wanghl_infoLink = document.getElementById('Wanghl_chatInfoLink');
    var Wanghl_modelText = document.getElementById('Wanghl_chatModelText');
    var Wanghl_statusDot = document.getElementById('Wanghl_chatStatusDot');

    if (Wanghl_infoLink) {
      Wanghl_infoLink.href = Wanghl_apiUrl('/api/chat/info');
    }

    fetch(Wanghl_apiUrl('/api/chat/info'))
      .then(function (Wanghl_res) {
        return Wanghl_res.json();
      })
      .then(function (Wanghl_data) {
        console.log('[Wanghl] /api/chat/info 响应：', Wanghl_data);
        if (!Wanghl_data || Wanghl_data.code !== 0 || !Wanghl_data.data) {
          throw new Error((Wanghl_data && Wanghl_data.msg) || '配置接口异常');
        }

        var Wanghl_info = Wanghl_data.data;
        if (Wanghl_modelEl) Wanghl_modelEl.textContent = Wanghl_info.model;
        if (Wanghl_baseUrlEl) Wanghl_baseUrlEl.textContent = Wanghl_info.baseUrl;
        if (Wanghl_modelText) Wanghl_modelText.textContent = Wanghl_info.model + ' · 流式输出';

        if (Wanghl_keyEl) {
          Wanghl_keyEl.textContent = Wanghl_info.configured ? '已配置' : '未配置';
          Wanghl_keyEl.classList.toggle('is-ok', Boolean(Wanghl_info.configured));
          Wanghl_keyEl.classList.toggle('is-bad', !Wanghl_info.configured);
        }

        if (Wanghl_statusDot) {
          Wanghl_statusDot.classList.toggle('Wanghl_status-dot--on', Boolean(Wanghl_info.configured));
          Wanghl_statusDot.classList.toggle('Wanghl_status-dot--bad', !Wanghl_info.configured);
        }
      })
      .catch(function (Wanghl_err) {
        console.error('[Wanghl] /api/chat/info 请求失败：', Wanghl_err);
        if (Wanghl_keyEl) {
          Wanghl_keyEl.textContent = '后端未连接';
          Wanghl_keyEl.classList.add('is-bad');
        }
        if (Wanghl_modelText) Wanghl_modelText.textContent = '后端未连接';
        if (Wanghl_statusDot) Wanghl_statusDot.classList.add('Wanghl_status-dot--bad');
      });
  })();

  /* ---------------- 初始化 ---------------- */
  Wanghl_loadSessions();
  Wanghl_renderSessionList();
  Wanghl_renderMessages();
  Wanghl_inputEl.focus();
})();
