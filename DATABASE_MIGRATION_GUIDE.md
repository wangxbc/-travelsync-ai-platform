# 🔄 数据库迁移指南

## 📋 迁移概述

本指南将帮助你从简单认证系统迁移回数据库认证系统，同时保持系统的稳定性和可靠性。

## 🎯 迁移目标

- ✅ 恢复使用数据库存储用户数据
- ✅ 保持简单认证系统作为回退机制
- ✅ 解决 Vercel 部署时的数据库连接问题
- ✅ 确保数据持久化和安全性

## 🔧 迁移步骤

### 1. 准备数据库

#### 1.1 选择数据库服务

推荐使用以下数据库服务：

**Supabase (推荐)**

```bash
# 1. 注册 https://supabase.com
# 2. 创建新项目
# 3. 获取连接字符串
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

**Neon**

```bash
# 1. 注册 https://neon.tech
# 2. 创建新项目
# 3. 获取连接字符串
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"
```

#### 1.2 配置环境变量

创建 `.env.local` 文件：

```bash
# 数据库连接
DATABASE_URL="your-database-url"
DIRECT_URL="your-direct-database-url"

# NextAuth配置
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# 其他配置
OPENAI_API_KEY="your-openai-key"
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your-mapbox-token"
```

### 2. 初始化数据库

#### 2.1 生成 Prisma 客户端

```bash
npm run db:generate
```

#### 2.2 推送数据库结构

```bash
npm run db:push
```

#### 2.3 运行种子数据

```bash
npm run db:seed
```

#### 2.4 测试数据库连接

```bash
npm run test:db
```

### 3. 验证迁移

#### 3.1 测试登录功能

1. 启动开发服务器：

```bash
npm run dev
```

2. 访问登录页面：

```
http://localhost:3000/auth/signin
```

3. 使用默认账户登录：

```
邮箱: test@example.com
密码: 123456
```

#### 3.2 测试注册功能

1. 访问注册页面：

```
http://localhost:3000/auth/signup
```

2. 创建新用户账户

3. 验证用户是否保存到数据库

### 4. Vercel 部署配置

#### 4.1 设置环境变量

在 Vercel 项目设置中添加：

```bash
# 主要数据库连接（带连接池）
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true&connection_limit=1&pool_timeout=20"

# 直接连接（用于迁移）
DIRECT_URL="postgresql://user:password@host:port/database"

# NextAuth配置
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.vercel.app"

# 其他配置
OPENAI_API_KEY="your-openai-key"
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your-mapbox-token"
```

#### 4.2 配置构建命令

在 Vercel 项目设置中：

- **构建命令**: `npm run vercel-build`
- **输出目录**: `.next`

#### 4.3 部署验证

部署完成后，访问：

```bash
# 健康检查
https://your-domain.vercel.app/api/health

# 登录页面
https://your-domain.vercel.app/auth/signin
```

## 🔄 回退机制

### 自动回退

系统已配置自动回退机制：

1. **数据库连接失败时**：自动使用简单认证系统
2. **用户不存在时**：在简单认证系统中查找
3. **注册失败时**：回退到简单认证系统

### 手动切换

如果需要手动切换认证系统：

```typescript
// 在 auth.ts 中修改
const useDatabase = process.env.USE_DATABASE === 'true' // 添加环境变量控制
```

## 📊 数据迁移

### 从简单认证迁移到数据库

如果你有简单认证系统中的用户数据，可以迁移到数据库：

```typescript
// 迁移脚本示例
import { simpleAuthManager } from '@/lib/simple-auth'
import { userOperations } from '@/lib/api/database'

async function migrateUsers() {
  const simpleUsers = simpleAuthManager.debugGetAllUsers()

  for (const user of simpleUsers) {
    try {
      await userOperations.create({
        email: user.email,
        name: user.name,
        preferences: {
          password: user.password,
          theme: 'light',
          language: 'zh-CN',
        },
      })
      console.log(`✅ 用户迁移成功: ${user.email}`)
    } catch (error) {
      console.log(`❌ 用户迁移失败: ${user.email}`, error)
    }
  }
}
```

### 从数据库迁移到简单认证

如果需要回退到简单认证系统：

```typescript
// 导出数据库用户到简单认证系统
import { userOperations } from '@/lib/api/database'
import { simpleAuthManager } from '@/lib/simple-auth'

async function exportToSimpleAuth() {
  const dbUsers = await userOperations.getAllUsers()

  for (const user of dbUsers) {
    try {
      await simpleAuthManager.createUser({
        email: user.email,
        name: user.name,
        password: '123456', // 默认密码
      })
      console.log(`✅ 用户导出成功: ${user.email}`)
    } catch (error) {
      console.log(`❌ 用户导出失败: ${user.email}`, error)
    }
  }
}
```

## 🛠️ 故障排除

### 常见问题

#### 1. 数据库连接失败

**错误**: `P1001: Can't reach database server`

**解决方案**:

```bash
# 检查环境变量
echo $DATABASE_URL

# 测试连接
npm run test:db

# 检查数据库服务状态
# 确认防火墙设置
```

#### 2. 认证失败

**错误**: `P1002: Authentication failed`

**解决方案**:

```bash
# 检查用户名和密码
# 确认数据库权限
# 检查SSL设置
```

#### 3. 表不存在

**错误**: `P1003: Database does not exist`

**解决方案**:

```bash
# 推送数据库结构
npm run db:push

# 运行迁移
npm run db:migrate
```

#### 4. 连接超时

**错误**: `P1008: Connection timeout`

**解决方案**:

```bash
# 增加超时时间
# 使用连接池
# 检查网络连接
```

### 调试工具

#### 1. 数据库连接测试

```bash
npm run test:db
```

#### 2. 健康检查 API

```bash
curl http://localhost:3000/api/health
```

#### 3. Prisma Studio

```bash
npm run db:studio
```

## 📈 性能优化

### 1. 连接池配置

```typescript
// lib/prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
})
```

### 2. 查询优化

```typescript
// 使用select减少数据传输
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
})

// 使用include预加载关联数据
const itinerary = await prisma.itinerary.findUnique({
  where: { id: itineraryId },
  include: {
    user: true,
    activities: true,
  },
})
```

### 3. 缓存策略

```typescript
// 使用Redis缓存（可选）
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

async function getCachedUser(userId: string) {
  const cached = await redis.get(`user:${userId}`)
  if (cached) return JSON.parse(cached)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user))
  return user
}
```

## 🔒 安全考虑

### 1. 密码加密

```typescript
import bcrypt from 'bcryptjs'

// 创建用户时加密密码
const hashedPassword = await bcrypt.hash(password, 10)

// 验证密码时
const isValid = await bcrypt.compare(password, hashedPassword)
```

### 2. 环境变量安全

```bash
# 使用强密码
# 定期轮换密钥
# 限制数据库访问IP
```

### 3. 数据备份

```bash
# 定期备份数据库
# 测试恢复流程
# 监控数据完整性
```

## 📞 技术支持

如果遇到问题：

1. **查看日志**: 检查控制台和 Vercel 日志
2. **运行测试**: 使用 `npm run test:db`
3. **检查文档**: 参考 Prisma 和 Vercel 文档
4. **联系支持**: 数据库服务商技术支持

## 🎉 迁移完成

迁移完成后，你将拥有：

- ✅ 完整的数据库认证系统
- ✅ 数据持久化存储
- ✅ 自动回退机制
- ✅ 高性能和安全性
- ✅ 完整的用户管理功能

---

_最后更新时间: 2025 年 1 月_
