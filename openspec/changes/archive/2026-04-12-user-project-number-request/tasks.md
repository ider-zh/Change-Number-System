## 1. 数据库迁移

- [x] 1.1 创建数据库迁移脚本，在 `backend/src/db/init.js` 中添加 `system_settings` 表的创建逻辑
- [x] 1.2 在数据库初始化时插入默认的功能开关记录（`allow_request_project: false`, `allow_request_number_type: false`）
- [x] 1.3 测试数据库迁移脚本，确保表创建和默认数据插入正确

## 2. 后端API开发

- [x] 2.1 创建 `backend/src/routes/settings.js` 路由文件
- [x] 2.2 创建 `backend/src/controllers/settingsController.js` 控制器
- [x] 2.3 实现 `GET /api/settings/feature-toggles` 接口（公开访问）
- [x] 2.4 实现 `PUT /api/settings/feature-toggles` 接口（需管理员权限）
- [x] 2.5 在 `backend/src/app.js` 中注册新的路由
- [x] 2.6 编写后端API单元测试

## 3. 前端 - 管理员Dashboard

- [x] 3.1 在 `AdminDashboard.tsx` 中添加功能开关控制组件区域
- [x] 3.2 创建开关组件UI（使用Toggle或Switch组件）
- [x] 3.3 实现获取开关状态的API调用
- [x] 3.4 实现更新开关状态的API调用
- [x] 3.5 添加开关状态变更的成功/失败提示
- [x] 3.6 测试管理员开关控制功能（手动测试）

## 4. 前端 - 用户申请界面

- [x] 4.1 在 `ApplicationForm.tsx` 中添加功能开关状态加载逻辑
- [x] 4.2 实现从API获取开关状态并缓存到localStorage的逻辑
- [x] 4.3 实现从localStorage读取缓存开关状态的逻辑
- [x] 4.4 添加缓存过期检查（5分钟）
- [x] 4.5 根据 `allow_request_project` 开关状态条件渲染"申请新项目代号"入口
- [x] 4.6 根据 `allow_request_number_type` 开关状态条件渲染"申请新编号类型"入口
- [x] 4.7 测试开关关闭时UI正确隐藏（手动测试）
- [x] 4.8 测试开关开启时UI正确显示（手动测试）

## 5. 集成测试和验证

- [x] 5.1 端到端测试：管理员关闭开关后，用户界面立即反映变化
- [x] 5.2 验证默认状态下（关闭）用户无法看到申请入口
- [x] 5.3 验证管理员开启开关后用户可以看到申请入口
- [x] 5.4 测试缓存过期后重新获取最新开关状态
- [x] 5.5 验证非管理员无法调用更新开关的API
