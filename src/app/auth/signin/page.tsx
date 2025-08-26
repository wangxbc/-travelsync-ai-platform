// 这是用户登录页面
// 作为应届生，我会创建一个简单但功能完整的登录表单

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { useSearchParams } from "next/navigation";

// 登录表单组件
function SignInForm() {
  // 状态管理
  const [email, setEmail] = useState(""); // 邮箱输入
  const [password, setPassword] = useState(""); // 密码输入
  const [error, setError] = useState(""); // 错误信息
  const [isSubmitting, setIsSubmitting] = useState(false); // 提交状态
  const [hasShownMessage, setHasShownMessage] = useState(false); // 控制消息显示

  // 使用认证Hook
  const { login, loginWithGoogle, isLoading } = useAuth();
  const { showSuccessToast, showErrorToast, showWarningToast } = useToast(); // Toast提示
  const searchParams = useSearchParams(); // 获取URL参数

  // 检查是否有注册成功的消息
  useEffect(() => {
    const message = searchParams.get("message");
    if (message && !hasShownMessage) {
      showSuccessToast(`${message}`);
      setHasShownMessage(true); // 标记已显示过消息
    }
  }, [searchParams, showSuccessToast, hasShownMessage]);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止默认提交行为

    // 清除之前的错误信息
    setError("");

    // 验证输入
    if (!email || !password) {
      setError("请填写邮箱和密码");
      showWarningToast("请填写邮箱和密码");
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("请输入有效的邮箱地址");
      showWarningToast("请输入有效的邮箱地址");
      return;
    }

    setIsSubmitting(true); // 设置提交状态

    try {
      // 调用登录函数
      const success = await login(email, password);

      if (!success) {
        setError("登录失败，请检查邮箱和密码");
        showErrorToast("登录失败，请检查邮箱和密码");
      } else {
        showSuccessToast("登录成功！欢迎使用TravelSync");
      }
    } catch (error) {
      console.error("登录错误:", error);
      setError("登录过程中出现错误，请稍后重试");
      showErrorToast("登录过程中出现错误，请稍后重试");
    } finally {
      setIsSubmitting(false); // 清除提交状态
    }
  };

  // 处理Google登录
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google登录错误:", error);
      setError("Google登录失败，请稍后重试");
      showErrorToast("Google登录失败，请稍后重试");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 页面标题 */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录到TravelSync
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            还没有账户？{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              立即注册
            </Link>
          </p>
        </div>

        {/* 登录表单 */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* 邮箱输入框 */}
            <div>
              <label htmlFor="email" className="sr-only">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isLoading}
              />
            </div>

            {/* 密码输入框 */}
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || isLoading}
              />
            </div>
          </div>

          {/* 错误信息显示 */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* 记住我和忘记密码 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                记住我
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                忘记密码？
              </Link>
            </div>
          </div>

          {/* 登录按钮 */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  登录中...
                </span>
              ) : (
                "登录"
              )}
            </button>
          </div>

          {/* 分割线 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">或者</span>
              </div>
            </div>
          </div>

          {/* 社交登录选项 */}
          <div className="space-y-3">
            {/* 微信登录 */}
            <button
              type="button"
              onClick={() => console.log("微信登录")}
              disabled={isSubmitting || isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 mr-2 bg-green-500 rounded-sm"></div>
              微信登录
            </button>

            {/* QQ登录 */}
            <button
              type="button"
              onClick={() => console.log("QQ登录")}
              disabled={isSubmitting || isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 mr-2 bg-blue-500 rounded-sm"></div>
              QQ登录
            </button>

            {/* Google登录 */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting || isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 mr-2 bg-red-500 rounded-sm"></div>
              Google登录
            </button>
          </div>
        </form>

        {/* 测试账户提示 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>测试账户：</strong>
            <br />
            邮箱: test@example.com
            <br />
            密码: 任意密码（演示用）
          </p>
        </div>
      </div>
    </div>
  );
}

// 主组件，包装在Suspense中
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
