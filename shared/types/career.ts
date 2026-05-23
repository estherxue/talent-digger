// 职业库条目
export interface CareerEntry {
  id: string
  name: string
  category: string
  description: string
  dimensionTags: string[]       // 关联的维度 keys
  requiredSkills: string[]
  educationLevel: string
  salaryRange: string
  suggestions: string
}

// 三叶草分析数据
export interface CloverAnalysis {
  interests: string[]          // 兴趣
  abilities: string[]          // 能力
  values: string[]             // 价值观
  intersection: string         // 三叶草交集描述
}

// 高光时刻
export interface HighlightMoment {
  title: string
  description: string
  skills: string[]
  impact: 'high' | 'medium' | 'low'
}

// 职业规划工具 - 用户输入
export interface CareerToolInput {
  clover: CloverAnalysis
  highlights: HighlightMoment[]
  feedback: string[]           // 外界正向反馈
  idealState: string           // 理想状态描述
  circleAnalysis: {
    passion: string[]          // 热爱的事
    talent: string[]           // 擅长的事
    demand: string[]           // 社会需要
  }
}

// 职业规划报告
export interface CareerPlanReport {
  userId: string
  toolInput: CareerToolInput
  generatedSuggestions: string[]
  positioningMap: string       // 个人定位描述
  createdAt: number
}
