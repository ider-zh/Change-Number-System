## Why

当前管理员申请记录页面 (`/admin/applications`) 功能过于简单，仅有基础的关键字搜索和分页功能。管理员在管理大量申请记录时，缺乏高效的筛选、排序和批量操作工具，导致管理效率低下。需要增强表格功能以提升管理体验。

## What Changes

- 新增多字段筛选功能（申请人姓名、项目代号、编号类型、IP 地址、日期范围）
- 新增表格列排序功能（申请时间、编号等）
- 新增多选功能和批量删除操作
- 优化筛选条件的状态管理和 URL 同步
- 增强表格 UI 和交互体验

## Capabilities

### New Capabilities
- `application-filtering`: 多字段高级筛选功能，支持按申请人、项目、类型、IP、日期范围筛选
- `table-sorting`: 表格列排序功能，支持按申请时间、编号等字段升序/降序排列
- `bulk-operations`: 多选和批量删除功能，支持全选、反选、批量删除确认

### Modified Capabilities
<!-- 无现有能力的需求变更 -->

## Impact

- **前端组件**: `AdminApplicationsPage.tsx` 将大幅重构
- **API 服务**: 可能需要扩展 `applicationAPI.getAll` 以支持更多筛选和排序参数
- **后端 API**: 可能需要增强 `/api/admin/applications` 接口以支持排序参数（`sortBy`, `sortOrder`）
- **UI 组件**: 需要引入或使用 shadcn/ui 的 DropdownMenu、Checkbox、DateRangePicker 等组件
