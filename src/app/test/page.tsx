"use client";

import { useState } from "react";
import type { TravelInput, Itinerary } from "@/types";

export default function TestPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testCases = [
    {
      name: "邯郸购物娱乐测试",
      data: {
        departure: "北京",
        destination: "邯郸",
        budget: 2000,
        days: 3,
        interests: ["购物娱乐"],
        travelStyle: "comfort",
      },
    },
    {
      name: "邯郸历史文化测试",
      data: {
        departure: "北京",
        destination: "邯郸",
        budget: 2000,
        days: 3,
        interests: ["历史文化"],
        travelStyle: "comfort",
      },
    },
    {
      name: "上海购物娱乐测试",
      data: {
        departure: "北京",
        destination: "上海",
        budget: 3000,
        days: 3,
        interests: ["购物娱乐"],
        travelStyle: "comfort",
      },
    },
  ];

  const runTest = async (testCase: any) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      console.log(`开始测试: ${testCase.name}`);
      console.log("测试数据:", testCase.data);

      const response = await fetch("/api/ai/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testCase.data),
      });

      const data = await response.json();
      console.log("API响应:", data);

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (e) {
      console.error("测试失败:", e);
      setError("测试失败，请检查控制台");
    } finally {
      setIsGenerating(false);
    }
  };

  const testLockedActivities = async () => {
    if (!result) {
      setError("请先生成行程");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 锁定第一个活动的ID
      const firstActivityId = result.days?.[0]?.activities?.[0]?.id;
      if (!firstActivityId) {
        setError("没有找到可锁定的活动");
        return;
      }

      console.log("锁定活动ID:", firstActivityId);

      const response = await fetch("/api/ai/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...testCases[0].data,
          lockedActivities: [firstActivityId],
          existingItinerary: result,
        }),
      });

      const data = await response.json();
      console.log("重新生成响应:", data);

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (e) {
      console.error("锁定活动测试失败:", e);
      setError("锁定活动测试失败");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            AI智能推荐功能测试
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            测试热门景点推荐和锁定活动功能
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：测试控制 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              测试用例
            </h2>

            <div className="space-y-4">
              {testCases.map((testCase, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {testCase.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    目的地: {testCase.data.destination} | 兴趣:{" "}
                    {testCase.data.interests.join(", ")}
                  </p>
                  <button
                    onClick={() => runTest(testCase)}
                    disabled={isGenerating}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isGenerating ? "生成中..." : "运行测试"}
                  </button>
                </div>
              ))}

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">锁定活动测试</h3>
                <p className="text-sm text-gray-600 mb-3">
                  测试锁定活动后重新生成功能
                </p>
                <button
                  onClick={testLockedActivities}
                  disabled={isGenerating || !result}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isGenerating ? "测试中..." : "测试锁定活动"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800">错误信息</h4>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            )}
          </div>

          {/* 右侧：测试结果 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              测试结果
            </h2>

            {result ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {result.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    总预算: ¥{result.totalBudget} | 天数:{" "}
                    {result.days?.length || 0}
                  </p>
                </div>

                {result.days?.map((day: any, dayIndex: number) => (
                  <div key={dayIndex} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      第{day.day}天
                    </h4>
                    <div className="space-y-2">
                      {day.activities?.map(
                        (activity: any, actIndex: number) => (
                          <div key={actIndex} className="text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {activity.name}
                              </span>
                              <span className="text-gray-500">
                                {activity.startTime} - {activity.endTime}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {activity.category}
                              </span>
                              {activity.matchedInterests?.map(
                                (interest: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                                  >
                                    {interest}
                                  </span>
                                )
                              )}
                              {activity.isLocked && (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  已锁定
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                点击左侧测试用例开始测试
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
