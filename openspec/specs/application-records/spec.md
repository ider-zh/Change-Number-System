## ADDED Requirements

### Requirement: 申请记录存储完整字段

系统 SHALL 在数据库中存储每条申请记录的完整信息,包括:申请时间、申请IP、申请人类型、项目代号、编号类型、已申请编号。

#### Scenario: 提交申请时记录完整字段
- **WHEN** 用户调用 `POST /api/applications` 提交申请
- **THEN** 系统在 `applications` 表中插入记录,包含 `applicant_name`, `applicant_type`, `project_code`, `number_type`, `serial_number`, `full_number`, `ip_address`, `created_at`

#### Scenario: 申请时间自动生成
- **WHEN** 申请记录创建时
- **THEN** 系统自动设置 `created_at` 为当前服务器时间,格式为 `YYYY-MM-DD HH:mm:ss`

#### Scenario: 申请IP自动记录
- **WHEN** 申请记录创建时
- **THEN** 系统自动从 HTTP 请求中提取客户端 IP 地址并保存到 `ip_address` 字段

### Requirement: 申请记录支持分页查询

系统 SHALL 提供分页查询接口,支持按关键字搜索申请人、项目代号或编号。

#### Scenario: 分页查询申请记录
- **WHEN** 用户调用 `GET /api/applications?page=1&limit=10`
- **THEN** 系统返回第 1 页数据,每页 10 条,并返回总记录数

#### Scenario: 关键字搜索
- **WHEN** 用户调用 `GET /api/applications?keyword=张三`
- **THEN** 系统返回申请人、项目代号或完整编号中包含"张三"的记录

#### Scenario: 按项目过滤
- **WHEN** 用户调用 `GET /api/applications?project_code=ALPHA01`
- **THEN** 系统仅返回项目代号为 ALPHA01 的申请记录

#### Scenario: 按编号类型过滤
- **WHEN** 用户调用 `GET /api/applications?number_type=CR`
- **THEN** 系统仅返回编号类型为 CR 的申请记录

### Requirement: 申请记录按时间倒序排列

系统 SHALL 默认按申请时间 (`created_at`) 倒序返回申请记录,最新的记录排在前面。

#### Scenario: 默认按时间倒序
- **WHEN** 用户调用 `GET /api/applications`
- **THEN** 系统返回的申请记录按 `created_at DESC` 排序

### Requirement: 统计信息接口

系统 SHALL 提供统计信息接口,返回各类编号类型的申请总数。

#### Scenario: 获取统计数据
- **WHEN** 用户调用 `GET /api/applications/stats`
- **THEN** 系统返回 JSON 数据,包含总申请数、CR 申请数、DCP 申请数、CN 申请数等

### Requirement: 用户只能查看自己的申请记录

系统 SHALL 限制普通用户只能查看自己提交的申请记录,管理员可以查看所有用户的申请记录。

#### Scenario: 普通用户查看申请列表
- **WHEN** 普通用户调用 `GET /api/applications`
- **THEN** 系统仅返回该用户 (`applicant_name` 匹配) 的申请记录

#### Scenario: 管理员查看所有申请记录
- **WHEN** 管理员调用 `GET /api/applications?scope=all`
- **THEN** 系统返回所有用户的申请记录,不进行过滤

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
