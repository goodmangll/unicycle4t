/* eslint-disable no-console */
import type { UserPermissions } from './session-manager.js'

import { WebSessionManager } from './session-manager.js'

/**
 * 模拟Web服务器演示会话管理
 */
export class DemoWebServer {
  private sessionManager: WebSessionManager
  private requestCount = 0

  constructor() {
    // 创建会话管理器：30分钟超时，5分钟清理间隔
    this.sessionManager = new WebSessionManager(
      30 * 60 * 1000, // 30分钟会话超时
      5 * 60 * 1000, // 5分钟清理间隔
    )
  }

  /**
   * 模拟用户登录
   */
  async simulateLogin(
    userId: string,
    userInfo: { email: string, permissions: UserPermissions, username: string },
    connectionInfo: { ip: string, userAgent: string } = { ip: '127.0.0.1', userAgent: 'Demo-Browser/1.0' },
  ): Promise<null | string> {
    console.log(`\n🔐 模拟用户登录: ${userInfo.username} (${userId})`)

    try {
      const sessionId = await this.sessionManager.createSession(
        userId,
        userInfo.username,
        userInfo.email,
        userInfo.permissions,
        connectionInfo.ip,
        connectionInfo.userAgent,
      )

      console.log(`✅ 登录成功，会话ID: ${sessionId}`)
      return sessionId
    }
    catch (error) {
      console.error('❌ 登录失败:', error.message)
      return null
    }
  }

  /**
   * 模拟用户访问页面
   */
  async simulatePageAccess(sessionId: string, page: string): Promise<boolean> {
    this.requestCount++
    console.log(`\n📄 请求 #${this.requestCount}: 访问 ${page}`)

    // 更新会话活动时间
    const updated = await this.sessionManager.updateActivity(sessionId)
    if (!updated) {
      console.log('❌ 会话不存在或已过期')
      return false
    }

    // 检查访问权限
    const hasPermission = await this.sessionManager.checkPermission(sessionId, 'read')
    if (!hasPermission) {
      console.log('🚫 访问被拒绝：无读取权限')
      return false
    }

    console.log(`✅ 页面访问成功: ${page}`)
    return true
  }

  /**
   * 模拟用户执行操作
   */
  async simulateUserAction(
    sessionId: string,
    action: string,
    requiredPermission: string = 'write',
  ): Promise<boolean> {
    console.log(`\n⚡ 执行操作: ${action}`)

    // 检查权限
    const hasPermission = await this.sessionManager.checkPermission(sessionId, requiredPermission)
    if (!hasPermission) {
      console.log(`🚫 操作被拒绝：需要 ${requiredPermission} 权限`)
      return false
    }

    // 更新会话活动时间
    await this.sessionManager.updateActivity(sessionId)
    console.log(`✅ 操作执行成功: ${action}`)
    return true
  }

  /**
   * 模拟用户登出
   */
  async simulateLogout(sessionId: string): Promise<void> {
    console.log('\n👋 模拟用户登出')

    const success = await this.sessionManager.logout(sessionId)
    if (success) {
      console.log('✅ 登出成功')
    }
    else {
      console.log('❌ 登出失败：会话不存在')
    }
  }

  /**
   * 演示权限管理
   */
  async demonstratePermissionManagement(sessionId: string): Promise<void> {
    console.log('\n🔐 演示权限管理...')

    // 获取当前会话信息
    const session = await this.sessionManager.getSession(sessionId)
    if (!session) {
      console.log('❌ 会话不存在')
      return
    }

    console.log('📊 当前权限:', session.permissions)

    // 提升权限
    const newPermissions: UserPermissions = {
      ...session.permissions,
      admin: true,
      custom: ['reports', 'analytics'],
    }

    const updated = await this.sessionManager.updatePermissions(sessionId, newPermissions)
    if (updated) {
      console.log('✅ 权限更新成功')

      // 验证新权限
      const hasAdmin = await this.sessionManager.checkPermission(sessionId, 'admin')
      const hasReports = await this.sessionManager.checkPermission(sessionId, 'reports')

      console.log(`🔐 管理员权限: ${hasAdmin}`)
      console.log(`📊 报表权限: ${hasReports}`)
    }
  }

