#!/bin/bash

# ngrok 公网访问启动脚本

echo "正在启动 ngrok 隧道..."

# 检查ngrok是否安装
if ! command -v ngrok &> /dev/null; then
    echo "错误: ngrok 未安装"
    echo "请访问 https://ngrok.com/download 下载并安装 ngrok"
    echo "或使用以下命令安装:"
    echo "  wget https://bin.equinox.io/c/bNyj1mQVY4e/ngrok-v3-stable-linux-amd64.tgz"
    echo "  tar -xvzf ngrok-v3-stable-linux-amd64.tgz"
    echo "  sudo mv ngrok /usr/local/bin/"
    exit 1
fi

# 检查是否已配置认证令牌
if ! ngrok config check &> /dev/null; then
    echo "错误: ngrok 未配置认证令牌"
    echo "请访问 https://dashboard.ngrok.com/get-started/your-authtoken 获取认证令牌"
    echo "然后运行: ngrok config add-authtoken YOUR_TOKEN"
    exit 1
fi

# 启动ngrok隧道,映射到本地8000端口
echo "启动 ngrok 隧道,映射到本地 8000 端口..."
echo "访问地址将在终端输出中显示"
echo ""
echo "使用示例:"
echo "下载单个文件: http://YOUR_NGROK_URL/download/file?owner=octocat&repo=Hello-World&path=README"
echo "下载整个仓库: http://YOUR_NGROK_URL/download/repository?owner=octocat&repo=Hello-World"
echo ""

ngrok http 8000