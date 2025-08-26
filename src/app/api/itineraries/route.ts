import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { itineraryOperations } from "@/lib/api/simple-database";

// POST - 创建新行程
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "未授权访问" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      userId,
      title,
      destination,
      budget,
      days,
      data,
      isPublic = false,
    } = body;

    // 验证必要字段
    if (!title || !destination || !days) {
      return NextResponse.json(
        { success: false, error: "缺少必要字段" },
        { status: 400 }
      );
    }

    // 确保用户只能为自己创建行程
    const currentUserId = (session.user as any).id;
    if (userId !== currentUserId) {
      return NextResponse.json(
        { success: false, error: "只能为自己创建行程" },
        { status: 403 }
      );
    }

    // 创建行程
    const itinerary = await itineraryOperations.create({
      userId: currentUserId,
      title,
      destination,
      budget,
      days,
      data,
      isPublic,
    });

    if (!itinerary) {
      return NextResponse.json(
        { success: false, error: "创建行程失败" },
        { status: 500 }
      );
    }

    console.log("成功创建行程:", {
      id: itinerary.id,
      title: itinerary.title,
      userId: itinerary.userId,
    });

    return NextResponse.json({
      success: true,
      data: itinerary,
      message: "行程创建成功",
    });
  } catch (error) {
    console.error("创建行程API错误:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "创建行程时出现未知错误",
      },
      { status: 500 }
    );
  }
}

// GET - 获取用户的行程列表
export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "未授权访问" },
        { status: 401 }
      );
    }

    const currentUserId = (session.user as any).id;

    // 获取用户的行程列表
    const itineraries = await itineraryOperations.findByUserId(currentUserId);

    console.log(
      `获取用户 ${currentUserId} 的行程列表，共 ${itineraries.length} 条`
    );

    return NextResponse.json({
      success: true,
      data: itineraries,
      message: "获取行程列表成功",
    });
  } catch (error) {
    console.error("获取行程列表API错误:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "获取行程列表时出现未知错误",
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除行程
export async function DELETE(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "未授权访问" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itineraryId = searchParams.get("id");

    if (!itineraryId) {
      return NextResponse.json(
        { success: false, error: "缺少行程ID" },
        { status: 400 }
      );
    }

    const currentUserId = (session.user as any).id;

    // 验证行程是否属于当前用户
    const itinerary = await itineraryOperations.findById(itineraryId);
    if (!itinerary) {
      return NextResponse.json(
        { success: false, error: "行程不存在" },
        { status: 404 }
      );
    }

    if (itinerary.userId !== currentUserId) {
      return NextResponse.json(
        { success: false, error: "只能删除自己的行程" },
        { status: 403 }
      );
    }

    // 删除行程
    const success = await itineraryOperations.delete(itineraryId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "删除行程失败" },
        { status: 500 }
      );
    }

    console.log("成功删除行程:", {
      id: itineraryId,
      userId: currentUserId,
    });

    return NextResponse.json({
      success: true,
      message: "行程删除成功",
    });
  } catch (error) {
    console.error("删除行程API错误:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "删除行程时出现未知错误",
      },
      { status: 500 }
    );
  }
}
