// 这个文件包含OpenAI API的调用函数
// 作为应届生，我会把AI相关的功能都封装在这里

import OpenAI from "openai";
import type { TravelInput, Itinerary } from "@/types";

// 创建OpenAI客户端实例
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 从环境变量获取API密钥
});

// 计算交通费用的函数
function calculateTransportationCost(departure?: string, destination?: string) {
  if (!departure || !destination) {
    return { roundTripCost: 0, oneWayCost: 0, transportType: "未指定出发地" };
  }

  // 真实的交通费用数据库（基于12306实际票价，硬座/二等座价格）
  const transportationData: Record<string, Record<string, any>> = {
    北京: {
      上海: { train: 156.5, flight: 800, bus: 280 },
      杭州: { train: 180.5, flight: 650, bus: 220 },
      西安: { train: 174.5, flight: 550, bus: 180 },
      邯郸: { train: 43.5, flight: 0, bus: 65 },
      郑州: { train: 88.5, flight: 450, bus: 120 },
      广州: { train: 309, flight: 900, bus: 450 },
      深圳: { train: 324, flight: 950, bus: 480 },
      天津: { train: 24.5, flight: 0, bus: 45 },
      济南: { train: 65, flight: 400, bus: 120 },
      南京: { train: 134.5, flight: 650, bus: 250 },
    },
    上海: {
      北京: { train: 156.5, flight: 800, bus: 280 },
      杭州: { train: 17.5, flight: 0, bus: 45 },
      西安: { train: 236.5, flight: 650, bus: 320 },
      邯郸: { train: 154.5, flight: 0, bus: 200 },
      郑州: { train: 134.5, flight: 550, bus: 180 },
      广州: { train: 156.5, flight: 600, bus: 280 },
      深圳: { train: 168.5, flight: 650, bus: 300 },
      南京: { train: 44.5, flight: 0, bus: 80 },
      苏州: { train: 14.5, flight: 0, bus: 25 },
    },
    杭州: {
      北京: { train: 180.5, flight: 650, bus: 220 },
      上海: { train: 17.5, flight: 0, bus: 45 },
      西安: { train: 219, flight: 600, bus: 280 },
      邯郸: { train: 137, flight: 0, bus: 180 },
      郑州: { train: 117, flight: 500, bus: 150 },
      广州: { train: 139, flight: 550, bus: 250 },
      深圳: { train: 151, flight: 600, bus: 280 },
      南京: { train: 27, flight: 0, bus: 40 },
    },
    西安: {
      北京: { train: 174.5, flight: 550, bus: 180 },
      上海: { train: 236.5, flight: 650, bus: 320 },
      杭州: { train: 219, flight: 600, bus: 280 },
      邯郸: { train: 88.5, flight: 0, bus: 120 },
      郑州: { train: 65.5, flight: 400, bus: 100 },
      广州: { train: 263, flight: 750, bus: 380 },
      深圳: { train: 275, flight: 800, bus: 400 },
      兰州: { train: 89.5, flight: 450, bus: 150 },
    },
    邯郸: {
      北京: { train: 43.5, flight: 0, bus: 65 },
      上海: { train: 154.5, flight: 0, bus: 200 },
      杭州: { train: 137, flight: 0, bus: 180 },
      西安: { train: 88.5, flight: 0, bus: 120 },
      郑州: { train: 40.5, flight: 0, bus: 35 },
      广州: { train: 263, flight: 0, bus: 320 },
      深圳: { train: 275, flight: 0, bus: 350 },
      石家庄: { train: 12.5, flight: 0, bus: 20 },
      天津: { train: 31.5, flight: 0, bus: 50 },
    },
    郑州: {
      北京: { train: 88.5, flight: 450, bus: 120 },
      上海: { train: 134.5, flight: 550, bus: 180 },
      杭州: { train: 117, flight: 500, bus: 150 },
      西安: { train: 65.5, flight: 400, bus: 100 },
      邯郸: { train: 40.5, flight: 0, bus: 35 },
      广州: { train: 198.5, flight: 650, bus: 280 },
      深圳: { train: 210.5, flight: 700, bus: 300 },
      武汉: { train: 78.5, flight: 400, bus: 100 },
      洛阳: { train: 15.5, flight: 0, bus: 25 },
    },
    广州: {
      北京: { train: 309, flight: 900, bus: 450 },
      上海: { train: 156.5, flight: 600, bus: 280 },
      杭州: { train: 139, flight: 550, bus: 250 },
      西安: { train: 263, flight: 750, bus: 380 },
      郑州: { train: 198.5, flight: 650, bus: 280 },
      深圳: { train: 15, flight: 0, bus: 50 },
      武汉: { train: 156.5, flight: 550, bus: 250 },
    },
    深圳: {
      北京: { train: 324, flight: 950, bus: 480 },
      上海: { train: 168.5, flight: 650, bus: 300 },
      杭州: { train: 151, flight: 600, bus: 280 },
      西安: { train: 275, flight: 800, bus: 400 },
      郑州: { train: 210.5, flight: 700, bus: 300 },
      广州: { train: 15, flight: 0, bus: 50 },
    },
  };

  // 查找交通费用
  const departureData = transportationData[departure];
  if (!departureData || !departureData[destination]) {
    // 如果没有具体数据，根据距离估算
    const estimatedCost = estimateTransportationCost(departure, destination);
    return estimatedCost;
  }

  const routes = departureData[destination];

  // 选择最经济的交通方式
  let bestOption = { type: "train", cost: routes.train };

  if (routes.flight > 0 && routes.flight < bestOption.cost) {
    bestOption = { type: "flight", cost: routes.flight };
  }
  if (routes.bus > 0 && routes.bus < bestOption.cost) {
    bestOption = { type: "bus", cost: routes.bus };
  }

  return {
    oneWayCost: bestOption.cost,
    roundTripCost: bestOption.cost * 2,
    transportType:
      bestOption.type === "train"
        ? "火车"
        : bestOption.type === "flight"
        ? "飞机"
        : "大巴",
    details: {
      train: routes.train > 0 ? `火车: ¥${routes.train}` : null,
      flight: routes.flight > 0 ? `飞机: ¥${routes.flight}` : null,
      bus: routes.bus > 0 ? `大巴: ¥${routes.bus}` : null,
    },
  };
}

// 估算交通费用（当没有具体数据时）
function estimateTransportationCost(departure: string, destination: string) {
  // 简单的距离估算逻辑
  const baseCost = 200; // 基础费用
  const randomFactor = Math.random() * 100 + 50; // 50-150的随机因子

  return {
    oneWayCost: Math.round(baseCost + randomFactor),
    roundTripCost: Math.round((baseCost + randomFactor) * 2),
    transportType: "火车",
    details: {
      train: `火车: ¥${Math.round(baseCost + randomFactor)}`,
      flight: null,
      bus: `大巴: ¥${Math.round(baseCost + randomFactor - 50)}`,
    },
  };
}

// 生成兴趣偏好指导的函数
function generateInterestGuidelines(interests: string[]): string {
  const guidelines: string[] = [];

  interests.forEach((interest) => {
    switch (interest) {
      case "历史文化":
        guidelines.push(
          "- 历史文化：必须安排至少2-3个历史景点、博物馆、古建筑或文化遗址参观，包括详细的历史背景介绍"
        );
        break;
      case "自然风光":
        guidelines.push(
          "- 自然风光：必须安排公园、山水景区、自然保护区等自然景观，包括最佳观赏时间和拍照地点"
        );
        break;
      case "美食体验":
        guidelines.push(
          "- 美食体验：必须安排当地特色餐厅、小吃街、美食市场，推荐必尝菜品和用餐时间"
        );
        break;
      case "购物娱乐":
      case "购物":
        guidelines.push(
          "- 购物：必须安排专门的购物时间和地点，包括商业街、购物中心、特色市场，推荐当地特产和纪念品，预留充足的购物时间（至少2-3小时）"
        );
        break;
      case "艺术博物":
        guidelines.push(
          "- 艺术博物：必须安排艺术馆、博物馆、画廊参观，包括展览信息和艺术作品介绍"
        );
        break;
      case "户外活动":
        guidelines.push(
          "- 户外活动：必须安排徒步、登山、骑行等户外运动项目，包括装备建议和安全提示"
        );
        break;
      case "夜生活":
        guidelines.push(
          "- 夜生活：必须安排夜市、酒吧街、夜景观赏等夜间活动，包括营业时间和交通安排"
        );
        break;
      default:
        guidelines.push(
          `- ${interest}：必须安排与${interest}相关的专门活动和景点`
        );
    }
  });

  if (guidelines.length === 0) {
    return "请根据常规旅游需求安排行程。";
  }

  return (
    guidelines.join("\n") +
    "\n\n**重要提醒：每个兴趣偏好都必须在行程中有对应的活动，分配要均衡，不能偏重某一个而忽略其他。**"
  );
}

// AI提示词模板
const TRAVEL_PLANNING_PROMPT = `
你是一个专业的旅行规划助手。请根据用户提供的信息，生成一个详细的旅行行程计划。

用户信息：
- 目的地：{destination}
- 预算：{budget} 元
- 天数：{days} 天
- 兴趣偏好：{interests}
- 旅行风格：{travelStyle}

**重要：兴趣偏好平衡要求**
用户选择了以下兴趣偏好：{interests}
请确保每个兴趣偏好都在行程中得到充分体现，分配比例要均衡：

{interestGuidelines}

请按照以下JSON格式返回行程计划：

{
  "title": "行程标题",
  "destination": "目的地",
  "totalBudget": 预算数字,
  "days": [
    {
      "day": 1,
      "date": "2024-03-01",
      "theme": "当天主题",
      "activities": [
        {
          "name": "活动名称",
          "description": "活动描述",
          "startTime": "09:00",
          "endTime": "11:00",
          "location": {
            "name": "地点名称",
            "address": "详细地址",
            "coordinates": [经度, 纬度]
          },
          "cost": 费用数字,
          "category": "attraction/restaurant/hotel/transport/shopping",
          "interestType": "对应的兴趣偏好类型",
          "tips": ["实用建议1", "实用建议2"]
        }
      ],
      "totalCost": 当天总费用,
      "transportation": "交通建议"
    }
  ],
  "budgetBreakdown": {
    "accommodation": 住宿费用,
    "food": 餐饮费用,
    "attractions": 景点费用,
    "transportation": 交通费用,
    "shopping": 购物费用,
    "other": 其他费用
  },
  "tips": ["总体建议1", "总体建议2"],
  "bestTime": "最佳旅行时间",
  "weather": "天气情况"
}

请确保：
1. 行程安排合理，时间不冲突
2. 预算分配合理，不超过总预算
3. 考虑交通时间和距离
4. **每个选择的兴趣偏好都必须在行程中有对应的活动安排，不能遗漏任何一个**
5. **如果用户选择了"购物"，必须安排专门的购物时间和地点，包括当地特色商品推荐**
6. **如果用户选择了"历史文化"，必须安排历史景点、博物馆、文化体验等活动**
7. 提供实用的旅行建议
8. 所有地点都要有准确的坐标信息
9. 每个活动都要标注对应的兴趣类型(interestType字段)
`;

// 生成旅行行程的函数
export async function generateItinerary(
  input: TravelInput
): Promise<Itinerary | null> {
  try {
    console.log("开始生成AI行程规划，输入参数:", input);

    // 检查是否有有效的API密钥
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY === "sk-your-openai-api-key-here"
    ) {
      console.log("使用模拟AI响应（未配置真实API密钥）");
      return generateMockItinerary(input);
    }

    // 构建兴趣偏好指导
    const interestGuidelines = generateInterestGuidelines(input.interests);

    // 构建提示词
    const prompt = TRAVEL_PLANNING_PROMPT.replace(
      "{destination}",
      input.destination
    )
      .replace("{budget}", input.budget.toString())
      .replace("{days}", input.days.toString())
      .replace("{interests}", input.interests.join(", "))
      .replace("{interestGuidelines}", interestGuidelines)
      .replace(
        "{travelStyle}",
        input.travelStyle === "budget"
          ? "经济型"
          : input.travelStyle === "comfort"
          ? "舒适型"
          : "豪华型"
      );

    // 调用OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // 使用GPT-4模型
      messages: [
        {
          role: "system",
          content:
            "你是一个专业的旅行规划助手，擅长制定详细的旅行计划。请始终返回有效的JSON格式。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7, // 设置创造性程度
      max_tokens: 4000, // 最大token数
    });

    // 获取AI响应
    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      console.error("AI没有返回有效响应");
      return null;
    }

    console.log("AI原始响应:", aiResponse);

    // 解析JSON响应
    let parsedResponse;
    try {
      // 尝试提取JSON部分（有时AI会返回额外的文本）
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("解析AI响应JSON失败:", parseError);
      console.error("原始响应:", aiResponse);
      return null;
    }

    // 构建标准的Itinerary对象
    const itinerary: Itinerary = {
      id: "", // 这里会在保存到数据库时生成
      userId: "", // 这里会在API路由中设置
      title: parsedResponse.title || `${input.destination}${input.days}日游`,
      destination: input.destination,
      totalBudget: input.budget,
      days: parsedResponse.days || [],
      isPublic: false,
      data: {
        ...parsedResponse,
        originalInput: input, // 保存原始输入
        generatedAt: new Date().toISOString(), // 生成时间
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("成功生成行程规划:", itinerary.title);
    return itinerary;
  } catch (error) {
    console.error("生成行程规划失败:", error);

    // 如果是API配额或网络错误，返回更具体的错误信息
    if (error instanceof Error) {
      if (error.message.includes("quota")) {
        console.error("OpenAI API配额不足");
      } else if (error.message.includes("network")) {
        console.error("网络连接错误");
      }
    }

    // 如果真实API失败，回退到模拟响应
    console.log("回退到模拟AI响应");
    return generateMockItinerary(input);
  }
}

