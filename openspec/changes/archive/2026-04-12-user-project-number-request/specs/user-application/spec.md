## MODIFIED Requirements

### Requirement: 用户可以申请新增项目代号

系统 SHALL 允许用户提交新的项目代号申请，该申请初始状态为 `pending`，需管理员审核。**此功能受功能开关控制，仅当 `allow_request_project` 为 `true` 时用户可见和可访问。**

#### Scenario: 用户提交新项目代号申请
- **WHEN** 功能开关 `allow_request_project` 为 `true`，用户在下拉框中选择"申请新项目代号"并填写项目代号和名称
- **THEN** 系统调用 `POST /api/projects/request` 提交申请，状态设为 `pending`

#### Scenario: 功能开关关闭时用户无法访问申请入口
- **WHEN** 功能开关 `allow_request_project` 为 `false`
- **THEN** 用户界面中不显示"申请新项目代号"的选项，用户无法提交新项目代号申请

#### Scenario: 用户申请成功后当前用户可用
- **WHEN** 用户申请的项目代号状态仍为 `pending`
- **THEN** 该申请仅对该用户和管理员可见，其他用户不可见
