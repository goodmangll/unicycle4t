import { DefaultLifecycleManager } from '@linden/unicycle4t'

/**
 * 连接���态枚举
 */
export enum ConnectionStatus {
  IDLE = 'idle',
  BUSY = 'busy',
  CHECKED_OUT = 'checked_out',
  ERROR = 'error',
}

/**
 * 连接配置
 */
export interface ConnectionConfig {
  host: string
  port: number
  database?: string
  username?: string
  password?: string
  options?: Record<string, any>
}

/**
 * 连接信息
 */
export interface ConnectionInfo {
  id: string
  config: ConnectionConfig
  status: ConnectionStatus
  createdAt: Date
  lastUsed: Date
  usageCount: number
  errorCount: number
  totalUseTime: number
  isActive: boolean
}

/**
 * 连接池统计
 */
export interface PoolStats {
  totalConnections: number
  activeConnections: number
  idleConnections: number
  busyConnections: number
  errorConnections: number
  totalCheckouts: number
  totalCheckins: number
  totalErrors: number
  averageUseTime: number
  poolUtilization: number
}

/**
 * 数据库连接池管理器
 * 使用 Unicycle4T 管理连接的生命周期
 */
export class ConnectionPool {
  private manager = new DefaultLifecycleManager()
  private minConnections: number
  private maxConnections: number
  private idleTimeout: number
  private maxLifetime: number

  // 连接管理
  private availableConnections: string[] = []
  private busyConnections = new Map<string, string>() // connectionId -> userId
  private connectionConfigs = new Map<string, ConnectionConfig>()

