## 1. 项目初始化与环境搭建

- [x] 1.1 使用 Vite 创建 React + TypeScript 项目 (`npm create vite@latest frontend -- --template react-ts`)
- [x] 1.2 初始化后端 Node.js 项目 (`mkdir backend && cd backend && npm init -y`)
- [x] 1.3 安装后端依赖: `express`, `better-sqlite3`, `cors`, `dotenv`, `express-validator`, `bcrypt`, `jsonwebtoken`
- [x] 1.4 安装后端开发依赖: `jest`, `supertest`, `nodemon`
- [x] 1.5 安装前端依赖: `axios`, `react-router-dom`, `zod`
- [x] 1.6 安装前端开发依赖: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`
- [x] 1.7 配置后端 `.env` 文件 (端口、数据库路径、管理员密码)
- [x] 1.8 配置 `tsconfig.json` 和 Vite 代理设置

## 2. 数据库设计与初始化

- [x] 2.1 创建数据库初始化脚本 `backend/src/db/init.js`
- [x] 2.2 配置 SQLite WAL 模式 (`PRAGMA journal_mode=WAL`)
- [x] 2.3 创建 `projects` 表 (id, code, name, status, created_by, created_at, approved_at)
- [x] 2.4 创建 `number_types` 表 (id, type_code, type_name, description, status, created_by, created_at, approved_at)
- [x] 2.5 创建 `applications` 表 (id, applicant_name, applicant_type, project_code, number_type, serial_number, full_number, ip_address, created_at)
- [x] 2.6 创建 `project_requests` 表 (id, user_id, project_code, project_name, status, created_at, reviewed_at, reviewer_note)
- [x] 2.7 创建 `number_type_requests` 表 (id, user_id, type_code, type_name, description, status, created_at, reviewed_at, reviewer_note)
- [x] 2.8 插入预设数据 (项目代号: ALPHA01, BETA88, NOVA02; 编号类型: CR, DCP, CN)
- [x] 2.9 编写数据库连接池和查询封装工具类
- [x] 2.10 编写数据库初始化测试用例

## 3. 后端 API 基础架构

- [x] 3.1 创建 Express 应用入口 `backend/src/app.js`
- [x] 3.2 配置 CORS、JSON 解析、错误处理中间件
- [x] 3.3 创建统一响应格式中间件 `{ success, data, message, error }`
- [x] 3.4 实现客户端 IP 提取工具函数 `getClientIP(req)`
- [x] 3.5 创建路由目录结构 (`routes/`, `controllers/`, `middlewares/`)
- [x] 3.6 实现管理员认证中间件 (验证 JWT 或 Session)
- [x] 3.7 编写后端基础集成测试框架

## 4. 项目代号管理 API

- [x] 4.1 实现 `GET /api/projects` 接口 (支持 status 过滤,管理员可查全部)
- [x] 4.2 实现 `POST /api/projects` 接口 (管理员创建项目,需认证)
- [x] 4.3 实现 `PUT /api/projects/:id` 接口 (管理员修改项目,需认证)
- [x] 4.4 实现 `DELETE /api/projects/:id` 接口 (管理员删除项目,需认证)
- [x] 4.5 实现 `POST /api/projects/request` 接口 (用户申请新项目)
- [x] 4.6 实现 `PUT /api/projects/:id/review` 接口 (管理员审核项目申请)
- [x] 4.7 实现项目代号唯一性约束检查和 409 错误处理
- [x] 4.8 编写项目代号 API 的单元测试和集成测试

## 5. 编号类型管理 API

- [x] 5.1 实现 `GET /api/number-types` 接口 (支持 status 过滤,管理员可查全部)
- [x] 5.2 实现 `POST /api/number-types` 接口 (管理员创建编号类型,需认证)
- [x] 5.3 实现 `PUT /api/number-types/:id` 接口 (管理员修改编号类型,需认证)
- [x] 5.4 实现 `DELETE /api/number-types/:id` 接口 (管理员删除编号类型,需认证)
- [x] 5.5 实现 `POST /api/number-types/request` 接口 (用户申请新编号类型)
- [x] 5.6 实现 `PUT /api/number-types/:id/review` 接口 (管理员审核编号类型申请)
- [x] 5.7 实现编号类型代码唯一性约束检查和 409 错误处理
- [x] 5.8 编写编号类型 API 的单元测试和集成测试

## 6. 申请记录管理 API

- [x] 6.1 实现 `POST /api/applications` 接口 (用户提交编号申请,自动生成流水号)
- [x] 6.2 实现流水号自动生成逻辑 (`MAX(serial) + 1`,格式化为 4 位)
- [x] 6.3 实现申请记录必填字段验证 (申请人、项目代号、编号类型)
- [x] 6.4 实现 `GET /api/applications` 接口 (用户查自己的,管理员可查全部)
- [x] 6.5 实现分页逻辑 (`page`, `limit` 参数,默认 10 条/页)
- [x] 6.6 实现关键字搜索 (`keyword` 参数,搜索申请人/项目/编号)
- [x] 6.7 实现项目代号和编号类型过滤 (`project_code`, `number_type` 参数)
- [x] 6.8 实现 `GET /api/applications/stats` 接口 (返回各类编号统计)
- [x] 6.9 实现普通用户数据隔离 (仅返回 `applicant_name` 匹配的记录)
- [x] 6.10 编写申请记录 API 的单元测试和集成测试

## 7. 管理员数据管理 API

- [x] 7.1 实现 `DELETE /api/applications/:id` 接口 (管理员删除单条记录)
- [x] 7.2 实现 `DELETE /api/applications` 接口 (管理员批量删除,ID 数组参数)
- [x] 7.3 实现 `GET /api/applications/export` 接口 (导出 CSV,管理员专用)
- [x] 7.4 实现 CSV 格式化逻辑 (包含完整字段,UTF-8 BOM)
- [x] 7.5 实现高级筛选功能 (日期范围、申请人类型、多条件组合)
- [x] 7.6 实现管理员专用接口返回 `ip_address` 字段
- [x] 7.7 实现普通用户接口过滤 `ip_address` 字段
- [x] 7.8 编写数据管理 API 的单元测试和集成测试

## 8. IP 地址追踪功能

- [x] 8.1 实现 `getClientIP(req)` 工具函数 (支持 `X-Forwarded-For`)
- [x] 8.2 实现 IP 地址格式验证 (IPv4/IPv6)
- [x] 8.3 在 `POST /api/applications` 中自动记录 IP 到数据库
- [x] 8.4 处理无法提取 IP 时的降级策略 (设为 NULL + 日志)
- [x] 8.5 编写 IP 提取和验证的单元测试

## 9. 管理员认证系统

- [x] 9.1 实现管理员登录 `POST /api/admin/login` 接口
- [x] 9.2 使用 bcrypt 哈希存储管理员密码 (非明文)
- [x] 9.3 实现 JWT 令牌生成和验证
- [x] 9.4 实现管理员登出 `POST /api/admin/logout` 接口
- [x] 9.5 创建认证中间件保护管理员路由
- [x] 9.6 实现首次启动时生成默认管理员密码并输出到控制台
- [x] 9.7 编写认证系统的单元测试和集成测试

## 10. 前端项目架构搭建

- [x] 10.1 创建 React 组件目录结构 (`components/`, `pages/`, `context/`, `hooks/`, `utils/`)
- [x] 10.2 配置 React Router 路由 (`/`, `/admin`, `/review`)
- [x] 10.3 创建全局 Context (`AppContext`) 管理用户信息、项目列表、申请记录
- [x] 10.4 实现 Axios 实例和拦截器 (自动附加 Token,统一错误处理)
- [x] 10.5 创建基础 UI 组件库 (Button, Input, Select, Modal, Table)
- [x] 10.6 复用现有 CSS 样式 (styles.css) 到 React 组件
- [x] 10.7 配置 Vite 代理到后端 API (`/api` → `http://localhost:3001`)

