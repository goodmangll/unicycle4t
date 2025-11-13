import type LifecycleObject from './lifecycleObject'

/**
 * 生命周期对象工厂接口
 */
export default interface LifecycleFactory {

  /**
   * 创建生命周期对象
   *
   * @returns 生命周期对象
   */
  create: () => Promise<LifecycleObject>
}
