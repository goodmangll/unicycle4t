import LifecycleObject from '../lifecycleObject';
import { LifecycleStartedState, LifecycleStoppedState } from '../lifecycleState';
import LifecycleFactory from '../lifecycleFactory';
import DefaultLifecycleFactory from '../defaultLifecycleFactory';
import LifecycleDao from '../dao/lifecycleDao';
import { MemoryLifecycleDao } from '../dao/memoryLifecycleDao';
import UuidLifecycleIdGenerator from '../dao/uuidLifecycleIdGenerator';
import LifecycleIdGenerator from '../dao/lifecycleIdGenerator';
import LifecycleManager from './lifecycleManager';
import type { LifecycleState } from '../types';

/**
 * 生命周期管理器
 * 负责管理所有生命周期对象的创建、状态转换和销毁
 */
export default class DefaultLifecycleManager implements LifecycleManager {
  private readonly factory: LifecycleFactory;
  private readonly dao: LifecycleDao;
  private readonly idGenerator: LifecycleIdGenerator;

  constructor(
    factory?: LifecycleFactory,
    dao?: LifecycleDao,
    idGenerator?: LifecycleIdGenerator
  ) {
    this.factory = factory ?? new DefaultLifecycleFactory();
    this.dao = dao ?? new MemoryLifecycleDao();
    this.idGenerator = idGenerator ?? new UuidLifecycleIdGenerator();
  }

  public async createObject(): Promise<LifecycleObject> {
     const object = await this.factory.create();
     object.setId(this.idGenerator.generate(object));
     await this.dao.create(object);
     return object;
  }

  public async getObject(id: string): Promise<LifecycleObject | null> {
    return await this.dao.get(id);
  }

  public async startObject(id: string): Promise<void> {
    await this.changeState(id, LifecycleStartedState);
  }

  public async stopObject(id: string): Promise<void> {
    await this.changeState(id, LifecycleStoppedState);
  }

  /**
   * 改变对象状态
   * @param id 对象ID
   * @param state 目标状态
   */
  protected async changeState(id: string, state: LifecycleState): Promise<void>;

  /**
   * 改变对象状态
   * @param object 生命周期对象
   * @param state 目标状态
   */
  protected async changeState(object: LifecycleObject, state: LifecycleState): Promise<void>;

  /**
   * 改变对象状态
   * @param idOrObject 对象ID或生命周期对象
   * @param state 目标状态
   */
  protected async changeState(idOrObject: string | LifecycleObject, state: LifecycleState): Promise<void> {
    const object = typeof idOrObject === 'string' 
      ? await this.getObject(idOrObject)
      : idOrObject;
      
    if (!object) {
      throw new Error(`Object not found`);
    }

    object.setState(state);
    await this.onChange(object);
    // TODO: 触发状态变化事件
  }

  protected async onChange(object: LifecycleObject) {
    this.dao.update(object);
  }
  
} 