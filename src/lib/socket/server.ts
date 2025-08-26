// 这是WebSocket服务器配置文件
// 作为应届生，我会创建一个简单的Socket.io服务器

import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'

// 房间管理器
class RoomManager {
  private rooms: Map<string, Set<string>> = new Map() // 房间ID -> 用户ID集合
  private userRooms: Map<string, string> = new Map() // 用户ID -> 房间ID

  // 用户加入房间
  joinRoom(userId: string, roomId: string): boolean {
    try {
      // 如果用户已在其他房间，先离开
      if (this.userRooms.has(userId)) {
        this.leaveRoom(userId)
      }

      // 创建房间（如果不存在）
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set())
      }

      // 添加用户到房间
      this.rooms.get(roomId)!.add(userId)
      this.userRooms.set(userId, roomId)

      console.log(`用户 ${userId} 加入房间 ${roomId}`)
      return true
    } catch (error) {
      console.error('用户加入房间失败:', error)
      return false
    }
  }

  // 用户离开房间
  leaveRoom(userId: string): boolean {
    try {
      const roomId = this.userRooms.get(userId)
      if (!roomId) return false

      // 从房间中移除用户
      const room = this.rooms.get(roomId)
      if (room) {
        room.delete(userId)
        
        // 如果房间为空，删除房间
        if (room.size === 0) {
          this.rooms.delete(roomId)
          console.log(`房间 ${roomId} 已删除（无用户）`)
        }
      }

      // 从用户房间映射中移除
      this.userRooms.delete(userId)

      console.log(`用户 ${userId} 离开房间 ${roomId}`)
      return true
    } catch (error) {
      console.error('用户离开房间失败:', error)
      return false
    }
  }

  // 获取房间中的所有用户
  getRoomUsers(roomId: string): string[] {
    const room = this.rooms.get(roomId)
    return room ? Array.from(room) : []
  }

  // 获取用户所在的房间
  getUserRoom(userId: string): string | undefined {
    return this.userRooms.get(userId)
  }

  // 获取房间统计信息
  getRoomStats(): { totalRooms: number; totalUsers: number; roomDetails: any[] } {
    const roomDetails = Array.from(this.rooms.entries()).map(([roomId, users]) => ({
      roomId,
      userCount: users.size,
      users: Array.from(users)
    }))

    return {
      totalRooms: this.rooms.size,
      totalUsers: this.userRooms.size,
      roomDetails
    }
  }
}

// 全局房间管理器实例
const roomManager = new RoomManager()

