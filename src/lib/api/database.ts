import prisma from '@/lib/prisma'
import type { User, Itinerary, Location, Activity } from '@prisma/client'

export const userOperations = {
  findByEmail: async (email: string): Promise<User | null> => {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      })
      return user
    } catch (error) {
      console.error('查找用户失败:', error)
      return null
    }
  },

  create: async (userData: {
    email: string
    name: string
    avatar?: string
    preferences?: any
  }): Promise<User | null> => {
    try {
      const user = await prisma.user.create({
        data: userData,
      })
      return user
    } catch (error) {
      console.error('创建用户失败:', error)
      return null
    }
  },

  update: async (
    userId: string,
    updateData: {
      name?: string
      avatar?: string
      bio?: string
      location?: string
      website?: string
      phone?: string
      birthday?: Date
      gender?: string
      occupation?: string
      interests?: string
      socialLinks?: any
      preferences?: any
    }
  ): Promise<User | null> => {
    try {
      const validFields = [
        'name',
        'avatar',
        'bio',
        'location',
        'website',
        'phone',
        'birthday',
        'gender',
        'occupation',
        'interests',
        'socialLinks',
        'preferences',
      ]
      const filteredData: any = {}

      Object.keys(updateData).forEach(key => {
        if (
          validFields.includes(key) &&
          updateData[key as keyof typeof updateData] !== undefined
        ) {
          filteredData[key] = updateData[key as keyof typeof updateData]
        }
      })

      const user = await prisma.user.update({
        where: { id: userId },
        data: filteredData,
      })

      return user
    } catch (error) {
      console.error('更新用户失败:', error)
      return null
    }
  },

  delete: async (userId: string): Promise<boolean> => {
    try {
      await prisma.user.delete({
        where: { id: userId },
      })
      return true
    } catch (error) {
      console.error('删除用户失败:', error)
      return false
    }
  },

  updateAvatar: async (
    userId: string,
    avatarUrl: string
  ): Promise<User | null> => {
    try {

      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
      })

      return user
    } catch (error) {
      console.error('更新头像失败:', error)
      return null
    }
  },
}

export const itineraryOperations = {
  findByUserId: async (userId: string): Promise<Itinerary[]> => {
    try {
      const itineraries = await prisma.itinerary.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          collaborations: {
            include: {
              user: true,
            },
          },
          activities: {
            include: {
              location: true,
            },
          },
        },
      })
      return itineraries
    } catch (error) {
      console.error('获取用户行程失败:', error)
      return []
    }
  },

  findById: async (itineraryId: string): Promise<Itinerary | null> => {
    try {
      const itinerary = await prisma.itinerary.findUnique({
        where: { id: itineraryId },
        include: {
          user: true,
          collaborations: {
            include: {
              user: true,
            },
          },
          activities: {
            include: {
              location: true,
            },
            orderBy: [{ day: 'asc' }, { order: 'asc' }],
          },
          locations: true,
        },
      })
      return itinerary
    } catch (error) {
      console.error('获取行程详情失败:', error)
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
  }): Promise<Itinerary | null> => {
    try {
      const itinerary = await prisma.itinerary.create({
        data: itineraryData,
        include: {
          user: true,
          activities: true,
        },
      })
      return itinerary
    } catch (error) {
      console.error('创建行程失败:', error)
      return null
    }
  },

  update: async (
    itineraryId: string,
    updateData: {
      title?: string
      destination?: string
      budget?: number
      days?: number
      data?: any
      isPublic?: boolean
    }
  ): Promise<Itinerary | null> => {
    try {
      const itinerary = await prisma.itinerary.update({
        where: { id: itineraryId },
        data: updateData,
      })
      return itinerary
    } catch (error) {
      console.error('更新行程失败:', error)
      return null
    }
  },

  delete: async (itineraryId: string): Promise<boolean> => {
    try {
      await prisma.itinerary.delete({
        where: { id: itineraryId },
      })
      return true
    } catch (error) {
      console.error('删除行程失败:', error)
      return false
    }
  },

  findPublic: async (limit: number = 10): Promise<Itinerary[]> => {
    try {
      const itineraries = await prisma.itinerary.findMany({
        where: { isPublic: true },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          activities: {
            include: {
              location: true,
            },
          },
        },
      })
      return itineraries
    } catch (error) {
      console.error('获取公开行程失败:', error)
      return []
    }
  },

  addCollaborator: async (
    itineraryId: string,
    userId: string,
    role: string = 'editor'
  ): Promise<boolean> => {
    try {
      await prisma.collaboration.create({
        data: {
          itineraryId,
          userId,
          role,
        },
      })
      return true
    } catch (error) {
      console.error('添加协作者失败:', error)
      return false
    }
  },

  removeCollaborator: async (
    itineraryId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      await prisma.collaboration.delete({
        where: {
          itineraryId_userId: {
            itineraryId,
            userId,
          },
        },
      })
      return true
    } catch (error) {
      console.error('移除协作者失败:', error)
      return false
    }
  },

  findCollaborationsByUserId: async (userId: string): Promise<any[]> => {
    try {
      const collaborations = await prisma.collaboration.findMany({
        where: { userId },
        include: {
          itinerary: {
            include: {
              user: true,
              activities: true,
            },
          },
        },
      })
      return collaborations
    } catch (error) {
      console.error('获取协作行程失败:', error)
      return []
    }
  },
}

