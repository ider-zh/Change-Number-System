## Context

当前系统是一个基于 React + TypeScript + Express + SQLite 的自动取号管理系统。现有功能包括：
- 用户编号申请（自动生成流水号）
- 项目代号和编号类型的申请与审核
- 申请记录管理（搜索、过滤、分页）
- 管理员审核机制

**当前问题：**
1. 项目列表（ApplicationForm 中的下拉）无排序筛选功能，项目增多后查找困难
2. 申请记录中的完整编号无法复制，用户体验差
3. 新提交的申请记录无明显标识，用户难以确认是否提交成功
4. 用户申请的新项目/新编号类型必须等管理员审核通过后才能使用，流程不够灵活
5. 取号操作无任何防重复提交机制，容易误操作
6. 关键操作（申请新项目、新编号类型、提交申请）无人机验证，存在安全风险

**约束条件：**
- 前端使用 React 18 + TypeScript + Vite
- 后端使用 Express + better-sqlite3
- 必须使用 @cap.js/server + cap.js 实现人机验证，不依赖其他技术栈
- 数据库为 SQLite，需保持向后兼容

## Goals / Non-Goals

**Goals:**
- 提升项目列表的可查找性和可用性（过滤、排序）
- 改善编号复制体验（点击即复制）
- 提高新申请记录的可见性（高亮显示）
- 允许未审核的项目/编号类型在限定条件下使用
- 防止重复取号（倒计时机制）
- 关键操作增加人机验证防护

**Non-Goals:**
- 不改变现有的审核流程（管理员仍可审核/拒绝）
- 不修改数据库的核心表结构（仅新增必要的字段）
- 不引入额外的第三方人机验证服务（如 reCAPTCHA）
- 不改变管理员权限模型

## Decisions

### 1. 项目列表过滤排序组件

**Decision:** 在 ApplicationForm 中替换现有 Select 组件为自定义的 FilterableProjectSelector 组件
- 使用 react-select 或自定义实现，支持输入搜索、状态筛选、时间排序
- 默认按 created_at 降序排列（最新项目在前）
- 支持按项目状态（approved/pending/rejected）筛选

**Rationale:** react-select 是成熟的库，但为减少依赖，优先使用原生实现。自定义组件可以更好控制样式和性能。

### 2. 编号点击复制功能

**Decision:** 使用 Clipboard API (navigator.clipboard.writeText) 实现
- 在 ApplicationList 的 full_number 列添加点击事件和复制图标
- 复制成功后显示 Toast 通知（使用 react-hot-toast 或自定义）
- 提交申请后生成的编号也添加相同功能，并增加视觉强调（高亮 + 放大）

**Rationale:** 现代浏览器均支持 Clipboard API，无需额外依赖。降级方案：对不支持的浏览器使用 document.execCommand('copy')。

### 3. 新申请记录高亮

**Decision:** 在前端使用时间戳比较实现高亮
- ApplicationForm 提交成功后，传递新记录的 created_at 给 ApplicationList
- ApplicationList 对比每条记录的 created_at 与参考时间，30 秒内的记录显示高亮
- 高亮样式：淡黄色背景 + 左侧蓝色边框 + 脉冲动画（3 秒后停止）

**Rationale:** 无需后端改动，纯前端实现。30 秒窗口足够用户识别新记录，脉冲动画吸引注意力但不过度干扰。

### 4. 未审核项目/编号类型的使用

**Decision:** 修改 ApplicationForm 和后端验证逻辑
- 前端：下拉中显示 pending 状态的项目/编号类型，标注"（待审核）"
- 后端：createApplication 时允许 project.status IN ('approved', 'pending') 和 number_type.status IN ('approved', 'pending')
- 数据库：无需改动，仅修改验证逻辑

**Rationale:** 提升用户灵活性，用户可立即使用自己申请的资源。风险可控：仅允许 pending 状态，rejected 状态的仍不可用。

