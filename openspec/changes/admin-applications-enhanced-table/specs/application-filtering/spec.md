## ADDED Requirements

### Requirement: 管理员可以使用多字段高级筛选申请记录

系统 SHALL 在管理员申请记录页面提供多字段筛选功能，支持按申请人姓名、项目代号、编号类型、IP 地址和日期范围进行组合筛选。筛选条件 SHALL 同步到 URL query parameters 以支持书签和分享。

#### Scenario: 按申请人姓名筛选
- **WHEN** 管理员在筛选输入框中输入申请人姓名并按下搜索
- **THEN** 系统仅显示该申请人的申请记录，URL 更新为 `?applicant_name=xxx`

#### Scenario: 按项目代号筛选
- **WHEN** 管理员从项目下拉菜单中选择项目代号
- **THEN** 系统仅显示该项目的申请记录，URL 更新为 `?project_code=xxx`

#### Scenario: 按编号类型筛选
- **WHEN** 管理员从编号类型下拉菜单中选择类型
- **THEN** 系统仅显示该类型的申请记录，URL 更新为 `?number_type=xxx`

#### Scenario: 按IP地址筛选
- **WHEN** 管理员在IP地址输入框中输入IP并按下搜索
- **THEN** 系统仅显示该IP地址的申请记录，URL 更新为 `?ip_address=xxx`

#### Scenario: 按日期范围筛选
- **WHEN** 管理员选择开始日期和结束日期后点击应用
- **THEN** 系统仅显示指定日期范围内的申请记录，URL 更新为 `?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`

#### Scenario: 组合多条件筛选
- **WHEN** 管理员同时设置申请人姓名、项目代号和日期范围
- **THEN** 系统显示同时满足所有条件的记录，URL 包含所有筛选参数

#### Scenario: 筛选条件显示为标签
- **WHEN** 管理员设置了筛选条件
- **THEN** 表格顶部显示筛选条件标签（Badge），每个标签有关闭按钮可单独清除

#### Scenario: 清除所有筛选条件
- **WHEN** 管理员点击"清除所有筛选"按钮
- **THEN** 系统清除所有筛选条件并重置 URL 为 `?page=1`

#### Scenario: URL 参数加载筛选状态
- **WHEN** 管理员通过书签或分享链接访问带有筛选参数的 URL
- **THEN** 系统自动应用 URL 中的筛选条件并显示对应数据

### Requirement: 筛选参数传递给后端 API

系统 SHALL 将所有筛选参数传递给后端 API，由后端执行筛选逻辑并返回分页结果。

#### Scenario: 筛选参数传递给 API
- **WHEN** 前端调用 `GET /api/applications` 并设置了筛选条件
- **THEN** 请求包含参数 `applicant_name`, `project_code`, `number_type`, `ip_address`, `start_date`, `end_date`

#### Scenario: 后端返回筛选后的结果
- **WHEN** 后端接收到带筛选参数的请求
- **THEN** 返回符合条件的记录和更新后的分页信息
