## 1. Dockerfile 创建

- [x] 1.1 创建多阶段 Dockerfile，包含前端构建阶段和后端生产阶段
- [x] 1.2 配置 Alpine 基础镜像和非 root 用户 (appuser)
- [x] 1.3 配置生产依赖安装和前端构建产物复制
- [x] 1.4 添加 HEALTHCHECK 指令和端口暴露
- [x] 1.5 创建 `.dockerignore` 文件排除不必要的文件

## 2. Docker Compose 配置

- [x] 2.1 创建 `docker-compose.yml` 文件，定义应用服务
- [x] 2.2 配置 SQLite 数据卷持久化映射
- [x] 2.3 配置环境变量加载和端口映射 (3000:3001)
- [x] 2.4 设置自动重启策略 (unless-stopped)
- [x] 2.5 创建 `.env.example` 文件作为配置模板

## 3. GitHub Actions Workflow

- [x] 3.1 创建 `.github/workflows/docker.yml` 工作流文件
- [x] 3.2 配置触发条件 (push 到所有分支，PR 到 main)
- [x] 3.3 添加 lint 和测试 Job，失败时阻止构建
- [x] 3.4 配置 Docker 构建和推送 Job，支持 Git SHA 标签
- [x] 3.5 配置 main 分支合并时推送 latest 标签
- [x] 3.6 配置 release 标签 (v*) 推送和版本标签
- [x] 3.7 添加多平台构建支持 (linux/amd64, linux/arm64)

## 4. 本地构建和推送脚本

- [x] 4.1 创建 `scripts/docker/` 目录结构
- [x] 4.2 编写 `build.sh` 脚本，支持自定义标签构建
- [x] 4.3 编写 `login.sh` 脚本，实现交互式 Docker Hub 登录
- [x] 4.4 编写 `push.sh` 脚本，推送指定标签的镜像
- [x] 4.5 编写 `build-and-push.sh` 脚本，组合构建和推送
- [x] 4.6 为所有脚本添加错误处理 (set -e) 和 Docker 检查

## 5. 文档更新和测试验证

- [x] 5.1 更新 README.md，添加 Docker 部署说明
- [x] 5.2 本地运行 `docker-compose up -d` 验证应用启动
- [x] 5.3 验证健康检查和数据持久化
- [x] 5.4 验证 GitHub Actions 工作流配置语法
- [x] 5.5 更新 `.gitignore` 排除 Docker 相关临时文件
