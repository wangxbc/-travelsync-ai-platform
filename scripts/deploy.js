#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 开始部署后脚本...');

try {
  // 运行数据库迁移
  console.log('📊 运行数据库迁移...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  // 生成Prisma客户端
  console.log('🔧 生成Prisma客户端...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ 部署后脚本执行完成！');
} catch (error) {
  console.error('❌ 部署后脚本执行失败:', error.message);
  process.exit(1);
}