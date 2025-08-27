// 这是数据导出的API路由
// 作为应届生，我会创建一个简单的数据导出功能

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  itineraryOperations,
  userActionOperations,
} from '@/lib/api/simple-database'

// GET请求处理函数
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
    const format = searchParams.get('format') || 'json' // 导出格式：json, csv
    const type = searchParams.get('type') || 'itineraries' // 数据类型：itineraries, actions
    const startDate = searchParams.get('startDate') // 开始日期
    const endDate = searchParams.get('endDate') // 结束日期

    console.log('数据导出请求:', {
      format,
      type,
      startDate,
      endDate,
      userId: session.user.id,
    })

    let data: any[] = []
    let filename = ''

    // 根据类型获取数据
    switch (type) {
      case 'itineraries':
        // 获取用户的行程数据
        data = await itineraryOperations.findByUserId(session.user.id)
        filename = `itineraries_${session.user.id}_${
          new Date().toISOString().split('T')[0]
        }`

        // 过滤日期范围
        if (startDate || endDate) {
          data = data.filter(item => {
            const itemDate = new Date(item.createdAt)
            if (startDate && itemDate < new Date(startDate)) return false
            if (endDate && itemDate > new Date(endDate)) return false
            return true
          })
        }
        break

      case 'actions':
        // 获取用户行为数据
        data = await userActionOperations.findByUserId(session.user.id, 1000)
        filename = `user_actions_${session.user.id}_${
          new Date().toISOString().split('T')[0]
        }`

        // 过滤日期范围
        if (startDate || endDate) {
          data = data.filter(item => {
            const itemDate = new Date(item.createdAt)
            if (startDate && itemDate < new Date(startDate)) return false
            if (endDate && itemDate > new Date(endDate)) return false
            return true
          })
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: '不支持的数据类型' },
          { status: 400 }
        )
    }

    // 根据格式返回数据
    if (format === 'csv') {
      // 生成CSV格式
      const csvContent = generateCSV(data, type)

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
          'Cache-Control': 'no-cache',
        },
      })
    } else {
      // 返回JSON格式
      return NextResponse.json(
        {
          success: true,
          data: {
            type,
            count: data.length,
            exportDate: new Date().toISOString(),
            items: data,
          },
        },
        {
          headers: {
            'Content-Disposition': `attachment; filename="${filename}.json"`,
          },
        }
      )
    }
  } catch (error) {
    console.error('数据导出API错误:', error)

    return NextResponse.json(
      { success: false, error: '导出失败' },
      { status: 500 }
    )
  }
}

// 生成CSV内容的函数
function generateCSV(data: any[], type: string): string {
  if (data.length === 0) {
    return 'No data available'
  }

  let headers: string[] = []
  let rows: string[] = []

  switch (type) {
    case 'itineraries':
      headers = [
        'ID',
        'Title',
        'Destination',
        'Budget',
        'Days',
        'Public',
        'Created At',
        'Updated At',
      ]
      rows = data.map(item =>
        [
          item.id,
          `"${item.title}"`,
          `"${item.destination}"`,
          item.budget || 0,
          item.days || 0,
          item.isPublic ? 'Yes' : 'No',
          item.createdAt,
          item.updatedAt,
        ].join(',')
      )
      break

    case 'actions':
      headers = ['ID', 'Action Type', 'Target Type', 'Target ID', 'Created At']
      rows = data.map(item =>
        [
          item.id,
          `"${item.actionType}"`,
          `"${item.targetType}"`,
          `"${item.targetId}"`,
          item.createdAt,
        ].join(',')
      )
      break

    default:
      headers = ['Data']
      rows = data.map(item => `"${JSON.stringify(item).replace(/"/g, '""')}"`)
  }

  return [headers.join(','), ...rows].join('\n')
}

// POST请求处理函数（批量导出）
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
    const { types, format = 'json', startDate, endDate } = body

    // 验证请求数据
    if (!types || !Array.isArray(types) || types.length === 0) {
      return NextResponse.json(
        { success: false, error: '请指定要导出的数据类型' },
        { status: 400 }
      )
    }

    console.log('批量数据导出请求:', {
      types,
      format,
      startDate,
      endDate,
      userId: session.user.id,
    })

    const exportData: any = {}
    const exportSummary: any = {
      exportDate: new Date().toISOString(),
      userId: session.user.id,
      types: [],
      totalItems: 0,
    }

    // 批量获取数据
    for (const type of types) {
      let data: any[] = []

      switch (type) {
        case 'itineraries':
          data = await itineraryOperations.findByUserId(session.user.id)
          break

        case 'actions':
          data = await userActionOperations.findByUserId(session.user.id, 1000)
          break

        default:
          continue // 跳过不支持的类型
      }

      // 过滤日期范围
      if (startDate || endDate) {
        data = data.filter(item => {
          const itemDate = new Date(item.createdAt)
          if (startDate && itemDate < new Date(startDate)) return false
          if (endDate && itemDate > new Date(endDate)) return false
          return true
        })
      }

      exportData[type] = data
      exportSummary.types.push({
        type,
        count: data.length,
      })
      exportSummary.totalItems += data.length
    }

    // 根据格式返回数据
    if (format === 'csv') {
      // 对于CSV格式，我们将所有数据合并到一个文件中
      let csvContent = '# TravelSync Data Export\n'
      csvContent += `# Export Date: ${exportSummary.exportDate}\n`
      csvContent += `# User ID: ${exportSummary.userId}\n\n`

      for (const type of types) {
        if (exportData[type] && exportData[type].length > 0) {
          csvContent += `# ${type.toUpperCase()}\n`
          csvContent += generateCSV(exportData[type], type)
          csvContent += '\n\n'
        }
      }

      const filename = `travelsync_export_${session.user.id}_${
        new Date().toISOString().split('T')[0]
      }.csv`

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      })
    } else {
      // 返回JSON格式
      const filename = `travelsync_export_${session.user.id}_${
        new Date().toISOString().split('T')[0]
      }.json`

      return NextResponse.json(
        {
          success: true,
          summary: exportSummary,
          data: exportData,
        },
        {
          headers: {
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        }
      )
    }
  } catch (error) {
    console.error('批量数据导出API错误:', error)

    return NextResponse.json(
      { success: false, error: '批量导出失败' },
      { status: 500 }
    )
  }
}
