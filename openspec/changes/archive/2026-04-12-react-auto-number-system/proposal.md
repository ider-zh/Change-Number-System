## Why

当前的自动取号系统是一个纯前端静态页面应用,使用 localStorage 存储数据,存在以下严重问题:

1. **数据孤岛**: 每个用户的数据仅存储在本地浏览器,无法实现跨设备、跨用户的数据共享
2. **无后端验证**: 所有逻辑在前端执行,缺乏服务端级别的安全控制和数据校验
3. **功能受限**: 无法支持多用户协作、管理员审核、数据筛选导出等企业级需求
4. **数据持久化弱**: 浏览器缓存清除后数据丢失,无数据库级别的持久化保障

需要将其升级为 React 全栈应用,使用 SQLite (WAL 模式) 作为数据库,实现完整的用户管理、项目代号管理、编号类型管理和管理员审核机制。

## What Changes

- **前端重构**: 从原生 HTML/CSS/JS 迁移到 React 18 + TypeScript + Vite 技术栈
- **后端开发**: 新增 Node.js + Express 后端 API 服务,实现完整的 RESTful API
- **数据库集成**: 引入 SQLite (WAL 模式) 替代 localStorage,实现持久化存储
- **用户系统**: 新增浏览器级别的用户信息缓存机制,申请人信息由用户填写并本地缓存
- **项目代号管理**: 项目代号和编号类型改为数据库预设,用户可选择或申请新增
- **审核机制**: 新增管理员审核流程,用户新增的项目代号和编号类型需审核通过后才全员可见
- **数据管理**: 管理员可查看申请详情(含申请IP、申请人类型等)、筛选、批量删除、导出CSV
- **权限控制**: 细化权限,敏感字段(如申请IP)仅管理员可见

## Capabilities

### New Capabilities

- `user-application`: 用户申请编号功能,包含申请人信息填写、浏览器缓存、项目代号选择
- `project-code-management`: 项目代号和编号类型的数据库预设、增删改查(管理员)、用户申请新增
- `admin-review`: 管理员审核用户提交的项目代号和编号类型申请,审核通过后全员可见
- `application-records`: 申请记录管理,包含申请时间、IP、类型、项目代号、已申请编号等字段
- `admin-data-export`: 管理员数据导出功能,支持筛选、批量删除、单条删除、CSV导出
- `ip-tracking`: 申请时自动记录IP地址,仅管理员可见

### Modified Capabilities

<!-- 无现有规格需要修改,这是全新系统 -->

## Impact

- **受影响代码**: 全部前端代码(app.js, index.html, styles.css)需要重写为 React 组件
- **新增依赖**: React 18, TypeScript, Express, SQLite3, better-sqlite3, Vite, Axios
- **新增系统**: Node.js 后端服务,SQLite 数据库,WAL 模式配置
- **数据迁移**: 现有 localStorage 数据可选择性迁移或忽略(因是全新系统)
- **API 设计**: 需要设计完整的 RESTful API 路由、认证机制、数据验证
