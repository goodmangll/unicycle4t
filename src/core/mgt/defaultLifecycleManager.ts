import type { Emitter } from 'mitt'
import type LifecycleDao from '../dao/lifecycleDao'
import type LifecycleIdGenerator from '../dao/lifecycleIdGenerator'
import type LifecycleFactory from '../lifecycleFactory'
import type LifecycleObject from '../lifecycleObject'
import type { LifecycleEventData, LifecycleState, ObjectId } from '../types'
import type LifecycleManager from './lifecycleManager'
import mitt from 'mitt'
import { MemoryLifecycleDao } from '../dao/memoryLifecycleDao'
import UuidLifecycleIdGenerator from '../dao/uuidLifecycleIdGenerator'
import DefaultLifecycleFactory from '../defaultLifecycleFactory'
import { LifecycleError } from '../errors'
import { LifecycleStartedState, LifecycleStoppedState } from '../lifecycleState'

/**
 * 生命周期管理器
 * 负责管理所有生命周期对象的创建、状态转换和销毁
 */
export default class DefaultLifecycleManager implements LifecycleManager {
  public readonly events: Emitter<LifecycleEventData>
  private readonly factory: LifecycleFactory
  private readonly dao: LifecycleDao
  private readonly idGenerator: LifecycleIdGenerator

  constructor(
    factory?: LifecycleFactory,
    dao?: LifecycleDao,
    idGenerator?: LifecycleIdGenerator,
  ) {
    this.events = mitt<LifecycleEventData>()
    this.factory = factory ?? new DefaultLifecycleFactory()
    this.dao = dao ?? new MemoryLifecycleDao()
    this.idGenerator = idGenerator ?? new UuidLifecycleIdGenerator()
  }

  public async createObject(): Promise<LifecycleObject> {
    const object = await this.factory.create()
    object.setId(this.idGenerator.generate(object))
    await this.dao.create(object)

    // 发射对象创建事件
    this.events.emit('object:created', {
      object,
      timestamp: new Date(),
    })

    return object
  }

  public async getObject(id: ObjectId): Promise<LifecycleObject | null> {
    return await this.dao.get(id)
  }

  public async startObject(id: ObjectId): Promise<void> {
    await this.changeState(id, new LifecycleStartedState())
  }

  public async stopObject(id: ObjectId): Promise<void> {
    await this.changeState(id, new LifecycleStoppedState())
  }

  public async deleteObject(id: ObjectId): Promise<void> {
    await this.dao.delete(id)

    // 发射对象删除事件
    this.events.emit('object:deleted', {
      objectId: id,
      timestamp: new Date(),
    })
  }

  /**
   * 改变对象状态
   * @param id 对象ID
   * @param state 目标状态
   */
  protected async changeState(id: ObjectId, state: LifecycleState): Promise<void>

  /**
   * 改变对象状态
   * @param object 生命周期对象
   * @param state 目标状态
   */
  protected async changeState(object: LifecycleObject, state: LifecycleState): Promise<void>

  /**
   * 改变对象状态
   * @param idOrObject 对象ID或生命周期对象
   * @param state 目标状态
   */
  protected async changeState(idOrObject: ObjectId | LifecycleObject, state: LifecycleState): Promise<void> {
    let object: LifecycleObject | null
    if (typeof idOrObject === 'object') {
      // 如果是 LifecycleObject 类型
      object = idOrObject
    }
    else {
      // 如果是 ObjectId 类型（string 或 number）
      object = await this.getObject(idOrObject)
    }

    if (!object) {
      throw new LifecycleError(`Lifecycle object not found: ${typeof idOrObject === 'object' ? idOrObject.getId() : idOrObject}`)
    }

    const oldState = object.getState()
    object.setState(state)
    await this.onChange(object)

    // 发射状态变化事件
    this.events.emit('object:stateChanged', {
      object,
      oldState,
      newState: state,
      timestamp: new Date(),
    })
  }

  protected async onChange(object: LifecycleObject) {
    this.dao.update(object)
  }
}