### 5. 取号倒计时机制

**Decision:** 前端 + 后端双重防护
- **前端:** 点击"取号"后按钮进入 10 秒倒计时，期间禁用
- **后端:** 记录用户最后一次取号时间（基于 IP），10 秒内拒绝重复请求
- **配置:** 管理员后台可调整倒计时时间（存储在 settings 表或环境变量）
- **实现:**  applications 表已有 ip_address 和 created_at，可直接查询判断

**Rationale:** 前端提供即时反馈，后端防止绕过。使用 IP 追踪无需新增认证机制。

### 6. 人机验证 (cap-widget + @cap.js/server)

**Decision:** 使用 cap-widget (前端 UI 组件) + @cap.js/server (后端验证服务) 实现

**架构流程:**
1. 前端使用 cap-widget 组件，endpoint 指向后端的 `/cap/` 路由
2. cap-widget 自动调用 `POST /cap/challenge` 获取挑战
3. 用户在浏览器端完成 proof-of-work 计算
4. cap-widget 调用 `POST /cap/redeem` 提交解决方案，获取验证 token
5. 前端将 token 附加到业务表单数据中提交
6. 后端业务接口使用 `cap.validateToken(token)` 验证

**后端实现:**
```javascript
// backend/src/cap.js - Cap 实例初始化
import Cap from "@cap.js/server";
import db from "./db/index.js";

// SQLite 存储实现
const capStorage = {
  challenges: {
    store: async (token, data, expires) => {
      db.prepare("INSERT OR REPLACE INTO cap_challenges (token, data, expires) VALUES (?, ?, ?)")
        .run(token, JSON.stringify(data), expires);
    },
    read: async (token) => {
      const row = db.prepare("SELECT * FROM cap_challenges WHERE token = ?").get(token);
      return row ? { data: JSON.parse(row.data), expires: row.expires } : null;
    },
    delete: async (token) => {
      db.prepare("DELETE FROM cap_challenges WHERE token = ?").run(token);
    },
    deleteExpired: async () => {
      db.prepare("DELETE FROM cap_challenges WHERE expires < ?").run(Date.now());
    }
  },
  tokens: {
    store: async (key, expires) => {
      db.prepare("INSERT OR REPLACE INTO cap_tokens (key, expires) VALUES (?, ?)").run(key, expires);
    },
    get: async (key) => {
      const row = db.prepare("SELECT * FROM cap_tokens WHERE key = ?").get(key);
      return row ? { expires: row.expires } : null;
    },
    delete: async (key) => {
      db.prepare("DELETE FROM cap_tokens WHERE key = ?").run(key);
    },
    deleteExpired: async () => {
      db.prepare("DELETE FROM cap_tokens WHERE expires < ?").run(Date.now());
    }
  }
};

const cap = new Cap({ storage: capStorage });
export default cap;
```

**新增路由:**
```javascript
// backend/src/routes/cap.js
import express from "express";
import cap from "../cap.js";

const router = express.Router();

router.post("/challenge", async (req, res) => {
  res.json(await cap.createChallenge());
});

router.post("/redeem", async (req, res) => {
  const { token, solutions } = req.body;
  if (!token || !solutions) return res.status(400).json({ success: false });
  res.json(await cap.redeemChallenge({ token, solutions }));
});

export default router;
```

**业务接口验证:**
```javascript
// 在 applicationController.js 中
import cap from "../cap.js";

async function createApplication(req, res) {
  const { capToken, ...formData } = req.body;
  const { success } = await cap.validateToken(capToken, { keepToken: false });
  if (!success) return res.status(400).json({ error: "人机验证失败" });
  // ... 业务逻辑
}
```

**前端实现:**
- 前端已有 Tailwind CSS 4 + shadcn/ui 基础环境（cn(), clsx, tailwind-merge, Radix UI），但缺少 `components.json` 配置文件。
- 方案 A（推荐）：先初始化 shadcn 配置，再添加 cap-widget
  ```bash
  cd frontend
  npx shadcn@latest init -d -y
  pnpm dlx shadcn@latest add "https://ui.ednesdayw.com/r/cap-widget.json"
  ```
