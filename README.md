# 🎯 Unicycle4T

<div align="center">
  <strong>通用生命周期管理框架</strong>
  <br>
  <br>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="TypeScript">
  </a>
  <a href="https://choosealicense.com/licenses/isc/">
    <img src="https://img.shields.io/badge/license-ISC-green" alt="License">
  </a>
  <a href="https://github.com/goodmangll/unicycle4t/actions/workflows/test.yml">
    <img src="https://img.shields.io/badge/tests-passing-green" alt="Test Status">
  </a>
  <a href="https://www.npmjs.com/package/@linden/unicycle4t">
    <img src="https://img.shields.io/npm/v/@linden/unicycle4t" alt="NPM Version">
  </a>
  <a href="https://github.com/goodmangll/unicycle4t/blob/main/VERSIONING.md">
    <img src="https://img.shields.io/badge/versioning-SEMVER-blue" alt="Versioning">
  </a>
</div>

<br>

Unicycle4T 是一个轻量级、灵活的 **TypeScript 生命周期管理框架**，专为现代应用程序设计。它提供了一套完整、标准化的对象生命周期管理解决方案，让开发者能够更优雅地处理对象的创建、启动、停止和销毁流程。

## 🌟 为什么选择 Unicycle4T？

### 🎯 核心价值

- **🔧 开发效率** - 减少样板代码，专注业务逻辑实现
- **🛡️ 架构健壮性** - 标准化的生命周期流程，降低系统故障风险
- **🔄 可维护性** - 统一的管理模式，让代码更易理解和维护
- **⚡ 高性能** - 轻量级设计，最小化运行时开销
- **🧩 高扩展性** - 支持自定义组件，适配不同应用场景

> 📋 **版本说明**: 当前版本为 `0.5.0` Beta，核心功能完整但API仍在演进中。建议查看 [版本管理策略](VERSIONING.md) 了解详细信息。

## 🚀 快速导航

