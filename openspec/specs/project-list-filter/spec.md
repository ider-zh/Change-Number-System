## ADDED Requirements

### Requirement: 项目列表支持关键字搜索

系统 SHALL 允许用户通过输入关键字搜索项目代号或项目名称。

#### Scenario: 搜索匹配项目代号
- **WHEN** 用户在搜索框中输入 "ALPHA"
- **THEN** 系统过滤显示项目代号包含 "ALPHA" 的项目

#### Scenario: 搜索匹配项目名称
- **WHEN** 用户在搜索框中输入 "测试"
- **THEN** 系统过滤显示项目名称包含 "测试" 的项目

#### Scenario: 清空搜索显示全部
- **WHEN** 用户清空搜索框
- **THEN** 系统显示所有可用项目

### Requirement: 项目列表支持状态筛选

系统 SHALL 允许用户按项目状态（approved/pending/rejected）筛选项目。

#### Scenario: 筛选已审核通过的项目
- **WHEN** 用户选择状态过滤为 "approved"
- **THEN** 系统仅显示状态为 approved 的项目

#### Scenario: 筛选待审核的项目
- **WHEN** 用户选择状态过滤为 "pending"
- **THEN** 系统仅显示状态为 pending 的项目

#### Scenario: 显示全部状态
- **WHEN** 用户选择"全部"或不选择过滤
- **THEN** 系统显示所有状态的项目

### Requirement: 项目列表支持排序

系统 SHALL 允许用户按不同字段对项目列表排序。

#### Scenario: 默认按创建时间降序
- **WHEN** 用户打开项目列表
- **THEN** 系统默认按 created_at 降序排列，最新项目在前

#### Scenario: 按创建时间升序
- **WHEN** 用户选择按时间升序排列
- **THEN** 系统按 created_at 升序排列，最早项目在前

#### Scenario: 按项目代号字母排序
- **WHEN** 用户选择按代号字母排序
- **THEN** 系统按 project.code 字母顺序排列

### Requirement: 项目选择组件集成过滤排序

系统 SHALL 在申请页面的项目选择组件中集成搜索、筛选和排序功能。

#### Scenario: 申请页面加载时显示过滤排序控件
- **WHEN** 用户打开申请页面
- **THEN** 系统显示带搜索框、状态下拉筛选和排序按钮的项目选择组件

#### Scenario: 用户操作过滤条件后实时更新
- **WHEN** 用户在搜索框输入内容或更改筛选条件
- **THEN** 系统实时更新显示符合条件的项目列表
