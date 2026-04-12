## ADDED Requirements

### Requirement: 申请新项目需要人机验证

系统 SHALL 在用户申请新项目时要求完成 cap-widget 人机验证，验证通过后方可提交。

#### Scenario: 用户申请新项目完成验证
- **WHEN** 用户填写完新项目申请表单
- **THEN** 系统显示 CapWidget 组件，用户完成 proof-of-work 验证后表单才可提交

#### Scenario: 人机验证失败无法提交
- **WHEN** 用户未完成 CapWidget 验证或验证失败
- **THEN** 系统禁止提交新项目申请并提示"请完成人机验证"

#### Scenario: 后端验证人机验证 token
- **WHEN** 前端提交新项目申请并携带 capToken
- **THEN** 后端使用 cap.validateToken(capToken) 验证，验证失败则返回 400 错误

### Requirement: 申请新编号类型需要人机验证

系统 SHALL 在用户申请新编号类型时要求完成 cap-widget 人机验证，验证通过后方可提交。

#### Scenario: 用户申请新编号类型完成验证
- **WHEN** 用户填写完新编号类型申请表单
- **THEN** 系统显示 CapWidget 组件，用户完成 proof-of-work 验证后表单才可提交

#### Scenario: 人机验证失败无法提交
- **WHEN** 用户未完成 CapWidget 验证或验证失败
- **THEN** 系统禁止提交新编号类型申请并提示"请完成人机验证"

#### Scenario: 后端验证人机验证 token
- **WHEN** 前端提交新编号类型申请并携带 capToken
- **THEN** 后端使用 cap.validateToken(capToken) 验证，验证失败则返回 400 错误

### Requirement: 提交申请需要人机验证

系统 SHALL 在用户提交编号申请时要求完成 cap-widget 人机验证，验证通过后方可提交。

#### Scenario: 用户提交编号申请完成验证
- **WHEN** 用户填写完编号申请表单
- **THEN** 系统显示 CapWidget 组件，用户完成 proof-of-work 验证后表单才可提交

#### Scenario: 人机验证失败无法提交
- **WHEN** 用户未完成 CapWidget 验证或验证失败
- **THEN** 系统禁止提交编号申请并提示"请完成人机验证"

#### Scenario: 后端验证人机验证 token
- **WHEN** 前端提交编号申请并携带 capToken
- **THEN** 后端使用 cap.validateToken(capToken) 验证，验证失败则返回 400 错误

### Requirement: Cap Widget 组件正确集成

系统 SHALL 使用 cap-widget 组件并提供中文本地化文本。

#### Scenario: 组件加载显示中文
- **WHEN** CapWidget 组件渲染
- **THEN** 初始状态显示"我不是机器人"，验证中显示"验证中..."，成功显示"验证成功 ✓"

#### Scenario: 组件 endpoint 指向后端
- **WHEN** CapWidget 组件初始化
- **THEN** 组件的 endpoint 属性设置为 `${API_BASE_URL}/cap/`，可调用后端的 challenge 和 redeem 接口

#### Scenario: 验证成功回调传递 token
- **WHEN** 用户完成验证
- **THEN** CapWidget 调用 onSolve 回调并传递 proof-of-work token

### Requirement: 后端 Cap 服务使用 SQLite 存储

系统 SHALL 使用 SQLite 数据库存储 cap.js 的 challenges 和 tokens 数据。

#### Scenario: Cap 实例初始化
- **WHEN** 后端启动
- **THEN** Cap 实例使用 storage 接口对接 SQLite，challenges 存储在 cap_challenges 表，tokens 存储在 cap_tokens 表

#### Scenario: Challenge 和 Redeem 接口可用
- **WHEN** 前端调用 `POST /cap/challenge`
- **THEN** 后端返回 cap.createChallenge() 生成的挑战数据

#### Scenario: 前端调用 `POST /cap/redeem`
- **WHEN** 前端提交 token 和 solutions
- **THEN** 后端返回 cap.redeemChallenge({ token, solutions }) 的验证结果

### Requirement: Cap 数据存储表

系统 SHALL 在 SQLite 数据库中创建 cap_challenges 和 cap_tokens 两张表。

#### Scenario: cap_challenges 表结构
- **WHEN** 数据库初始化
- **THEN** 创建表包含 token (TEXT PRIMARY KEY), data (TEXT NOT NULL), expires (INTEGER NOT NULL) 字段

#### Scenario: cap_tokens 表结构
- **WHEN** 数据库初始化
- **THEN** 创建表包含 key (TEXT PRIMARY KEY), expires (INTEGER NOT NULL) 字段
