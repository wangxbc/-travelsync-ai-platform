'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRequireAuth } from '@/lib/hooks/useAuth'
import { useSocket, useRoom, useSyncData } from '@/lib/hooks/useSocket'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CollaborationPage() {
  // 路由保护，确保用户已登录
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth()
  const user = { id: 'demo-user-1', name: '演示用户', avatar: null } // 模拟用户数据

  // 使用Socket Hook
  const { isConnected, messages, sendMessage, syncData, clearMessages } = useSocket()

  // 状态管理
  const [roomId, setRoomId] = useState('demo-room-1') // 房间ID
  const [messageInput, setMessageInput] = useState('') // 消息输入
  const [collaborativeData, setCollaborativeData] = useState<any[]>([]) // 协作数据
  const [newItemInput, setNewItemInput] = useState('') // 新项目输入
  const [showShareDialog, setShowShareDialog] = useState(false) // 显示分享对话框
  const [shareLink, setShareLink] = useState('') // 分享链接
  const [linkCopied, setLinkCopied] = useState(false) // 链接已复制状态

  // 使用房间Hook
  const { currentRoomId, userCount, users, isInRoom } = useRoom(roomId)

  // 监听同步数据
  useSyncData((syncData) => {
    console.log('收到同步数据:', syncData)

    switch (syncData.action) {
      case 'add':
        if (syncData.target === 'item') {
          setCollaborativeData(prev => [...prev, syncData.data])
        }
        break
      case 'edit':
        if (syncData.target === 'item') {
          setCollaborativeData(prev =>
            prev.map(item =>
              item.id === syncData.data.id ? { ...item, ...syncData.data } : item
            )
          )
        }
        break
      case 'delete':
        if (syncData.target === 'item') {
          setCollaborativeData(prev =>
            prev.filter(item => item.id !== syncData.data.id)
          )
        }
        break
    }
  })

  // 如果正在加载或未认证，显示加载状态
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <p className="text-lg text-gray-600">加载中...</p>
        </motion.div>
      </div>
    )
  }

  // 发送消息
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageInput.trim()) {
      sendMessage(messageInput.trim())
      setMessageInput('')
    }
  }

  // 添加协作项目
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (newItemInput.trim()) {
      const newItem = {
        id: Date.now().toString(),
        text: newItemInput.trim(),
        createdBy: user?.id,
        createdAt: new Date().toISOString(),
        type: 'task'
      }

      // 本地添加
      setCollaborativeData(prev => [...prev, newItem])

      // 同步到其他用户
      syncData('add', 'item', newItem)

      setNewItemInput('')
    }
  }

  // 生成分享链接
  const generateShareLink = () => {
    const baseUrl = window.location.origin
    const link = `${baseUrl}/collaboration?room=${roomId}&invite=true`
    setShareLink(link)
    setShowShareDialog(true)
  }

  // 复制分享链接
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 关闭分享对话框
  const closeShareDialog = () => {
    setShowShareDialog(false)
    setLinkCopied(false)
  }

  // 处理键盘事件
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showShareDialog) {
        closeShareDialog()
      }
    }

    if (showShareDialog) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [showShareDialog])

  // 删除协作项目
  const handleDeleteItem = (itemId: string) => {
    // 本地删除
    setCollaborativeData(prev => prev.filter(item => item.id !== itemId))

    // 同步到其他用户
    syncData('delete', 'item', { id: itemId })
  }

  // 编辑协作项目
  const handleEditItem = (itemId: string, newText: string) => {
    const updatedItem = {
      id: itemId,
      text: newText,
      updatedBy: user?.id,
      updatedAt: new Date().toISOString()
    }

    // 本地更新
    setCollaborativeData(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, ...updatedItem } : item
      )
    )

    // 同步到其他用户
    syncData('edit', 'item', updatedItem)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            实时协作
          </h1>
          <p className="text-lg text-gray-600">
            与团队成员实时协作，共同规划旅行
          </p>
        </motion.div>

        {/* 连接状态卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* 连接状态信息 */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {isConnected ? '已连接' : '未连接'}
                    </span>
                  </div>

                  {isInRoom && (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>房间: {currentRoomId}</span>
                      <span>在线: {userCount} 人</span>
                    </div>
                  )}
                </div>

                {/* 房间控制 */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="房间ID"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    onClick={() => setRoomId(roomId)}
                    disabled={!isConnected}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    加入
                  </Button>
                  <Button
                    onClick={generateShareLink}
                    disabled={!isConnected || !isInRoom}
                    size="sm"
                    variant="outline"
                  >
                    分享
                  </Button>
                </div>
              </div>

              {/* 在线用户列表 */}
              <AnimatePresence>
                {users.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200"
                  >
                    <div className="flex flex-wrap gap-2">
                      {users.map((userId) => (
                        <span
                          key={userId}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${userId === user?.id
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          {userId === user?.id ? '我' : `用户${userId.slice(-4)}`}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：协作任务 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white shadow-sm border border-gray-200 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    协作任务
                  </CardTitle>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {collaborativeData.length} 项
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 添加新任务 */}
                <form onSubmit={handleAddItem} className="flex gap-2">
                  <input
                    type="text"
                    value={newItemInput}
                    onChange={(e) => setNewItemInput(e.target.value)}
                    placeholder="添加新任务..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!isInRoom}
                  />
                  <Button
                    type="submit"
                    disabled={!isInRoom || !newItemInput.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    添加
                  </Button>
                </form>

                {/* 任务列表 */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  <AnimatePresence>
                    {collaborativeData.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">暂无任务</p>
                        <p className="text-xs text-gray-400 mt-1">添加第一个任务开始协作</p>
                      </div>
                    ) : (
                      collaborativeData.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="group p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.text}</p>
                              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                                <span>创建: {item.createdBy === user?.id ? '我' : `用户${item.createdBy.slice(-4)}`}</span>
                                {item.updatedBy && (
                                  <span>编辑: {item.updatedBy === user?.id ? '我' : `用户${item.updatedBy.slice(-4)}`}</span>
                                )}
                                <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                              </div>
                            </div>

                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  const newText = prompt('编辑任务:', item.text)
                                  if (newText && newText !== item.text) {
                                    handleEditItem(item.id, newText)
                                  }
                                }}
                                disabled={!isInRoom}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded text-xs disabled:opacity-50"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={!isInRoom}
                                className="p-1 text-red-600 hover:bg-red-100 rounded text-xs disabled:opacity-50"
                              >
                                删除
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 右侧：实时聊天 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-white shadow-sm border border-gray-200 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    实时聊天
                  </CardTitle>
                  <Button
                    onClick={clearMessages}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    清空
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 消息列表 */}
                <div className="h-80 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
                  <AnimatePresence>
                    {messages.length === 0 ? (
                      <div className="text-center py-16 text-gray-500">
                        <p className="text-sm">暂无消息</p>
                        <p className="text-xs text-gray-400 mt-1">开始聊天吧</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs ${message.userId === user?.id ? 'ml-8' : 'mr-8'}`}>
                            <div
                              className={`px-3 py-2 rounded-lg text-sm ${message.userId === user?.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-900 border border-gray-200'
                                }`}
                            >
                              <div className={`text-xs font-medium mb-1 ${message.userId === user?.id ? 'text-blue-100' : 'text-gray-600'
                                }`}>
                                {message.userId === user?.id ? '我' : `用户${message.userId.slice(-4)}`}
                              </div>
                              <div>{message.content}</div>
                              <div className={`text-xs mt-1 opacity-75 ${message.userId === user?.id ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* 消息输入 */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="输入消息..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!isInRoom}
                  />
                  <Button
                    type="submit"
                    disabled={!isInRoom || !messageInput.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    发送
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 使用说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-blue-50 border border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">
                使用说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-2">
                  <p>• 输入房间ID并点击"加入"进入协作房间</p>
                  <p>• 在任务板中添加、编辑、删除任务，实时同步</p>
                  <p>• 使用聊天功能与团队成员实时沟通</p>
                </div>
                <div className="space-y-2">
                  <p>• 点击"分享"按钮生成邀请链接</p>
                  <p>• 支持多人同时在线协作</p>
                  <p>• 所有操作都会实时同步到其他成员</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 分享对话框 */}
        <AnimatePresence>
          {showShareDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={closeShareDialog}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">分享协作房间</h3>
                  <button
                    onClick={closeShareDialog}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  复制下面的链接并发送给团队成员，他们可以通过此链接加入协作房间：
                </p>

                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                  />
                  <Button
                    onClick={copyShareLink}
                    size="sm"
                    className={linkCopied ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                  >
                    {linkCopied ? '已复制' : '复制'}
                  </Button>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={closeShareDialog}
                    variant="outline"
                    size="sm"
                  >
                    关闭
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


    </div>
  )
}