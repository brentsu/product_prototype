#!/bin/bash

# 财务合规管理系统 V2 - 本地启动脚本

echo "🚀 启动财务合规管理系统 V2..."
echo ""
echo "📂 项目目录: $(pwd)"
echo ""

# 检查Python版本
if command -v python3 &> /dev/null; then
    echo "✅ 使用 Python3 启动服务器..."
    echo "🌐 访问地址: http://localhost:8000"
    echo "💡 按 Ctrl+C 停止服务器"
    echo ""
    echo "📋 功能模块："
    echo "  - 采销SKU明细管理"
    echo "  - 采销合同管理"
    echo "  - 合同-发票关联管理"
    echo "  - 进项发票管理"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ 使用 Python 启动服务器..."
    echo "🌐 访问地址: http://localhost:8000"
    echo "💡 按 Ctrl+C 停止服务器"
    echo ""
    echo "📋 功能模块："
    echo "  - 采销SKU明细管理"
    echo "  - 采销合同管理"
    echo "  - 合同-发票关联管理"
    echo "  - 进项发票管理"
    echo ""
    python -m SimpleHTTPServer 8000
else
    echo "❌ 未找到 Python，请安装 Python 或使用其他方式启动服务器"
    echo ""
    echo "其他启动方式："
    echo "  - Node.js: npx http-server -p 8000"
    echo "  - VS Code: 安装 Live Server 插件"
    echo "  - 直接双击 index.html（部分功能可能受限）"
    exit 1
fi

