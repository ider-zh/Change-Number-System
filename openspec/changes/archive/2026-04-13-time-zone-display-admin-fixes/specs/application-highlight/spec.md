## MODIFIED Requirements

### Requirement: 新提交的申请记录高亮显示

系统 SHALL 对最近提交的申请记录进行视觉高亮，帮助用户快速识别最新记录。高亮显示 SHALL 在小屏幕（宽度 < 768px）上保持正常显示，不因换行影响可读性。

#### Scenario: 提交后新记录高亮
- **WHEN** 用户成功提交申请并且申请列表刷新
- **THEN** 系统对新提交的记录应用高亮样式（淡黄色背景 + 左侧蓝色边框）

#### Scenario: 小屏幕表格可横向滚动
- **WHEN** 用户在屏幕宽度 < 768px 的设备上查看申请记录列表
- **THEN** 表格容器允许横向滚动，标题行和正文内容不换行

#### Scenario: 高亮带脉冲动画
- **WHEN** 新记录首次显示
- **THEN** 系统对该记录应用脉冲动画效果，持续 3 秒

#### Scenario: 高亮自动消失
- **WHEN** 新记录高亮显示超过 30 秒
- **THEN** 系统自动移除高亮样式，恢复正常显示

## ADDED Requirements

### Requirement: 申请记录列表响应式布局

系统 SHALL 优化申请记录列表在小屏幕上的显示，使用 `overflow-x-auto` 容器和 `whitespace-nowrap` 样式避免内容换行。

#### Scenario: 表格横向滚动容器
- **WHEN** 申请记录列表渲染
- **THEN** 表格外层包裹横向滚动容器，确保小屏幕上内容可滚动查看

#### Scenario: 标题和正文不换行
- **WHEN** 表格标题行（`<th>`）和正文单元格（`<td>`）渲染
- **THEN** 所有单元格应用 `whitespace-nowrap` 样式，内容在同一行显示

#### Scenario: 极小屏幕隐藏次要列
- **WHEN** 屏幕宽度 < 640px
- **THEN** IP 地址等次要列可选择性隐藏，保证核心信息可读性
