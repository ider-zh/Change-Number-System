## Context

当前系统已有完整的用户申请项目和编号类型功能，包括：
- 用户端：`ApplicationForm.tsx` 组件处理申请流程
- 管理端：`AdminDashboard.tsx` 提供管理界面
- 数据库：已有 `projects`, `number_types`, `project_requests`, `number_type_requests` 等表
- 权限：基于JWT的二元管理员制度（admin vs 非admin）

当前问题：用户申请新项目和申请新编号类型的功能始终可用，管理员无法根据需要关闭这些功能。

约束条件：
- 不能破坏现有的申请流程
- 功能开关必须持久化存储
- 默认状态为关闭

## Goals / Non-Goals

**Goals:**
- 为管理员提供可控的功能开关机制
- 开关状态实时影响普通用户界面的显示
- 默认关闭，管理员主动开启后才对用户可见
- 最小化对现有代码的侵入

**Non-Goals:**
- 不实现复杂的权限系统（保持现有二元管理员制度）
- 不做细粒度的用户级别控制（只控制全局开关）
- 不改变现有的申请审核流程
- 不做时间计划或定时开关功能

## Decisions

### 1. 功能开关存储方案

**Decision**: 在数据库中新增 `system_settings` 表存储功能开关状态

**Rationale**: 
- 已有SQLite数据库，增加表是最自然的选择
- 支持运行时动态修改，无需重启服务
- 比环境变量更灵活，比配置文件更易管理

**Alternatives considered**:
- ~~环境变量~~：需要重启服务，不够灵活
- ~~JSON配置文件~~：与现有数据库架构不一致，增加同步复杂度

### 2. API设计

**Decision**: 新增 `/api/settings/feature-toggles` 端点

**Endpoints**:
- `GET /api/settings/feature-toggles` - 获取所有开关状态（公开，前端需要根据此接口渲染UI）
- `PUT /api/settings/feature-toggles` - 更新开关状态（需管理员权限）

**Rationale**: RESTful设计，与现有API风格一致

### 3. 前端实现策略

**Decision**: 在组件层面根据API返回的开关状态条件渲染UI

**Implementation**:
- 在 `ApplicationForm.tsx` 中加载开关状态
- 使用状态变量控制"申请新项目代号"和"申请新编号类型"UI的显示
- 缓存开关状态到localStorage，减少API调用

**Rationale**: 
- 最小化对现有代码的修改
- 用户友好的即时响应
- 缓存策略提升性能

**Alternatives considered**:
- ~~路由级别控制~~：过度设计，不够灵活
- ~~全局状态管理~~：增加复杂度，当前场景不需要

### 4. 默认值策略

**Decision**: 数据库初始化时，两个开关默认值为 `false`（关闭）

**Rationale**: 符合安全默认值原则，管理员需主动开启功能

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| 开关状态变更时已打开页面的用户可能看到不一致的UI | 前端在提交申请时再次校验开关状态，后端也做验证 |
| 增加API调用可能影响页面加载性能 | 使用localStorage缓存开关状态，减少不必要的API调用 |
| 数据库表增加可能影响现有功能 | 使用迁移脚本，仅在表不存在时创建 |
| 管理员误关闭功能可能影响用户体验 | 在Dashboard中添加明确的提示信息说明开关作用 |

## Migration Plan

### 部署步骤
1. 后端执行数据库迁移脚本，创建 `system_settings` 表
2. 插入默认的功能开关记录（默认关闭）
3. 部署后端新代码（包含新的API端点）
4. 部署前端新代码（包含条件渲染逻辑）
5. 验证功能正常工作

### 回滚策略
- 数据库：保留 `system_settings` 表，回滚代码后功能开关不影响现有功能
- 代码：可以安全回滚到之前的版本，新表不影响旧代码运行
- 前端：回滚后用户将始终看到申请入口（旧行为）

## Open Questions

无重大开放问题，设计已覆盖所有关键决策点。
