# 自动取号系统

基于 React、Express 和 SQLite 的编号申请与管理系统，覆盖变更编号、技术文件编号、申请记录及管理员审核。

## 功能概览

- 申请 CR、DCP、CN 等变更编号，以及 QTD、DHF、SOP、SOFT、BOM、DRW、QST 等技术文件编号。各类别的流水号规则由后端决定，不使用统一的位数或起始值。
- 查询申请记录和变更进度；按项目、编号类型等条件筛选，并导出记录。
- 维护项目代号、编号类型、技术文件关键代号及表单模板；管理员可以审核申请和管理数据。
- 下载 DCP 相关表单，并导入变更进度记录。

## 快速开始

### 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`，以及 npm。
- 一个独立的开发数据库；首次启动时可由后端自动创建。

### 安装与配置

在仓库根目录执行：

~~~bash
npm ci --include=dev
(cd frontend && npm ci --include=dev)
(cd backend && npm ci --include=dev)
cp backend/.env.example backend/.env
~~~

编辑 `backend/.env`，为开发环境设置 `JWT_SECRET`、`ADMIN_PASSWORD`，并确认 `DB_PATH` 指向开发数据库。`.env`、数据库文件及 WAL/SHM 文件不得提交到 Git。

### 启动与访问

~~~bash
npm run dev
~~~

默认从 [http://localhost:3000](http://localhost:3000) 访问前端，后端 API 使用 3001 端口；管理员入口是 [http://localhost:3000/admin/login](http://localhost:3000/admin/login)。也可以分别运行 `npm run dev:frontend` 和 `npm run dev:backend`。

Vite 将 `/api` 和 `/cap` 代理到 `http://localhost:3001`。如果后端使用其他端口，在启动前端时设置 `DEV_BACKEND_TARGET`，例如：

~~~bash
DEV_BACKEND_TARGET=http://127.0.0.1:3002 npm run dev:frontend
~~~

监听地址以 `frontend/vite.config.ts` 和后端 `HOST` 配置为准。使用含真实用户数据的生产副本开发时，应将两端都限制在 `127.0.0.1`。

## 配置与数据

| 变量 | 用途 |
| --- | --- |
| `PORT`、`HOST` | 后端监听端口与地址；未设置时分别为 3001 和 `0.0.0.0`。 |
| `DB_PATH` | 实际使用的 SQLite 文件路径；未设置时为 `backend/data/app.db`。 |
| `JWT_SECRET` | 管理员登录令牌的签名密钥。 |
| `ADMIN_PASSWORD` | 空数据库首次创建 `admin` 账号时使用的密码。已有管理员账号不会因修改此变量而重置密码。 |
| `NODE_ENV` | 控制开发/生产运行行为；不会自动切换数据库。 |
| `DEV_BACKEND_TARGET` | Vite 开发代理的后端地址，默认 `http://localhost:3001`。 |

SQLite 使用 WAL 模式。开发和生产数据库由 `DB_PATH` 区分，Git 分支或 `NODE_ENV` 不能代替数据库路径检查。当前生产实例的数据库位置、备份与恢复要求见 [DEPLOY.md](DEPLOY.md)。

## 项目结构

| 路径 | 内容 |
| --- | --- |
| `frontend/` | React 19、TypeScript、Vite 前端与组件测试。 |
| `backend/` | Express API、SQLite 数据访问与后端测试。 |
| `backend/src/routes/` | API 路由定义。 |
| `scripts/docker/` | 镜像构建和推送脚本。 |
| `.github/workflows/docker.yml` | CI 测试及镜像构建流程。 |
| [DEPLOY.md](DEPLOY.md) | 当前生产部署与发布前备份流程。 |

## 检查命令

| 命令 | 用途 |
| --- | --- |
| `npm run test:backend` | 运行后端 Jest 测试。 |
| `cd frontend && npm test -- --run` | 单次运行前端 Vitest 测试；`npm run test:frontend` 会进入监听模式。 |
| `cd frontend && npm run lint` | 检查前端代码。 |
| `npm run build:frontend` | 类型检查并构建前端。 |

## API 入口

| 路径 | 主要用途 |
| --- | --- |
| `GET /api/health` | 健康检查。 |
| `/api/applications` | 编号申请、记录查询、统计和管理员导出。 |
| `/api/projects`、`/api/number-types` | 项目代号和编号类型。 |
| `/api/technical-documents` | 技术文件关键代号与相关管理接口。 |
| `/api/change-progress` | 变更进度查询与导入导出。 |
| `/api/admin` | 登录、登出和密码管理。 |

各接口的 HTTP 方法及权限要求以 [后端路由](backend/src/routes) 为准。

## 部署

当前生产服务使用仓库外的 Docker Compose 配置，详见 [DEPLOY.md](DEPLOY.md)。仓库内的 `docker-compose.yml` 和 `docker-compose.prod.yml` 都以生产模式运行，并使用相同的容器名与数据卷；不要把它们当成彼此隔离的开发、生产实例。

推送到 `main`、推送标签、发布版本或手动触发时，GitHub Actions 会运行检查并构建镜像。配置项为 Actions Variables `DOCKER_REGISTRY`、`DOCKER_IMAGE_NAME`，以及 Secrets `ALIYUN_CR_USERNAME`、`ALIYUN_CR_PASSWORD`。镜像构建完成不等于生产部署；更新容器前必须按 [DEPLOY.md](DEPLOY.md) 生成并校验生产数据库的 SQLite 一致性备份。

## License

ISC
