// 这个文件创建和导出Prisma客户端实例
// 作为应届生，我会确保在开发环境中正确处理数据库连接

import { PrismaClient } from '@prisma/client'

// 声明全局变量类型，用于开发环境的热重载
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// 创建Prisma客户端实例
// 在开发环境中，我们使用全局变量来避免热重载时创建多个连接
const prisma = globalThis.prisma || new PrismaClient({
  log: ['query'], // 在开发环境中记录SQL查询，方便调试
})

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
  Recommendation
} from '@prisma/client'