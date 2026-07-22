#!/bin/bash

# GitHub 文件下载服务启动脚本

echo "正在启动 GitHub 文件下载服务..."

# 检查是否安装了依赖
if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 安装依赖
echo "安装依赖包..."
pip install -r requirements.txt

# 启动服务
echo "启动服务..."
python main.py