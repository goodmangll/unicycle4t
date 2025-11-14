import { DefaultLifecycleManager } from '@linden/unicycle4t'

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * 任务优先级
 */
export enum TaskPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3,
}

/**
 * 任务数据
 */
export interface TaskData {
  id: string
  type: string
  payload: any
  priority: TaskPriority
  status: TaskStatus
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  retryCount: number
  maxRetries: number
  timeout: number
  result?: any
  error?: string
  dependencies: string[]
}

/**
 * 任务队列管理器
 * 使用 Unicycle4T 管理任务的生命周期
 */
export class TaskQueue {
  private manager = new DefaultLifecycleManager()
  private maxConcurrentTasks: number
  private currentTaskCount = 0
  private taskQueue: string[] = []
  private runningTasks = new Map<string, NodeJS.Timeout>()
  private taskStats = {
    totalCreated: 0,
    totalCompleted: 0,
    totalFailed: 0,
    totalCancelled: 0,
  }

  constructor(maxConcurrentTasks: number = 5) {
    this.maxConcurrentTasks = maxConcurrentTasks
    this.setupEventListeners()
  }

  /**
   * 添加任务到队列
   */
  async addTask(
    type: string,
    payload: any,
    options: {
      priority?: TaskPriority
      maxRetries?: number
      timeout?: number
      dependencies?: string[]
    } = {},
  ): Promise<string> {
    const task = await this.manager.createObject()

    const taskData: TaskData = {
      id: task.getId() as string,
      type,
      payload,
      priority: options.priority ?? TaskPriority.NORMAL,
      status: TaskStatus.PENDING,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: options.maxRetries ?? 3,
      timeout: options.timeout ?? 30000, // 30秒默认超时
      dependencies: options.dependencies ?? [],
    }

    task.setAttribute('taskData', taskData)

    // 启动任务对象
    await this.manager.startObject(task.getId())

    // 添加到队列
    this.enqueueTask(task.getId() as string)

    // 更新统计
    this.taskStats.totalCreated++

    console.log(`📝 任务创建: ${type} (${task.getId()}) - 优先级: ${taskData.priority}`)
    return task.getId() as string
  }

  /**
   * 将任务加入队列（按优先级排序）
   */
  private enqueueTask(taskId: string): void {
    const taskData = this.getTaskData(taskId)
    if (!taskData) {
      return
    }

    // 按优先级插入队列
    let insertIndex = this.taskQueue.length
    for (let i = 0; i < this.taskQueue.length; i++) {
      const queuedTaskData = this.getTaskData(this.taskQueue[i])
      if (queuedTaskData && taskData.priority > queuedTaskData.priority) {
        insertIndex = i
        break
      }
    }

    this.taskQueue.splice(insertIndex, 0, taskId)
    this.processQueue()
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    if (this.currentTaskCount >= this.maxConcurrentTasks || this.taskQueue.length === 0) {
      return
    }

    const taskId = this.taskQueue.shift()
    if (!taskId) {
      return
    }

    const taskData = this.getTaskData(taskId)
    if (!taskData || taskData.status !== TaskStatus.PENDING) {
      return
    }

    // 检查依赖
    if (!await this.checkDependencies(taskData)) {
      // 依赖未完成，重新加入队列
      this.taskQueue.push(taskId)
      return
    }

    await this.executeTask(taskId)
  }

  /**
   * 执行任务
   */
  private async executeTask(taskId: string): Promise<void> {
    const taskData = this.getTaskData(taskId)
    if (!taskData) {
      return
    }

    // 更新任务状态
    taskData.status = TaskStatus.RUNNING
    taskData.startedAt = new Date()
    this.updateTaskData(taskId, taskData)

    this.currentTaskCount++
    console.log(`🚀 任务开始执行: ${taskData.type} (${taskId})`)

    // 设置超时
    const timeoutId = setTimeout(() => {
      this.handleTaskTimeout(taskId)
    }, taskData.timeout)

    this.runningTasks.set(taskId, timeoutId)

    try {
      // 执行任务
      const result = await this.performTask(taskData)

      // 清理超时
      const timeout = this.runningTasks.get(taskId)
      if (timeout) {
        clearTimeout(timeout)
        this.runningTasks.delete(taskId)
      }

      // 任务完成
      await this.completeTask(taskId, result)
    }
    catch (error) {
      // 清理超时
      const timeout = this.runningTasks.get(taskId)
      if (timeout) {
        clearTimeout(timeout)
        this.runningTasks.delete(taskId)
      }

      // 任务失败
      await this.failTask(taskId, error as Error)
    }
  }

