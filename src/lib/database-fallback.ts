interface User {
  id: string
  email: string
  name: string
  password?: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  phone?: string
  gender?: string
  occupation?: string
  interests?: string
  socialLinks?: any
  preferences?: any
  birthday?: Date
  createdAt: Date
  updatedAt: Date
}

class FallbackDatabase {
  private users: User[] = []
  private initialized = false

  constructor() {
    this.initializeDefaultUsers()
  }

  private initializeDefaultUsers() {
    if (this.initialized) return

    const defaultUsers: User[] = [
      {
        id: '1',
        email: 'admin@example.com',
        name: '管理员',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        email: 'test@example.com',
        name: '测试用户',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        email: 'demo@example.com',
        name: '演示用户',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    this.users = defaultUsers
    this.initialized = true
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null
  }

  async create(
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    const user: User = {
      ...userData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.users.push(user)
    return user
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id)
    if (userIndex === -1) return null

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date(),
    }
    return this.users[userIndex]
  }

  async validateCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.findByEmail(email)
    if (!user || user.password !== password) {
      return null
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as User
  }

  async getAllUsers(): Promise<User[]> {
    return this.users.map(({ password, ...user }) => user as User)
  }

  getStats() {
    return {
      totalUsers: this.users.length,
      type: 'fallback-memory',
      initialized: this.initialized,
    }
  }
}

export const fallbackDatabase = new FallbackDatabase()

export type { User }
