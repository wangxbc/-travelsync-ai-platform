// 修复版本的OpenAI API调用函数
import OpenAI from "openai";
import type { TravelInput, Itinerary } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 真实的12306票价数据库
const REAL_TRAIN_PRICES: Record<string, Record<string, number>> = {
  北京: {
    上海: 156.5,
    杭州: 180.5,
    西安: 174.5,
    邯郸: 43.5,
    郑州: 88.5,
    广州: 309,
    深圳: 324,
    天津: 24.5,
    济南: 65,
    南京: 134.5,
  },
  上海: {
    北京: 156.5,
    杭州: 17.5,
    西安: 236.5,
    邯郸: 154.5,
    郑州: 134.5,
    广州: 156.5,
    深圳: 168.5,
    南京: 44.5,
    苏州: 14.5,
  },
  杭州: {
    北京: 180.5,
    上海: 17.5,
    西安: 219,
    邯郸: 137,
    郑州: 117,
    广州: 139,
    深圳: 151,
    南京: 27,
  },
  西安: {
    北京: 174.5,
    上海: 236.5,
    杭州: 219,
    邯郸: 88.5,
    郑州: 65.5,
    广州: 263,
    深圳: 275,
    兰州: 89.5,
  },
  邯郸: {
    北京: 43.5,
    上海: 154.5,
    杭州: 137,
    西安: 88.5,
    郑州: 40.5,
    广州: 263,
    深圳: 275,
    石家庄: 12.5,
    天津: 31.5,
  },
};

// 计算真实交通费用
function calculateRealTransportationCost(
  departure?: string,
  destination?: string
) {
  if (!departure || !destination) {
    return { roundTripCost: 0, oneWayCost: 0, transportType: "未指定出发地" };
  }

  const price =
    REAL_TRAIN_PRICES[departure]?.[destination] ||
    REAL_TRAIN_PRICES[destination]?.[departure] ||
    200;

  return {
    oneWayCost: price,
    roundTripCost: price * 2,
    transportType: "火车",
    details: {
      train: `火车: ¥${price}`,
      flight: null,
      bus: `大巴: ¥${Math.round(price * 0.8)}`,
    },
  };
}

