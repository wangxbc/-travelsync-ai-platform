// 通用导航组件
// 作为应届生，我会创建一个可复用的导航栏组件

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCurrentUser, useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SimpleLogoWithText } from '@/components/ui/SimpleLogo'

export function Navigation() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useCurrentUser()
  const { logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // 导航链接配置
  const navigationLinks = [
    { href: '/planning', label: '智能规划', requireAuth: true },
    { href: '/map', label: '3D地图', requireAuth: true },
    { href: '/collaboration', label: '协作', requireAuth: true },
    { href: '/analytics', label: '数据分析', requireAuth: true },
    { href: '/demo', label: '功能演示', requireAuth: false },
  ]

  // 过滤导航链接
  const visibleLinks = navigationLinks.filter(link => 
    !link.requireAuth || isAuthenticated
  )

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo区域 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center cursor-pointer">
              <SimpleLogoWithText size="sm" />
            </Link>
          </div>

          {/* 桌面端导航链接 */}
          <div className="hidden md:flex items-center space-x-8">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-2 rounded-md text-sm font-medium transition-colors overflow-hidden group",
                  pathname === link.href
                    ? "text-white"
                    : "text-gray-600 hover:text-white"
                )}
              >
                {/* 背景扩散动画 */}
                <span 
                  className={cn(
                    "absolute inset-0 rounded-md transition-all duration-300 ease-out",
                    pathname === link.href
                      ? "bg-indigo-600 scale-100"
                      : "bg-indigo-600 scale-0 group-hover:scale-100"
                  )}
                  style={{
                    transformOrigin: 'center',
                  }}
                />
                
                {/* 文字内容 */}
                <span className="relative z-10">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* 用户操作区域 */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* 用户信息 */}
                <div className="hidden md:flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt="用户头像"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 头像加载失败时显示默认头像
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-indigo-100 rounded-full flex items-center justify-center ${user?.image ? 'hidden' : ''}`}>
                      <span className="text-sm font-medium text-indigo-600">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-700">{user?.name}</span>
                </div>

                {/* 用户菜单 */}
                <div className="relative">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/profile">个人资料</Link>
                  </Button>
                </div>

                {/* 登出按钮 */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  登出
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">登录</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">注册</Link>
                </Button>
              </div>
            )}

            {/* 移动端菜单按钮 */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative block px-3 py-2 rounded-md text-base font-medium transition-colors overflow-hidden group",
                    pathname === link.href
                      ? "text-white"
                      : "text-gray-600 hover:text-white"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {/* 背景扩散动画 */}
                  <span 
                    className={cn(
                      "absolute inset-0 rounded-md transition-all duration-300 ease-out",
                      pathname === link.href
                        ? "bg-indigo-600 scale-100"
                        : "bg-indigo-600 scale-0 group-hover:scale-100"
                    )}
                    style={{
                      transformOrigin: 'center',
                    }}
                  />
                  
                  {/* 文字内容 */}
                  <span className="relative z-10">
                    {link.label}
                  </span>
                </Link>
              ))}
              
              {/* 移动端用户信息 */}
              {isAuthenticated && (
                <div className="pt-4 border-t">
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                        {user?.image ? (
                          <img
                            src={user.image}
                            alt="用户头像"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // 头像加载失败时显示默认头像
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-indigo-100 rounded-full flex items-center justify-center ${user?.image ? 'hidden' : ''}`}>
                          <span className="text-sm font-medium text-indigo-600">
                            {user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">{user?.name}</span>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    个人资料
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      setIsMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    登出
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}