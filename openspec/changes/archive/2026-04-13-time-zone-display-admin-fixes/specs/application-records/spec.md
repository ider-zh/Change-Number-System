## MODIFIED Requirements

### Requirement: 申请记录按时间倒序排列

系统 SHALL 默认按申请时间 (`created_at`) 倒序返回申请记录，最新的记录排在前面。时间显示 SHALL 统一为北京时间（UTC+8），无论用户浏览器时区设置。

#### Scenario: 默认按时间倒序
- **WHEN** 用户调用 `GET /api/applications`
- **THEN** 系统返回的申请记录按 `created_at DESC` 排序

#### Scenario: 北京时间显示
- **WHEN** 前端渲染申请记录列表
- **THEN** 所有时间字段使用北京时间（UTC+8）格式化显示，不受浏览器本地时区影响

#### Scenario: 不同时区浏览器一致性
- **WHEN** 用户分别在 UTC+0 和 UTC+8 时区的浏览器中访问
- **THEN** 两个浏览器显示的申请时间完全一致
