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

    const { name, bio, location, website, phone, gender, occupation, interests, socialLinks, preferences, birthday } = await request.json()

    console.log('开始更新用户资料:', {
      userId: session.user.id || session.user.email,
      name,
      bio,
      location,
      website
    })

    // 准备更新数据
    const updateData: any = {
      name,
      bio: bio || null,
      location: location || null,
      website: website || null,
      phone: phone || null,
      gender: gender || null,
      occupation: occupation || null,
      interests: interests || null,
      socialLinks: socialLinks || null,
      preferences: preferences || null
    }

    // 处理生日日期
    if (birthday) {
      updateData.birthday = new Date(birthday)
    }

    // 使用数据库操作更新用户信息
    const updatedUser = await userOperations.update(
      session.user.id || session.user.email,
      updateData
    )

    if (updatedUser) {
      console.log('用户资料更新成功:', updatedUser.name)
      return NextResponse.json({
        success: true,
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          bio: updatedUser.bio,
          location: updatedUser.location,
          website: updatedUser.website,
          phone: updatedUser.phone,
          gender: updatedUser.gender,
          occupation: updatedUser.occupation,
          interests: updatedUser.interests,
          avatar: updatedUser.avatar,
          socialLinks: updatedUser.socialLinks,
          preferences: updatedUser.preferences,
          birthday: updatedUser.birthday,
          updatedAt: new Date().toISOString()
        }
      })
    } else {
      console.error('用户资料更新失败')
      return NextResponse.json(
        { success: false, error: '用户资料更新失败' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('用户资料更新API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      )
    }

    // 获取用户信息
    const user = await userOperations.findByEmail(session.user.email)
    
    if (user) {
      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          location: user.location,
          website: user.website,
          phone: user.phone,
          gender: user.gender,
          occupation: user.occupation,
          interests: user.interests,
          avatar: user.avatar,
          socialLinks: user.socialLinks,
          preferences: user.preferences,
          birthday: user.birthday,
          createdAt: user.createdAt
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('获取用户资料API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}