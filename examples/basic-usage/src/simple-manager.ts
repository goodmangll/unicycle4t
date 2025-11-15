/* eslint-disable no-console */
import process from 'node:process'

import { DefaultLifecycleManager } from '@linden/unicycle4t'

/**
 * 基础用法示例 - 展示核心API的使用
 */
export class SimpleUsage {
  private manager = new DefaultLifecycleManager()

  /**
   * 演示基本的生命周期操作
   */
  async demonstrateBasicOperations(): Promise<void> {
    console.log('🚀 开始演示基本操作...\n')

    // 1. 创建对象
    console.log('📝 创建生命周期对象...')
    const userSession = await this.manager.createObject()
    userSession.setAttribute('userId', 'user123')
    userSession.setAttribute('loginTime', new Date())
    userSession.setAttribute('userRole', 'admin')

    console.log(`✅ 对象已创建，ID: ${userSession.getId()}`)
    console.log('📊 用户信息:', {
      userId: userSession.getAttribute('userId'),
      loginTime: userSession.getAttribute('loginTime'),
      userRole: userSession.getAttribute('userRole'),
    })

    // 2. 启动对象
    console.log('\n🔧 启动对象...')
    await this.manager.startObject(userSession.getId())
    console.log(`✅ 对象已启动，状态: ${userSession.getState().name}`)

    // 3. 监听生命周期事件
    console.log('\n👂 监听生命周期事件...')
    this.setupEventListeners()

    // 4. 更新对象属性
    console.log('\n🔄 更新对象属性...')
    userSession.setAttribute('lastActivity', new Date())
    userSession.setAttribute('actionsPerformed', 5)
    await this.manager.onChange(userSession)
    console.log('✅ 属性已更新')

    // 5. 停止对象
    console.log('\n⏹️ 停止对象...')
    await this.manager.stopObject(userSession.getId())
    console.log(`✅ 对象已停止，状态: ${userSession.getState().name}`)

    // 6. 删除对象
    console.log('\n🗑️ 删除对象...')
    await this.manager.deleteObject(userSession.getId())
    console.log('✅ 对象已删除')

    console.log('\n🎉 基本操作演示完成！')
  }

  /**
   * 演示批量操作
   */
  async demonstrateBatchOperations(): Promise<void> {
    console.log('\n🔄 开始演示批量操作...\n')

    const objects = []

    // 批量创建对象
    console.log('📝 批量创建对象...')
    for (let i = 1; i <= 5; i++) {
      const obj = await this.manager.createObject()
      obj.setAttribute('batchId', 'batch001')
      obj.setAttribute('index', i)
      obj.setAttribute('data', `object-${i}`)
      objects.push(obj)
      console.log(`✅ 对象 ${i} 已创建，ID: ${obj.getId()}`)
    }

    // 批量启动对象
    console.log('\n🔧 批量启动对象...')
    await Promise.all(
      objects.map(obj => this.manager.startObject(obj.getId())),
    )
    console.log('✅ 所有对象已启动')

    // 获取对象统计
    console.log('\n📊 对象统计信息:')
    console.log(`📦 总对象数: ${objects.length}`)

    let runningCount = 0
    for (const obj of objects) {
      if (obj.getState().name === 'started') {
        runningCount++
      }
    }
    console.log(`🟢 运行中对象: ${runningCount}`)

    // 批量清理
    console.log('\n🗑️ 批量清理对象...')
    await Promise.all(
      objects.map(obj => this.manager.deleteObject(obj.getId())),
    )
    console.log('✅ 所有对象已删除')

    console.log('\n🎉 批量操作演示完成！')
  }

  /**
   * 演示错误处理
   */
  async demonstrateErrorHandling(): Promise<void> {
    console.log('\n❌ 开始演示错误处理...\n')

    try {
      // 尝试操作不存在的对象
      console.log('🔍 尝试获取不存在的对象...')
      const nonExistentObject = await this.manager.getObject('non-existent-id')
      console.log(`结果: ${nonExistentObject || 'null'}`)

      // 尝试停止不存在的对象
      console.log('\n⏹️ 尝试停止不存在的对象...')
      await this.manager.stopObject('non-existent-id')
      console.log('✅ 操作完成（没有抛出错误）')
    }
    catch (error) {
      console.error('❌ 发生错误:', error.message)
    }

    console.log('\n🎉 错误处理演示完成！')
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 监听对象创建事件
    this.manager.events.on('object:created', (data) => {
      console.log(`🎉 事件: 对象已创建 - ${data.object.getId()}`)
    })

    // 监听状态变更事件
    this.manager.events.on('object:stateChanged', (data) => {
      console.log(`🔄 事件: 状态变更 - ${data.object.getId()}: ${data.oldState.name} → ${data.newState.name}`)
    })

    // 监听对象删除事件
    this.manager.events.on('object:deleted', (data) => {
      console.log(`🗑️ 事件: 对象已删除 - ${data.objectId}`)
    })
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    // 这里可以添加清理逻辑，如果需要的话
    console.log('\n🧹 清理完成')
  }
}

// 如果直接运行���文件
async function runDemo() {
  const demo = new SimpleUsage()

  try {
    await demo.demonstrateBasicOperations()
    await demo.demonstrateBatchOperations()
    await demo.demonstrateErrorHandling()
  }
  catch (error) {
    console.error('❌ 演示过程中发生错误:', error)
  }
  finally {
    await demo.cleanup()
    process.exit(0)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo()
}
