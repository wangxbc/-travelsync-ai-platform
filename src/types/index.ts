// 这个文件定义了整个应用的基础类型
// 作为应届生，我把所有类型都写在一个文件里，方便管理

// 用户相关的类型定义
export interface User {
  id: string; // 用户唯一标识符
  email: string; // 用户邮箱地址
  name: string; // 用户姓名
  avatar?: string; // 用户头像URL，可选
  createdAt: Date; // 用户创建时间
  updatedAt: Date; // 用户更新时间
}

// 旅行输入数据的类型定义
export interface TravelInput {
  departure?: string; // 出发地名称，可选
  destination: string; // 目的地名称
  budget: number; // 预算金额
  days: number; // 旅行天数
  interests: string[]; // 兴趣爱好数组
  travelStyle: 'budget' | 'comfort' | 'luxury'; // 旅行风格枚举
  lockedActivities?: string[]; // 锁定的活动ID列表，可选
  existingItinerary?: Itinerary; // 现有行程，用于重新生成，可选
}

// 单日行程的类型定义
export interface DayPlan {
  day: number; // 第几天
  date: string; // 具体日期
  activities: Activity[]; // 当天活动列表
  totalBudget: number; // 当天预算
}

// 活动/景点的类型定义
export interface Activity {
  id: string; // 活动唯一标识符
  name: string; // 活动名称
  description: string; // 活动描述
  location: Location; // 活动地点
  startTime: string; // 开始时间
  endTime: string; // 结束时间
  cost: number; // 活动费用
  category: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'shopping' | 'leisure'; // 活动类别
  matchedInterests?: string[]; // 匹配的兴趣偏好，可选
  recommendationReason?: string; // 推荐理由，可选
  intelligentScore?: number; // 智能评分，可选
  tips?: string[]; // 实用建议，可选
  isLocked?: boolean; // 是否被用户锁定保留，可选
}

// 地理位置的类型定义
export interface Location {
  id?: string; // 位置唯一标识符，可选
  name: string; // 位置名称
  address: string; // 详细地址
  coordinates: [number, number]; // 经纬度坐标 [经度, 纬度]
  type?: 'attraction' | 'hotel' | 'restaurant' | 'transport' | 'shopping'; // 位置类型，可选
  description?: string; // 位置描述，可选
  images?: string[]; // 位置图片数组，可选
  rating?: number; // 评分，可选
}

// 完整行程的类型定义
export interface Itinerary {
  id: string; // 行程唯一标识符
  userId?: string; // 创建用户ID，可选
  title: string; // 行程标题
  destination: string; // 目的地
  totalBudget: number; // 总预算
  days: DayPlan[]; // 每日计划数组
  isPublic?: boolean; // 是否公开，可选
  collaborators?: string[]; // 协作者ID数组，可选
  data?: any; // 额外的行程数据，用于存储AI生成的详细信息
  transportation?: {
    type: string;
    cost: number;
    details: any;
  }; // 交通信息，可选
  actualExpense?: {
    total: number;
    breakdown: {
      accommodation: number;
      food: number;
      activity: number;
      transportation?: number;
    };
  }; // 实际花费，可选
  budgetComparison?: {
    plannedBudget: number;
    actualExpense: number;
    difference: number;
    isOverBudget: boolean;
    utilizationRate: number;
  }; // 预算对比，可选
  createdAt: string | Date; // 创建时间
  updatedAt: string | Date; // 更新时间
}

// 预算分析数据的类型定义
export interface BudgetData {
  categories: BudgetCategory[]; // 预算分类数组
  total: number; // 总预算
  currency: string; // 货币单位
}

// 预算分类的类型定义
export interface BudgetCategory {
  name: string; // 分类名称
  amount: number; // 分类金额
  percentage: number; // 占总预算的百分比
  color: string; // 图表显示颜色
}

// 时间分配数据的类型定义
export interface TimeData {
  categories: TimeCategory[]; // 时间分类数组
  totalHours: number; // 总时间（小时）
}

// 时间分类的类型定义
export interface TimeCategory {
  name: string; // 分类名称
  hours: number; // 时间（小时）
  percentage: number; // 占总时间的百分比
  color: string; // 图表显示颜色
}

// WebSocket消息的类型定义
export interface SocketMessage {
  id: string; // 消息唯一标识符
  type: 'join' | 'leave' | 'edit' | 'delete' | 'add'; // 消息类型
  userId: string; // 发送用户ID
  data: any; // 消息数据，使用any类型因为数据结构可能变化
  timestamp: Date; // 消息时间戳
}

// 协作变更的类型定义
export interface CollaborationChange {
  id: string; // 变更唯一标识符
  userId: string; // 操作用户ID
  type: 'add' | 'edit' | 'delete'; // 操作类型
  target: string; // 操作目标（如活动ID）
  data: any; // 变更数据
  timestamp: Date; // 变更时间戳
}

// API响应的通用类型定义
export interface ApiResponse<T> {
  success: boolean; // 请求是否成功
  data?: T; // 响应数据，可选
  message?: string; // 响应消息，可选
  error?: string; // 错误信息，可选
}

// 推荐内容的类型定义
export interface Recommendation {
  id: string; // 推荐内容唯一标识符
  type: 'destination' | 'activity' | 'itinerary'; // 推荐类型
  title: string; // 推荐标题
  description: string; // 推荐描述
  score: number; // 推荐评分
  reason: string; // 推荐理由
  data: any; // 推荐的具体数据
}

// 地图路线的类型定义
export interface MapRoute {
  id: string; // 路线唯一标识符
  coordinates: number[][]; // 路线坐标点数组
  distance: number; // 路线距离（米）
  duration: number; // 预计时间（秒）
  type: 'walking' | 'driving' | 'transit'; // 交通方式
}

// 错误日志的类型定义
export interface ErrorLog {
  id: string; // 错误唯一标识符
  level: 'error' | 'warn' | 'info'; // 错误级别
  message: string; // 错误消息
  stack?: string; // 错误堆栈，可选
  userId?: string; // 相关用户ID，可选
  timestamp: Date; // 错误时间戳
  context: any; // 错误上下文信息
}