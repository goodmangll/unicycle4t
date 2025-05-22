import type { ObjectId } from '../types';
import LifecycleObject from '../lifecycleObject';
import LifecycleDao from './lifecycleDao';

/**
 * 内存生命周期数据访问对象
 * 提供基于内存的生命周期对象存储和检索功能
 */
export class MemoryLifecycleDao implements LifecycleDao {

    
  private readonly storage: Map<ObjectId, LifecycleObject>;

  constructor() {
    this.storage = new Map();
  }

  public async create(object: LifecycleObject): Promise<void> {
    this.storage.set(object.getId(), object);
  }

  public async get(id: string): Promise<LifecycleObject | null> {
    return this.storage.get(id) ?? null;
  }

  public async update(object: LifecycleObject): Promise<void> {
    this.storage.set(object.getId(), object);
  }

  public async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }


}
