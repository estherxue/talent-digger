// 测评维度
export interface Dimension {
  key: string
  name: string
  description: string
}

// 题目选项
export interface QuestionOption {
  label: string   // 如 'A', 'B', 'C'
  text: string    // 选项文案
}

// 题目评分映射 (dimensionKey -> 分值)
export type ScoringMap = Record<string, number>

// 题目
export interface Question {
  id: string
  testId: string
  content: string
  options: QuestionOption[]
  scoring: ScoringMap
}

// 测评定义
export interface TestDefinition {
  id: string
  name: string
  description: string
  dimensions: Dimension[]
  questionCount: number
  estimatedMin: number
  category: 'talent' | 'interest' | 'personality'
}

// 单个维度的得分
export interface DimensionScore {
  key: string
  name: string
  score: number
  percentage: number  // 百分比值 0-100
  level: 'low' | 'medium' | 'high'
}

// 测评结果
export interface TestResult {
  id: string
  userId: string
  testId: string
  testName: string
  scores: DimensionScore[]
  completedAt: number
  reportGenerated: boolean
}

// 测评报告
export interface TestReport {
  resultId: string
  testId: string
  testName: string
  scores: DimensionScore[]
  summary: string
  suggestions: string[]
  careerMatches: CareerMatch[]
}

// 职业匹配
export interface CareerMatch {
  careerId: string
  careerName: string
  matchScore: number
  reason: string
}
