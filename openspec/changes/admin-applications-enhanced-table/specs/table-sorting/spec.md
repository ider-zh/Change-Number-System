## ADDED Requirements

### Requirement: 管理员可以对申请记录表格列进行排序

系统 SHALL 允许管理员点击表格列标题来切换排序方式，支持升序、降序和无排序三种状态。排序 SHALL 由后端数据库执行，前端传递排序参数。

#### Scenario: 点击列标题切换排序状态
- **WHEN** 管理员点击"申请时间"列标题
- **THEN** 该列显示降序排序图标，数据按时间从新到旧排列

#### Scenario: 排序状态循环切换
- **WHEN** 管理员再次点击已排序的列标题
- **THEN** 排序状态从降序切换为升序，再次点击切换为无排序（恢复默认）

#### Scenario: 排序参数传递给后端
- **WHEN** 用户设置了排序条件
- **THEN** 前端调用 `GET /api/applications` 时传递 `sort_by` 和 `sort_order` 参数

#### Scenario: 后端按指定字段排序
- **WHEN** 后端接收到 `sort_by=created_at&sort_order=DESC`
- **THEN** SQL 查询包含 `ORDER BY created_at DESC`

#### Scenario: 排序与筛选组合
- **WHEN** 管理员同时设置筛选条件和排序
- **THEN** 后端先应用筛选条件，再对结果排序

#### Scenario: 分页切换时保持排序
- **WHEN** 管理员切换到下一页
- **THEN** 排序条件保持不变

#### Scenario: 排序图标显示状态
- **WHEN** 列处于降序排序
- **THEN** 显示向下箭头图标（↓）

#### Scenario: 列处于升序排序
- **WHEN** 列处于升序排序
- **THEN** 显示向上箭头图标（↑）

#### Scenario: 列未排序
- **WHEN** 列未设置排序
- **THEN** 显示双向箭头或无图标（↓↑）

### Requirement: 支持排序的字段

系统 SHALL 支持对以下字段进行排序：申请时间 (`created_at`)、完整编号 (`full_number`)、申请人姓名 (`applicant_name`)。

#### Scenario: 按申请时间排序
- **WHEN** 管理员选择按申请时间排序
- **THEN** 系统按 `created_at` 字段升序或降序排列

#### Scenario: 按完整编号排序
- **WHEN** 管理员选择按完整编号排序
- **THEN** 系统按 `full_number` 字段升序或降序排列（字符串排序）

#### Scenario: 按申请人姓名排序
- **WHEN** 管理员选择按申请人姓名排序
- **THEN** 系统按 `applicant_name` 字段升序或降序排列

#### Scenario: 排序字段白名单校验
- **WHEN** 前端传递 `sort_by` 参数
- **THEN** 后端校验字段名必须在白名单内（`created_at`, `full_number`, `applicant_name`），否则返回 400 错误
