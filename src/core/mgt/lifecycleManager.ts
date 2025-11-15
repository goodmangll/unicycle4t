import type LifecycleObject from '../lifecycleObject'
import type { ObjectId } from '../types'

export default interface LifecycleManager {

  /**
   * 创建一个生命周期对象
   * @param initialAttributes 初始属性
   * @returns 生命周期对象
   */
  create: (initialAttributes?: Record<string, unknown>) => Promise<LifecycleObject>

  /**
   * 删除一个生命周期对象
   * @param id 对象ID
   */
  delete: (id: ObjectId) => Promise<void>

  /**
   * 获取一个生命周期对象
   * @param id 对象ID
   * @returns 生命周期对象
   */
  get: (id: ObjectId) => Promise<LifecycleObject | null>

  /**
   * 启动一个生命周期对象
   * @param id 对象ID
   */
  start: (id: ObjectId) => Promise<void>

  /**
   * 停止一个生命周期对象
   * @param id 对象ID
   */
  stop: (id: ObjectId) => Promise<void>

}
