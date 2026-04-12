## Context

当前前端 `ProjectsPage.tsx` 和 `NumberTypesPage.tsx` 都有完整的 Create/Read/Delete 能力，但缺少 Update UI。后端 `PUT /api/projects/:id` 和 `PUT /api/number-types/:id` 已实现，前端 services 层 `projectAPI.update()` 和 `numberTypeAPI.update()` 也已存在。数据库 `number_types.type_name` 是 NOT NULL 约束，需要移除。

## Goals / Non-Goals

**Goals:**
- 前端表格每行增加"编辑"按钮，弹出编辑表单复用现有创建表单模式
- 支持修改 `code`/`name`（项目）和 `type_code`/`type_name`/`description`（编号类型）
- 数据库放宽 `type_name` NOT NULL 约束
- 数据库允许 `name` 字段为空字符串（项目已支持，编号类型需要对齐）

**Non-Goals:**
- 不修改后端 API 逻辑
- 不改变审核流程
- 不修改申请表单行为

## Decisions

1. **编辑 UI 模式**：复用现有创建表单组件模式，使用内联编辑弹窗或展开行。选择 **弹窗模式（Modal）** 因为：
   - 与现有创建表单一致的 UX
   - 避免表格行展开导致布局复杂化
   - 现有代码已有 Modal 组件（如创建表单的 antd Modal）

2. **表单预填数据**：编辑弹窗打开时，将当前行数据预填到表单字段中，用户可修改后提交。

3. **数据库迁移策略**：使用 `ALTER TABLE` 重建 `number_types` 表（SQLite 不支持直接 DROP CONSTRAINT，需重建表）。迁移在应用启动时执行。

4. **唯一约束校验**：编辑 `code` 或 `type_code` 时，后端已有 UNIQUE 约束防止冲突，前端只需展示后端返回的错误信息。

5. **项目名称允许空值**：`projects.name` 默认值为 `''` 已支持空字符串，前端编辑表单允许不填写。`number_types.type_name` 移除 NOT NULL 后也允许空值。

## Risks / Trade-offs

- [中等风险] SQLite 表重建迁移 → 如果表中有数据，迁移可能失败或丢失数据。Mitigation: 使用 `ALTER TABLE ... RENAME` + 创建新表 + 数据迁移 + 删除旧表的模式，并在迁移前检查表是否已迁移过。
- [低风险] 编辑 `code`/`type_code` 可能影响已有申请记录的外键关联 → 当前申请记录表存储的是 `project_code`/`type_code` 文本而非外键 ID，修改 code 不会影响历史数据。
