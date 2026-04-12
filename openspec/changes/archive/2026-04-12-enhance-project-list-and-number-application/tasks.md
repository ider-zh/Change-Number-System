## 1. 数据库迁移

- [x] 1.1 在 backend/src/db/init.js 中添加 cap_challenges 表创建 SQL
- [x] 1.2 在 backend/src/db/init.js 中添加 cap_tokens 表创建 SQL
- [x] 1.3 验证数据库初始化后两张新表存在

## 2. Cap.js 后端服务

- [x] 2.1 在 backend 安装 @cap.js/server: `cd backend && npm install @cap.js/server`
- [x] 2.2 创建 backend/src/cap.js，初始化 Cap 实例并实现 SQLite storage 接口
- [x] 2.3 创建 backend/src/routes/cap.js，实现 POST /cap/challenge 和 POST /cap/redeem 路由
- [x] 2.4 在 backend/src/app.js 中挂载 /cap 路由
- [x] 2.5 测试 /cap/challenge 接口返回正确的挑战数据
- [x] 2.6 测试 /cap/redeem 接口验证解决方案

## 3. 项目列表过滤排序功能

- [x] 3.1 创建 FilterableProjectSelector 组件（支持搜索、筛选、排序）
- [x] 3.2 实现项目关键字搜索功能（前端过滤）
- [x] 3.3 实现项目状态筛选功能（approved/pending/全部）
- [x] 3.4 实现项目排序功能（默认按 created_at 降序）
- [x] 3.5 替换 ApplicationForm 中的 Select 为 FilterableProjectSelector
- [x] 3.6 更新后端 API `GET /api/projects` 支持 status 多值过滤（如 `?status=approved,pending`）
- [ ] 3.7 测试项目选择器的所有功能组合

## 4. 编号点击复制功能

- [x] 4.1 在 ApplicationList 的 full_number 列添加点击事件处理
- [x] 4.2 实现 navigator.clipboard.writeText 复制逻辑
- [x] 4.3 添加复制成功 Toast 通知（使用内联提示替代 Toast）
- [x] 4.4 添加鼠标悬停"点击复制"tooltip
- [x] 4.5 在 ApplicationForm 提交成功后的编号弹窗中添加复制功能
- [x] 4.6 为弹窗中的编号添加复制图标和高亮样式
- [ ] 4.7 测试复制功能在不同浏览器的兼容性

## 5. 新申请记录高亮显示

- [x] 5.1 在 ApplicationList 中实现时间戳比较逻辑（30 秒内创建的记录高亮）
- [x] 5.2 添加高亮 CSS 样式（淡黄色背景 + 左侧蓝色边框）
- [x] 5.3 实现 30 秒后自动移除高亮（基于服务器时间）
- [ ] 5.4 测试高亮功能在各种场景下的正确性

## 6. 允许使用未审核的项目/编号类型

- [x] 6.1 修改 ApplicationForm 加载逻辑，请求 `?status=approved,pending` 的项目和编号类型
- [x] 6.2 在 FilterableProjectSelector 中为 pending 状态的项目添加"已通过"/"待审核"/"已拒绝"状态标签
- [x] 6.3 修改后端 `POST /api/applications` 验证逻辑，允许 pending 状态的项目和编号类型
- [x] 6.4 添加对 rejected 状态项目/编号类型的拦截和错误提示
- [ ] 6.5 测试各种状态组合的提交场景

## 7. 取号倒计时机制

- [x] 7.1 在 ApplicationForm 提交按钮添加倒计时状态管理
- [x] 7.2 实现 10 秒倒计时逻辑（使用 setInterval）
- [x] 7.3 倒计时期间禁用提交按钮并显示倒计时文本
- [x] 7.4 倒计时结束后恢复按钮可用
- [x] 7.5 在后端添加基于 IP 的取号频率检查
- [x] 7.6 后端返回 429 错误时前端显示相应提示
- [ ] 7.7 创建管理员配置界面（系统设置页面）
- [ ] 7.8 实现倒计时配置的保存和读取
- [ ] 7.9 测试前后端倒计时协同工作

## 8. Cap-Widget 前端集成

- [x] 8.1 初始化 shadcn 配置（手动创建 components.json）
- [x] 8.2 安装 cap-widget 组件
- [x] 8.3 创建 CapVerification 包装组件（携带 endpoint 和中文 locale）
- [x] 8.4 在 ApplicationForm（提交申请）中嵌入 CapVerification 组件
- [x] 8.5 修改提交申请逻辑，携带 capToken 一起发送
- [x] 8.6 修改 `POST /api/applications` 接口添加 cap.validateToken 验证
- [x] 8.7 修改 `POST /api/projects/request` 接口添加 cap.validateToken 验证
- [x] 8.8 修改 `POST /api/number-types/request` 接口添加 cap.validateToken 验证
- [x] 8.9 添加验证失败的错误处理和用户提示
- [ ] 8.10 在申请新项目表单中嵌入 CapVerification 组件
- [ ] 8.11 在申请新编号类型表单中嵌入 CapVerification 组件
- [ ] 8.12 测试人机验证在三个表单中的完整流程

## 9. 集成测试与验收

- [ ] 9.1 端到端测试：申请新项目 → 使用新项目提交编号申请
- [ ] 9.2 端到端测试：申请新编号类型 → 使用新编号类型提交编号申请
- [ ] 9.3 测试人机验证阻止自动化提交
- [ ] 9.4 测试倒计时阻止重复提交
- [ ] 9.5 测试编号复制功能在所有场景下工作
- [ ] 9.6 测试新记录高亮正确显示和消失
- [ ] 9.7 测试管理员调整倒计时配置生效
- [ ] 9.8 在所有主流浏览器测试新功能
