## Context

当前系统时间处理流程存在时区不一致问题：
- SQLite 数据库使用 `CURRENT_TIMESTAMP` 存储服务器本地时间（北京时间 UTC+8）
- 前端使用 `new Date(timestamp).toLocaleString('zh-CN')` 将时间戳转换为浏览器本地时区
- 当用户浏览器时区不是 UTC+8 时，显示的时间会出现偏差（如"8小时前"的误差）
- 项目未使用任何专业日期库（moment.js、dayjs 等），完全依赖原生 `Date` 对象

响应式设计方面：
- 完全依赖 Tailwind CSS 断点类，无自定义 `@media` 查询
- 申请记录列表使用传统 `<table>`，无横向滚动包裹或堆叠布局
- 小屏幕上表格内容会换行溢出，影响可读性

管理员功能方面：
- 现有 4 个管理页面：Dashboard、Projects、Number Types、Review
- 缺少对申请记录的管理能力（查看、删除）
- 认证基于 localStorage 的 `isAdmin` 标志和 `adminToken`

## Goals / Non-Goals

**Goals:**
- 统一所有时间显示为北京时间（UTC+8），无论用户浏览器时区设置
- 优化申请记录列表在小屏幕上的显示，避免标题和正文换行
- 为管理员增加删除申请记录的功能，包含导航入口和完整的 UI 交互

**Non-Goals:**
- 不修改数据库存储格式（保持 CURRENT_TIMESTAMP）
- 不引入重型日期库（如 moment.js），保持轻量
- 不修改现有申请提交逻辑，仅优化显示层
- 不支持批量删除（首期仅单条删除，降低风险）

## Decisions

### 1. 时间统一方案：前端格式化时强制 UTC+8

**决策**：在前端创建统一的时区格式化函数，将 UTC 时间戳转换为北京时间（UTC+8）显示。

**理由**：
- 后端存储的 `CURRENT_TIMESTAMP` 已经是北京时间，但以 UTC 时间戳形式存储
- 前端只需在显示时添加 +8 小时偏移即可
- 避免引入 dayjs 等库，保持项目轻量
- 创建 `formatBeijingTime()` 工具函数，全局复用

**替代方案**：
- 后端返回带时区信息的时间字符串 → 增加后端复杂度，且 SQLite 不支持时区
- 配置服务器时区为 UTC → 需要运维变更，且当前服务器已是北京时间

**实现**：
```typescript
function formatBeijingTime(timestamp: string): string {
  const date = new Date(timestamp);
  // 获取 UTC 时间并手动添加 8 小时偏移
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const beijingTime = new Date(utc + (8 * 3600000));
  return beijingTime.toLocaleString('zh-CN', { timeZone: 'UTC' });
}
```

### 2. 小屏幕优化：表格横向滚动 + 关键字段不换行

**决策**：为申请记录列表表格添加横向滚动容器，关键字段使用 `whitespace-nowrap` 防止换行。

**理由**：
- 表格数据本身适合横向滚动而非堆叠（保持对比性）
- Tailwind 的 `overflow-x-auto` 原生支持，无需20264 改动量小
- `whitespace-nowrap` 确保标题和正文不换行

**实现**：
- 在 `<table>` 外层包裹 `<div className="overflow-x-auto">`
- 对 `<th>` 和 `<td>` 添加 `whitespace-nowrap` 类
- 考虑在小屏幕上隐藏次要列（如 IP 地址）

### 3. 管理员删除功能：独立页面 + 软删除

**决策**：在导航栏增加"申请管理"入口，创建独立的 `AdminApplicationsPage`，支持单条删除操作。

**理由**：
- 独立页面职责清晰，不污染现有 Dashboard
- 单条删除带确认对话框，降低误操作风险
- 后端 API 需要管理员认证中间件保护

**API 设计**：
- `DELETE /api/admin/applications/:id` - 删除单条申请记录
- 返回 `{ success: true, message: "删除成功" }`

**UI 流程**：
1. 导航栏点击"申请管理" → 进入列表页
2. 每条记录显示删除按钮
3. 点击删除 → 弹出确认对话框
4. 确认后调用 API → 成功后刷新列表

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 前端手动时区转换可能在边缘情况出错（如夏令时） | 北京时间无夏令时，且使用 `timeZone: 'UTC'` 参数避免系统时区干扰 |
| 横向滚动在触屏设备上可能不够直观 | 添加视觉提示（如滚动条样式或提示文字） |
| 误删除申请记录无法恢复 | 首期不支持软删除，后续可添加 `deleted_at` 字段实现回收站 |
| 删除 API 被恶意调用 | 后端严格验证管理员权限（现有 `authMiddleware`） |
| 小屏幕隐藏 IP 列可能影响审计能力 | IP 列仅在极小屏幕（<640px）隐藏，管理员页面始终显示 |

## Migration Plan

1. **前端时区函数**：创建工具函数后，全局替换 4 处 `toLocaleString('zh-CN')` 调用
2. **表格响应式**：仅添加 CSS 类，无破坏性变更
3. **删除功能**：新增 API 和页面，不影响现有功能
4. **无需数据库迁移**：不涉及数据模型变更
5. **回滚策略**：所有变更均为新增或修改，Git revert 即可回滚

## Open Questions

- 是否需要支持批量删除？（首期暂不实现，根据用户反馈决定）
- 删除操作是否需要记录审计日志？（建议后续添加 `operation_logs` 表）
