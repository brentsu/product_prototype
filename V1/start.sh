#!/bin/bash

# 跨境电商财务合规系统 - 本地启动脚本

echo "🚀 启动跨境电商财务合规系统..."
echo ""
echo "📂 项目目录: $(pwd)"
echo ""

# 检查Python版本
if command -v python3 &> /dev/null; then
    echo "✅ 使用 Python3 启动服务器..."
    echo "🌐 访问地址: http://localhost:8000"
    echo "💡 按 Ctrl+C 停止服务器"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ 使用 Python 启动服务器..."
    echo "🌐 访问地址: http://localhost:8000"
    echo "💡 按 Ctrl+C 停止服务器"
    echo ""
    python -m SimpleHTTPServer 8000
else
    echo "❌ 未找到 Python，请安装 Python 或使用其他方式启动服务器"
    echo ""
    echo "其他启动方式："
    echo "  - Node.js: npx http-server -p 8000"
    echo "  - VS Code: 安装 Live Server 插件"
    exit 1
fi

