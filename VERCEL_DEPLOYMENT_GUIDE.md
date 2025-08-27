# 🚀 Vercel 部署指南 - 数据库连接解决方案

## 📋 问题概述

在 Vercel 部署时遇到数据库连接问题是很常见的，主要原因是：

1. **连接限制**: Vercel 的无服务器函数有连接数限制
2. **冷启动**: 每次请求都可能创建新的数据库连接
3. **超时设置**: 数据库连接超时设置不当
4. **IP 白名单**: 数据库可能不允许 Vercel 的 IP 连接

## 🔧 解决方案

### 1. 使用连接池服务

推荐使用 **Supabase** 或 **Neon** 作为数据库服务：

#### Supabase (推荐)

```bash
# 1. 注册Supabase账户
# 2. 创建新项目
# 3. 获取连接字符串
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

#### Neon

```bash
# 1. 注册Neon账户
# 2. 创建新项目
# 3. 获取连接字符串
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require"
```

### 2. 配置 Prisma 连接池

更新 `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // 用于直接连接（迁移等）
}
```

### 3. 环境变量配置

在 Vercel 中设置以下环境变量：

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

### 4. 更新 Prisma 配置

创建 `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 创建默认用户
  const users = [
    {
      email: 'admin@example.com',
      name: '管理员',
      preferences: {
        password: '123456',
        theme: 'light',
        language: 'zh-CN',
      },
    },
    {
      email: 'test@example.com',
      name: '测试用户',
      preferences: {
        password: '123456',
        theme: 'light',
        language: 'zh-CN',
      },
    },
  ]

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    })
  }

  console.log('✅ 数据库种子数据创建完成')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 5. 部署脚本配置

更新 `package.json`:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma db push && npm run build",
    "postinstall": "prisma generate"
  }
}
```

## 🛠️ 部署步骤

### 1. 准备数据库

```bash
# 本地测试数据库连接
npm run test:db

# 生成Prisma客户端
npm run db:generate

# 推送数据库结构
npm run db:push

# 运行种子数据
npm run db:seed
```

### 2. Vercel 部署

1. **连接 GitHub 仓库**

   - 在 Vercel 中导入你的 GitHub 仓库
   - 选择 Next.js 框架

2. **配置环境变量**

   - 在 Vercel 项目设置中添加所有必需的环境变量
   - 确保 `DATABASE_URL` 和 `DIRECT_URL` 都正确设置

3. **配置构建命令**

   - 构建命令: `npm run vercel-build`
   - 输出目录: `.next`

4. **部署**
   - 点击部署按钮
   - 等待构建完成

### 3. 验证部署

部署完成后，访问以下 URL 验证：

```bash
# 健康检查
https://your-domain.vercel.app/api/health

# 登录页面
https://your-domain.vercel.app/auth/signin

# 注册页面
https://your-domain.vercel.app/auth/signup
```

## 🔍 故障排除

### 常见错误及解决方案

#### 1. P1001: 无法连接到数据库服务器

```bash
# 解决方案:
# 1. 检查DATABASE_URL是否正确
# 2. 检查数据库服务是否运行
# 3. 检查防火墙设置
```

#### 2. P1002: 认证失败

```bash
# 解决方案:
# 1. 检查用户名和密码
# 2. 检查数据库权限
# 3. 确认SSL设置
```

#### 3. P1008: 连接超时

```bash
# 解决方案:
# 1. 增加连接超时时间
# 2. 使用连接池服务
# 3. 检查网络连接
```

#### 4. P1017: 连接数过多

```bash
# 解决方案:
# 1. 使用连接池
# 2. 减少连接限制
# 3. 优化连接管理
```

### 调试工具

#### 1. 数据库连接测试

```bash
# 运行测试脚本
node scripts/test-database.js
```

#### 2. 健康检查 API

```bash
# 访问健康检查
curl https://your-domain.vercel.app/api/health
```

#### 3. Vercel 日志

```bash
# 查看部署日志
vercel logs your-project-name
```

## 📊 性能优化

### 1. 连接池配置

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 2. 查询优化

```typescript
// 使用select减少数据传输
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    avatar: true,
  },
})

// 使用include预加载关联数据
const itinerary = await prisma.itinerary.findUnique({
  where: { id: itineraryId },
  include: {
    user: true,
    activities: {
      include: {
        location: true,
      },
    },
  },
})
```

## 🎯 最佳实践

### 1. 环境变量管理

- 使用 `.env.local` 进行本地开发
- 在 Vercel 中设置生产环境变量
- 不要将敏感信息提交到 Git

### 2. 数据库迁移

- 使用 `prisma migrate` 管理数据库结构变更
- 在部署前测试迁移脚本
- 备份生产数据

### 3. 监控和日志

- 启用 Prisma 查询日志
- 监控数据库连接数
- 设置错误告警

### 4. 安全配置

- 使用 SSL 连接
- 设置强密码
- 限制数据库访问 IP

## 📞 技术支持

如果仍然遇到问题：

1. **检查 Vercel 文档**: https://vercel.com/docs
2. **查看 Prisma 文档**: https://www.prisma.io/docs
3. **联系数据库服务商**: Supabase/Neon 支持
4. **查看项目日志**: 使用 Vercel 日志功能

---

_最后更新时间: 2025 年 1 月_
