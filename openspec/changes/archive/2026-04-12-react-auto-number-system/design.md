## Context

当前项目是一个纯前端静态页面应用,使用原生 HTML/CSS/JavaScript 实现自动取号功能。数据存储在浏览器 localStorage 中,管理员通过硬编码的账号密码认证。系统支持 CR、DCP、CN 三种编号类型,编号格式为 `{类型}-{项目代号}-{4位流水号}`。

**技术现状**:
- 前端: 原生 HTML5 + CSS3 + Vanilla JavaScript
- 存储: localStorage (浏览器本地存储)
- 认证: 硬编码管理员账号 (admin/Aa123456)
- 部署: 静态文件,可直接在浏览器打开

**约束条件**:
- 需要保持现有的编号生成规则 (类型-项目代号-流水号)
- 需要兼容现有的 UI 设计风格 (现代蓝色主题)
- 数据库必须使用 SQLite WAL 模式
- 需要支持多用户并发访问

## Goals / Non-Goals

**Goals:**
- 构建完整的 React 18 + TypeScript 前端应用
- 开发 Node.js + Express 后端 RESTful API 服务
- 使用 SQLite (WAL 模式) 实现数据持久化
- 实现用户申请编号的浏览器级别缓存
- 实现项目代号和编号类型的数据库预设与动态管理
- 实现管理员审核机制 (用户新增的项目代号/编号类型需审核)
- 实现申请记录完整字段 (时间、IP、类型、项目代号、已申请编号)
- 实现管理员数据管理功能 (筛选、批量删除、单条删除、CSV导出)
- 实现 IP 地址追踪,仅管理员可见

**Non-Goals:**
- 不包含用户注册/登录系统 (申请人信息前端填写+缓存,不做后端用户体系)
- 不包含复杂的 RBAC 权限系统 (仅区分普通用户和管理员)
- 不包含实时通知/WebSocket 功能
- 不包含数据迁移脚本 (从零开始,不迁移旧数据)
- 不包含 Docker 容器化部署

## Decisions

### 1. 技术栈选择: React + Vite + TypeScript + Express + SQLite

**决策**: 前端使用 React 18 + TypeScript + Vite,后端使用 Express + better-sqlite3

**理由**:
- React + TypeScript 提供类型安全和组件化开发,便于维护
- Vite 提供快速的开发体验和优化的生产构建
- Express 轻量、成熟,适合中小型项目
- better-sqlite3 是同步 SQLite 驱动,性能优于 node-sqlite3,适合单机部署
- WAL (Write-Ahead Logging) 模式提供并发读写能力,避免数据库锁定

**替代方案**:
- Next.js (SSR): 增加复杂度,本项目无需服务端渲染
- Koa/Fastify: Express 生态更成熟,中间件丰富
- PostgreSQL/MySQL: 过度设计,SQLite WAL 足以支持并发需求

### 2. 数据库架构设计

**决策**: 使用 5 张核心表

```sql
-- 项目代号表
projects (id, code, name, status, created_by, created_at, approved_at)

-- 编号类型表
number_types (id, type_code, type_name, description, status, created_by, created_at, approved_at)

-- 申请记录表
applications (id, applicant_name, applicant_type, project_code, number_type, serial_number, full_number, ip_address, created_at)

-- 用户自定义项目代号申请表 (待审核)
project_requests (id, user_id, project_code, project_name, status, created_at, reviewed_at, reviewer_note)

-- 用户自定义编号类型申请表 (待审核)
number_type_requests (id, user_id, type_code, type_name, description, status, created_at, reviewed_at, reviewer_note)
```

**理由**:
- projects 和 number_types 存储已审核通过的预设数据
- applications 记录所有申请,包含 IP 和申请人类型
- project_requests 和 number_type_requests 实现审核流程
- status 字段控制可见性: `approved` (全员可见), `pending` (仅管理员), `rejected`
- created_by 字段追踪创建者,支持用户专属数据

**WAL 模式配置**:
```sql
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
PRAGMA busy_timeout=5000;
```

### 3. 用户身份识别策略

**决策**: 不使用后端用户认证系统,而是通过前端浏览器缓存识别用户

**实现**:
- 用户首次访问时填写基本信息 (姓名/标识),存储在 `localStorage`
- 每次申请时携带该标识作为 `applicant_name`
- 用户新增的项目代号/编号类型通过 `created_by` 字段关联
- 管理员通过独立登录页面认证 (保留现有硬编码方式,后续可扩展)

**理由**:
- 简化架构,避免用户认证系统的复杂度
- 浏览器缓存满足"当前用户可见"的需求
- 管理员审核机制保证数据质量
- 符合需求描述中的"申请人由用户填写,并做浏览器级别的填写缓存"

