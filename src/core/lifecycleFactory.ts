import type LifecycleObject from './lifecycleObject'

/**
 * 生命周期对象工厂接口
 */
export default interface LifecycleFactory {

  /**
   * 创建生命周期对象
   * @param initialAttributes 初始属性
   * @returns 生命周期对象实例
   */
  create: (initialAttributes?: Record<string, unknown>) => Promise<LifecycleObject>
}

/**
 * 泛型生命周期对象工厂接口
 */
export interface GenericLifecycleFactory<T extends LifecycleObject = LifecycleObject> {
  create: <U extends T = T>() => Promise<U>
}
