import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// 创建NextAuth处理器
const handler = NextAuth(authOptions)

// 导出GET和POST处理器
export { handler as GET, handler as POST }