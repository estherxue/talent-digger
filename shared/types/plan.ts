export type GoalPeriod = 'short' | 'medium' | 'long'

export type GoalStatus = 'pending' | 'in_progress' | 'completed'

export interface Goal {
  id: string
  title: string
  description: string
  period: GoalPeriod
  status: GoalStatus
  tasks: Task[]
  createdAt: number
  targetDate: number
}

export interface Task {
  id: string
  goalId: string
  title: string
  description: string
  completed: boolean
  dailyTime: number    // 每日花费时间（分钟）
  resource: string     // 学习资源链接
  notes: string        // 笔记/心得
  dueDate: number
  completedAt?: number
}

export interface GrowthPlan {
  id: string
  userId: string
  title: string
  goals: Goal[]
  createdAt: number
  updatedAt: number
}

export interface GrowthSummary {
  totalGoals: number
  completedGoals: number
  totalTasks: number
  completedTasks: number
  streak: number       // 连续完成天数
}
