// 这是AI优化行程的API路由
// 作为应届生，我会创建一个用于优化现有行程的API端点

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { optimizeItinerary } from '@/lib/api/openai'
import { itineraryOperations } from '@/lib/api/simple-database'

// POST请求处理函数
export async function POST(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions)

    // 检查用户是否已登录
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    // 解析请求体
    const body = await request.json()
    console.log('收到AI优化行程请求:', body)

    // 验证请求数据
    const { itineraryId, feedback } = body

    // 检查必填字段
    if (!itineraryId || !feedback) {
      return NextResponse.json(
        { success: false, error: '缺少必填参数：itineraryId, feedback' },
        { status: 400 }
      )
    }

    // 验证反馈内容
    if (typeof feedback !== 'string' || feedback.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '反馈内容不能为空' },
        { status: 400 }
      )
    }

    if (feedback.length > 1000) {
      return NextResponse.json(
        { success: false, error: '反馈内容不能超过1000字符' },
        { status: 400 }
      )
    }

    console.log('开始优化行程，ID:', itineraryId, '反馈:', feedback)

    // 获取原始行程
    const originalItinerary = await itineraryOperations.findById(itineraryId)

    if (!originalItinerary) {
      return NextResponse.json(
        { success: false, error: '行程不存在' },
        { status: 404 }
      )
    }

    // 检查用户权限（只能优化自己的行程或有编辑权限的协作行程）
    const userId = (session.user as any).id
    const hasPermission =
      originalItinerary.userId === userId ||
      (originalItinerary as any).collaborations?.some(
        (collab: any) =>
          collab.userId === userId && ['owner', 'editor'].includes(collab.role)
      )

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: '没有权限优化此行程' },
        { status: 403 }
      )
    }

    // 调用AI优化行程
    const optimizedItinerary = await optimizeItinerary(
      originalItinerary as any,
      feedback.trim()
    )

    if (!optimizedItinerary) {
      return NextResponse.json(
        { success: false, error: 'AI优化行程失败，请稍后重试' },
        { status: 500 }
      )
    }

    // 更新数据库中的行程
    const updatedItinerary = await itineraryOperations.update(itineraryId, {
      title: optimizedItinerary.title,
      destination: optimizedItinerary.destination,
      budget: optimizedItinerary.totalBudget,
      days: optimizedItinerary.days.length,
      data: optimizedItinerary.data,
    })

    if (!updatedItinerary) {
      console.error('更新优化后的行程到数据库失败')
      // 即使更新失败，也返回优化后的行程
      return NextResponse.json({
        success: true,
        data: optimizedItinerary,
        message: '行程优化成功，但保存失败',
      })
    }

    console.log('成功优化并更新行程:', updatedItinerary.id)

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: updatedItinerary,
      message: '行程优化成功',
    })
  } catch (error) {
    console.error('AI优化行程API错误:', error)

    // 根据错误类型返回不同的错误信息
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: '请求数据格式错误' },
        { status: 400 }
      )
    }

    // 检查是否是OpenAI API错误
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json(
        { success: false, error: 'AI服务暂时不可用，请稍后重试' },
        { status: 503 }
      )
    }

    // 通用错误响应
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// GET请求处理函数（获取行程的优化历史）
export async function GET(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions)

    // 检查用户是否已登录
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const itineraryId = searchParams.get('itineraryId')

    if (!itineraryId) {
      return NextResponse.json(
        { success: false, error: '缺少行程ID参数' },
        { status: 400 }
      )
    }

    console.log('获取行程优化历史，ID:', itineraryId)

    // 获取行程详情
    const itinerary = await itineraryOperations.findById(itineraryId)

    if (!itinerary) {
      return NextResponse.json(
        { success: false, error: '行程不存在' },
        { status: 404 }
      )
    }

    // 检查用户权限
    const userId = (session.user as any).id
    const hasPermission =
      itinerary.userId === userId ||
      (itinerary as any).collaborations?.some(
        (collab: any) => collab.userId === userId
      )

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: '没有权限查看此行程' },
        { status: 403 }
      )
    }

    // 提取优化历史信息
    const optimizationHistory = []

    // 如果有生成时间，添加原始生成记录
    if (itinerary.data.generatedAt) {
      optimizationHistory.push({
        type: 'generated',
        timestamp: itinerary.data.generatedAt,
        description: '原始行程生成',
      })
    }

    // 如果有优化时间，添加优化记录
    if (itinerary.data.optimizedAt) {
      optimizationHistory.push({
        type: 'optimized',
        timestamp: itinerary.data.optimizedAt,
        description: '行程优化',
        feedback: itinerary.data.optimizationFeedback,
      })
    }

    // 按时间排序
    optimizationHistory.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    // 返回响应
    return NextResponse.json({
      success: true,
      data: {
        itineraryId,
        history: optimizationHistory,
      },
    })
  } catch (error) {
    console.error('获取优化历史API错误:', error)

    return NextResponse.json(
      { success: false, error: '获取优化历史失败' },
      { status: 500 }
    )
  }
}
