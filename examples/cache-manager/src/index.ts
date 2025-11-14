import process from 'node:process'
import { CacheManager } from './cache-manager.js'

/**
 * 缓存管理系统示例主入口
 * 演示如何使用 Unicycle4T 构建高性能缓存系统
 */
async function main() {
  console.log('💾 Unicycle4T 缓存管理系统示例')
  console.log('='.repeat(60))

  const cache = new CacheManager(100) // 最大缓存100项

  try {
    // 1. 基础缓存操作演示
    console.log('\n📚 第1部分：基础缓存操作演示')
    console.log('-'.repeat(40))
    await demonstrateBasicOperations(cache)

    // 2. TTL和过期处理演示
    console.log('\n📚 第2部分：TTL和过期处理演示')
    console.log('-'.repeat(40))
    await demonstrateTTLAndExpiration(cache)

    // 3. LRU淘汰策略演示
    console.log('\n📚 第3部分：LRU淘汰策略演示')
    console.log('-'.repeat(40))
    await demonstrateLRUEviction(cache)

    // 4. 性能统计演示
    console.log('\n📚 第4部分：性能统计演示')
    console.log('-'.repeat(40))
    await demonstratePerformanceStats(cache)

    // 5. 热点数据分析演示
    console.log('\n📚 第5部分：热点数据分析演示')
    console.log('-'.repeat(40))
    await demonstrateHotDataAnalysis(cache)

    // 6. 复杂数据类型演示
    console.log('\n📚 第6部分：复杂数据类型演示')
    console.log('-'.repeat(40))
    await demonstrateComplexDataTypes(cache)

    // 显示最终统计
    console.log('\n📊 最终缓存统计')
    console.log('-'.repeat(40))
    const finalStats = cache.getStats()
    console.log(JSON.stringify(finalStats, null, 2))

    console.log('\n🎉 所有演示完成！')
    console.log('\n📋 总结:')
    console.log('✅ 基础缓存操作（增删改查）')
    console.log('✅ TTL自动过期机制')
    console.log('✅ LRU淘汰策略')
    console.log('✅ 性能监控和统计')
    console.log('✅ 热点数据分析')
    console.log('✅ 复杂数据类型支持')
  }
  catch (error) {
    console.error('❌ 演示过程中发生错误:', error)
  }
  finally {
    await cache.cleanup()
  }
}

/**
 * 基础缓存操作演示
 */
async function demonstrateBasicOperations(cache: CacheManager): Promise<void> {
  console.log('🔄 演示基础缓存操作...')

  // 设置不同类型的缓存项
  await cache.set('user:1', { id: 1, name: 'Alice', email: 'alice@example.com' })
  await cache.set('config:app', { version: '1.0.0', debug: false, timeout: 5000 })
  await cache.set('counter:visits', 100)
  await cache.set('message:welcome', 'Welcome to our application!')

  console.log('✅ 已设置4个缓存项')

  // 获取缓存项
  const user = await cache.get('user:1')
  console.log('👤 用户数据:', user)

  const config = await cache.get('config:app')
  console.log('⚙️ 应用配置:', config)

  const counter = await cache.get('counter:visits')
  console.log('🔢 访问计数:', counter)

  const message = await cache.get('message:welcome')
  console.log('💬 欢迎消息:', message)

  // 检查缓存项是否存在
  const hasUser = await cache.has('user:1')
  const hasNonExistent = await cache.has('nonexistent:key')

  console.log(`🔍 user:1 存在: ${hasUser}`)
  console.log(`🔍 nonexistent:key 存在: ${hasNonExistent}`)

  // 更新缓存项
  await cache.set('counter:visits', 101)
  const updatedCounter = await cache.get('counter:visits')
  console.log(`🔢 更新后的访问计数: ${updatedCounter}`)

  // 删除缓存项
  const deleted = await cache.delete('message:welcome')
  console.log(`🗑️ 删除结果: ${deleted}`)

  const deletedMessage = await cache.get('message:welcome')
  console.log(`💬 删除后的消息: ${deletedMessage}`)
}

