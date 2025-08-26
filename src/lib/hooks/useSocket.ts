// 这是Socket.io客户端Hook
// 作为应届生，我会创建一个简单的WebSocket连接管理Hook

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useCurrentUser } from './useAuth'

// Socket消息类型
interface SocketMessage {
  id: string
  userId: string
  content: string
  type: string
  timestamp: string
}

// 同步数据类型
interface SyncData {
  id: string
  userId: string
  action: 'add' | 'edit' | 'delete'
  target: string
  data: any
  timestamp: string
}

// 房间状态类型
interface RoomStatus {
  roomId: string | null
  userCount?: number
  users?: string[]
}

// Socket Hook返回类型
interface UseSocketReturn {
  socket: Socket | null // Socket实例
  isConnected: boolean // 连接状态
  roomStatus: RoomStatus // 房间状态
  messages: SocketMessage[] // 消息列表
  joinRoom: (roomId: string) => void // 加入房间
  leaveRoom: () => void // 离开房间
  sendMessage: (content: string, type?: string) => void // 发送消息
  syncData: (action: string, target: string, data: any) => void // 同步数据
  clearMessages: () => void // 清空消息
}

// 自定义Socket Hook
export function useSocket(): UseSocketReturn {
  // 获取当前用户信息
  const { user } = useCurrentUser()
  
  // Socket实例引用
  const socketRef = useRef<Socket | null>(null)
  
  // 状态管理
  const [isConnected, setIsConnected] = useState(false) // 连接状态
  const [roomStatus, setRoomStatus] = useState<RoomStatus>({ roomId: null }) // 房间状态
  const [messages, setMessages] = useState<SocketMessage[]>([]) // 消息列表

  // 初始化Socket连接
  useEffect(() => {
    if (!user?.id) return

    console.log('初始化Socket连接，用户ID:', user.id)

    // 创建Socket连接
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
      transports: ['websocket', 'polling'], // 传输方式
      timeout: 20000, // 连接超时
      forceNew: true, // 强制新连接
      reconnection: true, // 自动重连
      reconnectionAttempts: 5, // 重连尝试次数
      reconnectionDelay: 1000, // 重连延迟
    })

    socketRef.current = socket

    // 连接成功事件
    socket.on('connect', () => {
      console.log('Socket连接成功:', socket.id)
      setIsConnected(true)
      
      // 发送认证信息
      socket.emit('authenticate', {
        userId: user.id,
        token: 'dummy-token' // 实际项目中应该使用真实的JWT token
      })
    })

    // 认证结果事件
    socket.on('authenticated', (data) => {
      if (data.success) {
        console.log('Socket认证成功')
      } else {
        console.error('Socket认证失败:', data.error)
      }
    })

    // 断开连接事件
    socket.on('disconnect', (reason) => {
      console.log('Socket断开连接:', reason)
      setIsConnected(false)
      setRoomStatus({ roomId: null })
    })

    // 重连事件
    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket重连成功，尝试次数:', attemptNumber)
      setIsConnected(true)
    })

    // 重连失败事件
    socket.on('reconnect_failed', () => {
      console.error('Socket重连失败')
      setIsConnected(false)
    })

    // 加入房间成功事件
    socket.on('room-joined', (data) => {
      console.log('成功加入房间:', data)
      setRoomStatus({
        roomId: data.roomId,
        userCount: data.roomUsers.length,
        users: data.roomUsers
      })
    })

    // 离开房间事件
    socket.on('room-left', (data) => {
      console.log('离开房间:', data)
      setRoomStatus({ roomId: null })
      setMessages([]) // 清空消息
    })

    // 用户加入房间事件
    socket.on('user-joined', (data) => {
      console.log('用户加入房间:', data)
      setRoomStatus(prev => ({
        ...prev,
        userCount: data.roomUsers.length,
        users: data.roomUsers
      }))
    })

    // 用户离开房间事件
    socket.on('user-left', (data) => {
      console.log('用户离开房间:', data)
      setRoomStatus(prev => ({
        ...prev,
        userCount: data.roomUsers.length,
        users: data.roomUsers
      }))
    })

    // 接收房间消息事件
    socket.on('room-message', (message: SocketMessage) => {
      console.log('收到房间消息:', message)
      setMessages(prev => [...prev, message])
    })

    // 接收同步数据事件
    socket.on('sync-data', (syncData: SyncData) => {
      console.log('收到同步数据:', syncData)
      // 这里可以触发自定义事件或回调来处理同步数据
      window.dispatchEvent(new CustomEvent('socket-sync-data', { detail: syncData }))
    })

    // 房间状态更新事件
    socket.on('room-status', (status) => {
      console.log('房间状态更新:', status)
      setRoomStatus(status)
    })

    // 错误事件
    socket.on('error', (error) => {
      console.error('Socket错误:', error)
    })

    // Pong事件（心跳响应）
    socket.on('pong', (data) => {
      console.log('收到心跳响应:', data)
    })

    // 清理函数
    return () => {
      console.log('清理Socket连接')
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
      setRoomStatus({ roomId: null })
      setMessages([])
    }
  }, [user?.id])

  // 加入房间函数
  const joinRoom = useCallback((roomId: string) => {
    if (!socketRef.current || !isConnected) {
      console.error('Socket未连接，无法加入房间')
      return
    }

    console.log('加入房间:', roomId)
    socketRef.current.emit('join-room', { roomId })
  }, [isConnected])

  // 离开房间函数
  const leaveRoom = useCallback(() => {
    if (!socketRef.current || !isConnected) {
      console.error('Socket未连接，无法离开房间')
      return
    }

    console.log('离开当前房间')
    socketRef.current.emit('leave-room')
  }, [isConnected])

  // 发送消息函数
  const sendMessage = useCallback((content: string, type: string = 'text') => {
    if (!socketRef.current || !isConnected) {
      console.error('Socket未连接，无法发送消息')
      return
    }

    if (!roomStatus.roomId) {
      console.error('未加入任何房间，无法发送消息')
      return
    }

    console.log('发送消息:', content)
    socketRef.current.emit('room-message', { content, type })
  }, [isConnected, roomStatus.roomId])

  // 同步数据函数
  const syncData = useCallback((action: string, target: string, data: any) => {
    if (!socketRef.current || !isConnected) {
      console.error('Socket未连接，无法同步数据')
      return
    }

    if (!roomStatus.roomId) {
      console.error('未加入任何房间，无法同步数据')
      return
    }

    console.log('同步数据:', { action, target, data })
    socketRef.current.emit('sync-data', { action, target, data })
  }, [isConnected, roomStatus.roomId])

  // 清空消息函数
  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  // 心跳检测（定期发送ping）
  useEffect(() => {
    if (!isConnected || !socketRef.current) return

    const pingInterval = setInterval(() => {
      if (socketRef.current) {
        socketRef.current.emit('ping')
      }
    }, 30000) // 每30秒发送一次心跳

    return () => clearInterval(pingInterval)
  }, [isConnected])

  return {
    socket: socketRef.current,
    isConnected,
    roomStatus,
    messages,
    joinRoom,
    leaveRoom,
    sendMessage,
    syncData,
    clearMessages
  }
}

