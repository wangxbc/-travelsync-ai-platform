import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: '没有找到文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '不支持的文件类型' },
        { status: 400 }
      )
    }

    // 验证文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '文件大小不能超过5MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 生成唯一文件名
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `avatar_${timestamp}.${extension}`

    // 保存到public/uploads目录
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filepath = join(uploadDir, filename)

    try {
      // 确保uploads目录存在
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
        console.log('📁 创建uploads目录:', uploadDir)
      }

      await writeFile(filepath, buffer)
      console.log('✅ 文件保存成功:', filepath)
    } catch (writeError) {
      console.error('❌ 文件保存失败:', writeError)
      return NextResponse.json(
        { success: false, error: '文件保存失败' },
        { status: 500 }
      )
    }

    // 返回文件URL - 使用API路由确保文件可访问
    const fileUrl = `/api/uploads/${filename}`
    
    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        filename: filename,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('上传API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}