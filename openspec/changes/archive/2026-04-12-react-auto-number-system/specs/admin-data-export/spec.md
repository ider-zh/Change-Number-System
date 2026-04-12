## ADDED Requirements

### Requirement: 管理员可以导出申请记录为 CSV

系统 SHALL 提供 CSV 导出接口,管理员可以导出筛选后的申请记录数据。

#### Scenario: 导出全部申请记录
- **WHEN** 管理员调用 `GET /api/applications/export`
- **THEN** 系统返回 CSV 文件,包含所有申请记录的完整字段

#### Scenario: 导出筛选后的申请记录
- **WHEN** 管理员调用 `GET /api/applications/export?project_code=ALPHA01&number_type=CR`
- **THEN** 系统返回 CSV 文件,仅包含项目代号为 ALPHA01 且编号类型为 CR 的记录

#### Scenario: CSV 文件包含完整字段
- **WHEN** 管理员下载导出的 CSV 文件
- **THEN** 文件包含列: 申请时间、申请人、申请人类型、项目代号、编号类型、已申请编号

### Requirement: 管理员可以删除单条申请记录

系统 SHALL 提供删除单条申请记录的接口,删除后数据不可恢复。

#### Scenario: 成功删除单条记录
- **WHEN** 管理员调用 `DELETE /api/applications/:id`
- **THEN** 系统从数据库中删除该记录并返回成功消息

#### Scenario: 删除不存在的记录
- **WHEN** 管理员调用 `DELETE /api/applications/:id` 但该 ID 不存在
- **THEN** 系统返回 404 错误并提示"记录不存在"

### Requirement: 管理员可以批量删除申请记录

系统 SHALL 提供批量删除接口,管理员可以一次性删除多条申请记录。

#### Scenario: 批量删除成功
- **WHEN** 管理员调用 `DELETE /api/applications` 并提供 ID 数组 `["id1", "id2", "id3"]`
- **THEN** 系统删除所有指定记录并返回删除数量

#### Scenario: 批量删除部分记录不存在
- **WHEN** 管理员调用批量删除接口,部分 ID 不存在
- **THEN** 系统删除存在的记录,返回成功删除的数量和失败的数量

#### Scenario: 批量删除空数组
- **WHEN** 管理员调用批量删除接口并提供空数组 `[]`
- **THEN** 系统返回 400 错误并提示"请提供要删除的记录 ID"

### Requirement: 管理员可以筛选申请记录

系统 SHALL 提供高级筛选功能,支持按多个条件组合筛选申请记录。

#### Scenario: 按项目代号和日期范围筛选
- **WHEN** 管理员调用 `GET /api/applications?project_code=ALPHA01&start_date=2026-04-01&end_date=2026-04-10`
- **THEN** 系统返回项目代号为 ALPHA01 且在指定日期范围内的申请记录

#### Scenario: 按申请人类型筛选
- **WHEN** 管理员调用 `GET /api/applications?applicant_type=internal`
- **THEN** 系统返回所有申请人类型为 internal 的记录

#### Scenario: 组合多条件筛选
- **WHEN** 管理员调用 `GET /api/applications?project_code=ALPHA01&number_type=CR&keyword=张三`
- **THEN** 系统返回同时满足三个条件的申请记录

### Requirement: 管理员可见申请IP地址

系统 SHALL 在管理员专用的申请记录查询接口中返回 `ip_address` 字段,普通用户接口不返回此字段。

#### Scenario: 管理员查看申请记录含IP
- **WHEN** 管理员调用 `GET /api/applications?scope=admin`
- **THEN** 返回的每条记录包含 `ip_address` 字段

#### Scenario: 普通用户查看申请记录不含IP
- **WHEN** 普通用户调用 `GET /api/applications`
- **THEN** 返回的记录不包含 `ip_address` 字段
