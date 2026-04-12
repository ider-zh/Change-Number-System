## Why

当前项目缺乏容器化部署和自动化 CI/CD 流程。每次部署都需要手动构建、配置环境，效率低下且容易出错。通过 Docker 容器化和 GitHub Actions 自动化构建，可以实现：
- 一键部署，降低运维成本
- 环境一致性，避免"在我机器上能运行"的问题
- 自动化构建和发布 Docker 镜像，提高发布效率

## What Changes

- 添加多阶段 Dockerfile，优化镜像大小和构建速度
- 创建 docker-compose.yml，支持一键启动前后端服务
- 配置 GitHub Actions Workflow，实现推送自动构建和发布 Docker 镜像
- 提供一键构建和推送脚本，简化本地开发流程

## Capabilities

### New Capabilities
- `docker-build`: 多阶段 Dockerfile 构建配置，支持前后端一体化部署
- `docker-compose`: Docker Compose 编排配置，包含后端 API、前端服务和数据库
- `github-workflow`: GitHub Actions CI/CD 流程，自动构建、测试和发布 Docker 镜像
- `docker-scripts`: 本地构建和推送 Docker 镜像的自动化脚本

### Modified Capabilities
<!-- 无现有能力需要修改 -->

## Impact

- 新增 `Dockerfile`（多阶段构建）
- 新增 `docker-compose.yml` 及相关配置
- 新增 `.github/workflows/` 目录及 CI/CD 配置
- 新增 `scripts/docker/` 目录及自动化脚本
- 需要配置 GitHub Secrets（DOCKER_USERNAME、DOCKER_PASSWORD 等）
- 不影响现有代码逻辑和 API
