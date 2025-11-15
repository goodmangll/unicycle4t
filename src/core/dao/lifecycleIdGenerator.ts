import type LifecycleObject from '../lifecycleObject'

/**
 * 生命周期ID生成器接口
 */
export default interface LifecycleIdGenerator {

  /**
   * 生成新的ID
   * @param lifecycleObject 生命周期对象
   * @returns 新的ID
   */
  generate: (lifecycleObject: LifecycleObject) => string
}
