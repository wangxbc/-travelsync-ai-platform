// 基于数据库的用户认证系统
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { fallbackDatabase } from "./database-fallback";

// 用户数据管理类
export class DatabaseUserManager {
  private static instance: DatabaseUserManager;

  private constructor() {}

  static getInstance(): DatabaseUserManager {
    if (!DatabaseUserManager.instance) {
      DatabaseUserManager.instance = new DatabaseUserManager();
    }
    return DatabaseUserManager.instance;
  }

  // 创建新用户
  async createUser(userData: {
    email: string;
    name: string;
    password: string;
  }) {
    try {
      // 检查用户是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new Error("用户已存在");
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // 创建用户
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          preferences: {
            password: hashedPassword, // 临时存储密码，实际项目中应该用专门的密码表
            theme: "light",
            language: "zh-CN",
          },
        },
      });

      console.log("✅ 用户创建成功:", user.email);
      return user;
    } catch (error) {
      console.error("❌ 创建用户失败:", error);
      throw error;
    }
  }

  // 验证用户凭据
  async validateCredentials(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return null;
      }

      // 从preferences中获取密码（临时方案）
      const preferences = user.preferences as any;
      const hashedPassword = preferences?.password;

      if (!hashedPassword) {
        return null;
      }

      // 验证密码
      const isValid = await bcrypt.compare(password, hashedPassword);

      if (isValid) {
        // 返回用户信息（不包含密码）
        const { preferences: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }

      return null;
    } catch (error) {
      console.error("❌ 数据库验证失败，使用回退方案:", error);
      // 使用回退数据库
      return await fallbackDatabase.validateCredentials(email, password);
    }
  }

  // 获取所有用户
  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return users;
    } catch (error) {
      console.error("❌ 获取用户列表失败:", error);
      return [];
    }
  }

  // 根据邮箱查找用户
  async findByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          bio: true,
          location: true,
          website: true,
          phone: true,
          gender: true,
          occupation: true,
          interests: true,
          socialLinks: true,
          preferences: true,
          birthday: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return user;
    } catch (error) {
      console.error("❌ 数据库查找失败，使用回退方案:", error);
      // 使用回退数据库
      return await fallbackDatabase.findByEmail(email);
    }
  }

  // 创建默认用户
  async createDefaultUsers() {
    try {
      const defaultUsers = [
        {
          email: "admin@example.com",
          name: "管理员",
          password: "123456",
        },
        {
          email: "test@example.com",
          name: "测试用户",
          password: "123456",
        },
      ];

      const createdUsers = [];

      for (const userData of defaultUsers) {
        try {
          const user = await this.createUser(userData);
          createdUsers.push(user);
        } catch (error) {
          if (error instanceof Error && error.message === "用户已存在") {
            console.log(`用户 ${userData.email} 已存在，跳过创建`);
          } else {
            console.error(`创建用户 ${userData.email} 失败:`, error);
          }
        }
      }

      console.log(
        `✅ 默认用户创建完成，成功创建 ${createdUsers.length} 个用户`
      );
      return createdUsers;
    } catch (error) {
      console.error("❌ 创建默认用户失败:", error);
      throw error;
    }
  }

  // 迁移localStorage数据到数据库
  async migrateFromLocalStorage() {
    try {
      if (typeof window === "undefined") {
        console.log("❌ 此方法只能在客户端运行");
        return;
      }

      console.log("🔄 开始迁移localStorage数据到数据库...");

      // 获取localStorage中的用户数据
      const storedUsers = localStorage.getItem("travelsync_users");
      if (!storedUsers) {
        console.log("📝 localStorage中没有用户数据");
        return;
      }

      const users = JSON.parse(storedUsers);
      let migratedCount = 0;

      for (const user of users) {
        try {
          // 检查用户是否已存在
          const existingUser = await this.findByEmail(user.email);
          if (existingUser) {
            console.log(`用户 ${user.email} 已存在，跳过迁移`);
            continue;
          }

          // 创建用户
          await this.createUser({
            email: user.email,
            name: user.name,
            password: user.password || "123456",
          });

          migratedCount++;
          console.log(`✅ 迁移用户: ${user.email}`);
        } catch (error) {
          console.error(`❌ 迁移用户 ${user.email} 失败:`, error);
        }
      }

      console.log(`🎉 迁移完成！成功迁移 ${migratedCount} 个用户`);

      // 迁移完成后清理localStorage
      if (migratedCount > 0) {
        localStorage.removeItem("travelsync_users");
        console.log("🧹 已清理localStorage中的用户数据");
      }
    } catch (error) {
      console.error("❌ 迁移数据失败:", error);
    }
  }

  // 获取用户统计信息
  async getUserStats() {
    try {
      const totalUsers = await prisma.user.count();
      const todayUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      return {
        total: totalUsers,
        today: todayUsers,
      };
    } catch (error) {
      console.error("❌ 获取用户统计失败:", error);
      return { total: 0, today: 0 };
    }
  }
}

// 导出单例实例
export const databaseUserManager = DatabaseUserManager.getInstance();

// 兼容性函数（用于替换原有的localStorage认证）
export const getUsers = async () => {
  return await databaseUserManager.getAllUsers();
};

export const addUser = async (userData: any) => {
  return await databaseUserManager.createUser(userData);
};

export const validateUser = async (email: string, password: string) => {
  return await databaseUserManager.validateCredentials(email, password);
};
if (require.main === module) {
  databaseUserManager
    .createDefaultUsers()
    .then(() => {
      console.log("✅ 默认用户创建完成");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ 创建默认用户失败:", err);
      process.exit(1);
    });
}