- 方案 B（备选）：若方案 A 失败，手动从 URL 下载组件代码并放置到 `src/components/ui/cap-widget.tsx`

- 在表单中嵌入组件:
  ```jsx
  <CapWidget
    endpoint={`${API_BASE_URL}/cap/`}
    workerCount={navigator.hardwareConcurrency || 8}
    onSolve={(token) => setCapToken(token)}
    onError={(msg) => setCapError(msg)}
    locale={{
      initial: "我不是机器人",
      verifying: "验证中...",
      solved: "验证成功 ✓",
      error: "验证失败"
    }}
  />
  ```
- 提交时携带 capToken:
  ```javascript
  await applicationAPI.create({ ...formData, capToken });
  ```

**数据库表:**
需新增两张表（使用现有 SQLite WAL 模式）:
```sql
CREATE TABLE IF NOT EXISTS cap_challenges (
  token TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  expires INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cap_tokens (
  key TEXT PRIMARY KEY,
  expires INTEGER NOT NULL
);
```

**依赖安装:**
```bash
# 后端
cd backend && npm install @cap.js/server

# 前端 - 使用 shadcn 添加组件（需要前端已配置 shadcn/ui 基础环境）
cd frontend && pnpm dlx shadcn@latest add "https://ui.ednesdayw.com/r/cap-widget.json"
```

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| cap-widget 依赖 shadcn/ui 基础组件 | 中等 | 若前端无 shadcn 基础，需手动创建组件及 CSS 变量 |
| WebAssembly 加载失败 | 低 | 检查 WASM 可用性，提供降级提示 |
| 倒计时后端基于 IP 判断 | 低 | NAT 环境下多用户共享 IP 可能互相影响，但取号场景影响有限 |
| 允许 pending 资源使用 | 低 | 若项目/编号类型最终被拒绝，已生成的申请记录不受影响 |
| Clipboard API 不支持旧浏览器 | 低 | 降级到 execCommand 或显示提示 |

## Migration Plan

### 部署步骤

1. **安装依赖:**
   ```bash
   cd backend && npm install @cap.js/server
   cd frontend && pnpm dlx shadcn@latest add "https://ui.ednesdayw.com/r/cap-widget.json"
   ```

2. **数据库迁移:** 执行 SQL 创建 cap_challenges 和 cap_tokens 表

3. **后端部署:**
   - 创建 backend/src/cap.js（Cap 实例 + SQLite 存储实现）
   - 创建 backend/src/routes/cap.js（/cap/challenge 和 /cap/redeem 路由）
   - 在 app.js 中挂载 /cap 路由
   - 更新项目/编号类型查询接口支持过滤排序
   - 修改 createApplication 验证逻辑允许 pending 状态
   - 添加取号频率检查中间件
   - 在三个业务接口中添加 cap.validateToken 验证

4. **前端部署:**
   - 安装 cap-widget 组件
   - 创建 CapVerification 包装组件（携带 endpoint/locale）
   - 在三个表单中嵌入 cap-widget
   - 构建并替换组件
   - 测试所有新功能

5. **回滚策略:** 代码修改均为向后兼容，回滚只需恢复旧代码；数据库新增的 cap 表不影响现有功能，可选择保留或删除

### Open Questions

- [ ] cap.js 的 challengeDifficulty 和 expiresMs 参数需根据实际测试调整（建议 difficulty=4, expiresMs=600000）
- [ ] 管理员调整倒计时的 UI 放在哪个页面（建议：管理员设置页，本次新增）
- [ ] 高亮持续时间是否需要可配置（建议：先固定 30 秒，根据反馈调整）
- [ ] 前端是否已配置 shadcn/ui 基础环境（CSS 变量等），若无则需手动补充