// Socket.io服务器配置
export function configureSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000", // 允许的源
      methods: ["GET", "POST"], // 允许的方法
      credentials: true // 允许凭据
    },
    transports: ['websocket', 'polling'], // 传输方式
    pingTimeout: 60000, // ping超时时间
    pingInterval: 25000 // ping间隔时间
  })

  // 连接事件处理
  io.on('connection', (socket) => {
    console.log('新的Socket连接:', socket.id)

    // 用户认证（简化版本）
    socket.on('authenticate', (data) => {
      const { userId, token } = data
      
      // 这里应该验证token的有效性
      // 为了简化，我们直接使用userId
      if (userId) {
        socket.userId = userId
        socket.emit('authenticated', { success: true, userId })
        console.log(`用户 ${userId} 认证成功`)
      } else {
        socket.emit('authenticated', { success: false, error: '认证失败' })
      }
    })

    // 加入房间
    socket.on('join-room', (data) => {
      const { roomId } = data
      const userId = socket.userId

      if (!userId) {
        socket.emit('error', { message: '请先认证' })
        return
      }

      if (!roomId) {
        socket.emit('error', { message: '房间ID不能为空' })
        return
      }

      // 加入Socket.io房间
      socket.join(roomId)
      
      // 更新房间管理器
      const success = roomManager.joinRoom(userId, roomId)
      
      if (success) {
        // 获取房间中的其他用户
        const roomUsers = roomManager.getRoomUsers(roomId)
        
        // 通知房间中的其他用户
        socket.to(roomId).emit('user-joined', {
          userId,
          roomUsers
        })

        // 向当前用户发送房间信息
        socket.emit('room-joined', {
          roomId,
          roomUsers,
          message: '成功加入房间'
        })

        console.log(`用户 ${userId} 加入房间 ${roomId}，当前房间用户数: ${roomUsers.length}`)
      } else {
        socket.emit('error', { message: '加入房间失败' })
      }
    })

    // 离开房间
    socket.on('leave-room', () => {
      const userId = socket.userId
      if (!userId) return

      const roomId = roomManager.getUserRoom(userId)
      if (roomId) {
        // 离开Socket.io房间
        socket.leave(roomId)
        
        // 更新房间管理器
        roomManager.leaveRoom(userId)
        
        // 通知房间中的其他用户
        socket.to(roomId).emit('user-left', {
          userId,
          roomUsers: roomManager.getRoomUsers(roomId)
        })

        socket.emit('room-left', { roomId })
        console.log(`用户 ${userId} 离开房间 ${roomId}`)
      }
    })

    // 发送消息到房间
    socket.on('room-message', (data) => {
      const userId = socket.userId
      if (!userId) {
        socket.emit('error', { message: '请先认证' })
        return
      }

      const roomId = roomManager.getUserRoom(userId)
      if (!roomId) {
        socket.emit('error', { message: '您不在任何房间中' })
        return
      }

      const message = {
        id: Date.now().toString(),
        userId,
        content: data.content,
        type: data.type || 'text',
        timestamp: new Date().toISOString()
      }

      // 发送消息到房间中的所有用户（包括发送者）
      io.to(roomId).emit('room-message', message)
      
      console.log(`房间 ${roomId} 收到消息:`, message)
    })

    // 实时协作数据同步
    socket.on('sync-data', (data) => {
      const userId = socket.userId
      if (!userId) {
        socket.emit('error', { message: '请先认证' })
        return
      }

      const roomId = roomManager.getUserRoom(userId)
      if (!roomId) {
        socket.emit('error', { message: '您不在任何房间中' })
        return
      }

      const syncData = {
        id: Date.now().toString(),
        userId,
        action: data.action, // 操作类型：add, edit, delete
        target: data.target, // 操作目标：activity, location等
        data: data.data, // 操作数据
        timestamp: new Date().toISOString()
      }

      // 发送同步数据到房间中的其他用户（不包括发送者）
      socket.to(roomId).emit('sync-data', syncData)
      
      console.log(`房间 ${roomId} 同步数据:`, syncData)
    })

    // 获取房间状态
    socket.on('get-room-status', () => {
      const userId = socket.userId
      if (!userId) {
        socket.emit('error', { message: '请先认证' })
        return
      }

      const roomId = roomManager.getUserRoom(userId)
      if (roomId) {
        const roomUsers = roomManager.getRoomUsers(roomId)
        socket.emit('room-status', {
          roomId,
          userCount: roomUsers.length,
          users: roomUsers
        })
      } else {
        socket.emit('room-status', { roomId: null })
      }
    })

    // 心跳检测
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() })
    })

    // 断开连接处理
    socket.on('disconnect', (reason) => {
      const userId = socket.userId
      console.log(`Socket断开连接: ${socket.id}, 用户: ${userId}, 原因: ${reason}`)

      if (userId) {
        const roomId = roomManager.getUserRoom(userId)
        if (roomId) {
          // 从房间管理器中移除用户
          roomManager.leaveRoom(userId)
          
          // 通知房间中的其他用户
          socket.to(roomId).emit('user-left', {
            userId,
            roomUsers: roomManager.getRoomUsers(roomId)
          })
        }
      }
    })

    // 错误处理
    socket.on('error', (error) => {
      console.error('Socket错误:', error)
      socket.emit('error', { message: '连接出现错误' })
    })
  })

  // 定期清理和统计
  setInterval(() => {
    const stats = roomManager.getRoomStats()
    console.log('房间统计:', stats)
  }, 60000) // 每分钟输出一次统计信息

  return io
}

// 扩展Socket类型以包含userId
declare module 'socket.io' {
  interface Socket {
    userId?: string
  }
}

export { roomManager }