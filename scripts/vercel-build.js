#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Starting Vercel build process...')

// 检查环境变量
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.log(
    '⚠️  DATABASE_URL not found, setting up mock database for build...'
  )

  // 创建临时的环境变量文件
  const envContent = `DATABASE_URL="postgresql://mock:mock@localhost:5432/mock"
NEXTAUTH_SECRET="mock-secret-for-build"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="mock-openai-key"
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="mock-mapbox-token"
GOOGLE_CLIENT_ID="mock-google-client-id"
GOOGLE_CLIENT_SECRET="mock-google-client-secret"
`

  fs.writeFileSync('.env.build', envContent)
  console.log('✅ Created temporary .env.build file')
}

try {
  // 生成Prisma客户端
  console.log('📦 Generating Prisma client...')
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl || 'postgresql://mock:mock@localhost:5432/mock',
    },
  })
  console.log('✅ Prisma client generated successfully')

  // 构建Next.js应用
  console.log('🏗️  Building Next.js application...')
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build completed successfully')

  // 清理临时文件
  if (fs.existsSync('.env.build')) {
    fs.unlinkSync('.env.build')
    console.log('🧹 Cleaned up temporary files')
  }

  console.log('🎉 Vercel build process completed successfully!')
} catch (error) {
  console.error('❌ Build failed:', error.message)

  // 清理临时文件
  if (fs.existsSync('.env.build')) {
    fs.unlinkSync('.env.build')
  }

  process.exit(1)
}



