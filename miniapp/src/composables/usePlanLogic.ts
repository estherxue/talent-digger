import { ref, watch } from 'vue'

const STORAGE_KEY = 'growthPlans'

export interface SubTask {
  title: string
  completed: boolean
}

export interface Goal {
  id: string
  title: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  repeat: 'none' | 'daily' | 'weekly'
  subTasks: SubTask[]
  completed: boolean
  streakLog: Record<string, boolean>
  currentStreak: number
  createdAt: number
}

export interface Plan {
  id: string
  title: string
  period: 'short' | 'medium' | 'long'
  goals: Goal[]
  completedGoals: number
  totalGoals: number
}

function generateId(): string {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function generateGoalId(): string {
  return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function computeStreak(streakLog: Record<string, boolean>): number {
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 90; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (streakLog[key]) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function recalcPlan(plan: Plan) {
  plan.completedGoals = plan.goals.filter(g => g.completed).length
  plan.totalGoals = plan.goals.length
}

function loadPlans(): Plan[] {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function savePlans(plans: Plan[]) {
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(plans))
}

export function usePlanLogic() {
  const plans = ref<Plan[]>(loadPlans())

  watch(plans, (val) => savePlans(val), { deep: true })

  function resetAll() {
    plans.value = []
    savePlans([])
  }

  function createPlan(params: { title: string; period: Plan['period'] }) {
    plans.value.push({
      id: generateId(),
      title: params.title,
      period: params.period,
      goals: [],
      completedGoals: 0,
      totalGoals: 0,
    })
  }

  function findPlan(planId: string): Plan | undefined {
    return plans.value.find(p => p.id === planId)
  }

  function addGoal(planId: string, params: Partial<Goal> & { title: string }) {
    const plan = findPlan(planId)
    if (!plan) return

    plan.goals.push({
      id: generateGoalId(),
      title: params.title,
      deadline: params.deadline || '',
      priority: params.priority || 'medium',
      repeat: params.repeat || 'none',
      subTasks: params.subTasks || [],
      completed: false,
      streakLog: {},
      currentStreak: 0,
      createdAt: Date.now(),
    })
    recalcPlan(plan)
  }

  function removeGoal(planId: string, goalId: string) {
    const plan = findPlan(planId)
    if (!plan) return
    plan.goals = plan.goals.filter(g => g.id !== goalId)
    recalcPlan(plan)
  }

  function toggleGoal(planId: string, goalId: string) {
    const plan = findPlan(planId)
    if (!plan) return
    const goal = plan.goals.find(g => g.id === goalId)
    if (!goal) return

    goal.completed = !goal.completed

    if (goal.repeat !== 'none' && goal.completed) {
      goal.streakLog[todayKey()] = true
      goal.currentStreak = computeStreak(goal.streakLog)
    }
    if (!goal.completed && goal.repeat !== 'none') {
      delete goal.streakLog[todayKey()]
      goal.currentStreak = computeStreak(goal.streakLog)
    }

    recalcPlan(plan)
  }

  function toggleSubTask(planId: string, goalId: string, subIdx: number) {
    const plan = findPlan(planId)
    if (!plan) return
    const goal = plan.goals.find(g => g.id === goalId)
    if (!goal || subIdx < 0 || subIdx >= goal.subTasks.length) return

    goal.subTasks[subIdx].completed = !goal.subTasks[subIdx].completed
  }

  function getPlanStreak(plan: Plan): number {
    let max = 0
    for (const g of plan.goals) {
      if (g.currentStreak > max) max = g.currentStreak
    }
    return max
  }

  return {
    plans,
    createPlan,
    addGoal,
    removeGoal,
    toggleGoal,
    toggleSubTask,
    getPlanStreak,
    resetAll,
  }
}