  /**
   * 演示会话统计
   */
  showSessionStats(): void {
    console.log('\n📊 会话统计信息:')
    const stats = this.sessionManager.getStats() as { activeCount: number, totalCreated: number, totalExpired: number }
    console.log(`📦 总创建数: ${stats.totalCreated}`)
    console.log(`⏰ 总过期数: ${stats.totalExpired}`)
    console.log(`🟢 活跃会话数: ${stats.activeCount}`)
    console.log(`📈 峰值会话数: ${stats.peakCount}`)
    console.log(`⏱️ 会话超时: ${stats.sessionTimeout / 1000}秒`)
  }

  /**
   * 完整的用户会话演示
   */
  async demonstrateUserSession(): Promise<void> {
    console.log('\n🎭 开始完整的用户会话演示...')
    console.log('='.repeat(50))

    // 模拟不同权限的用户
    const users = [
      {
        userId: 'user001',
        userInfo: {
          username: 'alice',
          email: 'alice@example.com',
          permissions: { read: true, write: true, admin: false, custom: ['profile'] } as UserPermissions,
        },
      },
      {
        userId: 'user002',
        userInfo: {
          username: 'bob',
          email: 'bob@example.com',
          permissions: { read: true, write: false, admin: false, custom: [] } as UserPermissions,
        },
      },
      {
        userId: 'admin001',
        userInfo: {
          username: 'admin',
          email: 'admin@example.com',
          permissions: { read: true, write: true, admin: true, custom: ['system'] } as UserPermissions,
        },
      },
    ]

    const sessionIds: string[] = []

    // 用户登录
    for (const user of users) {
      const sessionId = await this.simulateLogin(
        user.userId,
        user.userInfo,
        { ip: '192.168.1.100', userAgent: 'Mozilla/5.0 Demo Browser' },
      )

      if (sessionId) {
        sessionIds.push(sessionId)
      }
    }

    // 模拟用户活动
    for (let i = 0; i < sessionIds.length; i++) {
      const sessionId = sessionIds[i]
      const user = users[i]

      console.log(`\n🎭 模拟 ${user.username} 的活动...`)

      // 访问页面
      await this.simulatePageAccess(sessionId, '/dashboard')
      await this.simulatePageAccess(sessionId, '/profile')

      // 执行操作
      if (user.permissions.write) {
        await this.simulateUserAction(sessionId, 'update_profile')
        await this.simulateUserAction(sessionId, 'upload_file')
      }

      // 管理员操作
      if (user.permissions.admin) {
        await this.simulateUserAction(sessionId, 'system_config', 'admin')
        await this.simulateUserAction(sessionId, 'user_management', 'admin')
      }

      // 演示权限管理
      if (i === 1) { // 为Bob提升权限
        await this.demonstratePermissionManagement(sessionId)
      }
    }

    // 显示统计信息
    this.showSessionStats()

    // 用户登出
    console.log('\n👋 用户开始登出...')
    for (const sessionId of sessionIds) {
      await this.simulateLogout(sessionId)
    }

    // 最终统计
    this.showSessionStats()
  }

  /**
   * 演示会话过期处理
   */
  async demonstrateSessionExpiration(): Promise<void> {
    console.log('\n⏰ 演示会话过期处理...')
    console.log('='.repeat(50))

    // 创建一个短生命周期的会话管理器
    const shortSessionManager = new WebSessionManager(
      2 * 1000, // 2秒超时
      1 * 1000, // 1秒清理间隔
    )

    // 创建会话
    const sessionId = await shortSessionManager.createSession(
      'testuser',
      'Test User',
      'test@example.com',
      { read: true, write: false, admin: false, custom: [] },
      '127.0.0.1',
      'Test-Agent',
    )

    if (sessionId) {
      console.log(`✅ 创建短生命周期会话: ${sessionId}`)

      // 立即访问（应该成功）
      console.log('\n📄 立即访问页面...')
      const session1 = await shortSessionManager.getSession(sessionId)
      console.log(session1 ? '✅ 访问成功' : '❌ 访问失败')

      // 等待超时后访问（应该失败）
      console.log('\n⏳ 等待会话过期...')
      await new Promise(resolve => setTimeout(resolve, 3 * 1000))

      console.log('\n📄 过期后访问页面...')
      const session2 = await shortSessionManager.getSession(sessionId)
      console.log(session2 ? '✅ 访问成功' : '❌ 访问失败（会话已过期）')

      shortSessionManager.showSessionStats()
      await shortSessionManager.cleanup()
    }
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    console.log('\n🧹 清理演示服务器资源...')
    await this.sessionManager.cleanup()
  }
}