  /**
   * 执行具体任务（模拟）
   */
  private async performTask(taskData: TaskData): Promise<any> {
    console.log(`⚡ 执行任务: ${taskData.type}`)

    // 模拟不同类型的任务
    switch (taskData.type) {
      case 'email':
        return await this.sendEmail(taskData.payload)
      case 'image-processing':
        return await this.processImage(taskData.payload)
      case 'data-analysis':
        return await this.analyzeData(taskData.payload)
      case 'report-generation':
        return await this.generateReport(taskData.payload)
      default:
        return await this.executeGenericTask(taskData.payload)
    }
  }

  /**
   * 邮件发送任务
   */
  private async sendEmail(payload: { to: string, subject: string, content: string }): Promise<object> {
    console.log(`📧 发送邮件: ${payload.to} - ${payload.subject}`)

    // 模拟邮件发送延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // 模拟10%失败率
    if (Math.random() < 0.1) {
      throw new Error('邮件服务器连接失败')
    }

    return {
      messageId: `msg_${Date.now()}`,
      sentAt: new Date(),
      recipient: payload.to,
    }
  }

  /**
   * 图片处理任务
   */
  private async processImage(payload: { sourceUrl: string, operations: string[] }): Promise<object> {
    console.log(`🖼️ 处理图片: ${payload.sourceUrl}`)

    // 模拟图片处理时间
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

    // 模拟5%失败率
    if (Math.random() < 0.05) {
      throw new Error('图片格式不支持')
    }

    return {
      processedUrl: `processed_${payload.sourceUrl}`,
      size: `${Math.floor(Math.random() * 1000 + 500)}KB`,
      operations: payload.operations,
    }
  }

