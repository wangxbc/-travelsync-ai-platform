// 简单的行程管理系统 - 不依赖数据库

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

interface SimpleItinerary {
  id: string
  userId: string
  title: string
  destination: string
  budget?: number
  days: number
  data: ItineraryData
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

interface SimpleActivity {
  id: string
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
  createdAt: Date
  updatedAt: Date
}

interface SimpleLocation {
  id: string
  name: string
  address?: string
  latitude: number
  longitude: number
  type: string
  description?: string
  rating?: number
  metadata?: LocationMetadata
  createdAt: Date
  updatedAt: Date
}

class SimpleItineraryManager {
  private static instance: SimpleItineraryManager
  private itineraries: Map<string, SimpleItinerary> = new Map()
  private activities: Map<string, SimpleActivity> = new Map()
  private locations: Map<string, SimpleLocation> = new Map()

  private constructor() {
    this.initializeDefaultData()
  }

  static getInstance(): SimpleItineraryManager {
    if (!SimpleItineraryManager.instance) {
      SimpleItineraryManager.instance = new SimpleItineraryManager()
    }
    return SimpleItineraryManager.instance
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  private initializeDefaultData() {
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

    defaultLocations.forEach(locationData => {
      const location: SimpleLocation = {
        ...locationData,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.locations.set(location.id, location)
    })

    console.log(`简单行程系统已初始化，包含 ${this.locations.size} 个默认地点`)
  }

  async createItinerary(itineraryData: {
    userId: string
    title: string
    destination: string
    budget?: number
    days: number
    data: ItineraryData
    isPublic?: boolean
  }): Promise<SimpleItinerary> {
    const itinerary: SimpleItinerary = {
      ...itineraryData,
      id: this.generateId(),
      isPublic: itineraryData.isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.itineraries.set(itinerary.id, itinerary)
    console.log('行程创建成功:', itinerary.title)
    return itinerary
  }

  async findItineraryById(id: string): Promise<SimpleItinerary | null> {
    return this.itineraries.get(id) || null
  }

  async findItinerariesByUserId(userId: string): Promise<SimpleItinerary[]> {
    return Array.from(this.itineraries.values()).filter(
      itinerary => itinerary.userId === userId
    )
  }

  async deleteItinerary(id: string): Promise<boolean> {
    const deleted = this.itineraries.delete(id)
    if (deleted) {
      Array.from(this.activities.values())
        .filter(activity => activity.itineraryId === id)
        .forEach(activity => this.activities.delete(activity.id))
    }
    return deleted
  }

  async findLocationById(id: string): Promise<SimpleLocation | null> {
    return this.locations.get(id) || null
  }

  async searchLocationsByName(
    name: string,
    limit: number = 10
  ): Promise<SimpleLocation[]> {
    return Array.from(this.locations.values())
      .filter(location => location.name.includes(name))
      .slice(0, limit)
  }
}

export const simpleItineraryManager = SimpleItineraryManager.getInstance()
export type { SimpleItinerary, SimpleActivity, SimpleLocation }