  // 统计信息
  private stats: PoolStats = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    busyConnections: 0,
    errorConnections: 0,
    totalCheckouts: 0,
    totalCheckins: 0,
    totalErrors: 0,
    averageUseTime: 0,
    poolUtilization: 0,
  }

  constructor(
    config: ConnectionConfig,
    options: {
      minConnections?: number
      maxConnections?: number
      idleTimeout?: number
      maxLifetime?: number
    } = {},
  ) {
    this.minConnections = options.minConnections ?? 5
    this.maxConnections = options.maxConnections ?? 20
    this.idleTimeout = options.idleTimeout ?? 300000 // 5分钟
    this.maxLifetime = options.maxLifetime ?? 3600000 // 1小时

    this.setupEventListeners()
    this.startMaintenanceTask()
  }

  /**
   * 初始化连接池
   */
  async initialize(): Promise<void> {
    console.log('🔧 初始化连接池...')

    // 创建最小数量的连接
    for (let i = 0; i < this.minConnections; i++) {
      await this.createConnection()
    }

    console.log(`✅ 连接池初始化完成，创建了 ${this.minConnections} 个连接`)
    this.updateStats()
  }

  /**
   * 获取连接
   */
  async acquireConnection(userId?: string): Promise<string | null> {
    try {
      // 1. 尝试从可用连接池获取
      let connectionId = this.availableConnections.pop()

      if (connectionId) {
        // 检查连接是否仍然有效
        if (await this.isConnectionValid(connectionId)) {
          await this.markConnectionBusy(connectionId, userId)
          console.log(`🔗 分配现有连接: ${connectionId} 给用户 ${userId || 'unknown'}`)
          return connectionId
        }
        else {
          // 连接无效，移除并创建新的
          await this.removeConnection(connectionId)
        }
      }

      // 2. 如果没有可用连接，尝试创建新连接
      if (this.stats.totalConnections < this.maxConnections) {
        connectionId = await this.createConnection()
        await this.markConnectionBusy(connectionId, userId)
        console.log(`🆕 创建新连接: ${connectionId} 给用户 ${userId || 'unknown'}`)
        return connectionId
      }

      // 3. 连接池已满，等待或返回null
      console.log('⚠️ 连接池已满，无法获取连接')
      return null
    }
    catch (error) {
      console.error('❌ 获取连接失败:', error.message)
      this.stats.totalErrors++
      return null
    }
  }

  /**
   * 释放连接
   */
  async releaseConnection(connectionId: string): Promise<boolean> {
    try {
      const connection = await this.manager.getObject(connectionId)
      if (!connection) {
        console.warn(`⚠️ 连接不存在: ${connectionId}`)
        return false
      }

      const connectionInfo = connection.getAttribute('connectionInfo') as ConnectionInfo

      // 检查连接状态
      if (connectionInfo.status !== ConnectionStatus.BUSY) {
        console.warn(`⚠️ 连接状态异常: ${connectionId} - ${connectionInfo.status}`)
        return false
      }

      // 更新连接状态
      connectionInfo.status = ConnectionStatus.IDLE
      connectionInfo.lastUsed = new Date()
      connection.setAttribute('connectionInfo', connectionInfo)

      // 从忙碌连接移到可用连接
      this.busyConnections.delete(connectionId)
      this.availableConnections.push(connectionId)

      this.stats.totalCheckins++
      this.updateStats()

      console.log(`🔓 连接已释放: ${connectionId}`)
      return true
    }
    catch (error) {
      console.error('❌ 释放连接失败:', error.message)
      this.stats.totalErrors++
      return false
    }
  }

  /**
   * 创建新连接
   */
  private async createConnection(): Promise<string> {
    const connection = await this.manager.createObject()

    const connectionInfo: ConnectionInfo = {
      id: connection.getId() as string,
      config: {
        host: 'localhost',
        port: 5432,
        database: 'testdb',
      },
      status: ConnectionStatus.IDLE,
      createdAt: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      errorCount: 0,
      totalUseTime: 0,
      isActive: true,
    }

    connection.setAttribute('connectionInfo', connectionInfo)
    await this.manager.startObject(connection.getId())

    // 添加到可用连接池
    this.availableConnections.push(connection.getId() as string)
    this.connectionConfigs.set(connection.getId() as string, connectionInfo.config)

    this.stats.totalConnections++
    this.stats.activeConnections++

    console.log(`➕ 创建连接: ${connection.getId()}`)
    return connection.getId() as string
  }

  /**
   * 移除连接
   */
  private async removeConnection(connectionId: string): Promise<void> {
    try {
      // 从各个数据结构中移除
      const availableIndex = this.availableConnections.indexOf(connectionId)
      if (availableIndex !== -1) {
        this.availableConnections.splice(availableIndex, 1)
      }

      this.busyConnections.delete(connectionId)
      this.connectionConfigs.delete(connectionId)

      // 停止并删除连接对象
      await this.manager.stopObject(connectionId)
      await this.manager.deleteObject(connectionId)

      this.stats.totalConnections--
      this.stats.activeConnections--

      console.log(`➖ 移除连接: ${connectionId}`)
    }
    catch (error) {
      console.error(`❌ 移除连接失败: ${connectionId}`, error.message)
    }
  }

  /**
   * 标记连接为忙碌状态
   */
  private async markConnectionBusy(connectionId: string, userId?: string): Promise<void> {
    const connection = await this.manager.getObject(connectionId)
    if (connection) {
      const connectionInfo = connection.getAttribute('connectionInfo') as ConnectionInfo

      connectionInfo.status = ConnectionStatus.BUSY
      connectionInfo.usageCount++
      connectionInfo.lastUsed = new Date()
      connection.setAttribute('connectionInfo', connectionInfo)

      this.busyConnections.set(connectionId, userId || 'unknown')
      this.stats.totalCheckouts++
      this.updateStats()
    }
  }

  /**
   * 检查连接是否有效
   */
  private async isConnectionValid(connectionId: string): Promise<boolean> {
    try {
      const connection = await this.manager.getObject(connectionId)
      if (!connection) {
        return false
      }

      const connectionInfo = connection.getAttribute('connectionInfo') as ConnectionInfo

      // 检查连接是否超过最大生命周期
      const age = Date.now() - connectionInfo.createdAt.getTime()
      if (age > this.maxLifetime) {
        console.log(`⏰ 连接超过最大生命周期: ${connectionId}`)
        return false
      }

      // 检查连接是否有错误
      if (connectionInfo.errorCount > 3) {
        console.log(`❌ 连接错误次数过多: ${connectionId}`)
        return false
      }

      // 模拟连接健康检查
      const isHealthy = await this.performHealthCheck(connectionId)
      if (!isHealthy) {
        connectionInfo.errorCount++
        connection.setAttribute('connectionInfo', connectionInfo)
        return false
      }

      return true
    }
    catch (error) {
      console.error(`❌ 连接有效性检查失败: ${connectionId}`, error.message)
      return false
    }
  }

  /**
   * 执行连接健康检查
   */
  private async performHealthCheck(_connectionId: string): Promise<boolean> {
    // 模拟健康检查逻辑
    // 实际实现中会执行真正的数据库ping查询
    return Math.random() > 0.05 // 95%的健康率
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.idleConnections = this.availableConnections.length
    this.stats.busyConnections = this.busyConnections.size
    this.stats.errorConnections = this.stats.totalConnections - this.stats.idleConnections - this.stats.busyConnections
    this.stats.poolUtilization = this.stats.totalConnections > 0
      ? this.stats.busyConnections / this.stats.totalConnections
      : 0

    // 计算平均使用时间（简化计算）
    if (this.stats.totalCheckins > 0) {
      this.stats.averageUseTime = Math.random() * 1000 + 100 // 模拟值
    }
  }

  /**
   * 获取连接池统计信息
   */
  getStats(): PoolStats {
    this.updateStats()
    return { ...this.stats }
  }

  /**
   * 获取连接详情
   */
  async getConnectionDetails(): Promise<ConnectionInfo[]> {
    const details: ConnectionInfo[] = []

    // 获取所有连接信息
    for (const connectionId of [...this.availableConnections, ...Array.from(this.busyConnections.keys())]) {
      try {
        const connection = await this.manager.getObject(connectionId)
        if (connection) {
          const connectionInfo = connection.getAttribute('connectionInfo') as ConnectionInfo
          details.push(connectionInfo)
        }
      }
      catch {
        // 忽略错误，继续处理其他连接
      }
    }

    return details
  }

  /**
   * 强制回收空闲连接
   */
  async reapIdleConnections(): Promise<number> {
    let reapedCount = 0
    const now = Date.now()

    const connectionsToReap: string[] = []

    for (const connectionId of this.availableConnections) {
      try {
        const connection = await this.manager.getObject(connectionId)
        if (connection) {
          const connectionInfo = connection.getAttribute('connectionInfo') as ConnectionInfo
          const idleTime = now - connectionInfo.lastUsed.getTime()

          if (idleTime > this.idleTimeout && this.stats.totalConnections > this.minConnections) {
            connectionsToReap.push(connectionId)
          }
        }
      }
      catch {
        // 连接异常，也加入回收列表
        connectionsToReap.push(connectionId)
      }
    }

    for (const connectionId of connectionsToReap) {
      await this.removeConnection(connectionId)
      reapedCount++
    }

    // 确保最小连接数
    while (this.stats.totalConnections < this.minConnections) {
      await this.createConnection()
    }

    if (reapedCount > 0) {
      console.log(`🧹 回收了 ${reapedCount} 个空闲连接`)
    }

    return reapedCount
  }

  /**
   * 启动维护任务
   */
  private startMaintenanceTask(): void {
    // 每分钟执行一次维护任务
    setInterval(async () => {
      await this.performMaintenance()
    }, 60000)
  }

  /**
   * 执行维护任务
   */
  private async performMaintenance(): Promise<void> {
    try {
      // 1. 回收空闲连接
      await this.reapIdleConnections()

      // 2. 检查连接健康状态
      await this.checkConnectionHealth()

      // 3. 更新统计信息
      this.updateStats()
    }
    catch (error) {
      console.error('❌ 维护任务执行失败:', error.message)
    }
  }

  /**
   * 检查所有连接的健康状态
   */
  private async checkConnectionHealth(): Promise<void> {
    const allConnections = [...this.availableConnections, ...Array.from(this.busyConnections.keys())]
    let unhealthyCount = 0

    for (const connectionId of allConnections) {
      if (!await this.isConnectionValid(connectionId)) {
        await this.removeConnection(connectionId)
        unhealthyCount++
      }
    }

    if (unhealthyCount > 0) {
      console.log(`🏥 发现并移除了 ${unhealthyCount} 个不健康连接`)
    }
  }

  /**
   * 关闭连接池
   */
  async close(): Promise<void> {
    console.log('🔌 关闭连接池...')

    // 关闭所有连接
    const allConnections = [...this.availableConnections, ...Array.from(this.busyConnections.keys())]

    for (const connectionId of allConnections) {
      await this.removeConnection(connectionId)
    }

    console.log('✅ 连接池已关闭')
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.manager.events.on('object:created', (data) => {
      console.log(`🎉 连接事件: 创建 - ${data.object.getId()}`)
    })

    this.manager.events.on('object:stateChanged', (data) => {
      const connectionInfo = data.object.getAttribute('connectionInfo') as ConnectionInfo
      if (connectionInfo) {
        console.log(`🔄 连接事件: 状态变更 - ${connectionInfo.id}: ${data.oldState.name} → ${data.newState.name}`)
      }
    })

    this.manager.events.on('object:deleted', (data) => {
      console.log(`🗑️ 连接事件: 删除 - ${data.objectId}`)
    })
  }
}
