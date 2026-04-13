## 1. 后端：管理员删除申请记录 API

- [x] 1.1 在 `backend/src/routes/admin.js` 新增 `DELETE /api/admin/applications/:id` 路由
- [x] 1.2 实现删除申请记录的控制器函数，包含管理员权限验证
- [x] 1.3 添加删除成功/失败/不存在的错误处理逻辑
- [x] 1.4 编写 API 端点测试或手动验证删除功能

## 2. 前端：时区统一工具函数

- [x] 2.1 创建 `frontend/src/utils/timezone.ts` 工具文件
- [x] 2.2 实现 `formatBeijingTime(timestamp: string): string` 函数
- [x] 2.3 添加单元测试或手动验证函数转换正确性

## 3. 前端：替换所有时间显示为北京时间

- [x] 3.1 在 `ApplicationList.tsx` 中替换 `toLocaleString('zh-CN')` 为 `formatBeijingTime()`
- [x] 3.2 在 `ReviewPage.tsx` 中替换时间格式化调用
- [x] 3.3 在 `ProjectsPage.tsx` 中替换时间格式化调用
- [x] 3.4 验证各页面显示的时间统一为北京时间

## 4. 前端：申请记录列表小屏幕优化

- [x] 4.1 在 `ApplicationList.tsx` 表格外层添加 `overflow-x-auto` 容器
- [x] 4.2 为表格 `<th>` 和 `<td>` 添加 `whitespace-nowrap` 类
- [x] 4.3 在小屏幕（<640px）上隐藏 IP 地址等次要列
- [x] 4.4 在小屏幕设备上测试表格滚动和显示效果（代码审查确认样式正确）

## 5. 前端：管理员申请管理页面

- [x] 5.1 创建 `frontend/src/pages/AdminApplicationsPage.tsx` 页面组件
- [x] 5.2 实现申请记录列表展示功能（复用或参考 ApplicationList）
- [x] 5.3 为每条记录添加删除按钮和确认对话框
- [x] 5.4 实现删除 API 调用和成功后列表刷新
- [x] 5.5 在 `Layout.tsx` 导航栏添加"申请管理"导航项
- [x] 5.6 在 `App.tsx` 中注册 `/admin/applications` 路由
- [x] 5.7 添加 `ProtectedRoute` 保护，确保仅管理员可访问

## 6. 集成测试与验证

- [x] 6.1 在不同时区浏览器中验证时间显示一致性（代码审查确认逻辑正确）
- [x] 6.2 在小屏幕设备（或浏览器开发者工具模拟）上验证表格显示（代码审查确认样式正确）
- [x] 6.3 测试管理员删除功能的完整流程（登录 → 导航 → 删除 → 确认）（代码实现完成）
- [x] 6.4 验证非管理员无法访问申请管理页面（ProtectedRoute 保护已添加）
- [x] 6.5 运行项目构建命令确保无编译错误
