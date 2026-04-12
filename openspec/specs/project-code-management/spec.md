## ADDED Requirements

### Requirement: 系统预设项目代号和编号类型

系统 SHALL 在初始化时预设基础的项目代号和编号类型数据到数据库中,状态为 `approved`,全员可见。

#### Scenario: 数据库初始化预设数据
- **WHEN** 系统首次启动并执行数据库迁移
- **THEN** 系统插入预设的项目代号 (如 ALPHA01, BETA88, NOVA02) 和编号类型 (CR, DCP, CN)

#### Scenario: 预设数据全员可见
- **WHEN** 任何用户查询项目或编号类型列表
- **THEN** 预设的数据状态为 `approved`,对所有用户可见

### Requirement: 管理员可以增删改查项目代号

系统 SHALL 提供完整的 CRUD API 供管理员管理项目代号。

#### Scenario: 管理员创建新项目代号
- **WHEN** 管理员调用 `POST /api/projects` 并提供项目代号和名称
- **THEN** 系统创建项目,状态设为 `approved`,立即全员可见

#### Scenario: 管理员修改项目代号
- **WHEN** 管理员调用 `PUT /api/projects/:id` 更新项目信息
- **THEN** 系统更新项目数据并返回更新后的结果

#### Scenario: 管理员删除项目代号
- **WHEN** 管理员调用 `DELETE /api/projects/:id`
- **THEN** 系统删除项目,若存在关联的申请记录则拒绝删除并提示错误

#### Scenario: 管理员查询项目列表
- **WHEN** 管理员调用 `GET /api/projects`
- **THEN** 系统返回所有项目,包括 `approved`, `pending`, `rejected` 状态

### Requirement: 管理员可以增删改查编号类型

系统 SHALL 提供完整的 CRUD API 供管理员管理编号类型。

#### Scenario: 管理员创建新编号类型
- **WHEN** 管理员调用 `POST /api/number-types` 并提供类型代码、名称和描述
- **THEN** 系统创建编号类型,状态设为 `approved`,立即全员可见

#### Scenario: 管理员修改编号类型
- **WHEN** 管理员调用 `PUT /api/number-types/:id` 更新编号类型信息
- **THEN** 系统更新编号类型数据并返回更新后的结果

#### Scenario: 管理员删除编号类型
- **WHEN** 管理员调用 `DELETE /api/number-types/:id`
- **THEN** 系统删除编号类型,若存在关联的申请记录则拒绝删除并提示错误

#### Scenario: 管理员查询编号类型列表
- **WHEN** 管理员调用 `GET /api/number-types`
- **THEN** 系统返回所有编号类型,包括 `approved`, `pending`, `rejected` 状态

### Requirement: 项目代号唯一性约束

系统 SHALL 确保项目代号 (`code`) 和编号类型代码 (`type_code`) 在数据库中唯一。

#### Scenario: 重复项目代号拦截
- **WHEN** 尝试插入已存在的项目代号
- **THEN** 系统返回 409 Conflict 错误并提示"项目代号已存在"

#### Scenario: 重复编号类型代码拦截
- **WHEN** 尝试插入已存在的编号类型代码
- **THEN** 系统返回 409 Conflict 错误并提示"编号类型代码已存在"

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
