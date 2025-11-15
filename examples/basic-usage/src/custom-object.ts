import { LifecycleObject } from '@linden/unicycle4t'

/**
 * 自定义用户会话对象
 * 扩展基础生命周期对象，添加特定业务逻辑
 */
export class UserSession extends LifecycleObject {
  constructor() {
    super()
  }

  /**
   * 初始化用户会话
   */
  initialize(userId: string, permissions: string[] = []): void {
    const loginTime = new Date()
    const lastActivity = new Date()

    // 将数据存储到基础属性中
    this.setAttribute('userId', userId)
    this.setAttribute('loginTime', loginTime)
    this.setAttribute('permissions', permissions)
    this.setAttribute('lastActivity', lastActivity)
  }

  /**
   * 获取用户ID
   */
  getUserId(): string {
    return this.getAttribute('userId') as string
  }

  /**
   * 获取登录时间
   */
  getLoginTime(): Date {
    return this.getAttribute('loginTime') as Date
  }

  /**
   * 检查权限
   */
  hasPermission(permission: string): boolean {
    const permissions = this.getAttribute('permissions') as string[]
    return permissions.includes(permission)
  }

  /**
   * 更新活动时间
   */
  updateActivity(): void {
    const lastActivity = new Date()
    this.setAttribute('lastActivity', lastActivity)
  }

  /**
   * 获取会话持续时间（毫秒）
   */
  getSessionDuration(): number {
    const now = new Date()
    return now.getTime() - this.getLoginTime().getTime()
  }

  /**
   * 检查会话是否过期
   */
  isExpired(maxAge: number = 30 * 60 * 1000): boolean { // 默认30分钟
    return this.getSessionDuration() > maxAge
  }

  /**
   * 获取会话信息摘要
   */
  getSummary(): object {
    return {
      id: this.getId(),
      userId: this.getUserId(),
      loginTime: this.getLoginTime(),
      lastActivity: this.getAttribute('lastActivity'),
      duration: this.getSessionDuration(),
      permissions: this.getAttribute('permissions'),
      state: this.getState().name,
    }
  }
}

/**
 * 自定义任务对象
 */
export class Task extends LifecycleObject {
  constructor() {
    super()
  }

  /**
   * 初始化任务
   */
  initialize(taskType: string, payload: Record<string, unknown>): void {
    const status = 'pending'
    const createdAt = new Date()
    const retryCount = 0

    this.setAttribute('taskType', taskType)
    this.setAttribute('payload', payload)
    this.setAttribute('status', status)
    this.setAttribute('retryCount', retryCount)
    this.setAttribute('createdAt', createdAt)
  }

  /**
   * 开始执行任务
   */
  start(): void {
    const status = 'running'
    this.setAttribute('status', status)
  }

  /**
   * 完成任务
   */
  complete(result?: Record<string, unknown>): void {
    const status = 'completed'
    const completedAt = new Date()
    this.setAttribute('status', status)
    this.setAttribute('completedAt', completedAt)
    if (result) {
      this.setAttribute('result', result)
    }
  }

  /**
   * 任务失败
   */
  fail(error: Error): void {
    this.status = 'failed'
    this.setAttribute('status', this.status)
    this.setAttribute('error', error.message)
  }

  /**
   * 重试任务
   */
  retry(): void {
    this.retryCount++
    this.status = 'pending'
    this.setAttribute('retryCount', this.retryCount)
    this.setAttribute('status', this.status)
  }

  /**
   * 获取任务信息
   */
  getTaskInfo(): object {
    return {
      id: this.getId(),
      type: this.getAttribute('taskType'),
      status: this.getAttribute('status'),
      payload: this.getAttribute('payload'),
      retryCount: this.getAttribute('retryCount'),
      createdAt: this.getAttribute('createdAt'),
      completedAt: this.getAttribute('completedAt'),
      duration: this.completedAt
        ? this.completedAt.getTime() - this.createdAt.getTime()
        : Date.now() - this.createdAt.getTime(),
    }
  }
}
