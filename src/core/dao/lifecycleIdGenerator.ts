import type LifecycleObject from '../lifecycleObject'
import type { ObjectId } from '../types'

/**
 * 生命周期ID生成器接口
 */
export default interface LifecycleIdGenerator<T extends LifecycleObject = LifecycleObject> {
  generate: (lifecycleObject: T) => ObjectId
}