**新用户必读**：[快速开始](#-快速开始) → [基础示例](#-示例代码)

**开发指南**：[API文档](#-api文档) → [自定义事件发送](#-自定义事件发送) → [第三方服务集成](#-第三方服务集成) → [贡献指南](#-开发与贡献)

## ✨ 特性

- **🔄 统一的生命周期管理**：标准化对象的创建、启动、停止和销毁流程
- **🧩 可扩展架构**：支持自定义DAO、ID生成器和工厂类
- **📡 事件驱动**：基于mitt实现的事件系统，支持生命周期事件监听
- **💾 内存存储**：内置内存存储实现，便于快速开发和测试
- **🔑 UUID支持**：集成UUID生成器，确保对象ID唯一性
- **📘 TypeScript支持**：完整的类型定义，提供优秀的开发体验

---

## 🚀 快速开始

### 安装

```bash
# 使用npm
npm install @linden/unicycle4t

# 使用yarn
yarn add @linden/unicycle4t

# 使用pnpm
pnpm add @linden/unicycle4t
```

### 基本使用

```typescript
import DefaultLifecycleManager from '@linden/unicycle4t'

// 创建生命周期管理器实例
const manager = new DefaultLifecycleManager()

// 创建新的生命周期对象
const object = await manager.create()

// 启动对象
await manager.start(object.id)

// 获取对象
const retrievedObject = await manager.get(object.id)

// 停止对象
await manager.stop(object.id)

// 删除对象
await manager.delete(object.id)
```

### 事件监听

```typescript
// 监听对象创建事件
manager.events.on('object:created', (data) => {
  console.log('对象已创建:', data.object.id)
})

// 监听对象删除事件
manager.events.on('object:deleted', (data) => {
  console.log('对象已删除:', data.objectId)
})
```

---

## 📚 核心概念

### 🎯 LifecycleObject
生命周期对象是框架的核心概念，代表具有生命周期的实体。每个生命周期对象都有唯一的ID和状态管理能力。
- **默认初始状态**：对象在创建时自动设置为`created`状态
- **状态管理**：支持状态的获取和设置操作
- **属性存储**：可存储自定义属性键值对

### 🧠 LifecycleManager
生命周期管理器负责协调生命周期对象的创建、状态转换和销毁。DefaultLifecycleManager是框架提供的默认实现。
- **统一生命周期管理**：所有状态变更通过`changeState`方法统一处理
- **生命周期完整性**：对象删除前会自动停止（如果需要），确保资源正确释放
- **事件驱动**：在各个生命周期阶段触发相应事件

### 💾 LifecycleDao
数据访问对象，负责生命周期对象的持久化。框架提供了基于内存的MemoryLifecycleDao实现。
- **CRUD操作**：提供创建、读取、更新和删除功能
- **可扩展性**：支持自定义实现以连接不同的存储后端

### 🏭 LifecycleFactory
工厂类，负责创建生命周期对象的实例。DefaultLifecycleFactory是框架提供的默认实现。
- **对象实例化**：封装生命周期对象的创建逻辑
- **可扩展性**：支持创建自定义的生命周期对象类型

### 🔢 LifecycleIdGenerator
ID生成器，负责为生命周期对象生成唯一标识符。UuidLifecycleIdGenerator是框架提供的默认实现。
- **唯一性保证**：生成全局唯一的对象ID
- **可定制性**：支持自定义ID生成策略

### 🔄 LifecycleState
生命周期状态，定义了对象可能处于的不同状态，包括LifecycleCreatedState、LifecycleStartedState和LifecycleStoppedState。
- **LifecycleCreatedState**：对象初始状态，表示对象已创建但尚未启动
- **LifecycleStartedState**：表示对象正在运行的状态
- **LifecycleStoppedState**：表示对象已停止的状态
- **状态表示**：每个状态都有唯一的名称标识
- **可扩展性**：支持定义自定义状态类型

### 🔄 生命周期流程
1. **创建(Create)**：对象被创建，自动设置为`created`初始状态
2. **启动(Start)**：对象从`created`或`stopped`状态转换为`started`状态
3. **停止(Stop)**：对象从`started`或`created`状态转换为`stopped`状态
4. **删除(Delete)**：对象在删除前会自动检查并停止（如果需要），确保资源正确释放

完整的生命周期事件序列为：`object:created` → `object:stateChanged` (started) → `object:stateChanged` (stopped) → `object:deleted`

---

## 📝 API文档

### 🎯 核心API概览

| API | 用途 | 示例场景 |
|-----|------|---------|
| `create()` | 创建新对象 | 用户注册、任务创建 |
| `get(id)` | 获取对象 | 状态查询、数据获取 |
| `start(id)` | 启动对象 | 服务启动、任务执行 |
| `stop(id)` | 停止对象 | 服务停止、任务暂停 |
| `delete(id)` | 删除对象 | 用户注销、任务清理 |

### 核心类说明

**DefaultLifecycleManager** - 主要的生命周期管理器
```typescript
import { DefaultLifecycleManager } from '@linden/unicycle4t'

const manager = new DefaultLifecycleManager()

// 监听事件
manager.events.on('object:created', ({ object }) => {
  console.log(`对象已创建: ${object.id}`)
})

// 创建和管理对象
const object = await manager.create()
await manager.start(object.id)
```

**LifecycleObject** - 生命周期对象基类
```typescript
// 属性操作
object.setAttribute('config', { timeout: 5000 })
const config = object.getAttribute('config')
const hasConfig = object.hasAttribute('config')
```

**MemoryLifecycleDao** - 默认内存存储
- 适用于开发测试和原型阶段
- 高性能，数据重启后丢失

---

## 🔌 自定义事件发送

Unicycle4T 支持你发送自定义事件到第三方服务，扩展框架的事件能力。

```typescript
import { DefaultLifecycleManager } from '@linden/unicycle4t'

const manager = new DefaultLifecycleManager()

// 发送自定义业务事件
manager.events.emit('user:login', {
  userId: '123',
  sessionId: 'abc-123',
  timestamp: new Date()
})

// 发送自定义错误事件
manager.events.emit('error:occurred', {
  errorType: 'ValidationError',
  message: 'Invalid user input',
  objectId: 'obj-456',
  timestamp: new Date()
})

// 发送自定义性能事件
manager.events.emit('performance:metric', {
  metricName: 'response_time',
  value: 250,
  unit: 'ms',
  timestamp: new Date()
})

// 监听自定义事件并发送到第三方服务
manager.events.on('*', (eventType, data) => {
  // 过滤并发送自定义事件
  if (eventType.includes(':') && eventType !== 'object:created') {
    sendToThirdParty({
      event: eventType,
      data: data,
      timestamp: new Date()
    })
  }
})
```

---

## 💡 示例代码

### 🛠️ 自定义生命周期对象

通过继承 `LifecycleObject` 创建具有特定功能的自定义对象。

```typescript
import { DefaultLifecycleFactory, LifecycleObject } from '@linden/unicycle4t'

// 自定义生命周期对象类
class CustomLifecycleObject extends LifecycleObject {
  private readonly createdAt: Date

  constructor() {
    super()
    this.createdAt = new Date()
  }

  // 初始化业务数据
  initialize(data: any) {
    this.setAttribute('businessData', data)
    this.setAttribute('metadata', {
      createdAt: this.createdAt,
      updatedAt: new Date()
    })
  }

  // 获取业务数据
  getBusinessData() {
    return this.getAttribute('businessData')
  }

  // 获取元数据
  getMetadata() {
    return this.getAttribute('metadata')
  }

  // 自定义服务方法
  isExpired(maxAge: number): boolean {
    const metadata = this.getMetadata() as { createdAt: Date }
    return Date.now() - metadata.createdAt.getTime() > maxAge
  }
}

// 自定义工厂类
class CustomLifecycleFactory extends DefaultLifecycleFactory {
  async create() {
    return new CustomLifecycleObject()
  }
}

// 使用自定义工厂
const manager = new DefaultLifecycleManager(new CustomLifecycleFactory())
const object = await manager.create()

// 初始化并使用
object.initialize({ userId: '123', permissions: ['read', 'write'] })
console.log(object.getBusinessData())
console.log('是否过期:', object.isExpired(3600000)) // 1小时
```

### 💾 自定义存储实现

通过实现 `LifecycleDao` 接口创建自定义存储后端，实现数据持久化。

```typescript
import type { LifecycleDao, LifecycleObject, ObjectId } from '@linden/unicycle4t'

// 基于 LocalStorage 的持久化实现
class LocalStorageLifecycleDao implements LifecycleDao {
  private readonly storageKey = 'lifecycle-objects'

  constructor() {
    this.initializeStorage()
  }

  private initializeStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify({}))
    }
  }

  // 序列化：将对象转换为可存储格式
  private serializeObject(object: LifecycleObject): any {
    return {
      id: object.id,
      state: object.state.name,
      properties: this.extractProperties(object),
      timestamp: Date.now()
    }
  }

  // 反序列化：从存储数据重建对象
  private deserializeObject(data: any): LifecycleObject {
    const object = new LifecycleObject()
    object.id = data.id

    // 恢复状态
    const state = this.createStateByName(data.state)
    object.state = state

    // 恢复属性
    Object.entries(data.properties || {}).forEach(([key, value]) => {
      object.setAttribute(key, value)
    })

    return object
  }

  private extractProperties(object: LifecycleObject): Record<string, unknown> {
    const properties: Record<string, unknown> = {}

    // 提取已知的业务属性
    const businessKeys = ['userData', 'config', 'metadata', 'businessData']
    businessKeys.forEach((key) => {
      if (object.hasAttribute(key)) {
        properties[key] = object.getAttribute(key)
      }
    })

    return properties
  }

  private createStateByName(stateName: string): LifecycleState {
    // 根据状态名称创建对应的状态对象
    switch (stateName) {
      case 'started': return new LifecycleStartedState()
      case 'stopped': return new LifecycleStoppedState()
      default: return new LifecycleCreatedState()
    }
  }

  // CRUD 操作实现
  async create(object: LifecycleObject): Promise<void> {
    const storage = this.getStorage()
    const serialized = this.serializeObject(object)
    storage[object.id] = serialized
    this.setStorage(storage)
    console.log(`✅ 对象已保存: ${object.id}`)
  }

  async get(id: ObjectId): Promise<LifecycleObject | null> {
    const storage = this.getStorage()
    const data = storage[id]
    return data ? this.deserializeObject(data) : null
  }

  async update(object: LifecycleObject): Promise<void> {
    await this.create(object) // LocalStorage 中更新等同于重新创建
  }

  async delete(id: ObjectId): Promise<void> {
    const storage = this.getStorage()
    delete storage[id]
    this.setStorage(storage)
    console.log(`🗑️ 对象已删除: ${id}`)
  }

  private getStorage(): Record<string, any> {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}')
  }

  private setStorage(data: Record<string, any>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }
}

// 使用自定义存储
const customDao = new LocalStorageLifecycleDao()
const manager = new DefaultLifecycleManager(undefined, customDao)

// 数据将自动保存到 LocalStorage
const object = await manager.create()
object.setAttribute('userData', { name: 'Alice', theme: 'dark' })
await manager.start(object.id) // 状态变更也会持久化
```

---

## 👥 开发与贡献

### ⚙️ 开发环境设置

```bash
# 克隆并安装
git clone https://github.com/goodmangll/unicycle4t.git
cd unicycle4t && pnpm install

# 开发命令
pnpm dev        # 开发模式
pnpm build      # 构建
pnpm test       # 测试
pnpm test:coverage  # 测试覆盖率
```

### 📁 项目结构

```text
src/
├── core/                  # 核心源码
│   ├── dao/               # 数据访问对象
│   ├── mgt/               # 管理类
│   ├── lifecycleObject.ts # 生命周期对象基类
│   └── types.ts           # 核心类型定义
└── index.ts               # 入口文件

test/                      # 测试文件
```

### 🤝 贡献指南

1. **Fork 仓库**
2. **创建功能分支**：`git checkout -b feature/amazing-feature`
3. **提交更改**：`git commit -m 'Add some amazing feature'`
4. **推送到分支**：`git push origin feature/amazing-feature`
5. **打开 Pull Request**

### ✅ 提交规范

请遵循以下提交消息格式：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动

---

## ⚠️ 项目局限性

在使用Unicycle4T时，请注意以下局限性：

- **存储层简化**：当前实现的存储层相对简单，主要针对内存操作优化
- **并发控制**：在高并发环境下需要额外的同步机制
- **持久化**：如需将对象持久化到数据库，需要实现自定义的DAO
- **状态管理**：复杂的状态转换逻辑需要自定义扩展

---

## 📄 许可证

Unicycle4T 项目采用 ISC 许可证。详情请参阅 [LICENSE](LICENSE) 文件。

ISC 许可证是一种宽松的开源许可证，允许：

- 任何形式的使用、复制、修改和分发软件
- 在源代码或二进制形式中使用软件，无论是否修改
- 将软件用于商业目的

唯一的条件是：

- 在所有副本或重要部分中包含原始版权声明和许可证声明
- 许可证不提供任何担保，也不对任何损害负责

---

## 📚 示例项目

我们提供了丰富的示例来帮助您快速上手和了解框架的实际应用：

### 🎯 学习路径

| 示例项目 | 应用场景 | 学习要点 |
|---------|---------|---------|
| 基础用法 | 框架入门 | 生命周期管理、事件系统 |
| Web会话管理 | 用户认证 | 会话管理、权限控制 |
| 任务队列 | 异步处理 | 任务调度、错误重试 |
| 缓存管理 | 性能优化 | LRU算法、TTL管理 |
| 连接池 | 资源管理 | 连接复用、并发控制 |

### 🚀 运行示例

```bash
# 运行基础示例
cd examples/basic-usage && pnpm install && pnpm start

# 运行Web会话管理示例
cd examples/web-session-manager && pnpm install && pnpm start
```


### 💡 最佳实践

1. **生命周期设计模式** - 设计具有明确生命周期的对象
2. **事件驱动架构** - 使用事件系统实现松耦合设计
3. **资源管理策略** - 高效的内存使用和资源回收
4. **扩展性设计** - 通过继承和组合实现功能扩展
5. **性能优化技巧** - 缓存、连接池、批处理等优化方法

---

## 💖 致谢

感谢所有参与项目的贡献者和用户！您的支持和反馈是我们前进的动力。
