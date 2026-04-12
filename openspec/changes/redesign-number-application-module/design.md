## Context

当前首页（`Home.tsx`）采用左右分栏布局：左侧（1/3）为 `ApplicationForm`，右侧（2/3）为 `ApplicationList`。`ApplicationForm` 是一个单一 Card 组件，包含申请人姓名、项目代号、编号类型、验证码和提交按钮。`ApplicationList` 是一个完整的记录管理组件，包含统计数据、搜索、高级筛选、分页表格和批量操作。

当前布局的问题：
1. 编号创建（核心功能）只占 1/3 宽度，视觉权重不足
2. 申请记录（辅助功能）占据主视觉区域，喧宾夺主
3. 表单提交后结果内联显示在表单顶部，容易被忽略
4. 没有步骤引导，用户需要一次性理解所有字段
5. 无法在提交前预览将生成的编号格式

约束：
- 不修改任何后端 API，仅前端交互流程重组
- 保留所有现有功能（验证码、冷却倒计时、功能开关、管理员权限）
- 需要兼容移动端响应式布局

## Goals / Non-Goals

**Goals:**
- 将编号创建流程提升为首页唯一的默认主视图
- 通过分步引导（Wizard）降低用户的认知负担
- 提供编号预览，让用户在提交前了解将生成的格式
- 提交结果通过弹窗展示，增强反馈感
- 申请记录可通过按钮/Tab 切换查看，但不默认展示
- 为熟练用户提供快捷模式，跳过引导直接填表

**Non-Goals:**
- 不修改后端 API 或数据库结构
- 不改变编号生成逻辑或业务规则
- 不修改管理员后台功能
- 不新增编号类型或项目代号的审核流程

## Decisions

### 1. 分步引导 vs 单页精简表单

**Decision**: 默认使用分步引导（Wizard），同时提供"快捷模式"切换。

**Rationale**: Wizard 适合首次使用的用户，每一步聚焦一个选择（项目 → 类型 → 验证码 → 确认）。熟练用户可通过右上角"快捷模式"按钮切换到传统表单。这种双模式设计兼顾易用性和效率。

**Alternatives considered**:
- 仅保留 Wizard：对老用户来说步骤过多
- 仅保留精简表单：失去改进体验的机会

### 2. 编号预览实现方式

**Decision**: 预览卡片在选择完"项目代号"+"编号类型"后即刻出现，显示格式为 `{project_code}-{number_type}-{sequence}` 的占位样式，序列号部分用 `???` 或下一个序号预估值表示。

**Rationale**: 用户无需提交即可确认编号格式是否正确，减少误操作。序列号部分不查询后端（避免额外 API），仅展示格式模板。

### 3. 申请记录的展示方式

**Decision**: 申请记录通过首页顶部的 Tab 切换（"取号" | "记录"）或折叠面板入口访问，默认隐藏。记录视图保持现有的 `ApplicationList` 组件不变，仅改变其展示时机。

**Rationale**: 最小化对 `ApplicationList` 组件的改动，复用现有逻辑。用户需要时可一键切换查看。

**Alternatives considered**:
- 将记录移至独立页面（如 `/history`）：需要新增路由，增加复杂度
- 在表单下方内联展示：仍然占据过多空间

### 4. 结果展示方式

**Decision**: 提交成功后弹出模态弹窗（Modal），居中展示生成的编号，带放大动画和一键复制按钮。弹窗提供"再次取号"和"查看记录"两个操作按钮。

**Rationale**: 弹窗是模态的，强制用户注意到结果。复制按钮紧邻编号，操作路径最短。

### 5. 组件拆分策略

**Decision**: 将当前 `ApplicationForm.tsx` 拆分为以下组件：
- `NumberCreationWizard.tsx`: 主容器，管理步骤状态和流程
- `StepProjectSelect.tsx`: 项目选择步骤
- `StepNumberTypeSelect.tsx`: 编号类型选择步骤
- `StepVerification.tsx`: 验证码步骤
- `StepConfirm.tsx`: 确认步骤（含预览卡片）
- `NumberPreviewCard.tsx`: 编号预览卡片（可复用）
- `NumberResultModal.tsx`: 结果弹窗
- `QuickNumberForm.tsx`: 快捷模式表单

原有的 `ApplicationForm.tsx` 保留为兼容入口，内部委托给 `NumberCreationWizard`。

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| 老用户不适应新布局，觉得步骤过多 | 提供"快捷模式"一键切换，并在首次展示时提供简短引导提示 |
| Wizard 步骤过多导致转化率下降 | 控制在最多 4 步（项目→类型→验证→确认），每步操作不超过 2 次点击 |
| 编号预览中序列号不准确引起困惑 | 明确标注预览为"格式预览"，序列号部分用 `???` 而非具体数字 |
| 组件拆分引入回归 bug | 保留 `ApplicationForm` 作为入口兼容，核心提交逻辑不改动，仅重组 UI |
| 移动端 Wizard 步骤指示器占用空间过大 | 移动端使用水平滚动步骤条或精简为当前步骤标题 |

## Migration Plan

1. **Phase 1**: 在 `components/` 下创建新组件（Wizard、PreviewCard、ResultModal），不修改现有 `ApplicationForm` 和 `ApplicationList`
2. **Phase 2**: 修改 `Home.tsx` 布局，默认展示 Wizard，将 `ApplicationList` 改为可切换视图
3. **Phase 3**: 拆分 `ApplicationForm`，将逻辑迁移到新组件，保留原组件为兼容壳
4. **Phase 4**: 添加引导提示和动画效果
5. **Rollback**: 保留 `ApplicationForm.tsx` 和 `ApplicationList.tsx` 的原始逻辑直到新组件验证通过，可通过 feature flag 切换回旧布局

## Open Questions

- 是否需要提供编号生成的历史记录（最近 3 个编号）在结果弹窗中作为快捷参考？
- 引导提示（Tooltip/Tour）是首次访问时自动展示还是始终可见？
- 快捷模式是否应该记住用户上次选择的项目和类型以减少操作？
