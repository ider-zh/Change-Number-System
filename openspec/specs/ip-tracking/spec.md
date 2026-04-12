## ADDED Requirements

### Requirement: 系统自动记录申请IP地址

系统 SHALL 在每次申请提交时自动从 HTTP 请求中提取客户端 IP 地址并保存到数据库。

#### Scenario: 直接访问时提取IP
- **WHEN** 用户直接访问后端 API (无代理)
- **THEN** 系统从 `req.ip` 或 `req.connection.remoteAddress` 提取 IP 地址

#### Scenario: 通过代理访问时提取真实IP
- **WHEN** 用户通过反向代理访问,请求头包含 `X-Forwarded-For`
- **THEN** 系统从 `X-Forwarded-For` 第一个值提取真实客户端 IP

#### Scenario: IP地址存储到数据库
- **WHEN** 申请记录创建时
- **THEN** 系统将提取的 IP 地址保存到 `ip_address` 字段

### Requirement: IP地址仅对管理员可见

系统 SHALL 确保 `ip_address` 字段仅在管理员查询申请记录时返回,普通用户接口过滤此字段。

#### Scenario: 管理员接口返回IP地址
- **WHEN** 管理员调用 `GET /api/applications?scope=admin`
- **THEN** 返回的每条申请记录包含 `ip_address` 字段

#### Scenario: 普通用户接口不返回IP地址
- **WHEN** 普通用户调用 `GET /api/applications`
- **THEN** 返回的申请记录不包含 `ip_address` 字段

#### Scenario: 导出CSV时包含IP地址
- **WHEN** 管理员调用 `GET /api/applications/export`
- **THEN** 导出的 CSV 文件包含"申请IP"列

### Requirement: 支持IP地址格式验证

系统 SHALL 验证提取的 IP 地址格式,仅接受有效的 IPv4 或 IPv6 地址。

#### Scenario: 有效IPv4地址
- **WHEN** 提取的 IP 地址为 `192.168.1.100`
- **THEN** 系统验证格式有效并正常保存

#### Scenario: 有效IPv6地址
- **WHEN** 提取的 IP 地址为 `::1` 或 `2001:0db8:85a3:0000:0000:8a2e:0370:7334`
- **THEN** 系统验证格式有效并正常保存

#### Scenario: 无效IP地址处理
- **WHEN** 无法提取有效格式的 IP 地址
- **THEN** 系统将 `ip_address` 设为 `NULL` 并记录警告日志
