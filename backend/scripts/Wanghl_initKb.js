/*
 * 姓名：王慧琳 | 学号：24001010731 | 时间：2026-11-23 | 大模型：TRAE DeepSeek-V4.1-Flash
 * 作用：初始化知识库分块表 Wanghl_kb_chunks，并写入 2 个示例知识库文件（可重复执行）
 */
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Wanghl_retriever = require('../services/Wanghl_kbRetriever');

const Wanghl_dbName = process.env.DB_NAME || 'Wanghl_zhihu';

const Wanghl_createTableSql = `
CREATE TABLE IF NOT EXISTS Wanghl_kb_chunks (
  Wanghl_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分块ID',
  Wanghl_doc_name VARCHAR(255) NOT NULL COMMENT '文档名称',
  Wanghl_doc_ext VARCHAR(20) NOT NULL DEFAULT '' COMMENT '文件扩展名',
  Wanghl_doc_size INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小（字节）',
  Wanghl_chunk_index INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '分块序号，从0开始',
  Wanghl_content TEXT NOT NULL COMMENT '分块文本内容',
  Wanghl_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (Wanghl_id),
  KEY idx_Wanghl_kb_doc (Wanghl_doc_name),
  KEY idx_Wanghl_kb_doc_chunk (Wanghl_doc_name, Wanghl_chunk_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库分块表';
`;

// 知识库文件一：项目说明
const Wanghl_docOneName = '知乎的模仿与制作-项目说明.md';
const Wanghl_docOneExt = '.md';
const Wanghl_docOneText = [
  '知乎的模仿与制作项目说明',
  '本项目是高级网页设计课程的模仿类作业，参考知乎问答社区的信息架构与视觉风格，由王慧琳独立完成，学号 24001010731。项目定位是把课程中学到的原生前端、后端接口与数据库知识整合成一个可以演示、可以答辩的完整作品，而不是简单复制某一个页面。',
  '技术栈方面，前端只使用原生 HTML、CSS 与 JavaScript，不引入任何第三方框架、组件库或 CDN 资源，所有交互逻辑都手写实现。后端使用 Node.js 与 Express，按照 RESTful 加 MVC 的方式分层，依次是 routes 路由层、controllers 控制器层、models 数据访问层，公共能力放在 services 目录。数据库使用 MySQL，数据库名为 Wanghl_zhihu。',
  '页面结构目前包含六个页面。项目首页采用知乎信息流风格，左侧是推荐内容流，右侧是热榜与项目概览。数据库连接页可以输入 MySQL 用户名和密码测试连通性。科技新闻页展示数据库中的新闻列表，支持分类筛选、关键词搜索与分页。图文列表页以双列卡片展示图片与文字。AI 在线客服页采用三栏布局，左侧管理本地会话，中间进行多轮对话，右侧展示模型与用量信息。知识库页支持上传文档并基于知识库进行问答。',
  '接口规范统一以 /api 作为前缀，所有接口返回同一种 JSON 结构，包含 code、msg 与 data 三个字段。code 等于 0 表示成功，非 0 表示失败，msg 用于给出人类可读的提示，data 承载具体业务数据。这种统一格式让前端可以用同一套错误处理逻辑覆盖所有接口，也让接口文档更容易维护。',
  '数据库设计遵循命名规范，所有表名与字段名都以 Wanghl_ 开头。科技新闻表 Wanghl_tech_news 保存标题、摘要、正文、来源、作者、分类、标签、浏览量与发布时间。图文列表表 Wanghl_gallery_items 保存标题、描述、图片地址、分类、作者、地点、浏览量、点赞量与发布时间。知识库分块表 Wanghl_kb_chunks 保存文档名称、扩展名、文件大小、分块序号与分块文本。每张表在创建后都会插入不少于 8 条有真实业务含义的测试数据。',
  'AI 能力方面，项目接入七牛云提供的 OpenAI 兼容接口，模型为 qiniu/conatus-free。接口地址是 https://api.qnaigc.com/v1，密钥只保存在后端 .env 文件中，前端不会接触到密钥。后端在调用大模型前后都会把请求体与响应体打印到控制台，方便课程演示时观察数据流转。',
  '前端页面统一使用深色科技主题，主色为蓝青色。顶栏包含品牌标识、主导航与提问入口，当前页会高亮显示。首页、科技新闻、图文列表、数据库、AI 客服与知识库页面共享同一套导航和主题变量，保证视觉一致性。',
  '运行项目需要先安装后端依赖，进入 backend 目录执行 cnpm i，如果失败或超时再改用 npm i。然后在 backend/.env 中填写数据库用户名、密码、主机与库名，以及七牛云的接口密钥。最后执行 npm start 启动服务，服务固定监听 8731 端口，前端页面由 express.static 直接托管，浏览器访问 http://localhost:8731 即可。',
  '数据库初始化分为两步。第一步执行 scripts/Wanghl_initDatabase.js，创建科技新闻表与图文列表表并写入测试数据。第二步执行 scripts/Wanghl_initKb.js，创建知识库分块表并写入两个示例知识库文件。两个脚本都可以重复执行，重复执行时会先清理同名数据再写入，不会产生重复记录。',
  '答辩演示建议按以下顺序进行。先打开首页说明信息流与热榜的数据来源，再进入科技新闻页演示分类筛选与关键词搜索，接着打开图文列表页展示图片懒加载与骨架屏。之后进入 AI 客服页演示流式输出与重新生成，最后进入知识库页上传一个文档并现场提问，同时打开浏览器控制台和后端终端展示请求与响应数据。',
  '项目开发中遇到的两个典型问题值得记录。第一个问题是流式接口被提前中断，原因是请求对象的 close 事件在请求体读完后就会触发，后来改为监听响应对象的 close 事件才正确判断客户端是否断开。第二个问题是上传中文文件名出现乱码，原因是上传中间件按 latin1 解析文件名，在控制器层做一次 latin1 到 utf8 的转换后解决。'
].join('\n\n');

