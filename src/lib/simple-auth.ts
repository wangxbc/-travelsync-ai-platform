interface SocialLinks {
  twitter?: string
  facebook?: string
  instagram?: string
  linkedin?: string
  github?: string
}

interface UserPreferences {
  theme?: 'light' | 'dark'
  language?: string
  notifications?: boolean
  privacy?: {
    profileVisibility?: 'public' | 'private'
    itineraryVisibility?: 'public' | 'private'
  }
}

interface SimpleUser {
  id: string
  email: string
  name: string
  password: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  phone?: string
  gender?: string
  occupation?: string
  interests?: string
  socialLinks?: SocialLinks
  preferences?: UserPreferences
  birthday?: Date
  createdAt: Date
  updatedAt: Date
}

class SimpleAuthManager {
  private static instance: SimpleAuthManager
  private users: Map<string, SimpleUser> = new Map()
  private emailIndex: Map<string, string> = new Map()
  private constructor() {
    this.initializeDefaultUsers()
  }

  static getInstance(): SimpleAuthManager {
    if (!SimpleAuthManager.instance) {
      SimpleAuthManager.instance = new SimpleAuthManager()
    }
    return SimpleAuthManager.instance
  }

  private initializeDefaultUsers() {
    const defaultUsers: Omit<SimpleUser, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        email: 'admin@example.com',
        name: '管理员',
        password: '123456',
        bio: '系统管理员',
        occupation: '管理员',
      },
      {
        email: 'test@example.com',
        name: '测试用户',
        password: '123456',
        bio: '测试账户',
        occupation: '测试工程师',
      },
      {
        email: 'demo@example.com',
        name: '演示用户',
        password: '123456',
        bio: '演示账户',
        occupation: '产品经理',
      },
      {
        email: 'user@example.com',
        name: '普通用户',
        password: '123456',
        bio: '普通用户账户',
        occupation: '用户',
      },
    ]

    defaultUsers.forEach(userData => {
      const user: SimpleUser = {
        ...userData,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      this.users.set(user.id, user)
      this.emailIndex.set(user.email, user.id)
    })
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  async findByEmail(email: string): Promise<SimpleUser | null> {
    const userId = this.emailIndex.get(email)
    if (!userId) return null

    const user = this.users.get(userId)
    return user || null
  }

  async findById(id: string): Promise<SimpleUser | null> {
    return this.users.get(id) || null
  }

  async createUser(userData: {
    email: string
    name: string
    password: string
  }): Promise<SimpleUser> {
    if (this.emailIndex.has(userData.email)) {
      throw new Error('用户已存在')
    }

    const user: SimpleUser = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.users.set(user.id, user)
    this.emailIndex.set(user.email, user.id)

    return user
  }

  async updateUser(
    id: string,
    updates: Partial<SimpleUser>
  ): Promise<SimpleUser | null> {
    const user = this.users.get(id)
    if (!user) return null

    const updatedUser: SimpleUser = {
      ...user,
      ...updates,
      id,
      updatedAt: new Date(),
    }

    this.users.set(id, updatedUser)

    if (updates.email && updates.email !== user.email) {
      this.emailIndex.delete(user.email)
      this.emailIndex.set(updates.email, id)
    }

    return updatedUser
  }

  async validateCredentials(
    email: string,
    password: string
  ): Promise<SimpleUser | null> {
    const user = await this.findByEmail(email)
    if (!user || user.password !== password) {
      return null
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as SimpleUser
  }

  async getAllUsers(): Promise<Omit<SimpleUser, 'password'>[]> {
    return Array.from(this.users.values()).map(({ password, ...user }) => user)
  }

  async getUserStats() {
    const total = this.users.size
    const today = Array.from(this.users.values()).filter(user => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return user.createdAt >= today
    }).length

    return {
      total,
      today,
      type: 'simple-auth',
    }
  }

  debugGetAllUsers(): SimpleUser[] {
    return Array.from(this.users.values())
  }
  clearUsers(): void {
    this.users.clear()
    this.emailIndex.clear()
  }

  resetToDefaults(): void {
    this.clearUsers()
    this.initializeDefaultUsers()
  }
}

export const simpleAuthManager = SimpleAuthManager.getInstance()

export type { SimpleUser }

export const getUsers = async () => {
  return await simpleAuthManager.getAllUsers()
}

export const addUser = async (userData: {
  email: string
  name: string
  password: string
  avatar?: string
  preferences?: UserPreferences
}) => {
  return await simpleAuthManager.createUser(userData)
}

export const validateUser = async (email: string, password: string) => {
  return await simpleAuthManager.validateCredentials(email, password)
}

export const findUserByEmail = async (email: string) => {
  return await simpleAuthManager.findByEmail(email)
}

export const findUserById = async (id: string) => {
  return await simpleAuthManager.findById(id)
}
