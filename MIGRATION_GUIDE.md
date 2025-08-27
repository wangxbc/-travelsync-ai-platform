# 🔄 认证系统迁移指南

## 📋 迁移概述

由于 Vercel 部署时的数据库连接问题，我们将认证系统从数据库驱动迁移到了内存中的简单认证系统。这个迁移确保了：

- ✅ 无需数据库连接
- ✅ 在 Vercel 上正常工作
- ✅ 保持所有原有功能
- ✅ 支持手机端登录注册

## 🔧 主要变更

### 1. 认证系统变更

- **原来**: 使用 Prisma + PostgreSQL 数据库
- **现在**: 使用内存中的简单认证系统 (`simple-auth.ts`)

### 2. 行程系统变更

- **原来**: 使用数据库存储行程数据
- **现在**: 使用内存中的简单行程系统 (`simple-itinerary.ts`)

### 3. 数据持久化

- **原来**: 数据存储在数据库中
- **现在**: 数据存储在内存中（重启后会重置为默认数据）

## 🚀 如何使用

### 登录系统

现在你可以使用以下默认账户登录：

| 邮箱                | 密码     | 用户名   | 说明           |
| ------------------- | -------- | -------- | -------------- |
| `admin@example.com` | `123456` | 管理员   | 系统管理员账户 |
| `test@example.com`  | `123456` | 测试用户 | 测试账户       |
| `demo@example.com`  | `123456` | 演示用户 | 演示账户       |
| `user@example.com`  | `123456` | 普通用户 | 普通用户账户   |

### 注册新用户

1. 访问 `/auth/signup` 页面
2. 填写用户信息
3. 注册成功后自动跳转到登录页面
4. 使用新账户登录

### 用户资料管理

- 支持更新头像、个人信息
- 支持设置偏好
- 所有数据存储在内存中

## 📁 文件结构

```
src/lib/
├── simple-auth.ts          # 简单认证系统
├── simple-itinerary.ts     # 简单行程系统
├── auth.ts                 # NextAuth配置（使用简单认证）
├── api/
│   └── simple-database.ts  # 简单数据库操作接口
└── hooks/
    └── useAuth.ts          # 认证Hook（无需修改）
```

## 🔄 迁移步骤

### 1. 更新导入

如果你的代码中有以下导入，需要更新：

```typescript
// 原来
import { userOperations } from '@/lib/api/database'

// 现在
import { userOperations } from '@/lib/api/simple-database'
```

### 2. 认证相关 API

所有认证相关的 API 都保持不变：

```typescript
// 登录
const result = await signIn('credentials', {
  email: 'test@example.com',
  password: '123456',
  redirect: false,
})

// 获取用户信息
const { data: session } = useSession()

// 登出
await signOut()
```

### 3. 用户操作

用户操作接口保持不变：

```typescript
import { userOperations } from '@/lib/api/simple-database'

// 查找用户
const user = await userOperations.findByEmail(email)

// 更新用户
const updatedUser = await userOperations.update(userId, updateData)

// 更新头像
await userOperations.updateAvatar(userId, avatarUrl)
```

### 4. 行程操作

行程操作接口保持不变：

```typescript
import { itineraryOperations } from '@/lib/api/simple-database'

// 获取用户行程
const itineraries = await itineraryOperations.findByUserId(userId)

// 创建行程
const newItinerary = await itineraryOperations.create(itineraryData)

// 删除行程
await itineraryOperations.delete(itineraryId)
```

## 🛠️ 开发调试

### 查看当前用户

```typescript
import { simpleAuthManager } from '@/lib/simple-auth'

// 获取所有用户
const users = await simpleAuthManager.getAllUsers()
console.log('当前用户:', users)

// 调试获取所有用户（包含密码）
const allUsers = simpleAuthManager.debugGetAllUsers()
console.log('调试用户数据:', allUsers)
```

### 重置系统

```typescript
import { simpleAuthManager } from '@/lib/simple-auth'

// 清空所有用户
simpleAuthManager.clearUsers()

// 重置为默认用户
simpleAuthManager.resetToDefaults()
```

## 📱 手机端支持

### 登录页面

- 访问: `https://your-domain.vercel.app/auth/signin`
- 支持邮箱密码登录
- 支持 Google OAuth 登录（如果配置了）

### 注册页面

- 访问: `https://your-domain.vercel.app/auth/signup`
- 填写用户信息
- 注册成功后自动跳转

### 响应式设计

- 所有页面都支持移动端
- 触摸友好的界面
- 适配各种屏幕尺寸

## 🔒 安全性说明

### 密码存储

- 简单认证系统中密码以明文存储（仅用于开发/演示）
- 生产环境建议使用加密存储

### 会话管理

- 使用 NextAuth.js 的 JWT 策略
- 会话有效期 30 天
- 支持自动刷新

### 数据持久化

- 当前数据存储在内存中
- 服务器重启后数据会重置
- 如需持久化，可以考虑：
  - 使用 localStorage（客户端）
  - 使用文件系统存储
  - 使用外部存储服务

## 🚨 注意事项

1. **数据持久化**: 当前系统数据不会持久保存，重启后会重置
2. **用户限制**: 内存存储限制了用户数量，建议不超过 1000 个用户
3. **性能**: 对于大量用户，建议使用数据库存储
4. **生产环境**: 当前配置适合开发/演示，生产环境建议使用数据库

## 🔮 未来改进

1. **数据持久化**: 添加 localStorage 或文件系统存储
2. **用户限制**: 增加用户数量限制和清理机制
3. **性能优化**: 添加缓存和索引机制
4. **安全性**: 添加密码加密和验证机制

## 📞 技术支持

如果遇到问题，可以：

1. 检查浏览器控制台错误信息
2. 查看服务器日志
3. 使用调试工具查看用户数据
4. 重置系统到默认状态

---

_最后更新时间: 2025 年 1 月_
