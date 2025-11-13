import type LifecycleObject from '../lifecycleObject'
import type { ObjectId } from '../types'

/**
 * 生命周期 DAO 接口
 *
 * @author linden
 */
export default interface LifecycleDao {

  /**
   * 保存对象
   * @param object 生命周期对象
   */
  create: (object: LifecycleObject) => Promise<void>

  /**
   * 获取对象
   * @param id 对象ID
   */
  get: (id: ObjectId) => Promise<LifecycleObject | null>

  /**
   * 更新对象
   * @param object 生命周期对象
   */
  update: (object: LifecycleObject) => Promise<void>

  /**
   * 删除对象
   * @param id 对象ID
   */
  delete: (id: ObjectId) => Promise<void>

}
