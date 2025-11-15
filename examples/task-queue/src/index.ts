/* eslint-disable no-console */
import process from 'node:process'

import { TaskPriority, TaskQueue } from './task-queue.js'

/**
 * 任务队列系统示例主入口
 * 演示如何使用 Unicycle4T 构建异步任务处理系统
 */
async function main() {
  console.log('📋 Unicycle4T 任务队列系统示例')
  console.log('='.repeat(60))

  const taskQueue = new TaskQueue(3) // 最大并发任务数为3

  try {
    // 1. 基础任务队列演示
    console.log('\n📚 第1部分：基础任务队列演示')
    console.log('-'.repeat(40))
    await demonstrateBasicTaskQueue(taskQueue)

    // 2. 优先级任务演示
    console.log('\n📚 第2部分：优先级任务演示')
    console.log('-'.repeat(40))
    await demonstratePriorityTasks(taskQueue)

    // 3. 任务依赖演示
    console.log('\n📚 第3部分：任务依赖演示')
    console.log('-'.repeat(40))
    await demonstrateTaskDependencies(taskQueue)

    // 4. 错误处理和重试演示
    console.log('\n📚 第4部分：错误处理和重试演示')
    console.log('-'.repeat(40))
    await demonstrateErrorHandling(taskQueue)

    // 5. 显示最终统计
    console.log('\n📊 最终统计信息')
    console.log('-'.repeat(40))
    console.log(JSON.stringify(taskQueue.getQueueStats(), null, 2))

    console.log('\n🎉 所有演示完成！')
    console.log('\n📋 总结:')
    console.log('✅ 异步任务执行')
    console.log('✅ 优先级队列管理')
    console.log('✅ 任务依赖处理')
    console.log('✅ 错误处理和重试')
    console.log('✅ 并发控制')
    console.log('✅ 超时处理')
  }
  catch (error) {
    console.error('❌ 演示过程中发生错误:', error)
  }
  finally {
    await taskQueue.cleanup()
  }
}

/**
 * 基础任务队列演示
 */
async function demonstrateBasicTaskQueue(taskQueue: TaskQueue): Promise<void> {
  console.log('🔄 添加基��任务到队列...')

  // 添加不同类型的任务
  const taskIds = [
    await taskQueue.addTask('email', {
      to: 'alice@example.com',
      subject: '欢迎使用我们的服务',
      content: '感谢您的注册！',
    }),

    await taskQueue.addTask('image-processing', {
      sourceUrl: 'https://example.com/image1.jpg',
      operations: ['resize', 'compress', 'watermark'],
    }),

    await taskQueue.addTask('data-analysis', {
      dataset: 'user_behavior_2024',
      analysisType: 'user_segmentation',
    }),

    await taskQueue.addTask('report-generation', {
      reportType: 'monthly_sales',
      dataRange: '2024-01',
    }),
  ]

  console.log(`✅ 已添加 ${taskIds.length} 个任务`)

  // 等待部分任务完成
  await new Promise(resolve => setTimeout(resolve, 8000))

  // 显示队列状态
  console.log('\n📊 队列状态:', taskQueue.getQueueStats())
}

/**
 * 优先级任务演示
 */
async function demonstratePriorityTasks(taskQueue: TaskQueue): Promise<void> {
  console.log('🎯 演示优先级任务处理...')

  // 添加不同优先级的任务
  const _taskIds = [
    await taskQueue.addTask('email', {
      to: 'low-priority@example.com',
      subject: '常规通知',
      content: '这是一封低优先级邮件',
    }, { priority: TaskPriority.LOW }),

    await taskQueue.addTask('email', {
      to: 'normal-priority@example.com',
      subject: '业务通知',
      content: '这是一封普通优先级邮件',
    }, { priority: TaskPriority.NORMAL }),

    await taskQueue.addTask('email', {
      to: 'high-priority@example.com',
      subject: '重要通知',
      content: '这是一封高优先级邮件',
    }, { priority: TaskPriority.HIGH }),

    await taskQueue.addTask('email', {
      to: 'urgent@example.com',
      subject: '紧急通知',
      content: '这是一封紧急邮件',
    }, { priority: TaskPriority.URGENT }),
  ]

  console.log('✅ 已添加不同优先级的任务')
  console.log('⚡ 高优先级任务应该优先执行')

  // 等待任务完成
  await new Promise(resolve => setTimeout(resolve, 10000))
}

/**
 * 任务依赖演示
 */
async function demonstrateTaskDependencies(taskQueue: TaskQueue): Promise<void> {
  console.log('🔗 演示任务依赖处理...')

  // 创建基础任务
  const dataCollectionId = await taskQueue.addTask('data-analysis', {
    dataset: 'raw_data',
    analysisType: 'data_collection',
  })

  const dataCleaningId = await taskQueue.addTask('data-analysis', {
    dataset: 'raw_data',
    analysisType: 'data_cleaning',
  }, { dependencies: [dataCollectionId] })

  const modelTrainingId = await taskQueue.addTask('data-analysis', {
    dataset: 'cleaned_data',
    analysisType: 'model_training',
  }, { dependencies: [dataCleaningId] })

  const reportGenerationId = await taskQueue.addTask('report-generation', {
    reportType: 'ml_analysis',
    dataRange: 'model_results',
  }, { dependencies: [modelTrainingId] })

  console.log('✅ 已创建依赖链任务:')
  console.log(`   1. 数据收集 → ${dataCollectionId}`)
  console.log(`   2. 数据清洗 → ${dataCleaningId} (依赖: ${dataCollectionId})`)
  console.log(`   3. 模型训练 → ${modelTrainingId} (依赖: ${dataCleaningId})`)
  console.log(`   4. 报告生成 → ${reportGenerationId} (依赖: ${modelTrainingId})`)

  // 等待依赖链完成
  await new Promise(resolve => setTimeout(resolve, 15000))
}

/**
 * 错误处理和重试演示
 */
async function demonstrateErrorHandling(taskQueue: TaskQueue): Promise<void> {
  console.log('⚠️ 演示错误处理和重试机制...')

  // 添加一些可能会失败的任务
  const taskIds = [
    await taskQueue.addTask('email', {
      to: 'invalid-email',
      subject: '测试失败',
      content: '这封邮件会失败',
    }, { maxRetries: 2 }),

    await taskQueue.addTask('image-processing', {
      sourceUrl: 'invalid-image-url',
      operations: ['resize'],
    }, { maxRetries: 3 }),

    await taskQueue.addTask('data-analysis', {
      dataset: 'nonexistent_dataset',
      analysisType: 'complex_analysis',
    }, { maxRetries: 1 }),
  ]

  console.log(`✅ 已添加 ${taskIds.length} 个可能失败的任务`)

  // 等待任务处理完成（包括重试）
  await new Promise(resolve => setTimeout(resolve, 12000))

  // 检查最终状态
  console.log('\n🔍 检查任务最终状态:')
  for (const taskId of taskIds) {
    const status = await taskQueue.getTaskStatus(taskId)
    if (status) {
      console.log(`任务 ${taskId}: ${status.status} (重试${status.retryCount}次)`)
    }
    else {
      console.log(`任务 ${taskId}: 已完成并清理`)
    }
  }
}

// 运行主函数
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ 示例运行失败:', error)
    process.exit(1)
  })
}
