## Why

当前管理员后台的项目管理和编号类型管理页面只有"创建"和"删除"功能，缺少"编辑"能力，导致管理员无法修改已有条目的错误或不完整信息。同时，数据库约束对 `number_types.type_name` 强制 NOT NULL，限制了灵活性。需要增强 CRUD 能力以提升管理效率。

## What Changes

- 前端 `ProjectsPage` 表格增加"编辑"按钮，支持修改项目的 `code` 和 `name`
- 前端 `NumberTypesPage` 表格增加"编辑"按钮，支持修改编号类型的 `type_code`、`type_name` 和 `description`
- 数据库：移除 `number_types.type_name` 的 NOT NULL 约束，允许空缺
- 数据库：移除 `number_types.type_name` 的默认值限制，允许空字符串
- 页面标题/导航：确保项目管理入口使用一致的命名

## Capabilities

### New Capabilities

### Modified Capabilities

- `project-management`: 增加编辑项目的前端 UI 能力
- `number-type-management`: 增加编辑编号类型的前端 UI 能力，放宽数据库约束

## Impact

- 前端文件：`frontend/src/pages/ProjectsPage.tsx`、`frontend/src/pages/NumberTypesPage.tsx`
- 数据库迁移：`backend/src/db/init.js` 中的 `number_types` 表 schema 变更
- 后端 API 无需修改（update 接口已存在）
- 已有的 `projectAPI.update()` 和 `numberTypeAPI.update()` 将被前端页面使用
