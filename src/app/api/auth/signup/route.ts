import { NextRequest, NextResponse } from 'next/server'
import { userOperations } from '@/lib/api/simple-database'
import { simpleAuthManager } from '@/lib/simple-auth'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // 验证输入数据
    if (!name || !email || !password) {
      return NextResponse.json({ error: '请填写所有必填字段' }, { status: 400 })
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json({ error: '密码长度至少为6位' }, { status: 400 })
    }

    // 尝试使用数据库创建用户
    let newUser = null
    let useDatabase = true

    try {
      // 检查用户是否已存在（数据库）
      const existingUser = await userOperations.findByEmail(email)
      if (existingUser) {
        return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 })
      }

      // 创建新用户（数据库）
      newUser = await userOperations.create({
        email,
        name,
        preferences: {
          password: password, 
          theme: 'light',
          language: 'zh-CN',
        },
      })

      if (newUser) {
        console.log('用户注册成功（数据库）:', newUser.email)
      } else {
        throw new Error('数据库用户创建返回null')
      }
    } catch (error) {
      console.error('数据库注册失败，使用简单认证:', error)
      useDatabase = false

      // 回退到简单认证系统
      try {
        // 检查用户是否已存在（简单认证）
        const existingUser = await simpleAuthManager.findByEmail(email)
        if (existingUser) {
          return NextResponse.json({ error: '该邮箱已被注册' }, { status: 400 })
        }

        // 创建新用户（简单认证）
        newUser = await simpleAuthManager.createUser({
          name,
          email,
          password,
        })

        if (newUser) {
          console.log('用户注册成功（简单认证）:', newUser.email)
        } else {
          throw new Error('简单认证用户创建返回null')
        }
      } catch (simpleError) {
        console.error('简单认证注册也失败:', simpleError)
        return NextResponse.json(
          { error: '注册失败，请稍后重试' },
          { status: 500 }
        )
      }
    }

    // 确保newUser不为null
    if (!newUser) {
      return NextResponse.json({ error: '用户创建失败' }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: '注册成功',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
        authType: useDatabase ? 'database' : 'simple',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('注册API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
