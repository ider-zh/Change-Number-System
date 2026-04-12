## ADDED Requirements

### Requirement: 提交成功后弹出编号结果弹窗

系统 SHALL 在编号申请提交成功并获得 `full_number` 后，展示模态弹窗展示生成的编号。

#### Scenario: 提交成功打开结果弹窗
- **WHEN** 用户提交申请并收到成功的 API 响应（含 `full_number`）
- **THEN** 系统打开 NumberResultModal 模态弹窗，居中展示生成的编号

#### Scenario: 弹窗带入场动画
- **WHEN** 结果弹窗首次渲染
- **THEN** 系统对弹窗应用缩放淡入动画（scale + fade-in），持续不超过 300ms

### Requirement: 结果弹窗展示生成的编号

系统 SHALL 在弹窗中以突出的样式展示生成的完整编号。

#### Scenario: 编号以大字体展示
- **WHEN** 结果弹窗渲染
- **THEN** 系统在弹窗中央以大号加粗字体展示 `full_number`

#### Scenario: 一键复制编号
- **WHEN** 用户点击弹窗中的"复制"按钮
- **THEN** 系统将 `full_number` 复制到剪贴板，并展示"已复制"反馈（图标变化或提示文字），2 秒后恢复

### Requirement: 结果弹窗提供快捷操作按钮

系统 SHALL 在结果弹窗中提供"再次取号"和"查看记录"两个操作按钮。

#### Scenario: 点击"再次取号"
- **WHEN** 用户在结果弹窗中点击"再次取号"按钮
- **THEN** 系统关闭弹窗，重置 Wizard 到初始步骤

#### Scenario: 点击"查看记录"
- **WHEN** 用户在结果弹窗中点击"查看记录"按钮
- **THEN** 系统关闭弹窗，切换到申请记录视图并高亮最新一条记录

#### Scenario: 点击弹窗遮罩关闭
- **WHEN** 用户点击弹窗外的遮罩层
- **THEN** 系统关闭弹窗，Wizard 保持在提交完成状态（不重置）

### Requirement: 结果弹窗适配冷却倒计时

系统 SHALL 在弹窗中展示剩余的冷却时间，告知用户何时可以再次取号。

#### Scenario: 弹窗展示冷却倒计时
- **WHEN** 结果弹窗打开时冷却倒计时尚未结束
- **THEN** 系统在弹窗中展示"可在 X 秒后再次取号"的倒计时文字

#### Scenario: 倒计时结束提示消失
- **WHEN** 冷却倒计时归零
- **THEN** 系统移除倒计时文字展示
