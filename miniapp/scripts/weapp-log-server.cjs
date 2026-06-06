/**
 * 微信小程序开发日志服务
 *
 * 接收来自小程序开发环境的运行时错误上报（通过 HTTP POST），
 * 将日志追加写入 logs/wechat-devtools.log，供 Cursor 等工具读取分析。
 *
 * 使用方式：
 *   node scripts/weapp-log-server.cjs
 *   或
 *   pnpm log:server
 *
 * 小程序端配置：见 src/utils/devLogger.ts
 */

const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 8787
const HOST = '127.0.0.1'
const logFile = path.resolve(__dirname, '..', 'logs', 'wechat-devtools.log')

// 确保日志目录存在
fs.mkdirSync(path.dirname(logFile), { recursive: true })

const server = http.createServer((req, res) => {
  // CORS 头，允许小程序 HTTP 请求跨域
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  if (req.method !== 'POST' || req.url !== '/log') {
    res.statusCode = 404
    return res.end('Not Found')
  }

  let body = ''
  req.on('data', (chunk) => (body += chunk))
  req.on('end', () => {
    try {
      const data = JSON.parse(body)
      const logEntry = `[${data.time}] [${data.type}] ${data.payload}\n`
      fs.appendFileSync(logFile, logEntry)

      // 控制台简要回显，方便在 Cursor 终端直接看到
      const preview =
        typeof data.payload === 'string'
          ? data.payload.substring(0, 100).replace(/\n/g, '\\n')
          : String(data.payload)
      console.log(`📝 [${data.type}] ${preview}`)
    } catch (e) {
      console.error('⚠️  收到格式错误的日志数据:', e.message)
    }
    res.statusCode = 200
    res.end('ok')
  })
})

server.listen(PORT, HOST, () => {
  console.log(`\n🔍 微信小程序开发日志服务已启动`)
  console.log(`   地址: http://${HOST}:${PORT}`)
  console.log(`   日志: ${logFile}\n`)
  console.log(`   在 Cursor 中可直接读取日志文件定位问题。`)
  console.log(`   按 Ctrl+C 停止服务。\n`)
})
