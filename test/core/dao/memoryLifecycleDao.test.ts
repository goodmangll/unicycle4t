import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryLifecycleDao } from '../../../src/core/dao/memoryLifecycleDao'
import LifecycleObject from '../../../src/core/lifecycleObject'
import { LifecycleStartedState } from '../../../src/core/lifecycleState'

describe('memoryLifecycleDao', () => {
  let dao: MemoryLifecycleDao
  let object: LifecycleObject

  beforeEach(() => {
    dao = new MemoryLifecycleDao()
    object = new LifecycleObject()
    object.setId('test-id-1')
    object.setState(new LifecycleStartedState())
  })

  describe('create', () => {
    it('应该能够创建对象', async () => {
      await dao.create(object)

      const retrieved = await dao.get('test-id-1')
      expect(retrieved).toBe(object)
    })

    it('创建多个对象应该都能存储', async () => {
      const object2 = new LifecycleObject()
      object2.setId('test-id-2')

      await dao.create(object)
      await dao.create(object2)

      expect(await dao.get('test-id-1')).toBe(object)
      expect(await dao.get('test-id-2')).toBe(object2)
    })

    it('创建相同ID的对象应该覆盖原有对象', async () => {
      await dao.create(object)

      const object2 = new LifecycleObject()
      object2.setId('test-id-1')
      object2.setAttribute('updated', true)

      await dao.create(object2)

      const retrieved = await dao.get('test-id-1')
      expect(retrieved).toBe(object2)
      expect(retrieved?.getAttribute('updated')).toBe(true)
    })
  })

  describe('get', () => {
    it('应该能够获取存在的对象', async () => {
      await dao.create(object)
      const retrieved = await dao.get('test-id-1')

      expect(retrieved).toBe(object)
      expect(retrieved?.getId()).toBe('test-id-1')
    })

    it('获取不存在的对象应该返回 null', async () => {
      const retrieved = await dao.get('nonexistent-id')
      expect(retrieved).toBeNull()
    })

    it('应该支持数字类型的ID', async () => {
      const objWithNumberId = new LifecycleObject()
      objWithNumberId.setId(123)

      await dao.create(objWithNumberId)

      const retrieved = await dao.get(123)
      expect(retrieved).toBe(objWithNumberId)
      expect(retrieved?.getId()).toBe(123)
    })
  })

  describe('update', () => {
    it('应该能够更新对象', async () => {
      await dao.create(object)

      object.setAttribute('updated', true)
      await dao.update(object)

      const retrieved = await dao.get('test-id-1')
      expect(retrieved?.getAttribute('updated')).toBe(true)
    })

    it('更新不存在的对象应该添加到存储', async () => {
      await dao.update(object)

      const retrieved = await dao.get('test-id-1')
      expect(retrieved).toBe(object)
    })

    it('更新对象应该保持引用', async () => {
      await dao.create(object)

      const retrieved1 = await dao.get('test-id-1')
      object.setAttribute('key1', 'value1')
      await dao.update(object)

      const retrieved2 = await dao.get('test-id-1')
      expect(retrieved1).toBe(retrieved2)
      expect(retrieved2?.getAttribute('key1')).toBe('value1')
    })
  })

  describe('delete', () => {
    it('应该能够删除对象', async () => {
      await dao.create(object)
      expect(await dao.get('test-id-1')).toBe(object)

      await dao.delete('test-id-1')
      expect(await dao.get('test-id-1')).toBeNull()
    })

    it('删除不存在的对象不应该报错', async () => {
      await expect(dao.delete('nonexistent-id')).resolves.toBeUndefined()
    })

    it('删除对象后再次创建应该成功', async () => {
      await dao.create(object)
      await dao.delete('test-id-1')

      const newObject = new LifecycleObject()
      newObject.setId('test-id-1')
      await dao.create(newObject)

      const retrieved = await dao.get('test-id-1')
      expect(retrieved).toBe(newObject)
    })
  })

  describe('并发操作', () => {
    it('应该支持并发创建多个对象', async () => {
      const objects = Array.from({ length: 10 }, (_, i) => {
        const obj = new LifecycleObject()
        obj.setId(`id-${i}`)
        return obj
      })

      await Promise.all(objects.map(obj => dao.create(obj)))

      for (let i = 0; i < 10; i++) {
        const retrieved = await dao.get(`id-${i}`)
        expect(retrieved).toBe(objects[i])
      }
    })

    it('应该支持并发更新操作', async () => {
      await dao.create(object)

      await Promise.all([
        dao.update(object),
        dao.update(object),
        dao.update(object),
      ])

      const retrieved = await dao.get('test-id-1')
      expect(retrieved).toBe(object)
    })
  })
})
