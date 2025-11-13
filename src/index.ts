/**
 * Unicycle4T - 通用生命周期管理框架
 * @packageDocumentation
 */

// DAO 层
export type { default as LifecycleDao } from './core/dao/lifecycleDao'

// ID 生成器
export type { default as LifecycleIdGenerator } from './core/dao/lifecycleIdGenerator'

export { MemoryLifecycleDao } from './core/dao/memoryLifecycleDao'

export { default as UuidLifecycleIdGenerator } from './core/dao/uuidLifecycleIdGenerator'
export { default as DefaultLifecycleFactory } from './core/defaultLifecycleFactory'

// 错误类
export { LifecycleError } from './core/errors'
// 生命周期工厂
export type { default as LifecycleFactory } from './core/lifecycleFactory'

// 生命周期对象
export { default as LifecycleObject } from './core/lifecycleObject'
// 生命周期状态
export {
  LifecycleStartedState,
  LifecycleStoppedState,
} from './core/lifecycleState'

export { default as DefaultLifecycleManager } from './core/mgt/defaultLifecycleManager'
// 生命周期管理器
export type { default as LifecycleManager } from './core/mgt/lifecycleManager'

// 核心类型
export type { LifecycleEventData, LifecycleState, ObjectId } from './core/types'
