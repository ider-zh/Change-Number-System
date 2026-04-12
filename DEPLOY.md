# 生产环境部署指南

## 快速开始

### 1. 配置环境变量

```bash
cp .env.prod.example .env
# 编辑 .env 文件，修改以下配置：
# - ADMIN_PASSWORD: 管理员密码
# - JWT_SECRET: JWT 密钥（使用随机字符串）
```

### 2. 启动服务

```bash
# 启动所有服务（应用 + Watchtower）
docker compose -f docker-compose.prod.yml up -d

# 查看日志
docker compose -f docker-compose.prod.yml logs -f

# 查看单个服务日志
docker logs -f change-number-system
docker logs -f watchtower
```

### 3. 访问应用

- 前端: http://localhost:3000
- 健康检查: http://localhost:3001/api/health

## 自动更新机制

### Watchtower 配置

Watchtower 会每 5 分钟检查一次镜像更新：

| 配置项 | 说明 |
|--------|------|
| `--interval 300` | 每 300 秒（5 分钟）检查一次 |
| `--label-enable` | 只更新带有 watchtower label 的容器 |
| `--cleanup` | 自动清理旧镜像 |
| `--rolling-restart` | 滚动重启，保证服务可用性 |
| `--include-restarting` | 包含正在重启的容器 |
| `--lifecycle-hooks` | 启用生命周期钩子 |

### 生命周期钩子

| 脚本 | 触发时机 | 功能 |
|------|---------|------|
| `scripts/lifecycle/pre-update.sh` | 更新前 | 备份 SQLite 数据库 |
| `scripts/lifecycle/post-update.sh` | 更新后 | 验证服务健康状态 |

### 手动触发更新

```bash
# 立即检查并更新
docker exec watchtower --interval 10

# 或者重启容器以使用最新镜像
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## 数据库备份

自动备份存储在 `/app/data/backups/` 卷中：

```bash
# 查看备份
docker exec change-number-system ls -la /app/data/backups/

# 备份到宿主机
docker cp change-number-system:/app/data/backups/ ./backups/

# 手动备份数据库
docker exec change-number-system cp /app/data/app.db /app/data/backups/app-manual-$(date +%Y%m%d-%H%M%S).db
```

## 监控和维护

### 查看容器状态

```bash
docker ps
docker stats change-number-system
```

### 查看日志

```bash
# 应用日志
docker logs -f change-number-system

# Watchtower 日志
docker logs -f watchtower

# 最近 100 行日志
docker logs --tail 100 change-number-system
```

### 资源限制

应用容器资源限制：
- CPU: 0.5 核
- 内存: 512MB（限制）/ 256MB（预留）

### 停止服务

```bash
# 停止所有服务
docker compose -f docker-compose.prod.yml down

# 停止并删除卷（⚠️ 会删除数据）
docker compose -f docker-compose.prod.yml down -v
```

## 安全建议

1. **修改默认密码**：在 `.env` 中设置强密码
2. **JWT 密钥**：使用随机字符串作为 JWT_SECRET
3. **定期备份**：虽然自动备份已启用，建议定期将备份文件复制到安全位置
4. **HTTPS**：在生产环境中使用反向代理（如 Nginx）配置 HTTPS
5. **防火墙**：仅开放必要端口（3000）

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker compose -f docker-compose.prod.yml logs app

# 检查健康状态
docker inspect change-number-system | grep -A 10 Health
```

### 更新失败

```bash
# 查看 Watchtower 日志
docker logs watchtower

# 手动拉取镜像
docker pull crpi-yl4pb9sg5y2myg6f.cn-hangzhou.personal.cr.aliyuncs.com/9992099/change_number_system:latest
```

### 数据库恢复

```bash
# 从备份恢复
docker exec change-number-system cp /app/data/backups/app-YYYYMMDD-HHMMSS.db /app/data/app.db
docker restart change-number-system
```
