import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'

class RoomManager {
  private rooms: Map<string, Set<string>> = new Map()
  private userRooms: Map<string, string> = new Map()

  joinRoom(userId: string, roomId: string): boolean {
    try {
      if (this.userRooms.has(userId)) {
        this.leaveRoom(userId)
      }

      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, new Set())
      }

      this.rooms.get(roomId)!.add(userId)
      this.userRooms.set(userId, roomId)

      console.log(`用户 ${userId} 加入房间 ${roomId}`)
      return true
    } catch (error) {
      console.error('用户加入房间失败:', error)
      return false
    }
  }

  leaveRoom(userId: string): boolean {
    try {
      const roomId = this.userRooms.get(userId)
      if (!roomId) return false

      const room = this.rooms.get(roomId)
      if (room) {
        room.delete(userId)
        
        if (room.size === 0) {
          this.rooms.delete(roomId)
          console.log(`房间 ${roomId} 已删除（无用户）`)
        }
      }

      this.userRooms.delete(userId)

      console.log(`用户 ${userId} 离开房间 ${roomId}`)
      return true
    } catch (error) {
      console.error('用户离开房间失败:', error)
      return false
    }
  }

  getRoomUsers(roomId: string): string[] {
    const room = this.rooms.get(roomId)
    return room ? Array.from(room) : []
  }

  getUserRoom(userId: string): string | undefined {
    return this.userRooms.get(userId)
  }

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

const roomManager = new RoomManager()

export function configureSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  })

  io.on('connection', (socket) => {
    console.log('新的Socket连接:', socket.id)

    socket.on('authenticate', (data) => {
      const { userId, token } = data
      
      if (userId) {
        socket.userId = userId
        socket.emit('authenticated', { success: true, userId })
        console.log(`用户 ${userId} 认证成功`)
      } else {
        socket.emit('authenticated', { success: false, error: '认证失败' })
      }
    })

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

      socket.join(roomId)
      
      const success = roomManager.joinRoom(userId, roomId)
      
      if (success) {
        const roomUsers = roomManager.getRoomUsers(roomId)
        
        socket.to(roomId).emit('user-joined', {
          userId,
          roomUsers
        })

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

    socket.on('leave-room', () => {
      const userId = socket.userId
      if (!userId) return

      const roomId = roomManager.getUserRoom(userId)
      if (roomId) {
        socket.leave(roomId)
        
        roomManager.leaveRoom(userId)
        
        socket.to(roomId).emit('user-left', {
          userId,
          roomUsers: roomManager.getRoomUsers(roomId)
        })

        socket.emit('room-left', { roomId })
        console.log(`用户 ${userId} 离开房间 ${roomId}`)
      }
    })

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

      io.to(roomId).emit('room-message', message)
      
      console.log(`房间 ${roomId} 收到消息:`, message)
    })

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
        action: data.action,
        target: data.target,
        data: data.data,
        timestamp: new Date().toISOString()
      }

      socket.to(roomId).emit('sync-data', syncData)
      
      console.log(`房间 ${roomId} 同步数据:`, syncData)
    })

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

    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() })
    })

    socket.on('disconnect', (reason) => {
      const userId = socket.userId
      console.log(`Socket断开连接: ${socket.id}, 用户: ${userId}, 原因: ${reason}`)

      if (userId) {
        const roomId = roomManager.getUserRoom(userId)
        if (roomId) {
          roomManager.leaveRoom(userId)
          
          socket.to(roomId).emit('user-left', {
            userId,
            roomUsers: roomManager.getRoomUsers(roomId)
          })
        }
      }
    })

    socket.on('error', (error) => {
      console.error('Socket错误:', error)
      socket.emit('error', { message: '连接出现错误' })
    })
  })

  setInterval(() => {
    const stats = roomManager.getRoomStats()
    console.log('房间统计:', stats)
  }, 60000)

  return io
}

declare module 'socket.io' {
  interface Socket {
    userId?: string
  }
}

export { roomManager }