/**
 * TTL和过期处理演示
 */
async function demonstrateTTLAndExpiration(cache: CacheManager): Promise<void> {
  console.log('⏰ 演示TTL和过期处理...')

  // 设置不同TTL的缓存项
  await cache.set('short:lived', 'This will expire in 2 seconds', 2000)
  await cache.set('medium:lived', 'This will expire in 5 seconds', 5000)
  await cache.set('long:lived', 'This will expire in 10 seconds', 10000)

  console.log('✅ 已设置不同TTL的缓存项')

  // 立即检查（应该都存在）
  console.log('🔍 立即检查:')
  console.log('  short:lived:', await cache.get('short:lived'))
  console.log('  medium:lived:', await cache.get('medium:lived'))
  console.log('  long:lived:', await cache.get('long:lived'))

  // 等待2秒后检查
  console.log('\n⏳ 等待2秒后检查...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  console.log('  short:lived:', await cache.get('short:lived')) // 应该为null
  console.log('  medium:lived:', await cache.get('medium:lived'))
  console.log('  long:lived:', await cache.get('long:lived'))

  // 等待3秒后检查
  console.log('\n⏳ 再等待3秒后检查...')
  await new Promise(resolve => setTimeout(resolve, 3000))
  console.log('  medium:lived:', await cache.get('medium:lived')) // 应该为null
  console.log('  long:lived:', await cache.get('long:lived'))

  // 手动过期测试
  console.log('\n🕐 手动过期测试:')
  await cache.set('manual:expire', 'Test manual expiration', 10000)
  console.log('  设置后立即访问:', await cache.get('manual:expire'))

  // 手动删除（模拟过期）
  await cache.delete('manual:expire')
  console.log('  手动删除后访问:', await cache.get('manual:expire'))
}

/**
 * LRU淘汰策略演示
 */
async function demonstrateLRUEviction(_cache: CacheManager): Promise<void> {
  console.log('🚮 演示LRU淘汰策略...')

  // 创建一个小容量缓存用于演示
  const smallCache = new CacheManager(3) // 最大3项

  try {
    // 添加3个缓存项（达到容量上限）
    await smallCache.set('item:1', 'Value 1')
    await smallCache.set('item:2', 'Value 2')
    await smallCache.set('item:3', 'Value 3')

    console.log('✅ 已添加3个缓存项（达到容量上限）')

    // 访问item:1（使其成为最近使用）
    await smallCache.get('item:1')
    console.log('📖 访问了 item:1，使其成为最近使用')

    // 添加第4个缓存项（应该淘汰item:2）
    await smallCache.set('item:4', 'Value 4')
    console.log('✅ 添加第4个缓存项（应该淘汰最久未使用的item:2）')

    // 检查哪些缓存项还存在
    console.log('🔍 检查缓存项:')
    console.log('  item:1:', await smallCache.get('item:1')) // 应该存在
    console.log('  item:2:', await smallCache.get('item:2')) // 应该被淘汰
    console.log('  item:3:', await smallCache.get('item:3')) // 应该存在
    console.log('  item:4:', await smallCache.get('item:4')) // 应该存在

    // 显示统计信息
    const stats = smallCache.getStats()
    console.log('📊 缓存统计:', stats)

    await smallCache.cleanup()
  }
  catch (error) {
    console.error('❌ LRU演示失败:', error)
  }
}

/**
 * 性能统计演示
 */
async function demonstratePerformanceStats(cache: CacheManager): Promise<void> {
  console.log('📊 演示性能统计...')

  // 清空缓存
  await cache.clear()

  // 添加一些缓存项
  const testKeys = []
  for (let i = 1; i <= 10; i++) {
    const key = `test:${i}`
    await cache.set(key, `Test value ${i}`)
    testKeys.push(key)
  }

  console.log(`✅ 已添加 ${testKeys.length} 个测试缓存项`)

  // 随机访问，模拟真实场景
  console.log('🎲 模拟随机访问...')
  for (let i = 0; i < 30; i++) {
    const randomKey = testKeys[Math.floor(Math.random() * testKeys.length)]
    await cache.get(randomKey)

    // 偶尔访问不存在的键
    if (Math.random() < 0.2) {
      await cache.get(`nonexistent:${i}`)
    }
  }

  // 显示性能统计
  const stats = cache.getStats()
  console.log('📈 性能统计:')
  console.log(`  总项数: ${stats.totalItems}`)
  console.log(`  命中次数: ${stats.totalHits}`)
  console.log(`  未命中次数: ${stats.totalMisses}`)
  console.log(`  命中率: ${(stats.hitRate * 100).toFixed(2)}%`)
  console.log(`  淘汰次数: ${stats.totalEvictions}`)
  console.log(`  内存使用: ${stats.memoryUsage} 字节`)
  console.log(`  当前大小: ${stats.currentSize}/${stats.maxSize}`)
}

/**
 * 热点数据分析演示
 */
async function demonstrateHotDataAnalysis(cache: CacheManager): Promise<void> {
  console.log('🔥 演示热点数据分析...')

  // 添加不同访问频率的缓存项
  const hotKeys = ['hot:1', 'hot:2', 'hot:3']
  const coldKeys = ['cold:1', 'cold:2', 'cold:3']

  // 设置缓存项
  for (const key of hotKeys) {
    await cache.set(key, `Hot data for ${key}`)
  }
  for (const key of coldKeys) {
    await cache.set(key, `Cold data for ${key}`)
  }

  // 模拟不同访问模式
  console.log('🎯 模拟访问模式...')

  // 热点数据访问20次
  for (let i = 0; i < 20; i++) {
    const key = hotKeys[i % hotKeys.length]
    await cache.get(key)
  }

  // 冷数据只访问2次
  for (let i = 0; i < 2; i++) {
    const key = coldKeys[i % coldKeys.length]
    await cache.get(key)
  }

  // 获取热点数据
  const hotData = await cache.getHotData(5)
  console.log('🔥 热点数据Top5:')
  hotData.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.key} (访问次数: ${item.accessCount})`)
  })
}

/**
 * 复杂数据类型演示
 */
async function demonstrateComplexDataTypes(cache: CacheManager): Promise<void> {
  console.log('🏗️ 演示复杂数据类型支持...')

  // 对象类型
  const userObject = {
    id: 1,
    name: 'John Doe',
    profile: {
      age: 30,
      city: 'New York',
      hobbies: ['reading', 'coding', 'gaming'],
    },
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en',
    },
  }
  await cache.set('user:complex', userObject)

  // 数组类型
  const productArray = [
    { id: 1, name: 'Product A', price: 99.99 },
    { id: 2, name: 'Product B', price: 149.99 },
    { id: 3, name: 'Product C', price: 199.99 },
  ]
  await cache.set('products:list', productArray)

  // Map类型（转换为对象）
  const settingsMap = {
    'feature.enabled': true,
    'max.connections': 100,
    'timeout.ms': 5000,
    'retry.attempts': 3,
  }
  await cache.set('app:settings', settingsMap)

  // 日期类型
  const eventData = {
    event: 'user_login',
    timestamp: new Date(),
    userId: 123,
    metadata: {
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      sessionId: 'sess_abc123',
    },
  }
  await cache.set('event:latest', eventData)

  // 检索和验证复杂数据
  console.log('🔍 检索复杂数据:')

  const retrievedUser = await cache.get('user:complex')
  console.log('  复杂用户对象:', retrievedUser?.profile?.hobbies)

  const retrievedProducts = await cache.get('products:list')
  console.log('  产品数组长度:', retrievedProducts?.length)

  const retrievedSettings = await cache.get('app:settings')
  console.log('  应用设置:', retrievedSettings?.['timeout.ms'])

  const retrievedEvent = await cache.get('event:latest')
  console.log('  事件时间:', retrievedEvent?.timestamp)

  console.log('✅ 复杂数据类型支持验证完成')
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ 示例运行失败:', error)
    process.exit(1)
  })
}
