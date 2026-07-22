#!/bin/bash

# 测试脚本 - 测试 GitHub 文件下载服务的各个端点

echo "==================================="
echo "GitHub 文件下载服务测试"
echo "==================================="
echo ""

BASE_URL="http://localhost:8000"

echo "1. 测试健康检查接口..."
curl -s "$BASE_URL/health" | python3 -m json.tool
echo ""

echo "2. 测试根路径..."
curl -s "$BASE_URL/" | python3 -m json.tool
echo ""

echo "3. 测试下载单个文件(示例:下载某仓库的README)..."
echo "命令: curl -o test_readme.md \"$BASE_URL/download/file?owner=octocat&repo=Hello-World&path=README\""
echo "注意: 实际下载时取消注释下面的行:"
# curl -o test_readme.md "$BASE_URL/download/file?owner=octocat&repo=Hello-World&path=README"
echo ""

echo "4. 测试下载整个仓库..."
echo "命令: curl -o test_repo.zip \"$BASE_URL/download/repository?owner=octocat&repo=Hello-World\""
echo "注意: 实际下载时取消注释下面的行:"
# curl -o test_repo.zip "$BASE_URL/download/repository?owner=octocat&repo=Hello-World"
echo ""

echo "==================================="
echo "测试完成!"
echo "==================================="
echo ""
echo "API 文档地址: $BASE_URL/docs"
echo "健康检查地址: $BASE_URL/health"