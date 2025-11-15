/* eslint-disable no-console */
import { DefaultLifecycleManager } from '@linden/unicycle4t'

/**
 * 缓存项数据
 */
export interface CacheItem {
  accessCount: number
  createdAt: Date
  key: string
  lastAccessed: Date
  size: number
  ttl: number
  value: unknown
}

/**
 * LRU缓存节点
 */
interface LRUNode {
  key: string
  next: LRUNode | null
  prev: LRUNode | null
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  currentSize: number
  hitRate: number
  maxSize: number
  memoryUsage: number
  totalEvictions: number
  totalHits: number
  totalItems: number
  totalMisses: number
}

/**
 * 高级缓存管理器
 * 使用 Unicycle4T 管理缓存项的生命周期
 */
export class CacheManager {
  private manager = new DefaultLifecycleManager()
  private maxSize: number
  private currentSize = 0
  private stats: CacheStats

  // LRU双向链表
  private head: LRUNode
  private tail: LRUNode
  private lruMap = new Map<string, LRUNode>()

  // 键到对象ID的映射
  private keyToIdMap = new Map<string, string>()

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize
    this.stats = {
      totalItems: 0,
      totalHits: 0,
      totalMisses: 0,
      totalEvictions: 0,
      hitRate: 0,
      memoryUsage: 0,
      maxSize,
      currentSize: 0,
    }

    // 初始化LRU链表
    this.head = { key: '', prev: null, next: null }
    this.tail = { key: '', prev: null, next: null }
    this.head.next = this.tail
    this.tail.prev = this.head