**替代方案**:
- JWT 用户认证: 增加复杂度,与需求不符
- Session 认证: 需要后端状态管理,增加部署复杂度

### 4. API 设计风格: RESTful + 统一响应格式

**决策**: 使用 RESTful API 设计,统一响应格式:

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "error": null
}
```

**核心路由**:
- `GET /api/projects` - 获取项目列表 (支持 status 过滤)
- `POST /api/projects` - 创建项目 (管理员)
- `POST /api/projects/request` - 申请新项目 (用户)
- `PUT /api/projects/:id/review` - 审核项目 (管理员)
- `GET /api/number-types` - 获取编号类型列表
- `POST /api/number-types` - 创建编号类型 (管理员)
- `POST /api/number-types/request` - 申请新编号类型 (用户)
- `PUT /api/number-types/:id/review` - 审核编号类型 (管理员)
- `POST /api/applications` - 提交申请
- `GET /api/applications` - 获取申请列表 (支持筛选、分页)
- `DELETE /api/applications/:id` - 删除单条申请 (管理员)
- `DELETE /api/applications` - 批量删除申请 (管理员)
- `GET /api/applications/export` - 导出 CSV (管理员)

**理由**:
- RESTful 风格成熟、标准化,易于理解和维护
- 统一响应格式简化前端错误处理
- 分离用户和管理员操作,权限清晰

### 5. IP 地址获取策略

**决策**: 后端通过 `req.ip` 或 `req.headers['x-forwarded-for']` 获取客户端 IP

**实现**:
```javascript
const getClientIP = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  return forwarded ? forwarded.split(',')[0] : req.ip || req.connection.remoteAddress;
};
```

**理由**:
- 兼容直接访问和反向代理场景
- 存储在数据库,仅管理员接口返回
- 前端普通用户界面不展示此字段

### 6. 前端状态管理

**决策**: 使用 React Context + useReducer 进行状态管理,不使用 Redux/Zustand

**理由**:
- 项目规模中等,Context 足够管理全局状态
- 减少外部依赖,降低复杂度
- 需要管理的状态有限: 用户信息、项目列表、申请记录、分页/筛选状态

**状态结构**:
```typescript
interface AppState {
  user: UserInfo | null;           // 当前用户信息 (浏览器缓存)
  projects: Project[];             // 可用项目列表
  numberTypes: NumberType[];       // 可用编号类型列表
  applications: Application[];     // 申请记录列表
  isAdmin: boolean;                // 是否管理员
  filters: FilterOptions;          // 筛选条件
  pagination: PaginationInfo;      // 分页信息
}
```

### 7. 表单验证策略

**决策**: 前端使用 Zod 进行类型验证,后端使用 Express Validator 中间件

**理由**:
- Zod 与 TypeScript 类型系统完美集成
- 前后端双重验证保证数据安全
- Express Validator 成熟稳定,中间件生态完善

### 8. 测试策略

**决策**: 
- 后端: Jest + Supertest (API 集成测试)
- 前端: Vitest + React Testing Library (组件测试)
- 数据库: 使用内存数据库 (`:memory:`) 运行测试

**理由**:
- Jest 是 Node.js 测试的事实标准
- Supertest 简化 HTTP 测试
- Vitest 与 Vite 原生集成,速度快
- 内存数据库避免测试污染,支持并行执行

## Risks / Trade-offs

### [风险] SQLite 并发性能瓶颈
**缓解**: 
- 使用 WAL 模式提升并发读写能力
- 设置合理的 busy_timeout (5秒)
- 对于超大规模场景 (>1000 并发用户),预留迁移到 PostgreSQL 的空间

### [风险] 浏览器缓存丢失
**缓解**:
- 使用 `localStorage` + `sessionStorage` 双重备份
- 提供手动导出/导入用户配置的选项
- 核心数据在服务端有完整记录

### [风险] 硬编码管理员密码安全风险
**缓解**:
- 管理员密码至少进行 bcrypt 哈希存储
- 提供首次启动时生成默认密码的机制
- 后续可扩展为环境变量或配置文件

### [风险] IP 地址隐私合规问题
**缓解**:
- 仅管理员可见,普通用户接口不返回
- 添加数据保护说明
- 支持配置 IP 记录开关

### [权衡] 不做用户认证系统
**影响**: 
- 优点: 简化架构,快速交付
- 缺点: 无法精确追踪用户身份,依赖浏览器缓存
- 后续可扩展为 JWT 或 Session 认证

### [权衡] 使用 better-sqlite3 (同步) 而非 node-sqlite3 (异步)
**影响**:
- 优点: API 简洁,性能优异,代码更易读
- 缺点: 长时间查询会阻塞事件循环
- 缓解: 数据库操作保持简短,复杂查询使用索引
