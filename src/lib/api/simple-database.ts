// 简单数据库操作 - 替代原有的数据库操作
import { simpleAuthManager } from "@/lib/simple-auth";
import { simpleItineraryManager } from "@/lib/simple-itinerary";

// 用户相关的操作（使用简单认证系统）
export const userOperations = {
  findByEmail: async (email: string) => {
    return await simpleAuthManager.findByEmail(email);
  },

  create: async (userData: {
    email: string;
    name: string;
    avatar?: string;
    preferences?: any;
  }) => {
    return await simpleAuthManager.createUser({
      email: userData.email,
      name: userData.name,
      password: '123456', // 默认密码
    });
  },

  update: async (userId: string, updateData: any) => {
    return await simpleAuthManager.updateUser(userId, updateData);
  },

  delete: async (userId: string) => {
    // 简单实现，实际可能需要更复杂的逻辑
    return true;
  },

  updateAvatar: async (userId: string, avatarUrl: string) => {
    return await simpleAuthManager.updateUser(userId, { avatar: avatarUrl });
  },
};

// 行程相关的操作（使用简单行程系统）
export const itineraryOperations = {
  findByUserId: async (userId: string) => {
    return await simpleItineraryManager.findItinerariesByUserId(userId);
  },

  findById: async (itineraryId: string) => {
    return await simpleItineraryManager.findItineraryById(itineraryId);
  },

  create: async (itineraryData: {
    userId: string;
    title: string;
    destination: string;
    budget?: number;
    days: number;
    data: any;
    isPublic?: boolean;
  }) => {
    return await simpleItineraryManager.createItinerary(itineraryData);
  },

  update: async (itineraryId: string, updateData: any) => {
    return await simpleItineraryManager.updateItinerary(itineraryId, updateData);
  },

  delete: async (itineraryId: string) => {
    return await simpleItineraryManager.deleteItinerary(itineraryId);
  },

  findPublic: async (limit: number = 10) => {
    // 简单实现，返回所有公开的行程
    const allItineraries = Array.from(simpleItineraryManager['itineraries'].values());
    return allItineraries.filter(itinerary => itinerary.isPublic).slice(0, limit);
  },
};

// 地点相关的操作
export const locationOperations = {
  searchByName: async (name: string, limit: number = 10) => {
    return await simpleItineraryManager.searchLocationsByName(name, limit);
  },

  findNearby: async (latitude: number, longitude: number, radius: number = 0.01, limit: number = 20) => {
    // 简单实现，返回所有地点
    const allLocations = Array.from(simpleItineraryManager['locations'].values());
    return allLocations.slice(0, limit);
  },

  create: async (locationData: any) => {
    return await simpleItineraryManager.createLocation(locationData);
  },

  findByType: async (type: string, limit: number = 20) => {
    const allLocations = Array.from(simpleItineraryManager['locations'].values());
    return allLocations.filter(location => location.type === type).slice(0, limit);
  },
};

// 活动相关的操作
export const activityOperations = {
  findByItineraryId: async (itineraryId: string) => {
    return await simpleItineraryManager.findActivitiesByItineraryId(itineraryId);
  },

  create: async (activityData: any) => {
    return await simpleItineraryManager.createActivity(activityData);
  },

  update: async (activityId: string, updateData: any) => {
    // 简单实现
    return null;
  },

  delete: async (activityId: string) => {
    // 简单实现
    return true;
  },
};

// 协作相关的操作
export const collaborationOperations = {
  addCollaborator: async (itineraryId: string, userId: string, role: string = "editor") => {
    // 简单实现
    return true;
  },

  removeCollaborator: async (itineraryId: string, userId: string) => {
    // 简单实现
    return true;
  },

  findByUserId: async (userId: string) => {
    // 简单实现
    return [];
  },
};

// 用户行为记录操作
export const userActionOperations = {
  create: async (actionData: any) => {
    // 简单实现，只记录日志
    console.log('用户行为记录:', actionData);
    return true;
  },

  findByUserId: async (userId: string, limit: number = 50) => {
    // 简单实现
    return [];
  },
};