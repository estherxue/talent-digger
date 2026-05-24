#!/usr/bin/env node

/**
 * Talent Digger 数据库初始化脚本
 * 用法: node scripts/init-db.js --env <envId>
 *
 * 环境变量:
 *   TCB_ENV_ID - CloudBase 环境 ID
 *   TCB_SECRET_ID - 腾讯云 SecretId
 *   TCB_SECRET_KEY - 腾讯云 SecretKey
 */

const fs = require('fs')
const path = require('path')
const cloudbase = require('@cloudbase/node-sdk')

const DATABASE_DIR = path.resolve(__dirname, '../miniapp/database')

const COLLECTIONS = [
  'users',
  'tests',
  'questions',
  'results',
  'career_library',
  'career_plans',
  'growth_plans',
  'admin_users'
]

const SEED_FILES = [
  { file: 'seed_tests.json', collection: 'tests' },
  { file: 'seed_questions_talent.json', collection: 'questions', transform: (data) => data.questions },
  { file: 'seed_questions_holland.json', collection: 'questions', transform: (data) => data.questions },
  { file: 'seed_careers.json', collection: 'career_library' }
]

async function main() {
  const envId = process.env.TCB_ENV_ID || process.argv.find((a, i) => a === '--env' && process.argv[i + 1])

  if (!envId) {
    console.error('Error: 请通过 --env <envId> 或环境变量 TCB_ENV_ID 设置环境 ID')
    process.exit(1)
  }

  console.log(`使用环境: ${envId}`)

  const app = cloudbase.init({
    env: envId,
    secretId: process.env.TCB_SECRET_ID,
    secretKey: process.env.TCB_SECRET_KEY
  })

  const db = app.database()

  // 1. 创建集合
  console.log('\n--- 创建数据库集合 ---')
  for (const name of COLLECTIONS) {
    try {
      await db.createCollection(name)
      console.log(`  ✓ ${name}`)
    } catch (err) {
      if (err.code === 'RESOURCE_ALREADY_EXISTS' || err.message.includes('already exists')) {
        console.log(`  - ${name} (已存在)`)
      } else {
        console.log(`  ✗ ${name}: ${err.message}`)
      }
    }
  }

  // 2. 导入种子数据
  console.log('\n--- 导入种子数据 ---')
  for (const seed of SEED_FILES) {
    const filePath = path.join(DATABASE_DIR, seed.file)
    if (!fs.existsSync(filePath)) {
      console.log(`  ! ${seed.file} 文件不存在，跳过`)
      continue
    }

    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const data = seed.transform ? seed.transform(raw) : (Array.isArray(raw) ? raw : [raw])

    if (!Array.isArray(data)) {
      console.log(`  ! ${seed.file} 数据格式不是数组`)
      continue
    }

    const collection = db.collection(seed.collection)
    let inserted = 0

    for (const doc of data) {
      try {
        // 检查是否已存在
        const existing = await collection.where({ _id: doc._id || '__none__' }).count()
        if (doc._id && existing.total > 0) {
          await collection.doc(doc._id).set(doc)
        } else {
          await collection.add(doc)
        }
        inserted++
      } catch (err) {
        console.log(`    ✗ 插入 ${doc.name || doc.content?.slice(0, 20)}: ${err.message}`)
      }
    }

    console.log(`  ✓ ${seed.file} → ${seed.collection} (${inserted}/${data.length} 条)`)
  }

  console.log('\n--- 数据库初始化完成 ---')
}

main().catch(err => {
  console.error('Init failed:', err)
  process.exit(1)
})