// 流式生成旅行行程的函数（用于实时显示生成过程）
export async function* generateItineraryStream(
  input: TravelInput
): AsyncGenerator<string, void, unknown> {
  try {
    console.log("开始流式生成AI行程规划");

    // 构建兴趣偏好指导
    const interestGuidelines = generateInterestGuidelines(input.interests);

    // 构建提示词
    const prompt = TRAVEL_PLANNING_PROMPT.replace(
      "{destination}",
      input.destination
    )
      .replace("{budget}", input.budget.toString())
      .replace("{days}", input.days.toString())
      .replace("{interests}", input.interests.join(", "))
      .replace("{interestGuidelines}", interestGuidelines)
      .replace(
        "{travelStyle}",
        input.travelStyle === "budget"
          ? "经济型"
          : input.travelStyle === "comfort"
          ? "舒适型"
          : "豪华型"
      );

    // 调用OpenAI流式API
    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "你是一个专业的旅行规划助手，擅长制定详细的旅行计划。请始终返回有效的JSON格式。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      stream: true, // 启用流式响应
    });

    // 逐步返回生成的内容
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("流式生成行程规划失败:", error);
    yield `错误：生成行程规划时出现问题 - ${
      error instanceof Error ? error.message : "未知错误"
    }`;
  }
}

// 优化现有行程的函数
export async function optimizeItinerary(
  itinerary: Itinerary,
  feedback: string
): Promise<Itinerary | null> {
  try {
    console.log("开始优化行程规划，反馈:", feedback);

    // 构建优化提示词
    const optimizePrompt = `
请根据用户反馈优化以下旅行行程：

原始行程：
${JSON.stringify(itinerary.data, null, 2)}

用户反馈：
${feedback}

请返回优化后的完整行程JSON，保持原有格式，但根据反馈进行调整。
特别注意：
1. 保持预算控制在合理范围内
2. 确保时间安排合理
3. 考虑用户的具体需求
4. 保持地点坐标的准确性
`;

    // 调用OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "你是一个专业的旅行规划助手，擅长根据用户反馈优化旅行计划。",
        },
        {
          role: "user",
          content: optimizePrompt,
        },
      ],
      temperature: 0.5, // 降低创造性，更注重准确性
      max_tokens: 4000,
    });

    // 获取AI响应
    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      console.error("AI优化没有返回有效响应");
      return null;
    }

    // 解析JSON响应
    let parsedResponse;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("解析AI优化响应JSON失败:", parseError);
      return null;
    }

    // 更新行程数据
    const optimizedItinerary: Itinerary = {
      ...itinerary,
      data: {
        ...parsedResponse,
        originalInput: itinerary.data.originalInput,
        generatedAt: itinerary.data.generatedAt,
        optimizedAt: new Date().toISOString(),
        optimizationFeedback: feedback,
      },
      updatedAt: new Date(),
    };

    console.log("成功优化行程规划");
    return optimizedItinerary;
  } catch (error) {
    console.error("优化行程规划失败:", error);
    return null;
  }
}

// 智能生成行程的函数（支持任意目的地）
function generateMockItinerary(input: TravelInput): Itinerary {
  console.log(
    "智能生成行程数据，目的地:",
    input.destination,
    "兴趣偏好:",
    input.interests,
    "出发地:",
    input.departure
  );

  // 计算交通费用
  const transportationCost = calculateTransportationCost(
    input.departure,
    input.destination
  );

  // 预算合理性检查
  const budgetCheck = checkBudgetReasonability(
    input.destination,
    input.budget,
    input.days
  );

  // 使用智能推荐系统
  const isRegeneration = !!(input.existingItinerary && input.lockedActivities);
  const destinationData = getSmartDestinationData(
    input.destination,
    input.interests,
    input.budget,
    input.days,
    isRegeneration
  );
  const mockDays = [];
  const dailyBudget = Math.floor(input.budget / input.days);

  for (let i = 1; i <= input.days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i - 1);

    mockDays.push({
      day: i,
      date: date.toISOString().split("T")[0],
      theme:
        i === 1
          ? "抵达与探索"
          : i === input.days
          ? "告别之旅"
          : `深度体验第${i}天`,
      activities: generateDayActivities(
        i,
        destinationData,
        dailyBudget,
        input.interests,
        input.lockedActivities,
        input.existingItinerary?.data?.days?.[i - 1], // 传递对应天的现有数据
        isRegeneration // 传递重新生成标志
      ),
      totalBudget: dailyBudget,
      transportation: generateSmartTransportation(
        i,
        dailyBudget,
        input.budget,
        input.days
      ),
    });
  }

  // 根据预算自动调整旅游风格
  const autoTravelStyle =
    budgetCheck.level === "insufficient"
      ? "budget"
      : budgetCheck.level === "budget"
      ? "budget"
      : budgetCheck.level === "comfort"
      ? "comfort"
      : "luxury";

  const mockItinerary: Itinerary = {
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
      budgetBreakdown: generateSmartBudgetBreakdown(
        input.budget,
        input.interests,
        transportationCost
      ),
      actualExpense: calculateActualExpense(mockDays, transportationCost),
      transportationCost: transportationCost,
      tips: [
        `${input.destination}是一个充满魅力的目的地`,
        input.departure
          ? `🚄 从${input.departure}到${input.destination}，推荐${transportationCost.transportType}出行，往返费用约¥${transportationCost.roundTripCost}`
          : "",
        budgetCheck.isReasonable
          ? `💰 根据您的预算，系统已自动调整为${
              autoTravelStyle === "budget"
                ? "经济型"
                : autoTravelStyle === "comfort"
                ? "舒适型"
                : "豪华型"
            }旅行风格`
          : `⚠️ 预算不足警告：建议调整预算或天数`,
        "建议提前预订热门景点门票",
        "尝试当地特色美食",
        "注意天气变化，准备合适衣物",
        "保持开放心态，享受旅行过程",
        ...budgetCheck.tips, // 添加预算相关建议
      ].filter((tip) => tip !== ""), // 过滤空字符串
      bestTime: "春秋两季",
      weather: "温和宜人",
      originalInput: { ...input, travelStyle: autoTravelStyle }, // 使用自动调整的旅游风格
      generatedAt: new Date().toISOString(),
      isMockData: true, // 标记为模拟数据
      budgetAnalysis: budgetCheck, // 添加预算分析结果
      summary: generateTripSummary(input, mockDays, transportationCost), // 添加行程总结
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return mockItinerary;
}

// 智能获取目的地数据（支持任意地点）
function getSmartDestinationData(
  destination: string,
  interests: string[],
  budget?: number,
  days?: number,
  isRegeneration: boolean = false
) {
  console.log(
    "获取目的地数据，兴趣偏好:",
    interests,
    "预算:",
    budget,
    "天数:",
    days
  );

  // 首先尝试从预设数据库获取
  const presetData = getPresetDestinationData(destination);
  if (presetData) {
    console.log("使用预设数据，但会根据兴趣和预算调整");
    // 即使有预设数据，也要根据兴趣偏好和预算进行调整
    return enhancePresetDataWithInterests(
      presetData,
      interests,
      budget,
      days,
      isRegeneration
    );
  }

  // 如果没有预设数据，使用智能生成
  console.log("使用智能生成数据");
  return generateSmartDestinationData(
    destination,
    interests,
    budget,
    days,
    isRegeneration
  );
}

// 根据兴趣偏好和预算增强预设数据
function enhancePresetDataWithInterests(
  presetData: any,
  interests: string[],
  budget?: number,
  days?: number,
  isRegeneration: boolean = false
) {
  const enhancedData = { ...presetData };

  // 根据兴趣偏好添加额外的景点
  const additionalAttractions = [];

  if (interests.includes("历史文化")) {
    additionalAttractions.push({
      name: `${presetData.attractions[0]?.name || "当地"}历史文化街区`,
      address: "历史文化保护区",
      coordinates: [
        presetData.coordinates[0] - 0.02,
        presetData.coordinates[1] + 0.01,
      ],
      cost: 25,
      description: "保存完好的历史文化街区，可以深入了解当地传统文化和历史变迁",
    });
  }

  if (interests.includes("自然风光")) {
    additionalAttractions.push({
      name: `${presetData.attractions[0]?.name || "当地"}生态公园`,
      address: "生态保护区",
      coordinates: [
        presetData.coordinates[0] + 0.03,
        presetData.coordinates[1] - 0.01,
      ],
      cost: 15,
      description: "自然生态环境优美，四季景色各异，是休闲放松的好去处",
    });
  }

  if (interests.includes("美食体验")) {
    additionalAttractions.push({
      name: `${presetData.attractions[0]?.name || "当地"}美食文化街`,
      address: "传统美食区",
      coordinates: [
        presetData.coordinates[0] - 0.01,
        presetData.coordinates[1] - 0.01,
      ],
      cost: 0,
      description: "汇集当地特色美食的文化街区，可以品尝到最地道的当地小吃",
    });
  }

  if (interests.includes("艺术博物")) {
    additionalAttractions.push({
      name: `${presetData.attractions[0]?.name || "当地"}艺术中心`,
      address: "文化艺术区",
      coordinates: [
        presetData.coordinates[0] - 0.015,
        presetData.coordinates[1] + 0.015,
      ],
      cost: 35,
      description: "当地重要的艺术展示空间，定期举办各类艺术展览和文化活动",
    });
  }

  // 将额外景点添加到原有景点中
  enhancedData.attractions = [
    ...presetData.attractions,
    ...additionalAttractions,
  ];

  // 根据预算调整酒店推荐
  if (budget && days) {
    enhancedData.hotels = generateSmartHotels(
      presetData.attractions[0]?.name || "当地",
      presetData.coordinates,
      budget,
      days
    );
  }

  return enhancedData;
}

