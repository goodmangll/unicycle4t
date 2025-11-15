import { beforeEach, describe, expect, it, vi } from 'vitest'

import LifecycleObject from '../../../src/core/lifecycleObject'
import DefaultLifecycleManager from '../../../src/core/mgt/defaultLifecycleManager'

describe('defaultLifecycleManager', () => {
  let manager: DefaultLifecycleManager

  beforeEach(() => {
    manager = new DefaultLifecycleManager()
  })

  describe('createObject', () => {
    it('应该创建对象并分配 ID', async () => {
      const object = await manager.create()

      expect(object).toBeInstanceOf(LifecycleObject)
      expect(object.id).toBeDefined()
      expect(typeof object.id).toBe('string')
    })

    it('应该触发 object:created 事件', async () => {
      const eventSpy = vi.fn()
      manager.events.on('object:created', eventSpy)

      const object = await manager.create()

      expect(eventSpy).toHaveBeenCalledOnce()
      expect(eventSpy).toHaveBeenCalledWith({
        object,
        timestamp: expect.any(Date),
      })
    })

    it('创建的对象应该可以通过 getObject 获取', async () => {
      const object = await manager.create()
      const retrieved = await manager.get(object.id as string)

      expect(retrieved).toBe(object)
    })

    it('应该为每个对象生成唯一的 ID', async () => {
      const object1 = await manager.create()
      const object2 = await manager.create()

      expect(object1.id).not.toBe(object2.id)
    })

    it('创建多个对象应该都能正确存储', async () => {
      const objects = await Promise.all([
        manager.create(),
        manager.create(),
        manager.create(),
      ])

      for (const object of objects) {
        const retrieved = await manager.get(object.id as string)
        expect(retrieved).toBe(object)
      }
    })
  })

  describe('getObject', () => {
    it('应该能够获取存在的对象', async () => {
      const object = await manager.create()
      const retrieved = await manager.get(object.id as string)

      expect(retrieved).toBe(object)
    })

    it('获取不存在的对象应该返回 null', async () => {
      const retrieved = await manager.get('nonexistent-id')
      expect(retrieved).toBeNull()
    })
  })

  describe('startObject', () => {
    it('应该能够启动对象', async () => {
      const object = await manager.create()
      await manager.start(object.id as string)

      const retrieved = await manager.get(object.id as string)
      expect(retrieved?.state.name).toBe('started')
    })

    it('应该触发 object:stateChanged 事件', async () => {
      const eventSpy = vi.fn()
      manager.events.on('object:stateChanged', eventSpy)

      const object = await manager.create()
      await manager.start(object.id as string)

      expect(eventSpy).toHaveBeenCalledOnce()
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          object: expect.any(LifecycleObject),
          newState: expect.objectContaining({ name: 'started' }),
          timestamp: expect.any(Date),
        }),
      )
    })

    it('启动不存在的对象应该抛出错误', async () => {
      await expect(manager.start('nonexistent-id')).rejects.toThrow('Lifecycle object not found: nonexistent-id')
    })

    // 注释：不再要求状态变更自动更新updatedAt时间，因为用户认为这个副作用不需要
    // it('应该更新对象的 updatedAt 时间', async () => {
    //   const object = await manager.create()
    //   const oldUpdatedAt = object.updatedAt
    //
    //   await new Promise(resolve => setTimeout(resolve, 1))
    //   await manager.start(object.id as string)
    //
    //   expect(object.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime())
    // })
  })

  describe('stopObject', () => {
    it('应该能够停止对象', async () => {
      const object = await manager.create()
      await manager.start(object.id as string)
      await manager.stop(object.id as string)

      const retrieved = await manager.get(object.id as string)
      expect(retrieved?.state.name).toBe('stopped')
    })

    it('应该触发 object:stateChanged 事件', async () => {
      const object = await manager.create()
      await manager.start(object.id as string)

      const eventSpy = vi.fn()
      manager.events.on('object:stateChanged', eventSpy)

      await manager.stop(object.id as string)

      expect(eventSpy).toHaveBeenCalledOnce()
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          object: expect.any(LifecycleObject),
          oldState: expect.objectContaining({ name: 'started' }),
          newState: expect.objectContaining({ name: 'stopped' }),
        }),
      )
    })

    it('停止未启动的对象也应该成功', async () => {
      const object = await manager.create()
      await expect(manager.stop(object.id as string)).resolves.toBeUndefined()
    })
  })

  describe('deleteObject', () => {
    it('应该能够删除对象', async () => {
      const object = await manager.create()
      const id = object.id as string

      await manager.delete(id)

      const retrieved = await manager.get(id)
      expect(retrieved).toBeNull()
    })

    it('应该触发 object:deleted 事件', async () => {
      const eventSpy = vi.fn()
      manager.events.on('object:deleted', eventSpy)

      const object = await manager.create()
      const id = object.id as string

      await manager.delete(id)

      expect(eventSpy).toHaveBeenCalledOnce()
      expect(eventSpy).toHaveBeenCalledWith({
        objectId: id,
        timestamp: expect.any(Date),
      })
    })

    it('删除不存在的对象应该仍触发事件', async () => {
      const eventSpy = vi.fn()
      manager.events.on('object:deleted', eventSpy)

      await manager.delete('nonexistent-id')

      expect(eventSpy).toHaveBeenCalledOnce()
    })

    it('删除对象后应该无法再次获取', async () => {
      const object = await manager.create()
      const id = object.id as string

      expect(await manager.get(id)).toBe(object)

      await manager.delete(id)

      expect(await manager.get(id)).toBeNull()
    })
  })

  describe('事件系统', () => {
    it('应该支持通配符监听所有事件', async () => {
      const eventSpy = vi.fn()
      manager.events.on('*', eventSpy)

      const object = await manager.create()
      await manager.start(object.id as string)
      await manager.delete(object.id as string)

      // 可能捕获 3 个或 4 个事件：created, stateChanged(启动), deleted
      // 如果对象需要先停止，则会有额外的stateChanged事件
      expect([3, 4]).toContain(eventSpy.mock.calls.length)
    })

    it('应该支持移除事件监听器', async () => {
      const eventSpy = vi.fn()
      manager.events.on('object:created', eventSpy)

      await manager.create()
      expect(eventSpy).toHaveBeenCalledOnce()

      manager.events.off('object:created', eventSpy)

      await manager.create()
      expect(eventSpy).toHaveBeenCalledOnce() // 仍然是 1 次
    })

    it('同一个事件应该支持多个监听器', async () => {
      const spy1 = vi.fn()
      const spy2 = vi.fn()
      const spy3 = vi.fn()

      manager.events.on('object:created', spy1)
      manager.events.on('object:created', spy2)
      manager.events.on('object:created', spy3)

      await manager.create()

      expect(spy1).toHaveBeenCalledOnce()
      expect(spy2).toHaveBeenCalledOnce()
      expect(spy3).toHaveBeenCalledOnce()
    })

    it('事件数据应该包含正确的时间戳', async () => {
      const before = new Date()

      manager.events.on('object:created', (data) => {
        expect(data.timestamp).toBeInstanceOf(Date)
        expect(data.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
      })

      await manager.create()
    })
  })

  describe('完整的生命周期流程', () => {
    it('应该支持完整的对象生命周期', async () => {
      const events: string[] = []

      manager.events.on('object:created', () => events.push('created'))
      manager.events.on('object:stateChanged', (data) => {
        events.push(`stateChanged:${data.newState.name}`)
      })
      manager.events.on('object:deleted', () => events.push('deleted'))

      // 创建
      const object = await manager.create()
      const id = object.id as string

      // 启动
      await manager.start(id)

      // 停止
      await manager.stop(id)

      // 删除
      await manager.delete(id)

      expect(events).toEqual([
        'created',
        'stateChanged:started',
        'stateChanged:stopped',
        'deleted',
      ])
    })

    it('对象的状态变化应该被持久化', async () => {
      const object = await manager.create()
      const id = object.id as string

      // 启动
      await manager.start(id)
      let retrieved = await manager.get(id)
      expect(retrieved?.state.name).toBe('started')

      // 停止
      await manager.stop(id)
      retrieved = await manager.get(id)
      expect(retrieved?.state.name).toBe('stopped')

      // 再次启动
      await manager.start(id)
      retrieved = await manager.get(id)
      expect(retrieved?.state.name).toBe('started')
    })
  })

  describe('并发操作', () => {
    it('应该支持并发创建多个对象', async () => {
      const objects = await Promise.all([
        manager.create(),
        manager.create(),
        manager.create(),
        manager.create(),
        manager.create(),
      ])

      expect(objects).toHaveLength(5)
      const ids = objects.map(obj => obj.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(5) // 所有ID都应该是唯一的
    })

    it('应该支持并发状态变更', async () => {
      const object = await manager.create()
      const id = object.id as string

      await Promise.all([
        manager.start(id),
        manager.stop(id),
        manager.start(id),
      ])

      const retrieved = await manager.get(id)
      expect(retrieved?.state.name).toBeDefined()
    })
  })
})
