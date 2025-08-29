"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRequireAuth, useCurrentUser } from "@/lib/hooks/useAuth";
import { useAI } from "@/lib/hooks/useAI";
import { useToast } from "@/components/ui/Toast";
import type { TravelInput, Itinerary } from "@/types";
import type { DayPlan, Activity } from "@/types";


export default function PlanningPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  // 路由保护，确保用户已登录
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { user } = useCurrentUser();
  const { showSuccessToast, showErrorToast, showWarningToast } = useToast();

  // 使用AI Hook
  const {
    isGenerating: aiGenerating,
    error,
    generateItinerary,
    clearError,
  } = useAI();

  // 表单状态
  const [formData, setFormData] = useState<TravelInput>({
    departure: "",
    destination: "", 
    budget: 2000,
    days: 3, 
    interests: [], 
    travelStyle: "comfort",
  });

  // 生成的行程
  const [generatedItinerary, setGeneratedItinerary] =
    useState<Itinerary | null>(null);

  // 当前显示的天数（从0开始）
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const [lockedActivities, setLockedActivities] = useState<Set<string>>(
    new Set()
  );

  // 错误信息
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "budget" || name === "days" ? Number(value) : value,
    }));
  };

  // 处理兴趣选择（最多3个）
  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => {
      if (prev.interests.includes(interest)) {
        // 如果已选中，则取消选择
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest),
        };
      } else {
        // 如果未选中，检查是否已达到最大数量
        if (prev.interests.length >= 3) {
          showWarningToast("最多只能选择3个兴趣偏好");
          return prev;
        }
        return {
          ...prev,
          interests: [...prev.interests, interest],
        };
      }
    });
  };

  // 切换活动锁定状态
  const toggleActivityLock = (activityId: string) => {
    setLockedActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  // 保存行程到数据库和地图页面
  const saveItineraryToMap = async () => {
    if (!generatedItinerary) {
      setErrorMsg("请先生成行程，然后再保存");
      return;
    }

    if (!isAuthenticated || !user) {
      setErrorMsg("请先登录后再保存行程");
      return;
    }

    try {
      // 统计预算分布
      let budgetMap: Record<string, number> = {};
      let timeMap: Record<string, number> = {};
      if (generatedItinerary && generatedItinerary.days) {
        for (const day of generatedItinerary.days) {
          for (const act of day.activities) {
            // 预算分布
            const cat = act.category || "其他";
            // 将英文类别名称转换为中文
            const categoryMap: Record<string, string> = {
              attraction: "景点游览",
              restaurant: "餐饮美食",
              hotel: "住宿",
              transport: "交通",
              shopping: "购物",
              leisure: "休闲娱乐",
              other: "其他",
            };
            const chineseCategory = categoryMap[cat] || cat;
            budgetMap[chineseCategory] =
              (budgetMap[chineseCategory] || 0) + (act.cost || 0);
            // 时间分配（以活动数为单位）
            timeMap[chineseCategory] = (timeMap[chineseCategory] || 0) + 1;
          }
        }
      }
      // 转为数组
      const budgetBreakdown = Object.entries(budgetMap).map(
        ([name, value]) => ({ name, value })
      );
      const timeBreakdown = Object.entries(timeMap).map(([name, value]) => ({
        name,
        value,
      }));

      // 准备保存到数据库的数据
      const dbItineraryData = {
        userId: user.id,
        title: `${formData.destination}${formData.days}日游`,
        destination: formData.destination,
        budget: formData.budget,
        days: formData.days,
        data: {
          departure: formData.departure,
          interests: formData.interests,
          travelStyle: formData.travelStyle,
          itinerary: generatedItinerary,
          budgetBreakdown,
          timeBreakdown,
          budgetMap,
          timeMap,
          createdAt: new Date().toISOString(),
        },
        isPublic: false,
      };

      // 保存到数据库
      const response = await fetch("/api/itineraries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dbItineraryData),
      });

      if (!response.ok) {
        throw new Error("保存到数据库失败");
      }

      const result = await response.json();
      console.log("行程已保存到数据库:", result);

      showSuccessToast(
        "行程已保存到数据库！现在可以在个人资料、地图页面和数据分析页面查看"
      );
      console.log(
        "行程已保存到数据库:",
        `${formData.destination}${formData.days}日游`,
        "用户:",
        user.email || user.id
      );
    } catch (error) {
      console.error("保存行程失败:", error);
      setErrorMsg("保存行程失败，请重试");
    }
  };

  // 重新生成未锁定活动
  const regenerateUnlocked = async () => {
    if (!generatedItinerary) {
      setErrorMsg("请先生成行程，然后再重新生成未锁定活动");
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    try {
      // 确保有兴趣偏好
      let interests = [...formData.interests];
      if (interests.length === 0) {
        interests = ["历史文化", "美食体验"];
      }

      const response = await fetch("/api/ai/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData, // 你的表单数据
          interests: interests, // 使用处理后的兴趣偏好
          lockedActivities: Array.from(lockedActivities),
          existingItinerary: generatedItinerary, // 传递现有行程数据
        }),
      });
      const result = await response.json();
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setGeneratedItinerary(result.data || result);
      }
    } catch (e) {
      setErrorMsg("生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // 验证表单
    if (!formData.destination.trim()) {
      showWarningToast("请输入目的地");
      return;
    }

    if (formData.budget <= 0) {
      showWarningToast("预算必须大于0");
      return;
    }

    if (formData.days <= 0 || formData.days > 30) {
      showWarningToast("天数必须在1-30之间");
      return;
    }

    // 如果没有选择兴趣偏好，自动添加默认兴趣偏好
    let interests = [...formData.interests];
    if (interests.length === 0) {
      interests = ["历史文化", "美食体验"]; // 默认添加两个兴趣偏好
      console.log("用户未选择兴趣偏好，自动添加默认兴趣：", interests);
    }

    // 清除之前的结果，确保重新生成
    setGeneratedItinerary(null);
    setCurrentDayIndex(0); // 重置到第一天

    // 准备生成参数，包含锁定的活动信息
    const generateParams = {
      ...formData,
      interests: interests, // 使用处理后的兴趣偏好
      lockedActivities: Array.from(lockedActivities),
      ...(generatedItinerary ? { existingItinerary: generatedItinerary } : {}), // 只在有值时传递
    };

    console.log("提交生成参数:", generateParams);

    // 生成行程
    const result = await generateItinerary(generateParams);
    if (result) {
      setGeneratedItinerary(result);
      // 注意：这里不再自动保存，需要用户手动点击保存按钮
    } else {
      setErrorMsg("生成行程失败，请重试");
    }
  };

  // 兴趣选项
  const interestOptions = [
    "历史文化",
    "自然风光",
    "美食体验",
    "购物娱乐",
    "艺术博物馆",
    "户外运动",
    "夜生活",
    "摄影",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
              AI智能旅行规划
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              基于先进AI技术，为您量身定制专属旅行体验
            </p>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-stretch">
            {/* 左侧：输入表单 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="xl:col-span-2"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center mb-6">
                  
                  <h2 className="text-xl font-bold text-slate-900">旅行需求</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 出发地 */}
                  <div className="group">
                    <label className="flex items-center text-xs font-medium text-slate-700 mb-2">
                      <span className="ml-2">出发地</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="departure"
                        name="departure"
                        value={formData.departure}
                        onChange={handleInputChange}
                        placeholder="例如：北京、上海、杭州（可选）"
                        className="w-full px-3 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder-slate-400 text-sm"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* 目的地 */}
                  <div className="group">
                    <label className="flex items-center text-xs font-medium text-slate-700 mb-2">
                      <span className="ml-2">目的地</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="destination"
                        name="destination"
                        value={formData.destination}
                        onChange={handleInputChange}
                        placeholder="例如：北京、上海、杭州"
                        className="w-full px-3 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-900 placeholder-slate-400 text-sm"
                        required
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* 预算和天数 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="group">
                      <label className="flex items-center text-xs font-medium text-slate-700 mb-2">
                        <span className="ml-2">预算</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          min="100"
                          max="100000"
                          className="w-full px-3 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-900 text-sm"
                          required
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">
                          元
                        </span>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>

                    <div className="group">
                      <label className="flex items-center text-xs font-medium text-slate-700 mb-2">
                        <span className="ml-2">天数</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="days"
                          name="days"
                          value={formData.days}
                          onChange={handleInputChange}
                          min="1"
                          max="30"
                          className="w-full px-3 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-900 text-sm"
                          required
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs">
                          天
                        </span>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  {/* 旅行风格 */}
                  <div className="group">
                    <label className="flex items-center text-xs font-medium text-slate-700 mb-2">
                      <span className="ml-2">旅行风格</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          value: "budget",
                          label: "经济型",
                          desc: "性价比优先",
                          color: "from-green-500 to-emerald-600",
                        },
                        {
                          value: "comfort",
                          label: "舒适型",
                          desc: "品质体验",
                          color: "from-blue-500 to-indigo-600",
                        },
                        {
                          value: "luxury",
                          label: "豪华型",
                          desc: "奢华享受",
                          color: "from-purple-500 to-pink-600",
                        },
                      ].map((style) => (
                        <label key={style.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="travelStyle"
                            value={style.value}
                            checked={formData.travelStyle === style.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div
                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                              formData.travelStyle === style.value
                                ? `border-blue-500 bg-gradient-to-r ${style.color} text-white shadow-lg`
                                : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                            }`}
                          >
                            <div className="text-center">
                              <div className="font-semibold text-xs">
                                {style.label}
                              </div>
                              <div
                                className={`text-xs mt-1 ${
                                  formData.travelStyle === style.value
                                    ? "text-white/80"
                                    : "text-slate-500"
                                }`}
                              >
                                {style.desc}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 兴趣偏好 */}
                  <div>
                    <label className="flex items-center text-xs font-medium text-slate-700 mb-2">
                      <span className="ml-2">兴趣偏好</span>
                      <span className="ml-2 text-xs text-slate-500">
                        (最多选择3个)
                      </span>
                    </label>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">
                          已选择：{formData.interests.length}/3
                        </span>
                        <div className="flex space-x-1">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                i <= formData.interests.length
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {interestOptions.map((interest) => {
                        const isSelected =
                          formData.interests.includes(interest);
                        const isDisabled =
                          !isSelected && formData.interests.length >= 3;

                        const interestIcons = {
                          历史文化: "历史",
                          自然风光: "自然",
                          美食体验: "美食",
                          购物娱乐: "购物",
                          艺术博物馆: "艺术",
                          户外运动: "运动",
                          夜生活: "夜生活",
                          摄影: "摄影",
                        };

                        return (
                          <motion.label
                            key={interest}
                            whileHover={!isDisabled ? { scale: 1.02 } : {}}
                            whileTap={!isDisabled ? { scale: 0.98 } : {}}
                            className={`cursor-pointer ${
                              isDisabled ? "cursor-not-allowed" : ""
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleInterestToggle(interest)}
                              disabled={isDisabled}
                              className="sr-only"
                            />
                            <div
                              className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                                isSelected
                                  ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
                                  : isDisabled
                                  ? "border-slate-200 bg-slate-50 opacity-50"
                                  : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                              }`}
                            >
                              <div className="flex items-center">
                                <span className="text-base mr-2">
                                  {
                                    interestIcons[
                                      interest as keyof typeof interestIcons
                                    ]
                                  }
                                </span>
                                <span
                                  className={`text-xs font-medium ${
                                    isSelected
                                      ? "text-blue-700"
                                      : isDisabled
                                      ? "text-slate-400"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {interest}
                                </span>
                                {isSelected && (
                                  <div className="ml-auto w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                    ✓
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.label>
                        );
                      })}
                    </div>

                    {/* 已选择的兴趣标签显示 */}
                    {formData.interests.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl"
                      >
                        <div className="text-xs font-medium text-slate-600 mb-2">
                          已选择的兴趣：
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.interests.map((interest) => (
                            <motion.span
                              key={interest}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                            >
                              {interest}
                              <button
                                type="button"
                                onClick={() => handleInterestToggle(interest)}
                                className="ml-2 text-white/80 hover:text-white transition-colors"
                              >
                                ×
                              </button>
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* 错误信息 */}
                  {(error || errorMsg) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-2xl"
                    >
                      <div className="flex items-center">
                        <div className="text-sm text-red-700">
                          {error || errorMsg}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* 提交按钮 */}
                  <div className="space-y-3">
                    <motion.button
                      type="submit"
                      disabled={isGenerating}
                      whileHover={!isGenerating ? { scale: 1.02 } : {}}
                      whileTap={!isGenerating ? { scale: 0.98 } : {}}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                      <div className="relative flex items-center justify-center">
                        {isGenerating ? (
                          <>
                            <span className="animate-spin mr-3 text-lg">
                              AI
                            </span>
                            AI正在生成行程...
                          </>
                        ) : (
                          <>
                            <span>生成专属旅行计划</span>
                          </>
                        )}
                      </div>
                    </motion.button>

                    {generatedItinerary && (
                      <div className="space-y-3">
                        <motion.button
                          type="button"
                          onClick={saveItineraryToMap}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          保存计划
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={regenerateUnlocked}
                          disabled={isGenerating}
                          whileHover={!isGenerating ? { scale: 1.02 } : {}}
                          whileTap={!isGenerating ? { scale: 0.98 } : {}}
                          className="w-full bg-white border-2 border-blue-200 text-blue-600 py-3 px-6 rounded-2xl font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          重新生成未锁定活动
                        </motion.button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>

            {/* 右侧：智能行程规划 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="xl:col-span-3"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 flex flex-col h-full">
                {/* 统计区和行程区内容全部放入这里，原有内容顺序不变 */}
                {/* 行程统计区（原本的统计区内容） */}
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">
                    智能行程规划
                  </h2>
                </div>

                {!generatedItinerary && !isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                  >
                    <h3 className="text-xl font-semibold text-slate-700 mb-3">
                      准备开始您的旅程
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                      填写左侧表单信息，AI将为您量身定制专属的旅行计划，让每一次出行都成为难忘的回忆
                    </p>
                  </motion.div>
                )}

                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                      <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-3">
                      AI正在精心规划您的行程
                    </h3>
                    <p className="text-slate-500">
                      正在分析您的需求，生成个性化旅行方案...
                    </p>
                  </motion.div>
                )}

                {generatedItinerary && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* 兴趣匹配度总览 */}
                    {(() => {
                      const totalActivities = generatedItinerary.days?.reduce(
                        (total: number, day: any) => total + (day.activities?.length || 0), 0
                      ) || 0;
                      const matchedActivities = generatedItinerary.days?.reduce(
                        (total: number, day: any) =>
                          total + (day.activities?.filter((act: any) => 
                            act.matchedInterests && act.matchedInterests.length > 0
                          ).length || 0), 0
                      ) || 0;
                      const matchRate = totalActivities > 0 ? Math.round((matchedActivities / totalActivities) * 100) : 0;
                      
                      if (formData.interests.length > 0 && matchedActivities > 0) {
                        return (
                          <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 flex-shrink-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">🎯</span>
                                <div>
                                  <div className="text-sm font-semibold text-purple-700">
                                    兴趣匹配度 {matchRate}%
                                  </div>
                                  <div className="text-xs text-purple-600">
                                    {matchedActivities}/{totalActivities} 个活动匹配您的兴趣偏好
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                {formData.interests.slice(0, 3).map((interest: string, idx: number) => (
                                  <span 
                                    key={idx}
                                    className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                                  >
                                    {interest}
                                  </span>
                                ))}
                                {formData.interests.length > 3 && (
                                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                                    +{formData.interests.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* 行程概览 */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex-shrink-0">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-xl font-bold text-blue-600">
                            {generatedItinerary.days?.length || 0}
                          </div>
                          <div className="text-xs text-slate-600">天数</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-indigo-600">
                            ¥{generatedItinerary.totalBudget || formData.budget}
                          </div>
                          <div className="text-xs text-slate-600">计划预算</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-green-600">
                            ¥
                            {generatedItinerary.actualExpense?.total ||
                              generatedItinerary.days?.reduce(
                                (total: number, day: any) =>
                                  total + (day.totalBudget || 0),
                                0
                              ) ||
                              0}
                          </div>
                          <div className="text-xs text-slate-600">实际花费</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-purple-600">
                            {generatedItinerary.days?.reduce(
                              (total: number, day: any) =>
                                total + (day.activities?.length || 0),
                              0
                            ) || 0}
                          </div>
                          <div className="text-xs text-slate-600">活动数</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-orange-600">
                            {generatedItinerary.budgetComparison
                              ?.utilizationRate ||
                              Math.round(
                                ((generatedItinerary.actualExpense?.total ||
                                  0) /
                                  (generatedItinerary.totalBudget ||
                                    formData.budget)) *
                                  100
                              )}
                            %
                          </div>
                          <div className="text-xs text-slate-600">
                            预算使用率
                          </div>
                        </div>
                        {/* 兴趣匹配统计 */}
                        <div>
                          <div className="text-xl font-bold text-pink-600">
                            {(() => {
                              const matchedCount = generatedItinerary.days?.reduce(
                                (total: number, day: any) =>
                                  total + (day.activities?.filter((act: any) => 
                                    act.matchedInterests && act.matchedInterests.length > 0
                                  ).length || 0),
                                0
                              ) || 0;
                              return matchedCount;
                            })()}
                          </div>
                          <div className="text-xs text-slate-600">
                            兴趣匹配
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 预算对比信息 */}
                    {generatedItinerary.budgetComparison && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-slate-700">
                              预算对比
                            </span>
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              generatedItinerary.budgetComparison.isOverBudget
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {generatedItinerary.budgetComparison.isOverBudget
                              ? "超预算"
                              : "在预算内"}
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <div className="text-slate-500">计划预算</div>
                            <div className="font-bold text-slate-700">
                              ¥
                              {
                                generatedItinerary.budgetComparison
                                  .plannedBudget
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-500">实际花费</div>
                            <div className="font-bold text-slate-700">
                              ¥
                              {
                                generatedItinerary.budgetComparison
                                  .actualExpense
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-500">
                              {generatedItinerary.budgetComparison.difference >=
                              0
                                ? "节省"
                                : "超支"}
                            </div>
                            <div
                              className={`font-bold ${
                                generatedItinerary.budgetComparison
                                  .difference >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              ¥
                              {Math.abs(
                                generatedItinerary.budgetComparison.difference
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 天数切换导航 */}
                    <div className="flex items-center justify-center mb-4 space-x-3 flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setCurrentDayIndex((i) => Math.max(0, i - 1))
                        }
                        disabled={currentDayIndex === 0}
                        className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm text-lg"
                      >
                        ←
                      </motion.button>

                      <div className="flex space-x-2">
                        {generatedItinerary.days?.map((_: any, idx: number) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentDayIndex(idx)}
                            className={`w-12 h-12 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-sm ${
                              idx === currentDayIndex
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                                : "bg-white text-slate-600 border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                            }`}
                          >
                            Day {idx + 1}
                          </motion.button>
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setCurrentDayIndex((i) =>
                            Math.min(generatedItinerary.days.length - 1, i + 1)
                          )
                        }
                        disabled={
                          currentDayIndex === generatedItinerary.days.length - 1
                        }
                        className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm text-lg"
                      >
                        →
                      </motion.button>
                    </div>

                    {/* 动画卡片切换 */}
                    <div className="flex-1 relative overflow-hidden">
                      <div className="absolute inset-0 overflow-y-auto">
                        <motion.div
                          key={currentDayIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="w-full"
                        >
                          {(() => {
                            const day =
                              generatedItinerary.days[currentDayIndex];
                            return (
                              <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-4 shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                  <div>
                                    <h4 className="text-xl font-bold text-slate-900">
                                      第{day.day}天行程
                                    </h4>
                                    <p className="text-sm text-slate-500 mt-1">
                                      {day.date}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-blue-600">
                                      ¥{day.totalBudget}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      当天预算
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  {day.activities?.map(
                                    (activity: any, actIndex: number) => (
                                      <motion.div
                                        key={actIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: actIndex * 0.05 }}
                                        className="group relative bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all duration-200 w-full"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3 flex-1">
                                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                              {actIndex + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center space-x-2 mb-1">
                                                <h5 className="font-medium text-slate-900 text-sm truncate">
                                                  {activity.name}
                                                </h5>
                                                
                                                {/* 兴趣偏好匹配标识 */}
                                                {activity.matchedInterests && activity.matchedInterests.length > 0 && (
                                                  <div className="flex items-center space-x-1">
                                                    {activity.matchedInterests.slice(0, 2).map((interest: string, idx: number) => (
                                                      <span 
                                                        key={idx}
                                                        className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full border border-purple-200"
                                                        title={`匹配您的兴趣：${interest}`}
                                                      >
                                                        {interest}
                                                      </span>
                                                    ))}
                                                    {activity.matchedInterests.length > 2 && (
                                                      <span 
                                                        className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full border border-purple-200"
                                                        title={`还匹配 ${activity.matchedInterests.length - 2} 个兴趣`}
                                                      >
                                                        +{activity.matchedInterests.length - 2}
                                                      </span>
                                                    )}
                                                  </div>
                                                )}
                                                
                                                {activity.recommendationReason && (
                                                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-md">
                                                    {
                                                      activity.recommendationReason
                                                    }
                                                  </span>
                                                )}
                                                {activity.category &&
                                                  activity.category !==
                                                    "attraction" && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-md">
                                                      {activity.category ===
                                                      "hotel"
                                                        ? "住宿"
                                                        : activity.category ===
                                                          "restaurant"
                                                        ? "餐饮"
                                                        : activity.category}
                                                    </span>
                                                  )}
                                                {lockedActivities.has(
                                                  activity.id
                                                ) && (
                                                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-md">
                                                    已锁定
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center space-x-4 text-xs text-slate-500">
                                                <span>
                                                  {activity.startTime} -{" "}
                                                  {activity.endTime}
                                                </span>
                                                {activity.location?.address && (
                                                  <span className="truncate">
                                                    {activity.location.address}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center space-x-3 ml-4">
                                            <div className="text-right">
                                              <div className="text-sm font-bold text-indigo-600">
                                                ¥{activity.cost || 0}
                                              </div>
                                            </div>
                                            <button
                                              onClick={() =>
                                                toggleActivityLock(activity.id)
                                              }
                                              className={`p-1.5 rounded-lg text-xs transition-all duration-200 ${
                                                lockedActivities.has(
                                                  activity.id
                                                )
                                                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                                  : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                              }`}
                                            >
                                              {lockedActivities.has(activity.id)
                                                }
                                            </button>
                                          </div>
                                        </div>

                                        {activity.description && (
                                          <div className="mt-2 pl-9">
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                              {activity.description}
                                            </p>
                                          </div>
                                        )}
                                      </motion.div>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
