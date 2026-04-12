## ADDED Requirements

### Requirement: 管理员可以查看待审核的项目代号和编号类型申请

系统 SHALL 提供接口供管理员查询所有状态为 `pending` 的项目代号和编号类型申请。

#### Scenario: 查询待审核项目申请
- **WHEN** 管理员调用 `GET /api/projects?status=pending`
- **THEN** 系统返回所有待审核的项目申请列表

#### Scenario: 查询待审核编号类型申请
- **WHEN** 管理员调用 `GET /api/number-types?status=pending`
- **THEN** 系统返回所有待审核的编号类型申请列表

### Requirement: 管理员可以审核通过或拒绝申请

系统 SHALL 允许管理员对项目代号和编号类型申请执行审核操作,审核后可选择通过或拒绝。

#### Scenario: 审核通过项目申请
- **WHEN** 管理员调用 `PUT /api/projects/:id/review` 并设置 `status: approved`
- **THEN** 系统更新项目状态为 `approved`,设置 `approved_at` 时间戳,该项目全员可见

#### Scenario: 审核拒绝项目申请
- **WHEN** 管理员调用 `PUT /api/projects/:id/review` 并设置 `status: rejected`
- **THEN** 系统更新项目状态为 `rejected`,该项目仅创建者和管理员可见

#### Scenario: 审核通过编号类型申请
- **WHEN** 管理员调用 `PUT /api/number-types/:id/review` 并设置 `status: approved`
- **THEN** 系统更新编号类型状态为 `approved`,设置 `approved_at` 时间戳,该编号类型全员可见

#### Scenario: 审核拒绝编号类型申请
- **WHEN** 管理员调用 `PUT /api/number-types/:id/review` 并设置 `status: rejected`
- **THEN** 系统更新编号类型状态为 `rejected`,该编号类型仅创建者和管理员可见

### Requirement: 审核后的数据对用户可见性

系统 SHALL 根据审核结果控制数据的可见性。审核通过的数据对所有用户可见,审核拒绝的仅对创建者和管理员可见。

#### Scenario: 用户查看审核通过的项目
- **WHEN** 普通用户调用 `GET /api/projects?status=approved`
- **THEN** 系统返回所有状态为 `approved` 的项目,包括预设的和用户申请通过的

#### Scenario: 用户无法查看其他用户的待审核申请
- **WHEN** 普通用户 A 调用 `GET /api/projects`
- **THEN** 系统仅返回用户 A 自己创建的待审核申请,不返回其他用户的待审核申请

#### Scenario: 管理员可查看所有状态的申请
- **WHEN** 管理员调用 `GET /api/projects?status=all`
- **THEN** 系统返回所有状态的申请,包括 `approved`, `pending`, `rejected`

### Requirement: 管理员可以添加审核备注

系统 SHALL 允许管理员在审核时添加备注信息,说明审核决定。

#### Scenario: 审核时添加备注
- **WHEN** 管理员调用审核接口并提供 `reviewer_note` 字段
- **THEN** 系统将备注保存到数据库并可在后续查询时返回
