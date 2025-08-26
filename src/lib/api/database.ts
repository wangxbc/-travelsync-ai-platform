// 这个文件包含数据库操作的工具函数
// 作为应届生，我会把常用的数据库操作封装成函数

import prisma from "@/lib/prisma";
import type { User, Itinerary, Location, Activity } from "@prisma/client";

// 用户相关的数据库操作
export const userOperations = {
  // 根据邮箱查找用户
  findByEmail: async (email: string): Promise<User | null> => {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      console.error("查找用户失败:", error);
      return null;
    }
  },

  // 创建新用户
  create: async (userData: {
    email: string;
    name: string;
    avatar?: string;
    preferences?: any;
  }): Promise<User | null> => {
    try {
      const user = await prisma.user.create({
        data: userData,
      });
      return user;
    } catch (error) {
      console.error("创建用户失败:", error);
      return null;
    }
  },

  // 更新用户信息
  update: async (
    userId: string,
    updateData: {
      name?: string;
      avatar?: string;
      bio?: string;
      location?: string;
      website?: string;
      phone?: string;
      birthday?: Date;
      gender?: string;
      occupation?: string;
      interests?: string;
      socialLinks?: any;
      preferences?: any;
    }
  ): Promise<User | null> => {
    try {
      // 支持所有用户字段的更新
      const validFields = [
        "name", 
        "avatar", 
        "bio", 
        "location", 
        "website", 
        "phone", 
        "birthday", 
        "gender", 
        "occupation", 
        "interests", 
        "socialLinks", 
        "preferences"
      ];
      const filteredData: any = {};

      Object.keys(updateData).forEach((key) => {
        if (
          validFields.includes(key) &&
          updateData[key as keyof typeof updateData] !== undefined
        ) {
          filteredData[key] = updateData[key as keyof typeof updateData];
        }
      });

      console.log("🔄 更新用户数据:", { userId, filteredData });

      const user = await prisma.user.update({
        where: { id: userId },
        data: filteredData,
      });

      console.log("✅ 用户更新成功:", user.id);
      return user;
    } catch (error) {
      console.error("更新用户失败:", error);
      return null;
    }
  },

  // 删除用户
  delete: async (userId: string): Promise<boolean> => {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
      return true;
    } catch (error) {
      console.error("删除用户失败:", error);
      return false;
    }
  },

  // 专门更新头像
  updateAvatar: async (
    userId: string,
    avatarUrl: string
  ): Promise<User | null> => {
    try {
      console.log("🔄 更新头像:", { userId, avatarUrl });

      const user = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
      });

      console.log("✅ 头像更新成功:", user.id);
      return user;
    } catch (error) {
      console.error("更新头像失败:", error);
      return null;
    }
  },
};

// 行程相关的数据库操作
export const itineraryOperations = {
  // 获取用户的所有行程
  findByUserId: async (userId: string): Promise<Itinerary[]> => {
    try {
      const itineraries = await prisma.itinerary.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
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
      });
      return itineraries;
    } catch (error) {
      console.error("获取用户行程失败:", error);
      return [];
    }
  },

  // 根据ID获取行程详情
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
            orderBy: [{ day: "asc" }, { order: "asc" }],
          },
          locations: true,
        },
      });
      return itinerary;
    } catch (error) {
      console.error("获取行程详情失败:", error);
      return null;
    }
  },

  // 创建新行程
  create: async (itineraryData: {
    userId: string;
    title: string;
    destination: string;
    budget?: number;
    days: number;
    data: any;
    isPublic?: boolean;
  }): Promise<Itinerary | null> => {
    try {
      const itinerary = await prisma.itinerary.create({
        data: itineraryData,
        include: {
          user: true,
          activities: true,
        },
      });
      return itinerary;
    } catch (error) {
      console.error("创建行程失败:", error);
      return null;
    }
  },

  // 更新行程
  update: async (
    itineraryId: string,
    updateData: {
      title?: string;
      destination?: string;
      budget?: number;
      days?: number;
      data?: any;
      isPublic?: boolean;
    }
  ): Promise<Itinerary | null> => {
    try {
      const itinerary = await prisma.itinerary.update({
        where: { id: itineraryId },
        data: updateData,
      });
      return itinerary;
    } catch (error) {
      console.error("更新行程失败:", error);
      return null;
    }
  },

  // 删除行程
  delete: async (itineraryId: string): Promise<boolean> => {
    try {
      await prisma.itinerary.delete({
        where: { id: itineraryId },
      });
      return true;
    } catch (error) {
      console.error("删除行程失败:", error);
      return false;
    }
  },

  // 获取公开的行程（用于推荐）
  findPublic: async (limit: number = 10): Promise<Itinerary[]> => {
    try {
      const itineraries = await prisma.itinerary.findMany({
        where: { isPublic: true },
        take: limit,
        orderBy: { createdAt: "desc" },
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
      });
      return itineraries;
    } catch (error) {
      console.error("获取公开行程失败:", error);
      return [];
    }
  },
};