// 生成每日活动（支持锁定和去重）
function generateDayActivities(
  day: number,
  destinationData: any,
  dailyBudget: number,
  interests: string[],
  lockedActivities: string[] = [],
  existingDayData?: any,
  usedActivities: Set<string> = new Set()
) {
  console.log(`生成第${day}天活动，预算:${dailyBudget}, 兴趣:`, interests);

  const activities = [];
  let currentBudget = dailyBudget;

  // 如果有锁定的活动，先保留它们
  if (existingDayData?.activities && lockedActivities.length > 0) {
    for (const activity of existingDayData.activities) {
      if (lockedActivities.includes(activity.id)) {
        activities.push(activity);
        currentBudget -= activity.cost || 0;
        usedActivities.add(activity.name);
      }
    }
  }

  // 智能兴趣-时间段匹配
  function matchInterestToSlot(interest, slotType) {
    if (interest === "美食体验" && slotType === "restaurant") return true;
    if (
      (interest === "历史文化" ||
        interest === "自然风光" ||
        interest === "艺术博物馆") &&
      slotType === "attraction"
    )
      return true;
    if (interest === "购物娱乐" && slotType === "attraction") return true;
    if (interest === "夜生活" && slotType === "restaurant") return true;
    return false;
  }

  const timeSlots = [
    { label: "上午", start: "09:00", end: "11:00", type: "attraction" },
    { label: "午餐", start: "11:30", end: "13:00", type: "restaurant" },
    { label: "下午", start: "13:30", end: "17:00", type: "attraction" },
    { label: "晚上", start: "18:00", end: "20:00", type: "restaurant" },
  ];

  // 标记每个兴趣是否已分配
  const interestAssigned = {};
  interests.forEach((i) => (interestAssigned[i] = false));

  // 1. 先处理锁定活动（existingDayData.activities + lockedActivities）
  const lockedSlotIndexes = new Set();
  if (existingDayData?.activities && lockedActivities.length > 0) {
    for (let i = 0; i < existingDayData.activities.length; i++) {
      const act = existingDayData.activities[i];
      if (lockedActivities.includes(act.id)) {
        activities[i] = {
          ...act,
          startTime: timeSlots[i]?.start || act.startTime,
          endTime: timeSlots[i]?.end || act.endTime,
          matchedInterest: act.matchedInterest || null,
        };
        lockedSlotIndexes.add(i);
        for (const interest of interests) {
          if (act.name && act.name.includes(interest)) {
            interestAssigned[interest] = true;
          }
        }
        usedActivities.add(act.name);
      }
    }
  }

  // 2. 剩余时间段循环分配兴趣，优先兴趣相关活动
  let interestIdx = 0;
  for (let i = 0; i < timeSlots.length; i++) {
    if (lockedSlotIndexes.has(i)) continue;
    const slot = timeSlots[i];
    let activity = null;
    let matchedInterest = null;
    let triedInterests = 0;
    // 循环分配兴趣，直到找到可用活动或所有兴趣都试过
    while (triedInterests < interests.length) {
      const interest = interests[interestIdx % interests.length];
      const candidates =
        generateActivitiesByInterests(
          [interest],
          destinationData,
          currentBudget,
          usedActivities
        ) || [];
      activity = candidates.find(
        (a) =>
          a.category === slot.type &&
          !usedActivities.has(a.name) &&
          matchInterestToSlot(interest, slot.type)
      );
      if (activity) {
        matchedInterest = interest;
        break;
      }
      interestIdx++;
      triedInterests++;
    }
    // 没有兴趣相关就补充同类活动
    if (!activity) {
      if (slot.type === "attraction") {
        activity = (destinationData.attractions || []).find(
          (a) => !usedActivities.has(a.name)
        );
      } else if (slot.type === "restaurant") {
        activity = (destinationData.restaurants || []).find(
          (r) => !usedActivities.has(r.name)
        );
      }
    }
    // 还没有就兜底
    if (!activity) {
      activity = {
        name: "自由活动",
        description: "暂无推荐活动，请自由安排。",
        cost: 0,
        category: slot.type,
      };
    }
    activities[i] = {
      ...activity,
      id: `${day}-${i}`,
      startTime: slot.start,
      endTime: slot.end,
      matchedInterest: matchedInterest,
    };
    usedActivities.add(activity.name);
    interestIdx++;
  }
  return activities;
}

