/* eslint-disable no-console */
import process from 'node:process'

import { ConnectionPool } from './connection-pool.js'

/**
 * 连接池管理示例主入口
 * 演示如何使用 Unicycle4T 构建数据库连接池系统
 */
async function main() {
  console.log('🔌 Unicycle4T 连接池管理示例')
  console.log('='.repeat(60))

  const connectionPool = new ConnectionPool(
    {
      host: 'localhost',
      port: 5432,
      database: 'testdb',
    },
    {
      minConnections: 3,
      maxConnections: 10,
      idleTimeout: 30000, // 30秒（为了演示效果）
      maxLifetime: 60000, // 1分钟（为了演示效果）
    },
  )

  try {
    // 1. 连接池初始化演示
    console.log('\n📚 第1部分：连接池初始化演示')
    console.log('-'.repeat(40))
    await demonstratePoolInitialization(connectionPool)

    // 2. 基础连接获取和释放演示
    console.log('\n📚 第2部分：基础连接获取和释放演示')
    console.log('-'.repeat(40))
    await demonstrateBasicConnectionOperations(connectionPool)

    // 3. 并发访问演示
    console.log('\n📚 第3部分：并发访问演示')
    console.log('-'.repeat(40))
    await demonstrateConcurrentAccess(connectionPool)

    // 4. 连接池满载演示
    console.log('\n📚 第4部分：连接池满载演示')
    console.log('-'.repeat(40))
    await demonstratePoolExhaustion(connectionPool)

    // 5. 连接健康检查和维护演示
    console.log('\n📚 第5部分：连接健康检查和维护演示')
    console.log('-'.repeat(40))
    await demonstrateHealthCheckAndMaintenance(connectionPool)

    // 6. 统计信息演示
    console.log('\n📚 第6部分：统计信息演示')
    console.log('-'.repeat(40))
    await demonstratePoolStatistics(connectionPool)

    // 显示最终统计
    console.log('\n📊 最终连接池统计')
    console.log('-'.repeat(40))
    const finalStats = connectionPool.getStats()
    console.log(JSON.stringify(finalStats, null, 2))

    console.log('\n🎉 所有演示完成！')
    console.log('\n📋 总结:')
    console.log('✅ 连接池初始化和配置')
    console.log('✅ 连接获取和释放管理')
    console.log('✅ 并发访问控制')
    console.log('✅ 连接池容量管理')
    console.log('✅ 健康检查和自动维护')
    console.log('✅ 性能监控和统计')
  }
  catch (error) {
    console.error('❌ 演示过程中发生错误:', error)
  }
  finally {
    await connectionPool.close()
  }
}

/**
 * 连接池初始化演示
 */
async function demonstratePoolInitialization(connectionPool: ConnectionPool): Promise<void> {
  console.log('🔧 初始化连接池...')

  await connectionPool.initialize()

  // 显示初始状态
  const stats = connectionPool.getStats()
  console.log('📊 初始化后统计:')
  console.log(`  总连接数: ${stats.totalConnections}`)
  console.log(`  空闲连接数: ${stats.idleConnections}`)
  console.log(`  忙碌连接数: ${stats.busyConnections}`)
  console.log(`  连接池利用率: ${(stats.poolUtilization * 100).toFixed(2)}%`)

  // 显示连接详情
  const details = await connectionPool.getConnectionDetails()
  console.log('\n🔍 连接详情:')
  details.forEach((conn, index) => {
    console.log(`  ${index + 1}. ID: ${conn.id}`)
    console.log(`     状态: ${conn.status}`)
    console.log(`     使用次数: ${conn.usageCount}`)
    console.log(`     创建时间: ${conn.createdAt.toISOString()}`)
  })
}

/**
 * 基础连接获取和释放演示
 */
