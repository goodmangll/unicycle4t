# Web会话管理示例

这个示例展示了如何使用 Unicycle4T 构建一个完整的Web会话管理系统。

## 🎯 应用场景

Web应用中的用户会话管理是一个典型的生命周期管理需求：
- 用户登录 → 创建会话
- 用户活动 → 更新会话
- 用户登出 → 销毁会话
- 会话超时 → 自动清理

## 🏗️ 架构设计

### 核心组件

1. **WebSessionManager** - 会话管理器
   - 创建、管理、销毁用户会话
   - 权限验证和更新
   - 会话过期处理

2. **SessionData** - 会话数据结构
   - 用户基本信息
   - 权限配置
   - 时间戳记录

3. **DemoWebServer** - 模拟Web服务器
   - 完整的用户会话流程演示
   - 权限管理演示
   - 会话过期处理演示

## 🚀 运行示例

### 安装依赖
```bash
cd examples/web-session-manager
pnpm install
```

### 运行示例
```bash
# 开发模式
pnpm dev

# 直接运行
pnpm start
```

## 📚 核心功能演示

### 1. 会话生命周期管理
```typescript
// 创建会话
const sessionId = await sessionManager.createSession(
  'user123',
  'alice',
  'alice@example.com',
  { read: true, write: true, admin: false, custom: ['profile'] },
  '192.168.1.100',
  'Mozilla/5.0...',
)

// 更新活动时间
await sessionManager.updateActivity(sessionId)

// 主动登出
await sessionManager.logout(sessionId)
```

### 2. 权限管理
```typescript
// 检查权限
const canRead = await sessionManager.checkPermission(sessionId, 'read')
const canWrite = await sessionManager.checkPermission(sessionId, 'write')

// 更新权限
const newPermissions = {
  read: true,
  write: true,
  admin: true,
  custom: ['reports', 'analytics'],
}
await sessionManager.updatePermissions(sessionId, newPermissions)
```

### 3. 会话过期处理
```typescript
// 自动检查会话是否过期
const sessionData = await sessionManager.getSession(sessionId)
if (sessionData === null) {
  // 会话已过期或不存在
}

// 定期清理过期会话（自动进行）
const sessionManager = new WebSessionManager(
  30 * 60 * 1000, // 30分钟会话超时
  5 * 60 * 1000, // 5分钟清理间隔
)
```

### 4. 事件监听
```typescript
// 监听会话事件
sessionManager.events.on('object:created', (data) => {
  console.log('会话创建:', data.object.getId())
})

sessionManager.events.on('object:stateChanged', (data) => {
  console.log('会话状态变更:', data.oldState.name, '→', data.newState.name)
})

sessionManager.events.on('object:deleted', (data) => {
  console.log('会话删除:', data.objectId)
})
```

## 🎯 学习要点

### 1. 生命周期映射
- **created** → 会话创建，用户登录
- **started** → 会话激活，用户可进行操作
- **stopped** → 会话停止，用户登出或会话过期
- **deleted** → 会话数据清理

### 2. 属性存储策略
```typescript
// 存储复杂会话数据
session.setAttribute('sessionData', {
  userId: 'user123',
  permissions: { read: true, write: true },
  loginTime: new Date(),
  lastActivity: new Date(),
})

// 存储状态标志
session.setAttribute('isActive', true)
session.setAttribute('role', 'admin')
```

### 3. 扩展性设计
- 通过继承 `LifecycleObject` 创建自定义会话对象
- 通过实现 `LifecycleDao` 支持持久化存储
- 通过事件系统集成外部监控和日志系统

### 4. 生产环境考虑
- 会话数据持久化（Redis、数据库）
- 分布式会话支持
- 负载均衡环境下的会话同步
- 安全性增强（会话加密、IP绑定）

## 📈 性能特性

- **O(1) 会话查找** - 基于Map的高效存储
- **内存效率** - 直接对象引用，避免序列化
- **自动清理** - 定期清理过期会话，防止内存泄漏
- **事件驱动** - 高效的事件通知机制

## 🔧 扩展建议

### 1. 持久化存储
```typescript
class RedisSessionDao implements LifecycleDao {
  // 使用Redis存储会话数据
  // 支持分布式部署
}
```

### 2. 高级功能
- 会话分析和统计
- 异常登录检测
- 会话热力图
- 自动权限升级

### 3. 安全增强
- 会话固定攻击防护
- 跨站请求伪造(CSRF)保护
- 会话加密
- IP地址验证

## 📖 相关示例

- [基础用法示例](../basic-usage/) - 学习核心API
- [任务队列示例](../task-queue/) - 了解异步处理
- [缓存管理示例](../cache-manager/) - 学习数据存储优化

## 🎯 实际应用

这个示例可以直接用于：
- Web应用的用户认证系统
- API服务的访问控制
- 分布式系统的会话管理
- 微服务的用户状态管理
