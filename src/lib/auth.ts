import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { userOperations } from './api/simple-database'
import { simpleAuthManager } from './simple-auth'

class DatabaseAuthManager {
  static async validateCredentials(email: string, password: string) {
    try {
      const user = await userOperations.findByEmail(email)
      if (!user) return null

      const preferences = user.preferences as any
      const hashedPassword = preferences?.password

      if (!hashedPassword) return null

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
      return await simpleAuthManager.validateCredentials(email, password)
    }
  }

  static async createUser(userData: {
    email: string
    name: string
    password: string
  }) {
    try {
      const user = await userOperations.create({
        email: userData.email,
        name: userData.name,
        preferences: {
          password: userData.password,
          theme: 'light',
          language: 'zh-CN',
        },
      })
      return user
    } catch (error) {
      console.error('数据库创建用户失败，使用简单认证:', error)
      return await simpleAuthManager.createUser(userData)
    }
  }

  static async findByEmail(email: string) {
    try {
      const user = await userOperations.findByEmail(email)
      if (user) return user

      return await simpleAuthManager.findByEmail(email)
    } catch (error) {
      console.error('数据库查找用户失败，使用简单认证:', error)
      return await simpleAuthManager.findByEmail(email)
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
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

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      if (account?.provider === 'google' && user) {
        try {
          const existingUser = await DatabaseAuthManager.findByEmail(
            user.email!
          )

          if (!existingUser) {
            await DatabaseAuthManager.createUser({
              email: user.email!,
              name: user.name!,
              password: 'google-auth',
            })
          }
        } catch (error) {
          console.error('Google用户创建失败:', error)
        }
      }
      
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }

      return session
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile) {
        user.email = profile.email
        user.name = profile.name
        user.image = profile.picture
      }

      return true
    },
  },

  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions
