// 这个文件配置NextAuth.js认证系统
// 作为应届生，我会使用最基础但完整的配置

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { databaseUserManager } from "./database-auth";

// 用户数据管理
class UserManager {
  private static instance: UserManager;
  private users: any[] = [];

  private constructor() {
    this.loadUsers();
  }

  static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  // 从localStorage加载用户数据
  private loadUsers() {
    try {
      const storedUsers = localStorage.getItem("travelsync_users");
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
        console.log(
          "已从localStorage加载用户数据:",
          this.users.length,
          "个用户"
        );
      } else {
        // 如果没有用户数据，创建默认用户
        this.createDefaultUsers();
      }
    } catch (error) {
      console.error("加载用户数据失败:", error);
      this.users = [];
      this.createDefaultUsers();
    }
  }

  // 保存用户数据到localStorage
  private saveUsers() {
    try {
      localStorage.setItem("travelsync_users", JSON.stringify(this.users));
      console.log("用户数据已保存到localStorage");
    } catch (error) {
      console.error("保存用户数据失败:", error);
    }
  }

  // 创建默认用户
  createDefaultUsers() {
    const defaultUsers = [
      {
        id: Date.now().toString(),
        name: "管理员",
        email: "admin@example.com",
        password: "123456",
        createdAt: new Date().toISOString(),
      },
      {
        id: (Date.now() + 1).toString(),
        name: "测试用户",
        email: "test@example.com",
        password: "123456",
        createdAt: new Date().toISOString(),
      },
    ];

    this.users = defaultUsers;
    this.saveUsers();
    console.log("已创建默认用户");
  }

  // 获取所有用户
  getUsers(): any[] {
    return this.users;
  }

  // 根据邮箱查找用户
  findByEmail(email: string): any | null {
    return this.users.find((user) => user.email === email) || null;
  }

  // 添加用户
  addUser(user: any): void {
    // 检查用户是否已存在
    const existingUser = this.findByEmail(user.email);
    if (existingUser) {
      console.log("用户已存在:", user.email);
      return;
    }

    this.users.push(user);
    this.saveUsers();
    console.log("用户已添加到认证系统:", user.email);
  }

  // 验证用户凭据
  validateCredentials(email: string, password: string): any | null {
    const user = this.findByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  // 获取用户数量（用于调试）
  getUserCount(): number {
    return this.users.length;
  }

  // 清空所有用户（用于测试）
  clearUsers(): void {
    this.users = [];
    this.saveUsers();
    console.log("已清空所有用户数据");
  }

  // 恢复用户数据（从其他可能的存储位置）
  recoverUsers(): any[] {
    console.log("尝试恢复用户数据...");

    // 检查可能的存储位置
    const possibleKeys = [
      "travelsync_users",
      "users",
      "auth_users",
      "registered_users",
      "travel_itineraries", // 从行程数据中恢复用户信息
    ];

    let recoveredUsers = [];

    possibleKeys.forEach((key) => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`从 ${key} 找到 ${parsed.length} 个用户`);
            recoveredUsers = recoveredUsers.concat(parsed);
          }
        }
      } catch (error) {
        console.log(`解析 ${key} 失败:`, error);
      }
    });

    // 尝试从行程数据中恢复用户信息
    this.recoverUsersFromItineraries();

    if (recoveredUsers.length > 0) {
      // 去重
      const uniqueUsers = recoveredUsers.filter(
        (user, index, self) =>
          index === self.findIndex((u) => u.email === user.email)
      );

      this.users = uniqueUsers;
      this.saveUsers();
      console.log(`已恢复 ${uniqueUsers.length} 个用户`);
      return uniqueUsers;
    } else {
      console.log("未找到可恢复的用户数据，创建默认用户");
      this.createDefaultUsers();
      return this.users;
    }
  }

  // 从行程数据中恢复用户信息
  private recoverUsersFromItineraries(): void {
    try {
      // 查找所有以 travel_itineraries_ 开头的键
      const keys = Object.keys(localStorage);
      const itineraryKeys = keys.filter((key) =>
        key.startsWith("travel_itineraries_")
      );

      itineraryKeys.forEach((key) => {
        try {
          const email = key.replace("travel_itineraries_", "");
          const itineraries = JSON.parse(localStorage.getItem(key) || "[]");

          if (itineraries.length > 0) {
            // 从行程数据中提取用户信息
            const firstItinerary = itineraries[0];
            if (
              firstItinerary.userEmail &&
              !this.findByEmail(firstItinerary.userEmail)
            ) {
              const recoveredUser = {
                id:
                  Date.now().toString() +
                  Math.random().toString(36).substr(2, 9),
                name: firstItinerary.userName || email.split("@")[0],
                email: firstItinerary.userEmail,
                password: "123456", // 默认密码，用户需要重置
                createdAt: firstItinerary.createdAt || new Date().toISOString(),
                recovered: true, // 标记为恢复的用户
              };

              this.users.push(recoveredUser);
              console.log(`从行程数据恢复用户: ${recoveredUser.email}`);
            }
          }
        } catch (error) {
          console.log(`解析行程数据失败: ${key}`, error);
        }
      });
    } catch (error) {
      console.log("从行程数据恢复用户失败:", error);
    }
  }

  // 调试方法：显示所有localStorage数据
  debugLocalStorage(): void {
    console.log("=== localStorage 调试信息 ===");
    console.log("当前用户数据:", this.users);

    const keys = Object.keys(localStorage);
    console.log("所有localStorage键:", keys);

    keys.forEach((key) => {
      try {
        const data = localStorage.getItem(key);
        console.log(`${key}:`, data ? JSON.parse(data) : null);
      } catch (error) {
        console.log(`${key}: 解析失败`);
      }
    });
  }

  // 重置用户数据（用于测试）
  resetUsers(): void {
    this.users = [];
    this.saveUsers();
    console.log("已重置用户数据");
  }
}

