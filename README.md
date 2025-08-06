# TravelSync - AI驱动的智能旅行规划平台

这是一个基于Next.js 14构建的现代化旅行规划应用，集成了AI智能规划、3D地图可视化、实时协作等功能。

## 🚀 技术栈

- **前端框架**: Next.js 14 (App Router) + TypeScript
- **UI组件**: Shadcn/ui + Tailwind CSS
- **动画**: Framer Motion + Lottie React
- **地图**: Mapbox GL JS
- **图表**: Recharts
- **AI集成**: OpenAI GPT-4 API + Vercel AI SDK
- **状态管理**: Zustand
- **数据库**: Prisma + PostgreSQL/SQLite
- **认证**: NextAuth.js
- **实时通信**: Socket.io
- **部署**: Vercel + Supabase

## 🎯 核心功能

- ✨ AI智能行程规划
- 🗺️ 3D交互式地图展示
- 📊 实时数据可视化仪表板
- 🤝 多人实时协作编辑
- 🎯 智能推荐系统
- 📱 完全响应式设计
- 🔒 安全的用户认证

## 🛠️ 开发环境设置

### 1. 克隆项目

```bash
git clone <repository-url>
cd travelsync-ai-platform
```

### 2. 安装依赖

```bash
npm install
```

### 3. 环境变量配置

复制 `.env.example` 为 `.env.local` 并填入相应的配置：

```bash
cp .env.example .env.local
```

需要配置的环境变量：
- `DATABASE_URL`: 数据库连接URL
- `NEXTAUTH_SECRET`: NextAuth.js密钥
- `OPENAI_API_KEY`: OpenAI API密钥 (可选，未配置时使用模拟数据)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox访问令牌 (必需，用于3D地图功能)

> 📋 **重要**: 要使用完整的3D地图功能，请参考 [MAPBOX_SETUP.md](./MAPBOX_SETUP.md) 配置Mapbox访问令牌

### 4. 数据库设置

```bash
# 生成Prisma客户端
npm run db:generate

# 推送数据库结构
npm run db:push

# 运行种子数据（可选）
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📝 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行ESLint检查
- `npm run lint:fix` - 自动修复ESLint问题
- `npm run type-check` - TypeScript类型检查
- `npm run db:generate` - 生成Prisma客户端
- `npm run db:push` - 推送数据库结构
- `npm run db:migrate` - 运行数据库迁移
- `npm run db:studio` - 打开Prisma Studio

## 📁 项目结构

```
src/
├── app/                 # Next.js App Router页面
├── components/          # React组件
│   ├── ui/             # UI基础组件
│   └── features/       # 功能组件
├── lib/                # 工具函数和配置
│   ├── api/           # API相关工具
│   └── hooks/         # 自定义Hook
├── store/              # Zustand状态管理
├── types/              # TypeScript类型定义
└── styles/             # 样式文件

prisma/                 # 数据库Schema和迁移
public/                 # 静态资源
```

## 🔧 开发指南

### 代码规范

- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier配置
- 组件使用函数式组件和Hooks
- 样式使用Tailwind CSS

### 提交规范

使用语义化提交信息：
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 🚀 部署

### Vercel部署

1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 自动部署

### 环境变量配置

生产环境需要配置以下环境变量：
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题，请通过以下方式联系：
- Email: your-email@example.com
- GitHub: your-github-username