async function demonstrateBasicConnectionOperations(connectionPool: ConnectionPool): Promise<void> {
  console.log('🔄 演示基础连接操作...')

  // 获取连接
  console.log('\n🔗 获取连接...')
  const connection1 = await connectionPool.acquireConnection('user1')
  console.log(`连接1: ${connection1}`)

  const connection2 = await connectionPool.acquireConnection('user2')
  console.log(`连接2: ${connection2}`)

  // 显示获取后的状态
  let stats = connectionPool.getStats()
  console.log('\n📊 获取连接后统计:')
  console.log(`  空闲连接数: ${stats.idleConnections}`)
  console.log(`  忙碌连接数: ${stats.busyConnections}`)
  console.log(`  总获取次数: ${stats.totalCheckouts}`)

  // 模拟使用连接
  console.log('\n⚡ 模拟使用连接...')
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 释放连接
  console.log('\n🔓 释放连接...')
  await connectionPool.releaseConnection(connection1!)
  await connectionPool.releaseConnection(connection2!)

  // 显示释放后的状态
  stats = connectionPool.getStats()
  console.log('\n📊 释放连接后统计:')
  console.log(`  空闲连接数: ${stats.idleConnections}`)
  console.log(`  忙碌连接数: ${stats.busyConnections}`)
  console.log(`  总释放次数: ${stats.totalCheckins}`)
}

/**
 * 并发访问演示
 */
async function demonstrateConcurrentAccess(connectionPool: ConnectionPool): Promise<void> {
  console.log('🚀 演示并发访问...')

  // 模拟多个用户同时请求连接
  const concurrentUsers = 8
  const promises: Promise<void>[] = []

  for (let i = 1; i <= concurrentUsers; i++) {
    promises.push(simulateUserActivity(connectionPool, `user${i}`))
  }

  console.log(`👥 ${concurrentUsers} 个用户同时请求连接...`)

  // 等待所有用户完成
  await Promise.all(promises)

  console.log('✅ 所有用户活动完成')

  // 显示最终状态
  const stats = connectionPool.getStats()
  console.log('\n📊 并发访问后统计:')
  console.log(`  总获取次数: ${stats.totalCheckouts}`)
  console.log(`  总释放次数: ${stats.totalCheckins}`)
  console.log(`  平均使用时间: ${stats.averageUseTime.toFixed(2)}ms`)
}

/**
 * 模拟用户活动
 */
async function simulateUserActivity(connectionPool: ConnectionPool, userId: string): Promise<void> {
  // 获取连接
  const connection = await connectionPool.acquireConnection(userId)

  if (connection) {
    console.log(`👤 ${userId} 获取到连接: ${connection}`)

    // 模拟数据库操作
    const operationTime = Math.random() * 2000 + 500 // 0.5-2.5秒
    await new Promise(resolve => setTimeout(resolve, operationTime))

    // 释放连接
    await connectionPool.releaseConnection(connection)
    console.log(`👤 ${userId} 释放连接: ${connection}`)
  }
  else {
    console.log(`❌ ${userId} 未能获取到连接`)
  }
}

/**
 * 连接池满载演示
 */
async function demonstratePoolExhaustion(connectionPool: ConnectionPool): Promise<void> {
  console.log('🔥 演示连接池满载场景...')

  // 获取所有可用连接
  const connections: string[] = []
  const maxConnections = 10 // 根据我们配置的最大连接数

  console.log(`🔗 尝试获取 ${maxConnections + 2} 个连接...`)

  for (let i = 1; i <= maxConnections + 2; i++) {
    const connection = await connectionPool.acquireConnection(`exhaust_user${i}`)
    if (connection) {
      connections.push(connection)
      console.log(`✅ 成功获取连接 ${i}: ${connection}`)
    }
    else {
      console.log(`❌ 第 ${i} 个连接获取失败（连接池已满）`)
    }
  }

  // 显示满载状态
  let stats = connectionPool.getStats()
  console.log('\n📊 连接池满载时统计:')
  console.log(`  总连接数: ${stats.totalConnections}`)
  console.log(`  忙碌连接数: ${stats.busyConnections}`)
  console.log(`  空闲连接数: ${stats.idleConnections}`)
  console.log(`  连接池利用率: ${(stats.poolUtilization * 100).toFixed(2)}%`)

  // 释放一些连接
  console.log('\n🔓 释放前3个连接...')
  for (let i = 0; i < 3 && connections.length > 0; i++) {
    const connection = connections.pop()!
    await connectionPool.releaseConnection(connection)
    console.log(`✅ 释放连接: ${connection}`)
  }

  // 再次尝试获取连接
  console.log('\n🔗 释放后再次尝试获取连接...')
  const newConnection = await connectionPool.acquireConnection('new_user')
  if (newConnection) {
    console.log(`✅ 成功获取新连接: ${newConnection}`)
    connections.push(newConnection)
  }

  // 清理剩余连接
  console.log('\n🧹 清理所有连接...')
  for (const connection of connections) {
    await connectionPool.releaseConnection(connection)
  }

  stats = connectionPool.getStats()
  console.log('\n📊 清理后统计:')
  console.log(`  空闲连接数: ${stats.idleConnections}`)
  console.log(`  忙碌连接数: ${stats.busyConnections}`)
}

