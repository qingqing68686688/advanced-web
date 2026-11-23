/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE DeepSeek-V4.1-Flash
 */
(function () {
  'use strict';

  /* ---------------- 页面导航统计 ---------------- */
  const Wanghl_pageCount = document.getElementById('Wanghl_pageCount');
  const Wanghl_navCards = document.querySelectorAll('#Wanghl_navGrid .Wanghl_nav-card');
  const Wanghl_statPages = document.getElementById('Wanghl_statPages');

  if (Wanghl_pageCount && Wanghl_navCards.length) {
    Wanghl_pageCount.textContent = '已完成 ' + Wanghl_navCards.length + ' 个页面';
    if (Wanghl_statPages) {
      Wanghl_statPages.textContent = String(Wanghl_navCards.length);
    }
    console.log('[Wanghl] 当前已完成页面数量：' + Wanghl_navCards.length);
  }

  /* ---------------- 接口速览链接兜底 ---------------- */
  if (window.Wanghl_apiBase) {
    const Wanghl_apiItems = document.querySelectorAll('.Wanghl_api-item');
    Wanghl_apiItems.forEach(function (Wanghl_link) {
      const Wanghl_href = Wanghl_link.getAttribute('href');
      if (Wanghl_href && Wanghl_href.charAt(0) === '/') {
        Wanghl_link.href = window.Wanghl_apiBase + Wanghl_href;
      }
    });
  }

  /* ---------------- 状态标记 ---------------- */
  function Wanghl_setState(Wanghl_dotEl, Wanghl_textEl, Wanghl_ok, Wanghl_text) {
    if (Wanghl_textEl) {
      Wanghl_textEl.textContent = Wanghl_text;
      Wanghl_textEl.classList.toggle('Wanghl_status--ok', Wanghl_ok);
      Wanghl_textEl.classList.toggle('Wanghl_status--bad', !Wanghl_ok);
    }
    if (Wanghl_dotEl) {
      Wanghl_dotEl.classList.toggle('Wanghl_status-dot--on', Wanghl_ok);
      Wanghl_dotEl.classList.toggle('Wanghl_status-dot--bad', !Wanghl_ok);
    }
  }

  /* ---------------- 后端接口连通性检测 ---------------- */
  const Wanghl_apiDot = document.getElementById('Wanghl_apiDot');
  const Wanghl_apiText = document.getElementById('Wanghl_apiText');

  fetch(Wanghl_apiUrl('/api/test'))
    .then(function (Wanghl_res) {
      return Wanghl_res.json();
    })
    .then(function (Wanghl_data) {
      console.log('[Wanghl] /api/test 响应：', Wanghl_data);
      if (Wanghl_data && Wanghl_data.code === 0) {
        Wanghl_setState(Wanghl_apiDot, Wanghl_apiText, true, '正常');
      } else {
        Wanghl_setState(Wanghl_apiDot, Wanghl_apiText, false, '异常');
      }
    })
    .catch(function (Wanghl_err) {
      console.error('[Wanghl] /api/test 请求失败：', Wanghl_err);
      Wanghl_setState(Wanghl_apiDot, Wanghl_apiText, false, '未连接');
    });

  /* ---------------- 数据库状态与记录总数 ---------------- */
  const Wanghl_dbDot = document.getElementById('Wanghl_dbDot');
  const Wanghl_dbText = document.getElementById('Wanghl_dbText');
  const Wanghl_statRecords = document.getElementById('Wanghl_statRecords');

  Promise.all([
    fetch(Wanghl_apiUrl('/api/news?page=1&pageSize=1')).then(function (Wanghl_res) {
      return Wanghl_res.json();
    }),
    fetch(Wanghl_apiUrl('/api/gallery?page=1&pageSize=1')).then(function (Wanghl_res) {
      return Wanghl_res.json();
    })
  ])
    .then(function (Wanghl_results) {
      const Wanghl_news = Wanghl_results[0];
      const Wanghl_gallery = Wanghl_results[1];
      console.log('[Wanghl] /api/news 响应：', Wanghl_news);
      console.log('[Wanghl] /api/gallery 响应：', Wanghl_gallery);

      const Wanghl_ok =
        Wanghl_news && Wanghl_news.code === 0 &&
        Wanghl_gallery && Wanghl_gallery.code === 0;

      if (!Wanghl_ok) {
        Wanghl_setState(Wanghl_dbDot, Wanghl_dbText, false, '异常');
        if (Wanghl_statRecords) {
          Wanghl_statRecords.textContent = '—';
        }
        return;
      }

      const Wanghl_total =
        (Wanghl_news.data.total || 0) + (Wanghl_gallery.data.total || 0);

      Wanghl_setState(Wanghl_dbDot, Wanghl_dbText, true, 'Wanghl_zhihu 正常');
      if (Wanghl_statRecords) {
        Wanghl_statRecords.textContent = String(Wanghl_total);
      }
      console.log('[Wanghl] 数据库记录总数：' + Wanghl_total);
    })
    .catch(function (Wanghl_err) {
      console.error('[Wanghl] 数据库状态检测失败：', Wanghl_err);
      Wanghl_setState(Wanghl_dbDot, Wanghl_dbText, false, '未连接');
      if (Wanghl_statRecords) {
        Wanghl_statRecords.textContent = '—';
      }
    });
})();
