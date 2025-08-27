// 这个文件配置NextAuth.js认证系统
// 使用数据库认证系统，带有回退机制

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { userOperations } from './api/simple-database'
import { simpleAuthManager } from './simple-auth'

// 数据库认证管理器
class DatabaseAuthManager {
  static async validateCredentials(email: string, password: string) {
    try {
      // 尝试使用数据库认证
      const user = await userOperations.findByEmail(email)
      if (!user) return null

      // 从preferences中获取密码（临时方案）
      const preferences = user.preferences as any
      const hashedPassword = preferences?.password

      if (!hashedPassword) return null

      // 验证密码（这里需要bcrypt，暂时简化）
      if (hashedPassword === password) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar || null,
        }
      }

      return null
    } catch (error) {
      console.error('数据库认证失败，使用简单认证:', error)
      // 回退到简单认证系统
      return await simpleAuthManager.validateCredentials(email, password)
    }
  }

  static async createUser(userData: {
    email: string
    name: string
    password: string
  }) {
    try {
      // 尝试使用数据库创建用户
      const user = await userOperations.create({
        email: userData.email,
        name: userData.name,
        preferences: {
          password: userData.password, // 临时存储，实际应该加密
          theme: 'light',
          language: 'zh-CN',
        },
      })
      return user
    } catch (error) {
      console.error('数据库创建用户失败，使用简单认证:', error)
      // 回退到简单认证系统
      return await simpleAuthManager.createUser(userData)
    }
  }

  static async findByEmail(email: string) {
    try {
      // 尝试从数据库查找用户
      const user = await userOperations.findByEmail(email)
      if (user) return user

      // 如果数据库中没有，尝试简单认证系统
      return await simpleAuthManager.findByEmail(email)
    } catch (error) {
      console.error('数据库查找用户失败，使用简单认证:', error)
      // 回退到简单认证系统
      return await simpleAuthManager.findByEmail(email)
    }
  }
}

// NextAuth配置选项
export const authOptions: NextAuthOptions = {
  // 配置认证提供商
  providers: [
    // 邮箱密码登录提供商
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: '邮箱',
          type: 'email',
          placeholder: '请输入邮箱地址',
        },
        password: {
          label: '密码',
          type: 'password',
          placeholder: '请输入密码',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // 使用数据库认证管理器
          const user = await DatabaseAuthManager.validateCredentials(
            credentials.email,
            credentials.password
          )
          return user
        } catch (error) {
          console.error('认证失败:', error)
          return null
        }
      },
    }),

    // Google登录提供商
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // 配置会话策略
  session: {
    strategy: 'jwt',
  },

  // 配置页面
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },

  // JWT回调函数
  callbacks: {
    async jwt({ token, user, account }) {
      // 如果是首次登录，将用户信息添加到token中
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      // 如果是Google登录，处理用户创建
      if (account?.provider === 'google' && user) {
        try {
          // 检查用户是否已存在
          const existingUser = await DatabaseAuthManager.findByEmail(
            user.email!
          )

          if (!existingUser) {
            // 创建新用户
            await DatabaseAuthManager.createUser({
              email: user.email!,
              name: user.name!,
              password: 'google-auth', // Google用户不需要密码
            })
          }
        } catch (error) {
          console.error('Google用户创建失败:', error)
        }
      }

      return token
    },

    async session({ session, token }) {
      // 将token中的信息添加到session中
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }

      return session
    },

    async signIn({ user, account, profile }) {
      // 如果是Google登录，确保用户信息完整
      if (account?.provider === 'google' && profile) {
        user.email = profile.email
        user.name = profile.name
        user.image = profile.picture
      }

      return true
    },
  },

  // 配置调试模式
  debug: process.env.NODE_ENV === 'development',

  // 配置密钥
  secret: process.env.NEXTAUTH_SECRET,
}

// 导出认证选项
export default authOptions
