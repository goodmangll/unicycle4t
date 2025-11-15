# 缓存管理系统示例

这个示例展示了如何使用 Unicycle4T 构建一个高性能的内存缓存管理系统。

## 🎯 应用场景

缓存是许多应用的关键组件：
- Web应用数据缓存
- API响应缓存
- 数据库查询结果缓存
- 计算结果缓存
- 会话数据存储

## 🏗️ 架构设计

### 核心组件

1. **CacheManager** - 缓存管理器
   - 缓存项的创建、读取、删除
   - TTL（生存时间）管理
   - LRU（最近最少使用）淘汰策略
   - 性能统计和热点数据分析

2. **CacheItem** - 缓存项数据结构
   - 键值对存储
   - 访问统计信息
   - 时间戳记录
   - 大小计算

### 缓存生命周期

```
创建 → 激活 → 使用 → 过期/淘汰 → 清理
```

## 🚀 运行示例

### 安装依赖
```bash
cd examples/cache-manager
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

### 1. 基础缓存操作
```typescript
// 创建缓存管理器
const cache = new CacheManager(1000) // 最大1000项

// 设置缓存
await cache.set('user:123', { id: 123, name: 'Alice' }, 300000) // 5分钟TTL

// 获取缓存
const user = await cache.get('user:123')

// 检查是否存在
const exists = await cache.has('user:123')

// 删除缓存
await cache.delete('user:123')
```

### 2. TTL和自动过期
```typescript
// 设置不同TTL的缓存项
await cache.set('session:abc', data, 1800000) // 30分钟
await cache.set('cache:config', config, 86400000) // 24小时

// 自动过期检查（内置）
const expiredData = await cache.get('cache:expired') // 返回null如果已过期
```

### 3. LRU淘汰策略
```typescript
// 容量限制的缓存
const cache = new CacheManager(100) // 最大100项

// 当达到容量限制时，自动淘汰最久未使用的项
for (let i = 0; i < 150; i++) {
  await cache.set(`key:${i}`, `value:${i}`)
} // 会自动淘汰最旧的50项
```

### 4. 性能监控
```typescript
// 获取缓存统计
const stats = cache.getStats()
console.log({
  totalItems: stats.totalItems, // 总项数
  hitRate: stats.hitRate, // 命中率
  memoryUsage: stats.memoryUsage, // 内存使用量
  totalEvictions: stats.totalEvictions, // 淘汰次数
})

// 获取热点数据
const hotData = await cache.getHotData(10) // 访问最多的10项
```

### 5. 复杂数据类型支持
```typescript
// 支持各种JavaScript数据类型
await cache.set('user:object', {
  id: 1,
  profile: { name: 'John', age: 30 },
  tags: ['developer', 'javascript'],
  lastLogin: new Date(),
})

await cache.set('config:array', [
  { key: 'theme', value: 'dark' },
  { key: 'lang', value: 'zh-CN' },
])
```

## 🎯 学习要点

### 1. 生命周期映射
- **created** → 缓存项创建
- **started** → 缓存项激活（可访问）
- **stopped** → 缓存项停止（过期或淘汰）
- **deleted** → 缓存项清理

### 2. LRU算法实现
```typescript
// 双向链表 + 哈希表实现O(1)复杂度
class LRUCache {
  private head: LRUNode
  private tail: LRUNode
  private map: Map<string, LRUNode>

  private moveToHead(key: string): void {
    // O(1)时间复杂度
  }

  private evictLRU(): void {
    // O(1)时间复杂度
  }
}
```

### 3. 内存管理

```typescript
// 对象大小计算
function calculateSize(value: any): number {
  return JSON.stringify(value).length * 2 // 简化计算
}

// 内存使用统计
this.stats.memoryUsage += itemSize
```

## 🔧 生产环境增强

### 1. 持久化缓存
```typescript
class PersistentCache extends CacheManager {
  constructor(private storage: CacheStorage) {
    super()
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await super.set(key, value, ttl)
    await this.storage.save(key, value, ttl)
  }
}
```

### 2. 分布式缓存
```typescript
class DistributedCache extends CacheManager {
  constructor(private redis: RedisClient) {
    super()
  }

  async get(key: string): Promise<any> {
    // 先查本地缓存，再查Redis
    let value = await super.get(key)
    if (!value) {
      value = await this.redis.get(key)
      if (value) {
        await super.set(key, value)
      }
    }
    return value
  }
}
```

### 3. 缓存预热
```typescript
async function warmupCache(cache: CacheManager): Promise<void> {
  // 预加载热点数据
  const hotItems = await getHotItemsFromDatabase()
  for (const item of hotItems) {
    await cache.set(item.key, item.value, item.ttl)
  }
}
```

## 📊 性能特性

- **O(1) 访问复杂度** - 基于哈希表的高效查找
- **O(1) LRU淘汰** - 双向链表实现的快速淘汰
- **内存高效** - 自动清理过期和淘汰项
- **统计监控** - 实时性能指标收集
- **类型安全** - 完整的TypeScript支持

## 🚨 最佳实践

### 1. TTL设置策略
```typescript
// 根据数据特性设置合适的TTL
await cache.set('user:profile', userProfile, 3600000) // 用户配置：1小时
await cache.set('product:info', productInfo, 86400000) // 商品信息：24小时
await cache.set('session:data', sessionData, 1800000) // 会话数据：30分钟
await cache.set('realtime:stats', realtimeStats, 5000) // 实时统计：5秒
```

### 2. 缓存容量规划
```typescript
// 根据可用内存和数据大小设置合理容量
const availableMemory = 512 * 1024 * 1024 // 512MB
const averageItemSize = 1024 // 1KB
const maxItems = Math.floor(availableMemory * 0.8 / averageItemSize) // 使用80%内存

const cache = new CacheManager(maxItems)
```

### 3. 缓存更新策略
```typescript
// Write-Through：同时更新缓存和数据库
async function updateUser(userId: string, data: any): Promise<void> {
  await database.updateUser(userId, data)
  await cache.set(`user:${userId}`, data, 3600000)
}

// Write-Behind：先更新缓存，异步更新数据库
async function updateUserAsync(userId: string, data: any): Promise<void> {
  await cache.set(`user:${userId}`, data, 3600000)
  setTimeout(() => database.updateUser(userId, data), 0)
}
```

## 📈 监控和调优

### 1. 关键指标
- **命中率** - 衡量缓存效果
- **内存使用率** - 防止内存溢出
- **淘汰频率** - 评估容量是否合理
- **平均访问时间** - 性能监控

### 2. 调优建议
- 根据业务数据调整TTL
- 监控热点数据，优化缓存策略
- 定期分析淘汰模式，调整容量
- 使用内存分析工具优化对象大小

## 📖 相关示例

- [基础用法示例](../basic-usage/) - 学习核心API
- [Web会话管理示例](../web-session-manager/) - 了解状态管理
- [任务队列示例](../task-queue/) - 了解异步处理

## 🎯 实际应用

这个示例可以直接用于：
- Web应用数据缓存
- API响应缓存
- 数据库查询结果缓存
- 计算结果缓存
- 分布式会话存储
- 微服务间数据共享

## 🔗 扩展方向

1. **多级缓存** - L1(内存) + L2(Redis) + L3(数据库)
2. **缓存穿透防护** - 布隆过滤器、空值缓存
3. **缓存雪崩防护** - 随机TTL、熔断机制
4. **缓存一致性** - 版本号、时间戳、事件通知
5. **可视化监控** - Grafana仪表板、实时监控面板
