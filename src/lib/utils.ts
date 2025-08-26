// 这个文件包含了项目中常用的工具函数
// 作为应届生，我会把常用的功能都封装成函数

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// 合并CSS类名的工具函数，这是shadcn/ui推荐的方式
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 格式化货币显示的函数
export function formatCurrency(amount: number, currency: string = 'CNY'): string {
  // 使用Intl.NumberFormat来格式化货币
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency', // 货币格式
    currency: currency, // 货币类型
    minimumFractionDigits: 0, // 最少小数位
    maximumFractionDigits: 2, // 最多小数位
  }).format(amount)
}

// 格式化日期显示的函数
export function formatDate(date: Date | string): string {
  // 如果传入的是字符串，先转换为Date对象
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // 使用Intl.DateTimeFormat来格式化日期
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', // 显示年份
    month: 'long', // 显示完整月份名
    day: 'numeric', // 显示日期
    weekday: 'long', // 显示完整星期名
  }).format(dateObj)
}

// 格式化时间显示的函数
export function formatTime(date: Date | string): string {
  // 如果传入的是字符串，先转换为Date对象
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // 使用Intl.DateTimeFormat来格式化时间
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit', // 2位数小时
    minute: '2-digit', // 2位数分钟
    hour12: false, // 使用24小时制
  }).format(dateObj)
}

// 计算两个坐标点之间距离的函数（使用Haversine公式）
export function calculateDistance(
  lat1: number, // 第一个点的纬度
  lon1: number, // 第一个点的经度
  lat2: number, // 第二个点的纬度
  lon2: number  // 第二个点的经度
): number {
  // 地球半径（公里）
  const R = 6371
  
  // 将角度转换为弧度
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  
  // Haversine公式计算
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  
  // 返回距离（公里）
  return R * c
}

// 生成随机ID的函数
export function generateId(): string {
  // 使用时间戳和随机数生成唯一ID
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 防抖函数，用于优化搜索等频繁操作
export function debounce<T extends (...args: any[]) => any>(
  func: T, // 要防抖的函数
  wait: number // 等待时间（毫秒）
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    // 清除之前的定时器
    if (timeout) {
      clearTimeout(timeout)
    }
    
    // 设置新的定时器
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// 节流函数，用于限制函数执行频率
export function throttle<T extends (...args: any[]) => any>(
  func: T, // 要节流的函数
  limit: number // 限制时间间隔（毫秒）
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 深拷贝函数
export function deepClone<T>(obj: T): T {
  // 如果不是对象或者是null，直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  // 如果是Date对象
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  // 如果是数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T
  }
  
  // 如果是普通对象
  const cloned = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  
  return cloned
}

// 验证邮箱格式的函数
export function isValidEmail(email: string): boolean {
  // 简单的邮箱正则表达式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 验证手机号格式的函数（中国手机号）
export function isValidPhone(phone: string): boolean {
  // 中国手机号正则表达式
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 获取文件扩展名的函数
export function getFileExtension(filename: string): string {
  // 找到最后一个点的位置
  const lastDotIndex = filename.lastIndexOf('.')
  
  // 如果没有点或者点在开头，返回空字符串
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return ''
  }
  
  // 返回扩展名（不包含点）
  return filename.slice(lastDotIndex + 1).toLowerCase()
}

// 格式化文件大小的函数
export function formatFileSize(bytes: number): string {
  // 如果小于1KB
  if (bytes < 1024) {
    return bytes + ' B'
  }
  
  // 如果小于1MB
  if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB'
  }
  
  // 如果小于1GB
  if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
  
  // 大于1GB
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

// 生成随机颜色的函数（用于图表等）
export function generateRandomColor(): string {
  // 生成随机的RGB值
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  
  // 返回十六进制颜色值
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// 检查是否为移动设备的函数
export function isMobileDevice(): boolean {
  // 检查window对象是否存在（服务端渲染时不存在）
  if (typeof window === 'undefined') {
    return false
  }
  
  // 检查用户代理字符串
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 本地存储操作的工具函数
export const localStorage = {
  // 设置本地存储
  set: (key: string, value: any): void => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error('设置本地存储失败:', error)
      }
    }
  },
  
  // 获取本地存储
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue || null
      } catch (error) {
        console.error('获取本地存储失败:', error)
        return defaultValue || null
      }
    }
    return defaultValue || null
  },
  
  // 删除本地存储
  remove: (key: string): void => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key)
      } catch (error) {
        console.error('删除本地存储失败:', error)
      }
    }
  },
  
  // 清空本地存储
  clear: (): void => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.clear()
      } catch (error) {
        console.error('清空本地存储失败:', error)
      }
    }
  }
}