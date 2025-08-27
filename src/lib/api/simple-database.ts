// 简单数据库操作 - 替代原有的数据库操作
import { simpleAuthManager } from '@/lib/simple-auth'
import { databaseItineraryManager } from './database-itinerary'

// 检查是否有有效的数据库连接
const hasValidDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL
  return (
    databaseUrl &&
    (databaseUrl.startsWith('postgresql://') ||
      databaseUrl.startsWith('postgres://') ||
      databaseUrl.startsWith('mysql://') ||
      databaseUrl.startsWith('sqlite://')) &&
    !databaseUrl.includes('localhost:5432') && // 排除本地数据库
    !databaseUrl.includes('mock') // 排除模拟数据库
  )
}

// 用户相关的操作（使用简单认证系统）
export const userOperations = {
  findByEmail: async (email: string) => {
    // 如果没有有效的数据库连接，直接使用简单认证系统
    if (!hasValidDatabaseUrl()) {
      return await simpleAuthManager.findByEmail(email)
    }

    try {
      // 尝试使用数据库操作
      const { userOperations: dbUserOperations } = await import('./database')
      return await dbUserOperations.findByEmail(email)
    } catch (error) {
      console.error('数据库用户查询失败，回退到简单认证:', error)
      return await simpleAuthManager.findByEmail(email)
    }
  },

  findById: async (id: string) => {
    // 如果没有有效的数据库连接，直接使用简单认证系统
    if (!hasValidDatabaseUrl()) {
      return await simpleAuthManager.findById(id)
    }

    try {
      // 尝试使用数据库操作
      const { userOperations: dbUserOperations } = await import('./database')
      return await dbUserOperations.findById(id)
    } catch (error) {
      console.error('数据库用户查询失败，回退到简单认证:', error)
      return await simpleAuthManager.findById(id)
    }
  },

  create: async (userData: {
    email: string
    name: string
    avatar?: string
    preferences?: any
  }) => {
    // 如果没有有效的数据库连接，直接使用简单认证系统
    if (!hasValidDatabaseUrl()) {
      return await simpleAuthManager.createUser({
        email: userData.email,
        name: userData.name,
        password: '123456', // 默认密码
        avatar: userData.avatar,
        preferences: userData.preferences,
      })
    }

    try {
      // 尝试使用数据库操作
      const { userOperations: dbUserOperations } = await import('./database')
      return await dbUserOperations.create(userData)
    } catch (error) {
      console.error('数据库用户创建失败，回退到简单认证:', error)
      return await simpleAuthManager.createUser({
        email: userData.email,
        name: userData.name,
        password: '123456', // 默认密码
        avatar: userData.avatar,
        preferences: userData.preferences,
      })
    }
  },

  update: async (userId: string, updateData: any) => {
    // 如果没有有效的数据库连接，直接使用简单认证系统
    if (!hasValidDatabaseUrl()) {
      return await simpleAuthManager.updateUser(userId, updateData)
    }

    try {
      // 尝试使用数据库操作
      const { userOperations: dbUserOperations } = await import('./database')
      return await dbUserOperations.update(userId, updateData)
    } catch (error) {
      console.error('数据库用户更新失败，回退到简单认证:', error)
      return await simpleAuthManager.updateUser(userId, updateData)
    }
  },

  delete: async (userId: string) => {
    // 如果没有有效的数据库连接，直接返回成功
    if (!hasValidDatabaseUrl()) {
      return true
    }

    try {
      // 尝试使用数据库操作
      const { userOperations: dbUserOperations } = await import('./database')
      return await dbUserOperations.delete(userId)
    } catch (error) {
      console.error('数据库用户删除失败:', error)
      return true // 简单实现
    }
  },

  updateAvatar: async (userId: string, avatarUrl: string) => {
    // 如果没有有效的数据库连接，直接使用简单认证系统
    if (!hasValidDatabaseUrl()) {
      return await simpleAuthManager.updateUser(userId, { avatar: avatarUrl })
    }

    try {
      // 尝试使用数据库操作
      const { userOperations: dbUserOperations } = await import('./database')
      return await dbUserOperations.updateAvatar(userId, avatarUrl)
    } catch (error) {
      console.error('数据库头像更新失败，回退到简单认证:', error)
      return await simpleAuthManager.updateUser(userId, { avatar: avatarUrl })
    }
  },

  getAllUsers: async () => {
    // 如果没有有效的数据库连接，直接使用简单认证系统
    if (!hasValidDatabaseUrl()) {
      return await simpleAuthManager.getAllUsers()
    }

    try {
      // 尝试使用数据库操作
      const { userOperations: dbUserOperations } = await import('./database')
      return await dbUserOperations.getAllUsers()
    } catch (error) {
      console.error('数据库用户查询失败，回退到简单认证:', error)
      return await simpleAuthManager.getAllUsers()
    }
  },

  validateCredentials: async (email: string, password: string) => {
    // 如果没有有效的数据库连接，直接使用简单认证系统
    if (!hasValidDatabaseUrl()) {
      return await simpleAuthManager.validateCredentials(email, password)
    }

    try {
      // 尝试使用数据库操作
      const { userOperations: dbUserOperations } = await import('./database')
      return await dbUserOperations.validateCredentials(email, password)
    } catch (error) {
      console.error('数据库凭据验证失败，回退到简单认证:', error)
      return await simpleAuthManager.validateCredentials(email, password)
    }
  },
}

