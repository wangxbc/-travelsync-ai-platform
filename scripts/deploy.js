#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 开始部署后脚本...');

try {
  // 检查是否有数据库URL
  if (!process.env.DATABASE_URL) {
    console.log('⚠️ 没有找到DATABASE_URL，跳过数据库操作');
    console.log('✅ 部署脚本执行完成（跳过数据库操作）');
    return;
  }

  // 生成Prisma客户端
  console.log('🔧 生成Prisma客户端...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 运行数据库迁移（仅在有数据库连接时）
  console.log('📊 运行数据库迁移...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('✅ 部署后脚本执行完成！');
} catch (error) {
  console.error('❌ 部署后脚本执行失败:', error.message);
  console.log('⚠️ 继续部署，但数据库可能需要手动配置');
  // 不要退出进程，让部署继续
}