// 根据兴趣偏好生成活动
function generateActivitiesByInterests(
  interests: string[],
  destinationData: any,
  budget: number,
  usedActivities: Set<string>
) {
  const activities = [];
  const availableAttractions = destinationData.attractions || [];
  const availableRestaurants = destinationData.restaurants || [];

  console.log(
    "生成活动，兴趣:",
    interests,
    "可用景点:",
    availableAttractions.length,
    "可用餐厅:",
    availableRestaurants.length
  );

  // 如果没有选择兴趣，默认推荐一些活动
  if (interests.length === 0) {
    interests = ["历史文化", "美食体验"];
  }

  for (const interest of interests) {
    let activity = null;

    switch (interest) {
      case "历史文化":
        activity = availableAttractions.find(
          (a) =>
            !usedActivities.has(a.name) &&
            (a.name.includes("博物") ||
              a.name.includes("古") ||
              a.name.includes("文化") ||
              a.name.includes("宫") ||
              a.name.includes("石窟"))
        );
        if (!activity) {
          activity = availableAttractions.find(
            (a) => !usedActivities.has(a.name)
          );
        }
        break;

      case "自然风光":
        activity = availableAttractions.find(
          (a) =>
            !usedActivities.has(a.name) &&
            (a.name.includes("公园") ||
              a.name.includes("山") ||
              a.name.includes("湖") ||
              a.name.includes("园"))
        );
        if (!activity) {
          activity = availableAttractions.find(
            (a) => !usedActivities.has(a.name)
          );
        }
        break;

      case "美食体验":
        activity = availableRestaurants.find(
          (r) => !usedActivities.has(r.name)
        );
        break;

      case "购物娱乐":
      case "购物":
        activity = availableAttractions.find(
          (a) => !usedActivities.has(a.name) && a.category === "shopping"
        );
        if (!activity) {
          activity = {
            name: `${
              destinationData.attractions[0]?.name.replace(
                /博物馆|公园|古城/,
                ""
              ) || "当地"
            }购物中心`,
            description: "当地特色商品购物，包括纪念品、特产等",
            cost: Math.min(200, budget * 0.2),
            category: "shopping",
            location: {
              name: "购物中心",
              address: "商业区",
              coordinates: destinationData.coordinates,
            },
          };
        }
        break;

      default:
        // 其他兴趣，随机选择一个未使用的景点
        activity = availableAttractions.find(
          (a) => !usedActivities.has(a.name)
        );
        break;
    }

    if (activity && !usedActivities.has(activity.name)) {
      activities.push({
        ...activity,
        matchedInterests: [interest],
        interestType: interest,
        location: activity.location || {
          name: activity.name,
          address: `${activity.name}地址`,
          coordinates: destinationData.coordinates,
        },
      });
      console.log("添加活动:", activity.name, "匹配兴趣:", interest);
    }
  }

  // 如果活动不够，补充一些基础活动
  while (activities.length < 3 && availableAttractions.length > 0) {
    const remainingAttractions = availableAttractions.filter(
      (a) => !usedActivities.has(a.name)
    );
    if (remainingAttractions.length === 0) break;

    const activity = remainingAttractions[0];
    activities.push({
      ...activity,
      matchedInterests: ["推荐"],
      interestType: "推荐",
      location: activity.location || {
        name: activity.name,
        address: `${activity.name}地址`,
        coordinates: destinationData.coordinates,
      },
    });
    usedActivities.add(activity.name);
  }

  console.log("最终生成活动数量:", activities.length);
  return activities;
}

// 获取时间段
function getTimeSlot(index: number): string {
  const times = ["09:00", "11:00", "14:00", "16:00", "18:00"];
  return times[index] || "19:00";
}

