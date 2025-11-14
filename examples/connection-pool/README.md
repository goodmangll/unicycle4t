# 连接池管理示例

这个示例展示了如何使用 Unicycle4T 构建一个高效的数据库连接池管理系统。

## 🎯 应用场景

连接池是许多应用的关键组件：
- 数据库连接管理
- HTTP客户端连接池
- Redis连接池
- 消息队列连接管理
- 网络连接复用

## 🏗️ 架构设计

### 核心组件

1. **ConnectionPool** - 连接池管理器
   - 连接的创建、获取、释放、销毁
   - 容量管理和并发控制
   - 健康检查和自动维护
   - 性能监控和统计

2. **ConnectionInfo** - 连接信息结构
   - 连接配置和状态
   - 使用统计和错误记录
   - 时间戳和生命周期信息

### 连接状态流转

```
IDLE → BUSY → IDLE → ... → EXPIRED/ERROR → REMOVED
```

## 🚀 运行示例

### 安装依赖
```bash
cd examples/connection-pool
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

### 1. 连接池初始化
```typescript
// 创建连接池
const connectionPool = new ConnectionPool(
  {
    host: 'localhost',
    port: 5432,
    database: 'myapp'
  },
  {
    minConnections: 5, // 最小连接数
    maxConnections: 20, // 最大连接数
    idleTimeout: 300000, // 空闲超时 5分钟
    maxLifetime: 3600000 // 最大生命周期 1小时
  }
)

// 初始化连接池
await connectionPool.initialize()
```

### 2. 连接获取和释放
```typescript
// 获取连接
const connectionId = await connectionPool.acquireConnection('user123')
if (connectionId) {
  try {
    // 使用连接执行数据库操作
    await performDatabaseOperation(connectionId)
  }
  finally {
    // 释放连接
    await connectionPool.releaseConnection(connectionId)
  }
}
```

### 3. 并发访问控制
```typescript
// 并发获取连接（自动控制并发数）
const promises = users.map(async (user) => {
  const connection = await connectionPool.acquireConnection(user.id)
  if (connection) {
    await processUserRequest(user, connection)
    await connectionPool.releaseConnection(connection)
  }
})

await Promise.all(promises)
```

### 4. 健康检查和维护
```typescript
// 自动健康检查（内置）
// 连接池会定期检查连接健康状态
// 自动移除不健康的连接

// 手动维护
const reapedCount = await connectionPool.reapIdleConnections()
console.log(`回收了 ${reapedCount} 个空闲连接`)
```

### 5. 性能监控
```typescript
// 获取连接池统计
const stats = connectionPool.getStats()
console.log({
  totalConnections: stats.totalConnections, // 总连接数
  poolUtilization: stats.poolUtilization, // 连接池利用率
  averageUseTime: stats.averageUseTime, // 平均使用时间
  totalErrors: stats.totalErrors // 总错误次数
})

// 获取连接详情
const details = await connectionPool.getConnectionDetails()
details.forEach((conn) => {
  console.log(`连接 ${conn.id}: 使用${conn.usageCount}次`)
})
```

## 🎯 学习要点

### 1. 生命周期映射
- **created** → 连接创建
- **started** → 连接激活（可用）
- **stopped** → 连接停止（维护或销毁）
- **deleted** → 连接完全移除

### 2. 连接池管理算法

```typescript
// 连接分配策略示例
class ConnectionPool {
  async acquireConnection(userId?: string): Promise<string | null> {
    // 1. 尝试从空闲池获取
    // 2. 检查连接有效性
    // 3. 如果无效则创建新连接
    // 4. 检查容量限制
    // 5. 标记为忙碌状态
  }
}
```

### 3. 容量控制机制
```typescript
// 容量管理
if (this.stats.totalConnections < this.maxConnections) {
  // 可以创建新连接
  return await this.createConnection()
}
else {
  // 连接池已满，等待或拒绝
  return null
}
```

## 🔧 生产环境增强

### 1. 真实数据库连接
```typescript
class DatabaseConnectionPool extends ConnectionPool {
  protected async createRealConnection(): Promise<DatabaseConnection> {
    return new DatabaseConnection({
      host: this.config.host,
      port: this.config.port,
      // 真实的数据库连接参数
    })
  }

