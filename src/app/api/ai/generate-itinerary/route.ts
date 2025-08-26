// 这是AI生成行程的API路由
// 作为应届生，我会创建一个简单但功能完整的API端点

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateRealItinerary } from "@/lib/api/realItinerary";
import { itineraryOperations } from "@/lib/api/database";
import type { TravelInput } from "@/types";

// POST请求处理函数
export async function POST(request: NextRequest) {
  try {
    console.log("=== 开始处理AI生成行程请求 ===");

    // 获取用户会话
    const session = await getServerSession(authOptions);

    // 检查用户是否已登录
    if (!session || !session.user) {
      console.log("用户未登录，返回401错误");
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    console.log("收到AI生成行程请求:", JSON.stringify(body, null, 2));

    // 验证请求数据
    const {
      departure,
      destination,
      budget,
      days,
      interests,
      travelStyle,
      lockedActivities,
      existingItinerary,
    }: TravelInput = body;

    // 检查必填字段
    if (!destination || !budget || !days) {
      console.log("缺少必填参数:", { destination, budget, days });
      return NextResponse.json(
        { success: false, error: "缺少必填参数：destination, budget, days" },
        { status: 400 }
      );
    }

    // 验证数据类型和范围
    if (typeof budget !== "number" || budget <= 0) {
      console.log("预算参数无效:", budget);
      return NextResponse.json(
        { success: false, error: "预算必须是大于0的数字" },
        { status: 400 }
      );
    }

    if (typeof days !== "number" || days <= 0 || days > 30) {
      console.log("天数参数无效:", days);
      return NextResponse.json(
        { success: false, error: "天数必须是1-30之间的数字" },
        { status: 400 }
      );
    }

    if (!Array.isArray(interests)) {
      console.log("兴趣偏好参数无效:", interests);
      return NextResponse.json(
        { success: false, error: "兴趣偏好必须是数组" },
        { status: 400 }
      );
    }

    if (!["budget", "comfort", "luxury"].includes(travelStyle)) {
      console.log("旅行风格参数无效:", travelStyle);
      return NextResponse.json(
        { success: false, error: "旅行风格必须是budget、comfort或luxury之一" },
        { status: 400 }
      );
    }

    // 构建输入数据
    const travelInput: TravelInput = {
      departure: departure?.trim(),
      destination: destination.trim(),
      budget,
      days,
      interests: interests.filter(
        (interest) => typeof interest === "string" && interest.trim().length > 0
      ),
      travelStyle,
      lockedActivities: lockedActivities || [],
      existingItinerary: existingItinerary || null,
    };

    console.log("验证后的输入数据:", JSON.stringify(travelInput, null, 2));

    // 调用真实智能行程生成
    console.log("开始调用generateRealItinerary函数...");
    const generatedItinerary = await generateRealItinerary({
      departure: travelInput.departure,
      destination: travelInput.destination,
      date: body.date || new Date().toISOString().split("T")[0],
      days: travelInput.days,
      interests: travelInput.interests,
      lockedActivities: travelInput.lockedActivities,
      budget: travelInput.budget,
    });

    if (!generatedItinerary) {
      console.error("generateRealItinerary返回null");
      return NextResponse.json(
        { success: false, error: "AI生成行程失败，请稍后重试" },
        { status: 500 }
      );
    }

    console.log("成功生成行程:", {
      title: generatedItinerary.title,
      destination: generatedItinerary.destination,
      days: generatedItinerary.days?.length || 0,
      totalBudget: generatedItinerary.totalBudget,
    });

    // 直接返回生成的行程（暂时跳过数据库保存以避免错误）
    console.log("=== AI生成行程请求处理完成 ===");

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: generatedItinerary,
      message: "行程生成成功",
    });
  } catch (error) {
    console.error("AI生成行程过程中出现错误:", error);

    // 返回详细的错误信息
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "生成行程时出现未知错误",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

// GET请求处理函数（获取用户的行程列表）
export async function GET(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions);

    // 检查用户是否已登录
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    console.log(
      "获取用户行程列表，用户ID:",
      (session.user as any).id,
      "页码:",
      page,
      "限制:",
      limit
    );

    // 获取用户的行程列表
    const itineraries = await itineraryOperations.findByUserId(
      (session.user as any).id
    );

    // 简单的分页处理
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItineraries = itineraries.slice(startIndex, endIndex);

    // 返回响应
    return NextResponse.json({
      success: true,
      data: {
        itineraries: paginatedItineraries,
        pagination: {
          page,
          limit,
          total: itineraries.length,
          totalPages: Math.ceil(itineraries.length / limit),
        },
      },
    });
  } catch (error) {
    console.error("获取行程列表API错误:", error);

    return NextResponse.json(
      { success: false, error: "获取行程列表失败" },
      { status: 500 }
    );
  }
}