// 获取用户管理器实例
const userManager = UserManager.getInstance();

// 动态获取用户数据的函数
const getUsers = async () => {
  try {
    return userManager.getUsers();
  } catch (error) {
    console.error("获取用户数据失败:", error);
    return [];
  }
};

// 添加用户的函数（供注册API调用）
export const addUser = (user: any) => {
  userManager.addUser(user);
};

// 验证用户凭据的函数
export const validateUser = (email: string, password: string) => {
  return userManager.validateCredentials(email, password);
};

// 获取用户管理器（用于调试）
export const getUserManager = () => userManager;

// NextAuth配置选项
export const authOptions: NextAuthOptions = {
  // 配置认证提供商
  providers: [
    // 邮箱密码登录提供商
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "邮箱",
          type: "email",
          placeholder: "请输入邮箱地址",
        },
        password: {
          label: "密码",
          type: "password",
          placeholder: "请输入密码",
        },
      },
      async authorize(credentials) {
        // 检查凭据是否存在
        if (!credentials?.email || !credentials?.password) {
          console.log("缺少邮箱或密码");
          return null;
        }

        try {
          // 使用数据库用户管理器验证凭据
          const user = await databaseUserManager.validateCredentials(
            credentials.email,
            credentials.password
          );

          if (!user) {
            console.log("用户不存在或密码错误:", credentials.email);
            return null;
          }

          console.log("用户登录成功:", user.email);

          // 返回用户信息（不包含密码）
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: null,
          };
        } catch (error) {
          console.error("登录验证失败:", error);
          return null;
        }
      },
    }),

    // Google OAuth登录提供商（可选）
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
          }),
        ]
      : []),
  ],

  // 会话配置
  session: {
    strategy: "jwt", // 使用JWT策略
    maxAge: 30 * 24 * 60 * 60, // 30天过期
  },

  // JWT配置
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30天过期
  },

  // 自定义页面路径
  pages: {
    signIn: "/auth/signin", // 自定义登录页面
    signUp: "/auth/signup", // 自定义注册页面
    error: "/auth/error", // 自定义错误页面
  },

  // 回调函数
  callbacks: {
    // JWT回调 - 在JWT创建时调用
    async jwt({ token, user, trigger, session }) {
      // 如果是新登录，将用户信息添加到token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      
      // 如果是更新触发或者定期刷新，从数据库获取最新信息
      if (trigger === "update" || (!user && token.email)) {
        try {
          const latestUser = await databaseUserManager.findByEmail(token.email as string);
          if (latestUser) {
            token.name = latestUser.name;
            token.picture = latestUser.avatar;
          }
        } catch (error) {
          console.error("JWT回调中获取最新用户信息失败:", error);
        }
      }
      
      return token;
    },

    // 会话回调 - 在获取会话时调用
    async session({ session, token }) {
      // 将token中的信息添加到session
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        
        // 从数据库获取最新的用户信息，包括头像
        try {
          const latestUser = await databaseUserManager.findByEmail(token.email as string);
          if (latestUser) {
            session.user.name = latestUser.name || token.name as string;
            session.user.image = latestUser.avatar || token.picture as string;
            // 添加其他用户信息
            (session.user as any).bio = latestUser.bio;
            (session.user as any).location = latestUser.location;
            (session.user as any).website = latestUser.website;
            (session.user as any).phone = latestUser.phone;
            (session.user as any).gender = latestUser.gender;
            (session.user as any).occupation = latestUser.occupation;
            (session.user as any).interests = latestUser.interests;
            (session.user as any).socialLinks = latestUser.socialLinks;
            (session.user as any).preferences = latestUser.preferences;
            (session.user as any).birthday = latestUser.birthday;
          } else {
            // 如果数据库中没有找到用户，使用token中的信息
            session.user.image = token.picture as string;
          }
        } catch (error) {
          console.error("获取最新用户信息失败:", error);
          // 出错时使用token中的信息
          session.user.image = token.picture as string;
        }
      }
      return session;
    },

    // 登录回调 - 简化版本
    async signIn() {
      return true;
    },
  },

  // 事件处理
  events: {
    // 用户登录事件
    async signIn({ user, account, profile, isNewUser }) {
      console.log("用户登录事件:", {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });
    },

    // 用户登出事件
    async signOut({ session, token }) {
      console.log("用户登出事件:", {
        userId: session?.user?.id || token?.id,
      });
    },
  },

  // 调试模式（开发环境启用）
  debug: process.env.NODE_ENV === "development",
};

// 导出默认配置
export default authOptions;