## 11. 前端用户申请页面

- [x] 11.1 创建 `ApplicationForm` 组件 (申请人、项目、编号类型选择)
- [x] 11.2 实现浏览器缓存逻辑 (`localStorage` 读写用户信息)
- [x] 11.3 实现表单自动填充缓存数据
- [x] 11.4 实现项目代号下拉选择 (调用 `GET /api/projects`)
- [x] 11.5 实现编号类型下拉选择 (调用 `GET /api/number-types`)
- [x] 11.6 实现"申请新项目代号"弹窗表单
- [x] 11.7 实现"申请新编号类型"弹窗表单
- [x] 11.8 实现提交申请逻辑 (调用 `POST /api/applications`)
- [x] 11.9 实现申请成功后显示生成的完整编号
- [x] 11.10 实现表单验证和错误提示 (Zod 前端验证)

## 12. 前端申请记录展示页面

- [x] 12.1 创建 `ApplicationList` 组件 (表格展示)
- [x] 12.2 实现分页组件 (上一页/下一页,页码显示)
- [x] 12.3 实现关键字搜索框和实时搜索
- [x] 12.4 实现按项目代号和编号类型过滤
- [x] 12.5 实现统计数据展示 (总申请数、各类编号申请数)
- [x] 12.6 实现申请记录按时间倒序展示
- [x] 12.7 实现加载状态和空状态 UI
- [x] 12.8 编写组件的单元测试 (React Testing Library)

