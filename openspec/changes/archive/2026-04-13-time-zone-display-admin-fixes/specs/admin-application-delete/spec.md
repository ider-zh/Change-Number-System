## ADDED Requirements

### Requirement: 管理员可删除单条申请记录

系统 SHALL 允许已认证的管理员通过 API 删除单条申请记录。

#### Scenario: 管理员成功删除申请记录
- **WHEN** 管理员发送 `DELETE /api/admin/applications/:id` 请求，且认证通过
- **THEN** 系统从 `applications` 表中删除该记录，并返回 `{ success: true, message: "删除成功" }`

#### Scenario: 未认证用户尝试删除申请记录
- **WHEN** 未携带有效 `adminToken` 的用户发送删除请求
- **THEN** 系统返回 401 未授权错误

#### Scenario: 删除不存在的申请记录
- **WHEN** 管理员尝试删除一个不存在的申请记录 ID
- **THEN** 系统返回 404 错误，提示"申请记录不存在"

### Requirement: 删除申请记录需二次确认

前端 SHALL 在管理员执行删除操作前弹出确认对话框，防止误操作。

#### Scenario: 管理员确认删除
- **WHEN** 管理员点击删除按钮并确认对话框
- **THEN** 系统调用删除 API，成功后从列表中移除该记录并显示成功提示

#### Scenario: 管理员取消删除
- **WHEN** 管理员点击删除按钮但取消对话框
- **THEN** 系统不执行任何操作，列表保持不变

### Requirement: 申请管理页面导航入口

系统 SHALL 在管理员导航栏中增加"申请管理"入口，链接到独立的申请管理页面。

#### Scenario: 管理员登录后查看导航
- **WHEN** 管理员成功登录并访问任意管理页面
- **THEN** 顶部导航栏显示"申请管理"链接，点击后跳转到 `/admin/applications`

#### Scenario: 非管理员用户访问申请管理页面
- **WHEN** 非管理员用户直接访问 `/admin/applications` 路由
- **THEN** 系统重定向到管理员登录页面
