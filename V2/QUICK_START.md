# 🚀 快速开始指南

## 1️⃣ 本地运行（最快）

### 使用启动脚本
```bash
cd V2
./start.sh
```

访问：http://localhost:8000

### 或使用 Python（无需脚本）
```bash
cd V2
python3 -m http.server 8000
```

## 2️⃣ 部署到 Vercel（最简单）

### 方法A：网页部署（无需命令行）

1. **访问** https://vercel.com/new
2. **导入** 你的 Git 仓库
3. **配置**：
   - Root Directory: `V2`
   - Framework Preset: Other
   - Build Command: 留空
   - Output Directory: `.`
4. **点击** Deploy 按钮
5. **完成** 🎉 自动获得一个 `.vercel.app` 域名

### 方法B：命令行部署（更快）

```bash
# 安装 Vercel CLI（仅需一次）
npm install -g vercel

# 进入 V2 目录
cd V2

# 部署
vercel

# 部署到生产环境
vercel --prod
```

## 3️⃣ 访问系统

部署成功后，你将看到：
- 📦 采销SKU明细管理
- 📄 采销合同管理
- 🔗 合同-发票关联管理
- 🧾 进项发票管理
- 📊 成本分析
- 💰 对账单管理
- 📈 数据报表

## 💡 提示

### 自定义域名
在 Vercel 项目设置 → Domains 中添加你的域名

### 查看部署日志
访问 Vercel Dashboard → 你的项目 → Deployments

### 环境变量（可选）
如果后续需要对接 API，在 Vercel 项目设置 → Environment Variables 中配置

## 📝 常见问题

### Q: start.sh 无法执行？
```bash
chmod +x start.sh
./start.sh
```

### Q: Python 命令不存在？
- macOS/Linux: 使用 `python3` 代替 `python`
- Windows: 确保 Python 已添加到 PATH

### Q: Vercel 部署失败？
1. 确认 `vercel.json` 文件存在
2. 检查 Root Directory 是否设置为 `V2`
3. 查看 Vercel 部署日志

## 📚 更多文档

- [完整 README](./README.md) - 项目详细说明
- [部署指南](./DEPLOYMENT.md) - 详细部署文档

---

**现在就开始使用吧！** ✨

