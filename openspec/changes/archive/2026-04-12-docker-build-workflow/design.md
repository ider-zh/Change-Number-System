## Context

Change-Number-System 是一个前后端分离的 Web 应用，当前通过手动方式部署：
- 前端：React + TypeScript + Vite，构建后为静态文件
- 后端：Node.js + Express + SQLite，需要 Node.js 运行时
- 数据库：SQLite 文件数据库

当前部署流程需要手动安装依赖、构建、配置环境变量，流程繁琐且容易出错。

**约束条件：**
- SQLite 数据文件需要持久化存储
- 前端静态资源需要被正确服务
- 后端需要访问环境变量（JWT_SECRET 等）
- 需要支持开发和生产两种环境

## Goals / Non-Goals

**Goals:**
- 通过 Docker 多阶段构建优化镜像大小（目标 < 200MB）
- docker-compose 一键启动完整应用（前端 + 后端 + 数据库）
- GitHub Actions 自动构建并发布到 Docker Hub
- 提供本地构建和推送脚本，简化开发流程
- 支持健康检查和自动重启

**Non-Goals:**
- 不包含 Kubernetes 部署配置（后续可扩展）
- 不迁移到其他数据库（保持 SQLite）
- 不修改现有业务逻辑和 API
- 不包含蓝绿部署或金丝雀发布

## Decisions

### 1. 多阶段 Dockerfile vs 单阶段
**决策：使用多阶段构建**

- **前端阶段**：使用 `node:20-alpine` 构建静态资源
- **后端阶段**：使用 `node:20-alpine` 安装生产依赖并复制前端构建产物
- **最终镜像**：仅包含运行时必需的文件，显著减小镜像大小

**理由：** Alpine 镜像更小（~50MB vs ~150MB），多阶段构建避免将构建工具打包到最终镜像。

### 2. 单一 Dockerfile vs 前后端分离
**决策：使用单一 Dockerfile，前后端打包到一个镜像**

- 前端构建产物复制到后端 `public/` 目录
- 后端 Express 同时提供 API 和静态文件服务
- 简化部署和编排

**理由：** 减少镜像数量和编排复杂度，适合中小型项目。如需扩展可后续分离。

### 3. SQLite 持久化策略
**决策：通过 Docker Volume 挂载数据目录**

- `./data` 目录映射到容器内 `/app/data`
- 确保容器重启后数据不丢失
- docker-compose 中配置具名 volume

### 4. GitHub Actions Workflow 设计
**决策：单 Workflow 多 Job 并行**

```
push/PR → lint & test → build → publish (仅 main/release)
```

- 使用 `docker/build-push-action` 官方 Action
- 支持多平台构建（linux/amd64, linux/arm64）
- 镜像标签策略：`latest` + Git SHA + 版本号

### 5. 环境变量管理
**决策：docker-compose 使用 .env 文件 + environment 映射**

- 提供 `.env.example` 作为模板
- 敏感信息通过 Docker Secrets 或外部注入（生产环境）
- 开发环境直接使用 `.env` 文件

## Risks / Trade-offs

| 风险/权衡 | 缓解措施 |
|-----------|----------|
| SQLite 并发写入限制 | 使用 WAL 模式（已配置），适用于中小流量场景 |
| 单一镜像无法独立扩展前后端 | 后续可按需拆分为多镜像 + nginx 代理 |
| Docker Hub 速率限制 | 配置 Docker Hub 认证，或使用 GitHub Container Registry |
| 镜像体积增大构建时间 | 使用 Alpine 基础镜像 + 多阶段构建 + 层缓存优化 |
| GitHub Secrets 泄露风险 | 最小权限原则，使用 OIDC 认证（可选） |

## Migration Plan

### 部署步骤
1. 创建 Dockerfile 和 docker-compose.yml
2. 配置 GitHub Secrets（DOCKER_USERNAME, DOCKER_PASSWORD）
3. 推送代码触发首次自动构建
4. 服务器拉取镜像并启动：`docker-compose up -d`

### 回滚策略
- 保留旧版本镜像标签（Git SHA）
- 回滚命令：`docker-compose pull <tag> && docker-compose up -d`

## Open Questions

- 是否使用 GitHub Container Registry (ghcr.io) 替代 Docker Hub？
- 是否需要添加健康检查端点到后端 API？
- 生产环境是否需要自动扩容支持？
