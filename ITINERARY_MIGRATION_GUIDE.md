# 🗺️ 行程系统迁移指南

## 📋 迁移概述

本指南将帮助你从 `simple-itinerary.ts` 内存行程系统迁移到数据库行程系统，实现数据持久化和完整的行程管理功能。

## 🎯 迁移目标

- ✅ 从内存存储迁移到数据库存储
- ✅ 保持 API 接口兼容性
- ✅ 实现数据持久化
- ✅ 支持完整的行程管理功能
- ✅ 提供回退机制

## 🔧 迁移步骤

### 1. 系统架构变更

#### 1.1 新的文件结构

```
src/lib/api/
├── database.ts              # 原始数据库操作
├── database-itinerary.ts    # 新的数据库行程管理器
└── simple-database.ts       # 统一接口层（已更新）
```

#### 1.2 核心组件

- **`database-itinerary.ts`**: 新的数据库行程管理器
- **`simple-database.ts`**: 统一接口层，提供兼容性
- **`simple-itinerary.ts`**: 保留作为回退机制

### 2. 数据库初始化

#### 2.1 确保数据库连接

```bash
# 测试数据库连接
npm run test:db

# 生成Prisma客户端
npm run db:generate

# 推送数据库结构
npm run db:push
```

#### 2.2 运行种子数据

```bash
# 运行种子数据（包含默认地点）
npm run db:seed
```

### 3. 验证迁移

#### 3.1 测试行程创建

```typescript
import { itineraryOperations } from '@/lib/api/simple-database'

// 创建新行程
const newItinerary = await itineraryOperations.create({
  userId: 'user-id',
  title: '测试行程',
  destination: '北京',
  budget: 3000,
  days: 3,
  data: {
    activities: [],
    notes: '测试行程',
  },
  isPublic: false,
})

console.log('行程创建成功:', newItinerary)
```

#### 3.2 测试行程查询

```typescript
// 获取用户行程
const userItineraries = await itineraryOperations.findByUserId('user-id')
console.log('用户行程:', userItineraries)

// 获取行程详情
const itinerary = await itineraryOperations.findById('itinerary-id')
console.log('行程详情:', itinerary)
```

#### 3.3 测试地点搜索

```typescript
import { locationOperations } from '@/lib/api/simple-database'

// 搜索地点
const locations = await locationOperations.searchByName('天安门')
console.log('搜索结果:', locations)
```

### 4. 功能对比

#### 4.1 支持的功能

| 功能       | simple-itinerary | database-itinerary | 状态   |
| ---------- | ---------------- | ------------------ | ------ |
| 行程创建   | ✅               | ✅                 | 已迁移 |
| 行程查询   | ✅               | ✅                 | 已迁移 |
| 行程更新   | ❌               | ✅                 | 新增   |
| 行程删除   | ✅               | ✅                 | 已迁移 |
| 地点搜索   | ✅               | ✅                 | 已迁移 |
| 地点创建   | ❌               | ✅                 | 新增   |
| 活动管理   | ❌               | ✅                 | 新增   |
| 数据持久化 | ❌               | ✅                 | 新增   |
| 关联查询   | ❌               | ✅                 | 新增   |

#### 4.2 性能对比

| 指标       | simple-itinerary | database-itinerary |
| ---------- | ---------------- | ------------------ |
| 数据持久化 | ❌               | ✅                 |
| 查询性能   | 快               | 中等               |
| 内存使用   | 高               | 低                 |
| 扩展性     | 差               | 好                 |
| 并发支持   | 差               | 好                 |

### 5. API 兼容性

#### 5.1 保持兼容的接口

```typescript
// 行程操作
itineraryOperations.create()
itineraryOperations.findById()
itineraryOperations.findByUserId()
itineraryOperations.delete()

// 地点操作
locationOperations.findById()
locationOperations.searchByName()

// 活动操作
activityOperations.create()
activityOperations.update()
activityOperations.delete()
activityOperations.findByItineraryId()
```

#### 5.2 新增的接口

```typescript
// 行程更新
itineraryOperations.update()

// 地点管理
locationOperations.create()
locationOperations.update()
locationOperations.delete()

// 统计信息
databaseItineraryManager.getStats()
```

### 6. 错误处理

#### 6.1 数据库连接失败

