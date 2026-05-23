// CloudBase API 基础封装
// 实际使用中替换为真实的云函数调用

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export async function callCloudFunction<T = any>(name: string, data?: Record<string, any>): Promise<ApiResponse<T>> {
  try {
    // uni-app 云函数调用将在配置 CloudBase 后启用
    // const res = await uniCloud.callFunction({ name, data })
    // return res.result as ApiResponse<T>
    
    // 开发阶段使用 mock
    console.log(`[API] Call cloud function: ${name}`, data)
    return {
      code: 0,
      message: 'success',
      data: {} as T
    }
  } catch (error) {
    console.error(`[API] Error calling ${name}:`, error)
    return {
      code: -1,
      message: String(error),
      data: {} as T
    }
  }
}

// 获取测评列表
export async function getTestList() {
  return callCloudFunction('getTestList')
}

// 获取题目
export async function getTestQuestions(testId: string) {
  return callCloudFunction('getTestQuestions', { testId })
}

// 提交测评结果
export async function submitTestResult(testId: string, scores: Record<string, number>) {
  return callCloudFunction('submitTestResult', { testId, scores })
}

// 生成报告
export async function generateReport(testId: string) {
  return callCloudFunction('generateReport', { testId })
}
