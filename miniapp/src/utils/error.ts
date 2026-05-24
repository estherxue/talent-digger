// 统一错误处理与提示工具

export interface ApiError {
  code: number
  message: string
}

// 错误码映射
const ERROR_MAP: Record<number, string> = {
  0: '',
  -1: '服务器错误，请稍后重试',
  -2: '网络连接失败，请检查网络',
  -3: '登录已过期，请重新登录',
  -4: '权限不足',
  -5: '请求过于频繁，请稍后再试'
}

/**
 * 获取错误提示文案
 */
export function getErrorMessage(code: number, fallback?: string): string {
  return ERROR_MAP[code] || fallback || '未知错误'
}

/**
 * 显示 Toast 错误提示（uni-app 环境）
 */
export function showErrorToast(message: string, duration = 2000) {
  uni.showToast({
    title: message,
    icon: 'none',
    duration
  })
}

/**
 * 处理 API 错误
 */
export function handleApiError(err: ApiError, context?: string) {
  const message = getErrorMessage(err.code, err.message)
  const prefix = context ? `[${context}] ` : ''
  console.error(`${prefix}API Error:`, err)
  showErrorToast(message)
}

/**
 * 通用 try-catch 包装，返回标准结果
 */
export async function safeCall<T>(
  fn: () => Promise<T>,
  errorContext?: string
): Promise<{ success: true; data: T } | { success: false; message: string }> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (err: any) {
    const message = err?.message || '操作失败'
    console.error(`[${errorContext || 'safeCall'}]`, err)
    showErrorToast(message)
    return { success: false, message }
  }
}

export default {
  getErrorMessage,
  showErrorToast,
  handleApiError,
  safeCall
}
