/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE DeepSeek-V4.1-Flash
 */
(function () {
  'use strict';

  /* ---------------- 页面导航统计 ---------------- */
  const Wanghl_pageCount = document.getElementById('Wanghl_pageCount');
  const Wanghl_navCards = document.querySelectorAll('#Wanghl_navGrid .Wanghl_nav-card');

  if (Wanghl_pageCount && Wanghl_navCards.length) {
    Wanghl_pageCount.textContent = '已完成 ' + Wanghl_navCards.length + ' 个页面';
    console.log('[Wanghl] 当前已完成页面数量：' + Wanghl_navCards.length);
  }

  /* ---------------- 后端接口连通性检测 ---------------- */
  const Wanghl_apiDot = document.getElementById('Wanghl_apiDot');
  const Wanghl_apiText = document.getElementById('Wanghl_apiText');

  function Wanghl_setApiState(Wanghl_ok, Wanghl_text) {
    if (Wanghl_apiText) {
      Wanghl_apiText.textContent = Wanghl_text;
      Wanghl_apiText.classList.toggle('Wanghl_status--ok', Wanghl_ok);
      Wanghl_apiText.classList.toggle('Wanghl_status--bad', !Wanghl_ok);
    }
    if (Wanghl_apiDot) {
      Wanghl_apiDot.classList.toggle('Wanghl_status-dot--on', Wanghl_ok);
      Wanghl_apiDot.classList.toggle('Wanghl_status-dot--bad', !Wanghl_ok);
    }
  }

  fetch('/api/test')
    .then(function (Wanghl_res) {
      return Wanghl_res.json();
    })
    .then(function (Wanghl_data) {
      console.log('[Wanghl] /api/test 响应：', Wanghl_data);
      if (Wanghl_data && Wanghl_data.code === 0) {
        Wanghl_setApiState(true, '正常');
      } else {
        Wanghl_setApiState(false, '异常');
      }
    })
    .catch(function (Wanghl_err) {
      console.error('[Wanghl] /api/test 请求失败：', Wanghl_err);
      Wanghl_setApiState(false, '未连接');
    });
})();
