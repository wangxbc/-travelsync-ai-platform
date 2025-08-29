import { prisma } from '@/lib/prisma'
import type { Itinerary, Activity, Location } from '@prisma/client'

interface ItineraryData {
  activities?: any[]
  locations?: any[]
  notes?: string
  budget?: {
    total?: number
    breakdown?: Record<string, number>
  }
  settings?: {
    timezone?: string
    currency?: string
  }
}

interface ActivityMetadata {
  bookingInfo?: {
    confirmationNumber?: string
    provider?: string
    url?: string
  }
  notes?: string
  photos?: string[]
  tags?: string[]
}

interface LocationMetadata {
  photos?: string[]
  reviews?: Array<{
    rating: number
    comment: string
    author: string
  }>
  openingHours?: Record<string, string>
  contactInfo?: {
    phone?: string
    email?: string
    website?: string
  }
}

class DatabaseItineraryManager {
  private static instance: DatabaseItineraryManager

  private constructor() {
    this.initializeDefaultData()
  }

  static getInstance(): DatabaseItineraryManager {
    if (!DatabaseItineraryManager.instance) {
      DatabaseItineraryManager.instance = new DatabaseItineraryManager()
    }
    return DatabaseItineraryManager.instance
  }

  private async initializeDefaultData() {
    try {
      const existingLocations = await prisma.location.count()
      if (existingLocations === 0) {

        const defaultLocations = [
          {
            name: '天安门广场',
            address: '北京市东城区天安门广场',
            latitude: 39.9042,
            longitude: 116.4074,
            type: '景点',
            description: '中国的象征性地标',
            rating: 4.8,
          },
          {
            name: '故宫博物院',
            address: '北京市东城区景山前街4号',
            latitude: 39.9163,
            longitude: 116.3972,
            type: '景点',
            description: '明清两代的皇家宫殿',
            rating: 4.9,
          },
          {
            name: '外滩',
            address: '上海市黄浦区中山东一路',
            latitude: 31.2304,
            longitude: 121.4737,
            type: '景点',
            description: '上海的标志性景观',
            rating: 4.7,
          },
        ]

        for (const locationData of defaultLocations) {
          await prisma.location.create({
            data: locationData,
          })
        }

      }
    } catch (error) {
      console.error('初始化默认数据失败:', error)
    }
  }

  async createItinerary(itineraryData: {
    userId: string
    title: string
    destination: string
    budget?: number
    days: number
    data: ItineraryData
    isPublic?: boolean
  }): Promise<Itinerary | null> {
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
  }

  async findItineraryById(id: string): Promise<Itinerary | null> {
    try {
      const itinerary = await prisma.itinerary.findUnique({
        where: { id },
        include: {
          user: true,
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
      console.error('查找行程失败:', error)
      return null
    }
  }

  async findItinerariesByUserId(userId: string): Promise<Itinerary[]> {
    try {
      const itineraries = await prisma.itinerary.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          activities: {
            include: {
              location: true,
            },
          },
        },
      })
      return itineraries
    } catch (error) {
      console.error('查找用户行程失败:', error)
      return []
    }
  }

  async deleteItinerary(id: string): Promise<boolean> {
    try {
      await prisma.itinerary.delete({
        where: { id },
      })
      return true
    } catch (error) {
      console.error('删除行程失败:', error)
      return false
    }
  }

  async findLocationById(id: string): Promise<Location | null> {
    try {
      const location = await prisma.location.findUnique({
        where: { id },
      })
      return location
    } catch (error) {
      console.error('查找地点失败:', error)
      return null
    }
  }

  async searchLocationsByName(
    name: string,
    limit: number = 10
  ): Promise<Location[]> {
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
  }

  async createLocation(locationData: {
    name: string
    address?: string
    latitude: number
    longitude: number
    type: string
    description?: string
    rating?: number
    metadata?: LocationMetadata
  }): Promise<Location | null> {
    try {
      const location = await prisma.location.create({
        data: locationData,
      })
      return location
    } catch (error) {
      console.error('❌ 创建地点失败:', error)
      return null
    }
  }

  async createActivity(activityData: {
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
    metadata?: ActivityMetadata
  }): Promise<Activity | null> {
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
  }

  async findActivitiesByItineraryId(itineraryId: string): Promise<Activity[]> {
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
      console.error('查找行程活动失败:', error)
      return []
    }
  }

  async updateItinerary(
    id: string,
    updateData: any
  ): Promise<Itinerary | null> {
    try {
      const itinerary = await prisma.itinerary.update({
        where: { id },
        data: updateData,
        include: {
          user: true,
          activities: true,
        },
      })
      return itinerary
    } catch (error) {
      console.error('更新行程失败:', error)
      return null
    }
  }

  async updateActivity(id: string, updateData: any): Promise<Activity | null> {
    try {
      const activity = await prisma.activity.update({
        where: { id },
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
  }

  async deleteActivity(id: string): Promise<boolean> {
    try {
      await prisma.activity.delete({
        where: { id },
      })
      return true
    } catch (error) {
      console.error('删除活动失败:', error)
      return false
    }
  }

  async getStats() {
    try {
      const [itineraryCount, activityCount, locationCount] = await Promise.all([
        prisma.itinerary.count(),
        prisma.activity.count(),
        prisma.location.count(),
      ])

      return {
        itineraries: itineraryCount,
        activities: activityCount,
        locations: locationCount,
        type: 'database',
      }
    } catch (error) {
      console.error('获取统计信息失败:', error)
      return {
        itineraries: 0,
        activities: 0,
        locations: 0,
        type: 'database',
      }
    }
  }
}

export const databaseItineraryManager = DatabaseItineraryManager.getInstance()

export type { ItineraryData, ActivityMetadata, LocationMetadata }
