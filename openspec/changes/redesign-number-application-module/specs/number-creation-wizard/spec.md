## ADDED Requirements

### Requirement: 首页默认展示编号创建引导流程

系统 SHALL 在用户访问首页时默认展示编号创建的分步引导流程（Wizard），而非申请记录列表。

#### Scenario: 用户访问首页
- **WHEN** 用户导航至首页路由
- **THEN** 系统展示编号创建 Wizard 作为主视图，不展示申请记录列表

#### Scenario: 用户完成取号后返回首页
- **WHEN** 用户从其他页面导航回首页
- **THEN** 系统重置 Wizard 到初始步骤，准备新的取号流程

### Requirement: Wizard 支持多步骤引导

系统 SHALL 将编号创建流程分解为独立的步骤，用户按顺序完成每一步后方可进入下一步。

#### Scenario: Wizard 包含四个步骤
- **WHEN** Wizard 初始化
- **THEN** 系统展示步骤指示器，包含四步：选择项目 → 选择编号类型 → 人机验证 → 确认提交

#### Scenario: 用户完成当前步骤后进入下一步
- **WHEN** 用户在当前步骤完成必填选择并点击"下一步"
- **THEN** 系统验证当前步骤输入有效，切换到下一步骤，步骤指示器更新进度

#### Scenario: 用户可以返回上一步
- **WHEN** 用户在第 2 步或之后点击"上一步"按钮
- **THEN** 系统返回到上一步骤，保留之前步骤的已选值

#### Scenario: 未完成当前步骤无法进入下一步
- **WHEN** 用户未在当前步骤做出有效选择就尝试点击"下一步"
- **THEN** 系统禁用"下一步"按钮或提示用户完成当前选择

### Requirement: Wizard 步骤一为项目代号选择

系统 SHALL 在第一步展示项目代号选择界面，用户可从可用项目列表中选择一个项目。

#### Scenario: 展示可用项目列表
- **WHEN** Wizard 进入第一步
- **THEN** 系统调用 `GET /api/projects?status=approved,pending` 加载项目列表并展示可选项

#### Scenario: 支持搜索过滤项目
- **WHEN** 用户在项目选择器中输入搜索关键词
- **THEN** 系统实时过滤项目列表，匹配项目代号或项目名称

#### Scenario: 管理员可申请新项目入口可见
- **WHEN** 当前用户为管理员或功能开关 `allow_request_project` 为 `true`
- **THEN** 项目选择界面展示"申请新项目"入口

### Requirement: Wizard 步骤二为编号类型选择

系统 SHALL 在第二步展示编号类型选择界面，用户可从可用类型中选择一种。

#### Scenario: 展示可用编号类型列表
- **WHEN** Wizard 进入第二步
- **THEN** 系统调用 `GET /api/number-types?status=approved,pending` 加载编号类型列表并展示可选项

#### Scenario: 管理员可申请新编号类型入口可见
- **WHEN** 当前用户为管理员或功能开关 `allow_request_number_type` 为 `true`
- **THEN** 编号类型选择界面展示"申请新编号类型"入口

### Requirement: Wizard 步骤三为人机验证

系统 SHALL 在第三步要求用户完成人机验证，验证通过后方可进入确认步骤。

#### Scenario: 展示人机验证组件
- **WHEN** Wizard 进入第三步
- **THEN** 系统渲染 CapVerification 组件，用户需完成验证

#### Scenario: 验证通过后进入确认步骤
- **WHEN** 用户完成人机验证并获得有效 token
- **THEN** 系统启用"下一步"按钮，用户可进入确认提交步骤

### Requirement: Wizard 步骤四为确认提交

系统 SHALL 在第四步展示已选信息的汇总和编号预览，用户确认后提交申请。

#### Scenario: 展示选择摘要和编号预览
- **WHEN** Wizard 进入第四步
- **THEN** 系统展示已选项目代号、编号类型和编号预览卡片

#### Scenario: 用户提交申请
- **WHEN** 用户点击"提交取号"按钮
- **THEN** 系统调用 `POST /api/applications` 提交申请，展示加载状态

#### Scenario: 提交成功后展示结果
- **WHEN** 申请提交成功并返回 `full_number`
- **THEN** 系统打开编号结果弹窗（NumberResultModal），展示生成的完整编号

#### Scenario: 提交失败后展示错误
- **WHEN** 申请提交失败（网络错误或业务校验失败）
- **THEN** 系统在当前步骤展示错误信息，允许用户重试

### Requirement: Wizard 支持冷却倒计时

系统 SHALL 在提交成功后启动冷却倒计时，倒计时期间禁用再次提交。

#### Scenario: 提交后启动倒计时
- **WHEN** 用户成功提交申请
- **THEN** 系统启动冷却倒计时（默认 10 秒，可通过 API 配置），在倒计时结束前禁止再次提交

#### Scenario: 倒计时结束恢复可提交状态
- **WHEN** 冷却倒计时归零
- **THEN** 系统恢复 Wizard 到初始步骤，允许用户再次取号

### Requirement: Wizard 支持快捷模式切换

系统 SHALL 提供"快捷模式"切换入口，用户可从 Wizard 切换到精简表单模式。

#### Scenario: 切换到快捷模式
- **WHEN** 用户点击"快捷模式"按钮
- **THEN** 系统将 Wizard 替换为 QuickNumberForm 组件，所有字段在单个视图中展示

#### Scenario: 从快捷模式切换回引导模式
- **WHEN** 用户在快捷模式下点击"引导模式"按钮
- **THEN** 系统将 QuickNumberForm 替换回 Wizard 组件，重置步骤状态