// 智能生成行程（修复版）
function generateMockItinerary(input: TravelInput): Itinerary {
  console.log("生成修复版行程，输入:", input);

  // 计算真实交通费用
  const transportationCost = calculateRealTransportationCost(
    input.departure,
    input.destination
  );

  // 获取目的地数据
  const destinationData = getDestinationData(input.destination);

  const mockDays = [];
  const dailyBudget = Math.floor(input.budget / input.days);
  const usedActivities = new Set<string>(); // 全局去重

  for (let i = 1; i <= input.days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i - 1);

    const dayActivities = generateDayActivities(
      i,
      destinationData,
      dailyBudget,
      input.interests,
      input.lockedActivities,
      input.existingItinerary?.data?.days?.[i - 1],
      usedActivities
    );

    mockDays.push({
      day: i,
      date: date.toISOString().split("T")[0],
      theme: `第${i}天 - ${input.interests[0] || "精彩"}体验`,
      activities: dayActivities,
      totalCost: dayActivities.reduce((sum, act) => sum + (act.cost || 0), 0),
      transportation:
        i === 1
          ? `抵达${input.destination}，建议${transportationCost.transportType}`
          : "市内交通",
    });
  }

  const totalActualCost =
    mockDays.reduce((sum, day) => sum + day.totalCost, 0) +
    transportationCost.roundTripCost;

  return {
    id: "",
    userId: "",
    title: `${input.destination}${input.days}日精品游`,
    destination: input.destination,
    totalBudget: input.budget,
    days: mockDays,
    isPublic: false,
    data: {
      title: `${input.destination}${input.days}日精品游`,
      destination: input.destination,
      departure: input.departure,
      totalBudget: input.budget,
      days: mockDays,
      transportationCost: transportationCost,
      actualExpense: {
        total: totalActualCost,
        breakdown: {
          transportation: transportationCost.roundTripCost,
          activities: totalActualCost - transportationCost.roundTripCost,
          accommodation: Math.floor(input.budget * 0.4),
          food: Math.floor(input.budget * 0.3),
        },
      },
      budgetBreakdown: {
        accommodation: Math.floor(input.budget * 0.4),
        food: Math.floor(input.budget * 0.3),
        attractions: Math.floor(input.budget * 0.2),
        transportation: transportationCost.roundTripCost,
        shopping: Math.floor(input.budget * 0.1),
      },
      tips: [
        `🚄 交通费用：${transportationCost.details}`,
        `💰 预算分析：总预算¥${input.budget}，实际需要¥${totalActualCost}`,
        totalActualCost <= input.budget
          ? "✅ 预算充足，可以安心出行"
          : "⚠️ 预算略紧，建议适当调整",
        "🔒 点击活动旁的锁定按钮可保留喜欢的安排",
        "🔄 重新生成时会保持锁定的活动不变",
      ],
      originalInput: input,
      generatedAt: new Date().toISOString(),
      isMockData: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// 获取目的地数据
function getDestinationData(destination: string) {
  const destinations: Record<string, any> = {
    邯郸: {
      coordinates: [114.4775, 36.6025],
      attractions: [
        {
          name: "邯郸博物馆",
          cost: 0,
          description: "展示邯郸历史文化的综合性博物馆",
          category: "attraction",
          tags: ["历史文化", "艺术博物馆"],
        },
        {
          name: "广府古城",
          cost: 65,
          description: "明清古城，太极拳发源地",
          category: "attraction",
          tags: ["历史文化", "自然风光"],
        },
        {
          name: "娲皇宫",
          cost: 60,
          description: "中国最大的女娲祭祀地",
          category: "attraction",
          tags: ["历史文化"],
        },
        {
          name: "响堂山石窟",
          cost: 50,
          description: "北齐时期石窟艺术宝库",
          category: "attraction",
          tags: ["历史文化", "艺术博物馆"],
        },
        {
          name: "学步桥",
          cost: 0,
          description: "邯郸学步典故发生地",
          category: "attraction",
          tags: ["历史文化"],
        },
        {
          name: "邯郸购物中心",
          cost: 0,
          description: "当地特色商品购物",
          category: "shopping",
          tags: ["购物娱乐"],
        },
        {
          name: "丛台公园",
          cost: 10,
          description: "市区大型综合性公园，适合散步和观景",
          category: "attraction",
          tags: ["自然风光"],
        },
        {
          name: "赵苑公园",
          cost: 5,
          description: "以赵文化为主题的休闲公园",
          category: "attraction",
          tags: ["自然风光", "历史文化"],
        },
        {
          name: "梦湖夜市",
          cost: 0,
          description: "夜晚美食、娱乐、购物一体的夜市",
          category: "attraction",
          tags: ["夜生活", "美食体验", "购物娱乐"],
        },
        {
          name: "新世纪广场",
          cost: 0,
          description: "大型城市广场，夜景灯光秀",
          category: "attraction",
          tags: ["夜生活", "购物娱乐"],
        },
      ],
      restaurants: [
        {
          name: "邯郸老槐树烧饼",
          cost: 30,
          description: "邯郸特色小吃，酥脆香甜",
          category: "restaurant",
          tags: ["美食体验"],
        },
        {
          name: "永年驴肉火烧",
          cost: 25,
          description: "河北名小吃，肉质鲜美",
          category: "restaurant",
          tags: ["美食体验"],
        },
        {
          name: "魏县鸭梨",
          cost: 20,
          description: "当地特产水果，清甜多汁",
          category: "restaurant",
          tags: ["美食体验"],
        },
        {
          name: "夜色酒吧",
          cost: 80,
          description: "本地知名夜生活场所，适合夜晚休闲",
          category: "restaurant",
          tags: ["夜生活"],
        },
        {
          name: "邯郸火锅城",
          cost: 60,
          description: "本地人气火锅，适合聚餐",
          category: "restaurant",
          tags: ["美食体验", "夜生活"],
        },
        {
          name: "新世纪美食广场",
          cost: 40,
          description: "多种小吃和餐饮，适合购物娱乐后用餐",
          category: "restaurant",
          tags: ["美食体验", "购物娱乐"],
        },
      ],
    },
    北京: {
      coordinates: [116.4074, 39.9042],
      attractions: [
        {
          name: "故宫博物院",
          cost: 60,
          description: "明清皇宫，世界文化遗产",
          category: "attraction",
        },
        {
          name: "天坛公园",
          cost: 35,
          description: "皇帝祭天场所，古建筑杰作",
          category: "attraction",
        },
        {
          name: "颐和园",
          cost: 50,
          description: "皇家园林，中国古典园林艺术",
          category: "attraction",
        },
        {
          name: "八达岭长城",
          cost: 45,
          description: "万里长城精华段",
          category: "attraction",
        },
        {
          name: "北海公园",
          cost: 25,
          description: "皇家园林，自然风光优美",
          category: "attraction",
        },
      ],
      restaurants: [
        {
          name: "全聚德烤鸭",
          cost: 200,
          description: "百年老字号北京烤鸭",
          category: "restaurant",
        },
        {
          name: "护国寺小吃",
          cost: 50,
          description: "地道北京小吃",
          category: "restaurant",
        },
      ],
    },
    上海: {
      coordinates: [121.4737, 31.2304],
      attractions: [
        {
          name: "外滩",
          cost: 0,
          description: "上海标志性景观",
          category: "attraction",
        },
        {
          name: "东方明珠",
          cost: 220,
          description: "上海地标建筑",
          category: "attraction",
        },
        {
          name: "豫园",
          cost: 40,
          description: "明代私人花园",
          category: "attraction",
        },
        {
          name: "南京路步行街",
          cost: 0,
          description: "购物天堂",
          category: "shopping",
        },
        {
          name: "上海博物馆",
          cost: 0,
          description: "中国古代艺术博物馆",
          category: "attraction",
        },
      ],
      restaurants: [
        {
          name: "小南国",
          cost: 180,
          description: "精致本帮菜",
          category: "restaurant",
        },
        {
          name: "南翔馒头店",
          cost: 80,
          description: "百年小笼包",
          category: "restaurant",
        },
      ],
    },
  };

  return (
    destinations[destination] || {
      coordinates: [116.4074, 39.9042],
      attractions: [
        {
          name: `${destination}博物馆`,
          cost: 30,
          description: "了解当地历史文化",
          category: "attraction",
        },
        {
          name: `${destination}公园`,
          cost: 15,
          description: "自然风光优美",
          category: "attraction",
        },
        {
          name: `${destination}古街`,
          cost: 0,
          description: "传统文化街区",
          category: "attraction",
        },
        {
          name: `${destination}购物中心`,
          cost: 0,
          description: "当地特色商品购物",
          category: "shopping",
        },
      ],
      restaurants: [
        {
          name: `${destination}特色餐厅`,
          cost: 100,
          description: "当地特色美食",
          category: "restaurant",
        },
      ],
    }
  );
}

// 主要的生成函数
export async function generateItinerary(
  input: TravelInput
): Promise<Itinerary | null> {
  try {
    console.log("开始生成修复版行程规划，输入参数:", input);

    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "sk-your-openai-api-key-here"
    ) {
      console.log("使用修复版模拟AI响应");
      return generateMockItinerary(input);
    }

    // 这里可以添加真实的OpenAI API调用
    // 暂时使用修复版模拟数据
    return generateMockItinerary(input);
  } catch (error) {
    console.error("生成行程规划失败:", error);
    return generateMockItinerary(input);
  }
}

export async function* generateItineraryStream(
  input: TravelInput
): AsyncGenerator<string, void, unknown> {
  yield JSON.stringify(generateMockItinerary(input));
}

export async function optimizeItinerary(
  itinerary: Itinerary,
  feedback: string
): Promise<Itinerary | null> {
  return itinerary; // 简单返回原行程
}