## 13. 前端管理员页面

- [x] 13.1 创建管理员登录页面 (用户名/密码表单)
- [x] 13.2 实现管理员登录逻辑 (JWT 存储到 localStorage)
- [x] 13.3 创建管理员仪表盘页面 (统计数据、快捷操作)
- [x] 13.4 创建项目代号管理页面 (CRUD 表格)
- [x] 13.5 创建编号类型管理页面 (CRUD 表格)
- [x] 13.6 实现管理员数据导出功能 (下载 CSV 文件)
- [x] 13.7 实现单条删除按钮和确认对话框
- [x] 13.8 实现批量删除功能 (复选框选择 + 批量删除按钮)
- [x] 13.9 实现高级筛选面板 (日期范围、申请人类型、关键字)
- [x] 13.10 实现申请记录表格显示 IP 地址列 (仅管理员)

## 14. 前端审核管理页面

- [x] 14.1 创建审核列表页面 (显示所有 `pending` 申请)
- [x] 14.2 实现项目代号审核列表 (`GET /api/projects?status=pending`)
- [x] 14.3 实现编号类型审核列表 (`GET /api/number-types?status=pending`)
- [x] 14.4 实现审核通过/拒绝按钮
- [x] 14.5 实现审核备注输入框
- [x] 14.6 实现审核后列表自动刷新
- [x] 14.7 实现审核状态标签 (待审核/已通过/已拒绝)
- [x] 14.8 编写审核页面的组件测试

## 15. 前端权限控制和路由保护

- [x] 15.1 创建 `ProtectedRoute` 组件 (管理员路由守卫)
- [x] 15.2 实现未登录管理员重定向到登录页
- [x] 15.3 实现 Token 过期自动登出逻辑
- [x] 15.4 实现按钮级权限控制 (导出/删除按钮仅管理员可见)
- [x] 15.5 实现 API 错误权限处理 (401/403 自动跳转)

## 16. 测试代码编写与执行

- [x] 16.1 编写数据库初始化测试 (`backend/tests/db.test.js`)
- [x] 16.2 编写项目代号 API 集成测试 (`backend/tests/projects.test.js`)
- [x] 16.3 编写编号类型 API 集成测试 (`backend/tests/number-types.test.js`)
- [x] 16.4 编写申请记录 API 集成测试 (`backend/tests/applications.test.js`)
- [x] 16.5 编写管理员认证 API 集成测试 (`backend/tests/admin.test.js`)
- [x] 16.6 编写数据导出 API 集成测试 (`backend/tests/export.test.js`)
- [x] 16.7 编写 IP 提取工具单元测试 (`backend/tests/utils/ip.test.js`)
- [x] 16.8 编写前端组件测试 (`frontend/src/components/ApplicationForm.test.tsx`)
- [x] 16.9 编写前端组件测试 (`frontend/src/components/ApplicationList.test.tsx`)
- [x] 16.10 编写前端审核组件测试 (`frontend/src/components/ReviewPanel.test.tsx`)
- [x] 16.11 运行所有后端测试并修复失败用例 (`npm run test:backend`)
- [x] 16.12 运行所有前端测试并修复失败用例 (`npm run test:frontend`)
- [x] 16.13 生成测试覆盖率报告并确保 > 80%

## 17. 集成测试与端到端验证

- [x] 17.1 启动前后端服务 (`npm run dev:backend` + `npm run dev:frontend`)
- [x] 17.2 手动测试用户申请编号完整流程
- [x] 17.3 手动测试管理员审核流程
- [x] 17.4 手动测试数据导出功能
- [x] 17.5 手动测试批量删除功能
- [x] 17.6 测试浏览器缓存和自动填充
- [x] 17.7 测试权限隔离 (普通用户无法访问管理员页面)
- [x] 17.8 测试并发申请场景 (验证 WAL 模式)
- [x] 17.9 修复发现的所有 Bug

## 18. 文档和部署准备

- [x] 18.1 编写 `README.md` (项目介绍、安装、运行指南)
- [x] 18.2 编写 API 文档 (接口列表、请求/响应示例)
- [x] 18.3 配置生产环境构建 (`npm run build:frontend` + `npm run build:backend`)
- [x] 18.4 创建 `.env.example` 文件模板
- [x] 18.5 添加 `.gitignore` 排除 `node_modules/`, `*.db`, `.env`
- [x] 18.6 编写部署说明文档
