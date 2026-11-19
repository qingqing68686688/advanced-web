/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE DeepSeek-V4.1-Flash
 */
(function () {
  'use strict';

  const Wanghl_form = document.getElementById('Wanghl_dbForm');
  const Wanghl_userInput = document.getElementById('Wanghl_dbUser');
  const Wanghl_pwdInput = document.getElementById('Wanghl_dbPassword');
  const Wanghl_submitBtn = document.getElementById('Wanghl_dbSubmit');
  const Wanghl_resetBtn = document.getElementById('Wanghl_dbReset');
  const Wanghl_toggleBtn = document.getElementById('Wanghl_togglePwd');
  const Wanghl_resultBox = document.getElementById('Wanghl_dbResult');

  const Wanghl_hostEl = document.getElementById('Wanghl_dbHost');
  const Wanghl_portEl = document.getElementById('Wanghl_dbPort');
  const Wanghl_nameEl = document.getElementById('Wanghl_dbName');
  const Wanghl_targetEl = document.getElementById('Wanghl_dbTarget');

  const Wanghl_icons = { loading: '…', success: '✓', error: '✕' };

  function Wanghl_renderResult(Wanghl_type, Wanghl_title, Wanghl_rows, Wanghl_detail) {
    Wanghl_resultBox.className = 'Wanghl_result Wanghl_result--' + Wanghl_type;
    Wanghl_resultBox.textContent = '';

    const Wanghl_head = document.createElement('div');
    Wanghl_head.className = 'Wanghl_result-head';

    const Wanghl_icon = document.createElement('span');
    Wanghl_icon.className = 'Wanghl_result-icon';
    Wanghl_icon.textContent = Wanghl_icons[Wanghl_type] || '·';

    const Wanghl_titleEl = document.createElement('span');
    Wanghl_titleEl.textContent = Wanghl_title;

    Wanghl_head.appendChild(Wanghl_icon);
    Wanghl_head.appendChild(Wanghl_titleEl);
    Wanghl_resultBox.appendChild(Wanghl_head);

    if (Wanghl_rows && Wanghl_rows.length) {
      const Wanghl_list = document.createElement('ul');
      Wanghl_list.className = 'Wanghl_result-list';

      Wanghl_rows.forEach(function (Wanghl_row) {
        const Wanghl_li = document.createElement('li');
        const Wanghl_label = document.createElement('span');
        const Wanghl_value = document.createElement('strong');
        Wanghl_label.textContent = Wanghl_row.label;
        Wanghl_value.textContent = Wanghl_row.value;
        Wanghl_li.appendChild(Wanghl_label);
        Wanghl_li.appendChild(Wanghl_value);
        Wanghl_list.appendChild(Wanghl_li);
      });

      Wanghl_resultBox.appendChild(Wanghl_list);
    }

    if (Wanghl_detail) {
      const Wanghl_detailEl = document.createElement('p');
      Wanghl_detailEl.className = 'Wanghl_result-detail';
      Wanghl_detailEl.textContent = '详细信息：' + Wanghl_detail;
      Wanghl_resultBox.appendChild(Wanghl_detailEl);
    }
  }

  function Wanghl_setLoading(Wanghl_loading) {
    Wanghl_submitBtn.disabled = Wanghl_loading;
    Wanghl_submitBtn.textContent = Wanghl_loading ? '连接中…' : '测试连接';
  }

  // 读取后端数据库配置（不含密码）
  fetch('/api/db/info')
    .then(function (Wanghl_res) {
      return Wanghl_res.json();
    })
    .then(function (Wanghl_data) {
      console.log('[Wanghl] /api/db/info 响应：', Wanghl_data);
      if (!Wanghl_data || Wanghl_data.code !== 0 || !Wanghl_data.data) {
        return;
      }
      const Wanghl_info = Wanghl_data.data;
      if (Wanghl_hostEl) Wanghl_hostEl.textContent = Wanghl_info.host;
      if (Wanghl_portEl) Wanghl_portEl.textContent = String(Wanghl_info.port);
      if (Wanghl_nameEl) Wanghl_nameEl.textContent = Wanghl_info.database || '未配置';
      if (Wanghl_targetEl) {
        Wanghl_targetEl.textContent = Wanghl_info.host + ':' + Wanghl_info.port;
      }
    })
    .catch(function (Wanghl_err) {
      console.error('[Wanghl] /api/db/info 请求失败：', Wanghl_err);
    });

  // 显示 / 隐藏密码
  if (Wanghl_toggleBtn) {
    Wanghl_toggleBtn.addEventListener('click', function () {
      const Wanghl_show = Wanghl_pwdInput.type === 'password';
      Wanghl_pwdInput.type = Wanghl_show ? 'text' : 'password';
      Wanghl_toggleBtn.textContent = Wanghl_show ? '隐藏' : '显示';
    });
  }

  // 重置
  if (Wanghl_resetBtn) {
    Wanghl_resetBtn.addEventListener('click', function () {
      if (Wanghl_pwdInput) Wanghl_pwdInput.type = 'password';
      if (Wanghl_toggleBtn) Wanghl_toggleBtn.textContent = '显示';
      Wanghl_resultBox.className = 'Wanghl_result';
      Wanghl_resultBox.textContent = '尚未测试，点击“测试连接”开始检测。';
    });
  }

  // 提交测试
  Wanghl_form.addEventListener('submit', function (Wanghl_event) {
    Wanghl_event.preventDefault();

    const Wanghl_user = Wanghl_userInput.value.trim();
    const Wanghl_password = Wanghl_pwdInput.value;

    if (!Wanghl_user) {
      Wanghl_renderResult('error', '请输入数据库用户名', null, '用户名为空，无法发起连接');
      console.error('[Wanghl] 数据库连接测试：用户名为空');
      Wanghl_userInput.focus();
      return;
    }

    Wanghl_setLoading(true);
    Wanghl_renderResult('loading', '正在连接数据库…', [
      { label: '用户名', value: Wanghl_user }
    ]);

    const Wanghl_controller = new AbortController();
    const Wanghl_timer = setTimeout(function () {
      Wanghl_controller.abort();
    }, 12000);

    fetch('/api/db/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: Wanghl_user, password: Wanghl_password }),
      signal: Wanghl_controller.signal
    })
      .then(function (Wanghl_res) {
        return Wanghl_res.json();
      })
      .then(function (Wanghl_data) {
        console.log('[Wanghl] /api/db/test 响应：', Wanghl_data);

        if (Wanghl_data && Wanghl_data.code === 0) {
          const Wanghl_info = Wanghl_data.data || {};
          Wanghl_renderResult('success', Wanghl_data.msg, [
            { label: '主机', value: (Wanghl_info.host || '-') + ':' + (Wanghl_info.port || '-') },
            { label: 'MySQL 版本', value: Wanghl_info.version || '-' },
            { label: '数据库数量', value: String(Wanghl_info.databaseCount || 0) + ' 个' },
            {
              label: '目标数据库',
              value: Wanghl_info.database
                ? Wanghl_info.database + (Wanghl_info.databaseExists ? '（已存在）' : '（未创建）')
                : '未配置'
            }
          ]);
        } else {
          const Wanghl_errInfo = (Wanghl_data && Wanghl_data.data) || {};
          Wanghl_renderResult(
            'error',
            (Wanghl_data && Wanghl_data.msg) || '数据库连接失败',
            Wanghl_errInfo.errorCode ? [{ label: '错误码', value: Wanghl_errInfo.errorCode }] : null,
            Wanghl_errInfo.detail || ''
          );
          console.error('[Wanghl] 数据库连接失败：', Wanghl_data);
        }
      })
      .catch(function (Wanghl_err) {
        const Wanghl_isAbort = Wanghl_err && Wanghl_err.name === 'AbortError';
        console.error('[Wanghl] /api/db/test 请求异常：', Wanghl_err);
        Wanghl_renderResult(
          'error',
          Wanghl_isAbort ? '请求超时' : '无法访问后端接口',
          null,
          Wanghl_isAbort
            ? '12 秒内未收到响应，请检查 MySQL 服务状态'
            : '请确认后端服务已在 8731 端口启动'
        );
      })
      .finally(function () {
        clearTimeout(Wanghl_timer);
        Wanghl_setLoading(false);
      });
  });
})();
