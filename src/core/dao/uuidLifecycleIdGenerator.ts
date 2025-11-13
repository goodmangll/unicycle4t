import type LifecycleObject from '../lifecycleObject'
import type LifecycleIdGenerator from './lifecycleIdGenerator'
import { v4 as uuidv4 } from 'uuid'

/**
 * UUID 生命周期 ID 生成器
 *
 * @author linden
 */
export default class UuidLifecycleIdGenerator implements LifecycleIdGenerator {
  generate(_lifecycleObject: LifecycleObject): string {
    return uuidv4()
  }
}
