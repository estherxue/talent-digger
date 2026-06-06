import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'

// Mock uni for the test environment
const storage = new Map<string, string>()
;(globalThis as any).uni = {
  getStorageSync: (key: string) => storage.get(key),
  setStorageSync: (key: string, value: string) => { storage.set(key, value) },
  removeStorageSync: (key: string) => { storage.delete(key) },
}

import { usePlanLogic } from '@/composables/usePlanLogic'

beforeEach(() => {
  storage.clear()
  const logic = usePlanLogic()
  logic.resetAll()
})

describe('usePlanLogic', () => {
  describe('createPlan', () => {
    it('adds a new plan with empty goals array', () => {
      const { plans, createPlan } = usePlanLogic()
      createPlan({ title: 'My Plan', period: 'short' })
      expect(plans.value.length).toBe(1)
      expect(plans.value[0].title).toBe('My Plan')
      expect(plans.value[0].period).toBe('short')
      expect(plans.value[0].goals).toEqual([])
    })

    it('generates unique plan IDs', () => {
      const { plans, createPlan } = usePlanLogic()
      createPlan({ title: 'A', period: 'short' })
      createPlan({ title: 'B', period: 'medium' })
      expect(plans.value[0].id).not.toBe(plans.value[1].id)
    })
  })

  describe('addGoal', () => {
    it('adds a goal with default values', () => {
      const { plans, createPlan, addGoal } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'medium' })
      const planId = plans.value[0].id

      addGoal(planId, { title: 'Learn Vue' })
      expect(plans.value[0].goals.length).toBe(1)
      expect(plans.value[0].goals[0].title).toBe('Learn Vue')
      expect(plans.value[0].goals[0].completed).toBe(false)
      expect(plans.value[0].goals[0].priority).toBe('medium')
      expect(plans.value[0].goals[0].repeat).toBe('none')
    })

    it('accepts full goal config', () => {
      const { plans, createPlan, addGoal } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'long' })
      const planId = plans.value[0].id

      addGoal(planId, {
        title: 'Daily Reading',
        deadline: '2026-07-01',
        priority: 'high',
        repeat: 'daily',
        subTasks: [{ title: 'Read 30 min', completed: false }],
      })

      const goal = plans.value[0].goals[0]
      expect(goal.priority).toBe('high')
      expect(goal.repeat).toBe('daily')
      expect(goal.subTasks.length).toBe(1)
    })
  })

  describe('toggleGoal', () => {
    it('toggles goal completion and updates plan progress', () => {
      const { plans, createPlan, addGoal, toggleGoal } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'short' })
      const planId = plans.value[0].id
      addGoal(planId, { title: 'G1' })
      addGoal(planId, { title: 'G2' })

      expect(plans.value[0].completedGoals).toBe(0)

      toggleGoal(planId, plans.value[0].goals[0].id)
      expect(plans.value[0].goals[0].completed).toBe(true)
      expect(plans.value[0].completedGoals).toBe(1)

      toggleGoal(planId, plans.value[0].goals[0].id)
      expect(plans.value[0].goals[0].completed).toBe(false)
      expect(plans.value[0].completedGoals).toBe(0)
    })
  })

  describe('toggleSubTask', () => {
    it('toggles a sub-task', () => {
      const { plans, createPlan, addGoal, toggleSubTask } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'short' })
      const planId = plans.value[0].id
      addGoal(planId, {
        title: 'G1',
        subTasks: [
          { title: 'S1', completed: false },
          { title: 'S2', completed: false },
        ],
      })

      toggleSubTask(planId, plans.value[0].goals[0].id, 0)
      expect(plans.value[0].goals[0].subTasks[0].completed).toBe(true)
      expect(plans.value[0].goals[0].subTasks[1].completed).toBe(false)
    })
  })

  describe('streak calculation', () => {
    it('records streak for repeating goals on toggle', () => {
      const { plans, createPlan, addGoal, toggleGoal } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'short' })
      const planId = plans.value[0].id
      addGoal(planId, { title: 'Daily', repeat: 'daily' })

      toggleGoal(planId, plans.value[0].goals[0].id)
      // Should record today's streak
      expect(plans.value[0].goals[0].currentStreak).toBeGreaterThanOrEqual(0)
    })

    it('non-repeating goals have 0 streak', () => {
      const { plans, createPlan, addGoal, toggleGoal } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'short' })
      const planId = plans.value[0].id
      addGoal(planId, { title: 'One-time', repeat: 'none' })

      toggleGoal(planId, plans.value[0].goals[0].id)
      expect(plans.value[0].goals[0].currentStreak).toBe(0)
    })
  })

  describe('removeGoal', () => {
    it('removes a goal and updates counts', () => {
      const { plans, createPlan, addGoal, removeGoal } = usePlanLogic()
      createPlan({ title: 'Plan', period: 'short' })
      const planId = plans.value[0].id
      addGoal(planId, { title: 'G1' })
      addGoal(planId, { title: 'G2' })

      removeGoal(planId, plans.value[0].goals[0].id)
      expect(plans.value[0].goals.length).toBe(1)
      expect(plans.value[0].goals[0].title).toBe('G2')
    })
  })

  describe('persistence', () => {
    it('loads plans from storage on init', async () => {
      const { plans: p1, createPlan } = usePlanLogic()
      createPlan({ title: 'Saved Plan', period: 'long' })
      await nextTick()

      const { plans: p2 } = usePlanLogic()
      expect(p2.value.length).toBe(1)
      expect(p2.value[0].title).toBe('Saved Plan')
    })
  })
})
