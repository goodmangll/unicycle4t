/* eslint-disable no-console */
import { DefaultLifecycleManager } from '@linden/unicycle4t'

/**
 * 用户权限类型
 */
export interface UserPermissions {
  admin: boolean
  custom: string[]
  read: boolean
  write: boolean
}

/**
 * 会话数据
 */
export interface SessionData {
  email: string
  lastActivity: Date
  loginIP: string
  loginTime: Date
  permissions: UserPermissions
  userAgent: string
  userId: string
  username: string
}

/**
 * Web会话管理器
 * 使用 Unicycle4T 管理用户会话的生命周期
 */
export class WebSessionManager {
  private manager = new DefaultLifecycleManager()
  private readonly sessionTimeout: number
  private readonly cleanupInterval: number

  // 会话统计
  private stats = {
    totalCreated: 0,
    totalExpired: 0,
    activeCount: 0,
    peakCount: 0,
  }

  constructor(sessionTimeout: number = 30 * 60 * 1000, cleanupInterval: number = 5 * 60 * 1000) {
    this.sessionTimeout = sessionTimeout
    this.cleanupInterval = cleanupInterval

    // 启动定期清理任务
    this.startCleanupTask()

    // 设置事件监听
    this.setupEventListeners()
  }

  /**
   * 创建新的用户会话
   */
  async createSession(
    userId: string,
    userInfo: { email: string, permissions: UserPermissions, username: string },
    loginInfo: { loginIP: string, userAgent: string },
  ): Promise<string> {
    const session = await this.manager.createObject()

    // 存储会话数据
    const sessionData: SessionData = {
      userId,
      username: userInfo.username,
      email: userInfo.email,
      permissions: userInfo.permissions,
      loginTime: new Date(),
      lastActivity: new Date(),
      loginIP: loginInfo.loginIP,
      userAgent: loginInfo.userAgent,
    }

    session.setAttribute('sessionData', sessionData)
    session.setAttribute('sessionId', session.getId())
    session.setAttribute('isActive', true)

    // 启动会话
    await this.manager.startObject(session.getId())

    // 更新统计
    this.stats.totalCreated++
    this.stats.activeCount++
    if (this.stats.activeCount > this.stats.peakCount) {
      this.stats.peakCount = this.stats.activeCount
    }

    console.log(`🔐 创建会话: ${userId} (${username}) - ${session.getId()}`)

    return session.getId() as string
  }

  /**
   * 获取会话信息
   */
  async getSession(sessionId: string): Promise<null | SessionData> {
    try {
      const session = await this.manager.getObject(sessionId)
      if (!session || !session.getAttribute('isActive')) {
        return null
      }

      const sessionData = session.getAttribute('sessionData') as SessionData

      // 检查会话是否过期
      if (this.isSessionExpired(sessionData)) {
        await this.expireSession(sessionId)
        return null
      }

      return sessionData
    }
    catch (error) {
      console.warn(`获取会话失败: ${sessionId}`, error.message)
      return null
    }
  }

  /**
   * 更新会话活动时间
   */
  async updateActivity(sessionId: string): Promise<boolean> {
    try {
      const session = await this.manager.getObject(sessionId)
      if (!session || !session.getAttribute('isActive')) {
        return false
      }

      const sessionData = session.getAttribute('sessionData') as SessionData
      sessionData.lastActivity = new Date()

      session.setAttribute('sessionData', sessionData)
      await this.manager.onChange(session)

      return true
    }
    catch (error) {
      console.warn(`更新会话活动时间失败: ${sessionId}`, error.message)
      return false
    }
  }

  /**
   * 更新用户权限
   */
  async updatePermissions(sessionId: string, permissions: UserPermissions): Promise<boolean> {
    try {
      const session = await this.manager.getObject(sessionId)
      if (!session || !session.getAttribute('isActive')) {
        return false
      }

      const sessionData = session.getAttribute('sessionData') as SessionData
      sessionData.permissions = permissions

      session.setAttribute('sessionData', sessionData)
      await this.manager.onChange(session)

      console.log(`🔐 更新权限: ${sessionId}`)
      return true
    }
    catch (error) {
      console.warn(`更新权限失败: ${sessionId}`, error.message)
      return false
    }
  }

