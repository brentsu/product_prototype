# 跨境电商财务合规系统原型

一个现代化的跨境电商财务合规管理系统，支持虚拟库存池管理、库存成本核算、待开票管理等功能。

## ✨ 功能特性

- 📦 **虚拟库存池管理** - 实时追踪库存入库、出库、结算和退货
- 💰 **库存成本核算** - 基于加权平均法的成本计算（按工厂+SKU维度）
- 🧾 **待开票管理** - 管理待开票需求和进项发票的匹配关系
- 📋 **流程说明** - 详细的业务流程和数据变化展示
- 🎨 **现代化UI** - 响应式设计，支持移动端访问

## 🚀 本地运行

### 方法1：Python（最简单）
```bash
# Python 3
cd caiwu_hegui
python3 -m http.server 8000

# 或 Python 2
python -m SimpleHTTPServer 8000

# 然后访问：http://localhost:8000
```

### 方法2：Node.js
```bash
# 使用 http-server
cd caiwu_hegui
npx http-server -p 8000

# 或使用 serve
npx serve

# 然后访问：http://localhost:8000
```

### 方法3：VS Code Live Server
1. 安装 **Live Server** 插件
2. 右键 `index.html` → "Open with Live Server"
3. 自动打开浏览器

## ☁️ Vercel 部署

### 方式1：Vercel CLI（推荐）
```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 进入项目目录
cd caiwu_hegui

# 3. 登录并部署
vercel

# 按提示操作，30秒内完成部署！
```

### 方式2：GitHub 集成
1. 将代码推送到 GitHub
2. 访问 [https://vercel.com](https://vercel.com)
3. 点击 "Import Project"
4. 选择你的 GitHub 仓库
5. 点击 "Deploy"（无需任何配置）

### 方式3：拖拽部署
1. 访问 [https://vercel.com/new](https://vercel.com/new)
2. 直接拖拽 `caiwu_hegui` 文件夹
3. 完成！

## 📁 项目结构

```
caiwu_hegui/
├── index.html                      # 主框架（约60行）
├── pages/                          # 页面模块
│   ├── dashboard.html              # 虚拟库存池
│   ├── inventory-process.html      # 虚拟库存池流程
│   ├── cost.html                   # 库存成本核算
│   ├── invoice.html                # 待开票管理
│   └── invoice-process.html        # 待开票流程
├── css/
│   └── style.css                   # 样式文件
├── js/
│   └── main.js                     # 主逻辑
├── vercel.json                     # Vercel 配置
├── README.md                       # 说明文档
├── .gitignore                      # Git 忽略文件
└── index.html.bak                  # 原始备份文件
```

## 🛠️ 技术栈

- **前端框架**：纯 HTML5 + CSS3 + JavaScript
- **架构模式**：SPA（单页应用）+ 动态加载
- **样式方案**：原生 CSS，无依赖
- **部署平台**：Vercel / Netlify / GitHub Pages

## 📖 核心业务逻辑

### 1. 虚拟库存池
- 按"工厂+SKU+采购单"维度管理库存
- 支持入库、出库、结算、退货操作
- 退货规则：只有在工厂未结算前才允许退货

### 2. 库存成本核算（加权平均法）
- 按"工厂+SKU"维度维护独立的成本池
- 加权平均成本 = 库存成本金额 ÷ 剩余可用库存
- 反映当前剩余库存的实际平均成本

### 3. 待开票管理
- 待开票列表：记录入库/退货产生的待开票需求
- 进项发票列表：记录收到的供应商发票
- 发票匹配记录：支持多对多匹配关系
- 匹配基准：价税合计（不含税金额 + 税额）

## 🎯 业务特色

- ✅ **实时数据追踪**：库存变化实时记录
- ✅ **成本精细化管理**：按工厂+SKU独立核算
- ✅ **发票智能匹配**：支持一对一、一对多、多对一匹配
- ✅ **业务规则校验**：防止超量消耗、非法退货
- ✅ **流程可视化**：每个业务操作都有详细的流程说明

## 📝 开发说明

### 添加新页面
1. 在 `pages/` 目录创建新的 HTML 文件
2. 在 `index.html` 的侧边栏添加菜单项
3. 在 `js/main.js` 的 `titles` 对象添加标题映射

### 修改样式
所有样式集中在 `css/style.css`，支持响应式设计。

### 修改逻辑
主要逻辑在 `js/main.js`，使用 `fetch` API 动态加载页面。

## 🔒 注意事项

- **本地运行**：必须使用服务器（HTTP Server），不能直接打开 `index.html`（因为使用了 `fetch` API）
- **跨域问题**：开发时确保通过服务器访问，避免 CORS 错误
- **浏览器兼容**：支持所有现代浏览器（Chrome、Firefox、Safari、Edge）

## 📞 支持

如有问题或建议，欢迎反馈！

---

**License:** MIT  
**Version:** 1.0.0  
**Last Updated:** 2025-11-13

