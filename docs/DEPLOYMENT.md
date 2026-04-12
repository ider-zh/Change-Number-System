# 部署指南

## 系统要求

- Node.js >= 18.0
- npm >= 9.0
- 操作系统: Windows / Linux / macOS

## 项目结构

```
Change-Number-System/
├── frontend/          # React 前端应用
├── backend/           # Node.js 后端服务
├── docs/              # 文档
└── README.md
```

---

## 开发环境部署

### 1. 克隆项目

```bash
git clone <repository-url>
cd Change-Number-System
```

### 2. 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 3. 配置环境变量

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件:

```env
PORT=3001
NODE_ENV=development
DB_PATH=./data/app.db
JWT_SECRET=your-secret-key-change-in-production
ADMIN_PASSWORD=Aa123456
```

### 4. 启动开发服务器

在项目根目录创建 `package.json` 脚本:

```json
{
  "scripts": {
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
  }
}
```

安装 concurrently:

```bash
npm install -D concurrently
npm run dev
```

访问:
- 前端: http://localhost:3000
- 后端: http://localhost:3001

---

## 生产环境部署

### 1. 构建前端

```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist/` 目录。

### 2. 配置后端使用静态文件

编辑 `backend/src/app.js`:

```javascript
const path = require('path');

// 在生产环境提供前端静态文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));
  
  // 所有未匹配的路由返回 index.html (支持 SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
  });
}
```

### 3. 启动后端服务

```bash
cd backend
NODE_ENV=production npm start
```

### 4. 使用 PM2 管理进程 (推荐)

安装 PM2:

```bash
npm install -g pm2
```

创建 `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'number-system',
    cwd: './backend',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

启动:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Docker 部署 (可选)

### 1. 创建 Dockerfile

```dockerfile
# 前端构建
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 后端服务
FROM node:18-alpine
WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist ../frontend/dist

EXPOSE 3001

CMD ["node", "server.js"]
```

### 2. 构建镜像

```bash
docker build -t number-system:latest .
```

### 3. 运行容器

```bash
docker run -d \
  -p 3001:3001 \
  -v $(pwd)/data:/app/data \
  -e JWT_SECRET=your-secret \
  number-system:latest
```

---

## 数据库备份

SQLite 数据库文件位于 `backend/data/app.db`。

### 备份

```bash
cp backend/data/app.db backend/data/app.db.backup
```

### 恢复

```bash
cp backend/data/app.db.backup backend/data/app.db
```

---

## 常见问题

### 1. 端口冲突

**问题**: 端口 3000 或 3001 已被占用

**解决方案**: 修改环境变量文件中的 `PORT` 值。

### 2. 数据库锁定

**问题**: SQLite 数据库锁定错误

**解决方案**: 
- 确保使用 WAL 模式
- 检查是否有多个进程同时访问数据库
- 增加 `busy_timeout` 值

### 3. 管理员密码忘记

**解决方案**: 
- 删除 `backend/data/app.db` 文件
- 重启服务会自动生成新的管理员密码
- 查看控制台输出的默认密码

### 4. 前端构建失败

**解决方案**:
```bash
cd frontend
rm -rf node_modules
npm install
npm run build
```

---

## 性能优化建议

1. **启用 Gzip 压缩**: 在后端添加 compression 中间件
2. **使用 CDN**: 将前端静态资源部署到 CDN
3. **数据库索引**: 为常用查询字段添加索引
4. **缓存策略**: 配置适当的 HTTP 缓存头
5. **反向代理**: 使用 Nginx 作为反向代理

---

## 监控和日志

### 1. 应用日志

```bash
# 使用 PM2 查看日志
pm2 logs number-system

# 查看实时日志
pm2 logs number-system --lines 100
```

### 2. 健康检查

```bash
curl http://localhost:3001/api/health
```

预期响应:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

---

## 安全建议

1. **修改默认管理员密码**: 首次部署后立即修改
2. **使用 HTTPS**: 生产环境必须启用
3. **设置强 JWT Secret**: 至少 32 位随机字符
4. **定期备份数据库**: 至少每天一次
5. **限制访问 IP**: 如有需要,配置防火墙规则
6. **更新依赖**: 定期运行 `npm audit` 并更新漏洞依赖

---

## 版本更新

```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
cd frontend && npm install
cd ../backend && npm install

# 重新构建前端
cd ../frontend && npm run build

# 重启服务
pm2 restart number-system
```

---

## 回滚策略

```bash
# 查看历史版本
git log --oneline -10

# 回滚到指定版本
git checkout <commit-hash>

# 重新构建和部署
cd frontend && npm run build
pm2 restart number-system
```
