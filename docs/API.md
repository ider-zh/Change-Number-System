# API 文档

## 基础信息

- **Base URL**: `http://localhost:3001/api`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON

## 统一响应格式

所有 API 响应遵循以下格式:

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "error": null
}
```

### 错误响应

```json
{
  "success": false,
  "data": null,
  "message": "错误描述",
  "error": "详细错误信息 (可选)"
}
```

---

## 1. 项目代号管理

### 1.1 获取项目列表

**请求**
```
GET /api/projects
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 过滤状态: approved, pending, rejected |

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "ALPHA01",
      "name": "Alpha Project 01",
      "status": "approved",
      "created_by": null,
      "created_at": "2024-01-01T10:00:00Z",
      "approved_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### 1.2 创建项目 (管理员)

**请求**
```
POST /api/projects
Authorization: Bearer <token>
```

**请求体**
```json
{
  "code": "NEW001",
  "name": "New Project"
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "code": "NEW001",
    "name": "New Project",
    "status": "approved",
    "created_at": "2024-01-01T10:00:00Z"
  },
  "message": "项目创建成功"
}
```

### 1.3 申请新项目 (用户)

**请求**
```
POST /api/projects/request
```

**请求体**
```json
{
  "project_code": "REQUEST01",
  "project_name": "Requested Project",
  "applicant_name": "张三"
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": "张三",
    "project_code": "REQUEST01",
    "project_name": "Requested Project",
    "status": "pending",
    "created_at": "2024-01-01T10:00:00Z"
  },
  "message": "项目申请已提交,等待管理员审核"
}
```

### 1.4 审核项目申请 (管理员)

**请求**
```
PUT /api/projects/:id/review
Authorization: Bearer <token>
```

**请求体**
```json
{
  "status": "approved",
  "reviewer_note": "审核通过"
}
```

---

## 2. 编号类型管理

### 2.1 获取编号类型列表

**请求**
```
GET /api/number-types
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 过滤状态 |

**响应示例**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type_code": "CR",
      "type_name": "Change Request",
      "description": "",
      "status": "approved"
    }
  ]
}
```

### 2.2 创建编号类型 (管理员)

**请求**
```
POST /api/number-types
Authorization: Bearer <token>
```

**请求体**
```json
{
  "type_code": "NEW",
  "type_name": "New Type",
  "description": "Description"
}
```

### 2.3 申请新编号类型 (用户)

**请求**
```
POST /api/number-types/request
```

**请求体**
```json
{
  "type_code": "REQ01",
  "type_name": "Requested Type",
  "description": "Description",
  "applicant_name": "张三"
}
```

---

## 3. 申请记录管理

### 3.1 提交编号申请

**请求**
```
POST /api/applications
```

**请求体**
```json
{
  "applicant_name": "张三",
  "project_code": "ALPHA01",
  "number_type": "CR"
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "applicant_name": "张三",
    "project_code": "ALPHA01",
    "number_type": "CR",
    "serial_number": 1,
    "full_number": "CR-ALPHA01-0001",
    "created_at": "2024-01-01T10:00:00Z"
  },
  "message": "申请提交成功"
}
```

### 3.2 获取申请列表

**请求**
```
GET /api/applications
```

**查询参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 (默认 1) |
| limit | number | 否 | 每页条数 (默认 10) |
| keyword | string | 否 | 关键字搜索 |
| project_code | string | 否 | 项目代号过滤 |
| number_type | string | 否 | 编号类型过滤 |
| applicant_name | string | 否 | 申请人姓名 |

**响应示例**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "applicant_name": "张三",
        "project_code": "ALPHA01",
        "number_type": "CR",
        "serial_number": 1,
        "full_number": "CR-ALPHA01-0001",
        "created_at": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 3.3 获取统计数据

**请求**
```
GET /api/applications/stats
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "byType": [
      { "number_type": "CR", "count": 50 },
      { "number_type": "DCP", "count": 30 }
    ],
    "byProject": [
      { "project_code": "ALPHA01", "count": 60 }
    ]
  }
}
```

### 3.4 删除申请记录 (管理员)

**单条删除**
```
DELETE /api/applications/:id
Authorization: Bearer <token>
```

**批量删除**
```
DELETE /api/applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": [1, 2, 3]
}
```

### 3.5 导出 CSV (管理员)

**请求**
```
GET /api/applications/export
Authorization: Bearer <token>
```

**响应**: CSV 文件下载

---

## 4. 管理员认证

### 4.1 登录

**请求**
```
POST /api/admin/login
```

**请求体**
```json
{
  "username": "admin",
  "password": "Aa123456"
}
```

**响应示例**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "admin"
  },
  "message": "登录成功"
}
```

### 4.2 登出

**请求**
```
POST /api/admin/logout
Authorization: Bearer <token>
```

**响应示例**
```json
{
  "success": true,
  "message": "登出成功"
}
```

---

## 5. 错误码说明

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突 (如重复代码) |
| 500 | 服务器内部错误 |

---

## 6. 示例代码

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// 登录获取 token
const login = async () => {
  const res = await api.post('/admin/login', {
    username: 'admin',
    password: 'Aa123456',
  });
  return res.data.data.token;
};

// 使用 token 请求
const getProjects = async (token: string) => {
  const res = await api.get('/projects', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data;
};

// 提交申请
const submitApplication = async (data: any) => {
  const res = await api.post('/applications', data);
  return res.data.data;
};
```

### cURL

```bash
# 登录
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Aa123456"}'

# 获取项目列表
curl http://localhost:3001/api/projects

# 创建项目 (需要认证)
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"code":"NEW001","name":"New Project"}'

# 提交申请
curl -X POST http://localhost:3001/api/applications \
  -H "Content-Type: application/json" \
  -d '{"applicant_name":"张三","project_code":"ALPHA01","number_type":"CR"}'
```
