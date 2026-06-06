/**
 * 开发环境错误日志桥接器
 *
 * 在微信开发者工具中运行时，将小程序运行时错误（onError / onUnhandledRejection）
 * 通过 HTTP POST 发送到本地的日志服务（scripts/weapp-log-server.js），
 * 日志服务将其写入 logs/wechat-devtools.log，Cursor 可直接读取该文件定位问题。
 *
 * 仅在开发环境（envVersion === 'develop'）启用，不影响生产环境。
 */

const LOG_SERVER_URL = 'http://127.0.0.1:8787/log'

/** 判断是否在微信开发者工具中运行 */
function isDev(): boolean {
  try {
    // __wxConfig 仅在微信小程序运行时存在
    // envVersion: 'develop' | 'trial' | 'release'
    const envVersion = (globalThis as any).__wxConfig?.envVersion
    return envVersion === 'develop'
  } catch {
    return false
  }
}

/** 将错误信息发送到本地日志服务 */
export function reportError(type: string, payload: any) {
  if (!isDev()) return

  const message =
    payload?.stack ||
    payload?.message ||
    (typeof payload === 'string' ? payload : JSON.stringify(payload))

  wx.request({
    url: LOG_SERVER_URL,
    method: 'POST',
    data: {
      type,
      time: new Date().toISOString(),
      payload: String(message).substring(0, 2000),
    },
    fail() {
      // 日志服务未启动时静默失败，不影响正常开发流程
    },
  })
}

export default { reportError }
