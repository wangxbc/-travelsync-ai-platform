import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// 创建NextAuth处理器
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }