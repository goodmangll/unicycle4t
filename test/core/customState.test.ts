import type { LifecycleState } from '../../src/core/types'

import { describe, expect, it, vi } from 'vitest'

import DefaultLifecycleManager from '../../src/core/mgt/defaultLifecycleManager'

// 自定义状态：暂停状态
class PausedState implements LifecycleState {
  readonly name = 'paused'
}

// 自定义状态：错误状态
class ErrorState implements LifecycleState {
  readonly name = 'error'
  constructor(public readonly errorMessage: string) {}
}

// 自定义状态：完成状态
class CompletedState implements LifecycleState {
  readonly name = 'completed'
}

// 扩展 Manager 添加自定义状态操作
class CustomLifecycleManager extends DefaultLifecycleManager {
  async pauseObject(id: string): Promise<void> {
    const object = await this.getObject(id)
    if (!object) {
      throw new Error('Object not found')
    }

    const oldState = object.getState()
    const newState = new PausedState()
    object.setState(newState)
    await this.dao.update(object)

    this.events.emit('object:stateChanged', {
      object,
      oldState,
      newState,
      timestamp: new Date(),
    })
  }

  async errorObject(id: string, errorMessage: string): Promise<void> {
    const object = await this.getObject(id)
    if (!object) {
      throw new Error('Object not found')
    }

    const oldState = object.getState()
    const newState = new ErrorState(errorMessage)
    object.setState(newState)
    await this.dao.update(object)

    this.events.emit('object:stateChanged', {
      object,
      oldState,
      newState,
      timestamp: new Date(),
    })
  }

  async completeObject(id: string): Promise<void> {
    const object = await this.getObject(id)
    if (!object) {
      throw new Error('Object not found')
    }

    const oldState = object.getState()
    const newState = new CompletedState()
    object.setState(newState)
    await this.dao.update(object)

    this.events.emit('object:stateChanged', {
      object,
      oldState,
      newState,
      timestamp: new Date(),
    })
  }
}

describe('自定义状态扩展', () => {
  describe('pausedState - 暂停状态', () => {
    it('用户应该能够扩展暂停状态', async () => {
      const manager = new CustomLifecycleManager()

      const object = await manager.createObject()
      await manager.startObject(object.getId() as string)
      await manager.pauseObject(object.getId() as string)

      const retrieved = await manager.getObject(object.getId() as string)
      expect(retrieved?.getState().name).toBe('paused')
    })

    it('暂停操作应该触发状态变化事件', async () => {
      const manager = new CustomLifecycleManager()
      const eventSpy = vi.fn()
      manager.events.on('object:stateChanged', eventSpy)

      const object = await manager.createObject()
      await manager.startObject(object.getId() as string)

      eventSpy.mockClear() // 清除之前的调用

      await manager.pauseObject(object.getId() as string)

      expect(eventSpy).toHaveBeenCalledOnce()
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          newState: expect.objectContaining({ name: 'paused' }),
        }),
      )
    })
  })

  describe('errorState - 错误状态', () => {
    it('用户应该能够扩展错误状态', async () => {
      const manager = new CustomLifecycleManager()

      const object = await manager.createObject()
      await manager.errorObject(object.getId() as string, 'Something went wrong')

      const retrieved = await manager.getObject(object.getId() as string)
      expect(retrieved?.getState().name).toBe('error')
      expect((retrieved?.getState() as ErrorState).errorMessage).toBe('Something went wrong')
    })

    it('错误状态应该能携带额外信息', async () => {
      const manager = new CustomLifecycleManager()

      const object = await manager.createObject()
      await manager.errorObject(object.getId() as string, 'Network timeout')

      const retrieved = await manager.getObject(object.getId() as string)
      const errorState = retrieved?.getState() as ErrorState

      expect(errorState.name).toBe('error')
      expect(errorState.errorMessage).toBe('Network timeout')
    })
  })

  describe('completedState - 完成状态', () => {
    it('用户应该能够扩展完成状态', async () => {
      const manager = new CustomLifecycleManager()

      const object = await manager.createObject()
      await manager.completeObject(object.getId() as string)

      const retrieved = await manager.getObject(object.getId() as string)
      expect(retrieved?.getState().name).toBe('completed')
    })
  })

  describe('复杂的状态流转', () => {
    it('应该支持复杂的状态流转场景', async () => {
      const manager = new CustomLifecycleManager()
      const states: string[] = []

      manager.events.on('object:stateChanged', (data) => {
        states.push(data.newState.name)
      })

      const object = await manager.createObject()
      const id = object.getId() as string

      // started -> paused -> started -> completed
      await manager.startObject(id)
      await manager.pauseObject(id)
      await manager.startObject(id)
      await manager.completeObject(id)

      expect(states).toEqual(['started', 'paused', 'started', 'completed'])
    })

    it('应该支持从任意状态转换到错误状态', async () => {
      const manager = new CustomLifecycleManager()

      const object = await manager.createObject()
      const id = object.getId() as string

      await manager.startObject(id)
      await manager.pauseObject(id)
      await manager.errorObject(id, 'Unexpected error')

      const retrieved = await manager.getObject(id)
      expect(retrieved?.getState().name).toBe('error')
    })
  })

  describe('直接使用 LifecycleState 接口', () => {
    it('用户可以直接创建并使用自定义状态', async () => {
      const manager = new DefaultLifecycleManager()
      const object = await manager.createObject()

      // 直接设置自定义状态
      const customState = new PausedState()
      object.setState(customState)

      expect(object.getState().name).toBe('paused')
    })

    it('自定义状态对象应该是类型安全的', () => {
      const pausedState = new PausedState()
      const errorState = new ErrorState('Test error')

      expect(pausedState.name).toBe('paused')
      expect(errorState.name).toBe('error')
      expect(errorState.errorMessage).toBe('Test error')
    })
  })

  describe('与对象属性结合使用', () => {
    it('自定义状态可以与对象属性结合使用', async () => {
      const manager = new CustomLifecycleManager()
      const object = await manager.createObject()
      const id = object.getId() as string

      // 设置任务相关属性
      object.setAttribute('taskName', 'Important Task')
      object.setAttribute('progress', 50)

      // 启动任务
      await manager.startObject(id)

      // 更新进度
      object.setAttribute('progress', 100)

      // 完成任务
      await manager.completeObject(id)

      const retrieved = await manager.getObject(id)
      expect(retrieved?.getState().name).toBe('completed')
      expect(retrieved?.getAttribute('taskName')).toBe('Important Task')
      expect(retrieved?.getAttribute('progress')).toBe(100)
    })
  })
})