// 监听同步数据的Hook
export function useSyncData(callback: (syncData: SyncData) => void) {
  useEffect(() => {
    const handleSyncData = (event: CustomEvent<SyncData>) => {
      callback(event.detail)
    }

    // 监听自定义事件
    window.addEventListener('socket-sync-data', handleSyncData as EventListener)

    return () => {
      window.removeEventListener('socket-sync-data', handleSyncData as EventListener)
    }
  }, [callback])
}

// 房间管理Hook
export function useRoom(roomId?: string) {
  const { joinRoom, leaveRoom, roomStatus, isConnected } = useSocket()

  // 自动加入/离开房间
  useEffect(() => {
    if (!isConnected) return

    if (roomId && roomId !== roomStatus.roomId) {
      // 如果指定了房间ID且与当前房间不同，加入新房间
      joinRoom(roomId)
    } else if (!roomId && roomStatus.roomId) {
      // 如果没有指定房间ID但当前在房间中，离开房间
      leaveRoom()
    }
  }, [roomId, roomStatus.roomId, isConnected, joinRoom, leaveRoom])

  return {
    currentRoomId: roomStatus.roomId,
    userCount: roomStatus.userCount || 0,
    users: roomStatus.users || [],
    isInRoom: !!roomStatus.roomId
  }
}