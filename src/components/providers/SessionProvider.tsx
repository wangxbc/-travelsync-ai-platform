// 这个文件提供NextAuth会话提供商组件
// 作为应届生，我会创建一个简单的包装组件

'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

// 组件属性类型
interface SessionProviderProps {
  children: ReactNode // 子组件
}

// 会话提供商组件
export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  )
}