// 预设目的地数据库
function getPresetDestinationData(destination: string) {
  const destinations: Record<string, any> = {
    北京: {
      coordinates: [116.4074, 39.9042],
      attractions: [
        {
          name: "天安门广场",
          address: "北京市东城区东长安街",
          coordinates: [116.3974, 39.9059],
          cost: 0,
          description: "中华人民共和国的象征，世界最大的城市广场",
        },
        {
          name: "故宫博物院",
          address: "北京市东城区景山前街4号",
          coordinates: [116.3972, 39.9163],
          cost: 60,
          description: "明清两朝的皇家宫殿，世界文化遗产",
        },
        {
          name: "天坛公园",
          address: "北京市东城区天坛路甲1号",
          coordinates: [116.4067, 39.8838],
          cost: 35,
          description: "明清皇帝祭天的场所，古代建筑杰作",
        },
        {
          name: "颐和园",
          address: "北京市海淀区新建宫门路19号",
          coordinates: [116.2732, 39.996],
          cost: 50,
          description: "清朝皇家园林，中国古典园林艺术的巅峰",
        },
        {
          name: "八达岭长城",
          address: "北京市延庆区G6京藏高速58号出口",
          coordinates: [116.0188, 40.3591],
          cost: 45,
          description: "万里长城最著名的一段，世界文化遗产",
        },
      ],
      restaurants: [
        {
          name: "全聚德烤鸭店",
          address: "北京市东城区前门大街30号",
          coordinates: [116.3955, 39.8977],
          cost: 200,
          description: "百年老字号，正宗北京烤鸭",
        },
        {
          name: "东来顺饭庄",
          address: "北京市东城区王府井大街198号",
          coordinates: [116.4107, 39.9097],
          cost: 150,
          description: "涮羊肉鼻祖，清真老字号",
        },
        {
          name: "护国寺小吃",
          address: "北京市西城区护国寺街93号",
          coordinates: [116.3711, 39.9342],
          cost: 50,
          description: "地道北京小吃，豆汁焦圈",
        },
      ],
      hotels: [
        {
          name: "北京饭店",
          address: "北京市东城区东长安街33号",
          coordinates: [116.4109, 39.9097],
          cost: 800,
          description: "历史悠久的五星级酒店",
        },
        {
          name: "王府井希尔顿酒店",
          address: "北京市东城区王府井东街8号",
          coordinates: [116.4141, 39.9085],
          cost: 600,
          description: "位于王府井商业区的豪华酒店",
        },
      ],
    },
    上海: {
      coordinates: [121.4737, 31.2304],
      attractions: [
        {
          name: "外滩",
          address: "上海市黄浦区中山东一路",
          coordinates: [121.4906, 31.2397],
          cost: 0,
          description: "上海的标志性景观，万国建筑博览群",
        },
        {
          name: "东方明珠",
          address: "上海市浦东新区世纪大道1号",
          coordinates: [121.5067, 31.2397],
          cost: 220,
          description: "上海地标建筑，亚洲第一高塔",
        },
        {
          name: "豫园",
          address: "上海市黄浦区福佑路168号",
          coordinates: [121.4925, 31.227],
          cost: 40,
          description: "明代私人花园，江南古典园林",
        },
        {
          name: "南京路步行街",
          address: "上海市黄浦区南京东路",
          coordinates: [121.4759, 31.2354],
          cost: 0,
          description: "中华商业第一街，购物天堂",
        },
      ],
      restaurants: [
        {
          name: "小南国",
          address: "上海市黄浦区淮海中路333号",
          coordinates: [121.4692, 31.2238],
          cost: 180,
          description: "精致本帮菜，上海味道",
        },
        {
          name: "南翔馒头店",
          address: "上海市黄浦区豫园路85号",
          coordinates: [121.4925, 31.227],
          cost: 80,
          description: "百年小笼包，豫园老字号",
        },
      ],
      hotels: [
        {
          name: "和平饭店",
          address: "上海市黄浦区南京东路20号",
          coordinates: [121.4906, 31.2397],
          cost: 1200,
          description: "外滩标志性酒店，历史悠久",
        },
      ],
    },
    杭州: {
      coordinates: [120.1551, 30.2741],
      attractions: [
        {
          name: "西湖",
          address: "浙江省杭州市西湖区",
          coordinates: [120.1445, 30.2592],
          cost: 0,
          description: "人间天堂，世界文化遗产",
        },
        {
          name: "灵隐寺",
          address: "浙江省杭州市西湖区法云弄1号",
          coordinates: [120.1014, 30.2408],
          cost: 75,
          description: "江南著名古刹，佛教圣地",
        },
        {
          name: "雷峰塔",
          address: "浙江省杭州市西湖区南山路15号",
          coordinates: [120.1484, 30.2319],
          cost: 40,
          description: "西湖十景之一，白娘子传说地",
        },
      ],
      restaurants: [
        {
          name: "楼外楼",
          address: "浙江省杭州市西湖区孤山路30号",
          coordinates: [120.1445, 30.2592],
          cost: 200,
          description: "西湖醋鱼发源地，百年老店",
        },
        {
          name: "知味观",
          address: "浙江省杭州市上城区仁和路83号",
          coordinates: [120.1693, 30.2467],
          cost: 100,
          description: "杭州小吃老字号",
        },
      ],
      hotels: [
        {
          name: "西湖国宾馆",
          address: "浙江省杭州市西湖区杨公堤18号",
          coordinates: [120.1445, 30.2592],
          cost: 800,
          description: "西湖边的园林式酒店",
        },
      ],
    },
    邯郸: {
      coordinates: [114.4775, 36.6025],
      attractions: [
        {
          name: "邯郸博物馆",
          address: "河北省邯郸市邯山区中华南大街45号",
          coordinates: [114.4775, 36.6025],
          cost: 0,
          description: "展示邯郸历史文化的综合性博物馆",
        },
        {
          name: "广府古城",
          address: "河北省邯郸市永年区广府镇",
          coordinates: [114.8167, 36.7833],
          cost: 65,
          description: "明清古城，太极拳发源地",
        },
        {
          name: "娲皇宫",
          address: "河北省邯郸市涉县索堡镇",
          coordinates: [113.6833, 36.6167],
          cost: 60,
          description: "中国最大的女娲祭祀地",
        },
        {
          name: "响堂山石窟",
          address: "河北省邯郸市峰峰矿区",
          coordinates: [114.2167, 36.4167],
          cost: 50,
          description: "北齐时期石窟艺术宝库",
        },
        {
          name: "学步桥",
          address: "河北省邯郸市邯山区学步桥街",
          coordinates: [114.4775, 36.6025],
          cost: 0,
          description: "邯郸学步典故发生地",
        },
      ],
      restaurants: [
        {
          name: "邯郸老槐树烧饼",
          address: "河北省邯郸市丛台区人民路",
          coordinates: [114.4775, 36.6025],
          cost: 30,
          description: "邯郸特色小吃，酥脆香甜",
        },
        {
          name: "永年驴肉火烧",
          address: "河北省邯郸市永年区临洺关镇",
          coordinates: [114.8167, 36.7833],
          cost: 25,
          description: "河北名小吃，肉质鲜美",
        },
        {
          name: "魏县鸭梨",
          address: "河北省邯郸市魏县",
          coordinates: [114.9333, 36.3667],
          cost: 20,
          description: "当地特产水果，清甜多汁",
        },
      ],
      hotels: [
        {
          name: "邯郸宾馆",
          address: "河北省邯郸市丛台区人民东路",
          coordinates: [114.4775, 36.6025],
          cost: 300,
          description: "邯郸老牌酒店，服务周到",
        },
        {
          name: "如家酒店",
          address: "河北省邯郸市邯山区中华南大街",
          coordinates: [114.4775, 36.6025],
          cost: 200,
          description: "经济型连锁酒店，干净舒适",
        },
      ],
    },
    西安: {
      coordinates: [108.9402, 34.3416],
      attractions: [
        {
          name: "兵马俑",
          address: "陕西省西安市临潼区",
          coordinates: [109.2783, 34.3853],
          cost: 120,
          description: "世界第八大奇迹，秦始皇陵兵马俑",
        },
        {
          name: "大雁塔",
          address: "陕西省西安市雁塔区大慈恩寺内",
          coordinates: [108.9642, 34.2186],
          cost: 50,
          description: "唐代佛教建筑，玄奘译经地",
        },
        {
          name: "西安城墙",
          address: "陕西省西安市中心区",
          coordinates: [108.9402, 34.3416],
          cost: 54,
          description: "中国现存最完整的古代城垣建筑",
        },
        {
          name: "华清宫",
          address: "陕西省西安市临潼区华清路38号",
          coordinates: [109.2117, 34.3625],
          cost: 120,
          description: "唐代皇家温泉行宫",
        },
      ],
      restaurants: [
        {
          name: "德发长饺子馆",
          address: "陕西省西安市碑林区钟楼",
          coordinates: [108.9402, 34.3416],
          cost: 80,
          description: "西安老字号，饺子宴闻名",
        },
        {
          name: "回民街小吃",
          address: "陕西省西安市莲湖区北院门",
          coordinates: [108.9402, 34.3416],
          cost: 50,
          description: "西安特色小吃聚集地",
        },
      ],
      hotels: [
        {
          name: "西安索菲特酒店",
          address: "陕西省西安市雁塔区大雁塔南广场",
          coordinates: [108.9642, 34.2186],
          cost: 800,
          description: "五星级酒店，大雁塔旁",
        },
      ],
    },
  };

  // 先查找完全匹配的城市
  if (destinations[destination]) {
    return destinations[destination];
  }

  // 如果没有完全匹配，尝试模糊匹配
  const fuzzyMatch = Object.keys(destinations).find(
    (city) => destination.includes(city) || city.includes(destination)
  );

  if (fuzzyMatch) {
    return destinations[fuzzyMatch];
  }

  // 如果都没有匹配，返回null让智能生成接管
  return null;
}

// 智能生成目的地数据（基于地名、兴趣和预算）
function generateSmartDestinationData(
  destination: string,
  interests: string[],
  budget?: number,
  days?: number,
  isRegeneration: boolean = false
) {
  // 智能推测坐标（基于地名特征）
  const coordinates = estimateCoordinates(destination);

  // 根据兴趣生成景点
  const attractions = generateSmartAttractions(
    destination,
    interests,
    coordinates,
    isRegeneration
  );

  // 生成餐厅推荐
  const restaurants = generateSmartRestaurants(destination, coordinates);

  // 根据预算生成酒店推荐
  const hotels = generateSmartHotels(destination, coordinates, budget, days);

  return {
    coordinates,
    attractions,
    restaurants,
    hotels,
  };
}

// 智能推测坐标
function estimateCoordinates(destination: string): [number, number] {
  // 基于地名特征推测大概位置
  const locationHints: Record<string, [number, number]> = {
    // 直辖市
    北京: [116.4074, 39.9042],
    上海: [121.4737, 31.2304],
    天津: [117.1901, 39.1084],
    重庆: [106.5516, 29.563],

    // 省会城市
    广州: [113.2644, 23.1291],
    深圳: [114.0579, 22.5431],
    杭州: [120.1551, 30.2741],
    南京: [118.7969, 32.0603],
    武汉: [114.2734, 30.5801],
    成都: [104.0665, 30.5723],
    西安: [108.9402, 34.3416],
    郑州: [113.6254, 34.7466],
    济南: [117.0009, 36.6758],
    沈阳: [123.4315, 41.8057],
    长春: [125.3245, 43.8868],
    哈尔滨: [126.5358, 45.8023],
    石家庄: [114.5149, 38.0428],
    太原: [112.5489, 37.8706],
    呼和浩特: [111.7519, 40.8427],
    兰州: [103.8236, 36.0581],
    西宁: [101.7782, 36.6171],
    银川: [106.2309, 38.4872],
    乌鲁木齐: [87.6177, 43.7928],
    拉萨: [91.1409, 29.6456],
    昆明: [102.8329, 24.8801],
    贵阳: [106.7135, 26.5783],
    南宁: [108.3669, 22.817],
    海口: [110.3312, 20.0311],
    福州: [119.2965, 26.0745],
    南昌: [115.8921, 28.6765],
    长沙: [112.9388, 28.2282],
    合肥: [117.2272, 31.8206],
  };

  // 精确匹配
  for (const [city, coords] of Object.entries(locationHints)) {
    if (destination.includes(city)) {
      return coords;
    }
  }

  // 地区特征推测
  if (destination.includes("新疆") || destination.includes("乌鲁木齐")) {
    return [87.6177, 43.7928];
  }
  if (destination.includes("西藏") || destination.includes("拉萨")) {
    return [91.1409, 29.6456];
  }
  if (destination.includes("内蒙") || destination.includes("呼和浩特")) {
    return [111.7519, 40.8427];
  }
  if (destination.includes("广东") || destination.includes("广州")) {
    return [113.2644, 23.1291];
  }
  if (destination.includes("浙江") || destination.includes("杭州")) {
    return [120.1551, 30.2741];
  }
  if (destination.includes("江苏") || destination.includes("南京")) {
    return [118.7969, 32.0603];
  }
  if (destination.includes("山东") || destination.includes("济南")) {
    return [117.0009, 36.6758];
  }
  if (destination.includes("河北") || destination.includes("石家庄")) {
    return [114.5149, 38.0428];
  }
  if (destination.includes("河南") || destination.includes("郑州")) {
    return [113.6254, 34.7466];
  }
  if (destination.includes("湖北") || destination.includes("武汉")) {
    return [114.2734, 30.5801];
  }
  if (destination.includes("湖南") || destination.includes("长沙")) {
    return [112.9388, 28.2282];
  }
  if (destination.includes("四川") || destination.includes("成都")) {
    return [104.0665, 30.5723];
  }
  if (destination.includes("陕西") || destination.includes("西安")) {
    return [108.9402, 34.3416];
  }

  // 默认坐标（中国中心）
  return [114.0, 35.0];
}

// 生成真实的主要景点
function generateRealMainAttraction(
  destination: string,
  coordinates: [number, number]
) {
  const mainAttractions: Record<string, any> = {
    北京: {
      name: "故宫博物院",
      address: "北京市东城区景山前街4号",
      coordinates: [116.3972, 39.9163],
      cost: 60,
      description:
        "明清两朝的皇家宫殿，世界文化遗产，是了解中国古代宫廷文化和建筑艺术的最佳场所。建议预留半天时间游览。",
    },
    上海: {
      name: "上海博物馆",
      address: "上海市黄浦区人民大道201号",
      coordinates: [121.4759, 31.2354],
      cost: 0,
      description:
        "中国古代艺术博物馆，收藏了大量珍贵的青铜器、陶瓷、书画等文物，是了解中华文明的重要窗口。",
    },
    杭州: {
      name: "西湖",
      address: "浙江省杭州市西湖区",
      coordinates: [120.1445, 30.2592],
      cost: 0,
      description:
        "人间天堂，世界文化遗产，以其秀丽的湖光山色和众多的名胜古迹闻名于世。可以乘船游湖或沿湖步行。",
    },
    西安: {
      name: "兵马俑博物馆",
      address: "陕西省西安市临潼区",
      coordinates: [109.2783, 34.3853],
      cost: 120,
      description:
        "世界第八大奇迹，秦始皇陵兵马俑，展现了古代中国的军事实力和工艺水平，是必看的历史文化景点。",
    },
    邯郸: {
      name: "邯郸博物馆",
      address: "河北省邯郸市邯山区中华南大街45号",
      coordinates: [114.4775, 36.6025],
      cost: 0,
      description:
        "展示邯郸历史文化的综合性博物馆，收藏了大量赵国文物和邯郸地区的历史文献，是了解邯郸历史的最佳场所。",
    },
  };

  // 先查找完全匹配
  if (mainAttractions[destination]) {
    return mainAttractions[destination];
  }

  // 模糊匹配
  const fuzzyMatch = Object.keys(mainAttractions).find(
    (city) => destination.includes(city) || city.includes(destination)
  );

  if (fuzzyMatch) {
    return mainAttractions[fuzzyMatch];
  }

  // 默认生成
  return {
    name: `${destination}博物馆`,
    address: `${destination}市文化中心区`,
    coordinates: [coordinates[0] + 0.01, coordinates[1] + 0.01],
    cost: 0,
    description: `${destination}历史文化的集中展示地，收藏丰富的文物古迹，是了解当地历史变迁和文化底蕴的最佳场所。建议游览时间2-3小时。`,
  };
}

