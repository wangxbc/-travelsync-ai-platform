"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
// 移除数据库依赖，使用API路由

export default function SignUpPage() {
  // 状态管理
  const [formData, setFormData] = useState({
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
  });
  const [error, setError] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const router = useRouter(); // 路由对象
  const { showSuccessToast, showErrorToast } = useToast(); 

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 验证表单数据
  const validateForm = (): boolean => {
    // 检查必填字段
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("请填写所有必填字段");
      return false;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("请输入有效的邮箱地址");
      return false;
    }

    // 验证密码长度
    if (formData.password.length < 6) {
      setError("密码长度至少为6位");
      return false;
    }

    // 验证密码确认
    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      return false;
    }

    return true;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // 阻止默认提交行为

    // 清除之前的错误信息
    setError("");

    // 验证表单
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true); // 设置提交状态

    try {
      // 调用注册API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("用户注册成功:", formData.email);
        showSuccessToast("注册成功！正在跳转到登录页面...");
        // 注册成功后重定向到登录页面
        setTimeout(() => {
          router.push("/auth/signin?message=注册成功，请登录");
        }, 1500);
      } else {
        setError(result.error || "注册失败，请稍后重试");
        showErrorToast(`${result.error || "注册失败，请稍后重试"}`);
      }
    } catch (error) {
      console.error("注册错误:", error);
      setError("注册过程中出现错误，请稍后重试");
      showErrorToast("注册过程中出现错误，请稍后重试");
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            注册TravelSync账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            已有账户？{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              立即登录
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                姓名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="请输入您的姓名"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="请输入邮箱地址"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            {/* 密码输入框 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="请输入密码（至少6位）"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            {/* 确认密码输入框 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="agree-terms"
              className="ml-2 block text-sm text-gray-900"
            >
              我同意{" "}
              <Link
                href="/terms"
                className="text-indigo-600 hover:text-indigo-500"
              >
                服务条款
              </Link>{" "}
              和{" "}
              <Link
                href="/privacy"
                className="text-indigo-600 hover:text-indigo-500"
              >
                隐私政策
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
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
                  注册中...
                </span>
              ) : (
                "创建账户"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            注册后您将可以：
            <br />
            • 使用AI智能规划旅行行程
            <br />
            • 在3D地图上查看路线
            <br />
            • 与朋友实时协作规划
            <br />• 获得个性化推荐
          </p>
        </div>
      </div>
    </div>
  );
}
