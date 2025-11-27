# 财务合规管理系统 V2 - 部署指南

## 📦 项目概述

财务合规管理系统 V2 是一个纯前端的财务管理系统，包含采销SKU明细、合同管理、发票管理及其关联关系等核心功能模块。

## 🚀 部署方式

### 方式一：Vercel 部署（推荐）

#### 1. 准备工作
- 注册 Vercel 账号：https://vercel.com
- 安装 Vercel CLI（可选）：
```bash
npm install -g vercel
```

#### 2. 通过 Git 部署（推荐）

**步骤：**
1. 将代码推送到 GitHub/GitLab/Bitbucket
2. 访问 https://vercel.com/new
3. 导入你的 Git 仓库
4. 配置项目：
   - **Framework Preset**: 选择 "Other"
   - **Root Directory**: 选择 `V2` 文件夹
   - **Build Command**: 留空
   - **Output Directory**: `.` (当前目录)
5. 点击 "Deploy" 开始部署

#### 3. 通过 CLI 部署

在 V2 目录下运行：
```bash
cd /path/to/V2
vercel
```

按照提示操作即可完成部署。

#### 4. 自定义域名（可选）

在 Vercel 项目设置中：
1. 进入 "Domains" 标签
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

### 方式二：本地开发运行

#### 使用启动脚本（推荐）

```bash
cd V2
./start.sh
```

访问：http://localhost:8000

#### 使用 Python

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### 使用 Node.js

```bash
npx http-server -p 8000
```

#### 使用 VS Code Live Server

1. 安装 "Live Server" 插件
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

### 方式三：其他云服务部署

#### Netlify
1. 拖放部署：直接将 V2 文件夹拖到 https://app.netlify.com/drop
2. Git 部署：连接 Git 仓库，选择 V2 目录

#### GitHub Pages
```bash
# 在 V2 目录下
git init
git add .
git commit -m "Initial commit"
git branch -M gh-pages
git remote add origin <your-repo-url>
git push -u origin gh-pages
```

然后在仓库设置中启用 GitHub Pages。

#### Cloudflare Pages
1. 登录 Cloudflare Pages
2. 连接 Git 仓库
3. 配置构建设置：
   - **Build command**: 留空
   - **Build output directory**: `V2`

## 📝 配置文件说明

### vercel.json
```json
{
  "version": 2,
  "buildCommand": null,
  "outputDirectory": ".",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**说明：**
- `version`: Vercel 配置版本
- `buildCommand`: 构建命令（纯静态项目设为 null）
- `outputDirectory`: 输出目录
- `rewrites`: URL 重写规则，确保路由正常工作

### start.sh
本地开发启动脚本，支持：
- 自动检测 Python 版本
- 启动本地服务器
- 显示访问地址和功能模块

## 🌐 环境要求

### 生产环境
- 支持静态文件托管的任何服务器
- 无需后端服务器
- 无需数据库

### 开发环境
- Python 2.7+ 或 Python 3.x（推荐）
- 或 Node.js 10+
- 或任何静态文件服务器

## 📂 目录结构

```
V2/
├── index.html                          # 入口文件
├── vercel.json                         # Vercel 配置
├── start.sh                            # 启动脚本
├── README.md                           # 项目说明
├── DEPLOYMENT.md                       # 部署文档（本文件）
├── css/
│   └── style.css                       # 样式文件
├── js/
│   ├── main.js                         # 主页脚本
│   ├── sku-detail.js                   # SKU明细脚本
│   ├── purchase-contract.js            # 采销合同脚本
│   ├── invoice-management.js           # 发票管理脚本
│   └── contract-invoice-relation.js    # 合同-发票关联脚本
└── pages/
    ├── sku-detail.html                 # 采销SKU明细
    ├── purchase-contract.html          # 采销合同
    ├── invoice-management.html         # 进项发票管理
    ├── contract-invoice-relation.html  # 合同-发票关联
    └── ...                             # 其他页面
```

## 🔧 常见问题

### 1. 页面跳转 404

**原因：** 服务器没有正确配置 SPA 路由重写

**解决方案：**
- Vercel：已通过 `vercel.json` 配置解决
- 其他平台：配置所有路由重定向到 `index.html`

### 2. 本地运行时样式或脚本不加载

**原因：** 相对路径问题或 CORS 限制

**解决方案：**
- 使用 HTTP 服务器运行（不要直接打开 HTML 文件）
- 检查浏览器控制台错误信息

### 3. 启动脚本无法执行

**原因：** 缺少执行权限

**解决方案：**
```bash
chmod +x start.sh
./start.sh
```

## 🔐 安全注意事项

1. **敏感信息处理**
   - 当前版本使用前端模拟数据
   - 生产环境需接入后端 API
   - 不要在前端代码中存储敏感信息

2. **API 接入**
   - 实际部署时需要配置 API 端点
   - 建议使用环境变量管理配置
   - 启用 HTTPS 和 CORS 策略

3. **访问控制**
   - 建议添加身份验证机制
   - 实现权限管理系统
   - 记录操作日志

## 📊 性能优化

### 已实施的优化
- CSS 合并为单文件
- 响应式设计
- 懒加载考虑

### 建议的优化
1. **资源压缩**
   ```bash
   # 压缩 CSS
   npx clean-css-cli -o css/style.min.css css/style.css
   
   # 压缩 JS
   npx terser js/*.js -o js/bundle.min.js
   ```

2. **图片优化**
   - 使用 WebP 格式
   - 启用图片懒加载
   - 使用 CDN 加速

3. **缓存策略**
   - 配置浏览器缓存
   - 使用版本号或哈希值

## 🔄 持续部署

### Vercel 自动部署

1. 连接 Git 仓库后，每次推送代码会自动触发部署
2. 每个 PR 会生成预览链接
3. 主分支自动部署到生产环境

### 部署流程建议

```
开发分支 (dev)
    ↓ Pull Request
测试分支 (staging) → 预览环境
    ↓ 测试通过
主分支 (main) → 生产环境
```

## 📞 支持与反馈

如有问题或建议，请：
1. 查看项目 README.md
2. 检查浏览器控制台错误
3. 联系技术支持团队

## 📝 更新日志

### V2.0.0 (当前版本)
- ✅ 实现采销SKU明细管理
- ✅ 实现采销合同管理
- ✅ 实现进项发票管理
- ✅ 实现合同-发票关联关系（一对一、多对一）
- ✅ 配置 Vercel 部署
- ✅ 创建启动脚本

---

**部署成功后，打开浏览器访问你的部署地址即可使用系统！** 🎉