    this.setupEventListeners()
    this.startCleanupTask()
  }

  /**
   * 设置缓存项
   */
  async set(key: string, value: unknown, ttl: number = 300000): Promise<void> { // 默认5分钟TTL
    try {
      // 检查是否已存在，如果存在则删除
      if (this.keyToIdMap.has(key)) {
        await this.delete(key)
      }

      // 检查容量限制
      if (this.currentSize >= this.maxSize) {
        await this.evictLRU()
      }

      // 创建缓存项
      const cacheItem = await this.manager.createObject()
      const now = new Date()

      const itemData: CacheItem = {
        key,
        value,
        ttl,
        createdAt: now,
        lastAccessed: now,
        accessCount: 0,
        size: this.calculateSize(value),
      }

      cacheItem.setAttribute('cacheData', itemData)

      // 启动缓存项
      await this.manager.startObject(cacheItem.getId())

      // 更新映射
      this.keyToIdMap.set(key, cacheItem.getId() as string)
      this.currentSize++
      this.stats.totalItems++
      this.stats.currentSize = this.currentSize
      this.stats.memoryUsage += itemData.size

      // 添加到LRU链表头部
      this.addToLRU(key)

      // 设置TTL
      setTimeout(() => {
        this.expire(key)
      }, ttl)

      console.log(`💾 缓存设置: ${key} (TTL: ${ttl}ms, 大小: ${itemData.size}字节)`)
    }
    catch (error) {
      console.error(`❌ 设置缓存失败: ${key}`, error.message)
    }
  }

  /**
   * 获取缓存项
   */
  async get(key: string): Promise<unknown> {
    try {
      const objectId = this.keyToIdMap.get(key)
      if (!objectId) {
        this.stats.totalMisses++
        this.updateHitRate()
        return null
      }

      const cacheItem = await this.manager.getObject(objectId)
      if (!cacheItem) {
        this.keyToIdMap.delete(key)
        this.stats.totalMisses++
        this.updateHitRate()
        return null
      }

      const itemData = cacheItem.getAttribute('cacheData') as CacheItem

      // 检查TTL
      if (this.isExpired(itemData)) {
        await this.expire(key)
        this.stats.totalMisses++
        this.updateHitRate()
        return null
      }

      // 更新访问信息
      itemData.lastAccessed = new Date()
      itemData.accessCount++
      await this.manager.onChange(cacheItem)

      // 移动到LRU链表头部
      this.moveToLRUHead(key)

      this.stats.totalHits++
      this.updateHitRate()

      console.log(`📖 缓存命中: ${key} (访问次数: ${itemData.accessCount})`)
      return itemData.value
    }
    catch (error) {
      console.error(`❌ 获取缓存失败: ${key}`, error.message)
      this.stats.totalMisses++
      this.updateHitRate()
      return null
    }
  }

  /**
   * 删除缓存项
   */
  async delete(key: string): Promise<boolean> {
    try {
      const objectId = this.keyToIdMap.get(key)
      if (!objectId) {
        return false
      }

      const cacheItem = await this.manager.getObject(objectId)
      if (cacheItem) {
        const itemData = cacheItem.getAttribute('cacheData') as CacheItem

        // 更新统计
        this.stats.memoryUsage -= itemData.size
        this.currentSize--
        this.stats.currentSize = this.currentSize

        // 停止并删除缓存项
        await this.manager.stopObject(objectId)
        await this.manager.deleteObject(objectId)
      }

      // 清理映射
      this.keyToIdMap.delete(key)
      this.removeFromLRU(key)

      console.log(`🗑️ 缓存删除: ${key}`)
      return true
    }
    catch (error) {
      console.error(`❌ 删除缓存失败: ${key}`, error.message)
      return false
    }
  }

  /**
   * 检查缓存项是否存在
   */
  async has(key: string): Promise<boolean> {
    const objectId = this.keyToIdMap.get(key)
    if (!objectId) {
      return false
    }

    const cacheItem = await this.manager.getObject(objectId)
    if (!cacheItem) {
      this.keyToIdMap.delete(key)
      return false
    }

    const itemData = cacheItem.getAttribute('cacheData') as CacheItem
    if (this.isExpired(itemData)) {
      await this.expire(key)
      return false
    }

    return true
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    console.log('🧹 清空所有缓存...')

    const keys = Array.from(this.keyToIdMap.keys())
    for (const key of keys) {
      await this.delete(key)
    }

    // 重置统计
    this.stats.totalItems = 0
    this.stats.currentSize = 0
    this.stats.memoryUsage = 0

    console.log('✅ 缓存已清空')
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 获取热点数据（访问次数最多的N项）
   */
  async getHotData(limit: number = 10): Promise<Array<{ accessCount: number, key: string }>> {
    const hotData: Array<{ accessCount: number, key: string }> = []

    for (const [key, objectId] of this.keyToIdMap) {
      try {
        const cacheItem = await this.manager.getObject(objectId)
        if (cacheItem) {
          const itemData = cacheItem.getAttribute('cacheData') as CacheItem
          hotData.push({
            key,
            accessCount: itemData.accessCount,
          })
        }
      }
      catch {
        // 忽略错误，继续处理其他项
      }
    }

    return hotData
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit)
  }

  /**
   * 缓存项过期
   */
  private async expire(key: string): Promise<void> {
    console.log(`⏰ 缓存过期: ${key}`)
    await this.delete(key)
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(itemData: CacheItem): boolean {
    return Date.now() - itemData.createdAt.getTime() > itemData.ttl
  }

  /**
   * 淘汰LRU缓存项
   */
  private async evictLRU(): Promise<void> {
    if (this.tail.prev && this.tail.prev !== this.head) {
      const lruKey = this.tail.prev.key
      await this.delete(lruKey)
      this.stats.totalEvictions++
      console.log(`🚮 LRU淘汰: ${lruKey}`)
    }
  }

  /**
   * 添加到LRU链表头部
   */
  private addToLRU(key: string): void {
    const node: LRUNode = { key, prev: null, next: null }

    node.next = this.head.next
    node.prev = this.head
    if (this.head.next) {
      this.head.next.prev = node
    }
    this.head.next = node

    this.lruMap.set(key, node)
  }

  /**
   * 移动LRU节点到头部
   */
  private moveToLRUHead(key: string): void {
    this.removeFromLRU(key)
    this.addToLRU(key)
  }

  /**
   * 从LRU链表中移除节点
   */
  private removeFromLRU(key: string): void {
    const node = this.lruMap.get(key)
    if (node && node.prev && node.next) {
      node.prev.next = node.next
      node.next.prev = node.prev
      this.lruMap.delete(key)
    }
  }

  /**
   * 计算对象大小（简化计算）
   */
  private calculateSize(value: unknown): number {
    try {
      return JSON.stringify(value).length * 2 // 简化计算，假设每个字符2字节
    }
    catch {
      return 100 // 默认大小
    }
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.stats.totalHits + this.stats.totalMisses
    this.stats.hitRate = total > 0 ? this.stats.totalHits / total : 0
  }

  /**
   * 启动清理任务
   */
  private startCleanupTask(): void {
    // 每分钟检查一次过期项
    setInterval(async () => {
      await this.cleanupExpiredItems()
    }, 60000)
  }

  /**
   * 清理过期项
   */
  private async cleanupExpiredItems(): Promise<void> {
    const keys = Array.from(this.keyToIdMap.keys())
    let cleanedCount = 0

    for (const key of keys) {
      const objectId = this.keyToIdMap.get(key)
      if (!objectId)
        continue

      try {
        const cacheItem = await this.manager.getObject(objectId)
        if (cacheItem) {
          const itemData = cacheItem.getAttribute('cacheData') as CacheItem
          if (this.isExpired(itemData)) {
            await this.expire(key)
            cleanedCount++
          }
        }
      }
      catch {
        // 清理无效项
        this.keyToIdMap.delete(key)
        this.removeFromLRU(key)
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 清理过期项: ${cleanedCount}个`)
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.manager.events.on('object:created', (data) => {
      const cacheData = data.object.getAttribute('cacheData') as CacheItem
      if (cacheData) {
        console.log(`🎉 缓存事件: 创建 - ${cacheData.key}`)
      }
    })

    this.manager.events.on('object:stateChanged', (data) => {
      const cacheData = data.object.getAttribute('cacheData') as CacheItem
      if (cacheData) {
        console.log(`🔄 缓存事件: 状态变更 - ${cacheData.key}: ${data.oldState.name} → ${data.newState.name}`)
      }
    })

    this.manager.events.on('object:deleted', (data) => {
      console.log(`🗑️ 缓存事件: 删除 - ${data.objectId}`)
    })
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    console.log('🧹 清理缓存管理器资源...')
    await this.clear()
    this.lruMap.clear()
    this.keyToIdMap.clear()
  }
}
