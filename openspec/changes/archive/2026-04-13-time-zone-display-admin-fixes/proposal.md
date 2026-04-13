## Why

当前系统存在三个需要修复的问题：

1. **时区显示不一致**：后端 SQLite 使用 `CURRENT_TIMESTAMP` 存储服务器本地时间（北京时间），但前端使用 `new Date(timestamp).toLocaleString('zh-CN')` 将时间戳解析为浏览器本地时区显示。当用户浏览器不在 UTC+8 时区时，网页显示会出现时间偏差（如"8小时前"的误差），导致用户看到错误的申请时间。

2. **小屏幕显示体验差**：主页申请记录列表的标题（head）和正文（body text）在小屏幕上会自动换行，导致表格内容难以阅读。当前完全没有针对小屏幕的响应式优化。

3. **管理员缺少删除功能**：管理员无法删除错误或测试申请记录，缺少基本的数据管理能力。

## What Changes

- 统一前后端时间处理为北京时间（UTC+8），确保所有用户看到一致的时间显示
- 优化主页申请记录列表的小屏幕显示，使用横向滚动或堆叠布局避免内容换行
- 为管理员增加删除申请记录的功能模块，包含导航入口、API 端点和 UI 交互

## Capabilities

### New Capabilities
- `admin-application-delete`: 管理员删除申请记录的能力，包括批量删除和单条删除

### Modified Capabilities
- `application-records`: 修改时间显示要求，从浏览器本地时区改为固定北京时间（UTC+8）显示
- `application-highlight`: 修改响应式显示要求，增加小屏幕适配规范

## Impact

- **前端**：`ApplicationList.tsx`、`ReviewPage.tsx`、`ProjectsPage.tsx` 的日期格式化逻辑
- **前端**：`ApplicationList.tsx` 表格响应式布局
- **前端**：`Layout.tsx` 导航栏增加删除管理入口
- **前端**：新增 `AdminApplicationsPage.tsx` 或集成到现有 Dashboard
- **后端**：新增 `DELETE /api/admin/applications/:id` API 端点
- **后端**：可能需要时区转换中间件或统一时间格式化函数
- **数据库**：无结构变更，仅涉及时间值的读取和显示方式
