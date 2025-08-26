// 这个文件提供AI相关的自定义Hook
// 作为应届生，我会封装AI调用的逻辑

'use client'

import { useState, useCallback } from 'react'
import type { TravelInput, Itinerary, ApiResponse } from '@/types'

// AI Hook的返回类型
interface UseAIReturn {
  isGenerating: boolean // 是否正在生成
  isOptimizing: boolean // 是否正在优化
  error: string | null // 错误信息
  generateItinerary: (input: TravelInput) => Promise<Itinerary | null> // 生成行程函数
  generateItineraryStream: (input: TravelInput, onChunk: (chunk: string) => void) => Promise<void> // 流式生成函数
  optimizeItinerary: (itineraryId: string, feedback: string) => Promise<Itinerary | null> // 优化行程函数
  clearError: () => void // 清除错误函数
}

// 自定义AI Hook
export function useAI(): UseAIReturn {
  // 状态管理
  const [isGenerating, setIsGenerating] = useState(false) // 生成状态
  const [isOptimizing, setIsOptimizing] = useState(false) // 优化状态
  const [error, setError] = useState<string | null>(null) // 错误状态

  // 清除错误函数
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 生成行程函数
  const generateItinerary = useCallback(async (input: TravelInput): Promise<Itinerary | null> => {
    setIsGenerating(true) // 设置生成状态
    setError(null) // 清除错误

    try {
      console.log('开始生成行程，输入:', input)

      // 调用API
      const response = await fetch('/api/ai/generate-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      // 解析响应
      const result: ApiResponse<Itinerary> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP错误: ${response.status}`)
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || '生成行程失败')
      }

      console.log('行程生成成功:', result.data.title)
      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成行程时出现未知错误'
      console.error('生成行程失败:', errorMessage)
      setError(errorMessage)
      return null
    } finally {
      setIsGenerating(false) // 清除生成状态
    }
  }, [])

  // 流式生成行程函数
  const generateItineraryStream = useCallback(async (
    input: TravelInput, 
    onChunk: (chunk: string) => void
  ): Promise<void> => {
    setIsGenerating(true) // 设置生成状态
    setError(null) // 清除错误

    try {
      console.log('开始流式生成行程，输入:', input)

      // 调用流式API
      const response = await fetch('/api/ai/stream-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`)
      }

      // 检查响应是否为流式
      if (!response.body) {
        throw new Error('响应体为空')
      }

      // 创建流读取器
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          // 读取流数据
          const { done, value } = await reader.read()
          
          if (done) {
            console.log('流式生成完成')
            break
          }

          // 解码数据
          const chunk = decoder.decode(value, { stream: true })
          
          // 处理服务器发送的事件
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                // 根据事件类型处理
                switch (data.type) {
                  case 'start':
                    console.log('开始生成:', data.message)
                    break
                  case 'chunk':
                    onChunk(data.content) // 调用回调函数处理数据块
                    break
                  case 'complete':
                    console.log('生成完成:', data.message)
                    break
                  case 'error':
                    throw new Error(data.message)
                }
              } catch (parseError) {
                console.warn('解析流数据失败:', parseError)
              }
            }
          }
        }
      } finally {
        reader.releaseLock() // 释放读取器锁
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '流式生成行程时出现未知错误'
      console.error('流式生成行程失败:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsGenerating(false) // 清除生成状态
    }
  }, [])

  // 优化行程函数
  const optimizeItinerary = useCallback(async (
    itineraryId: string, 
    feedback: string
  ): Promise<Itinerary | null> => {
    setIsOptimizing(true) // 设置优化状态
    setError(null) // 清除错误

    try {
      console.log('开始优化行程，ID:', itineraryId, '反馈:', feedback)

      // 调用API
      const response = await fetch('/api/ai/optimize-itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itineraryId,
          feedback
        }),
      })

      // 解析响应
      const result: ApiResponse<Itinerary> = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP错误: ${response.status}`)
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || '优化行程失败')
      }

      console.log('行程优化成功:', result.data.title)
      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '优化行程时出现未知错误'
      console.error('优化行程失败:', errorMessage)
      setError(errorMessage)
      return null
    } finally {
      setIsOptimizing(false) // 清除优化状态
    }
  }, [])

  return {
    isGenerating,
    isOptimizing,
    error,
    generateItinerary,
    generateItineraryStream,
    optimizeItinerary,
    clearError
  }
}

// 获取行程列表的Hook
export function useItineraries() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]) // 行程列表
  const [isLoading, setIsLoading] = useState(false) // 加载状态
  const [error, setError] = useState<string | null>(null) // 错误状态

  // 获取行程列表函数
  const fetchItineraries = useCallback(async (page: number = 1, limit: number = 10) => {
    setIsLoading(true) // 设置加载状态
    setError(null) // 清除错误

    try {
      console.log('获取行程列表，页码:', page, '限制:', limit)

      // 调用API
      const response = await fetch(`/api/ai/generate-itinerary?page=${page}&limit=${limit}`)
      
      // 解析响应
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP错误: ${response.status}`)
      }

      if (!result.success || !result.data) {
        throw new Error(result.error || '获取行程列表失败')
      }

      console.log('获取行程列表成功，数量:', result.data.itineraries.length)
      setItineraries(result.data.itineraries)

      return result.data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取行程列表时出现未知错误'
      console.error('获取行程列表失败:', errorMessage)
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false) // 清除加载状态
    }
  }, [])

  // 刷新行程列表函数
  const refreshItineraries = useCallback(() => {
    return fetchItineraries()
  }, [fetchItineraries])

  return {
    itineraries,
    isLoading,
    error,
    fetchItineraries,
    refreshItineraries
  }
}