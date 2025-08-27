import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始创建数据库种子数据...')

  // 创建默认用户
  const users = [
    {
      email: 'admin@example.com',
      name: '管理员',
      bio: '系统管理员',
      occupation: '管理员',
      preferences: {
        password: '123456',
        theme: 'light',
        language: 'zh-CN',
        notifications: true,
      },
    },
    {
      email: 'test@example.com',
      name: '测试用户',
      bio: '测试账户',
      occupation: '测试工程师',
      preferences: {
        password: '123456',
        theme: 'light',
        language: 'zh-CN',
        notifications: true,
      },
    },
    {
      email: 'demo@example.com',
      name: '演示用户',
      bio: '演示账户',
      occupation: '产品经理',
      preferences: {
        password: '123456',
        theme: 'light',
        language: 'zh-CN',
        notifications: true,
      },
    },
    {
      email: 'user@example.com',
      name: '普通用户',
      bio: '普通用户账户',
      occupation: '用户',
      preferences: {
        password: '123456',
        theme: 'light',
        language: 'zh-CN',
        notifications: true,
      },
    },
  ]

  console.log('👥 创建默认用户...')
  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    })
    console.log(`✅ 用户创建/更新: ${userData.email}`)
  }

  // 创建默认地点
  const locations = [
    {
      name: '天安门广场',
      address: '北京市东城区天安门广场',
      latitude: 39.9042,
      longitude: 116.4074,
      type: '景点',
      description: '中国的象征性地标',
      rating: 4.8,
    },
    {
      name: '故宫博物院',
      address: '北京市东城区景山前街4号',
      latitude: 39.9163,
      longitude: 116.3972,
      type: '景点',
      description: '明清两代的皇家宫殿',
      rating: 4.9,
    },
    {
      name: '外滩',
      address: '上海市黄浦区中山东一路',
      latitude: 31.2304,
      longitude: 121.4737,
      type: '景点',
      description: '上海的标志性景观',
      rating: 4.7,
    },
  ]

  console.log('📍 创建默认地点...')
  for (const locationData of locations) {
    await prisma.location.upsert({
      where: {
        name_address: {
          name: locationData.name,
          address: locationData.address || '',
        },
      },
      update: {},
      create: locationData,
    })
    console.log(`✅ 地点创建/更新: ${locationData.name}`)
  }

  // 创建示例行程
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  })

  if (adminUser) {
    console.log('🗺️ 创建示例行程...')
    await prisma.itinerary.upsert({
      where: { id: 'sample-itinerary-1' },
      update: {},
      create: {
        id: 'sample-itinerary-1',
        userId: adminUser.id,
        title: '北京三日游',
        destination: '北京',
        budget: 3000,
        days: 3,
        isPublic: true,
        data: {
          activities: [
            {
              day: 1,
              name: '天安门广场',
              description: '参观天安门广场',
              startTime: '09:00',
              endTime: '11:00',
              cost: 0,
            },
            {
              day: 1,
              name: '故宫博物院',
              description: '游览故宫',
              startTime: '14:00',
              endTime: '17:00',
              cost: 60,
            },
          ],
          notes: '这是一个示例行程，展示了北京的主要景点。',
          generatedAt: new Date().toISOString(),
        },
      },
    })
    console.log('✅ 示例行程创建完成')
  }

  console.log('🎉 数据库种子数据创建完成！')
  console.log('')
  console.log('📝 默认用户账户:')
  console.log('  📧 admin@example.com / 🔑 123456')
  console.log('  📧 test@example.com / 🔑 123456')
  console.log('  📧 demo@example.com / 🔑 123456')
  console.log('  📧 user@example.com / 🔑 123456')
  console.log('')
  console.log('💡 现在可以启动项目并登录了！')
}

main()
  .catch(e => {
    console.error('❌ 种子数据创建失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