// 生成真实的历史文化景点
function generateRealHistoricalPlaces(
  destination: string,
  coordinates: [number, number]
) {
  const historicalPlaces: Record<string, any[]> = {
    北京: [
      {
        name: "天坛公园",
        address: "北京市东城区天坛路甲1号",
        coordinates: [116.4067, 39.8838],
        cost: 35,
        description:
          "明清皇帝祭天的场所，古代建筑杰作，体现了中国古代天人合一的哲学思想。回音壁和祈年殿是必看景点。",
      },
      {
        name: "雍和宫",
        address: "北京市东城区雍和宫大街12号",
        coordinates: [116.4185, 39.9475],
        cost: 25,
        description:
          "清朝雍正皇帝的府邸，后改为藏传佛教寺庙。建筑精美，香火旺盛，是体验北京宗教文化的好地方。",
      },
    ],
    上海: [
      {
        name: "豫园",
        address: "上海市黄浦区福佑路168号",
        coordinates: [121.4925, 31.227],
        cost: 40,
        description:
          "明代私人花园，江南古典园林的代表作。园内亭台楼阁、假山池沼，体现了中国传统园林艺术的精髓。",
      },
      {
        name: "静安寺",
        address: "上海市静安区南京西路1686号",
        coordinates: [121.4458, 31.2252],
        cost: 30,
        description:
          "上海最古老的佛寺之一，有1700多年历史。金碧辉煌的建筑在现代都市中显得格外庄严。",
      },
    ],
    杭州: [
      {
        name: "灵隐寺",
        address: "浙江省杭州市西湖区法云弄1号",
        coordinates: [120.1014, 30.2408],
        cost: 75,
        description:
          "江南著名古刹，佛教圣地，有1600多年历史。飞来峰石窟造像和大雄宝殿是主要看点。",
      },
      {
        name: "岳王庙",
        address: "浙江省杭州市西湖区北山街80号",
        coordinates: [120.1445, 30.2592],
        cost: 25,
        description:
          "纪念南宋抗金名将岳飞的庙宇，体现了中华民族的爱国主义精神。庙内有岳飞墓和相关历史文物。",
      },
    ],
    西安: [
      {
        name: "大雁塔",
        address: "陕西省西安市雁塔区大慈恩寺内",
        coordinates: [108.9642, 34.2186],
        cost: 50,
        description:
          "唐代佛教建筑，玄奘译经地，是古都西安的标志性建筑。塔内保存了大量佛教文物和历史资料。",
      },
      {
        name: "西安城墙",
        address: "陕西省西安市中心区",
        coordinates: [108.9402, 34.3416],
        cost: 54,
        description:
          "中国现存最完整的古代城垣建筑，明代建造。可以骑自行车或步行游览，感受古都的历史厚重感。",
      },
    ],
    邯郸: [
      {
        name: "广府古城",
        address: "河北省邯郸市永年区广府镇",
        coordinates: [114.8167, 36.7833],
        cost: 65,
        description:
          "明清古城，太极拳发源地，保存完好的古城墙和传统建筑。可以观看太极拳表演，体验传统武术文化。",
      },
      {
        name: "娲皇宫",
        address: "河北省邯郸市涉县索堡镇",
        coordinates: [113.6833, 36.6167],
        cost: 60,
        description:
          "中国最大的女娲祭祀地，传说中女娲炼石补天的地方。石窟造像精美，是研究古代宗教文化的重要遗址。",
      },
    ],
  };

  // 先查找完全匹配
  if (historicalPlaces[destination]) {
    return historicalPlaces[destination];
  }

  // 模糊匹配
  const fuzzyMatch = Object.keys(historicalPlaces).find(
    (city) => destination.includes(city) || city.includes(destination)
  );

  if (fuzzyMatch) {
    return historicalPlaces[fuzzyMatch];
  }

  // 默认生成
  return [
    {
      name: `${destination}古城遗址`,
      address: `${destination}历史文化保护区`,
      coordinates: [coordinates[0] - 0.02, coordinates[1] + 0.01],
      cost: 35,
      description: `${destination}保存的古代城市遗址，见证了当地的历史变迁。可以了解古代城市规划和建筑特色。`,
    },
    {
      name: `${destination}文庙`,
      address: `${destination}老城区文教街`,
      coordinates: [coordinates[0] - 0.015, coordinates[1] + 0.02],
      cost: 25,
      description: `${destination}古代教育文化中心，建筑风格典雅，是了解当地教育历史和儒家文化的重要场所。`,
    },
  ];
}

// 生成真实的美食地点
function generateRealFoodPlaces(
  destination: string,
  coordinates: [number, number]
) {
  const foodPlaces: Record<string, any[]> = {
    北京: [
      {
        name: "王府井小吃街",
        address: "北京市东城区王府井大街",
        coordinates: [116.4107, 39.9097],
        cost: 0,
        description:
          "北京最著名的小吃街，有烤鸭、豆汁、炸酱面、糖葫芦等各种北京特色小吃。是体验老北京美食文化的最佳地点。",
      },
      {
        name: "簋街",
        address: "北京市东城区东直门内大街",
        coordinates: [116.4185, 39.9475],
        cost: 0,
        description:
          "北京著名的美食街，以麻辣小龙虾闻名，还有各种川菜、湘菜等。营业到深夜，是体验北京夜生活的好地方。",
      },
    ],
    上海: [
      {
        name: "城隍庙小吃",
        address: "上海市黄浦区豫园路",
        coordinates: [121.4925, 31.227],
        cost: 0,
        description:
          "上海传统小吃聚集地，有小笼包、生煎包、蟹壳黄等上海特色小吃。南翔馒头店的小笼包是必尝美食。",
      },
      {
        name: "田子坊美食街",
        address: "上海市黄浦区泰康路210弄",
        coordinates: [121.4692, 31.2108],
        cost: 0,
        description:
          "融合了传统与现代的美食区域，有各种创意餐厅、咖啡馆和特色小吃店。适合品尝精致的上海菜和国际美食。",
      },
    ],
    杭州: [
      {
        name: "河坊街美食区",
        address: "浙江省杭州市上城区河坊街",
        coordinates: [120.1693, 30.2467],
        cost: 0,
        description:
          "杭州最著名的美食街，有定胜糕、龙须糖、叫化鸡等杭州特色小吃。还可以品尝正宗的龙井茶。",
      },
      {
        name: "西湖醋鱼老店",
        address: "浙江省杭州市西湖区孤山路30号",
        coordinates: [120.1445, 30.2592],
        cost: 0,
        description:
          "品尝正宗西湖醋鱼的最佳地点，楼外楼等老字号餐厅就在西湖边，可以边用餐边欣赏西湖美景。",
      },
    ],
    西安: [
      {
        name: "回民街",
        address: "陕西省西安市莲湖区北院门",
        coordinates: [108.9402, 34.3416],
        cost: 0,
        description:
          "西安最著名的美食街，有肉夹馍、凉皮、羊肉泡馍、胡辣汤等陕西特色小吃。是体验西安美食文化的必去之地。",
      },
      {
        name: "永兴坊",
        address: "陕西省西安市新城区东新街中山门内",
        coordinates: [108.9642, 34.2686],
        cost: 0,
        description:
          "汇集了陕西各地特色美食的文化街区，有摔碗酒、毛笔酥等网红美食，是品尝陕西各地小吃的好地方。",
      },
    ],
    邯郸: [
      {
        name: "邯郸小吃街",
        address: "河北省邯郸市丛台区人民路",
        coordinates: [114.4775, 36.6025],
        cost: 0,
        description:
          "邯郸传统小吃聚集地，有邯郸烧饼、驴肉火烧、魏县鸭梨等当地特色美食。价格实惠，味道地道。",
      },
      {
        name: "永年驴肉火烧店",
        address: "河北省邯郸市永年区临洺关镇",
        coordinates: [114.8167, 36.7833],
        cost: 25,
        description:
          "品尝正宗永年驴肉火烧的最佳地点，肉质鲜美，火烧酥脆，是邯郸地区的特色美食代表。",
      },
    ],
  };

  // 先查找完全匹配
  if (foodPlaces[destination]) {
    return foodPlaces[destination];
  }

  // 模糊匹配
  const fuzzyMatch = Object.keys(foodPlaces).find(
    (city) => destination.includes(city) || city.includes(destination)
  );

  if (fuzzyMatch) {
    return foodPlaces[fuzzyMatch];
  }

  // 默认生成
  return [
    {
      name: `${destination}美食街`,
      address: `${destination}老城区美食集中地`,
      coordinates: [coordinates[0] - 0.01, coordinates[1] - 0.01],
      cost: 0,
      description: `${destination}最地道的美食聚集地，汇集了当地特色小吃和老字号餐厅。是体验当地饮食文化的必去之地。`,
    },
    {
      name: `${destination}农贸市场`,
      address: `${destination}市民生活区`,
      coordinates: [coordinates[0] - 0.008, coordinates[1] - 0.015],
      cost: 0,
      description: `${destination}最具生活气息的地方，可以看到最真实的当地生活。新鲜的时令蔬果、特色调料应有尽有。`,
    },
  ];
}

// 获取真实的购物地点（用于专门的购物活动）
function getRealShoppingLocation(
  destination: string,
  coordinates: [number, number]
) {
  const realShoppingLocations: Record<string, any> = {
    北京: {
      name: "王府井步行街",
      address: "北京市东城区王府井大街",
      coordinates: [116.4107, 39.9097],
      description:
        "北京最著名的商业街，有王府井百货、东方新天地等大型商场，以及各种老字号店铺。可以买到北京特产、传统工艺品和国际品牌商品。",
      tips: [
        "推荐购买：北京烤鸭、茯苓夹饼、景泰蓝工艺品",
        "王府井百货和东方新天地有国际品牌",
        "老字号店铺有传统工艺品和特产",
        "步行街上有各种小吃和纪念品摊位",
      ],
    },
    上海: {
      name: "南京路步行街",
      address: "上海市黄浦区南京东路",
      coordinates: [121.4759, 31.2354],
      description:
        "中华商业第一街，有第一百货、永安百货等老牌商场，以及各种上海老字号店铺。可以买到上海特产和传统商品。",
      tips: [
        "推荐购买：上海丝绸、白兔奶糖、梨膏糖",
        "第一百货有各种上海老字号商品",
        "永安百货有精品服装和化妆品",
        "可以买到正宗的上海小笼包礼盒",
      ],
    },
    杭州: {
      name: "河坊街",
      address: "浙江省杭州市上城区河坊街",
      coordinates: [120.1693, 30.2467],
      description:
        "杭州最著名的古街，有众多传统手工艺品店、茶叶店和特色小吃店。可以买到杭州丝绸、龙井茶、王星记扇子等特产。",
      tips: [
        "推荐购买：西湖龙井茶、杭州丝绸、王星记扇子",
        "有很多手工艺品店，可以买到精美的工艺品",
        "茶叶店可以品茶后再购买",
        "定胜糕、龙须糖等传统糕点值得一试",
      ],
    },
    西安: {
      name: "回民街",
      address: "陕西省西安市莲湖区北院门",
      coordinates: [108.9402, 34.3416],
      description:
        "西安最著名的美食和购物街，有众多特色小吃店和手工艺品店。可以买到陕西特产、手工艺品和品尝地道的西安小吃。",
      tips: [
        "推荐购买：陕西特产、兵马俑纪念品、剪纸工艺品",
        "有很多手工艺品店，价格可以适当砍价",
        "可以买到各种陕西特色食品作为伴手礼",
        "晚上灯火通明，夜景很美",
      ],
    },
    邯郸: {
      name: "新世纪商业广场",
      address: "河北省邯郸市丛台区人民东路",
      coordinates: [114.4775, 36.6025],
      description:
        "邯郸最大的购物中心，有各种品牌专卖店、超市和餐厅。可以买到日用品、服装和当地特产。",
      tips: [
        "推荐购买：邯郸特产、河北特色食品",
        "有大型超市，可以买到各种日用品",
        "品牌专卖店有服装、鞋帽等商品",
        "地下有美食广场，购物累了可以休息用餐",
      ],
    },
  };

  // 先查找完全匹配
  for (const [city, location] of Object.entries(realShoppingLocations)) {
    if (destination.includes(city)) {
      return location;
    }
  }

  // 默认返回
  return {
    name: `${destination}商业中心`,
    address: `${destination}市中心商业区`,
    coordinates: [coordinates[0] + 0.005, coordinates[1] - 0.005],
    description: `${destination}主要的购物区域，有各种商店和特产店，可以买到当地特色商品和纪念品。`,
    tips: ["推荐购买当地特产和手工艺品", "注意比较价格，选择性价比高的商品"],
  };
}

