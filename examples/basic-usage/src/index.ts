/* eslint-disable no-console */
import process from 'node:process'

import { DefaultLifecycleManager } from '@linden/unicycle4t'

import { Task, UserSession } from './custom-object.js'
import { SimpleUsage } from './simple-manager.js'

/**
 * Unicycle4T 基础用法示例主入口
 */
async function main() {
  console.log('🎯 Unicycle4T 基础用法示例')
  console.log('='.repeat(50))

  // 1. 基础API演示
  console.log('\n📚 第1部分：基础API演示')
  console.log('-'.repeat(30))

  const basicDemo = new SimpleUsage()
  await basicDemo.demonstrateBasicOperations()

  // 2. 自定义对象演示
  console.log('\n📚 第2部分：自定义对象演示')
  console.log('-'.repeat(30))

  await demonstrateCustomObjects()

  // 3. 高级用法演示
  console.log('\n📚 第3部分：高级用法演示')
  console.log('-'.repeat(30))

  await demonstrateAdvancedUsage()

  console.log('\n🎉 所有示例演示完成！')
}

/**
 * 演示自定义对象的使用
 */
async function demonstrateCustomObjects(): Promise<void> {
  const manager = new DefaultLifecycleManager()

  // 演示用户会话对象
  console.log('👤 演示用户会话对象...')

  const userSession = new UserSession()
  await manager.createObject()
  userSession.initialize('user123', ['read', 'write', 'admin'])

  console.log('📊 会话信息:', userSession.getSummary())
  console.log('🔐 权限检查 - admin:', userSession.hasPermission('admin'))
  console.log('🔐 权限检查 - delete:', userSession.hasPermission('delete'))

  await manager.startObject(userSession.getId())
  console.log(`✅ 会话已启动，状态: ${userSession.getState().name}`)

  // 演示任务对象
  console.log('\n📋 演示任务对象...')

  const task = new Task()
  await manager.createObject()
  task.initialize('email-sending', { to: 'user@example.com', subject: 'Hello' })

  console.log('📊 任务信息:', task.getTaskInfo())

  task.start()
  console.log(`🚀 任务开始执行，状态: ${task.getAttribute('status')}`)

  // 模拟任务执行
  setTimeout(() => {
    task.complete({ messageId: 'msg123' })
    console.log('✅ 任务完成，状态:', task.getAttribute('status'))
    console.log('📊 最终任务信息:', task.getTaskInfo())
  }, 100)

  // 清理
  await new Promise(resolve => setTimeout(resolve, 200))
  await manager.deleteObject(userSession.getId())
  await manager.deleteObject(task.getId())
}

/**
 * 演示高级用法
 */
async function demonstrateAdvancedUsage(): Promise<void> {
  const manager = new DefaultLifecycleManager()

  // 事件监听和过滤
  console.log('👂 演示事件监听和过滤...')

  let eventCount = 0

  manager.events.on('object:created', (data) => {
    eventCount++
    console.log(`🎉 事件 ${eventCount}: 对象创建 - ${data.object.getId()}`)
  })

  // 创建多个对象观察事件
  const objects = []
  for (let i = 1; i <= 3; i++) {
    const obj = await manager.createObject()
    obj.setAttribute('name', `object-${i}`)
    obj.setAttribute('priority', i)
    objects.push(obj)
  }

  console.log(`📈 总共触发了 ${eventCount} 个创建事件`)

  // 属性操作演示
  console.log('\n🔄 演示属性操作...')

  objects[0].setAttribute('complexData', {
    metadata: { version: 1, author: 'demo' },
    tags: ['demo', 'example'],
    config: { timeout: 5000, retries: 3 },
  })

  const complexData = objects[0].getAttribute('complexData')
  console.log('📊 复杂数据:', JSON.stringify(complexData, null, 2))

  // 批量状态管理
  console.log('\n🔧 演示批量状态管理...')

  await Promise.all(objects.map(obj => manager.startObject(obj.getId())))

  const runningCount = objects.filter(obj =>
    obj.getState().name === 'started',
  ).length

  console.log(`🟢 正在运行的对象数量: ${runningCount}`)

  // 清理所有对象
  await Promise.all(objects.map(obj => manager.deleteObject(obj.getId())))
  console.log('🗑️ 所有对象已清理')
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ 示例运行失败:', error)
    process.exit(1)
  })
}
