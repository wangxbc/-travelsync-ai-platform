// 这个文件提供认证相关的自定义Hook
// 作为应届生，我会封装常用的认证操作

"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// 认证Hook的返回类型
interface UseAuthReturn {
  user: any | null; // 当前用户信息
  isLoading: boolean; // 是否正在加载
  isAuthenticated: boolean; // 是否已认证
  login: (email: string, password: string) => Promise<boolean>; // 登录函数
  logout: () => Promise<void>; // 登出函数
  loginWithGoogle: () => Promise<void>; // Google登录函数
}

// 自定义认证Hook
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession(); // 获取会话信息
  const router = useRouter(); // 路由对象
  const [isLoading, setIsLoading] = useState(false); // 加载状态

  // 计算认证状态
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const user = session?.user || null;

  // 登录函数
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true); // 设置加载状态

    try {
      // 调用NextAuth的signIn函数
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // 不自动重定向
      });

      if (result?.error) {
        console.error("登录失败:", result.error);
        return false;
      }

      if (result?.ok) {
        console.log("登录成功");
        // 登录成功后重定向到首页
        router.push("/");
        return true;
      }

      return false;
    } catch (error) {
      console.error("登录过程中出错:", error);
      return false;
    } finally {
      setIsLoading(false); // 清除加载状态
    }
  };

  // 登出函数
  const logout = async (): Promise<void> => {
    setIsLoading(true); // 设置加载状态

    try {
      console.log("开始登出流程");

      // 清理客户端数据，但保留用户数据
      if (typeof window !== "undefined") {
        // 只清理会话相关的数据，保留用户数据和行程数据
        const keysToRemove = [
          "next-auth.csrf-token",
          "next-auth.callback-url",
          "next-auth.state",
          "__Secure-next-auth.session-token",
          "__Host-next-auth.csrf-token",
          "__Secure-next-auth.callback-url",
          "__Host-next-auth.state",
          "__Secure-next-auth.session-token",
          "session",
          "auth",
        ];

        // 清理指定的键
        keysToRemove.forEach((key) => {
          try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          } catch (error) {
            console.log(`清理 ${key} 失败:`, error);
          }
        });

        // 清理所有cookies
        try {
          document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=");
            const name = eqPos > -1 ? c.substr(0, eqPos) : c;
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          });
        } catch (error) {
          console.log("清理cookies失败:", error);
        }

        console.log("已清理会话数据，保留用户数据");
      }

      // 调用NextAuth的signOut函数
      await signOut({
        redirect: false, // 不自动重定向
      });

      console.log("登出成功");

      // 延迟重定向，确保数据清理完成
      setTimeout(() => {
        try {
          router.push("/");
        } catch (error) {
          console.error("重定向失败，使用window.location:", error);
          window.location.href = "/";
        }
      }, 200);
    } catch (error) {
      console.error("登出过程中出错:", error);
      // 即使出错也要重定向到首页
      try {
        router.push("/");
      } catch (redirectError) {
        window.location.href = "/";
      }
    } finally {
      setIsLoading(false); // 清除加载状态
    }
  };

  // Google登录函数
  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true); // 设置加载状态

    try {
      // 调用NextAuth的signIn函数，使用Google提供商
      await signIn("google", {
        callbackUrl: "/", // 登录成功后的回调URL
      });
    } catch (error) {
      console.error("Google登录过程中出错:", error);
    } finally {
      setIsLoading(false); // 清除加载状态
    }
  };

  return {
    user,
    isLoading: isLoading || status === "loading",
    isAuthenticated,
    login,
    logout,
    loginWithGoogle,
  };
}

// 导入移动设备检测函数
import { isMobileDevice } from '../utils';

// 路由保护Hook
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 如果正在加载，等待
    if (isLoading) return;

    // 检查是否为移动设备或平板
    const isMobile = isMobileDevice();
    
    // 只有在非移动设备且未认证时才重定向到登录页
    if (!isMobile && !isAuthenticated) {
      // 添加延迟，避免在登出过程中立即重定向
      const timer = setTimeout(() => {
        try {
          router.push("/auth/signin");
        } catch (error) {
          console.error("重定向到登录页失败:", error);
          // 如果router.push失败，尝试使用window.location
          window.location.href = "/auth/signin";
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  // 移动设备上始终返回已认证状态
  const deviceIsMobile = isMobileDevice();
  const adjustedIsAuthenticated = deviceIsMobile || isAuthenticated;
  
  return { isAuthenticated: adjustedIsAuthenticated, isLoading };
}

// 获取当前用户信息的Hook
export function useCurrentUser() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}
