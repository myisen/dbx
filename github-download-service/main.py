"""
GitHub 文件下载服务
提供从 GitHub 仓库下载文件的 REST API
"""

import os
import tempfile
import urllib.request
import zipfile
import shutil
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
import uvicorn

app = FastAPI(
    title="GitHub 文件下载服务",
    description="从 GitHub 仓库下载代码文件",
    version="1.0.0"
)

@app.get("/")
async def root():
    """API根路径"""
    return {
        "message": "GitHub 文件下载服务",
        "version": "1.0.0",
        "endpoints": {
            "/download/file": "下载单个文件",
            "/download/directory": "下载整个目录(打包为zip)",
            "/download/repository": "下载整个仓库(打包为zip)",
            "/health": "健康检查"
        }
    }

@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {"status": "ok"}

@app.get("/download/file")
async def download_file(
    owner: str = Query(..., description="仓库所有者"),
    repo: str = Query(..., description="仓库名称"),
    path: str = Query(..., description="文件路径"),
    branch: str = Query("main", description="分支名称")
):
    """
    下载 GitHub 仓库中的单个文件
    
    参数:
    - owner: 仓库所有者
    - repo: 仓库名称
    - path: 文件路径
    - branch: 分支名称(默认为main)
    
    返回:
    - 文件内容
    """
    # 构建GitHub Raw文件URL
    raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
    
    try:
        # 创建临时文件
        temp_dir = tempfile.mkdtemp()
        filename = os.path.basename(path)
        temp_file = os.path.join(temp_dir, filename)
        
        # 下载文件
        urllib.request.urlretrieve(raw_url, temp_file)
        
        # 返回文件
        return FileResponse(
            path=temp_file,
            filename=filename,
            media_type='application/octet-stream'
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"文件下载失败: {str(e)}")

@app.get("/download/directory")
async def download_directory(
    owner: str = Query(..., description="仓库所有者"),
    repo: str = Query(..., description="仓库名称"),
    path: str = Query(..., description="目录路径"),
    branch: str = Query("main", description="分支名称")
):
    """
    下载 GitHub 仓库中的整个目录(打包为zip)
    
    参数:
    - owner: 仓库所有者
    - repo: 仓库名称
    - path: 目录路径
    - branch: 分支名称(默认为main)
    
    返回:
    - ZIP压缩包
    """
    # 构建GitHub API URL获取目录内容
    api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}"
    
    try:
        # 创建临时目录
        temp_dir = tempfile.mkdtemp()
        zip_filename = f"{os.path.basename(path)}.zip"
        zip_path = os.path.join(temp_dir, zip_filename)
        
        # 下载目录内容并打包
        download_github_directory(owner, repo, path, branch, temp_dir)
        
        # 创建zip文件
        shutil.make_archive(zip_path.replace('.zip', ''), 'zip', temp_dir, path)
        
        # 返回zip文件
        return FileResponse(
            path=zip_path,
            filename=zip_filename,
            media_type='application/zip'
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"目录下载失败: {str(e)}")

@app.get("/download/repository")
async def download_repository(
    owner: str = Query(..., description="仓库所有者"),
    repo: str = Query(..., description="仓库名称"),
    branch: str = Query("main", description="分支名称")
):
    """
    下载整个 GitHub 仓库(打包为zip)
    
    参数:
    - owner: 仓库所有者
    - repo: 仓库名称
    - branch: 分支名称(默认为main)
    
    返回:
    - ZIP压缩包
    """
    # 构建GitHub仓库下载URL
    download_url = f"https://github.com/{owner}/{repo}/archive/refs/heads/{branch}.zip"
    
    try:
        # 创建临时文件
        temp_dir = tempfile.mkdtemp()
        zip_filename = f"{repo}-{branch}.zip"
        temp_file = os.path.join(temp_dir, zip_filename)
        
        # 下载仓库
        urllib.request.urlretrieve(download_url, temp_file)
        
        # 返回文件
        return FileResponse(
            path=temp_file,
            filename=zip_filename,
            media_type='application/zip'
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"仓库下载失败: {str(e)}")

def download_github_directory(owner: str, repo: str, path: str, branch: str, output_dir: str):
    """
    递归下载GitHub目录内容
    
    参数:
    - owner: 仓库所有者
    - repo: 仓库名称
    - path: 目录路径
    - branch: 分支名称
    - output_dir: 输出目录
    """
    import requests
    
    # 获取目录内容
    api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}"
    response = requests.get(api_url)
    
    if response.status_code != 200:
        raise Exception(f"无法访问GitHub API: {response.status_code}")
    
    contents = response.json()
    
    # 创建本地目录
    local_dir = os.path.join(output_dir, os.path.basename(path))
    os.makedirs(local_dir, exist_ok=True)
    
    for item in contents:
        item_path = os.path.join(local_dir, item['name'])
        
        if item['type'] == 'file':
            # 下载文件
            urllib.request.urlretrieve(item['download_url'], item_path)
        elif item['type'] == 'dir':
            # 递归下载子目录
            download_github_directory(owner, repo, item['path'], branch, local_dir)

if __name__ == "__main__":
    # 运行服务
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )