import { NextRequest, NextResponse } from 'next/server'
import { simpleAuthManager } from '@/lib/simple-auth'
import { userOperations } from '@/lib/api/simple-database'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 验证输入数据
    if (!email || !password) {
      return NextResponse.json({ error: '请填写邮箱和密码' }, { status: 400 })
    }

    // 尝试使用数据库验证用户
    let user = null
    let useDatabase = true

    try {
      // 尝试使用数据库认证
      const dbUser = await userOperations.findByEmail(email)
      if (dbUser) {
        // 从preferences中获取密码（临时方案）
        const preferences = dbUser.preferences as any
        const storedPassword = preferences?.password

        if (storedPassword && storedPassword === password) {
          user = dbUser
          console.log('用户登录成功（数据库）:', user.email)
        }
      }
    } catch (error) {
      console.error('数据库登录失败，使用简单认证:', error)
      useDatabase = false
    }

    // 如果数据库认证失败，使用简单认证系统
    if (!user) {
      try {
        user = await simpleAuthManager.validateCredentials(email, password)
        if (user) {
          console.log('用户登录成功（简单认证）:', user.email)
        }
      } catch (simpleError) {
        console.error('简单认证登录失败:', simpleError)
      }
    }

    // 验证用户登录结果
    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: '登录成功',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('登录过程中出错:', error)
    return NextResponse.json({
      error: '登录失败，请稍后重试'
    }, { status: 500 })
  }
}