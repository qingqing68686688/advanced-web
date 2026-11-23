# 知乎的模仿与制作

> 高级网页设计课程项目 · 项目类别：模仿

## 项目信息

| 项目 | 内容 |
| --- | --- |
| 项目名称 | 知乎的模仿与制作 |
| 项目类别 | 模仿 |
| 姓　　名 | 王慧琳 |
| 学　　号 | 24001010731 |
| 前端技术 | 原生 HTML / CSS / JavaScript（无任何第三方库与 CDN） |
| 后端技术 | Node.js + Express（RESTful + MVC） |
| 数据库 | MySQL |
| AI 能力 | 七牛云大模型 `qiniu/conatus-free`（OpenAI 兼容接口） |

## 项目简介

本项目以知乎问答社区为参考对象，使用原生前端技术还原其页面结构与交互体验，后端采用
Node.js + Express 提供 `/api/` 前缀的 RESTful 接口，并通过 `express.static` 托管前端页面。
当前已完成项目首页（含 Canvas 粒子背景动画与页面导航）、数据库连接测试、科技新闻列表、图文列表与 AI 在线客服页面，其余功能页面正在规划中。

## 目录结构

```
王慧琳全栈开发/
├── frontend/                 # 前端（原生 HTML / CSS / JS）
│   ├── css/                  # 样式文件
│   ├── js/                   # 脚本文件
│   ├── fonts/                # iconfont 图标文件
│   ├── images/               # 图片资源
│   └── index.html            # 项目首页
├── backend/                  # 后端（Node.js + Express）
│   ├── config/               # 配置（数据库连接池）
│   ├── controllers/          # 控制器
│   ├── models/               # 数据模型
│   ├── routes/               # 路由
│   ├── scripts/              # 数据库初始化脚本
│   ├── app.js                # 服务入口
│   ├── .env                  # 数据库凭据（不纳入版本管理）
│   ├── Wanghl_interface.md   # 接口记录
│   └── Wanghl_database.md    # 数据库记录
├── AGENTS.md                 # 项目开发规则
├── Wanghl_prompt.md          # 提示词记录
└── README.md                 # 项目说明
```

## 快速开始

### 1. 安装后端依赖

```bash
cd backend
cnpm i          # 优先使用 cnpm，失败或超时改用 npm i
```

### 2. 配置数据库凭据

在 `backend/.env` 中填写：

```
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_HOST=localhost
DB_NAME=Wanghl_zhihu

# 七牛云 AI（在线客服使用）
QINIU_API_KEY=你的七牛云 API Key
QINIU_BASE_URL=https://api.qnaigc.com/v1
QINIU_MODEL=qiniu/conatus-free
```

### 3. 启动服务

```bash
cd backend
npm start
```

- 服务地址：<http://localhost:8731>
- 接口前缀：<http://localhost:8731/api/>
- 前端页面由 `express.static` 托管，直接访问 <http://localhost:8731> 即可

## 已完成的页面

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 项目首页 | `frontend/index.html` | 知乎信息流：推荐/热榜/科技/图文标签切换、右侧热榜与项目概览、服务状态与接口速览 |
| 数据库连接 | `frontend/database.html` | 输入 MySQL 用户名与密码，测试数据库连通性 |
| 科技新闻 | `frontend/news.html` | 数据库驱动的新闻列表、分类筛选、搜索与分页 |
| 图文列表 | `frontend/gallery.html` | 图文卡片网格、关键词搜索、分类筛选与分页，展示接口链接与原始 JSON |
| AI 在线客服 | `frontend/chat.html` | 三栏工作台：本地会话历史、SSE 流式逐字回复、简易 Markdown、复制与重新生成、模型与用量信息 |
| 知识库问答 | `frontend/kb.html` | 上传 doc/docx/ppt/pptx/pdf/txt/md 文档，解析分块后基于 BM25 检索做 RAG 问答，展示命中来源片段 |

全站统一采用知乎风格的深色科技主题，所有页面顶部共享同一个导航栏（品牌标识 + 页面导航 + 提问入口），样式集中在 `frontend/css/theme-dark.css` 与 `frontend/css/nav.css`。

## 接口一览

| 接口路径 | 方法 | 说明 |
| --- | --- | --- |
| `/api/test` | GET | 接口连通性测试 |
| `/api/db/info` | GET | 获取数据库主机、端口与目标库名（不含密码） |
| `/api/db/test` | POST | 使用传入的用户名、密码测试 MySQL 连接 |
| `/api/news` | GET | 科技新闻列表，支持 `page`、`pageSize`、`category`、`keyword` |
| `/api/gallery` | GET | 图文列表，支持 `page`、`pageSize`、`category`、`keyword` |
| `/api/chat/info` | GET | 获取客服模型配置（不含密钥） |
| `/api/chat` | POST | AI 对话，请求体 `{ "messages": [{ "role": "user", "content": "你好" }] }` |
| `/api/chat/stream` | POST | AI 流式对话，以 SSE 逐段返回 `data: {"delta":"..."}`，结束返回 `data: {"done":true,...}` |
| `/api/kb/info` | GET | 知识库配置：支持的格式、分块参数、检索 TopK |
| `/api/kb/documents` | GET | 知识库文档列表，含每个文档的分块数与字符数 |
| `/api/kb/chunks` | GET | 查看指定文档的全部分块，参数 `name` |
| `/api/kb/upload` | POST | 上传知识库文件，`multipart/form-data` 字段 `file`，解析后自动分块入库 |
| `/api/kb/documents` | DELETE | 删除知识库文档及其分块，参数 `name` |
| `/api/kb/ask` | POST | 基于知识库的 RAG 问答，请求体 `{ "question": "...", "docName": "" }`，返回回答与命中片段 |

统一响应格式：

```json
{ "code": 0, "msg": "提示信息", "data": {} }
```

## 开发记录

- `Wanghl_prompt.md`：每次向 AI 发出开发指令后追加记录
- `backend/Wanghl_interface.md`：每次创建或修改接口后追加记录
- `backend/Wanghl_database.md`：每次建表、改表或插入数据后追加 SQL