// 生成真实的购物地点
function generateRealShoppingPlaces(
  destination: string,
  coordinates: [number, number]
) {
  // 真实购物地点数据库
  const realShoppingPlaces: Record<string, any[]> = {
    北京: [
      {
        name: "王府井步行街",
        address: "北京市东城区王府井大街",
        coordinates: [116.4107, 39.9097],
        cost: 0,
        description:
          "北京最著名的商业街，有王府井百货、东方新天地、APM等大型商场，以及各种老字号店铺。可以买到北京特产、传统工艺品和国际品牌商品。",
      },
      {
        name: "西单商业区",
        address: "北京市西城区西单北大街",
        coordinates: [116.3668, 39.9059],
        cost: 0,
        description:
          "年轻人喜爱的购物天堂，有西单大悦城、君太百货等时尚商场。主要销售潮流服饰、数码产品和年轻人喜爱的商品。",
      },
      {
        name: "三里屯太古里",
        address: "北京市朝阳区三里屯路19号",
        coordinates: [116.4562, 39.9364],
        cost: 0,
        description:
          "北京最时尚的购物区域，汇集了众多国际品牌旗舰店、精品店和特色餐厅。是体验北京现代都市生活的最佳地点。",
      },
    ],
    上海: [
      {
        name: "南京路步行街",
        address: "上海市黄浦区南京东路",
        coordinates: [121.4759, 31.2354],
        cost: 0,
        description:
          "中华商业第一街，有第一百货、永安百货、新世界城等老牌商场，以及各种上海老字号店铺。可以买到上海特产和传统商品。",
      },
      {
        name: "淮海中路商业街",
        address: "上海市黄浦区淮海中路",
        coordinates: [121.4692, 31.2238],
        cost: 0,
        description:
          "上海最具国际化的商业街，有太平洋百货、香港广场等高端商场。主要销售国际品牌和时尚商品，是购物和休闲的好去处。",
      },
      {
        name: "田子坊",
        address: "上海市黄浦区泰康路210弄",
        coordinates: [121.4692, 31.2108],
        cost: 0,
        description:
          "上海最有特色的创意园区，有众多艺术工作室、手工艺品店和特色咖啡馆。可以买到独特的艺术品、手工制品和创意商品。",
      },
    ],
    杭州: [
      {
        name: "湖滨银泰in77",
        address: "浙江省杭州市上城区延安路353号",
        coordinates: [120.1693, 30.2467],
        cost: 0,
        description:
          "杭州最时尚的购物中心，紧邻西湖，有众多国际品牌和特色餐厅。购物之余还可以欣赏西湖美景。",
      },
      {
        name: "河坊街",
        address: "浙江省杭州市上城区河坊街",
        coordinates: [120.1693, 30.2467],
        cost: 0,
        description:
          "杭州最著名的古街，有众多传统手工艺品店、茶叶店和特色小吃店。可以买到杭州丝绸、龙井茶、王星记扇子等特产。",
      },
    ],
    西安: [
      {
        name: "回民街",
        address: "陕西省西安市莲湖区北院门",
        coordinates: [108.9402, 34.3416],
        cost: 0,
        description:
          "西安最著名的美食和购物街，有众多特色小吃店和手工艺品店。可以买到陕西特产、手工艺品和品尝地道的西安小吃。",
      },
      {
        name: "大雁塔北广场",
        address: "陕西省西安市雁塔区雁塔路",
        coordinates: [108.9642, 34.2186],
        cost: 0,
        description:
          "西安现代化的商业区，有大型购物中心和特色商店。可以买到现代商品和传统工艺品，还可以欣赏大雁塔的美景。",
      },
    ],
    邯郸: [
      {
        name: "新世纪商业广场",
        address: "河北省邯郸市丛台区人民东路",
        coordinates: [114.4775, 36.6025],
        cost: 0,
        description:
          "邯郸最大的购物中心，有各种品牌专卖店、超市和餐厅。可以买到日用品、服装和当地特产。",
      },
      {
        name: "邯郸万达广场",
        address: "河北省邯郸市丛台区人民东路与滏东大街交叉口",
        coordinates: [114.4775, 36.6025],
        cost: 0,
        description:
          "邯郸最现代化的购物中心，有万达影城、大型超市、品牌专卖店和美食广场。是年轻人购物娱乐的首选地。",
      },
      {
        name: "邯郸银座商城",
        address: "河北省邯郸市丛台区中华大街",
        coordinates: [114.4775, 36.6025],
        cost: 0,
        description:
          "邯郸知名购物中心，有众多品牌专卖店和特色餐厅。商品种类齐全，价格合理，是购物和休闲的好去处。",
      },
      {
        name: "邯郸美乐城",
        address: "河北省邯郸市邯山区中华南大街",
        coordinates: [114.4775, 36.6025],
        cost: 0,
        description:
          "邯郸大型综合性购物中心，有超市、服装店、电影院和餐厅。商品种类丰富，适合全家购物娱乐。",
      },
      {
        name: "邯郸古城商业街",
        address: "河北省邯郸市邯山区中华南大街",
        coordinates: [114.4775, 36.6025],
        cost: 0,
        description:
          "邯郸传统商业街区，有众多老字号店铺和特色商店。可以买到邯郸特产、传统手工艺品和地方小食。",
      },
      {
        name: "邯郸阳光百货",
        address: "河北省邯郸市丛台区人民东路",
        coordinates: [114.4775, 36.6025],
        cost: 0,
        description:
          "邯郸老牌百货商场，有各种服装、鞋帽、化妆品和家居用品。价格实惠，是当地人购物的主要场所。",
      },
    ],
  };

  // 先查找完全匹配的城市
  if (realShoppingPlaces[destination]) {
    return realShoppingPlaces[destination];
  }

  // 模糊匹配
  const fuzzyMatch = Object.keys(realShoppingPlaces).find(
    (city) => destination.includes(city) || city.includes(destination)
  );

  if (fuzzyMatch) {
    return realShoppingPlaces[fuzzyMatch];
  }

  // 如果没有匹配，生成通用的真实感购物地点
  return [
    {
      name: `${destination}万达广场`,
      address: `${destination}市中心商业区`,
      coordinates: [coordinates[0] + 0.01, coordinates[1] - 0.02],
      cost: 0,
      description: `${destination}最大的综合性购物中心，有超市、服装店、电影院、餐厅等。是当地人购物和娱乐的主要场所，商品种类齐全，价格合理。`,
    },
    {
      name: `${destination}老街`,
      address: `${destination}老城区传统街道`,
      coordinates: [coordinates[0] - 0.005, coordinates[1] - 0.01],
      cost: 0,
      description: `${destination}保存最完好的传统商业街，有众多老字号店铺和手工艺品店。可以买到当地特产、传统工艺品和特色小食，体验当地文化。`,
    },
    {
      name: `${destination}农贸市场`,
      address: `${destination}市区农贸批发市场`,
      coordinates: [coordinates[0] - 0.01, coordinates[1] + 0.005],
      cost: 0,
      description: `${destination}最大的农贸市场，有新鲜的当地农产品、特色食材和手工制品。价格实惠，可以体验当地人的生活方式，建议带现金。`,
    },
  ];
}

// 智能生成景点（基于兴趣偏好的详细推荐）
function generateSmartAttractions(
  destination: string,
  interests: string[],
  coordinates: [number, number],
  isRegeneration: boolean = false
) {
  const attractions = [];

  // 基础必游景点 - 使用真实地名
  const mainAttraction = generateRealMainAttraction(destination, coordinates);
  attractions.push(mainAttraction);

  // 根据兴趣偏好生成专门景点
  if (interests.includes("历史文化")) {
    const historicalPlaces = generateRealHistoricalPlaces(
      destination,
      coordinates
    );
    attractions.push(...historicalPlaces);
  }

  if (interests.includes("自然风光")) {
    attractions.push({
      name: `${destination}湿地公园`,
      address: `${destination}生态保护区`,
      coordinates: [coordinates[0] + 0.03, coordinates[1] - 0.01],
      cost: 20,
      description: `${destination}最大的城市湿地，生态环境优美，四季景色各异。春季赏花，夏季观鸟，秋季看芦苇，冬季观候鸟。设有木栈道和观鸟亭，适合摄影爱好者。`,
    });

    attractions.push({
      name: `${destination}山水风景区`,
      address: `${destination}郊区风景名胜区`,
      coordinates: [coordinates[0] + 0.05, coordinates[1] + 0.03],
      cost: 45,
      description: `${destination}周边最美的自然景观，山清水秀，空气清新。有多条登山步道，山顶设有观景台可远眺全城。建议穿舒适的登山鞋，带足饮水。`,
    });
  }

  if (interests.includes("美食体验")) {
    const foodPlaces = generateRealFoodPlaces(destination, coordinates);
    attractions.push(...foodPlaces);
  }

  if (interests.includes("购物娱乐") || interests.includes("购物")) {
    const shoppingPlaces = generateRealShoppingPlaces(destination, coordinates);
    // 按热门程度排序购物地点
    const sortedShoppingPlaces = sortByPopularity(shoppingPlaces, destination);
    attractions.push(...sortedShoppingPlaces);
  }

  if (interests.includes("艺术博物")) {
    attractions.push({
      name: `${destination}艺术中心`,
      address: `${destination}文化艺术区`,
      coordinates: [coordinates[0] - 0.015, coordinates[1] + 0.015],
      cost: 35,
      description: `${destination}重要的艺术展示空间，定期举办各类艺术展览和文化活动。建筑风格独特，是了解当地文化艺术的重要场所。`,
    });

    attractions.push({
      name: `${destination}美术馆`,
      address: `${destination}文化园区`,
      coordinates: [coordinates[0] + 0.02, coordinates[1] - 0.01],
      cost: 25,
      description: `${destination}专业的美术展览馆，收藏了大量当地艺术家的作品和临时展览。环境优雅，是艺术爱好者的必访之地。`,
    });
  }

  if (interests.includes("户外运动")) {
    attractions.push({
      name: `${destination}体育公园`,
      address: `${destination}体育中心`,
      coordinates: [coordinates[0] + 0.01, coordinates[1] + 0.02],
      cost: 15,
      description: `${destination}最大的体育公园，有足球场、篮球场、网球场等运动设施。环境优美，是健身运动的好去处。`,
    });
  }

  if (interests.includes("夜生活")) {
    attractions.push({
      name: `${destination}酒吧街`,
      address: `${destination}夜生活区`,
      coordinates: [coordinates[0] - 0.01, coordinates[1] - 0.02],
      cost: 0,
      description: `${destination}最热闹的夜生活区域，有各种酒吧、KTV和夜宵店。晚上灯火通明，是体验当地夜生活的最佳地点。`,
    });
  }

  if (interests.includes("摄影")) {
    attractions.push({
      name: `${destination}摄影基地`,
      address: `${destination}摄影园区`,
      coordinates: [coordinates[0] + 0.03, coordinates[1] + 0.03],
      cost: 30,
      description: `${destination}专业的摄影基地，有各种拍摄场景和道具。适合婚纱摄影、写真拍摄和艺术创作。`,
    });
  }

  // 确保至少有5个景点
  if (attractions.length < 5) {
    attractions.push({
      name: `${destination}城市观景台`,
      address: `${destination}制高点`,
      coordinates: [coordinates[0] + 0.02, coordinates[1] + 0.02],
      cost: 25,
      description: `${destination}最佳观景点，可360度俯瞰全城风貌。白天可看城市全貌，夜晚可赏万家灯火。设有望远镜和休息区，是拍照留念的绝佳地点。`,
    });
  }

  // 按热门程度排序所有景点
  const sortedAttractions = sortByPopularity(attractions, destination);

  // 如果是重新生成，打乱景点顺序以提供不同的推荐
  if (isRegeneration && sortedAttractions.length > 1) {
    // 简单的数组打乱算法
    for (let i = sortedAttractions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sortedAttractions[i], sortedAttractions[j]] = [
        sortedAttractions[j],
        sortedAttractions[i],
      ];
    }
    console.log("重新生成：已打乱景点推荐顺序");
  }

  return sortedAttractions;
}

// 按热门程度排序景点和购物地点
function sortByPopularity(places: any[], destination: string): any[] {
  // 定义热门程度关键词
  const popularityKeywords = {
    邯郸: {
      high: ["万达", "新世纪", "银座", "美乐城", "阳光百货", "古城"],
      medium: ["商业", "购物", "广场", "商城"],
      low: ["小店", "小街", "市场"],
    },
  };

  // 获取当前城市的热门关键词
  const cityKeywords = popularityKeywords[destination] || {
    high: ["万达", "新世纪", "银座", "美乐城", "阳光百货"],
    medium: ["商业", "购物", "广场", "商城"],
    low: ["小店", "小街", "市场"],
  };

  return places.sort((a, b) => {
    const aScore = calculatePopularityScore(a.name, cityKeywords);
    const bScore = calculatePopularityScore(b.name, cityKeywords);
    return bScore - aScore; // 降序排列，热门程度高的在前
  });
}

// 计算热门程度分数
function calculatePopularityScore(name: string, keywords: any): number {
  let score = 0;

  // 检查高热门关键词
  for (const keyword of keywords.high) {
    if (name.includes(keyword)) {
      score += 10;
      break;
    }
  }

  // 检查中等热门关键词
  for (const keyword of keywords.medium) {
    if (name.includes(keyword)) {
      score += 5;
      break;
    }
  }

  // 检查低热门关键词
  for (const keyword of keywords.low) {
    if (name.includes(keyword)) {
      score += 1;
      break;
    }
  }

  return score;
}

