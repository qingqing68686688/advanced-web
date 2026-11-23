/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE DeepSeek-V4.1-Flash
 * 作用：统一接口地址。通过 file:// 直接双击打开页面时，自动指向本机后端 8731 端口
 */
(function () {
  'use strict';

  var Wanghl_isFile = window.location.protocol === 'file:';

  window.Wanghl_apiBase = Wanghl_isFile ? 'http://localhost:8731' : '';

  window.Wanghl_apiUrl = function (Wanghl_path) {
    return window.Wanghl_apiBase + Wanghl_path;
  };

  if (Wanghl_isFile) {
    console.warn(
      '[Wanghl] 当前通过 file:// 打开页面，接口已自动指向 ' +
        window.Wanghl_apiBase +
        '，建议改用 http://localhost:8731 访问'
    );
  }
})();
