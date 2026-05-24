// CloudBase API 基础封装
// 使用 wx.cloud.callFunction 调用云函数

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 通用云函数调用封装
 * @param name 云函数名称
 * @param data 请求参数
 */
export async function callCloudFunction<T = any>(
  name: string,
  data?: Record<string, any>
): Promise<ApiResponse<T>> {
  try {
    const res = await wx.cloud.callFunction({ name, data })
    return res.result as ApiResponse<T>
  } catch (error: any) {
    console.error(`[API] Error calling ${name}:`, error)
    return {
      code: -1,
      message: error?.message || '网络请求失败',
      data: {} as T
    }
  }
}

// ============ 测评相关 API ============

/** 获取测评列表 */
export async function getTestList() {
  return callCloudFunction('getTestList')
}

/** 获取测评题目 */
export async function getTestQuestions(testId: string) {
  return callCloudFunction('getTestQuestions', { testId })
}

/** 提交测评结果 */
export async function submitTestResult(testId: string, scores: Record<string, number>) {
  return callCloudFunction('submitTestResult', { testId, scores })
}

/** 生成测评报告 */
export async function generateReport(testId: string) {
  return callCloudFunction('generateReport', { testId })
}

// ============ 用户相关 API ============

/** 用户登录 */
export async function userLogin() {
  return callCloudFunction('userLogin')
}

/** 获取用户信息 */
export async function getUserProfile() {
  return callCloudFunction('getUserProfile')
}

// ============ 职业规划 API ============

/** 保存职业规划数据 */
export async function saveCareerPlan(data: Record<string, any>) {
  return callCloudFunction('saveCareerPlan', { data })
}

// ============ 成长计划 API ============

/** 获取成长计划列表 */
export async function getGrowthPlans() {
  return callCloudFunction('getGrowthPlans')
}

/** 保存成长计划 */
export async function saveGrowthPlan(data: Record<string, any>) {
  return callCloudFunction('saveGrowthPlan', { data })
}

/** 更新目标状态 */
export async function updateGoalStatus(planId: string, goalId: string, completed: boolean) {
  return callCloudFunction('updateGoalStatus', { planId, goalId, completed })
}
