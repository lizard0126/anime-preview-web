# 节操新番导视 · 评论收集工具

> 天央动漫社节操部新番导视活动的评论数据收集工具。
> 支持实时抓取番剧列表、评论录入、头像获取、评论预览与数据导入导出。

---

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [环境要求](#环境要求)
- [本地开发](#本地开发)
- [部署方式](#部署方式)
  - [方式一：前后端分离部署至云服务器（推荐）](#方式一前后端分离部署至云服务器推荐)
  - [方式二：部署至 Vercel](#方式二部署至-vercel)
- [使用指南](#使用指南)
- [API 接口说明](#api-接口说明)
- [常见问题](#常见问题)
- [许可证](#许可证)

---

## 项目简介

本项目用于社团新番导视活动中收集成员对新番的评论。成员通过网页端抓取或手动录入番剧列表，填写评论内容并获取对应 QQ 头像，最终导出 JSON 数据交由负责人合并。

项目由**前端静态页面**与**后端 API 服务**两部分组成，二者相互独立，可分别部署：

- 前端：纯静态 HTML/CSS/JavaScript，无需构建。
- 后端：Node.js 服务，提供番剧抓取与评论预览渲染接口。

---

## 功能特性

- 从 yuc.wiki 实时抓取指定季度的番剧列表
- 支持批量手动添加番剧（格式：`中文标题 | 日文标题`）
- 输入 QQ 号自动获取头像
- 支持金牌、银牌、黑牌三种奖牌标记
- 基于后端模板生成评论预览图（iframe 内嵌渲染）
- 导入/导出评论 JSON 数据，支持按标题合并或整体替换
- 编辑内容自动保存至浏览器本地存储（localStorage）
- 响应式布局，兼容桌面端与移动端

---

## 技术栈

| 层级 | 技术 |
| ---- | ---- |
| 前端 | 原生 HTML5 / CSS3 / JavaScript (ES6+) |
| 后端 | Node.js + Express |
| 模板引擎 | EJS |
| 数据抓取 | axios + cheerio |
| 部署 | 云服务器（Node.js 运行时）或 Vercel Serverless |

---

## 项目结构

```
.
├── public/                     # 前端静态资源
│   ├── index.html              # 主页面
│   ├── styles.css              # 样式文件
│   └── app.js                  # 前端逻辑
│
├── anime-api/                  # 后端 API 服务
│   ├── handlers/
│   │   ├── fetch-anime.js      # 番剧列表抓取处理逻辑
│   │   └── preview.js          # 评论预览渲染处理逻辑
│   ├── server.js               # Express 服务入口
│   └── package.json            # 后端依赖配置
│
├── api/                        # Vercel Serverless 函数（可选部署方式）
│   ├── fetch-anime.js
│   └── preview.js
│
├── vercel.json                 # Vercel 部署配置（可选）
├── package.json                # 根目录依赖配置
└── README.md                   # 说明文档
```

> 说明：`anime-api/` 为独立进程运行的 Express 服务，适用于云服务器部署；`api/` 目录为等价的 Vercel Serverless 函数，二者逻辑一致，可按需保留其一。

---

## 环境要求

- Node.js 18.x 或更高版本
- npm 9.x 或更高版本
- （云服务器部署）具备公网 IP 的 Linux 服务器
- （云服务器部署）建议使用 Nginx 作为反向代理并配置 HTTPS

---

## 本地开发

### 1. 启动后端服务

```bash
cd anime-api
npm install
npm start
```

后端默认监听 `127.0.0.1:3210`，提供以下接口：

- `GET  /api/fetch-anime?season=202607`
- `POST /api/preview`
- `GET  /api/health`

### 2. 启动前端页面

前端为纯静态文件，可使用任意静态服务器托管。例如：

```bash
npx serve public
```

或在开发阶段直接将 `public/` 目录交由后端一并托管（需自行在 `server.js` 中添加静态资源中间件）。

### 3. 配置接口地址

前端默认以相对路径 `/api/...` 请求后端。若前后端不在同一域名或端口下，需修改 `public/app.js` 中的接口前缀：

```javascript
// 示例：将请求指向独立的后端域名
const API_BASE = 'https://api.example.com';
```

---

## 部署方式

项目提供两种部署方案，可根据实际网络环境与运维条件选择。

### 方式一：前后端分离部署至云服务器（推荐）

该方案将前端与后端分别部署在同一台或不同服务器上，通过 Nginx 反向代理统一对外提供服务，可有效规避第三方托管平台可能出现的网络访问问题。

#### 步骤 1：准备服务器环境

在云服务器上安装 Node.js 与 Nginx：

```bash
# 以 Ubuntu 为例
sudo apt update
sudo apt install -y nodejs npm nginx
node -v   # 确认版本 ≥ 18
```

#### 步骤 2：部署后端服务

将 `anime-api/` 目录上传至服务器，例如 `/var/www/anime-api`：

```bash
cd /var/www/anime-api
npm install --production
```

使用 PM2 进行进程守护（推荐）：

```bash
sudo npm install -g pm2
pm2 start server.js --name anime-api
pm2 save
pm2 startup
```

确认服务运行正常：

```bash
curl http://127.0.0.1:3210/api/health
# 预期输出：ok
```

#### 步骤 3：部署前端静态文件

将 `public/` 目录上传至服务器，例如 `/var/www/anime-web`。同时按需修改 `public/app.js` 中的 `API_BASE`，指向后端实际地址。

#### 步骤 4：配置 Nginx 反向代理

在 `/etc/nginx/sites-available/anime` 中新建配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态资源
    root /var/www/anime-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:3210;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置并重载 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/anime /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 步骤 5：配置 HTTPS（可选，推荐）

使用 Certbot 自动申请并配置证书：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### 步骤 6：验证部署

浏览器访问 `http://your-domain.com`（或 HTTPS 地址），输入季度代码并点击“从 yuc.wiki 抓取”，若能正常返回番剧列表，则部署成功。

---

### 方式二：部署至 Vercel

该方案适用于无需自备服务器的场景，前端静态页面与后端 Serverless 函数由 Vercel 统一托管。

#### 步骤 1：推送代码至 GitHub

将项目文件推送至 GitHub 仓库，确保包含以下内容：

- `package.json`
- `vercel.json`
- `api/fetch-anime.js`
- `api/preview.js`
- `public/index.html`
- `public/styles.css`
- `public/app.js`

#### 步骤 2：导入项目至 Vercel

1. 登录 [Vercel](https://vercel.com)，使用 GitHub 账号授权。
2. 点击 **Add New... → Project**。
3. 选择目标仓库并点击 **Import**。
4. 配置部署参数：
   - **Framework Preset**：`Other`
   - **Root Directory**：`/`（保持默认）
   - **Build Command**：留空
   - **Output Directory**：留空
5. 点击 **Deploy**，等待约 1 至 2 分钟。

部署完成后将获得形如 `https://your-project.vercel.app` 的访问地址。

#### 步骤 3：使用 Vercel CLI 部署（可选）

```bash
npm install -g vercel
vercel login
vercel --prod
```

#### 步骤 4：更新代码

向 GitHub 仓库的 `main` 分支推送变更后，Vercel 会自动触发重新部署：

```bash
git add .
git commit -m "更新说明"
git push origin main
```

---

## 使用指南

### 基本流程

1. 打开部署后的页面。
2. 在顶部输入框填写季度代码（例如 `202607` 表示 2026 年 7 月新番）。
3. 点击 **从 yuc.wiki 抓取** 获取番剧列表；若抓取失败，可改用 **批量添加番剧** 手动录入。
4. 在 **默认信息** 栏填写昵称与 QQ 号，系统将自动获取对应头像。
5. 在目标番剧条目下点击 **添加评论** 或 **添加[昵称]的评论** 进行评论录入。
6. 可点击 **预览** 按钮查看评论在最终模板中的呈现效果。
7. 完成后点击 **导出评论**，将生成的 JSON 文件交由负责人。

### 季度代码格式

| 季度 | 代码格式 | 示例 |
| ---- | -------- | ---- |
| 1 月 | 年份 + 01 | 202601 |
| 4 月 | 年份 + 04 | 202604 |
| 7 月 | 年份 + 07 | 202607 |
| 10 月 | 年份 + 10 | 202610 |

### 数据导入与导出

- **导出**：点击“导出评论”，生成包含全部番剧及评论的 JSON 文件，文件名格式为 `评论数据_YYYY-MM-DD.json`。
- **导入**：点击“导入评论”选择 JSON 文件后，将弹出确认框：
  - 点击“确定”：按番剧标题匹配，**合并**评论（同昵称评论不重复添加）。
  - 点击“取消”：以导入文件内容**替换**当前全部数据。

### 数据存储说明

所有编辑内容自动保存至浏览器 localStorage，键名为 `anime-comment-data`。清除浏览器数据或更换设备后需重新导入备份，建议定期导出 JSON 文件以防数据丢失。

---

## API 接口说明

后端服务提供以下接口，均返回 JSON 格式数据。

### GET /api/fetch-anime

抓取指定季度的番剧列表。

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
| ---- | ---- | ---- | ---- |
| `season` | string | 是 | 季度代码，例如 `202607` |

**响应示例**

```json
{
  "success": true,
  "data": [
    {
      "title": "中文标题",
      "subtitle": "日文标题",
      "type": "类型",
      "tags": ["标签1", "标签2"],
      "visual": "视觉图地址",
      "staff": "制作信息",
      "cast": "声优信息",
      "broadcast": "放送时间",
      "comments": [],
      "selected": true
    }
  ],
  "count": 1
}
```

### POST /api/preview

根据番剧与评论数据渲染预览 HTML。

**请求体**

```json
{
  "anime": {
    "title": "中文标题",
    "subtitle": "日文标题",
    "visual": "视觉图地址",
    "comments": [
      {
        "name": "昵称",
        "avatar": "头像地址",
        "text": "评论内容",
        "medal": "金牌"
      }
    ]
  }
}
```

**响应示例**

```json
{
  "success": true,
  "html": "<!DOCTYPE html>..."
}
```

### GET /api/health

健康检查接口，返回纯文本 `ok`，用于监控服务可用性。

---

## 常见问题

**Q1：抓取番剧列表失败如何处理？**

请依次检查以下项：季度代码是否正确；服务器能否正常访问 yuc.wiki；后端服务是否已启动且网络通畅。若问题持续，可改用“批量添加番剧”手动录入。

**Q2：评论数据是否会丢失？**

数据默认保存于浏览器 localStorage，仅在当前浏览器有效。清除浏览器数据或更换设备后将丢失，建议定期通过“导出评论”备份。

**Q3：前端请求接口返回跨域错误如何处理？**

后端已启用 CORS 允许所有来源。若仍出现跨域问题，请确认前端请求的 `API_BASE` 指向正确的后端地址，并在 Nginx 中正确配置反向代理。

**Q4：部署至 Vercel 后接口访问受限怎么办？**

部分网络环境下 Vercel 域名可能访问不稳定，建议改用云服务器部署方案（方式一），通过自有域名与反向代理提升访问稳定性。

**Q5：预览图在移动端显示不完整如何处理？**

预览内容由后端按固定设计宽度（800px）渲染，前端已对其按容器宽度进行等比缩放。如仍显示异常，请检查浏览器缩放比例或更新至最新版本的前端代码。

---

## 许可证

MIT License