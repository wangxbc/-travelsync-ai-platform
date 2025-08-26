// 这是应用的根布局文件
// 作为应届生，我会在这里配置全局的提供商和样式

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Navigation } from "@/components/common/Navigation";
import CustomCursor from "@/components/common/CustomCursor";
import { ToastProvider } from "@/components/ui/Toast";

// 配置字体
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 获取基础URL，确保格式正确
const getBaseUrl = () => {
  const url = process.env.NEXTAUTH_URL || 'https://travelsync-ai-platform.vercel.app';
  // 确保URL格式正确，避免重复协议
  if (url.startsWith('https:// ') || url.startsWith('http:// ')) {
    return url.replace(/^https?:\/\/ /, 'https://');
  }
  return url.startsWith('http') ? url : `https://${url}`;
};

// 页面元数据配置
export const metadata: Metadata = {
  title: "TravelSync - AI驱动的智能旅行规划平台",
  description:
    "使用最先进的AI技术，为您量身定制完美的旅行计划。3D地图可视化、实时协作、智能推荐，让旅行规划变得简单而有趣。",
  keywords: "旅行规划, AI, 人工智能, 3D地图, 实时协作, 智能推荐",
  authors: [{ name: "TravelSync Team" }],
  metadataBase: new URL(getBaseUrl()),
};

// Viewport 配置（Next.js 15 要求单独导出）
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

// 根布局组件
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CustomCursor />
        {/* 会话提供商包装整个应用 */}
        <SessionProvider>
          <ToastProvider>
            <Navigation />
            <main>{children}</main>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
