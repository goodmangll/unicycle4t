import type LifecycleObject from './lifecycleObject'

export type ObjectId = string | number

/**
 * 生命周期状态接口
 * 所有具体的生命周期状态都应该实现这个接口
 */
export interface LifecycleState {
  /**
   * 状态名称
   */
  readonly name: string

}

/**
 * 生命周期事件类型定义
 * 定义所有生命周期相关的事件及其数据结构
 */
export interface LifecycleEventData extends Record<string | symbol, unknown> {
  /**
   * 对象创建事件
   */
  'object:created': {
    object: LifecycleObject
    timestamp: Date
  }

  /**
   * 对象状态变化事件
   */
  'object:stateChanged': {
    object: LifecycleObject
    oldState: LifecycleState
    newState: LifecycleState
    timestamp: Date
  }

  /**
   * 对象删除事件
   */
  'object:deleted': {
    objectId: ObjectId
    timestamp: Date
  }
}
