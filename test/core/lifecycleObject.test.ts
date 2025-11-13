import { beforeEach, describe, expect, it } from 'vitest'
import LifecycleObject from '../../src/core/lifecycleObject'
import { LifecycleStartedState, LifecycleStoppedState } from '../../src/core/lifecycleState'

describe('lifecycleObject', () => {
  let object: LifecycleObject

  beforeEach(() => {
    object = new LifecycleObject()
  })

  describe('基础属性', () => {
    it('应该正确初始化创建时间', () => {
      const now = new Date()
      expect(object.getCreatedAt()).toBeInstanceOf(Date)
      expect(object.getCreatedAt().getTime()).toBeLessThanOrEqual(now.getTime())
    })

    it('应该正确初始化更新时间', () => {
      expect(object.getUpdatedAt()).toBeInstanceOf(Date)
      expect(object.getUpdatedAt()).toEqual(object.getCreatedAt())
    })
  })

  describe('iD 管理', () => {
    it('应该能够设置和获取 ID（字符串）', () => {
      object.setId('test-id-123')
      expect(object.getId()).toBe('test-id-123')
    })

    it('应该能够设置和获取 ID（数字）', () => {
      object.setId(123)
      expect(object.getId()).toBe(123)
    })
  })

  describe('状态管理', () => {
    it('应该能够设置和获取状态', () => {
      const startedState = new LifecycleStartedState()
      object.setState(startedState)

      expect(object.getState()).toBe(startedState)
      expect(object.getState().name).toBe('started')
    })

    it('设置状态应该更新 updatedAt 时间', async () => {
      const oldUpdatedAt = object.getUpdatedAt()

      // 等待 1ms 确保时间变化
      await new Promise(resolve => setTimeout(resolve, 1))

      object.setState(new LifecycleStartedState())

      expect(object.getUpdatedAt().getTime()).toBeGreaterThan(oldUpdatedAt.getTime())
    })

    it('应该能够切换不同的状态', () => {
      const startedState = new LifecycleStartedState()
      const stoppedState = new LifecycleStoppedState()

      object.setState(startedState)
      expect(object.getState().name).toBe('started')

      object.setState(stoppedState)
      expect(object.getState().name).toBe('stopped')
    })
  })

  describe('自定义属性', () => {
    it('应该能够设置和获取属性', () => {
      object.setAttribute('key1', 'value1')
      expect(object.getAttribute('key1')).toBe('value1')
    })

    it('应该能够设置不同类型的属性', () => {
      object.setAttribute('string', 'text')
      object.setAttribute('number', 123)
      object.setAttribute('boolean', true)
      object.setAttribute('object', { foo: 'bar' })
      object.setAttribute('array', [1, 2, 3])

      expect(object.getAttribute('string')).toBe('text')
      expect(object.getAttribute('number')).toBe(123)
      expect(object.getAttribute('boolean')).toBe(true)
      expect(object.getAttribute('object')).toEqual({ foo: 'bar' })
      expect(object.getAttribute('array')).toEqual([1, 2, 3])
    })

    it('应该能够删除属性', () => {
      object.setAttribute('key1', 'value1')
      expect(object.getAttribute('key1')).toBe('value1')

      object.removeAttribute('key1')
      expect(object.getAttribute('key1')).toBeUndefined()
    })

    it('获取不存在的属性应该返回 undefined', () => {
      expect(object.getAttribute('nonexistent')).toBeUndefined()
    })

    it('应该能够覆盖已存在的属性', () => {
      object.setAttribute('key1', 'value1')
      expect(object.getAttribute('key1')).toBe('value1')

      object.setAttribute('key1', 'value2')
      expect(object.getAttribute('key1')).toBe('value2')
    })
  })
})
