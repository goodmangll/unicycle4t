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
  public id!: ObjectId

  /**
   * 当前状态
   */
  public state: LifecycleState

  /**
   * 创建时间
   */
  public readonly createdAt: Date

  /**
   * 最后更新时间
   */
  public updatedAt: Date

  /**
   * 自定义属性
   */
  protected readonly _attributes: Map<string, unknown> = new Map()

  /**
   * 构造函数
   */
  constructor() {
    this.createdAt = new Date()
    this.updatedAt = this.createdAt // 使用同一个Date对象，确保时间一致
    this.state = new LifecycleCreatedState()
  }

  // ========== 类型安全的属性操作 ==========

  /**
   * 获取属性值（支持泛型类型推断）
   */
  public getAttribute<T = unknown>(key: string): T | undefined {
    return this._attributes.get(key) as T | undefined
  }

  /**
   * 设置属性值（支持泛型类型安全，支持链式调用）
   */
  public setAttribute<T>(key: string, value: T): this {
    this._attributes.set(key, value)
    this.updatedAt = new Date()
    return this
  }

  /**
   * 检查属性是否存在
   */
  public hasAttribute(key: string): boolean {
    return this._attributes.has(key)
  }

  /**
   * 删除属性
   */
  public deleteAttribute(key: string): boolean {
    const deleted = this._attributes.delete(key)
    if (deleted) {
      this.updatedAt = new Date()
    }
    return deleted
  }

  /**
   * 获取所有属性（防御性复制）
   */
  public getAttributes(): ReadonlyMap<string, unknown> {
    return new Map(this._attributes)
  }

  /**
   * 批量设置属性（支持链式调用）
   */
  public setAttributes(attributes: Record<string, unknown>): this {
    for (const [key, value] of Object.entries(attributes)) {
      this._attributes.set(key, value)
    }
    this.updatedAt = new Date()
    return this
  }

  /**
   * 要求属性存在，否则抛出异常
   */
  public requireAttribute<T>(key: string): T {
    if (!this._attributes.has(key)) {
      throw new Error(`Required attribute '${key}' not found`)
    }
    return this.getAttribute<T>(key)!
  }
}
