
# 🎬 节操新番导视 · 评论收集

> 天央动漫社节操部新番导视活动的评论收集工具
> 基于 Vercel 部署，支持实时抓取番剧列表

## 功能

- 从 yuc.wiki 实时抓取番剧列表（支持指定季度）
- 批量手动添加番剧
- 输入 QQ 号自动获取头像
- 支持金牌、银牌、黑牌奖牌标记
- 导入/导出评论 JSON 数据
- 自动保存到浏览器本地存储
- 响应式设计，支持移动端

## 技术栈

- **前端**：原生 HTML/CSS/JavaScript
- **后端**：Node.js (Vercel Serverless Functions)
- **依赖**：axios, cheerio
- **部署**：Vercel

## 快速开始

### 1. 部署到 Vercel

**方式一：通过 GitHub（推荐）**

1. Fork 或创建仓库，将本项目文件推送到 GitHub
2. 登录 [Vercel](https://vercel.com)（使用 GitHub 账号）
3. 点击 **Add New...** → **Project**
4. 导入你的 GitHub 仓库
5. Framework Preset 选择 **Other**
6. 点击 **Deploy**，等待约 1 分钟

**方式二：使用 Vercel CLI**

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 2. 项目结构

```
anime-comment-collector/
├── api/
│   └── fetch-anime.js      # 抓取番剧列表的 API
├── public/
│   ├── index.html          # 主页面
│   ├── styles.css          # 样式文件
│   └── app.js              # 前端逻辑
├── package.json            # 依赖配置
├── vercel.json             # Vercel 配置
└── README.md               # 说明文档
```

### 3. 本地开发

```bash
# 安装依赖
npm install

# 安装 Vercel CLI（如果未安装）
npm install -g vercel

# 本地运行
vercel dev
```

## 使用指南

### 基本流程

1. **打开页面**：访问部署后的 URL（如 `https://anime-comment-collector.vercel.app`）
2. **输入季度代码**：在顶部输入框输入季度代码（如 `202607` 代表 2026年7月新番）
3. **抓取番剧**：点击 **从 yuc.wiki 抓取** 获取番剧列表
4. **设置默认信息**：在"默认信息"栏输入昵称和 QQ 号
5. **添加评论**：点击每部番剧下的 **添加评论** 或 **添加[昵称]的评论**
6. **导出数据**：完成后点击 **导出评论**，将 JSON 文件发给负责人

### 详细信息

#### 季度代码格式

| 季度 | 代码格式  | 示例   |
| ---- | --------- | ------ |
| 1月  | 年份 + 01 | 202601 |
| 4月  | 年份 + 04 | 202604 |
| 7月  | 年份 + 07 | 202607 |
| 10月 | 年份 + 10 | 202610 |

#### 功能说明

- **批量添加番剧**：手动输入番剧列表，每行一个，格式：`中文标题 | 日文标题`
- **导入评论**：导入之前导出的 JSON 文件，支持合并（按标题匹配）或替换
- **奖牌标记**：每条评论可标记为金牌、银牌或黑牌
- **自动保存**：所有修改自动保存到浏览器本地存储

### 使用场景

**社团成员**：

1. 访问部署后的网址
2. 抓取番剧列表
3. 添加自己的评论
4. 导出 JSON 文件
5. 发给负责人

**负责人**：

1. 收集所有人的 JSON 文件
2. 在桌面端导入合并
3. 生成最终图片

## 常见问题

### Q: 抓取番剧失败怎么办？

A: 检查季度代码是否正确，并确保 yuc.wiki 可以访问。如果持续失败，可以手动批量添加番剧。

### Q: 评论数据会丢失吗？

A: 数据默认保存在浏览器本地存储中。建议定期导出 JSON 备份。

### Q: 如何更新代码？

A: 推送到 GitHub 的 main 分支后，Vercel 会自动重新部署。

```bash
git add .
git commit -m "更新说明"
git push origin main
```

## 许可证

MIT License

# 🎬 节操新番导视 · 评论收集

> 天央动漫社节操部新番导视活动的评论收集工具
> 基于 Vercel 部署，支持实时抓取番剧列表

## 功能

- 从 yuc.wiki 实时抓取番剧列表
- 批量手动添加番剧
- 输入 QQ 号自动获取头像
- 支持金牌、银牌、黑牌奖牌标记
- 导入/导出评论 JSON 数据
- 自动保存到浏览器本地存储

## 部署到 Vercel

### 方式一：通过 GitHub（推荐）

1. 创建 GitHub 仓库，推送所有文件
2. 登录 https://vercel.com
3. 点击 "Add New..." → "Project"
4. 导入你的 GitHub 仓库
5. Framework Preset 选择 "Other"
6. 点击 "Deploy"

### 方式二：使用 Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 使用流程

1. 打开页面，输入季度代码（如 `202607`）
2. 点击"从 yuc.wiki 抓取"获取番剧列表
3. 在"默认信息"栏输入昵称和 QQ 号
4. 在对应番剧下添加评论
5. 完成后导出 JSON，发给负责人合并

```

---

## 部署到 Vercel 的具体操作步骤

### 第一步：创建 GitHub 仓库

1. 登录 GitHub，点击右上角 `+` → `New repository`
2. 仓库名：`anime-comment-collector`
3. 选择 `Public`
4. 勾选 `Add a README file`
5. 点击 `Create repository`

### 第二步：上传文件

有几种方式：

**方式 A：通过 GitHub 网页上传**

1. 在仓库页面点击 `Add file` → `Upload files`
2. 把以下文件拖拽上传：
   - `package.json`
   - `vercel.json`
   - `api/fetch-anime.js`
   - `public/index.html`
   - `public/styles.css`
   - `public/app.js`
3. 提交

**方式 B：通过 Git 命令行**

```bash
# 克隆仓库
git clone https://github.com/你的用户名/anime-comment-collector.git
cd anime-comment-collector

# 创建目录结构
mkdir -p api public

# 把所有文件复制到对应目录

# 提交并推送
git add .
git commit -m "Initial commit"
git push origin main
```

### 第三步：部署到 Vercel

1. 打开 https://vercel.com
2. 点击 `Continue with GitHub` 用 GitHub 登录
3. 点击 `Add New...` → `Project`
4. 在列表中找到 `anime-comment-collector`，点击 `Import`
5. 配置页面：
   - **Framework Preset**: 选择 `Other`
   - **Root Directory**: 保持默认 `/`
   - **Build Command**: 留空
   - **Output Directory**: 留空
6. 点击 `Deploy`
7. 等待约 1-2 分钟，部署完成后会显示：
   ```
   Production: https://anime-comment-collector.vercel.app
   ```

### 第四步：验证

访问 `https://anime-comment-collector.vercel.app`

1. 输入季度代码 `202607`
2. 点击"从 yuc.wiki 抓取"
3. 如果能看到番剧列表，说明部署成功

### 可选：绑定自定义域名

1. 在 Vercel 项目页面点击 `Settings` → `Domains`
2. 输入你的域名（如 `comment.你的域名.com`）
3. 按照提示在域名服务商添加 DNS 记录

### 更新代码

后续修改代码后，只需要推送到 GitHub 的 main 分支，Vercel 会自动重新部署。

```bash
git add .
git commit -m "更新功能"
git push origin main
# Vercel 会自动部署
```

---

## 最终效果

```
社团成员访问：
https://anime-comment-collector.vercel.app

每个成员的操作：
1. 抓取番剧列表
2. 添加自己的评论（QQ号自动获取头像）
3. 导出 JSON 文件
4. 发给负责人

负责人的操作：
1. 收集所有人的 JSON 文件
2. 在桌面端（exe）导入合并
3. 导出图片
```