  protected async performHealthCheck(connectionId: string): Promise<boolean> {
    const conn = await this.getConnection(connectionId)
    try {
      await conn.ping() // 真实的ping查询
      return true
    }
    catch {
      return false
    }
  }
}
```

### 2. 连接预热
```typescript
async function warmupConnectionPool(pool: ConnectionPool): Promise<void> {
  // 预创建连接到最小容量
  await pool.initialize()

  // 预执行一些简单查询来初始化连接
  const connections = []
  for (let i = 0; i < 3; i++) {
    const conn = await pool.acquireConnection('warmup')
    if (conn) {
      await performSimpleQuery(conn)
      connections.push(conn)
    }
  }

  // 释放预热连接
  for (const conn of connections) {
    await pool.releaseConnection(conn)
  }
}
```

### 3. 连接泄漏检测
```typescript
class LeakDetectionPool extends ConnectionPool {
  private checkoutTimes = new Map<string, number>()

  async acquireConnection(userId?: string): Promise<string | null> {
    const connectionId = await super.acquireConnection(userId)
    if (connectionId) {
      this.checkoutTimes.set(connectionId, Date.now())
    }
    return connectionId
  }

  async releaseConnection(connectionId: string): Promise<boolean> {
    this.checkoutTimes.delete(connectionId)
    return await super.releaseConnection(connectionId)
  }

  detectLeaks(): void {
    const now = Date.now()
    for (const [connectionId, checkoutTime] of this.checkoutTimes) {
      if (now - checkoutTime > 300000) { // 5分钟
        console.warn(`🚨 检测到连接泄漏: ${connectionId}`)
      }
    }
  }
}
```

## 📊 性能特性

- **高效复用** - 避免频繁创建/销毁连接的开销
- **并发控制** - 限制最大连接数，防止资源耗尽
- **自动维护** - 定期清理空闲和不健康连接
- **实时监控** - 完整的统计信息和性能指标
- **故障恢复** - 自动检测和替换异常连接

## 🚨 最佳实践

### 1. 连接池配置
```typescript
// 根据应用特点配置合适的参数
const pool = new ConnectionPool(config, {
  minConnections: Math.ceil(expectedConcurrency * 0.2), // 20%作为最小连接
  maxConnections: Math.ceil(expectedConcurrency * 1.2), // 120%作为最大连接
  idleTimeout: 10 * 60 * 1000, // 10分钟空闲超时
  maxLifetime: 60 * 60 * 1000 // 1小时最大生命周期
})
```

### 2. 错误处理

```typescript
async function safeDatabaseOperation(operation: () => Promise<any>): Promise<any> {
  const connection = await connectionPool.acquireConnection()
  if (!connection) {
    throw new Error('无法获取数据库连接')
  }

  try {
    return await operation(connection)
  }
  catch (error) {
    console.error('数据库操作失败:', error)
    throw error
  }
  finally {
    // 确保连接被释放
    await connectionPool.releaseConnection(connection).catch((err) => {
      console.error('释放连接失败:', err)
    })
  }
}
```

### 3. 监控和告警
```typescript
// 定期检查连接池健康状态
setInterval(() => {
  const stats = connectionPool.getStats()

  if (stats.poolUtilization > 0.8) {
    alert('连接池利用率过高')
  }

  if (stats.totalErrors > stats.totalCheckouts * 0.1) {
    alert('连接错误率过高')
  }
}, 30000) // 每30秒检查一次
```

## 📈 监控指标

### 关键指标
- **连接池利用率** - 反映连接池使用效率
- **平均获取时间** - 衡量连接池性能
- **连接创建/销毁频率** - 评估配置是否合理
- **错误率** - 监控连接健康状态
- **泄漏检测** - 发现连接泄漏问题

### 告警阈值建议
- 连接池利用率 > 80% - 需要扩容
- 平均获取时间 > 100ms - 性能问题
- 错误率 > 5% - 连接健康问题
- 连接使用时间 > 5分钟 - 可能存在泄漏

## 📖 相关示例

- [基础用法示例](../basic-usage/) - 学习核心API
- [Web会话管理示例](../web-session-manager/) - 了解状态管理
- [缓存管理示例](../cache-manager/) - 了解资源管理

## 🎯 实际应用

这个示例可以直接用于：
- 数据库连接池（MySQL、PostgreSQL、MongoDB）
- HTTP客户端连接池
- Redis连接池
- 消息队列连接池
- 自定义网络连接管理

## 🔗 扩展方向

1. **分布式连接池** - 多实例连接协调
2. **智能路由** - 读写分离、负载均衡
3. **连接加密** - SSL/TLS连接支持
4. **性能优化** - 连接预热、批量操作
5. **可观测性** - 链路追踪、性能分析