// 地点相关的数据库操作
export const locationOperations = {
  // 根据名称搜索地点
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
        orderBy: { rating: "desc" },
      });
      return locations;
    } catch (error) {
      console.error("搜索地点失败:", error);
      return [];
    }
  },

  // 根据坐标范围查找附近地点
  findNearby: async (
    latitude: number,
    longitude: number,
    radius: number = 0.01, // 大约1公里
    limit: number = 20
  ): Promise<Location[]> => {
    try {
      // 简单的矩形范围查询（实际项目中可能需要更精确的地理查询）
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
        orderBy: { rating: "desc" },
      });
      return locations;
    } catch (error) {
      console.error("查找附近地点失败:", error);
      return [];
    }
  },

  // 创建新地点
  create: async (locationData: {
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
    type: string;
    description?: string;
    rating?: number;
    metadata?: any;
  }): Promise<Location | null> => {
    try {
      const location = await prisma.location.create({
        data: locationData,
      });
      return location;
    } catch (error) {
      console.error("创建地点失败:", error);
      return null;
    }
  },

  // 根据类型获取地点
  findByType: async (type: string, limit: number = 20): Promise<Location[]> => {
    try {
      const locations = await prisma.location.findMany({
        where: { type },
        take: limit,
        orderBy: { rating: "desc" },
      });
      return locations;
    } catch (error) {
      console.error("根据类型获取地点失败:", error);
      return [];
    }
  },
};

// 活动相关的数据库操作
export const activityOperations = {
  // 获取行程的所有活动
  findByItineraryId: async (itineraryId: string): Promise<Activity[]> => {
    try {
      const activities = await prisma.activity.findMany({
        where: { itineraryId },
        include: {
          location: true,
        },
        orderBy: [{ day: "asc" }, { order: "asc" }],
      });
      return activities;
    } catch (error) {
      console.error("获取行程活动失败:", error);
      return [];
    }
  },

  // 创建新活动
  create: async (activityData: {
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
  }): Promise<Activity | null> => {
    try {
      const activity = await prisma.activity.create({
        data: activityData,
        include: {
          location: true,
        },
      });
      return activity;
    } catch (error) {
      console.error("创建活动失败:", error);
      return null;
    }
  },

  // 更新活动
  update: async (
    activityId: string,
    updateData: {
      name?: string;
      description?: string;
      startTime?: Date;
      endTime?: Date;
      cost?: number;
      category?: string;
      day?: number;
      order?: number;
      metadata?: any;
    }
  ): Promise<Activity | null> => {
    try {
      const activity = await prisma.activity.update({
        where: { id: activityId },
        data: updateData,
        include: {
          location: true,
        },
      });
      return activity;
    } catch (error) {
      console.error("更新活动失败:", error);
      return null;
    }
  },

  // 删除活动
  delete: async (activityId: string): Promise<boolean> => {
    try {
      await prisma.activity.delete({
        where: { id: activityId },
      });
      return true;
    } catch (error) {
      console.error("删除活动失败:", error);
      return false;
    }
  },
};

// 协作相关的数据库操作
export const collaborationOperations = {
  // 添加协作者
  addCollaborator: async (
    itineraryId: string,
    userId: string,
    role: string = "editor"
  ): Promise<boolean> => {
    try {
      await prisma.collaboration.create({
        data: {
          itineraryId,
          userId,
          role,
        },
      });
      return true;
    } catch (error) {
      console.error("添加协作者失败:", error);
      return false;
    }
  },

  // 移除协作者
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
      });
      return true;
    } catch (error) {
      console.error("移除协作者失败:", error);
      return false;
    }
  },

  // 获取用户参与的协作行程
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
      });
      return collaborations;
    } catch (error) {
      console.error("获取协作行程失败:", error);
      return [];
    }
  },
};

// 用户行为记录操作
export const userActionOperations = {
  // 记录用户行为
  create: async (actionData: {
    userId: string;
    actionType: string;
    targetType: string;
    targetId: string;
    metadata?: any;
  }): Promise<boolean> => {
    try {
      await prisma.userAction.create({
        data: actionData,
      });
      return true;
    } catch (error) {
      console.error("记录用户行为失败:", error);
      return false;
    }
  },

  // 获取用户行为历史
  findByUserId: async (userId: string, limit: number = 50): Promise<any[]> => {
    try {
      const actions = await prisma.userAction.findMany({
        where: { userId },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
      return actions;
    } catch (error) {
      console.error("获取用户行为历史失败:", error);
      return [];
    }
  },
};