// 知识库文件二：AI 客服与知识库使用手册
const Wanghl_docTwoName = 'AI客服与知识库使用手册.txt';
const Wanghl_docTwoExt = '.txt';
const Wanghl_docTwoText = [
  'AI 在线客服与知识库使用手册',
  'AI 在线客服页面提供多轮对话能力。打开页面后，左侧会自动创建一个本地会话，你可以在输入框中输入问题并按 Enter 发送，按 Shift 加 Enter 换行。回复会以流式方式逐字出现，生成过程中发送按钮会变成停止按钮，点击可以中断生成，已经生成的内容会保留。',
  '会话历史保存在浏览器本地存储中，关闭页面后再次打开仍然存在。左侧会话列表支持新建、切换与删除会话，鼠标悬停在会话上会显示删除按钮。切换会话不会影响其他会话的内容。点击清空对话只会清空当前会话，不会删除其他历史会话。',
  '每条助手回复下方提供复制与重新生成两个操作。复制会把纯文本写入剪贴板，重新生成会丢弃最后一条助手回复，并基于最后一条用户提问重新请求大模型。回复支持简易 Markdown 渲染，包括代码块、标题、无序列表、有序列表、加粗、行内代码与链接。',
  '知识库页面用于构建专属自动客服。支持的文档格式包括 txt、md、pdf、doc、docx、ppt 与 pptx，单个文件大小上限为 15MB。上传后后端会解析文件文本，再按句子边界切分为长度约 420 字的分块，相邻分块之间保留约 80 字重叠，避免语义被生硬截断。',
  '知识库问答采用检索增强生成的方式。用户提问后，系统先在本地使用 BM25 算法对全部分块打分，取出最相关的 4 个片段，再把片段拼接成上下文交给大模型。系统提示词要求模型只依据片段回答，片段不足时明确说明知识库中暂无相关信息，并在引用时标注片段序号。',
  '如果上传后提示解析失败，常见原因有三个。第一是文件本身是扫描件或纯图片，无法提取文字。第二是文档设置了密码或权限保护。第三是文件扩展名与实际格式不一致，例如把 docx 改名成 doc。遇到这种情况，建议先用办公软件另存为 docx 或 txt 再重新上传。',
  '知识库文档按名称覆盖。上传同名文件时，系统会先删除旧分块再写入新分块，因此更新文档只需要重新上传同名文件。删除文档会同时删除该文档的全部分块，操作不可撤销，请谨慎使用。知识库统计会实时显示文档数、分块数与字符数。',
  '调试方式方面，前端会在浏览器控制台输出请求参数与响应数据，后端会在终端输出知识库检索结果、发送给大模型的完整消息数组以及大模型返回的原始内容。课程演示时可以同时打开浏览器控制台与后端终端，直观展示一次问答从检索到生成的全过程。',
  '知识库页面右侧提供问答区域。提问前可以选择检索范围，默认在全部文档中检索，也可以只针对某一个文档提问。回答下方会列出本次命中的来源片段，包括文档名称、分块序号、相关度得分与片段摘要，方便核对答案是否来自知识库。',
  '推荐的演示问题包括：这个项目用到了哪些技术、知识库支持哪些文件格式、流式输出是怎么实现的、会话历史保存在哪里、上传解析失败怎么办、知识库问答的检索流程是什么。这些问题在示例知识库中都有对应内容，可以稳定命中相关片段。',
  '安全方面需要注意三点。第一，七牛云密钥只保存在后端 .env 文件中，并且 .env 已加入 .gitignore，不会进入版本库。第二，上传接口限制了单文件 15MB 与单次一个文件，避免恶意大文件占用内存。第三，接口只接受白名单内的文件扩展名，解析失败时会返回明确错误而不是抛出异常。',
  '知识库与普通 AI 客服的区别在于回答依据。普通客服依赖模型自身的通用知识，回答范围较宽但可能偏离项目事实。知识库客服先检索再生成，回答严格限定在上传文档的内容范围内，更适合课程答辩时回答项目细节问题，也更方便说明检索增强生成的完整链路。'
].join('\n\n');

