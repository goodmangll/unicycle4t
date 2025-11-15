/* eslint-disable no-console */
import process from 'node:process'

import { DemoWebServer } from './demo-server.js'

/**
 * Web会话管理示例主入口
 * 演示如何使用 Unicycle4T 管���用户会话的完整生命周期
 */
async function main() {
  console.log('🌐 Unicycle4T Web会话管理示例')
  console.log('='.repeat(60))

  const server = new DemoWebServer()

  try {
    // 1. 完整的用户会话演示
    console.log('\n📚 第1部分：完整用户会话演示')
    console.log('-'.repeat(40))
    await server.demonstrateUserSession()

    // 2. 会话过期处理演示
    console.log('\n📚 第2部分：会话过期处理演示')
    console.log('-'.repeat(40))
    await server.demonstrateSessionExpiration()

    console.log('\n🎉 所有演示完成！')
    console.log('\n📋 总结:')
    console.log('✅ 会话创建和管理')
    console.log('✅ 权限控制和验证')
    console.log('✅ 活动时间更新')
    console.log('✅ 会话过期处理')
    console.log('✅ 事件监听和响应')
    console.log('✅ 统计信息收集')
  }
  catch (error) {
    console.error('❌ 演示过程中发生错误:', error)
  }
  finally {
    await server.cleanup()
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ 示例运行失败:', error)
    process.exit(1)
  })
}
