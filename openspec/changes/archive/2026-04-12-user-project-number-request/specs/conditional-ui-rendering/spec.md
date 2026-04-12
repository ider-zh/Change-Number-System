## ADDED Requirements

### Requirement: 用户界面根据功能开关状态条件渲染申请入口

系统 SHALL 根据从后端获取的功能开关状态，在用户申请界面条件渲染"申请新项目代号"和"申请新编号类型"的入口。

#### Scenario: 开关关闭时隐藏申请入口
- **WHEN** 功能开关 `allow_request_project` 为 `false`
- **THEN** 用户申请界面中不显示"申请新项目代号"的选项或按钮

#### Scenario: 开关开启时显示申请入口
- **WHEN** 功能开关 `allow_request_project` 为 `true`
- **THEN** 用户申请界面中显示"申请新项目代号"的选项或按钮

#### Scenario: 开关关闭时隐藏编号类型申请入口
- **WHEN** 功能开关 `allow_request_number_type` 为 `false`
- **THEN** 用户申请界面中不显示"申请新编号类型"的选项或按钮

#### Scenario: 开关开启时显示编号类型申请入口
- **WHEN** 功能开关 `allow_request_number_type` 为 `true`
- **THEN** 用户申请界面中显示"申请新编号类型"的选项或按钮

### Requirement: 前端缓存功能开关状态

系统 SHALL 将功能开关状态缓存到浏览器 localStorage，以减少API调用并提升用户体验。

#### Scenario: 首次加载时从API获取开关状态
- **WHEN** 用户首次访问申请页面
- **THEN** 前端调用 `GET /api/settings/feature-toggles` 获取开关状态并缓存到 localStorage，键名为 `feature-toggles`

#### Scenario: 后续访问时使用缓存
- **WHEN** 用户再次访问申请页面
- **THEN** 前端从 localStorage 读取缓存的开关状态，仅在缓存过期或缺失时重新请求API

#### Scenario: 缓存过期策略
- **WHEN** 缓存时间超过 5 分钟
- **THEN** 前端重新从API获取最新的开关状态并更新缓存
