// 这是数据分析页面
// 作为应届生，我会创建一个展示各种图表的分析页面

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRequireAuth, useCurrentUser } from "@/lib/hooks/useAuth";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";

// 读取当前用户的所有已保存计划
async function getAllSavedPlans(userId: string) {
  if (!userId) {
    console.log("用户未登录，无法获取行程数据");
    return [];
  }

  try {
    console.log("正在通过API获取用户数据，用户ID:", userId);

    // 通过API获取行程数据
    const response = await fetch("/api/itineraries", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log("API返回的行程数据:", result);

      if (result.success && result.data) {
        const itineraries = result.data;

        // 按创建时间倒序
        itineraries.sort((a: any, b: any) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        console.log(
          `获取到用户 ${userId} 的行程数据:`,
          itineraries.length,
          "条"
        );
        console.log("处理后的行程数据:", itineraries);
        return itineraries;
      } else {
        console.error("API返回错误:", result.error);
        return [];
      }
    } else {
      console.error("API请求失败:", response.status);
      return [];
    }
  } catch (error) {
    console.error("获取用户行程数据失败:", error);
    return [];
  }
}

const COLORS = [
  "#6366F1",
  "#06B6D4",
  "#818CF8",
  "#F59E42",
  "#10B981",
  "#F43F5E",
  "#FBBF24",
  "#3B82F6",
];

export default function AnalyticsPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [show, setShow] = useState(true);

  // 路由保护，确保用户已登录
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { user } = useCurrentUser();

  useEffect(() => {
    const loadPlans = async () => {
      if (isAuthenticated && user) {
        const userId = user.email || user.id;
        if (userId) {
          console.log("用户已认证，开始加载数据，用户ID:", userId);
          const userPlans = await getAllSavedPlans(userId);
          setPlans(userPlans);
          console.log("加载用户行程数据:", userPlans.length, "条");

          // 调试：打印第一个计划的数据结构
          if (userPlans.length > 0) {
            console.log("第一个计划的数据结构:", userPlans[0]);
            console.log("预算分布数据:", userPlans[0].budgetBreakdown);
            console.log("时间分配数据:", userPlans[0].timeBreakdown);
          }
        }
      } else if (!authLoading && !isAuthenticated) {
        // 用户未登录，清空数据
        console.log("用户未认证，清空数据");
        setPlans([]);
      }
    };

    loadPlans();
  }, [isAuthenticated, user, authLoading]);

  // 如果正在加载认证状态，显示加载界面
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">正在验证用户身份...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，不渲染任何内容（useRequireAuth会处理重定向）
  if (!isAuthenticated) {
    return null;
  }

  // 切换动画
  const handleSelect = (idx: number) => {
    setShow(false);
    setTimeout(() => {
      setSelectedIdx(idx);
      setShow(true);
    }, 250);
  };

  if (plans.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent mb-4 tracking-tight">
            智能数据分析
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            暂无已保存的AI智能规划计划，快去生成你的第一个旅行计划吧！
          </p>
          <a
            href="/planning"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-lg font-bold shadow-lg hover:from-indigo-600 hover:to-cyan-600 transition-all duration-300"
          >
            立即生成计划
          </a>
        </motion.div>
      </div>
    );
  }

  const plan = plans[selectedIdx];
  console.log("当前选中的计划:", plan);

  // 预算分布 - 从行程数据中生成分析数据
  const budgetData = (() => {
    if (plan.budgetBreakdown && plan.budgetBreakdown.length > 0) {
      // 如果有现成的预算分布数据
      const categoryMap: Record<string, string> = {
        attraction: "景点游览",
        restaurant: "餐饮美食",
        hotel: "住宿",
        transport: "交通",
        shopping: "购物",
        leisure: "休闲娱乐",
        other: "其他",
      };
      return plan.budgetBreakdown.map((item: any, i: number) => ({
        name: categoryMap[item.name] || item.name || item.category || `类别${i + 1}`,
        value: item.amount || item.value || 0,
      }));
    }

    // 如果没有预算分布，从行程数据中生成模拟数据
    const totalBudget = plan.budget || plan.totalBudget || 2000;
    const mockBudgetData = [
      { name: "景点游览", value: Math.round(totalBudget * 0.35) },
      { name: "餐饮美食", value: Math.round(totalBudget * 0.25) },
      { name: "住宿", value: Math.round(totalBudget * 0.25) },
      { name: "交通", value: Math.round(totalBudget * 0.15) },
    ];
    
    return mockBudgetData;
  })();

  // 时间分配 - 从行程活动中统计
  const timeData = (() => {
    if (plan.timeBreakdown && plan.timeBreakdown.length > 0) {
      // 如果有现成的时间分布数据
      const categoryMap: Record<string, string> = {
        attraction: "景点游览",
        restaurant: "餐饮美食",
        hotel: "住宿",
        transport: "交通",
        shopping: "购物",
        leisure: "休闲娱乐",
        other: "其他",
      };
      return plan.timeBreakdown.map((item: any, i: number) => ({
        name: categoryMap[item.name] || item.name || item.category || `活动${i + 1}`,
        value: item.hours || item.value || 0,
      }));
    }

    // 从行程数据中统计活动类型
    if (plan.data && plan.data.days) {
      const activityCount: Record<string, number> = {};
      
      plan.data.days.forEach((day: any) => {
        if (day.activities) {
          day.activities.forEach((activity: any) => {
            const type = getActivityType(activity.type || activity.name);
            const typeName = type === "attraction" ? "景点游览" 
                           : type === "restaurant" ? "餐饮美食"
                           : type === "shopping" ? "购物娱乐"
                           : "其他活动";
            activityCount[typeName] = (activityCount[typeName] || 0) + 1;
          });
        }
      });

      return Object.entries(activityCount).map(([name, count]) => ({
        name,
        value: count,
      }));
    }

    // 生成模拟时间分配数据
    const mockTimeData = [
      { name: "景点游览", value: 8 },
      { name: "餐饮美食", value: 4 },
      { name: "购物娱乐", value: 3 },
      { name: "休息时间", value: 2 },
    ];
    
    return mockTimeData;
  })();

  // 活动类型判断函数
  function getActivityType(nameOrType: string): "attraction" | "restaurant" | "shopping" | "hotel" {
    const name = nameOrType.toLowerCase();
    
    if (name.includes("餐") || name.includes("饭") || name.includes("食") || 
        name.includes("小吃") || name.includes("美食") || name.includes("菜")) {
      return "restaurant";
    }
    
    if (name.includes("购物") || name.includes("商场") || name.includes("市场") || 
        name.includes("店") || name.includes("shopping")) {
      return "shopping";
    }
    
    if (name.includes("酒店") || name.includes("宾馆") || name.includes("旅馆") || 
        name.includes("hotel") || name.includes("住宿")) {
      return "hotel";
    }
    
    return "attraction";
  }

  // 兴趣偏好 - 从正确的位置获取数据
  const interests = (() => {
    console.log("🔍 分析页面 - 兴趣偏好数据检查:", {
      planInterests: plan.interests,
      dataInterests: plan.data?.interests,
      fullPlan: plan
    });
    
    // 优先从 data.interests 获取（这是规划页面保存的位置）
    if (plan.data && plan.data.interests) {
      if (Array.isArray(plan.data.interests)) {
        console.log("✅ 从 data.interests 获取数组:", plan.data.interests);
        return plan.data.interests;
      } else if (typeof plan.data.interests === 'string' && plan.data.interests.trim()) {
        const parsed = plan.data.interests.split(',').map(s => s.trim()).filter(s => s);
        console.log("✅ 从 data.interests 解析字符串:", parsed);
        return parsed;
      }
    }
    
    // 备选：从顶级 interests 字段获取
    if (Array.isArray(plan.interests)) {
      console.log("✅ 从 plan.interests 获取数组:", plan.interests);
      return plan.interests;
    } else if (typeof plan.interests === 'string' && plan.interests.trim()) {
      const parsed = plan.interests.split(',').map(s => s.trim()).filter(s => s);
      console.log("✅ 从 plan.interests 解析字符串:", parsed);
      return parsed;
    }
    
    console.log("❌ 未找到兴趣偏好数据，返回空数组");
    return [];
  })();

  console.log("处理后的预算数据:", budgetData);
  console.log("处理后的时间数据:", timeData);

  // 生成智能分析建议
  const generateAIAnalysis = () => {
    const suggestions = [];

    // 预算分析
    if (budgetData.length > 0) {
      const maxBudgetItem = budgetData.reduce(
        (max, item) => (item.value > max.value ? item : max),
        budgetData[0]
      );
      const minBudgetItem = budgetData.reduce(
        (min, item) => (item.value < min.value ? item : min),
        budgetData[0]
      );

      suggestions.push(`预算分配合理，建议关注${maxBudgetItem.name}支出`);
      if (budgetData.length > 1) {
        suggestions.push(`如需优化，可尝试调整${minBudgetItem.name}预算`);
      }
    }

    // 时间分析
    if (timeData.length > 0) {
      const maxTimeItem = timeData.reduce(
        (max, item) => (item.value > max.value ? item : max),
        timeData[0]
      );
      suggestions.push(`时间利用率高，${maxTimeItem.name}安排较多`);
    }

    // 兴趣分析
    if (interests.length > 0) {
      suggestions.push(`兴趣偏好覆盖${interests.length}个领域：${interests.slice(0, 2).join('、')}${interests.length > 2 ? '等' : ''}`);
      
      // 根据具体兴趣提供建议
      if (interests.includes('历史文化')) {
        suggestions.push('建议预留充足时间参观历史景点，可考虑请导游讲解');
      }
      if (interests.includes('美食体验')) {
        suggestions.push('推荐尝试当地特色美食，可提前查看餐厅评价');
      }
      if (interests.includes('自然风光')) {
        suggestions.push('建议关注天气情况，选择最佳观景时间');
      }
    } else {
      // 如果没有兴趣偏好，基于旅行风格提供建议
      const travelStyle = plan.data?.travelStyle || plan.travelStyle;
      if (travelStyle) {
        suggestions.push(`${travelStyle}风格的行程安排，建议保持合适的节奏`);
      }
    }

    // 默认建议
    if (suggestions.length === 0) {
      suggestions.push("行程安排合理，建议按计划执行");
      suggestions.push("注意合理安排休息时间");
      suggestions.push("建议提前预订热门景点门票");
    }

    return suggestions;
  };

  const aiSuggestions = generateAIAnalysis();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pb-0">
      {/* 顶部标题 */}
      <div className="pt-16 pb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
              智能数据分析
            </h1>
            <button
              onClick={() => {
                console.log("🔍 分析页面 - 所有计划数据:", plans);
                console.log("🔍 分析页面 - 当前选中计划:", plan);
                console.log("🔍 分析页面 - 兴趣偏好数据:", interests);
              }}
              className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1 rounded-full hover:bg-white/50 transition-all"
              title="在控制台输出调试信息"
            >
              🔍 调试
            </button>
          </div>
          <p className="text-lg text-slate-600 font-medium mb-2">
            多维度洞察你的AI智能旅行计划
          </p>
        </motion.div>
      </div>

      {/* 计划切换Tab */}
      <div className="max-w-5xl mx-auto flex flex-wrap gap-4 justify-center mb-10">
        {plans.map((p, idx) => (
          <motion.button
            key={p.id || idx}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect(idx)}
            className={`px-6 py-3 rounded-full font-semibold shadow-md border transition-all duration-200 text-base ${
              selectedIdx === idx
                ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-transparent"
                : "bg-white/80 text-slate-700 border-slate-200 hover:border-cyan-400"
            }`}
          >
            {p.destination || p.title || `计划${idx + 1}`}
            <span className="ml-2 text-xs text-slate-400">
              {p.days ? `${p.days}天` : ""}
            </span>
          </motion.button>
        ))}
      </div>

      {/* 数据展示区 */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        <AnimatePresence mode="wait">
          {show && (
            <motion.div
              key={selectedIdx}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="bg-white/90 rounded-3xl shadow-xl p-8 border border-slate-100 flex flex-col gap-8"
            >
              {/* 计划摘要 */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="flex-1 min-w-[120px]">
                  <div className="text-xs text-slate-500 mb-1">目的地</div>
                  <div className="text-lg font-bold text-slate-800">
                    {plan.destination || "-"}
                  </div>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <div className="text-xs text-slate-500 mb-1">天数</div>
                  <div className="text-lg font-bold text-slate-800">
                    {plan.days || "-"}
                  </div>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <div className="text-xs text-slate-500 mb-1">总预算</div>
                  <div className="text-lg font-bold text-slate-800">
                    ¥{plan.budget || plan.totalBudget || "-"}
                  </div>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <div className="text-xs text-slate-500 mb-1">兴趣偏好</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {interests.length > 0 ? (
                      interests.map((it: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-100 to-cyan-100 text-xs text-cyan-700 font-medium border border-cyan-200"
                        >
                          🎯 {it}
                        </span>
                      ))
                    ) : (
                      // 如果没有兴趣偏好，显示旅行风格
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-xs text-purple-700 font-medium border border-purple-200">
                        🎨 {plan.data?.travelStyle || plan.travelStyle || "休闲旅行"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 预算分布图表 */}
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">
                  预算分布
                </div>
                {budgetData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={budgetData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        fill="#6366F1"
                        isAnimationActive={true}
                        animationDuration={900}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {budgetData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`¥${value}`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 text-xs">暂无预算数据</div>
                )}
              </div>

              {/* 时间分配图表 */}
              <div>
                <div className="text-sm font-semibold text-slate-700 mb-2">
                  时间分配
                </div>
                {timeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={timeData}
                      layout="vertical"
                      margin={{ left: 20, right: 20 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        tick={{ fontSize: 12 }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#06B6D4"
                        radius={[8, 8, 8, 8]}
                        isAnimationActive={true}
                        animationDuration={900}
                      />
                      <Tooltip
                        formatter={(value, name) => [`${value}个活动`, name]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 text-xs">暂无时间分配数据</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 右侧可扩展更多分析内容 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white/90 rounded-3xl shadow-xl p-8 border border-slate-100 flex flex-col gap-8 min-h-[420px]"
        >
          <div className="text-lg font-bold text-slate-700 mb-2">
            AI智能分析
          </div>
          <div className="text-slate-600 text-sm mb-4">
            根据你的行程计划，AI为你提供如下建议与洞察：
          </div>
          <ul className="space-y-3 text-slate-700 text-base">
            {aiSuggestions.map((suggestion, index) => (
              <li key={index}>
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 mr-2"></span>
                {suggestion}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
