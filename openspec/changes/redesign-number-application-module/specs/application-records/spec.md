## MODIFIED Requirements

### Requirement: 申请记录不再默认展示

系统 SHALL 不再在首页默认展示申请记录列表，改为通过 Tab 切换或操作按钮触发展示。

#### Scenario: 首页初始状态不加载记录数据
- **WHEN** 用户首次访问首页
- **THEN** 系统不调用申请记录列表 API，不渲染 `ApplicationList` 组件

#### Scenario: 切换到记录视图时加载数据
- **WHEN** 用户激活"记录"Tab 或点击"查看记录"按钮
- **THEN** 系统渲染 `ApplicationList` 组件并加载申请记录数据

#### Scenario: 记录视图保持现有功能
- **WHEN** `ApplicationList` 组件被渲染
- **THEN** 组件保持现有的所有功能（统计、搜索、高级筛选、分页、批量操作、高亮），行为不变

### Requirement: 申请记录支持从结果弹窗快速访问

系统 SHALL 允许用户从编号结果弹窗一键切换到申请记录视图。

#### Scenario: 弹窗中点击"查看记录"
- **WHEN** 用户在结果弹窗中点击"查看记录"按钮
- **THEN** 系统关闭弹窗，激活首页的"记录"Tab，并重新加载记录列表
