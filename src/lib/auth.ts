// 这个文件配置NextAuth.js认证系统
// 使用数据库认证系统，带有回退机制

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { userOperations } from './api/database'
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
        // 检查凭据是否存在
        if (!credentials?.email || !credentials?.password) {
          console.log('缺少邮箱或密码')
          return null
        }

        try {
          // 使用数据库认证管理器验证凭据
          const user = await DatabaseAuthManager.validateCredentials(
            credentials.email,
            credentials.password
          )

          if (!user) {
            console.log('用户不存在或密码错误:', credentials.email)
            return null
          }

          console.log('用户登录成功:', user.email)
          return user
        } catch (error) {
          console.error('登录验证失败:', error)
          return null
        }
      },
    }),

    // Google OAuth登录提供商（可选）
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          }),
        ]
      : []),
  ],

  // 会话配置
  session: {
    strategy: 'jwt', // 使用JWT策略
    maxAge: 30 * 24 * 60 * 60, // 30天过期
  },

  // JWT配置
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30天过期
  },

  // 自定义页面路径
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup', // 自定义注册页面
    error: '/auth/error', // 自定义错误页面
  },

  // 回调函数
  callbacks: {
    // JWT回调 - 在JWT创建时调用
    async jwt({ token, user, trigger, session }) {
      // 如果是新登录，将用户信息添加到token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      // 如果是更新触发或者定期刷新，从认证系统获取最新信息
      if (trigger === 'update' || (!user && token.email)) {
        try {
          const latestUser = await DatabaseAuthManager.findByEmail(
            token.email as string
          )
          if (latestUser) {
            token.name = latestUser.name
            token.picture = latestUser.avatar
          }
        } catch (error) {
          console.error('JWT回调中获取最新用户信息失败:', error)
        }
      }

      return token
    },

    // 会话回调 - 在获取会话时调用
    async session({ session, token }) {
      // 将token中的信息添加到session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },

    // 登录回调
    async signIn({ user, account, profile }) {
      // 如果是Google登录，检查用户是否已存在，不存在则创建
      if (account?.provider === 'google' && profile?.email) {
        try {
          const existingUser = await DatabaseAuthManager.findByEmail(
            profile.email
          )
          if (!existingUser) {
            // 创建新用户
            await DatabaseAuthManager.createUser({
              email: profile.email,
              name: profile.name || profile.email.split('@')[0],
              password: Math.random().toString(36).substr(2, 15), // 生成随机密码
            })
            console.log('Google登录用户自动创建:', profile.email)
          }
        } catch (error) {
          console.error('Google登录用户创建失败:', error)
        }
      }
      return true
    },
  },

  // 事件处理
  events: {
    async signIn({ user, account, profile }) {
      console.log('用户登录:', user.email, '提供商:', account?.provider)
    },
    async signOut({ token }) {
      console.log('用户登出:', token?.email)
    },
    async createUser({ user }) {
      console.log('新用户创建:', user.email)
    },
  },

  // 调试模式（开发环境）
  debug: process.env.NODE_ENV === 'development',
}

// 导出类型定义
export type { NextAuthOptions }
