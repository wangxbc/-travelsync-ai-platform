#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 开始部署后脚本...');

try {
  // 生成Prisma客户端
  console.log('🔧 生成Prisma客户端...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // 推送数据库结构（适用于SQLite）
  console.log('📊 推送数据库结构...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  
  // 创建默认用户
  console.log('👥 创建默认用户...');
  try {
    execSync('node scripts/create-default-users.js', { stdio: 'inherit' });
  } catch (userError) {
    console.log('⚠️ 创建默认用户失败，但继续部署');
  }
  
  console.log('✅ 部署后脚本执行完成！');
} catch (error) {
  console.error('❌ 部署后脚本执行失败:', error.message);
  console.log('⚠️ 继续部署，但数据库可能需要手动配置');
  // 不要退出进程，让部署继续
}