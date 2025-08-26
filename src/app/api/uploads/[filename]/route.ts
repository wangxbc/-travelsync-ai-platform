import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    
    if (!filename) {
      return new NextResponse('文件名不能为空', { status: 400 })
    }

    // 安全检查：防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return new NextResponse('无效的文件名', { status: 400 })
    }

    const filePath = join(process.cwd(), 'public', 'uploads', filename)
    
    if (!existsSync(filePath)) {
      console.log('文件不存在:', filePath)
      return new NextResponse('文件不存在', { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    
    // 根据文件扩展名设置正确的Content-Type
    const ext = filename.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case 'png':
        contentType = 'image/png'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // 缓存1年
      },
    })

  } catch (error) {
    console.error('服务文件失败:', error)
    return new NextResponse('服务器内部错误', { status: 500 })
  }
}