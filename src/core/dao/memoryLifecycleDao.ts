import type LifecycleObject from '../lifecycleObject'
import type { ObjectId } from '../types'
import type LifecycleDao from './lifecycleDao'

/**
 * 内存生命周期数据访问对象
 * 提供基于内存的生命周期对象存储和检索功能
 */
export class MemoryLifecycleDao implements LifecycleDao {
  private readonly storage: Map<ObjectId, LifecycleObject>

  constructor() {
    this.storage = new Map()
  }

  public create = async (object: LifecycleObject): Promise<void> => {
    this.storage.set(object.id, object)
  }

  public get = async (id: ObjectId): Promise<LifecycleObject | null> => {
    return this.storage.get(id) ?? null
  }

  public update = async (object: LifecycleObject): Promise<void> => {
    this.storage.set(object.id, object)
  }

  public delete = async (id: ObjectId): Promise<void> => {
    this.storage.delete(id)
  }
}
