#!/usr/bin/env node

// 数据库初始化脚本
const { execSync } = require("child_process");
const path = require("path");

console.log("🚀 开始初始化数据库...");

try {
  // 1. 生成Prisma客户端
  console.log("📦 生成Prisma客户端...");
  execSync("npx prisma generate", { stdio: "inherit" });

  // 2. 运行数据库迁移
  console.log("🗄️ 运行数据库迁移...");
  execSync("npx prisma db push", { stdio: "inherit" });

  // 3. 创建默认用户
  console.log("👥 创建默认用户...");
  execSync(
    "node -e \"require('./src/lib/database-auth').databaseUserManager.createDefaultUsers().then(() => console.log('✅ 默认用户创建完成')).catch(console.error)\"",
    { stdio: "inherit" }
  );

  console.log("🎉 数据库初始化完成！");
  console.log("");
  console.log("📝 默认用户账户:");
  console.log("  📧 admin@example.com / 🔑 123456");
  console.log("  📧 test@example.com / 🔑 123456");
  console.log("");
  console.log("💡 现在可以启动项目并登录了！");
} catch (error) {
  console.error("❌ 数据库初始化失败:", error.message);
  process.exit(1);
}
