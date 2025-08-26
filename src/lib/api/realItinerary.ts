import { searchAmapPOI } from "./amap";
import { IntelligentRecommendationSystem } from "./intelligentRecommendation";
import { searchTrainTickets } from "./train";
import type { Itinerary, DayPlan, Activity } from "@/types";

function genId(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 10);
}

export async function generateRealItinerary({
  departure,
  destination,
  date,
  days,
  interests,
  lockedActivities = [],
  budget = 2000,
  existingItinerary,
}: {
  departure: string;
  destination: string;
  date: string;
  days: number;
  interests: string[];
  lockedActivities?: string[];
  budget?: number;
  existingItinerary?: Itinerary;
}): Promise<Itinerary | { error: string }> {
  console.log("🚀 开始生成真实行程，参数:", {
    departure,
    destination,
    date,
    days,
    interests,
    lockedActivities,
    budget
  });
  
  // 验证兴趣偏好数据
  if (!interests || interests.length === 0) {
    console.warn("⚠️ 警告：没有提供兴趣偏好，推荐可能不够个性化");
  } else {
    console.log("✅ 用户兴趣偏好:", interests.join(", "));
  }

  try {
    // 创建智能推荐系统实例
    const recommendationSystem = new IntelligentRecommendationSystem();

    // 预加载城市热门数据
    const cityAttractions = await recommendationSystem.getCityHotspots(destination);
    const cityRestaurants = await recommendationSystem.getCityRestaurants(destination);

    console.log(`🔥 ${destination}热门景点: ${cityAttractions.length}个`);
    console.log(`🍜 ${destination}特色餐厅: ${cityRestaurants.length}个`);

    // 1. 获取真实火车票信息
    let trainList = [];
    try {
      trainList = await searchTrainTickets({
        start: departure,
        end: destination,
        date,
      });
      console.log("获取火车票信息成功:", trainList.length, "条记录");
    } catch (error) {
      console.warn("获取火车票信息失败，使用模拟数据:", error);
      trainList = [
        {
          trainNo: "G1234",
          startStation: departure || "北京",
          endStation: destination,
          startTime: "08:00",
          endTime: "10:30",
          duration: "2小时30分",
          price: [{ seat: "二等座", price: 120 }],
          seatTypes: "一等座,二等座",
        },
      ];
    }

    // 预算智能分配
    const totalBudget = budget || 2000;
    const dailyBudget = Math.floor(totalBudget / days);
    const hotelBudget = Math.floor(dailyBudget * 0.35);
    const foodBudget = Math.floor(dailyBudget * 0.3);
    const activityBudget = Math.floor(dailyBudget * 0.35);

    // 获取住宿POI
    let hotelPOIs = await searchAmapPOI({
      city: destination,
      keywords: "酒店",
      offset: 20,
    });
    const uniqueHotels = Array.from(
      new Map(hotelPOIs.map((p) => [p.name, p])).values()
    );

    let filteredHotels: any[] = uniqueHotels.length > 0 ? uniqueHotels : [
      {
        id: genId("hotel_"),
        name: `${destination}酒店`,
        address: `${destination}市中心`,
        price: hotelBudget,
      }
    ];

    // 生成每日行程
    const itineraryDays: DayPlan[] = [];
    const usedHotelIds = new Set<string>();

    for (let i = 0; i < days; i++) {
      let dayActivities: Activity[] = [];

      // 1. 住宿安排
      const availableHotels = filteredHotels.filter(h => !usedHotelIds.has(h.id || h.name));
      const hotel = availableHotels.length > 0 ? availableHotels[0] : filteredHotels[i % filteredHotels.length];

      dayActivities.push({
        id: hotel.id || genId("hotel_"),
        name: hotel.name,
        description: hotel.address || "酒店",
        location: {
          name: hotel.name,
          address: hotel.address || "",
          coordinates: [116.4074 + Math.random() * 0.1, 39.9042 + Math.random() * 0.1],
          type: "hotel",
          description: hotel.type || "酒店",
        },
        startTime: "20:00",
        endTime: "次日08:00",
        cost: Number(hotel.price) || Number(hotelBudget),
        category: "hotel",
        matchedInterests: ["住宿"],
        tips: [`推荐住宿，参考价¥${hotel.price || hotelBudget}`],
        isLocked: false,
      });

      usedHotelIds.add(hotel.id || hotel.name);

      // 2. 时间安排
      const timeSchedule = [
        { time: "09:00", endTime: "11:30", type: "上午主要景点", category: "attraction" },
        { time: "12:00", endTime: "13:30", type: "午餐", category: "restaurant" },
        { time: "14:00", endTime: "16:00", type: "下午景点", category: "attraction" },
        { time: "16:30", endTime: "17:30", type: "休闲时光", category: "leisure" },
        { time: "18:00", endTime: "19:30", type: "晚餐", category: "restaurant" },
      ];

      for (const schedule of timeSchedule) {
        const hasLocked = dayActivities.some(
          act => act.startTime === schedule.time && act.category === schedule.category
        );
        if (hasLocked) continue;

        if (schedule.category === "attraction") {
          const attraction = await recommendationSystem.getRecommendedAttractionEnhanced(cityAttractions, destination, interests);
          if (attraction) {
            const activityType = attraction.isNearby ? "周边景点" :
              attraction.isLeisure ? "休闲活动" : "热门景点";

            dayActivities.push({
              id: attraction.id || genId("attr_"),
              name: attraction.name,
              description: attraction.address || attraction.description || activityType,
              location: {
                name: attraction.name,
                address: attraction.address || "",
                coordinates: attraction.location && attraction.location.includes(",")
                  ? attraction.location.split(",").map(Number)
                  : [116.4074 + Math.random() * 0.1, 39.9042 + Math.random() * 0.1],
                type: "景点",
                description: attraction.type || "景点",
              },
              startTime: schedule.time,
              endTime: schedule.endTime,
              cost: Number(attraction.price) || Number(attraction.cost) || Math.floor(Number(activityBudget) / 3),
              category: "attraction",
              matchedInterests: getMatchedInterests(attraction.name, interests),
              recommendationReason: `${activityType} (${attraction.intelligentScore}分)`,
              intelligentScore: attraction.intelligentScore,
              tips: attraction.tips || [`${schedule.type} - ${activityType}`],
              isLocked: false,
            });
          }
        } else if (schedule.category === "restaurant") {
          const restaurant = recommendationSystem.getRecommendedRestaurant(cityRestaurants, interests);
          if (restaurant) {
            dayActivities.push({
              id: restaurant.id || genId("rest_"),
              name: restaurant.name,
              description: restaurant.address || "本地特色餐厅",
              location: {
                name: restaurant.name,
                address: restaurant.address || "",
                coordinates: restaurant.location && restaurant.location.includes(",")
                  ? restaurant.location.split(",").map(Number)
                  : [116.4074 + Math.random() * 0.1, 39.9042 + Math.random() * 0.1],
                type: "餐厅",
                description: "本地特色餐厅",
              },
              startTime: schedule.time,
              endTime: schedule.endTime,
              cost: Number(restaurant.price) || Math.floor(Number(foodBudget) / 2),
              category: "restaurant",
              matchedInterests: ["美食体验"],
              recommendationReason: `本地特色 (${restaurant.intelligentScore}分)`,
              intelligentScore: restaurant.intelligentScore,
              tips: [`${schedule.type} - 本地推荐`],
              isLocked: false,
            });
          }
        } else if (schedule.category === "leisure") {
          const leisureActivities = await recommendationSystem.getLeisureActivities(destination);
          const leisure = recommendationSystem.getRecommendedAttraction(leisureActivities, interests);

          if (leisure) {
            dayActivities.push({
              id: leisure.id || genId("leisure_"),
              name: leisure.name,
              description: leisure.address || "休闲活动",
              location: {
                name: leisure.name,
                address: leisure.address || "",
                coordinates: leisure.location && leisure.location.includes(",")
                  ? leisure.location.split(",").map(Number)
                  : [116.4074 + Math.random() * 0.1, 39.9042 + Math.random() * 0.1],
                type: "休闲",
                description: leisure.type || "休闲活动",
              },
              startTime: schedule.time,
              endTime: schedule.endTime,
              cost: Number(leisure.price) || 20,
              category: "leisure",
              matchedInterests: ["休闲体验"],
              recommendationReason: `休闲时光 (${leisure.intelligentScore}分)`,
              intelligentScore: leisure.intelligentScore,
              tips: [`${schedule.type} - 放松身心`],
              isLocked: false,
            });
          } else {
            const freeActivity = recommendationSystem.generateFreeTimeActivity(destination, schedule.time);
            dayActivities.push({
              id: freeActivity.id,
              name: freeActivity.name,
              description: freeActivity.description,
              location: {
                name: freeActivity.name,
                address: freeActivity.address,
                coordinates: [116.4074 + Math.random() * 0.1, 39.9042 + Math.random() * 0.1],
                type: "自由活动",
                description: freeActivity.type,
              },
              startTime: schedule.time,
              endTime: schedule.endTime,
              cost: Number(freeActivity.cost) || 0,
              category: "leisure",
              matchedInterests: ["自由探索"],
              recommendationReason: `自由活动 (${freeActivity.intelligentScore}分)`,
              intelligentScore: freeActivity.intelligentScore,
              tips: freeActivity.tips,
              isLocked: false,
            });
          }
        }
      }

      // 按时间排序活动
      dayActivities.sort((a, b) => {
        const timeA = a.startTime.replace(":", "");
        const timeB = b.startTime.replace(":", "");
        return timeA.localeCompare(timeB);
      });

      itineraryDays.push({
        day: i + 1,
        date: new Date(Date.parse(date) + i * 86400000)
          .toISOString()
          .split("T")[0],
        activities: dayActivities,
        totalBudget: dayActivities.reduce(
          (sum, act) => sum + (act.cost || 0),
          0
        ),
      });
    }

    const totalSpent = itineraryDays.reduce(
      (sum, day) => sum + day.totalBudget,
      0
    );

    // 计算实际花费分类 - 确保数字格式正确
    const actualAccommodation = Math.round(itineraryDays.reduce((sum, day) =>
      sum + day.activities.filter(act => act.category === "hotel").reduce((s, act) => s + (Number(act.cost) || 0), 0), 0
    ));
    const actualFood = Math.round(itineraryDays.reduce((sum, day) =>
      sum + day.activities.filter(act => act.category === "restaurant").reduce((s, act) => s + (Number(act.cost) || 0), 0), 0
    ));
    const actualActivity = Math.round(itineraryDays.reduce((sum, day) =>
      sum + day.activities.filter(act => act.category === "attraction" || act.category === "leisure").reduce((s, act) => s + (Number(act.cost) || 0), 0), 0
    ));
    const transportationCost = Number(trainList[0]?.price?.[0]?.price) || 100;

    const now = new Date();
    const itinerary: Itinerary = {
      id: genId("itinerary_"),
      title: `${destination}${days}日游 - ${interests.join("、")}之旅`,
      destination,
      totalBudget: totalBudget, // 使用正确的预算值
      days: itineraryDays,
      transportation: {
        type: "火车",
        cost: transportationCost,
        details: trainList[0] || {},
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      actualExpense: {
        total: Math.round(Number(totalSpent) + Number(transportationCost)),
        breakdown: {
          accommodation: actualAccommodation,
          food: actualFood,
          activity: actualActivity,
          transportation: transportationCost,
        },
      },
      // 添加预算对比信息 - 确保数字计算正确
      budgetComparison: {
        plannedBudget: Number(totalBudget),
        actualExpense: Math.round(Number(totalSpent) + Number(transportationCost)),
        difference: Math.round(Number(totalBudget) - (Number(totalSpent) + Number(transportationCost))),
        isOverBudget: (Number(totalSpent) + Number(transportationCost)) > Number(totalBudget),
        utilizationRate: Math.round(((Number(totalSpent) + Number(transportationCost)) / Number(totalBudget)) * 100),
      },
    };

    console.log("成功生成智能推荐行程:", itinerary.title);
    return itinerary;
  } catch (error) {
    console.error("生成真实行程失败:", error);
    return { error: "生成行程失败，请稍后重试" };
  }
}

// 获取匹配的兴趣偏好
function getMatchedInterests(poiName: string, interests: string[]): string[] {
  const matched: string[] = [];

  for (const interest of interests) {
    if (interest === '历史文化' && (poiName.includes('博物馆') || poiName.includes('文化') || poiName.includes('历史') || poiName.includes('古'))) {
      matched.push(interest);
    } else if (interest === '自然风光' && (poiName.includes('公园') || poiName.includes('山') || poiName.includes('湖') || poiName.includes('园'))) {
      matched.push(interest);
    } else if (interest === '美食体验' && (poiName.includes('餐') || poiName.includes('食') || poiName.includes('厅') || poiName.includes('楼'))) {
      matched.push(interest);
    } else if (interest === '购物娱乐' && (poiName.includes('商') || poiName.includes('购物') || poiName.includes('万达') || poiName.includes('银泰'))) {
      matched.push(interest);
    } else if (interest === '艺术博物馆' && (poiName.includes('艺术') || poiName.includes('博物馆') || poiName.includes('美术'))) {
      matched.push(interest);
    } else if (interest === '户外运动' && (poiName.includes('运动') || poiName.includes('体育') || poiName.includes('健身'))) {
      matched.push(interest);
    } else if (interest === '夜生活' && (poiName.includes('酒吧') || poiName.includes('KTV') || poiName.includes('夜市'))) {
      matched.push(interest);
    } else if (interest === '摄影' && (poiName.includes('摄影') || poiName.includes('观景') || poiName.includes('风景'))) {
      matched.push(interest);
    }
  }

  return matched;
}
