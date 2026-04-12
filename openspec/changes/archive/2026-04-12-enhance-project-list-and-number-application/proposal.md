## Why

当前项目在用户体验和安全性方面存在改进空间：项目列表缺少筛选排序功能导致查找效率低；编号申请流程缺少人机验证和防重复提交机制；申请记录中的编号不可复制、新记录不突出，影响用户操作便利性。这些改进将提升系统的易用性、安全性和专业性。

## What Changes

- 项目列表增加带过滤、筛选、排序功能的组件，默认按时间排序
- 申请记录中完整编号支持点击复制到剪切板，提交申请后生成的编号也支持点击复制
- 申请记录中新提交的记录高亮显示
- 用户申请新项目/新编号类型后，即使未经审核也可使用和提交申请
- 取号功能增加倒计时机制（默认10s）防止重复取号，管理员可后台调整
- 关键操作（申请新项目、申请新编号类型、提交申请）增加人机验证，使用 @cap.js/server + cap.js 技术

## Capabilities

### New Capabilities
- `project-list-filter`: 项目列表的过滤、筛选、排序功能
- `number-copy-clipboard`: 编号点击复制功能
- `application-highlight`: 新申请记录高亮显示
- `unapproved-resource-usage`: 未审核项目/编号类型的使用权限
- `rate-limit-countdown`: 取号倒计时防重复机制
- `captcha-verification`: 基于 cap-widget + @cap.js/server 的人机验证功能
- `cap-api-endpoints`: 后端 /cap/challenge 和 /cap/redeem API 端点

### Modified Capabilities
- `application-submission`: 申请提交流程增加人机验证和编号高亮
- `project-management`: 项目列表展示和功能权限调整
- `number-type-management`: 编号类型列表和使用权限调整

## Impact

- **前端**: 项目列表组件、申请记录组件、申请提交表单、编号类型选择器、cap-widget 人机验证组件
- **后端**: 项目和编号类型查询接口（支持过滤排序）、/cap/challenge 和 /cap/redeem 端点、取号接口（倒计时）
- **数据库**: 新增 cap_challenges 和 cap_tokens 两张表（SQLite WAL 模式）
- **依赖**: 新增 @cap.js/server（后端）、cap-widget shadcn 组件（前端）
- **管理员后台**: 新增取号倒计时配置项
