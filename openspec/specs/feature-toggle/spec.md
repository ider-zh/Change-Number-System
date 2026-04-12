## ADDED Requirements

### Requirement: 系统可以存储和管理功能开关状态

系统 SHALL 在数据库中存储功能开关状态，并提供接口供管理员查询和更新。

#### Scenario: 初始化功能开关
- **WHEN** 系统首次初始化
- **THEN** 数据库中创建 `system_settings` 表，并插入默认记录，`allow_request_project` 和 `allow_request_number_type` 均为 `false`

#### Scenario: 管理员查询功能开关状态
- **WHEN** 调用 `GET /api/settings/feature-toggles`
- **THEN** 系统返回当前所有功能开关的状态，包括 `allow_request_project` 和 `allow_request_number_type` 的布尔值

#### Scenario: 管理员更新功能开关状态
- **WHEN** 管理员调用 `PUT /api/settings/feature-toggles` 并提供 `{ "allow_request_project": true }`
- **THEN** 系统更新数据库中对应的值为 `true` 并返回更新后的完整开关状态

#### Scenario: 非管理员尝试更新功能开关
- **WHEN** 非管理员用户调用 `PUT /api/settings/feature-toggles`
- **THEN** 系统返回 403 Forbidden 错误，拒绝更新

### Requirement: 功能开关的键名和默认值规范

系统 SHALL 使用固定的键名标识功能开关，并确保默认值为关闭状态。

#### Scenario: 开关键名规范
- **WHEN** 系统初始化或查询功能开关
- **THEN** 开关键名必须为 `allow_request_project`（允许申请新项目）和 `allow_request_number_type`（允许申请新编号类型）

#### Scenario: 默认值为关闭
- **WHEN** 系统首次部署或重置
- **THEN** 两个功能开关的默认值均为 `false`
