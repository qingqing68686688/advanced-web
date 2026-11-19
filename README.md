# 知乎的模仿与制作

## 项目信息

- **姓名**：王慧琳
- **学号**：24001010731
- **项目类别**：模仿
- **技术栈**：原生 HTML / CSS / JavaScript + Node.js + Express + MySQL

## 项目结构

```
├── frontend/          # 前端目录（原生 HTML/CSS/JS）
│   ├── css/           # 样式文件
│   ├── js/            # JavaScript 文件
│   ├── fonts/         # 字体与图标
│   ├── images/        # 图片资源
│   └── index.html     # 首页
├── backend/           # 后端目录（Node.js + Express）
│   ├── config/        # 配置文件
│   ├── models/        # 数据模型
│   ├── controllers/   # 控制器
│   ├── routes/        # 路由
│   ├── app.js         # 入口文件
│   └── .env           # 环境变量
├── AGENTS.md          # 开发规则
├── README.md          # 项目说明
└── Wanghl_prompt.md   # 提示词记录
```

## 启动方式

### 后端
```bash
cd backend
npm install
npm start
```
服务运行在 `http://localhost:8731`

### 前端
前端由后端 express.static 托管，访问 `http://localhost:8731` 即可。