/**
 * 连接健康检查和维护演示
 */
async function demonstrateHealthCheckAndMaintenance(connectionPool: ConnectionPool): Promise<void> {
  console.log('🏥 演示连接健康检查和维护...')

  // 获取一些连接
  const connections: string[] = []
  for (let i = 0; i < 5; i++) {
    const connection = await connectionPool.acquireConnection(`health_user${i}`)
    if (connection) {
      connections.push(connection)
    }
  }

  console.log(`🔗 获取了 ${connections.length} 个连接用于健康检查演示`)

  // 释放部分连接
  for (let i = 0; i < 3; i++) {
    if (connections.length > 0) {
      const connection = connections.pop()!
      await connectionPool.releaseConnection(connection)
    }
  }

  // 等待一段时间让连接变空闲
  console.log('\n⏳ 等待连接空闲...')
  await new Promise(resolve => setTimeout(resolve, 35000)) // 等待超过idleTimeout

  // 手动触发维护任务
  console.log('🧹 手动触发连接回收...')
  const reapedCount = await connectionPool.reapIdleConnections()
  console.log(`✅ 回收了 ${reapedCount} 个空闲连接`)

  // 清理剩余连接
  for (const connection of connections) {
    await connectionPool.releaseConnection(connection)
  }
}

/**
 * 统计信息演示
 */
async function demonstratePoolStatistics(connectionPool: ConnectionPool): Promise<void> {
  console.log('📊 演示连接池统计信息...')

  // 进行一些操作来产生统计数据
  console.log('🔄 生成统计数据...')

  for (let i = 0; i < 10; i++) {
    const connection = await connectionPool.acquireConnection(`stats_user${i}`)
    if (connection) {
      // 模拟不同长度的操作
      const operationTime = Math.random() * 1000 + 200
      await new Promise(resolve => setTimeout(resolve, operationTime))

      await connectionPool.releaseConnection(connection)
    }
  }

  // 显示详细统计
  const stats = connectionPool.getStats()
  console.log('\n📈 详细统计信息:')
  console.log(`  总连接数: ${stats.totalConnections}`)
  console.log(`  活跃连接数: ${stats.activeConnections}`)
  console.log(`  空闲连接数: ${stats.idleConnections}`)
  console.log(`  忙碌连接数: ${stats.busyConnections}`)
  console.log(`  错误连接数: ${stats.errorConnections}`)
  console.log(`  总获取次数: ${stats.totalCheckouts}`)
  console.log(`  总释放次数: ${stats.totalCheckins}`)
  console.log(`  总错误次数: ${stats.totalErrors}`)
  console.log(`  平均使用时间: ${stats.averageUseTime.toFixed(2)}ms`)
  console.log(`  连接池利用率: ${(stats.poolUtilization * 100).toFixed(2)}%`)

  // 显示连接详情
  const details = await connectionPool.getConnectionDetails()
  console.log('\n🔍 连接使用详情:')
  details.forEach((conn, index) => {
    console.log(`  ${index + 1}. ${conn.id}:`)
    console.log(`     状态: ${conn.status}`)
    console.log(`     使用次数: ${conn.usageCount}`)
    console.log(`     错误次数: ${conn.errorCount}`)
    console.log(`     最后使用: ${conn.lastUsed.toISOString()}`)
    console.log(`     是否活跃: ${conn.isActive}`)
  })
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ 示例运行失败:', error)
    process.exit(1)
  })
}