// 智能生成餐厅（使用真实餐厅名称）
function generateSmartRestaurants(
  destination: string,
  coordinates: [number, number]
) {
  const realRestaurants: Record<string, any[]> = {
    北京: [
      {
        name: "全聚德烤鸭店",
        address: "北京市东城区前门大街30号",
        coordinates: [116.3955, 39.8977],
        cost: 200,
        description:
          "百年老字号，正宗北京烤鸭的代表。片鸭技艺精湛，配菜丰富，是品尝北京烤鸭的首选之地。",
      },
      {
        name: "东来顺饭庄",
        address: "北京市东城区王府井大街198号",
        coordinates: [116.4107, 39.9097],
        cost: 150,
        description:
          "涮羊肉鼻祖，清真老字号。羊肉鲜嫩，调料地道，是体验老北京涮肉文化的最佳选择。",
      },
      {
        name: "护国寺小吃",
        address: "北京市西城区护国寺街93号",
        coordinates: [116.3711, 39.9342],
        cost: 50,
        description:
          "地道北京小吃，豆汁焦圈、艾窝窝、驴打滚等传统小食应有尽有，是体验老北京味道的好地方。",
      },
    ],
    上海: [
      {
        name: "小南国",
        address: "上海市黄浦区淮海中路333号",
        coordinates: [121.4692, 31.2238],
        cost: 180,
        description:
          "精致本帮菜，上海味道的代表。菜品精美，口味地道，环境优雅，是品尝上海菜的首选餐厅。",
      },
      {
        name: "南翔馒头店",
        address: "上海市黄浦区豫园路85号",
        coordinates: [121.4925, 31.227],
        cost: 80,
        description:
          "百年小笼包老字号，豫园必去美食。皮薄汁多，鲜美可口，是上海小笼包的鼻祖。",
      },
    ],
    杭州: [
      {
        name: "楼外楼",
        address: "浙江省杭州市西湖区孤山路30号",
        coordinates: [120.1445, 30.2592],
        cost: 200,
        description:
          "西湖醋鱼发源地，百年老店。临湖而建，可边用餐边赏西湖美景，是杭州菜的代表餐厅。",
      },
      {
        name: "知味观",
        address: "浙江省杭州市上城区仁和路83号",
        coordinates: [120.1693, 30.2467],
        cost: 100,
        description:
          "杭州小吃老字号，有各种杭州传统点心和小食。猫耳朵、定胜糕等都是招牌美食。",
      },
    ],
    西安: [
      {
        name: "德发长饺子馆",
        address: "陕西省西安市碑林区钟楼",
        coordinates: [108.9402, 34.3416],
        cost: 80,
        description:
          "西安老字号，饺子宴闻名。有108种不同形状和口味的饺子，是体验西安面食文化的好地方。",
      },
      {
        name: "老孙家饭庄",
        address: "陕西省西安市莲湖区东大街364号",
        coordinates: [108.9402, 34.3416],
        cost: 60,
        description:
          "羊肉泡馍老字号，汤浓肉烂，馍香味美。是品尝正宗西安羊肉泡馍的最佳选择。",
      },
    ],
    邯郸: [
      {
        name: "邯郸宾馆餐厅",
        address: "河北省邯郸市丛台区人民东路",
        coordinates: [114.4775, 36.6025],
        cost: 120,
        description:
          "邯郸老牌餐厅，主营冀菜和当地特色菜。环境优雅，服务周到，是商务宴请的好选择。",
      },
      {
        name: "永年驴肉火烧店",
        address: "河北省邯郸市永年区临洺关镇",
        coordinates: [114.8167, 36.7833],
        cost: 25,
        description:
          "河北名小吃，肉质鲜美，火烧酥脆。是邯郸地区最具代表性的特色美食。",
      },
    ],
  };

  // 先查找完全匹配
  if (realRestaurants[destination]) {
    return realRestaurants[destination];
  }

  // 模糊匹配
  const fuzzyMatch = Object.keys(realRestaurants).find(
    (city) => destination.includes(city) || city.includes(destination)
  );

  if (fuzzyMatch) {
    return realRestaurants[fuzzyMatch];
  }

  // 默认生成
  return [
    {
      name: `${destination}老字号餐厅`,
      address: `${destination}传统美食街`,
      coordinates: [coordinates[0] + 0.005, coordinates[1] - 0.005],
      cost: 150,
      description: `${destination}最具代表性的老字号餐厅，传承当地传统口味，是品尝地道当地菜的最佳选择。`,
    },
    {
      name: `${destination}特色小吃店`,
      address: `${destination}老城区`,
      coordinates: [coordinates[0] - 0.005, coordinates[1] - 0.005],
      cost: 45,
      description: `${destination}最地道的小吃店，主打当地特色小食，价格实惠，味道正宗。`,
    },
  ];
}

// 智能生成酒店（使用真实酒店名称）
function generateSmartHotels(
  destination: string,
  coordinates: [number, number],
  budget?: number,
  days?: number
) {
  const dailyBudget = budget && days ? Math.floor(budget / days) : 500;
  const accommodationBudget = Math.floor(dailyBudget * 0.4); // 住宿占每日预算40%

  const realHotels: Record<string, any[]> = {
    北京: [
      {
        name: "北京饭店",
        address: "北京市东城区东长安街33号",
        coordinates: [116.4109, 39.9097],
        cost: 1200,
        level: "luxury",
        description:
          "历史悠久的五星级酒店，位于天安门广场附近，地理位置优越。客房豪华舒适，服务一流，是商务和旅游的理想选择。",
      },
      {
        name: "王府井希尔顿酒店",
        address: "北京市东城区王府井东街8号",
        coordinates: [116.4141, 39.9085],
        cost: 800,
        level: "luxury",
        description:
          "位于王府井商业区的豪华酒店，购物出行极为便利。设施现代化，服务专业，适合商务和休闲旅客。",
      },
      {
        name: "如家酒店(王府井店)",
        address: "北京市东城区王府井大街",
        coordinates: [116.4107, 39.9097],
        cost: 300,
        level: "comfort",
        description:
          "经济型连锁酒店，位置便利，性价比高。客房干净整洁，基础设施完善，适合预算有限的游客。",
      },
      {
        name: "7天连锁酒店(北京站店)",
        address: "北京市东城区建国门内大街",
        coordinates: [116.4185, 39.9042],
        cost: 200,
        level: "budget",
        description:
          "经济实惠的快捷酒店，靠近北京站，交通便利。客房简洁舒适，适合短期住宿。",
      },
    ],
    上海: [
      {
        name: "和平饭店",
        address: "上海市黄浦区南京东路20号",
        coordinates: [121.4906, 31.2397],
        cost: 1500,
        level: "luxury",
        description:
          '外滩标志性酒店，历史悠久，享有"远东第一楼"美誉。客房豪华典雅，可俯瞰黄浦江美景。',
      },
      {
        name: "上海外滩茂悦大酒店",
        address: "上海市黄浦区南京东路500号",
        coordinates: [121.4859, 31.2354],
        cost: 900,
        level: "luxury",
        description:
          "位于外滩核心区域的豪华酒店，地理位置绝佳。设施一流，服务专业，是商务和旅游的首选。",
      },
      {
        name: "汉庭酒店(外滩店)",
        address: "上海市黄浦区南京东路",
        coordinates: [121.4759, 31.2354],
        cost: 350,
        level: "comfort",
        description:
          "经济型连锁酒店，位于南京路步行街附近，购物出行便利。客房舒适，性价比高。",
      },
    ],
    杭州: [
      {
        name: "西湖国宾馆",
        address: "浙江省杭州市西湖区杨公堤18号",
        coordinates: [120.1445, 30.2592],
        cost: 1000,
        level: "luxury",
        description:
          "西湖边的园林式酒店，环境优美，设施豪华。可欣赏西湖美景，是度假休闲的理想选择。",
      },
      {
        name: "杭州西湖柳莺里酒店",
        address: "浙江省杭州市西湖区南山路",
        coordinates: [120.1484, 30.2319],
        cost: 600,
        level: "comfort",
        description:
          "精品酒店，位于西湖景区内，环境清幽。设计典雅，服务贴心，适合休闲度假。",
      },
      {
        name: "如家酒店(西湖店)",
        address: "浙江省杭州市西湖区",
        coordinates: [120.1551, 30.2741],
        cost: 280,
        level: "budget",
        description:
          "经济型酒店，靠近西湖景区，交通便利。客房干净舒适，价格实惠。",
      },
    ],
    西安: [
      {
        name: "西安索菲特酒店",
        address: "陕西省西安市雁塔区大雁塔南广场",
        coordinates: [108.9642, 34.2186],
        cost: 900,
        level: "luxury",
        description:
          "五星级酒店，位于大雁塔旁，地理位置优越。设施豪华，服务一流，是商务和旅游的理想选择。",
      },
      {
        name: "西安钟楼饭店",
        address: "陕西省西安市莲湖区钟楼",
        coordinates: [108.9402, 34.3416],
        cost: 500,
        level: "comfort",
        description:
          "位于市中心钟楼附近的老牌酒店，交通便利。客房舒适，服务周到，性价比高。",
      },
      {
        name: "7天连锁酒店(钟楼店)",
        address: "陕西省西安市碑林区南大街",
        coordinates: [108.9402, 34.3416],
        cost: 200,
        level: "budget",
        description:
          "经济型快捷酒店，位于市中心，出行便利。客房简洁干净，价格实惠。",
      },
    ],
    邯郸: [
      {
        name: "邯郸宾馆",
        address: "河北省邯郸市丛台区人民东路",
        coordinates: [114.4775, 36.6025],
        cost: 400,
        level: "comfort",
        description:
          "邯郸老牌酒店，服务周到，设施完善。位于市中心，交通便利，是商务和旅游的好选择。",
      },
      {
        name: "如家酒店(邯郸火车站店)",
        address: "河北省邯郸市邯山区中华南大街",
        coordinates: [114.4775, 36.6025],
        cost: 250,
        level: "budget",
        description:
          "经济型连锁酒店，靠近火车站，交通便利。客房干净舒适，价格实惠，适合短期住宿。",
      },
      {
        name: "汉庭酒店(邯郸店)",
        address: "河北省邯郸市丛台区",
        coordinates: [114.4775, 36.6025],
        cost: 220,
        level: "budget",
        description:
          "经济型快捷酒店，位于市区，出行方便。客房设施齐全，服务标准化，性价比高。",
      },
    ],
  };

  // 先查找完全匹配
  let availableHotels = [];
  for (const [city, hotels] of Object.entries(realHotels)) {
    if (destination.includes(city)) {
      availableHotels = hotels;
      break;
    }
  }

  // 如果没有匹配，使用默认酒店
  if (availableHotels.length === 0) {
    availableHotels = [
      {
        name: `${destination}大酒店`,
        address: `${destination}市中心`,
        coordinates: [coordinates[0], coordinates[1] - 0.01],
        cost: 400,
        level: "comfort",
        description: `${destination}知名酒店，设施完善，服务周到，位置便利。`,
      },
      {
        name: `如家酒店(${destination}店)`,
        address: `${destination}市区`,
        coordinates: [coordinates[0] + 0.01, coordinates[1]],
        cost: 250,
        level: "budget",
        description: "经济型连锁酒店，干净舒适，性价比高。",
      },
    ];
  }

  const allHotels = availableHotels;

  // 根据预算筛选合适的酒店
  let suitableHotels = [];

  if (accommodationBudget >= 800) {
    // 高预算：豪华酒店
    suitableHotels = allHotels.filter((h) => h.level === "luxury").slice(0, 2);
    const comfortHotel = allHotels.find(
      (h) => h.level === "comfort" && h.cost <= accommodationBudget
    );
    if (comfortHotel) suitableHotels.push(comfortHotel);
  } else if (accommodationBudget >= 300) {
    // 中等预算：舒适型酒店
    suitableHotels = allHotels.filter(
      (h) => h.level === "comfort" && h.cost <= accommodationBudget
    );
    if (suitableHotels.length < 2) {
      suitableHotels.push(
        ...allHotels.filter((h) => h.level === "budget").slice(0, 2)
      );
    }
  } else {
    // 低预算：经济型酒店
    suitableHotels = allHotels.filter(
      (h) => h.level === "budget" && h.cost <= accommodationBudget
    );
  }

  return suitableHotels.length > 0 ? suitableHotels : allHotels.slice(-2); // 至少返回2个选项
}

