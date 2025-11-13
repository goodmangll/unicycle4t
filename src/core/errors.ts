/**
 * 生命周期框架错误类
 * 框架内所有错误统一使用此类
 */
export class LifecycleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LifecycleError'

    // 保持正确的原型链（TypeScript/ES6 继承 Error 的标准做法）
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
