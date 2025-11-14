# 任务队列系统示例

这个示例展示了如何使用 Unicycle4T 构建一个完整的异步任务处理系统。

## 🎯 应用场景

任务队列是许���应用的核心组件：
- 异步邮件发送
- 图片处理和转码
- 数据分析和报告生成
- API调用和批处理作业
- 工作流编排

## 🏗️ 架构设计

### 核心组件

1. **TaskQueue** - 任务队列管理器
   - 任务的创建、排队、执行、清理
   - 并发控制和优先级管理
   - 依赖关系处理和错误重试

2. **TaskData** - 任务数据结构
   - 任务类型、载荷、优先级
   - 执���状态和时间戳
   - 重试次数和依赖配置

### 任务状态流转

```
PENDING → RUNNING → COMPLETED
    ↑         ↓
    └── FAILED ← (重试机制)
```

## 🚀 运行示例

### 安装依赖
```bash
cd examples/task-queue
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

### 1. 基础任务管理
```typescript
// 创建任务队列
const taskQueue = new TaskQueue(3) // 最大并发3个任务

// 添加任务
const taskId = await taskQueue.addTask('email', {
  to: 'user@example.com',
  subject: 'Welcome',
  content: 'Hello World!'
}, {
  priority: TaskPriority.HIGH,
  maxRetries: 3,
  timeout: 30000
})
```

### 2. 优先级队列
```typescript
// 添加不同优先级的任务
await taskQueue.addTask('cleanup', {}, { priority: TaskPriority.LOW })
await taskQueue.addTask('notification', {}, { priority: TaskPriority.NORMAL })
await taskQueue.addTask('security-alert', {}, { priority: TaskPriority.URGENT })

// 高优先级任务会优先执行
```

### 3. 任务依赖
```typescript
// 创建依赖链
const collectId = await taskQueue.addTask('data-collection', {})
const processId = await taskQueue.addTask('data-processing', {}, {
  dependencies: [collectId] // 等待数据收集完成
})
const reportId = await taskQueue.addTask('report-generation', {}, {
  dependencies: [processId] // 等待数据处理完成
})
```

### 4. 错误处理和重试
```typescript
// 配置重试策略
const taskId = await taskQueue.addTask('unreliable-task', {}, {
  maxRetries: 5, // 最多重试5次
  timeout: 10000 // 10秒超时
})

// 监听任务状态
const status = await taskQueue.getTaskStatus(taskId)
console.log(`任务状态: ${status.status}, 重试次数: ${status.retryCount}`)
```

### 5. 并发控制
```typescript
// 限制并发执行的任务数量
const taskQueue = new TaskQueue(2) // 最多同时执行2个任务

// 即使添加10个任务，也只会并发执行2个
for (let i = 0; i < 10; i++) {
  await taskQueue.addTask('batch-task', { id: i })
}
```

## 🎯 学习要点

### 1. 生命周期映射
- **created** → 任务创建，加入队列
- **started** → 任务开始执行
- **stopped** → 任务完成或失败
- **deleted** → 任务清理

### 2. 任务属性管理
```typescript
task.setAttribute('taskData', {
  type: 'email',
  payload: { to: 'user@example.com' },
  priority: TaskPriority.HIGH,
  retryCount: 0,
  status: TaskStatus.PENDING
})
```

### 3. 事件驱动架构
```typescript
taskQueue.manager.events.on('object:created', (data) => {
  console.log('任务创建:', data.object.getId())
})

taskQueue.manager.events.on('object:stateChanged', (data) => {
  const taskData = data.object.getAttribute('taskData')
  console.log('任务状态变更:', taskData.status)
})
```

## 🔧 生产环境增强

### 1. 持久化支持
```typescript
class RedisTaskDao implements LifecycleDao {
  // 使用Redis存储任务状态
  // 支持分布式任务队列
  // 任务持久化和故障恢复
}
```

### 2. 高级功能
- 任务调度（Cron表达式）
- 任务路由和分片
- 结果缓存
- 任务监控和告警
- 死信队列处理

### 3. 性能优化
- 批量操作
- 连接池管理
- 内存优化
- 异步I/O优化

## 📊 监控和统计

```typescript
// 获取队列统计
const stats = taskQueue.getQueueStats()
console.log({
  totalCreated: stats.totalCreated,
  totalCompleted: stats.totalCompleted,
  totalFailed: stats.totalFailed,
  currentTaskCount: stats.currentTaskCount,
  queuedTasks: stats.queuedTasks
})
```

## 🚨 错误处理策略

### 1. 重试机制
- 指数退避算法
- 最大重试次数限制
- 特定异常不重试

### 2. 超时处理
- 任务级别超时
- 全局超时设置
- 超时任务清理

### 3. 故障隔离
- 任务隔离执行
- 资源限制
- 异常恢复机制

## 📈 性能特性

- **O(1) 任务查找** - 基于Map的高效索引
- **优先级队列** - 自动按优先级排序执行
- **并发控制** - 避免资源过载
- **内存管理** - 及时清理完成任务
- **事件通知** - 高效的状态变更通知

## 📖 相关示例

- [基础用法示例](../basic-usage/) - 学习核心API
- [Web会话管理示例](../web-session-manager/) - 了解状态管理
- [缓存管理示例](../cache-manager/) - 学习存储优化

## 🎯 实际应用

这个示例可以直接用于：
- 异步邮件系统
- 图片处理服务
- 数据分析管道
- API批处理系统
- 微服务异步通信
- 工作流引擎

## 🔗 扩展方向

1. **分布式队列** - Redis、RabbitMQ、Kafka集成
2. **任务调度** - 定时任务、延迟任务
3. **监控面板** - 实时任务状态监控
4. **负载均衡** - 多实例任务分发
5. **任务模板** - 预定义任务类型和配置