export const locationOperations = {
  findById: async (locationId: string): Promise<Location | null> => {
    try {
      const location = await prisma.location.findUnique({
        where: { id: locationId },
      })
      return location
    } catch (error) {
      console.error('查找地点失败:', error)
      return null
    }
  },

  searchByName: async (
    name: string,
    limit: number = 10
  ): Promise<Location[]> => {
    try {
      const locations = await prisma.location.findMany({
        where: {
          name: {
            contains: name,
          },
        },
        take: limit,
        orderBy: { rating: 'desc' },
      })
      return locations
    } catch (error) {
      console.error('搜索地点失败:', error)
      return []
    }
  },

  findNearby: async (
    latitude: number,
    longitude: number,
    radius: number = 0.01,
    limit: number = 20
  ): Promise<Location[]> => {
    try {
      const locations = await prisma.location.findMany({
        where: {
          latitude: {
            gte: latitude - radius,
            lte: latitude + radius,
          },
          longitude: {
            gte: longitude - radius,
            lte: longitude + radius,
          },
        },
        take: limit,
        orderBy: { rating: 'desc' },
      })
      return locations
    } catch (error) {
      console.error('查找附近地点失败:', error)
      return []
    }
  },

  create: async (locationData: {
    name: string
    address?: string
    latitude: number
    longitude: number
    type: string
    description?: string
    rating?: number
    metadata?: any
  }): Promise<Location | null> => {
    try {
      const location = await prisma.location.create({
        data: locationData,
      })
      return location
    } catch (error) {
      console.error('创建地点失败:', error)
      return null
    }
  },

  update: async (
    locationId: string,
    updateData: {
      name?: string
      address?: string
      latitude?: number
      longitude?: number
      type?: string
      description?: string
      rating?: number
      metadata?: any
    }
  ): Promise<Location | null> => {
    try {
      const location = await prisma.location.update({
        where: { id: locationId },
        data: updateData,
      })
      return location
    } catch (error) {
      console.error('更新地点失败:', error)
      return null
    }
  },

  delete: async (locationId: string): Promise<boolean> => {
    try {
      await prisma.location.delete({
        where: { id: locationId },
      })
      return true
    } catch (error) {
      console.error('删除地点失败:', error)
      return false
    }
  },

  findByType: async (type: string, limit: number = 20): Promise<Location[]> => {
    try {
      const locations = await prisma.location.findMany({
        where: { type },
        take: limit,
        orderBy: { rating: 'desc' },
      })
      return locations
    } catch (error) {
      console.error('根据类型获取地点失败:', error)
      return []
    }
  },
}

export const activityOperations = {
  findByItineraryId: async (itineraryId: string): Promise<Activity[]> => {
    try {
      const activities = await prisma.activity.findMany({
        where: { itineraryId },
        include: {
          location: true,
        },
        orderBy: [{ day: 'asc' }, { order: 'asc' }],
      })
      return activities
    } catch (error) {
      console.error('获取行程活动失败:', error)
      return []
    }
  },

  create: async (activityData: {
    itineraryId: string
    locationId?: string
    name: string
    description?: string
    startTime: Date
    endTime: Date
    cost?: number
    category: string
    day: number
    order: number
    metadata?: any
  }): Promise<Activity | null> => {
    try {
      const activity = await prisma.activity.create({
        data: activityData,
        include: {
          location: true,
        },
      })
      return activity
    } catch (error) {
      console.error('创建活动失败:', error)
      return null
    }
  },

  update: async (
    activityId: string,
    updateData: {
      name?: string
      description?: string
      startTime?: Date
      endTime?: Date
      cost?: number
      category?: string
      day?: number
      order?: number
      metadata?: any
    }
  ): Promise<Activity | null> => {
    try {
      const activity = await prisma.activity.update({
        where: { id: activityId },
        data: updateData,
        include: {
          location: true,
        },
      })
      return activity
    } catch (error) {
      console.error('更新活动失败:', error)
      return null
    }
  },

  delete: async (activityId: string): Promise<boolean> => {
    try {
      await prisma.activity.delete({
        where: { id: activityId },
      })
      return true
    } catch (error) {
      console.error('删除活动失败:', error)
      return false
    }
  },
}

export const collaborationOperations = {
  addCollaborator: async (
    itineraryId: string,
    userId: string,
    role: string = 'editor'
  ): Promise<boolean> => {
    try {
      await prisma.collaboration.create({
        data: {
          itineraryId,
          userId,
          role,
        },
      })
      return true
    } catch (error) {
      console.error('添加协作者失败:', error)
      return false
    }
  },

  removeCollaborator: async (
    itineraryId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      await prisma.collaboration.delete({
        where: {
          itineraryId_userId: {
            itineraryId,
            userId,
          },
        },
      })
      return true
    } catch (error) {
      console.error('移除协作者失败:', error)
      return false
    }
  },

  findByUserId: async (userId: string): Promise<any[]> => {
    try {
      const collaborations = await prisma.collaboration.findMany({
        where: { userId },
        include: {
          itinerary: {
            include: {
              user: true,
              activities: true,
            },
          },
        },
      })
      return collaborations
    } catch (error) {
      console.error('获取协作行程失败:', error)
      return []
    }
  },
}

export const userActionOperations = {
  create: async (actionData: {
    userId: string
    actionType: string
    targetType: string
    targetId: string
    metadata?: any
  }): Promise<boolean> => {
    try {
      await prisma.userAction.create({
        data: actionData,
      })
      return true
    } catch (error) {
      console.error('记录用户行为失败:', error)
      return false
    }
  },

  findByUserId: async (userId: string, limit: number = 50): Promise<any[]> => {
    try {
      const actions = await prisma.userAction.findMany({
        where: { userId },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })
      return actions
    } catch (error) {
      console.error('获取用户行为历史失败:', error)
      return []
    }
  },
}
