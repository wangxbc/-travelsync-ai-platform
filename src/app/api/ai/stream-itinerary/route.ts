import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateItineraryStream } from '@/lib/api/openai'
import type { TravelInput } from '@/types'

// POST请求处理函数（流式响应）
export async function POST(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions)
    
    // 检查用户是否已登录
    if (!session || !session.user) {
      return new Response('请先登录', { status: 401 })
    }

    // 解析请求体
    const body = await request.json()
    console.log('收到AI流式生成行程请求:', body)

    // 验证请求数据
    const { destination, budget, days, interests, travelStyle }: TravelInput = body

    // 检查必填字段
    if (!destination || !budget || !days) {
      return new Response('缺少必填参数', { status: 400 })
    }

    // 验证数据类型和范围
    if (typeof budget !== 'number' || budget <= 0) {
      return new Response('预算必须是大于0的数字', { status: 400 })
    }

    if (typeof days !== 'number' || days <= 0 || days > 30) {
      return new Response('天数必须是1-30之间的数字', { status: 400 })
    }

    if (!Array.isArray(interests)) {
      return new Response('兴趣偏好必须是数组', { status: 400 })
    }

    if (!['budget', 'comfort', 'luxury'].includes(travelStyle)) {
      return new Response('旅行风格参数错误', { status: 400 })
    }

    // 构建输入数据
    const travelInput: TravelInput = {
      destination: destination.trim(),
      budget,
      days,
      interests: interests.filter(interest => typeof interest === 'string' && interest.trim().length > 0),
      travelStyle
    }

    console.log('开始流式生成行程，输入数据:', travelInput)

    // 创建可读流
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 发送开始信号
          controller.enqueue(encoder.encode('data: {"type":"start","message":"开始生成行程..."}\n\n'))

          // 调用AI流式生成
          const aiStream = generateItineraryStream(travelInput)
          
          let fullResponse = '' // 累积完整响应
          
          // 逐步处理AI响应
          for await (const chunk of aiStream) {
            fullResponse += chunk
            
            // 发送流式数据
            const data = {
              type: 'chunk',
              content: chunk,
              fullContent: fullResponse
            }
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          }

          // 发送完成信号
          controller.enqueue(encoder.encode('data: {"type":"complete","message":"行程生成完成"}\n\n'))
          
          console.log('流式生成完成')
          
        } catch (error) {
          console.error('流式生成过程中出错:', error)
          
          // 发送错误信号
          const errorData = {
            type: 'error',
            message: error instanceof Error ? error.message : '生成过程中出现错误'
          }
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`))
        } finally {
          // 关闭流
          controller.close()
        }
      }
    })

    // 返回流式响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream', 
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive', 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST', 
        'Access-Control-Allow-Headers': 'Content-Type', 
      },
    })

  } catch (error) {
    console.error('流式API错误:', error)
    
    // 返回错误响应
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : '服务器内部错误' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}