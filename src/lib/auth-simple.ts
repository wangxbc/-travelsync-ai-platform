import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { userOperations } from '@/lib/api/database'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // 查找用户
          const user = await userOperations.findByEmail(credentials.email)
          
          if (!user) {
            console.log('用户不存在:', credentials.email)
            return null
          }

          // 简化版本：直接验证通过
          console.log('用户登录成功:', user.email)
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar 
          }
        } catch (error) {
          console.error('登录验证失败:', error)
          return null
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, 
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 新登录时保存用户信息到token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      // 处理session更新（比如头像更新）
      if (trigger === 'update' && session?.user) {
        // 从数据库重新获取用户信息
        try {
          const updatedUser = await userOperations.findByEmail(token.email as string)
          if (updatedUser) {
            token.name = updatedUser.name
            token.picture = updatedUser.avatar
            console.log('JWT更新用户信息:', updatedUser.avatar)
          }
        } catch (error) {
          console.error('更新JWT用户信息失败:', error)
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },

    async signIn() {
      return true
    }
  },

  events: {
    async signIn({ user }) {
      console.log('用户登录:', user.email)
    },
    async signOut({ token }) {
      console.log('用户登出:', token?.email)
    }
  },

  debug: process.env.NODE_ENV === 'development',
}

export default authOptions