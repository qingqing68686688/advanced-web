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

## 项目简介

本项目以知乎问答社区为参考对象，使用原生前端技术还原其页面结构与交互体验，后端采用
Node.js + Express 提供 `/api/` 前缀的 RESTful 接口，并通过 `express.static` 托管前端页面。
当前已完成项目首页（含 Canvas 粒子背景动画与页面导航），其余功能页面正在规划中。

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
| 项目首页 | `frontend/index.html` | 项目信息、页面导航、Canvas 粒子背景动画 |

## 接口一览

| 接口路径 | 方法 | 说明 |
| --- | --- | --- |
| `/api/test` | GET | 接口连通性测试 |

统一响应格式：

```json
{ "code": 0, "msg": "提示信息", "data": {} }
```

## 开发记录

- `Wanghl_prompt.md`：每次向 AI 发出开发指令后追加记录
- `backend/Wanghl_interface.md`：每次创建或修改接口后追加记录
- `backend/Wanghl_database.md`：每次建表、改表或插入数据后追加 SQL