async function Wanghl_main() {
  const Wanghl_connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: Wanghl_dbName,
    multipleStatements: true
  });

  try {
    await Wanghl_connection.query(Wanghl_createTableSql);
    console.log('[Wanghl] 知识库表 Wanghl_kb_chunks 已就绪');

    const Wanghl_docs = [
      { name: Wanghl_docOneName, ext: Wanghl_docOneExt, text: Wanghl_docOneText },
      { name: Wanghl_docTwoName, ext: Wanghl_docTwoExt, text: Wanghl_docTwoText }
    ];

    for (const Wanghl_doc of Wanghl_docs) {
      const Wanghl_chunks = Wanghl_retriever.Wanghl_splitChunks(Wanghl_doc.text);
      await Wanghl_connection.beginTransaction();
      try {
        await Wanghl_connection.query(
          'DELETE FROM Wanghl_kb_chunks WHERE Wanghl_doc_name = ?',
          [Wanghl_doc.name]
        );
        const Wanghl_values = Wanghl_chunks.map(function (Wanghl_content, Wanghl_index) {
          return [
            Wanghl_doc.name,
            Wanghl_doc.ext,
            Buffer.byteLength(Wanghl_doc.text, 'utf8'),
            Wanghl_index,
            Wanghl_content
          ];
        });
        await Wanghl_connection.query(
          'INSERT INTO Wanghl_kb_chunks (Wanghl_doc_name, Wanghl_doc_ext, Wanghl_doc_size, Wanghl_chunk_index, Wanghl_content) VALUES ?',
          [Wanghl_values]
        );
        await Wanghl_connection.commit();
        console.log('[Wanghl] 已写入知识库文件：' + Wanghl_doc.name + '，分块 ' + Wanghl_chunks.length + ' 个');
      } catch (Wanghl_err) {
        await Wanghl_connection.rollback();
        throw Wanghl_err;
      }
    }

    const [Wanghl_stats] = await Wanghl_connection.query(
      'SELECT COUNT(DISTINCT Wanghl_doc_name) AS docs, COUNT(*) AS chunks FROM Wanghl_kb_chunks'
    );
    console.log(
      '[Wanghl] 知识库初始化完成：文档 ' + Wanghl_stats[0].docs + ' 个，分块 ' + Wanghl_stats[0].chunks + ' 个'
    );
  } finally {
    await Wanghl_connection.end();
  }
}

Wanghl_main().catch(function (Wanghl_err) {
  console.error('[Wanghl] 知识库初始化失败：', Wanghl_err.message);
  process.exitCode = 1;
});