// 智能生成每日活动
function generateDayActivities(
  day: number,
  destinationData: any,
  dailyBudget: number,
  interests: string[],
  lockedActivities?: string[],
  existingDay?: any,
  isRegeneration: boolean = false
) {
  const activities = [];
  const attractions = destinationData.attractions || [];
  const restaurants = destinationData.restaurants || [];

  // 如果有现有的一天数据，先检查锁定的活动
  const lockedActivitySet = new Set(lockedActivities || []);
  let preservedActivities: any[] = [];

  console.log(`第${day}天生成活动 - 锁定活动列表:`, lockedActivities);
  console.log(
    `第${day}天生成活动 - 现有活动:`,
    existingDay?.activities?.map((a: any) => ({ id: a.id, name: a.name }))
  );

  if (existingDay && existingDay.activities) {
    // 保留锁定的活动
    preservedActivities = existingDay.activities.filter((activity: any) => {
      const isLocked = lockedActivitySet.has(activity.id);
      console.log(
        `活动 ${activity.id} (${activity.name}) 是否锁定: ${isLocked}`
      );
      return isLocked;
    });

    // 将保留的活动添加到结果中
    activities.push(...preservedActivities);

    console.log(
      `第${day}天保留了${preservedActivities.length}个锁定活动:`,
      preservedActivities.map((a) => a.name)
    );
  }

  // 根据兴趣偏好智能分配每日主题
  const interestBasedThemes = generateInterestBasedThemes(interests, day);
  const theme =
    interestBasedThemes[Math.min(day - 1, interestBasedThemes.length - 1)];

  console.log(`第${day}天主题: ${theme}, 用户兴趣: ${interests.join(", ")}`);

  // 检查是否已有上午景点活动被保留
  const hasPreservedMorningAttraction = preservedActivities.some(
    (activity) =>
      activity.id === `activity-${day}-1` ||
      (activity.startTime && activity.startTime.startsWith("09:"))
  );

  // 上午景点（智能根据兴趣和天数选择，避免重复）
  if (attractions.length > 0 && !hasPreservedMorningAttraction) {
    let attraction = null;

    // 获取所有已使用的景点名称（包括保留的活动）
    const usedAttractionNames = preservedActivities.map((a) => a.name);

    // 过滤出未使用的景点，并按热门程度排序
    const availableAttractions = attractions.filter(
      (a) => !usedAttractionNames.includes(a.name)
    );

    console.log(
      `第${day}天上午 - 可用景点数量: ${
        availableAttractions.length
      }, 已使用: ${usedAttractionNames.join(", ")}`
    );

    if (availableAttractions.length > 0) {
      // 按热门程度排序可用景点
      const sortedAttractions = sortByPopularity(
        availableAttractions,
        destinationData.coordinates ? "邯郸" : "default"
      );

      // 根据天数和兴趣选择不同的景点
      if (day === 1) {
        // 第一天优先选择标志性景点（热门程度高的）
        attraction =
          sortedAttractions.find(
            (a) =>
              a.name.includes("博物馆") ||
              a.name.includes("中心") ||
              a.name.includes("广场") ||
              a.name.includes("万达")
          ) || sortedAttractions[0];
      } else {
        // 其他天根据兴趣偏好选择，优先选择热门景点
        const currentInterestIndex = (day - 2) % Math.max(interests.length, 1);
        const currentInterest = interests[currentInterestIndex] || interests[0];

        // 根据兴趣偏好筛选景点
        let filteredAttractions = sortedAttractions;
        if (currentInterest === "历史文化") {
          filteredAttractions = sortedAttractions.filter(
            (a) =>
              a.name.includes("古城") ||
              a.name.includes("文庙") ||
              a.name.includes("遗址") ||
              a.name.includes("历史") ||
              a.name.includes("文化")
          );
        } else if (currentInterest === "自然风光") {
          filteredAttractions = sortedAttractions.filter(
            (a) =>
              a.name.includes("公园") ||
              a.name.includes("风景") ||
              a.name.includes("湿地") ||
              a.name.includes("山水") ||
              a.name.includes("观景")
          );
        } else if (currentInterest === "艺术博物") {
          filteredAttractions = sortedAttractions.filter(
            (a) =>
              a.name.includes("艺术") ||
              a.name.includes("美术") ||
              a.name.includes("展览") ||
              a.name.includes("创意") ||
              a.name.includes("文化园")
          );
        } else if (
          currentInterest === "购物娱乐" ||
          currentInterest === "购物"
        ) {
          // 购物娱乐优先选择热门商场
          filteredAttractions = sortedAttractions.filter(
            (a) =>
              a.name.includes("万达") ||
              a.name.includes("新世纪") ||
              a.name.includes("银座") ||
              a.name.includes("美乐城") ||
              a.name.includes("阳光百货") ||
              a.name.includes("商业")
          );
        }

        // 如果筛选后没有合适的景点，使用所有可用景点（已按热门程度排序）
        if (filteredAttractions.length === 0) {
          filteredAttractions = sortedAttractions;
        }

        // 选择第一个（最热门的）
        attraction = filteredAttractions[0];
      }
    } else {
      // 如果所有景点都用过了，选择一个不同的
      attraction = attractions[day % attractions.length];
    }

    // 确保有选中的景点
    if (attraction) {
      // 判断这个景点是否匹配用户兴趣
      const matchedInterests = getMatchedInterests(attraction.name, interests);

      activities.push({
        id: `activity-${day}-1`,
        name: attraction.name,
        description: attraction.description,
        startTime: "09:00",
        endTime: "11:30",
        location: {
          name: attraction.name,
          address: attraction.address,
          coordinates: attraction.coordinates,
        },
        cost: attraction.cost,
        category: "attraction" as const,
        matchedInterests: matchedInterests, // 添加匹配的兴趣标签
        tips: [
          "建议早上9点前到达，避开旅游团高峰",
          "记得带相机拍照，光线最佳时间是上午10-11点",
          "注意开放时间，部分景点周一闭馆",
          `今日主题：${theme}`,
          matchedInterests.length > 0
            ? `🎯 根据您的兴趣推荐：${matchedInterests.join("、")}`
            : "",
          "可以提前在官网购票享受优惠",
          "建议游览时间2-3小时，不要匆忙赶路",
        ].filter((tip) => tip !== ""), // 过滤空字符串
      });
    }
  }

  // 检查是否已有午餐活动被保留
  const hasPreservedLunch = preservedActivities.some(
    (activity) =>
      activity.id === `activity-${day}-2` ||
      (activity.startTime && activity.startTime.startsWith("12:"))
  );

  // 午餐推荐（如果没有被保留）
  if (restaurants.length > 0 && !hasPreservedLunch) {
    const usedRestaurantNames = activities.map((a) => a.name);
    const availableRestaurants = restaurants.filter(
      (r) => !usedRestaurantNames.includes(r.name)
    );

    if (availableRestaurants.length > 0) {
      // 按热门程度排序餐厅
      const sortedRestaurants = sortByPopularity(
        availableRestaurants,
        destinationData.coordinates ? "邯郸" : "default"
      );
      const restaurant = sortedRestaurants[0]; // 选择最热门的餐厅

      const matchedInterests = getMatchedInterests(restaurant.name, interests);

      activities.push({
        id: `activity-${day}-2`,
        name: restaurant.name,
        description: restaurant.description,
        startTime: "12:00",
        endTime: "13:30",
        location: {
          name: restaurant.name,
          address: restaurant.address,
          coordinates: restaurant.coordinates,
        },
        cost: restaurant.cost,
        category: "restaurant" as const,
        matchedInterests: matchedInterests,
        tips: [
          "建议提前预订，特别是用餐高峰期",
          "可以尝试当地特色菜品",
          "注意餐厅的营业时间",
          matchedInterests.length > 0
            ? `🍽️ 根据您的兴趣推荐：${matchedInterests.join("、")}`
            : "",
          "建议用餐时间1-1.5小时，不要匆忙",
        ].filter((tip) => tip !== ""),
      });
    }
  }

  // 检查是否已有下午活动被保留
  const hasPreservedAfternoon = preservedActivities.some(
    (activity) =>
      activity.id === `activity-${day}-3` ||
      (activity.startTime && activity.startTime.startsWith("14:"))
  );

  // 下午景点（如果没有被保留）
  if (attractions.length > 0 && !hasPreservedAfternoon) {
    const usedAttractionNames = activities.map((a) => a.name);
    const availableAttractions = attractions.filter(
      (a) => !usedAttractionNames.includes(a.name)
    );

    if (availableAttractions.length > 0) {
      // 按热门程度排序
      const sortedAttractions = sortByPopularity(
        availableAttractions,
        destinationData.coordinates ? "邯郸" : "default"
      );
      let afternoonAttraction = sortedAttractions[0];

      // 确保下午活动与上午不同，并避免与已保留的活动重复
      const morningAttraction = activities.find((a) =>
        a.startTime?.startsWith("09:")
      );
      const usedAttractionNames = [...activities, ...preservedActivities].map(
        (a) => a.name
      );

      if (
        afternoonAttraction.name === morningAttraction?.name ||
        usedAttractionNames.includes(afternoonAttraction.name)
      ) {
        // 寻找未使用的景点
        const availableAttractions = attractions.filter(
          (a) => !usedAttractionNames.includes(a.name)
        );
        if (availableAttractions.length > 0) {
          const sortedAvailable = sortByPopularity(
            availableAttractions,
            destinationData.coordinates ? "邯郸" : "default"
          );
          afternoonAttraction = sortedAvailable[0];
        } else if (attractions.length > 2) {
          afternoonAttraction = attractions[(day + 1) % attractions.length];
        }
      }

      // 判断下午景点是否匹配用户兴趣
      const afternoonMatchedInterests = getMatchedInterests(
        afternoonAttraction.name,
        interests
      );

      activities.push({
        id: `activity-${day}-3`,
        name: afternoonAttraction.name,
        description: afternoonAttraction.description,
        startTime: "14:00",
        endTime: "16:30",
        location: {
          name: afternoonAttraction.name,
          address: afternoonAttraction.address,
          coordinates: afternoonAttraction.coordinates,
        },
        cost: afternoonAttraction.cost,
        category: "attraction" as const,
        matchedInterests: afternoonMatchedInterests,
        tips: [
          "下午光线柔和，适合拍照",
          "建议避开正午高温时段",
          "注意景点下午的开放时间",
          afternoonMatchedInterests.length > 0
            ? `🎯 根据您的兴趣推荐：${afternoonMatchedInterests.join("、")}`
            : "",
          "可以安排一些轻松的活动",
          "建议游览时间2-3小时",
        ].filter((tip) => tip !== ""),
      });
    }
  }

  // 检查是否已有晚餐活动被保留
  const hasPreservedDinner = preservedActivities.some(
    (activity) =>
      activity.id === `activity-${day}-4` ||
      (activity.startTime && activity.startTime.startsWith("18:"))
  );

  // 晚餐推荐（如果没有被保留）
  if (restaurants.length > 0 && !hasPreservedDinner) {
    const usedRestaurantNames = activities.map((a) => a.name);
    const availableRestaurants = restaurants.filter(
      (r) => !usedRestaurantNames.includes(r.name)
    );

    if (availableRestaurants.length > 0) {
      // 按热门程度排序餐厅
      const sortedRestaurants = sortByPopularity(
        availableRestaurants,
        destinationData.coordinates ? "邯郸" : "default"
      );
      const restaurant = sortedRestaurants[0]; // 选择最热门的餐厅

      const matchedInterests = getMatchedInterests(restaurant.name, interests);

      activities.push({
        id: `activity-${day}-4`,
        name: restaurant.name,
        description: restaurant.description,
        startTime: "18:00",
        endTime: "19:30",
        location: {
          name: restaurant.name,
          address: restaurant.address,
          coordinates: restaurant.coordinates,
        },
        cost: restaurant.cost,
        category: "restaurant" as const,
        matchedInterests: matchedInterests,
        tips: [
          "晚餐时间建议提前预订",
          "可以尝试当地特色晚餐",
          "注意餐厅的营业时间",
          matchedInterests.length > 0
            ? `🍽️ 根据您的兴趣推荐：${matchedInterests.join("、")}`
            : "",
          "建议用餐时间1-1.5小时",
        ].filter((tip) => tip !== ""),
      });
    }
  }

  // 检查是否已有住宿活动被保留
  const hasPreservedHotel = preservedActivities.some(
    (activity) =>
      activity.id === `activity-${day}-hotel` || activity.category === "hotel"
  );

  // 添加住宿推荐（每天都需要住宿）
  const hotels = destinationData.hotels || [];
  if (hotels.length > 0 && !hasPreservedHotel) {
    // 根据预算选择合适的酒店
    const accommodationBudget = Math.floor(dailyBudget * 0.4);
    const suitableHotel =
      hotels.find((h) => h.cost <= accommodationBudget) ||
      hotels[hotels.length - 1];

    activities.push({
      id: `activity-${day}-hotel`,
      name: `${suitableHotel.name}（住宿）`,
      description: suitableHotel.description,
      startTime: "21:00",
      endTime: "次日08:00",
      location: {
        name: suitableHotel.name,
        address: suitableHotel.address,
        coordinates: suitableHotel.coordinates,
      },
      cost: suitableHotel.cost,
      category: "hotel" as const,
      matchedInterests: [], // 住宿不匹配特定兴趣
      tips: [
        "建议提前预订，特别是旅游旺季",
        "入住时检查房间设施是否完好",
        "了解酒店周边的便利设施",
        "保管好房卡和贵重物品",
        "如有问题及时联系前台",
        "退房时间一般为中午12点前",
      ],
    });
  }

  return activities;
}

// 判断景点名称是否匹配用户兴趣
function getMatchedInterests(
  attractionName: string,
  interests: string[]
): string[] {
  const matched: string[] = [];

  // 历史文化相关关键词
  if (interests.includes("历史文化")) {
    if (
      attractionName.includes("博物馆") ||
      attractionName.includes("古城") ||
      attractionName.includes("文庙") ||
      attractionName.includes("历史") ||
      attractionName.includes("文化") ||
      attractionName.includes("遗址") ||
      attractionName.includes("古迹") ||
      attractionName.includes("传统")
    ) {
      matched.push("历史文化");
    }
  }

  // 自然风光相关关键词
  if (interests.includes("自然风光")) {
    if (
      attractionName.includes("公园") ||
      attractionName.includes("风景") ||
      attractionName.includes("湿地") ||
      attractionName.includes("山水") ||
      attractionName.includes("观景") ||
      attractionName.includes("生态") ||
      attractionName.includes("自然") ||
      attractionName.includes("园林")
    ) {
      matched.push("自然风光");
    }
  }

  // 美食体验相关关键词
  if (interests.includes("美食体验")) {
    if (
      attractionName.includes("美食") ||
      attractionName.includes("小吃") ||
      attractionName.includes("餐厅") ||
      attractionName.includes("市场") ||
      attractionName.includes("食街") ||
      attractionName.includes("特色菜")
    ) {
      matched.push("美食体验");
    }
  }

  // 购物娱乐相关关键词
  if (interests.includes("购物娱乐") || interests.includes("购物")) {
    if (
      attractionName.includes("商业") ||
      attractionName.includes("购物") ||
      attractionName.includes("商城") ||
      attractionName.includes("步行街") ||
      attractionName.includes("娱乐") ||
      attractionName.includes("商场") ||
      attractionName.includes("市场") ||
      attractionName.includes("特色") ||
      attractionName.includes("纪念品") ||
      attractionName.includes("特产")
    ) {
      matched.push(interests.includes("购物") ? "购物" : "购物娱乐");
    }
  }

  // 艺术博物相关关键词
  if (interests.includes("艺术博物")) {
    if (
      attractionName.includes("艺术") ||
      attractionName.includes("美术") ||
      attractionName.includes("展览") ||
      attractionName.includes("创意") ||
      attractionName.includes("文化园") ||
      attractionName.includes("画廊")
    ) {
      matched.push("艺术博物");
    }
  }

  // 户外活动相关关键词
  if (interests.includes("户外活动")) {
    if (
      attractionName.includes("运动") ||
      attractionName.includes("户外") ||
      attractionName.includes("攀岩") ||
      attractionName.includes("徒步") ||
      attractionName.includes("基地") ||
      attractionName.includes("体验")
    ) {
      matched.push("户外活动");
    }
  }

  // 夜生活相关关键词
  if (interests.includes("夜生活")) {
    if (
      attractionName.includes("夜市") ||
      attractionName.includes("酒吧") ||
      attractionName.includes("夜生活") ||
      attractionName.includes("夜景") ||
      attractionName.includes("夜晚") ||
      attractionName.includes("灯光")
    ) {
      matched.push("夜生活");
    }
  }

  return matched;
}

