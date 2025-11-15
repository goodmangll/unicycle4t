import type LifecycleObject from './lifecycleObject'
import type { LifecycleCreatedState, LifecycleStartedState, LifecycleStoppedState } from './lifecycleState'

export type ObjectId = number | string

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
 * 事件类型定义
 */
export type EventType =
  | 'object:created'
  | 'object:deleted'
  | 'object:stateChanged'

/**
 * 对象创建事件数据
 */
export interface ObjectCreatedEvent {
  readonly object: LifecycleObject
  readonly timestamp: Date
}

/**
 * 对象删除事件数据
 */
export interface ObjectDeletedEvent {
  readonly objectId: ObjectId
  readonly timestamp: Date
}

/**
 * 对象状态变化事件数据
 */
export interface ObjectStateChangedEvent {
  readonly object: LifecycleObject
  readonly oldState: LifecycleState
  readonly newState: LifecycleState
  readonly timestamp: Date
}

/**
 * 生命周期事件数据映射
 */
export type LifecycleEventData = {
  readonly [K in EventType]:
    | (K extends 'object:created' ? ObjectCreatedEvent : never)
    | (K extends 'object:deleted' ? ObjectDeletedEvent : never)
    | (K extends 'object:stateChanged' ? ObjectStateChangedEvent : never)
} & Record<string, unknown>

/**
 * 状态转换映射类型
 */
export interface StateTransition<S extends LifecycleState, T extends LifecycleState> {
  readonly from: S
  readonly to: T
  readonly object: LifecycleObject
  readonly timestamp: Date
}

/**
 * 有效的状态转换类型
 */
export type LifecycleStateTransitions =
  | StateTransition<LifecycleCreatedState, LifecycleStartedState>
  | StateTransition<LifecycleStartedState, LifecycleStoppedState>
  | StateTransition<LifecycleStoppedState, LifecycleCreatedState>