```typescript
// 自动回退到简单系统
try {
  const result = await itineraryOperations.create(data)
  return result
} catch (error) {
  console.error('数据库操作失败，使用简单系统:', error)
  // 可以在这里添加回退逻辑
  return null
}
```

#### 6.2 数据验证

```typescript
// 输入验证
if (!itineraryData.userId || !itineraryData.title) {
  throw new Error('缺少必要参数')
}

// 数据完整性检查
const user = await userOperations.findById(itineraryData.userId)
if (!user) {
  throw new Error('用户不存在')
}
```

### 7. 数据迁移

#### 7.1 从 simple-itinerary 迁移数据

如果你有 simple-itinerary 中的数据需要迁移：

```typescript
import { simpleItineraryManager } from '@/lib/simple-itinerary'
import { databaseItineraryManager } from '@/lib/api/database-itinerary'

async function migrateItineraryData() {
  // 获取simple-itinerary中的所有行程
  const simpleItineraries = simpleItineraryManager.debugGetAllItineraries()

  for (const itinerary of simpleItineraries) {
    try {
      // 迁移到数据库
      await databaseItineraryManager.createItinerary({
        userId: itinerary.userId,
        title: itinerary.title,
        destination: itinerary.destination,
        budget: itinerary.budget,
        days: itinerary.days,
        data: itinerary.data,
        isPublic: itinerary.isPublic,
      })
      console.log(`✅ 行程迁移成功: ${itinerary.title}`)
    } catch (error) {
      console.log(`❌ 行程迁移失败: ${itinerary.title}`, error)
    }
  }
}
```

#### 7.2 验证迁移结果

```typescript
// 比较数据数量
const simpleCount = simpleItineraryManager.debugGetAllItineraries().length
const dbCount = await databaseItineraryManager.getStats()

console.log(`简单系统行程数: ${simpleCount}`)
console.log(`数据库行程数: ${dbCount.itineraries}`)
```

### 8. 部署配置

#### 8.1 环境变量

确保以下环境变量已配置：

```bash
# 数据库连接
DATABASE_URL="your-database-url"

# NextAuth配置
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

#### 8.2 Vercel 部署

```bash
# 构建命令
npm run vercel-build

# 环境变量设置
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### 9. 监控和调试

#### 9.1 日志监控

```typescript
// 启用详细日志
console.log('✅ 行程创建成功:', itinerary.title)
console.log('❌ 创建行程失败:', error)
console.log('📍 创建默认地点...')
```

#### 9.2 性能监控

```typescript
// 查询性能监控
const startTime = Date.now()
const result = await itineraryOperations.findByUserId(userId)
const endTime = Date.now()
console.log(`查询耗时: ${endTime - startTime}ms`)
```

#### 9.3 错误监控

```typescript
// 错误统计
const errorStats = {
  databaseErrors: 0,
  validationErrors: 0,
  networkErrors: 0
}

// 记录错误
catch (error) {
  errorStats.databaseErrors++
  console.error('数据库错误:', error)
}
```

### 10. 回退策略

#### 10.1 自动回退

```typescript
// 在simple-database.ts中实现回退逻辑
export const itineraryOperations = {
  create: async data => {
    try {
      return await databaseItineraryManager.createItinerary(data)
    } catch (error) {
      console.error('数据库失败，使用简单系统:', error)
      return await simpleItineraryManager.createItinerary(data)
    }
  },
}
```

#### 10.2 手动切换

```typescript
// 环境变量控制
const useDatabase = process.env.USE_DATABASE === 'true'

if (useDatabase) {
  return await databaseItineraryManager.createItinerary(data)
} else {
  return await simpleItineraryManager.createItinerary(data)
}
```

## 🎉 迁移完成

迁移完成后，你将拥有：

- ✅ 完整的数据库行程管理系统
- ✅ 数据持久化存储
- ✅ 高性能查询
- ✅ 完整的 CRUD 操作
- ✅ 关联数据查询
- ✅ 自动回退机制
- ✅ 错误处理和监控

## 📞 技术支持

如果遇到问题：

1. **检查数据库连接**: `npm run test:db`
2. **查看日志**: 检查控制台错误信息
3. **验证数据**: 使用 Prisma Studio 查看数据
4. **回退测试**: 测试简单系统的回退功能

---

_最后更新时间: 2025 年 1 月_