// 旧的generateSmartBudgetBreakdown函数已被下面的新版本替代

// 根据兴趣偏好生成每日主题
function generateInterestBasedThemes(
  interests: string[],
  currentDay: number
): string[] {
  const themes: string[] = [];

  // 第一天总是初探城市
  themes.push("初探城市");

  // 根据兴趣偏好循环安排主题
  if (interests.length > 0) {
    let themeIndex = 0;
    for (let day = 2; day <= 7; day++) {
      // 最多支持7天
      const interest = interests[themeIndex % interests.length];

      switch (interest) {
        case "历史文化":
          themes.push("历史文化探索");
          break;
        case "自然风光":
          themes.push("自然风光之旅");
          break;
        case "美食体验":
          themes.push("美食文化体验");
          break;
        case "购物娱乐":
        case "购物":
          themes.push("购物休闲时光");
          break;
        case "艺术博物":
          themes.push("艺术文化之旅");
          break;
        case "户外活动":
          themes.push("户外运动体验");
          break;
        case "夜生活":
          themes.push("夜生活探索");
          break;
        default:
          themes.push("深度体验");
      }
      themeIndex++;
    }
  } else {
    // 如果没有特定兴趣，使用默认主题
    const defaultThemes = [
      "深度体验",
      "文化之旅",
      "自然风光",
      "美食探索",
      "休闲购物",
      "告别之旅",
    ];
    themes.push(...defaultThemes);
  }

  return themes;
}

// 智能生成交通建议（根据预算）
function generateSmartTransportation(
  day: number,
  dailyBudget: number,
  totalBudget: number,
  totalDays: number
): string {
  const transportationBudget = Math.floor(dailyBudget * 0.15); // 交通占每日预算15%
  const avgDailyBudget = Math.floor(totalBudget / totalDays);

  if (day === 1) {
    // 第一天：到达交通
    if (avgDailyBudget >= 800) {
      return "🚗 建议乘坐出租车或网约车直达酒店，舒适便捷。如需要可安排专车接机服务。";
    } else if (avgDailyBudget >= 400) {
      return "🚌 推荐机场大巴+地铁组合，性价比高。也可选择出租车，约需30-50分钟。";
    } else {
      return "🚇 建议乘坐机场大巴或地铁，经济实惠。提前查好路线，大约需要1小时。";
    }
  } else if (day === totalDays) {
    // 最后一天：离开交通
    if (avgDailyBudget >= 800) {
      return "🚗 建议提前预约专车送机，确保准时到达机场。也可选择出租车，记得预留充足时间。";
    } else if (avgDailyBudget >= 400) {
      return "🚌 推荐地铁+机场大巴，或直接打车前往机场。建议提前2小时出发。";
    } else {
      return "🚇 建议乘坐地铁或机场大巴前往机场，经济实惠。记得提前2.5小时出发。";
    }
  } else {
    // 中间天数：市内交通
    if (transportationBudget >= 100) {
      return "🚗 推荐打车或租车出行，时间灵活，可以更好地安排行程。也可体验当地特色交通工具。";
    } else if (transportationBudget >= 50) {
      return "🚌 建议公共交通+偶尔打车的组合方式。购买一日交通卡更划算，短距离可选择共享单车。";
    } else {
      return "🚇 推荐公共交通出行，购买交通卡享受优惠。步行距离较近的景点建议步行，既省钱又能更好体验当地生活。";
    }
  }
}

// 生成旅行建议的函数
export async function generateTravelTips(
  destination: string
): Promise<string[]> {
  try {
    console.log("生成旅行建议，目的地:", destination);

    const prompt = `
请为前往${destination}的旅行者提供5-8条实用的旅行建议。
建议应该包括：
1. 最佳旅行时间
2. 当地文化注意事项
3. 交通建议
4. 美食推荐
5. 购物建议
6. 安全注意事项
7. 实用APP推荐

请以简洁的要点形式返回，每条建议不超过50字。
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 使用更经济的模型
      messages: [
        {
          role: "system",
          content: "你是一个经验丰富的旅行顾问，擅长提供实用的旅行建议。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return [];
    }

    // 解析建议列表
    const tips = response
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((tip) => tip.length > 0);

    console.log("成功生成旅行建议，数量:", tips.length);
    return tips;
  } catch (error) {
    console.error("生成旅行建议失败:", error);
    return [];
  }
}

// 计算实际支出
function calculateActualExpense(days: any[], transportationCost: any) {
  let totalExpense = transportationCost.roundTripCost; // 往返交通费

  const breakdown = {
    transportation: transportationCost.roundTripCost,
    accommodation: 0,
    food: 0,
    attractions: 0,
    shopping: 0,
    other: 0,
  };

  // 计算每日实际支出
  days.forEach((day) => {
    if (day.activities) {
      day.activities.forEach((activity: any) => {
        totalExpense += activity.cost || 0;

        // 按类别分类支出
        switch (activity.category) {
          case "hotel":
            breakdown.accommodation += activity.cost || 0;
            break;
          case "restaurant":
            breakdown.food += activity.cost || 0;
            break;
          case "attraction":
            breakdown.attractions += activity.cost || 0;
            break;
          case "shopping":
            breakdown.shopping += activity.cost || 0;
            break;
          default:
            breakdown.other += activity.cost || 0;
        }
      });
    }
  });

  return {
    total: totalExpense,
    breakdown: breakdown,
    dailyAverage: Math.round(totalExpense / days.length),
  };
}

// 生成行程总结
function generateTripSummary(input: any, days: any[], transportationCost: any) {
  const actualExpense = calculateActualExpense(days, transportationCost);
  const budgetDifference = input.budget - actualExpense.total;
  const budgetUtilization = Math.round(
    (actualExpense.total / input.budget) * 100
  );

  // 统计兴趣偏好覆盖情况
  const interestCoverage: Record<string, number> = {};
  input.interests.forEach((interest: string) => {
    interestCoverage[interest] = 0;
  });

  days.forEach((day) => {
    if (day.activities) {
      day.activities.forEach((activity: any) => {
        if (activity.matchedInterests) {
          activity.matchedInterests.forEach((interest: string) => {
            if (interestCoverage[interest] !== undefined) {
              interestCoverage[interest]++;
            }
          });
        }
      });
    }
  });

  return {
    budgetAnalysis: {
      plannedBudget: input.budget,
      actualExpense: actualExpense.total,
      difference: budgetDifference,
      utilization: budgetUtilization,
      status: budgetDifference >= 0 ? "预算充足" : "超出预算",
    },
    interestCoverage: interestCoverage,
    highlights: [
      `本次${input.destination}${input.days}日游，预算利用率${budgetUtilization}%`,
      budgetDifference >= 0
        ? `预算控制良好，还有¥${budgetDifference}余额可用于额外消费`
        : `预算超支¥${Math.abs(budgetDifference)}，建议适当调整行程`,
      input.departure
        ? `往返交通费¥${transportationCost.roundTripCost}，占总预算${Math.round(
            (transportationCost.roundTripCost / input.budget) * 100
          )}%`
        : "",
      `平均每日消费¥${actualExpense.dailyAverage}`,
      Object.keys(interestCoverage).length > 0
        ? `兴趣偏好覆盖：${Object.entries(interestCoverage)
            .map(([interest, count]) => `${interest}(${count}个活动)`)
            .join("、")}`
        : "",
    ].filter((highlight) => highlight !== ""),
    recommendations: generateBudgetRecommendations(
      budgetDifference,
      budgetUtilization,
      input
    ),
  };
}

// 生成预算建议
function generateBudgetRecommendations(
  budgetDifference: number,
  utilization: number,
  input: any
) {
  const recommendations = [];

  if (budgetDifference < 0) {
    recommendations.push("💡 预算超支建议：考虑选择更经济的住宿或餐厅");
    recommendations.push("💡 可以减少购物预算或选择性价比更高的景点");
  } else if (budgetDifference > input.budget * 0.3) {
    recommendations.push("💡 预算充裕建议：可以升级住宿标准或增加特色体验");
    recommendations.push("💡 考虑购买更多当地特产或纪念品");
  }

  if (utilization < 70) {
    recommendations.push("💡 预算利用率较低，可以增加更多精彩活动");
  } else if (utilization > 95) {
    recommendations.push("💡 预算利用率很高，建议预留一些应急资金");
  }

  return recommendations;
}

// 修改预算分解函数，加入交通费用
function generateSmartBudgetBreakdown(
  totalBudget: number,
  interests: string[],
  transportationCost?: any
) {
  const transportCost = transportationCost?.roundTripCost || 0;
  const remainingBudget = totalBudget - transportCost;

  let breakdown = {
    transportation: transportCost,
    accommodation: Math.floor(remainingBudget * 0.35),
    food: Math.floor(remainingBudget * 0.3),
    attractions: Math.floor(remainingBudget * 0.2),
    shopping: Math.floor(remainingBudget * 0.1),
    other: Math.floor(remainingBudget * 0.05),
  };

  // 根据兴趣偏好调整预算分配
  if (interests.includes("购物娱乐") || interests.includes("购物")) {
    // 增加购物预算
    const extraShopping = Math.floor(remainingBudget * 0.05);
    breakdown.shopping += extraShopping;
    breakdown.other -= extraShopping;
  }

  if (interests.includes("美食体验")) {
    // 增加餐饮预算
    const extraFood = Math.floor(remainingBudget * 0.05);
    breakdown.food += extraFood;
    breakdown.other -= extraFood;
  }

  return breakdown;
}

// 预算合理性检查
function checkBudgetReasonability(
  destination: string,
  budget: number,
  days: number
) {
  const dailyBudget = Math.floor(budget / days);

  // 不同城市的最低预算标准（每天）
  const cityMinBudgets: Record<string, number> = {
    北京: 200,
    上海: 220,
    深圳: 200,
    广州: 180,
    杭州: 160,
    成都: 140,
    西安: 130,
    重庆: 130,
    武汉: 120,
    南京: 150,
    天津: 140,
    青岛: 140,
    大连: 150,
    厦门: 160,
    苏州: 140,
    长沙: 120,
    郑州: 110,
    济南: 120,
    哈尔滨: 110,
    沈阳: 110,
    石家庄: 100,
    太原: 100,
    合肥: 110,
    南昌: 110,
    福州: 130,
    昆明: 120,
    贵阳: 110,
    南宁: 110,
    海口: 140,
    兰州: 100,
    银川: 100,
    西宁: 110,
    乌鲁木齐: 120,
    拉萨: 150,
  };

  // 获取目的地最低预算，如果没有找到则使用默认值
  const minDailyBudget = cityMinBudgets[destination] || 120;
  const recommendedMinTotal = minDailyBudget * days;

  const tips = [];
  let budgetLevel = "normal";

  if (dailyBudget < minDailyBudget) {
    budgetLevel = "insufficient";
    tips.push(
      `⚠️ 预算可能不足：${destination}建议每天至少${minDailyBudget}元，${days}天总计需要${recommendedMinTotal}元`
    );
    tips.push(
      `💡 建议调整：减少天数到${Math.floor(
        budget / minDailyBudget
      )}天，或增加预算到${recommendedMinTotal}元`
    );
    tips.push(`🏠 住宿建议：选择青年旅舍床位（50-80元/晚）或经济型酒店`);
    tips.push(`🚇 交通建议：主要使用公共交通，购买交通卡更划算`);
    tips.push(`🍜 餐饮建议：多选择当地小吃和快餐，避免高档餐厅`);
  } else if (dailyBudget < minDailyBudget * 1.5) {
    budgetLevel = "budget";
    tips.push(`💰 经济型旅行：预算适中，建议选择性价比高的住宿和餐饮`);
    tips.push(`🏨 住宿建议：经济型酒店或快捷酒店（150-250元/晚）`);
    tips.push(`🚌 交通建议：公共交通为主，偶尔打车`);
  } else if (dailyBudget < minDailyBudget * 3) {
    budgetLevel = "comfort";
    tips.push(`😊 舒适型旅行：预算充足，可以享受较好的住宿和餐饮`);
    tips.push(`🏨 住宿建议：三星级酒店或精品酒店（300-500元/晚）`);
    tips.push(`🚗 交通建议：公共交通+打车组合，出行更便利`);
  } else {
    budgetLevel = "luxury";
    tips.push(`🌟 豪华型旅行：预算充裕，可以享受高端住宿和精致餐饮`);
    tips.push(`🏨 住宿建议：四五星级酒店或度假村（600元以上/晚）`);
    tips.push(`🚗 交通建议：专车服务或租车自驾，出行舒适便捷`);
  }

  return {
    level: budgetLevel,
    isReasonable: dailyBudget >= minDailyBudget,
    minRecommended: recommendedMinTotal,
    tips,
  };
}
