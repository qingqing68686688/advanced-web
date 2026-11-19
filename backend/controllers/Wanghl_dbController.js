/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-19 | 大模型：TRAE DeepSeek-V4.1-Flash
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

// 常见连接错误的中文提示
function Wanghl_mapError(Wanghl_err) {
  const Wanghl_code = Wanghl_err && Wanghl_err.code;
  const Wanghl_map = {
    ER_ACCESS_DENIED_ERROR: '用户名或密码错误，数据库拒绝访问',
    ECONNREFUSED: '无法连接数据库服务，请确认 MySQL 已启动',
    ETIMEDOUT: '连接数据库超时，请检查主机与端口',
    PROTOCOL_CONNECTION_LOST: '数据库连接已断开，请重试',
    ER_HOST_IS_BLOCKED: '当前主机被 MySQL 拒绝访问',
    ENOTFOUND: '找不到数据库主机地址'
  };
  return Wanghl_map[Wanghl_code] || '数据库连接失败';
}

// GET /api/db/info 返回连接配置（不含密码）
function Wanghl_getInfo(req, res) {
  res.json({
    code: 0,
    msg: '获取数据库配置成功',
    data: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME || ''
    }
  });
}

// POST /api/db/test 使用传入的用户名、密码测试数据库连接
async function Wanghl_testConnection(req, res) {
  const Wanghl_body = req.body || {};
  const Wanghl_user = typeof Wanghl_body.user === 'string' ? Wanghl_body.user.trim() : '';
  const Wanghl_password = typeof Wanghl_body.password === 'string' ? Wanghl_body.password : '';

  if (!Wanghl_user) {
    return res.json({ code: 1, msg: '请输入数据库用户名', data: null });
  }
  if (Wanghl_user.length > 64 || Wanghl_password.length > 128) {
    return res.json({ code: 1, msg: '用户名或密码长度超出限制', data: null });
  }

  const Wanghl_host = process.env.DB_HOST || 'localhost';
  const Wanghl_port = Number(process.env.DB_PORT) || 3306;
  const Wanghl_database = process.env.DB_NAME || '';

  let Wanghl_connection = null;

  try {
    Wanghl_connection = await mysql.createConnection({
      host: Wanghl_host,
      port: Wanghl_port,
      user: Wanghl_user,
      password: Wanghl_password,
      connectTimeout: 5000
    });

    const [Wanghl_versionRows] = await Wanghl_connection.query('SELECT VERSION() AS version');
    const [Wanghl_dbRows] = await Wanghl_connection.query('SHOW DATABASES');

    const Wanghl_databases = Wanghl_dbRows.map((Wanghl_row) => Wanghl_row.Database);
    const Wanghl_exists = Wanghl_database ? Wanghl_databases.includes(Wanghl_database) : false;

    console.log('[Wanghl] 数据库连接成功：用户 ' + Wanghl_user + '，主机 ' + Wanghl_host + ':' + Wanghl_port);

    res.json({
      code: 0,
      msg: Wanghl_database && !Wanghl_exists
        ? '数据库连接成功，但目标数据库 ' + Wanghl_database + ' 尚未创建'
        : '数据库连接成功',
      data: {
        host: Wanghl_host,
        port: Wanghl_port,
        user: Wanghl_user,
        version: Wanghl_versionRows[0].version,
        database: Wanghl_database,
        databaseExists: Wanghl_exists,
        databaseCount: Wanghl_databases.length,
        connectTime: new Date().toISOString()
      }
    });
  } catch (Wanghl_err) {
    console.error('[Wanghl] 数据库连接失败：', Wanghl_err.code, Wanghl_err.message);
    res.json({
      code: 1,
      msg: Wanghl_mapError(Wanghl_err),
      data: {
        errorCode: Wanghl_err.code || '',
        detail: Wanghl_err.message || ''
      }
    });
  } finally {
    if (Wanghl_connection) {
      try {
        await Wanghl_connection.end();
      } catch (Wanghl_closeErr) {
        console.error('[Wanghl] 关闭数据库连接失败：', Wanghl_closeErr.message);
      }
    }
  }
}

module.exports = {
  Wanghl_getInfo,
  Wanghl_testConnection
};
