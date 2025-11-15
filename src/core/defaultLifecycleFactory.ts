import type LifecycleFactory from './lifecycleFactory'

import LifecycleObject from './lifecycleObject'

/**
 * 默认的生命周期对象工厂实现
 */
export default class DefaultLifecycleFactory implements LifecycleFactory {
  async create(): Promise<LifecycleObject> {
    return new LifecycleObject()
  }
}
