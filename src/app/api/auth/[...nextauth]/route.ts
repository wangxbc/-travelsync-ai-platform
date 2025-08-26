// 这是NextAuth.js的API路由文件
// 作为应届生，我会按照官方文档的标准写法

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// 创建NextAuth处理器
const handler = NextAuth(authOptions)

// 导出GET和POST处理器
// Next.js 13的App Router需要明确导出HTTP方法
export { handler as GET, handler as POST }