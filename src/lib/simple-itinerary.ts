// 简单的行程管理系统 - 不依赖数据库
// 用于解决Vercel部署时的数据库连接问题

interface SimpleItinerary {
  id: string;
  userId: string;
  title: string;
  destination: string;
  budget?: number;
  days: number;
  data: any;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SimpleActivity {
  id: string;
  itineraryId: string;
  locationId?: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  cost?: number;
  category: string;
  day: number;
  order: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface SimpleLocation {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  type: string;
  description?: string;
  rating?: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

class SimpleItineraryManager {
  private static instance: SimpleItineraryManager;
  private itineraries: Map<string, SimpleItinerary> = new Map();
  private activities: Map<string, SimpleActivity> = new Map();
  private locations: Map<string, SimpleLocation> = new Map();

  private constructor() {
    this.initializeDefaultData();
  }

  static getInstance(): SimpleItineraryManager {
    if (!SimpleItineraryManager.instance) {
      SimpleItineraryManager.instance = new SimpleItineraryManager();
    }
    return SimpleItineraryManager.instance;
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }  pri
vate initializeDefaultData() {
    // 创建一些默认地点
    const defaultLocations: Omit<SimpleLocation, 'id' | 'createdAt' | 'updatedAt'>[] = [
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
    ];

    defaultLocations.forEach(locationData => {
      const location: SimpleLocation = {
        ...locationData,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.locations.set(location.id, location);
    });

    console.log(`🔄 简单行程系统已初始化，包含 ${this.locations.size} 个默认地点`);
  }

  // 行程操作
  async createItinerary(itineraryData: {
    userId: string;
    title: string;
    destination: string;
    budget?: number;
    days: number;
    data: any;
    isPublic?: boolean;
  }): Promise<SimpleItinerary> {
    const itinerary: SimpleItinerary = {
      ...itineraryData,
      id: this.generateId(),
      isPublic: itineraryData.isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.itineraries.set(itinerary.id, itinerary);
    console.log('✅ 行程创建成功（简单存储）:', itinerary.title);
    return itinerary;
  }

  async findItineraryById(id: string): Promise<SimpleItinerary | null> {
    return this.itineraries.get(id) || null;
  }

  async findItinerariesByUserId(userId: string): Promise<SimpleItinerary[]> {
    return Array.from(this.itineraries.values()).filter(
      itinerary => itinerary.userId === userId
    );
  }

  async updateItinerary(id: string, updates: Partial<SimpleItinerary>): Promise<SimpleItinerary | null> {
    const itinerary = this.itineraries.get(id);
    if (!itinerary) return null;

    const updatedItinerary: SimpleItinerary = {
      ...itinerary,
      ...updates,
      id, // 确保ID不被修改
      updatedAt: new Date(),
    };

    this.itineraries.set(id, updatedItinerary);
    console.log('✅ 行程更新成功（简单存储）:', updatedItinerary.title);
    return updatedItinerary;
  }

  async deleteItinerary(id: string): Promise<boolean> {
    const deleted = this.itineraries.delete(id);
    if (deleted) {
      // 同时删除相关的活动
      Array.from(this.activities.values())
        .filter(activity => activity.itineraryId === id)
        .forEach(activity => this.activities.delete(activity.id));
      
      console.log('✅ 行程删除成功（简单存储）:', id);
    }
    return deleted;
  }

  // 活动操作
  async createActivity(activityData: {
    itineraryId: string;
    locationId?: string;
    name: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    cost?: number;
    category: string;
    day: number;
    order: number;
    metadata?: any;
  }): Promise<SimpleActivity> {
    const activity: SimpleActivity = {
      ...activityData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.activities.set(activity.id, activity);
    console.log('✅ 活动创建成功（简单存储）:', activity.name);
    return activity;
  }

  async findActivitiesByItineraryId(itineraryId: string): Promise<SimpleActivity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.itineraryId === itineraryId)
      .sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.order - b.order;
      });
  }

  // 地点操作
  async findLocationById(id: string): Promise<SimpleLocation | null> {
    return this.locations.get(id) || null;
  }

  async searchLocationsByName(name: string, limit: number = 10): Promise<SimpleLocation[]> {
    return Array.from(this.locations.values())
      .filter(location => location.name.includes(name))
      .slice(0, limit);
  }

  async createLocation(locationData: {
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    type: string;
    description?: string;
    rating?: number;
    metadata?: any;
  }): Promise<SimpleLocation> {
    const location: SimpleLocation = {
      ...locationData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.locations.set(location.id, location);
    console.log('✅ 地点创建成功（简单存储）:', location.name);
    return location;
  }

  // 统计信息
  getStats() {
    return {
      totalItineraries: this.itineraries.size,
      totalActivities: this.activities.size,
      totalLocations: this.locations.size,
      type: 'simple-storage',
    };
  }

  // 调试方法
  debugGetAllData() {
    return {
      itineraries: Array.from(this.itineraries.values()),
      activities: Array.from(this.activities.values()),
      locations: Array.from(this.locations.values()),
    };
  }
}

// 导出单例实例
export const simpleItineraryManager = SimpleItineraryManager.getInstance();

// 导出类型
export type { SimpleItinerary, SimpleActivity, SimpleLocation };