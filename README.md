# 🎯 Unicycle4T

<div align="center">
  <strong>通用生命周期管理框架</strong>
  <br>
  <br>
  <a href="#">
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="TypeScript">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/license-ISC-green" alt="License">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/test-coverage-90%2B-green" alt="Test Coverage">
  </a>
  <a href="#">
    <img src="https://img.shields.io/badge/npm-v1.0.0-orange" alt="NPM Version">
  </a>
</div>

<br>

Unicycle4T是一个轻量级、灵活的TypeScript生命周期管理框架，为应用程序中的对象提供统一的生命周期管理解决方案。通过标准化对象的创建、启动、停止和销毁流程，帮助开发者构建更可靠、可维护的应用系统。

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
const object = await manager.createObject()

// 启动对象
await manager.startObject(object.getId())

// 获取对象
const retrievedObject = await manager.getObject(object.getId())

// 停止对象
await manager.stopObject(object.getId())

// 删除对象
await manager.deleteObject(object.getId())
```

### 事件监听

```typescript
// 监听对象创建事件
manager.events.on('object:created', (data) => {
  console.log('对象已创建:', data.object.getId())
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

### 🧠 LifecycleManager
生命周期管理器负责协调生命周期对象的创建、状态转换和销毁。DefaultLifecycleManager是框架提供的默认实现。

### 💾 LifecycleDao
数据访问对象，负责生命周期对象的持久化。框架提供了基于内存的MemoryLifecycleDao实现。

### 🏭 LifecycleFactory
工厂类，负责创建生命周期对象的实例。DefaultLifecycleFactory是框架提供的默认实现。

### 🔢 LifecycleIdGenerator
ID生成器，负责为生命周期对象生成唯一标识符。UuidLifecycleIdGenerator是框架提供的默认实现。

### 🔄 LifecycleState
生命周期状态，定义了对象可能处于的不同状态，如LifecycleStartedState和LifecycleStoppedState。

---

## 📝 API文档

### DefaultLifecycleManager

```typescript
import { Emitter } from 'mitt'
import type { LifecycleEventData, ObjectId, LifecycleFactory, LifecycleDao, LifecycleIdGenerator, LifecycleObject } from '@linden/unicycle4t'

class DefaultLifecycleManager {
  // 事件发射器
  public readonly events: Emitter<LifecycleEventData>
  
  // 构造函数，支持依赖注入
  constructor(factory?: LifecycleFactory, dao?: LifecycleDao, idGenerator?: LifecycleIdGenerator)
  
  // 创建新的生命周期对象
  public async createObject(): Promise<LifecycleObject>
  
  // 根据ID获取生命周期对象
  public async getObject(id: ObjectId): Promise<LifecycleObject | null>
  
  // 启动生命周期对象
  public async startObject(id: ObjectId): Promise<void>
  
  // 停止生命周期对象
  public async stopObject(id: ObjectId): Promise<void>
  
  // 删除生命周期对象
  public async deleteObject(id: ObjectId): Promise<void>
}
```

### LifecycleObject

```typescript
import type { ObjectId, LifecycleState } from '@linden/unicycle4t'

class LifecycleObject {
  // 获取对象ID
  getId(): ObjectId
  
  // 设置对象ID
  setId(id: ObjectId): void
  
  // 获取对象状态
  getState(): LifecycleState
  
  // 设置对象状态
  setState(state: LifecycleState): void
  
  // 添加对象属性
  setProperty(key: string, value: unknown): void
  
  // 获取对象属性
  getProperty(key: string): unknown
  
  // 检查属性是否存在
  hasProperty(key: string): boolean
}
```

### MemoryLifecycleDao

```typescript
import type { ObjectId, LifecycleObject } from '@linden/unicycle4t'
import type { LifecycleDao } from '@linden/unicycle4t'

class MemoryLifecycleDao implements LifecycleDao {
  // 构造函数
  constructor()
  
  // 创建生命周期对象
  public async create(object: LifecycleObject): Promise<void>
  
  // 获取生命周期对象
  public async get(id: ObjectId): Promise<LifecycleObject | null>
  
  // 更新生命周期对象
  public async update(object: LifecycleObject): Promise<void>
  
  // 删除生命周期对象
  public async delete(id: ObjectId): Promise<void>
}
```

## 💡 示例代码

### 🛠️ 自定义生命周期对象

```typescript
import LifecycleObject from '@linden/unicycle4t'
import DefaultLifecycleFactory from '@linden/unicycle4t'

// 自定义生命周期对象类
class CustomLifecycleObject extends LifecycleObject {
  initialize(data: any) {
    this.setProperty('customData', data)
  }
  
  getCustomData() {
    return this.getProperty('customData')
  }
}

// 自定义工厂类
class CustomLifecycleFactory extends DefaultLifecycleFactory {
  async create() {
    const object = new CustomLifecycleObject()
    return object
  }
}

// 使用自定义工厂
const manager = new DefaultLifecycleManager(new CustomLifecycleFactory())
```

### 💾 自定义存储实现

```typescript
import type LifecycleDao from '@linden/unicycle4t'
import type LifecycleObject from '@linden/unicycle4t'
import type { ObjectId } from '@linden/unicycle4t'

// 自定义DAO实现（例如基于LocalStorage）
class LocalStorageLifecycleDao implements LifecycleDao {
  private readonly storageKey = 'lifecycle-objects'
  
  constructor() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify({}))
    }
  }
  
  private getStorage(): Record<string, any> {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}')
  }
  
  private setStorage(data: Record<string, any>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }
  
  // 将LifecycleObject转换为可序列化的对象
  private serializeObject(object: LifecycleObject): any {
    // 提取对象的基本信息进行序列化
    return {
      id: object.getId(),
      state: object.getState(),
      // 提取所有属性
      properties: {
        // 这里实现属性的提取逻辑
      }
    }
  }
  
  // 从序列化数据重建LifecycleObject
  private deserializeObject(data: any): LifecycleObject {
    // 这里实现从数据重建LifecycleObject的逻辑
    const object = new LifecycleObject()
    object.setId(data.id)
    object.setState(data.state)
    
    // 恢复属性
    if (data.properties) {
      Object.entries(data.properties).forEach(([key, value]) => {
        object.setProperty(key, value)
      })
    }
    
    return object
  }
  
  async create(object: LifecycleObject): Promise<void> {
    const storage = this.getStorage()
    storage[object.getId()] = this.serializeObject(object)
    this.setStorage(storage)
  }
  
  async get(id: ObjectId): Promise<LifecycleObject | null> {
    const storage = this.getStorage()
    const data = storage[id]
    return data ? this.deserializeObject(data) : null
  }
  
  async update(object: LifecycleObject): Promise<void> {
    const storage = this.getStorage()
    storage[object.getId()] = this.serializeObject(object)
    this.setStorage(storage)
  }
  
  async delete(id: ObjectId): Promise<void> {
    const storage = this.getStorage()
    delete storage[id]
    this.setStorage(storage)
  }
}

// 使用自定义DAO
const manager = new DefaultLifecycleManager(undefined, new LocalStorageLifecycleDao())
```

---

## 👥 开发与贡献

### ⚙️ 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/linden/unicycle4t.git
cd unicycle4t

# 安装依赖
pnpm install

# 开发模式运行
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test

# 运行测试覆盖率
pnpm test:coverage
```

### 📁 项目结构

```
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

## 💖 致谢

感谢所有参与项目的贡献者和用户！您的支持和反馈是我们前进的动力。