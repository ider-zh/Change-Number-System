## ADDED Requirements

### Requirement: 首页采用 Tab 切换布局

系统 SHALL 在首页顶部提供 Tab 切换控件，包含"取号"和"记录"两个标签页。

#### Scenario: 默认展示取号 Tab
- **WHEN** 用户访问首页
- **THEN** 系统默认激活"取号"Tab，展示编号创建流程（Wizard 或快捷模式）

#### Scenario: 切换到记录 Tab
- **WHEN** 用户点击"记录"Tab
- **THEN** 系统切换视图为申请记录列表（ApplicationList），加载并展示数据

#### Scenario: Tab 切换保持状态
- **WHEN** 用户在"记录"Tab 设置了搜索条件或翻页后切换回"取号"Tab
- **THEN** 系统保留记录 Tab 的状态，再次切换回来时不重置

### Requirement: 首页布局适配响应式设计

系统 SHALL 确保新布局在桌面端和移动端均有良好的展示效果。

#### Scenario: 桌面端布局
- **WHEN** 屏幕宽度 >= 1024px
- **THEN** 编号创建区域居中展示，最大宽度不超过 640px，记录列表在全宽模式下展示

#### Scenario: 移动端布局
- **WHEN** 屏幕宽度 < 768px
- **THEN** 编号创建区域占满宽度，步骤指示器适配为精简模式（仅显示当前步骤名称）

### Requirement: 结果弹窗关闭后更新记录视图

系统 SHALL 在用户从结果弹窗选择"查看记录"时，确保记录视图展示最新的申请数据。

#### Scenario: 从弹窗切换到记录视图
- **WHEN** 用户在结果弹窗中点击"查看记录"
- **THEN** 系统切换到"记录"Tab 并重新加载数据，确保最新提交的记录出现在列表中
