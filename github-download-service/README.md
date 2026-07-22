# GitHub 文件下载服务

一个基于 FastAPI 的 GitHub 代码文件下载服务,支持单个文件、目录和整个仓库的下载。

## 功能特性

- ✅ 下载单个文件
- ✅ 下载整个目录(自动打包为 ZIP)
- ✅ 下载整个仓库(自动打包为 ZIP)
- ✅ 支持指定分支
- ✅ 提供公网访问接口
- ✅ RESTful API 设计
- ✅ 自动健康检查

## 快速开始

### 1. 安装依赖

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
# 或
.\venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt
```

### 2. 启动服务

```bash
# 方式1: 使用启动脚本
./start.sh

# 方式2: 直接运行
python main.py
```

服务将在 `http://0.0.0.0:8000` 启动

### 3. 访问 API 文档

访问 http://localhost:8000 查看所有可用接口

或访问 http://localhost:8000/docs 查看交互式 API 文档

## API 使用示例

### 1. 健康检查

```bash
curl http://localhost:8000/health
```

响应:
```json
{"status": "ok"}
```

### 2. 下载单个文件

```bash
# 示例:下载 README 文件
curl -o README.md "http://localhost:8000/download/file?owner=octocat&repo=Hello-World&path=README"
```

参数:
- `owner`: 仓库所有者 (必填)
- `repo`: 仓库名称 (必填)
- `path`: 文件路径 (必填)
- `branch`: 分支名称 (可选,默认为 main)

### 3. 下载整个目录

```bash
# 示例:下载整个 docs 目录
curl -o docs.zip "http://localhost:8000/download/directory?owner=octocat&repo=Hello-World&path=docs"
```

参数:
- `owner`: 仓库所有者 (必填)
- `repo`: 仓库名称 (必填)
- `path`: 目录路径 (必填)
- `branch`: 分支名称 (可选,默认为 main)

### 4. 下载整个仓库

```bash
# 示例:下载整个仓库
curl -o repo.zip "http://localhost:8000/download/repository?owner=octocat&repo=Hello-World"
```

参数:
- `owner`: 仓库所有者 (必填)
- `repo`: 仓库名称 (必填)
- `branch`: 分支名称 (可选,默认为 main)

## 公网访问配置

### 使用 ngrok (推荐)

#### 1. 安装 ngrok

访问 https://ngrok.com/download 下载并安装 ngrok

Linux 快速安装:
```bash
wget https://bin.equinox.io/c/bNyj1mQVY4e/ngrok-v3-stable-linux-amd64.tgz
tar -xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

#### 2. 注册并获取认证令牌

1. 访问 https://ngrok.com 注册账号
2. 访问 https://dashboard.ngrok.com/get-started/your-authtoken 获取认证令牌
3. 配置认证令牌:

```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

#### 3. 启动 ngrok 隧道

```bash
# 使用提供的脚本
./start-ngrok.sh

# 或直接运行
ngrok http 8000
```

ngrok 启动后会显示公网 URL,格式类似:
```
Forwarding  https://xxxx-xx-xx-xxx-xx.ngrok-free.app -> http://localhost:8000
```

#### 4. 使用公网 URL

使用上面显示的 URL 替换 localhost:

```bash
# 下载单个文件
curl -o README.md "https://xxxx.ngrok-free.app/download/file?owner=octocat&repo=Hello-World&path=README"

# 下载整个仓库
curl -o repo.zip "https://xxxx.ngrok-free.app/download/repository?owner=octocat&repo=Hello-World"
```

### 其他公网访问方案

除了 ngrok,你还可以使用:

1. **Cloudflare Tunnel** (免费)
   ```bash
   # 安装 cloudflared
   # 运行隧道
   cloudflared tunnel --url http://localhost:8000
   ```

2. **自建反向代理**
   - 使用 Nginx 或 Apache 配置反向代理
   - 需要公网服务器和域名

3. **云服务器部署**
   - 部署到 AWS、GCP、阿里云等云平台
   - 使用云平台的负载均衡和域名服务

## 项目结构

```
github-download-service/
├── main.py              # 主程序文件
├── requirements.txt     # Python 依赖
├── start.sh             # 启动脚本
├── start-ngrok.sh       # ngrok 启动脚本
└── README.md            # 本文档
```

## 技术栈

- **FastAPI**: 高性能 Web 框架
- **Uvicorn**: ASGI 服务器
- **Requests**: HTTP 客户端库
- **Python 3.7+**: 编程语言

## 注意事项

1. GitHub API 有速率限制(未认证:60次/小时,认证:5000次/小时)
2. 大文件下载可能需要较长时间,建议设置超时时间
3. ngrok 免费版有一些限制:
   - 每分钟最多 40 个连接
   - 会话最长 2 小时
   - 域名每次启动都会变化

## 故障排查

### 服务无法启动

```bash
# 检查端口是否被占用
lsof -i :8000

# 查看详细错误日志
python main.py
```

### ngrok 连接失败

```bash
# 检查 ngrok 是否正确安装
ngrok version

# 检查认证令牌是否配置
ngrok config check
```

### 文件下载失败

- 检查仓库名称和文件路径是否正确
- 确认分支名称存在(有些仓库使用 master 而不是 main)
- 查看 GitHub API 响应状态码

## 许可证

MIT License