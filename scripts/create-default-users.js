#!/usr/bin/env node

// 创建默认用户的脚本
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDefaultUsers() {
  try {
    console.log('🚀 开始创建默认用户...');

    // 检查是否已有用户
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
      console.log('📝 数据库中已有用户，跳过创建默认用户');
      return;
    }

    // 创建默认用户
    const defaultUsers = [
      {
        email: 'admin@example.com',
        name: '管理员',
        password: await bcrypt.hash('123456', 10),
      },
      {
        email: 'test@example.com',
        name: '测试用户',
        password: await bcrypt.hash('123456', 10),
      },
    ];

    for (const userData of defaultUsers) {
      await prisma.user.create({
        data: userData,
      });
      console.log(`✅ 创建用户: ${userData.email}`);
    }

    console.log('🎉 默认用户创建完成！');
    console.log('');
    console.log('📝 默认用户账户:');
    console.log('  📧 admin@example.com / 🔑 123456');
    console.log('  📧 test@example.com / 🔑 123456');
    console.log('');

  } catch (error) {
    console.error('❌ 创建默认用户失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createDefaultUsers()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { createDefaultUsers };