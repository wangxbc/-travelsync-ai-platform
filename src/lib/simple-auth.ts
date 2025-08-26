// 简单的认证系统 - 不依赖数据库
// 用于解决Vercel部署时的数据库连接问题

interface SimpleUser {
  id: string;
  email: string;
  name: string;
  password: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  gender?: string;
  occupation?: string;
  interests?: string;
  socialLinks?: any;
  preferences?: any;
  birthday?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class SimpleAuthManager {
  private static instance: SimpleAuthManager;
  private users: Map<string, SimpleUser> = new Map();
  private emailIndex: Map<string, string> = new Map(); // email -> id mapping

  private constructor() {
    this.initializeDefaultUsers();
  }

  static getInstance(): SimpleAuthManager {
    if (!SimpleAuthManager.instance) {
      SimpleAuthManager.instance = new SimpleAuthManager();
    }
    return SimpleAuthManager.instance;
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
      }
    ];

    defaultUsers.forEach(userData => {
      const user: SimpleUser = {
        ...userData,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      this.users.set(user.id, user);
      this.emailIndex.set(user.email, user.id);
    });

    console.log(`🔄 简单认证系统已初始化，包含 ${this.users.size} 个默认用户`);
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  async findByEmail(email: string): Promise<SimpleUser | null> {
    const userId = this.emailIndex.get(email);
    if (!userId) return null;
    
    const user = this.users.get(userId);
    return user || null;
  }

  async findById(id: string): Promise<SimpleUser | null> {
    return this.users.get(id) || null;
  }

  async createUser(userData: {
    email: string;
    name: string;
    password: string;
  }): Promise<SimpleUser> {
    // 检查用户是否已存在
    if (this.emailIndex.has(userData.email)) {
      throw new Error('用户已存在');
    }

    const user: SimpleUser = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);
    this.emailIndex.set(user.email, user.id);

    console.log('✅ 用户创建成功（简单认证）:', user.email);
    return user;
  }

  async updateUser(id: string, updates: Partial<SimpleUser>): Promise<SimpleUser | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser: SimpleUser = {
      ...user,
      ...updates,
      id, // 确保ID不被修改
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);

    // 如果邮箱被更新，需要更新索引
    if (updates.email && updates.email !== user.email) {
      this.emailIndex.delete(user.email);
      this.emailIndex.set(updates.email, id);
    }

    console.log('✅ 用户更新成功（简单认证）:', updatedUser.email);
    return updatedUser;
  }

  async validateCredentials(email: string, password: string): Promise<SimpleUser | null> {
    const user = await this.findByEmail(email);
    if (!user || user.password !== password) {
      return null;
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as SimpleUser;
  }

  async getAllUsers(): Promise<Omit<SimpleUser, 'password'>[]> {
    return Array.from(this.users.values()).map(({ password, ...user }) => user);
  }

  async getUserStats() {
    const total = this.users.size;
    const today = Array.from(this.users.values()).filter(user => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return user.createdAt >= today;
    }).length;

    return {
      total,
      today,
      type: 'simple-auth',
    };
  }

  // 获取用户列表（用于调试）
  debugGetAllUsers(): SimpleUser[] {
    return Array.from(this.users.values());
  }

  // 清空所有用户（用于测试）
  clearUsers(): void {
    this.users.clear();
    this.emailIndex.clear();
    console.log('🧹 已清空所有用户数据（简单认证）');
  }

  // 重置为默认用户
  resetToDefaults(): void {
    this.clearUsers();
    this.initializeDefaultUsers();
    console.log('🔄 已重置为默认用户（简单认证）');
  }
}

// 导出单例实例
export const simpleAuthManager = SimpleAuthManager.getInstance();

// 导出类型
export type { SimpleUser };

// 兼容性函数
export const getUsers = async () => {
  return await simpleAuthManager.getAllUsers();
};

export const addUser = async (userData: any) => {
  return await simpleAuthManager.createUser(userData);
};

export const validateUser = async (email: string, password: string) => {
  return await simpleAuthManager.validateCredentials(email, password);
};

export const findUserByEmail = async (email: string) => {
  return await simpleAuthManager.findByEmail(email);
};

export const findUserById = async (id: string) => {
  return await simpleAuthManager.findById(id);
};