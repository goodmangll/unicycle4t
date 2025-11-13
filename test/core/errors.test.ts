import { describe, expect, it } from 'vitest'
import { LifecycleError } from '../../src/core/errors'

describe('lifecycleError', () => {
  describe('基础功能', () => {
    it('应该正确创建错误实例', () => {
      const error = new LifecycleError('测试错误消息')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(LifecycleError)
      expect(error.message).toBe('测试错误消息')
      expect(error.name).toBe('LifecycleError')
    })

    it('应该包含堆栈跟踪信息', () => {
      const error = new LifecycleError('错误消息')

      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('LifecycleError')
    })

    it('应该支持 instanceof 检查', () => {
      const error = new LifecycleError('测试')

      expect(error instanceof LifecycleError).toBe(true)
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('错误消息格式', () => {
    it('应该支持对象未找到的错误消息', () => {
      const objectId = 'test-id-123'
      const error = new LifecycleError(`Lifecycle object not found: ${objectId}`)

      expect(error.message).toBe('Lifecycle object not found: test-id-123')
    })

    it('应该支持状态转换失败的错误消息', () => {
      const error = new LifecycleError('State transition failed: init -> started: 原因')

      expect(error.message).toContain('State transition failed')
      expect(error.message).toContain('init -> started')
    })

    it('应该支持 DAO 操作失败的错误消息', () => {
      const error = new LifecycleError('DAO operation \'create\' failed: 数据库连接失败')

      expect(error.message).toContain('DAO operation')
      expect(error.message).toContain('create')
      expect(error.message).toContain('数据库连接失败')
    })
  })

  describe('错误捕获和处理', () => {
    it('应该能够被 try-catch 捕获', () => {
      expect(() => {
        throw new LifecycleError('测试错误')
      }).toThrow(LifecycleError)
    })

    it('应该能够通过 instanceof 区分错误类型', () => {
      try {
        throw new LifecycleError('测试')
      }
      catch (error) {
        expect(error instanceof LifecycleError).toBe(true)
        expect(error instanceof Error).toBe(true)
      }
    })

    it('应该能够访问错误消息', () => {
      const message = '具体的错误描述'

      try {
        throw new LifecycleError(message)
      }
      catch (error) {
        if (error instanceof LifecycleError) {
          expect(error.message).toBe(message)
        }
      }
    })
  })

  describe('继承和扩展', () => {
    it('应该支持子类继承', () => {
      class CustomError extends LifecycleError {
        constructor(message: string) {
          super(message)
          this.name = 'CustomError'
        }
      }

      const error = new CustomError('自定义错误')

      expect(error).toBeInstanceOf(CustomError)
      expect(error).toBeInstanceOf(LifecycleError)
      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('CustomError')
      expect(error.message).toBe('自定义错误')
    })

    it('子类应该保持正确的原型链', () => {
      class WorkflowError extends LifecycleError {
        constructor(message: string) {
          super(message)
          this.name = 'WorkflowError'
        }
      }

      const error = new WorkflowError('工作流错误')

      expect(Object.getPrototypeOf(error).constructor.name).toBe('WorkflowError')
      expect(error instanceof WorkflowError).toBe(true)
      expect(error instanceof LifecycleError).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该支持空消息', () => {
      const error = new LifecycleError('')

      expect(error.message).toBe('')
      expect(error.name).toBe('LifecycleError')
    })

    it('应该支持多行消息', () => {
      const message = '错误描述第一行\n错误描述第二行\n错误描述第三行'
      const error = new LifecycleError(message)

      expect(error.message).toBe(message)
    })

    it('应该支持包含特殊字符的消息', () => {
      const message = '错误: "对象" <test-id> 的状态转换 [init] -> [started] 失败!'
      const error = new LifecycleError(message)

      expect(error.message).toBe(message)
    })

    it('应该支持包含 Unicode 字符的消息', () => {
      const message = '生命周期对象未找到: 测试ID-123 🚀'
      const error = new LifecycleError(message)

      expect(error.message).toBe(message)
    })
  })
})
