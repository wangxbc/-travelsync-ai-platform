import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 检查数据库连接
    const dbStatus = await checkDatabaseConnection()
    
    // 检查环境变量
    const envStatus = checkEnvironmentVariables()
    
    // 检查系统状态
    const systemStatus = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    }

    const healthStatus = {
      status: dbStatus.connected && envStatus.valid ? 'healthy' : 'unhealthy',
      database: dbStatus,
      environment: envStatus,
      system: systemStatus,
    }

    return NextResponse.json(healthStatus, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}

async function checkDatabaseConnection() {
  try {
    // 测试数据库连接
    await prisma.$queryRaw`SELECT 1 as test`
    
    // 获取基本统计信息
    const [userCount, itineraryCount, locationCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.itinerary.count().catch(() => 0),
      prisma.location.count().catch(() => 0),
    ])

    return {
      connected: true,
      message: 'Database connection successful',
      stats: {
        users: userCount,
        itineraries: itineraryCount,
        locations: locationCount,
      },
    }
  } catch (error) {
    console.error('Database connection failed:', error)
    return {
      connected: false,
      message: error instanceof Error ? error.message : 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown database error',
    }
  }
}

function checkEnvironmentVariables() {
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ]

  const optionalVars = [
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ]

  const missing = []
  const present = []

  // 检查必需的环境变量
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    } else {
      present.push(varName)
    }
  }

  // 检查可选的环境变量
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      present.push(varName)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    present,
    total: present.length + missing.length,
  }
}