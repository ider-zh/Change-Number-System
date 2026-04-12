## MODIFIED Requirements

### Requirement: 用户可以选择项目代号和编号类型

系统 SHALL 从后端 API 获取项目代号和编号类型列表，允许选择状态为 `approved` 或 `pending` 的项目和编号类型（当前用户自己申请的 pending 项目/编号类型对当前用户可见）。

#### Scenario: 加载可用项目列表
- **WHEN** 用户打开申请页面
- **THEN** 系统调用 `GET /api/projects?status=approved,pending` 获取项目列表并填充到下拉框，pending 状态的项目标注"（待审核）"

#### Scenario: 加载可用编号类型列表
- **WHEN** 用户打开申请页面
- **THEN** 系统调用 `GET /api/number-types?status=approved,pending` 获取编号类型列表并填充到下拉框，pending 状态的编号类型标注"（待审核）"

#### Scenario: 用户专属待审核项目可见且可用
- **WHEN** 用户曾经申请过新增项目代号且状态为 `pending`
- **THEN** 该用户可以在下拉列表中看到并选择自己申请的待审核项目

#### Scenario: 用户专属待审核编号类型可见且可用
- **WHEN** 用户曾经申请过新增编号类型且状态为 `pending`
- **THEN** 该用户可以在下拉列表中看到并选择自己申请的待审核编号类型

### Requirement: 用户提交编号申请时自动生成编号

系统 SHALL 允许用户使用状态为 `approved` 或 `pending` 的项目代号和编号类型提交申请，生成对应编号。

#### Scenario: 使用待审核项目提交申请
- **WHEN** 用户使用状态为 `pending` 的项目代号提交申请
- **THEN** 系统正常生成编号并返回完整编号，不拒绝请求

#### Scenario: 使用待审核编号类型提交申请
- **WHEN** 用户使用状态为 `pending` 的编号类型提交申请
- **THEN** 系统正常生成编号并返回完整编号，不拒绝请求

#### Scenario: 使用已拒绝项目提交申请被拒绝
- **WHEN** 用户使用状态为 `rejected` 的项目代号提交申请
- **THEN** 系统拒绝提交并提示"该项目代号未通过审核，无法提交申请"

#### Scenario: 使用已拒绝编号类型提交申请被拒绝
- **WHEN** 用户使用状态为 `rejected` 的编号类型提交申请
- **THEN** 系统拒绝提交并提示"该编号类型未通过审核，无法提交申请"
