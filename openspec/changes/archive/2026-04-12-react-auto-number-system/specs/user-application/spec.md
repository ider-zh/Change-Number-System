## ADDED Requirements

### Requirement: 用户可以填写申请人信息并缓存到浏览器

系统 SHALL 提供申请人信息填写界面,并将填写的数据缓存到浏览器 localStorage 中,以便后续访问时自动填充。

#### Scenario: 首次填写申请人信息
- **WHEN** 用户首次访问系统并填写申请人信息表单
- **THEN** 系统将信息保存到 localStorage,键名为 `user-profile`

#### Scenario: 再次访问时自动填充
- **WHEN** 用户再次访问系统
- **THEN** 系统从 localStorage 读取缓存的申请人信息并自动填充表单

#### Scenario: 用户可以修改缓存的申请人信息
- **WHEN** 用户修改申请人信息并提交
- **THEN** 系统更新 localStorage 中的缓存数据

### Requirement: 用户可以选择项目代号和编号类型

系统 SHALL 从后端 API 获取已审核通过的项目代号和编号类型列表,并在申请表单中提供下拉选择。

#### Scenario: 加载可用项目列表
- **WHEN** 用户打开申请页面
- **THEN** 系统调用 `GET /api/projects?status=approved` 获取项目列表并填充到下拉框

#### Scenario: 加载可用编号类型列表
- **WHEN** 用户打开申请页面
- **THEN** 系统调用 `GET /api/number-types?status=approved` 获取编号类型列表并填充到下拉框

#### Scenario: 用户专属项目可见
- **WHEN** 用户曾经申请过新增项目代号且已审核通过
- **THEN** 该用户专属的项目代号也会出现在下拉列表中

### Requirement: 用户可以申请新增项目代号

系统 SHALL 允许用户提交新的项目代号申请,该申请初始状态为 `pending`,需管理员审核。

#### Scenario: 用户提交新项目代号申请
- **WHEN** 用户在下拉框中选择"申请新项目代号"并填写项目代号和名称
- **THEN** 系统调用 `POST /api/projects/request` 提交申请,状态设为 `pending`

#### Scenario: 用户申请成功后当前用户可用
- **WHEN** 用户申请的项目代号状态仍为 `pending`
- **THEN** 该申请仅对该用户和管理员可见,其他用户不可见

### Requirement: 用户可以申请新增编号类型

系统 SHALL 允许用户提交新的编号类型申请,该申请初始状态为 `pending`,需管理员审核。

#### Scenario: 用户提交新编号类型申请
- **WHEN** 用户在下拉框中选择"申请新编号类型"并填写类型代码、名称和描述
- **THEN** 系统调用 `POST /api/number-types/request` 提交申请,状态设为 `pending`

#### Scenario: 用户申请成功后当前用户可用
- **WHEN** 用户申请的编号类型状态仍为 `pending`
- **THEN** 该申请仅对该用户和管理员可见,其他用户不可见

### Requirement: 用户提交编号申请时自动生成编号

系统 SHALL 根据选择的项目代号和编号类型,自动生成下一个流水号,格式为 `{类型}-{项目代号}-{4位流水号}`。

#### Scenario: 成功提交编号申请
- **WHEN** 用户填写完整申请信息并提交
- **THEN** 系统调用 `POST /api/applications`,后端计算下一个流水号并返回完整编号

#### Scenario: 流水号自动递增
- **WHEN** 同一项目代号和编号类型已有 N 条申请记录
- **THEN** 系统生成的新编号流水号为 N+1,格式化为 4 位数字 (不足补零)

#### Scenario: 必填字段验证
- **WHEN** 用户未填写申请人姓名、项目代号或编号类型就提交
- **THEN** 系统拒绝提交并提示错误信息