  /**
   * 数据分析任务
   */
  private async analyzeData(payload: { dataset: string, analysisType: string }): Promise<object> {
    console.log(`📊 分析数据: ${payload.dataset} - ${payload.analysisType}`)

    // 模拟数据分析时间
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000))

    return {
      insights: [`洞察${Math.floor(Math.random() * 10 + 1)}`, `洞察${Math.floor(Math.random() * 10 + 1)}`],
      accuracy: `${(Math.random() * 20 + 80).toFixed(1)}%`,
      processingTime: `${(Math.random() * 10 + 5).toFixed(1)}s`,
    }
  }

  /**
   * 报告生成任务
   */
  private async generateReport(payload: { reportType: string, dataRange: string }): Promise<object> {
    console.log(`📄 生成报告: ${payload.reportType}`)

    // 模拟报告生成时间
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500))

    return {
      reportUrl: `reports/report_${Date.now()}.pdf`,
      pages: Math.floor(Math.random() * 50 + 10),
      generatedAt: new Date(),
    }
  }

  /**
   * 通用任务执行
   */
  private async executeGenericTask(payload: any): Promise<object> {
    console.log(`⚙️ 执行通用任务:`, payload)

    await new Promise(resolve => setTimeout(resolve, 1000))

    return {
      processed: true,
      payload,
      processedAt: new Date(),
    }
  }

  /**
   * 任务完成
   */
  private async completeTask(taskId: string, result: any): Promise<void> {
    const taskData = this.getTaskData(taskId)
    if (!taskData) {
      return
    }

    taskData.status = TaskStatus.COMPLETED
    taskData.completedAt = new Date()
    taskData.result = result

    this.updateTaskData(taskId, taskData)
    this.currentTaskCount--
    this.taskStats.totalCompleted++

    console.log(`✅ 任务完成: ${taskData.type} (${taskId})`)

    // 清理任务
    await this.manager.deleteObject(taskId)

    // 继续处理队列
    this.processQueue()
  }

  /**
   * 任务失败
   */
  private async failTask(taskId: string, error: Error): Promise<void> {
    const taskData = this.getTaskData(taskId)
    if (!taskData) {
      return
    }

    taskData.retryCount++
    taskData.error = error.message

    if (taskData.retryCount >= taskData.maxRetries) {
      // 达到最大重试次数，任务失败
      taskData.status = TaskStatus.FAILED
      this.updateTaskData(taskId, taskData)
      this.currentTaskCount--
      this.taskStats.totalFailed++

      console.log(`❌ 任务失败: ${taskData.type} (${taskId}) - ${error.message}`)

      // 清理任务
      await this.manager.deleteObject(taskId)
    }
    else {
      // 重试任务
      taskData.status = TaskStatus.PENDING
      this.updateTaskData(taskId, taskData)

      console.log(`🔄 任务重试: ${taskData.type} (${taskId}) - 第${taskData.retryCount}次重试`)

      // 延迟后重新加入队列
      setTimeout(() => {
        this.enqueueTask(taskId)
      }, 2000 * taskData.retryCount) // 递增延迟

      this.currentTaskCount--
    }

    // 继续处理队列
    this.processQueue()
  }

  /**
   * 处理任务超时
   */
  private async handleTaskTimeout(taskId: string): Promise<void> {
    console.log(`⏰ 任务超时: ${taskId}`)

    const timeout = this.runningTasks.get(taskId)
    if (timeout) {
      clearTimeout(timeout)
      this.runningTasks.delete(taskId)
    }

    await this.failTask(taskId, new Error('任务执行超时'))
  }

  /**
   * 检查任务依赖
   */
  private async checkDependencies(taskData: TaskData): Promise<boolean> {
    if (taskData.dependencies.length === 0) {
      return true
    }

    // 检查所有依赖任务是否完成
    for (const depId of taskData.dependencies) {
      const depTask = await this.manager.getObject(depId)
      if (depTask) {
        const depData = depTask.getAttribute('taskData') as TaskData
        if (depData.status !== TaskStatus.COMPLETED) {
          return false
        }
      }
    }

    return true
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const taskData = this.getTaskData(taskId)
    if (!taskData) {
      return false
    }

    if (taskData.status === TaskStatus.RUNNING) {
      // 中断正在运行的任务
      const timeout = this.runningTasks.get(taskId)
      if (timeout) {
        clearTimeout(timeout)
        this.runningTasks.delete(taskId)
      }
      this.currentTaskCount--
    }

    taskData.status = TaskStatus.CANCELLED
    this.updateTaskData(taskId, taskData)
    this.taskStats.totalCancelled++

    await this.manager.deleteObject(taskId)

    console.log(`🚫 任务取消: ${taskData.type} (${taskId})`)
    return true
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string): Promise<TaskData | null> {
    return this.getTaskData(taskId)
  }

  /**
   * 获取队列统计
   */
  getQueueStats(): object {
    return {
      ...this.taskStats,
      currentTaskCount: this.currentTaskCount,
      maxConcurrentTasks: this.maxConcurrentTasks,
      queuedTasks: this.taskQueue.length,
      runningTasks: this.runningTasks.size,
    }
  }

  /**
   * 获取任务数据
   */
  private getTaskData(_taskId: string): TaskData | null {
    // 这里需要实现查询逻辑，当前简化处理
    return null
  }

  /**
   * 更新任务数据
   */
  private updateTaskData(_taskId: string, _taskData: TaskData): void {
    // 这里需要实现更新逻辑
    // 实际实现中需要从manager获取对象并更新属性
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.manager.events.on('object:created', (data) => {
      console.log(`🎉 任务事件: 创建 - ${data.object.getId()}`)
    })

    this.manager.events.on('object:stateChanged', (data) => {
      const taskData = data.object.getAttribute('taskData') as TaskData
      if (taskData) {
        console.log(`🔄 任务事件: 状态变更 - ${taskData.type}: ${data.oldState.name} → ${data.newState.name}`)
      }
    })

    this.manager.events.on('object:deleted', (data) => {
      console.log(`🗑️ 任务事件: 删除 - ${data.objectId}`)
    })
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    console.log('🧹 清理任务队列资源...')

    // 清理所有运行中的任务超时
    for (const [taskId, timeout] of this.runningTasks) {
      clearTimeout(timeout)
      await this.cancelTask(taskId)
    }

    this.runningTasks.clear()
    this.taskQueue = []
  }
}
