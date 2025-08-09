import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { userOperations } from '@/lib/api/database'

export async function PUT(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      )
    }

    const { avatarUrl } = await request.json()

    if (!avatarUrl) {
      return NextResponse.json(
        { success: false, error: '头像URL不能为空' },
        { status: 400 }
      )
    }

    console.log('开始保存用户头像到数据库:', {
      userId: session.user.id || session.user.email,
      avatarUrl: avatarUrl
    })

    // 使用数据库操作保存头像
    const updatedUser = await userOperations.updateAvatar(
      session.user.id || session.user.email, 
      avatarUrl
    )

    if (updatedUser) {
      console.log('头像保存到数据库成功:', updatedUser.avatar)
      
      return NextResponse.json({
        success: true,
        data: {
          avatarUrl: updatedUser.avatar,
          updatedAt: new Date().toISOString(),
          userId: updatedUser.id,
          // 提示前端需要更新session
          shouldUpdateSession: true
        }
      })
    } else {
      console.error('头像保存到数据库失败')
      return NextResponse.json(
        { success: false, error: '头像保存失败' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('头像更新API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}