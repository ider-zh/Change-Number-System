## Context

当前管理员申请记录页面 (`/admin/applications`) 使用简单的表格展示数据，仅有基础的关键字搜索和分页功能。后端 API 已支持部分筛选参数（`project_code`, `number_type`, `keyword`），但前端未充分利用这些能力。页面缺少排序、多选批量删除、高级筛选等现代表格常见的功能。

**技术栈**：
- 前端：React 19 + TypeScript + Tailwind CSS + shadcn/ui
- 后端：Node.js + Express + SQLite
- API：RESTful 接口，已支持分页和部分筛选

**约束**：
- 必须保持向后兼容，不影响普通用户查看申请记录的接口
- 筛选和排序逻辑应在后端执行（数据库层面），而非前端内存中
- 批量删除需要二次确认，防止误操作

## Goals / Non-Goals

**Goals:**
- 提供多字段高级筛选（申请人、项目、类型、IP、日期范围）
- 支持表格列排序（申请时间、编号等）
- 支持多选和批量删除操作
- 优化 UI 交互体验，筛选条件可视化
- 筛选状态与 URL 同步，支持书签和分享

**Non-Goals:**
- 不实现自定义列显示/隐藏功能
- 不实现列拖拽调整顺序功能
- 不改变现有数据库 schema（使用现有字段）
- 不实现服务端导出 Excel（仅保留 CSV）

## Decisions

### 1. 筛选状态管理：URL Query Parameters

**决策**：将所有筛选参数同步到 URL query string（如 `?applicant_name=张三&project_code=ABC&start_date=2026-04-01`）。

**理由**：
- 支持书签保存和链接分享
- 浏览器前进/后退自动保持筛选状态
- 页面刷新不丢失筛选条件
- 使用 `react-router-dom` 的 `useSearchParams` 实现简单

**替代方案**：
- ❌ 仅使用 React state：刷新页面丢失筛选
- ❌ 使用 localStorage：无法分享链接

### 2. 排序实现：后端数据库排序

**决策**：排序由后端执行，使用 SQLite 的 `ORDER BY` 语句。前端传递 `sort_by` 和 `sort_order` 参数。

**理由**：
- 分页场景下前端排序无意义（只能排序当前页数据）
- 数据库排序效率高，利用索引
- 保持前后端职责清晰

**实现**：
- 前端传递：`sort_by=created_at&sort_order=DESC`
- 后端 SQL：`ORDER BY ${sort_by} ${sort_order}`
- 白名单校验 `sort_by` 防止 SQL 注入

### 3. 多选状态：前端 React State

**决策**：选中状态仅保存在前端 React state，不同步到 URL。

**理由**：
- 选中状态是临时操作，不需要持久化
- URL 存储大量 ID 会导致 URL 过长
- 批量操作完成后清空选中状态

### 4. UI 组件选择：shadcn/ui + 自定义组合

**决策**：使用 shadcn/ui 的基础组件组合实现高级功能，而非引入第三方表格库（如 tanstack-table）。

**理由**：
- 保持项目依赖简洁，避免引入重型库
- 当前表格逻辑复杂度中等，原生 `<table>` + CSS 足够
- shadcn/ui 的 Checkbox、DropdownMenu、Popover 等组件可满足需求
- 更好的样式自定义控制

**使用的组件**：
- `Checkbox` - 多选框
- `Badge` - 筛选条件标签
- `Button` - 操作按钮
- `Popover` + `Calendar` - 日期范围选择器（如需要）
- `DropdownMenu` - 列排序菜单

### 5. 批量删除交互：顶部操作栏 + 二次确认

**决策**：选中记录后，表格顶部显示浮动操作栏，显示"已选择 N 项"和"批量删除"按钮。点击后弹出确认对话框。

**理由**：
- 浮动操作栏在选中时自动出现，视觉引导清晰
- 二次确认防止误操作
- 与主流 SaaS 产品交互模式一致

## Risks / Trade-offs

### [Risk] 后端排序参数 SQL 注入
**Mitigation**: 使用白名单校验 `sort_by` 只能是 `created_at`, `full_number`, `applicant_name` 等合法字段名，`sort_order` 只能是 `ASC` 或 `DESC`。

### [Risk] 大量数据批量删除性能问题
**Mitigation**: 批量删除使用 SQLite 事务，一次性删除。如超过 100 条，建议用户缩小筛选范围或使用其他工具。

### [Risk] URL 参数过长
**Mitigation**: 筛选字段数量有限（最多 5-6 个），URL 长度可控。如未来增加复杂筛选，可考虑 POST 查询或保存筛选预设。

### [Trade-off] 不引入 tanstack-table
**Pros**: 依赖简洁、 bundle size 小、样式完全可控  
**Cons**: 需手动实现排序图标、选中状态管理等逻辑  
**决策**: 当前复杂度下，手动实现成本低于引入和学习新库

## Migration Plan

此变更为纯功能增强，无需数据迁移或特殊部署步骤：

1. **部署**：正常 CI/CD 流程构建和部署
2. **回滚**：如发现问题，回滚到上一个 Docker 镜像版本
3. **验证**：部署后访问 `/admin/applications` 验证各项功能

## Open Questions

- **日期范围选择器**：是否需要引入额外的日期范围选择组件（如 `react-day-picker`），还是使用两个独立的日期输入框？
  - **倾向**：使用两个独立的 `Input type="date"`，避免新增依赖

- **排序图标和交互**：点击表头切换排序，还是每列提供排序下拉菜单？
  - **倾向**：点击表头切换（更直观），显示升序/降序/无排序三种状态图标
