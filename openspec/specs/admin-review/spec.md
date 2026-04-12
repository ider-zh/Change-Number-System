## MODIFIED Requirements

### Requirement: 管理员可以在dashboard控制功能开关

系统 SHALL 在管理员Dashboard中提供功能开关控制界面，允许管理员开启或关闭"用户申请新项目代号"和"用户申请新编号类型"功能。

#### Scenario: 管理员查看功能开关状态
- **WHEN** 管理员访问Dashboard的设置或功能控制区域
- **THEN** 系统显示当前功能开关状态，包括 `allow_request_project` 和 `allow_request_number_type` 的开关组件

#### Scenario: 管理员开启申请新项目功能
- **WHEN** 管理员将 `allow_request_project` 开关切换为开启状态
- **THEN** 系统调用 `PUT /api/settings/feature-toggles` 更新状态，数据库中的值更新为 `true`，普通用户界面随后显示"申请新项目代号"入口

#### Scenario: 管理员关闭申请新编号类型功能
- **WHEN** 管理员将 `allow_request_number_type` 开关切换为关闭状态
- **THEN** 系统调用 `PUT /api/settings/feature-toggles` 更新状态，数据库中的值更新为 `false`，普通用户界面随后隐藏"申请新编号类型"入口

#### Scenario: 开关状态变更实时反馈
- **WHEN** 管理员更新功能开关状态
- **THEN** Dashboard显示成功提示，并更新UI反映最新的开关状态