// 行程相关的操作（使用数据库行程系统）
export const itineraryOperations = {
  findByUserId: async (userId: string) => {
    try {
      return await databaseItineraryManager.findItinerariesByUserId(userId)
    } catch (error) {
      console.error('数据库行程查询失败:', error)
      return []
    }
  },

  findById: async (itineraryId: string) => {
    try {
      return await databaseItineraryManager.findItineraryById(itineraryId)
    } catch (error) {
      console.error('数据库行程查询失败:', error)
      return null
    }
  },

  create: async (itineraryData: {
    userId: string
    title: string
    destination: string
    budget?: number
    days: number
    data: any
    isPublic?: boolean
  }) => {
    try {
      return await databaseItineraryManager.createItinerary(itineraryData)
    } catch (error) {
      console.error('数据库行程创建失败:', error)
      return null
    }
  },

  update: async (itineraryId: string, updateData: any) => {
    try {
      return await databaseItineraryManager.updateItinerary(
        itineraryId,
        updateData
      )
    } catch (error) {
      console.error('数据库行程更新失败:', error)
      return null
    }
  },

  delete: async (itineraryId: string) => {
    try {
      return await databaseItineraryManager.deleteItinerary(itineraryId)
    } catch (error) {
      console.error('数据库行程删除失败:', error)
      return false
    }
  },
}

// 位置相关的操作（使用数据库位置系统）
export const locationOperations = {
  findById: async (locationId: string) => {
    try {
      return await databaseItineraryManager.findLocationById(locationId)
    } catch (error) {
      console.error('数据库位置查询失败:', error)
      return null
    }
  },

  searchByName: async (name: string, limit: number = 10) => {
    try {
      return await databaseItineraryManager.searchLocationsByName(name, limit)
    } catch (error) {
      console.error('数据库位置搜索失败:', error)
      return []
    }
  },

  create: async (locationData: any) => {
    try {
      return await databaseItineraryManager.createLocation(locationData)
    } catch (error) {
      console.error('数据库位置创建失败:', error)
      return null
    }
  },

  update: async (locationId: string, updateData: any) => {
    try {
      // 这里需要实现数据库的位置更新
      console.log('位置更新:', { locationId, updateData })
      return null
    } catch (error) {
      console.error('数据库位置更新失败:', error)
      return null
    }
  },

  delete: async (locationId: string) => {
    try {
      // 这里需要实现数据库的位置删除
      console.log('位置删除:', locationId)
      return true
    } catch (error) {
      console.error('数据库位置删除失败:', error)
      return false
    }
  },
}

// 活动相关的操作（使用数据库活动系统）
export const activityOperations = {
  create: async (activityData: any) => {
    try {
      return await databaseItineraryManager.createActivity(activityData)
    } catch (error) {
      console.error('数据库活动创建失败:', error)
      return null
    }
  },

  update: async (activityId: string, updateData: any) => {
    try {
      return await databaseItineraryManager.updateActivity(
        activityId,
        updateData
      )
    } catch (error) {
      console.error('数据库活动更新失败:', error)
      return null
    }
  },

  delete: async (activityId: string) => {
    try {
      return await databaseItineraryManager.deleteActivity(activityId)
    } catch (error) {
      console.error('数据库活动删除失败:', error)
      return false
    }
  },

  findByItineraryId: async (itineraryId: string) => {
    try {
      return await databaseItineraryManager.findActivitiesByItineraryId(
        itineraryId
      )
    } catch (error) {
      console.error('数据库活动查询失败:', error)
      return []
    }
  },
}

// 协作相关的操作
export const collaborationOperations = {
  addCollaborator: async (
    itineraryId: string,
    userId: string,
    role: string = 'editor'
  ) => {
    try {
      // 这里需要实现数据库的协作添加
      console.log('添加协作者:', { itineraryId, userId, role })
      return true
    } catch (error) {
      console.error('数据库协作添加失败:', error)
      return false
    }
  },

  removeCollaborator: async (itineraryId: string, userId: string) => {
    try {
      // 这里需要实现数据库的协作移除
      console.log('移除协作者:', { itineraryId, userId })
      return true
    } catch (error) {
      console.error('数据库协作移除失败:', error)
      return false
    }
  },

  findByUserId: async (userId: string) => {
    try {
      // 这里需要实现数据库的协作查询
      console.log('查询用户协作:', userId)
      return []
    } catch (error) {
      console.error('数据库协作查询失败:', error)
      return []
    }
  },
}

// 用户行为记录操作
export const userActionOperations = {
  create: async (actionData: any) => {
    try {
      // 这里需要实现数据库的用户行为记录
      console.log('用户行为记录:', actionData)
      return true
    } catch (error) {
      console.error('用户行为记录失败:', error)
      return false
    }
  },

  findByUserId: async (userId: string, limit: number = 50) => {
    try {
      // 这里需要实现数据库的用户行为查询
      console.log('查询用户行为:', userId)
      return []
    } catch (error) {
      console.error('用户行为查询失败:', error)
      return []
    }
  },
}

// 导出所有操作
export {
  userOperations,
  itineraryOperations,
  locationOperations,
  activityOperations,
  collaborationOperations,
  userActionOperations,
}
