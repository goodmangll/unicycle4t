import type { LifecycleState, ObjectId } from './types'

import { LifecycleCreatedState } from './lifecycleState'

/**
 * 生命周期对象基类
 * 所有需要生命周期管理的对象都应该继承这个基类
 */
export default class LifecycleObject {
  /**
   * 对象唯一标识
   */
  protected id!: ObjectId

  /**
   * 当前状态
   */
  protected currentState: LifecycleState

  /**
   * 创建时间
   */
  protected readonly createdAt: Date

  /**
   * 最后更新时间
   */
  protected updatedAt: Date

  /**
   * 自定义属性
   */
  protected attributes: Map<string, unknown> = new Map()

  /**
   * 构造函数
   */
  constructor() {
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.currentState = new LifecycleCreatedState()
  }

  /**
   * 获取对象ID
   */
  public getId(): ObjectId {
    return this.id
  }

  public setId(id: ObjectId): void {
    this.id = id
  }

  public setAttribute(key: string, value: unknown): void {
    this.attributes.set(key, value)
  }

  public getAttribute(key: string): unknown {
    return this.attributes.get(key)
  }

  public removeAttribute(key: string): void {
    this.attributes.delete(key)
  }

  public getState(): LifecycleState {
    return this.currentState
  }

  public getCreatedAt(): Date {
    return this.createdAt
  }

  public getUpdatedAt(): Date {
    return this.updatedAt
  }

  public setState(newState: LifecycleState): void {
    this.currentState = newState
    this.updatedAt = new Date()
  }
}
