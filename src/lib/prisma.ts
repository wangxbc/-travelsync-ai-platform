// 这个文件创建和导出Prisma客户端实例
// 作为应届生，我会确保在开发环境中正确处理数据库连接

import { PrismaClient } from '@prisma/client'

// 声明全局变量类型，用于开发环境的热重载
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// 检查是否有有效的数据库URL
const hasValidDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL
  return (
    databaseUrl &&
    (databaseUrl.startsWith('postgresql://') ||
      databaseUrl.startsWith('postgres://') ||
      databaseUrl.startsWith('mysql://') ||
      databaseUrl.startsWith('sqlite://')) &&
    !databaseUrl.includes('localhost:5432') && // 排除本地数据库
    !databaseUrl.includes('mock') // 排除模拟数据库
  )
}

// 创建Prisma客户端实例
// 在开发环境中，我们使用全局变量来避免热重载时创建多个连接
const createPrismaClient = () => {
  if (!hasValidDatabaseUrl()) {
    console.warn(
      '⚠️  DATABASE_URL not found or invalid. Using mock Prisma client.'
    )
    // 返回一个模拟的Prisma客户端，用于构建时
    return new PrismaClient({
      datasources: {
        db: {
          url: 'postgresql://mock:mock@localhost:5432/mock',
        },
      },
      log: [],
    })
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

const prisma = globalThis.prisma || createPrismaClient()

// 如果是开发环境，将客户端实例保存到全局变量
if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma
}

// 导出Prisma客户端实例
export default prisma
export { prisma }

// 导出一些常用的类型，方便在其他文件中使用
export type {
  User,
  Itinerary,
  Location,
  Activity,
  Collaboration,
  UserAction,
  Recommendation,
} from '@prisma/client'