  /**
   * 检查会话权限
   */
  async checkPermission(sessionId: string, permission: string): Promise<boolean> {
    const sessionData = await this.getSession(sessionId)
    if (!sessionData) {
      return false
    }

    const { permissions } = sessionData

    // 检查基础权限
    if (permission in permissions) {
      return (permissions as Record<string, boolean>)[permission]
    }

    // 检查自定义权限
    return permissions.custom.includes(permission)
  }

  /**
   * 登出（主动结束会话）
   */
  async logout(sessionId: string): Promise<boolean> {
    try {
      const session = await this.manager.getObject(sessionId)
      if (!session) {
        return false
      }

      const sessionData = session.getAttribute('sessionData') as SessionData

      // 停止并删除会话
      await this.manager.stopObject(sessionId)
      await this.manager.deleteObject(sessionId)

      this.stats.activeCount--

      console.log(`👋 用户登出: ${sessionData.username} (${sessionId})`)
      return true
    }
    catch (error) {
      console.warn(`登出失败: ${sessionId}`, error.message)
      return false
    }
  }

  /**
   * 过期会话（被动清理）
   */
  async expireSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.manager.getObject(sessionId)
      if (!session) {
        return false
      }

      const sessionData = session.getAttribute('sessionData') as SessionData

      // 停止并删除会话
      await this.manager.stopObject(sessionId)
      await this.manager.deleteObject(sessionId)

      this.stats.totalExpired++
      this.stats.activeCount--

      console.log(`⏰ 会话过期: ${sessionData.username} (${sessionId})`)
      return true
    }
    catch (error) {
      console.warn(`过期会话处理失败: ${sessionId}`, error.message)
      return false
    }
  }

  /**
   * 强制用户下线（所有会话）
   */
  async forceLogoutUser(userId: string): Promise<number> {
    // 这里需要扩展查询功能，当前简化处理
    console.log(`🚫 强制用户下线: ${userId}`)
    return 0
  }

  /**
   * 获取活跃会话列表
   */
  async getActiveSessions(): Promise<SessionData[]> {
    // 这里需要扩展查询功能，当前返回空数组
    // 实际实现中可能需要自定义DAO支持复杂查询
    console.log('📊 获取活跃会话列表')
    return []
  }

  /**
   * 获取会话统计信息
   */
  getStats(): object {
    return {
      ...this.stats,
      sessionTimeout: this.sessionTimeout,
      cleanupInterval: this.cleanupInterval,
    }
  }

  /**
   * 检查会话是否过期
   */
  private isSessionExpired(sessionData: SessionData): boolean {
    const now = new Date()
    const { lastActivity } = sessionData
    return now.getTime() - lastActivity.getTime() > this.sessionTimeout
  }

  /**
   * 启动定期清理任务
   */
  private startCleanupTask(): void {
    setInterval(async () => {
      await this.cleanupExpiredSessions()
    }, this.cleanupInterval)
  }

  /**
   * 清理过期会话
   */
  private async cleanupExpiredSessions(): Promise<void> {
    // 这里需要扩展查询功能，当前简化处理
    console.log('🧹 开始清理过期会话...')
    // 实际实现中需要查询所有活跃会话并检查过期状态
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.manager.events.on('object:created', (data) => {
      console.log(`🎉 会话事件: 创建 - ${data.object.getId()}`)
    })

    this.manager.events.on('object:stateChanged', (data) => {
      console.log(`🔄 会话事件: 状态变更 - ${data.object.getId()}: ${data.oldState.name} → ${data.newState.name}`)
    })

    this.manager.events.on('object:deleted', (data) => {
      console.log(`🗑️ 会话事件: 删除 - ${data.objectId}`)
    })
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    console.log('🧹 清理会话管理器资源...')
    // 这里可以添加清理逻辑
  }
}
