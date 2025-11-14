# 基础用法示例

这个示例展示了 Unicycle4T 的核心功能和基本用法。

## 📋 示例内容

### 1. 基础API演示 (`simple-manager.ts`)
- 生命周期对象的创建、启动、停止、删除
- 事件监听机制
- 批量操作
- 错误处理

### 2. 自定义对象演示 (`custom-object.ts`)
- 扩展 `LifecycleObject` 基类
- `UserSession` - 用户会话管理
- `Task` - 任务对象管理

### 3. 综合演示 (`index.ts`)
- 完整的工作流程演示
- 高级用法展示

## 🚀 运行示例

### 安装依赖
```bash
cd examples/basic-usage
pnpm install
```

### 运行示例
```bash
# 开发模式（支持热重载）
pnpm dev

# 直接运行
pnpm start
```

## 📚 核心概念演示

### 1. 对象生命周期
```typescript
const manager = new DefaultLifecycleManager()

// 创建对象
const object = await manager.createObject()
object.setAttribute('userId', 'user123')

// 启动对象
await manager.startObject(object.getId())

// 停止对象
await manager.stopObject(object.getId())

// 删除对象
await manager.deleteObject(object.getId())
```

### 2. 事件监听
```typescript
// 监听对象创建事件
manager.events.on('object:created', (data) => {
  console.log('对象已创建:', data.object.getId())
})

// 监听状态变更事件
manager.events.on('object:stateChanged', (data) => {
  console.log('状态变更:', data.oldState.name, '→', data.newState.name)
})
```

### 3. 自定义对象
```typescript
class UserSession extends LifecycleObject {
  initialize(userId: string, permissions: string[]): void {
    this.setAttribute('userId', userId)
    this.setAttribute('permissions', permissions)
    this.setAttribute('loginTime', new Date())
  }

  hasPermission(permission: string): boolean {
    const permissions = this.getAttribute('permissions') as string[]
    return permissions.includes(permission)
  }
}
```

## 🎯 学习要点

1. **生命周期管理**：理解对象的创建、启动、停止、删除流程
2. **事件驱动**：掌握事件监听和响应机制
3. **属性操作**：学会使用对象属性存储业务数据
4. **扩展机制**：了解如何通过继承扩展框架功能
5. **错误处理**：学习如何优雅地处理异常情况

## 📖 下一步

- 查看 [Web会话管理示例](../web-session-manager/) 了解实际应用场景
- 查看 [任务队列示例](../task-queue/) 了解异步处理模式
- 阅读 [主文档](../../README.md) 了解完整的API参考
