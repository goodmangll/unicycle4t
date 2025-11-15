import type LifecycleFactory from './lifecycleFactory'

import LifecycleObject from './lifecycleObject'

/**
 * 默认的生命周期对象工厂实现
 */
export default class DefaultLifecycleFactory implements LifecycleFactory {
  create = async (initialAttributes?: Record<string, unknown>): Promise<LifecycleObject> => {
    const object = new LifecycleObject()

    if (initialAttributes) {
      object.setAttributes(initialAttributes)
    }
    return object
  }
}
