## 1. 基础组件创建

- [x] 1.1 创建 `NumberCreationWizard.tsx` 组件骨架，包含步骤状态管理和步骤指示器 UI
- [x] 1.2 创建 `StepProjectSelect.tsx` 组件，集成 `FilterableProjectSelector` 和"申请新项目"入口
- [x] 1.3 创建 `StepNumberTypeSelect.tsx` 组件，集成 `Select` 和"申请新编号类型"入口
- [x] 1.4 创建 `StepVerification.tsx` 组件，封装 `CapVerification` 组件
- [x] 1.5 创建 `StepConfirm.tsx` 组件，展示选择摘要和提交按钮
- [x] 1.6 创建 `NumberPreviewCard.tsx` 组件，展示编号格式模板和已选信息
- [x] 1.7 创建 `NumberResultModal.tsx` 组件，带入场动画、编号展示和复制功能
- [x] 1.8 创建 `QuickNumberForm.tsx` 组件，基于现有 `ApplicationForm` 逻辑的精简表单

## 2. 首页布局重构

- [x] 2.1 在 `Home.tsx` 中添加 Tab 切换控件（"取号" | "记录"），使用 shadcn Tabs 组件
- [x] 2.2 将"取号"Tab 内容设置为 `NumberCreationWizard`（默认激活）
- [x] 2.3 将"记录"Tab 内容设置为 `ApplicationList`，默认不渲染（懒加载）
- [x] 2.4 实现 Tab 切换时的状态保持（记录 Tab 的搜索/翻页状态不丢失）
- [x] 2.5 添加响应式样式，确保移动端步骤指示器适配

## 3. Wizard 步骤逻辑实现

- [x] 3.1 实现步骤间的数据传递（已选项目代号、编号类型、验证码 token）
- [x] 3.2 实现"上一步"/"下一步"导航逻辑和按钮状态管理
- [x] 3.3 实现步骤验证逻辑（每步完成后才允许进入下一步）
- [x] 3.4 在 `StepProjectSelect` 中集成项目和编号类型的申请内嵌表单
- [x] 3.5 在 `StepNumberTypeSelect` 中集成编号类型申请内嵌表单
- [x] 3.6 在 `StepConfirm` 中集成 `NumberPreviewCard` 组件

## 4. 编号预览和结果弹窗

- [x] 4.1 在 `StepConfirm` 中实现编号预览逻辑，选择完项目和类型后生成格式预览
- [x] 4.2 实现 `NumberResultModal` 的打开/关闭逻辑，支持从 Wizard 提交后触发
- [x] 4.3 在弹窗中实现一键复制功能，带复制成功反馈动画
- [x] 4.4 实现"再次取号"按钮：关闭弹窗并重置 Wizard
- [x] 4.5 实现"查看记录"按钮：关闭弹窗并切换到"记录"Tab，触发数据刷新
- [x] 4.6 在弹窗中集成冷却倒计时展示

## 5. 快捷模式实现

- [x] 5.1 在 Wizard 界面添加"快捷模式"切换按钮
- [x] 5.2 实现从引导模式到快捷模式的切换逻辑
- [x] 5.3 实现从快捷模式到引导模式的切换逻辑，恢复对应步骤
- [x] 5.4 实现模式切换时已填数据的传递和预填
- [x] 5.5 在快捷模式中复用现有的申请项目和编号类型内嵌入口

## 6. 申请记录视图适配

- [x] 6.1 修改 `Home.tsx` 使 `ApplicationList` 仅在"记录"Tab 激活时渲染
- [x] 6.2 实现从结果弹窗到记录视图的联动（传递高亮标记）
- [x] 6.3 在 `ApplicationList` 中支持接收外部高亮标记，对指定记录应用高亮
- [x] 6.4 移除首页初始加载时的记录列表 API 调用（仅在 Tab 激活时调用）

## 7. 动画和用户体验优化

- [x] 7.1 为结果弹窗添加缩放淡入动画（CSS transition 或 framer-motion）
- [x] 7.2 为步骤指示器添加步骤切换动画
- [x] 7.3 为编号预览卡片添加出现动画
- [x] 7.4 为复制成功反馈添加图标切换动画
- [x] 7.5 添加移动端响应式样式优化

## 8. 测试和验证

- [x] 8.1 为 `NumberCreationWizard` 编写单元测试（步骤导航、数据传递）
- [x] 8.2 为 `NumberPreviewCard` 编写单元测试（格式展示、状态标识）
- [x] 8.3 为 `NumberResultModal` 编写单元测试（打开/关闭、复制、按钮操作）
- [x] 8.4 为 `QuickNumberForm` 编写单元测试（表单提交、模式切换）
- [x] 8.5 端到端测试：完整引导模式取号流程
- [x] 8.6 端到端测试：快捷模式取号流程
- [x] 8.7 端到端测试：Tab 切换和记录查看
- [x] 8.8 手动验证移动端响应式布局
