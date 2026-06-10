// CloudBase API 基础封装
// 使用 wx.cloud.callFunction 调用云函数

import type { TestDefinition } from '@shared/types/test'
import { mockTalentQuestions, mockHollandQuestions } from '@/data/mock/test'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

const MOCK_TEST_LIST: TestDefinition[] = [
  {
    testId: 'test_talent_compass',
    name: '天赋罗盘测试',
    description: '基于10个核心天赋维度的综合测评',
    category: 'talent',
    questionCount: 26,
    estimatedMin: 15,
    status: 'published' as const,
    createdAt: 1700000000000,
    dimensions: [
      { key: 'logic', name: '逻辑推理', description: '运用理性思维分析问题' },
      { key: 'creativity', name: '创造想象', description: '产生新颖想法' },
      { key: 'memory', name: '记忆能力', description: '快速记住并准确回忆' },
      { key: 'observation', name: '观察感知', description: '敏锐察觉细节' },
      { key: 'comm', name: '沟通表达', description: '清晰传达想法' },
      { key: 'lead', name: '领导组织', description: '带领团队达成目标' },
      { key: 'exec', name: '执行实操', description: '高效完成任务' },
      { key: 'empathy', name: '同理共情', description: '理解他人感受' },
      { key: 'resilience', name: '抗压韧性', description: '压力下保持稳定' },
      { key: 'learn', name: '学习适应', description: '快速掌握新知识' }
    ]
  },
  {
    testId: 'test_holland',
    name: '霍兰德职业兴趣测试',
    description: '基于RIASEC模型的职业兴趣评估',
    category: 'interest',
    questionCount: 30,
    estimatedMin: 10,
    status: 'published' as const,
    createdAt: 1700000000000,
    dimensions: [
      { key: 'realistic', name: '实际型', description: '喜欢动手操作' },
      { key: 'investigative', name: '研究型', description: '喜欢观察分析' },
      { key: 'artistic', name: '艺术型', description: '喜欢创造表达' },
      { key: 'social', name: '社会型', description: '喜欢帮助他人' },
      { key: 'enterprise', name: '企业型', description: '喜欢领导说服' },
      { key: 'conventional', name: '常规型', description: '喜欢组织规划' }
    ]
  }
]

/**
 * 通用云函数调用封装（带 timeout 保护）
 */
async function callCloudFunction<T = any>(
  name: string,
  data?: Record<string, any>
): Promise<ApiResponse<T>> {
  const TIMEOUT_MS = 8000

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
    })

    const callPromise = wx.cloud.callFunction({ name, data })
    const res = await Promise.race([callPromise, timeoutPromise])
    return res.result as ApiResponse<T>
  } catch (error: any) {
    console.warn(`[API] 云函数 ${name} 调用失败，使用本地数据:`, error?.message || error)
    return { code: -1, message: error?.message || '请求失败', data: {} as T }
  }
}

// ============ 测评相关 API ============

export async function getTestList() {
  const res = await callCloudFunction<TestDefinition[]>('getTestList')
  if (res.code === 0 && res.data.length > 0) return res
  // 云函数失败时 fallback 到本地数据
  return { code: 0, message: 'ok', data: MOCK_TEST_LIST }
}

/** 获取测评题目 */
export async function getTestQuestions(testId: string) {
  const res = await callCloudFunction('getTestQuestions', { testId })
  if (res.code === 0 && res.data?.questions?.length > 0) {
    // 防御：检查返回的题目是否与请求的 testId 匹配
    const firstQ = res.data.questions[0]
    if (firstQ && firstQ.testId && firstQ.testId !== testId) {
      console.warn(`[getTestQuestions] 警告：云函数返回了错误的题目 (expected=${testId}, got=${firstQ.testId})，使用本地数据`)
    } else {
      return res
    }
  }
  // 云函数失败时 fallback 到本地 mock 数据
  const questions = testId === 'test_holland' ? mockHollandQuestions : mockTalentQuestions
  return { code: 0, message: 'ok', data: { questions: questions as any } }
}

/** 提交测评结果 */
export async function submitTestResult(testId: string, answers: Record<string, number>) {
  return callCloudFunction('submitTestResult', { testId, answers })
}

/** 生成测评报告 */
export async function generateReport(resultId: string) {
  return callCloudFunction('generateReport', { resultId })
}

// ============ 用户相关 API ============

export async function userLogin() {
  return callCloudFunction('userLogin')
}

export async function getUserProfile() {
  // 用户未登录时返回默认游客信息
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
