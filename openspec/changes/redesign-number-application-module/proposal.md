## Why

当前首页的"编号申请"模块以表单+记录列表的平铺布局呈现，编号创建流程（ApplicationForm）仅占据页面 1/3 宽度，而申请记录列表（ApplicationList）占据 2/3 宽度。这种设计将"查看历史记录"的权重置于"创建新编号"之上，不符合用户的核心使用场景——用户访问首页的首要目标是快速生成编号，而非浏览历史记录。本变更旨在重新设计首页编号申请模块，让编号创建流程成为视觉和操作的核心，采用现代化 UI/UX 模式提升取号体验。

## What Changes

- 首页布局从"左表单 + 右记录列表"改为以编号创建为核心的多步骤引导流程（Step Wizard）
- 引入可视化编号预览卡片，用户在提交前即可直观看到即将生成的编号样式
- 新增编号生成器组件（NumberGenerator），以卡片式、交互式方式引导用户选择项目代号和编号类型
- 申请记录从首页主视图移至折叠面板或独立 Tab，作为辅助功能存在
- 提交成功后的编号结果以动画弹窗（Result Modal）展示，支持一键复制
- 新增快捷取号模式：对熟悉流程的用户提供精简表单模式
- **BREAKING**: 首页不再默认展示申请记录列表，用户需要主动展开或切换到记录视图

## Capabilities

### New Capabilities
- `number-creation-wizard`: 首页编号创建的分步引导流程，包括项目选择、编号类型选择、验证码、提交和结果展示的完整交互链路
- `number-preview-card`: 编号预览卡片组件，在选择完项目代号和编号类型后实时展示即将生成的编号格式
- `number-result-modal`: 提交成功后的编号结果弹窗，带复制动画和快捷操作（再次取号、查看记录）
- `quick-number-mode`: 快捷取号模式，为熟练用户提供一步到位的精简表单
- `homepage-layout-v2`: 首页新版布局结构，以编号创建为核心，记录列表为辅助

### Modified Capabilities
- `application-records`: 申请记录从首页默认展示改为可折叠/可切换的次级视图，不再占据主视觉区域
- `application-highlight`: 新记录高亮逻辑适配新的结果弹窗展示方式，而非在列表中查找

## Impact

- **Frontend**: `frontend/src/pages/Home.tsx` 布局重构；`frontend/src/components/ApplicationForm.tsx` 拆分为多个新组件（NumberCreationWizard, NumberPreviewCard, NumberResultModal）；`frontend/src/components/ApplicationList.tsx` 降级为可折叠/可选展示的辅助组件
- **CSS/Styling**: 新增动画样式（结果弹窗动画、步骤指示器、编号预览卡片）
- **API**: 无后端 API 变更，仅前端交互流程重组
- **User Experience**: 用户首次访问首页的视觉布局和操作路径将发生显著变化，需要简短的引导提示
