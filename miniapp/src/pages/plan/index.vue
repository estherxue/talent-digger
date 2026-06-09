<template>
  <view class="page-plan">
    <view class="page-header">
      <text class="page-title">成长计划</text>
      <view class="add-btn" @click="openCreatePlan">+ 新建计划</view>
    </view>

    <view class="plans-list" v-if="plans.length > 0">
      <view class="plan-card" v-for="plan in plans" :key="plan.id">
        <view class="plan-header">
          <text class="plan-name">{{ plan.title }}</text>
          <text class="plan-period" :class="plan.period">{{ periodLabel(plan.period) }}</text>
        </view>

        <view class="plan-progress" v-if="plan.totalGoals > 0">
          <text class="progress-text">
            <text v-if="getPlanStreak(plan) > 0" class="streak">🔥 连续打卡 {{ getPlanStreak(plan) }} 天 | </text>
            已完成 {{ plan.completedGoals }} / {{ plan.totalGoals }} 目标
          </text>
          <view class="progress-bar">
            <view class="bar-inner" :style="{ width: plan.totalGoals > 0 ? (plan.completedGoals / plan.totalGoals * 100) + '%' : '0%' }"></view>
          </view>
        </view>

        <view class="goal-list" v-if="plan.goals.length > 0">
          <view class="goal-item" v-for="goal in plan.goals" :key="goal.id">
            <view class="goal-main">
              <view class="goal-check" :class="{ checked: goal.completed }" @click="toggleGoal(plan.id, goal.id)">
                <text v-if="goal.completed">✓</text>
              </view>
              <view class="goal-info" @click="toggleGoalExpand(goal.id)">
                <view class="goal-top">
                  <text class="goal-priority" :class="'pri-' + goal.priority">
                    {{ priorityLabel(goal.priority) }}
                  </text>
                  <text class="goal-title" :class="{ done: goal.completed }">{{ goal.title }}</text>
                  <text class="goal-repeat" v-if="goal.repeat !== 'none'">{{ repeatLabel(goal.repeat) }}</text>
                </view>
                <view class="goal-meta">
                  <text class="goal-deadline" v-if="goal.deadline">截止: {{ goal.deadline }}</text>
                  <text class="goal-streak" v-if="goal.currentStreak > 0">🔥 {{ goal.currentStreak }}天</text>
                </view>
              </view>
            </view>

            <view class="sub-tasks" v-if="goal.subTasks.length > 0 && expandedGoals.has(goal.id)">
              <view
                class="sub-task-item"
                v-for="(st, idx) in goal.subTasks"
                :key="idx"
                @click="toggleSubTask(plan.id, goal.id, idx)"
              >
                <view class="sub-check" :class="{ checked: st.completed }">
                  <text v-if="st.completed">✓</text>
                </view>
                <text class="sub-title" :class="{ done: st.completed }">{{ st.title }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="add-goal-btn" @click="openAddGoal(plan.id)">
          <text>+ 添加新目标</text>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <text class="empty-icon">🎯</text>
      <text class="empty-title">还没有成长计划</text>
      <text class="empty-desc">完成测评后制定你的个人成长计划</text>
    </view>

    <!-- Create Plan Modal -->
    <view class="modal-overlay" v-if="showCreatePlan" @click="showCreatePlan = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">新建成长计划</text>
        <input class="modal-input" v-model="newPlanTitle" placeholder="计划名称" />
        <view class="period-select">
          <text class="select-label">计划周期</text>
          <view class="period-options">
            <view class="period-opt" :class="{active: newPeriod==='short'}" @click="newPeriod='short'">短期(1月)</view>
            <view class="period-opt" :class="{active: newPeriod==='medium'}" @click="newPeriod='medium'">中期(6月)</view>
            <view class="period-opt" :class="{active: newPeriod==='long'}" @click="newPeriod='long'">长期(1年)</view>
          </view>
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showCreatePlan = false">取消</view>
          <view class="modal-btn confirm" @click="createPlan">创建</view>
        </view>
      </view>
    </view>

    <!-- Add Goal Modal (bottom sheet) -->
    <view class="modal-overlay" v-if="showAddGoal" @click="showAddGoal = false">
      <view class="goal-sheet" @click.stop>
        <text class="modal-title">添加新目标</text>

        <input class="modal-input" v-model="goalForm.title" placeholder="目标名称" />

        <view class="form-row">
          <text class="form-label">截止日期</text>
          <input class="form-input-half" v-model="goalForm.deadline" placeholder="2026-06-15" />
        </view>

        <view class="form-row">
          <text class="form-label">优先级</text>
          <view class="chip-group">
            <view class="chip" :class="{active: goalForm.priority==='high'}" @click="goalForm.priority='high'">高</view>
            <view class="chip" :class="{active: goalForm.priority==='medium'}" @click="goalForm.priority='medium'">中</view>
            <view class="chip" :class="{active: goalForm.priority==='low'}" @click="goalForm.priority='low'">低</view>
          </view>
        </view>

        <view class="form-row">
          <text class="form-label">重复周期</text>
          <view class="chip-group">
            <view class="chip" :class="{active: goalForm.repeat==='none'}" @click="goalForm.repeat='none'">不重复</view>
            <view class="chip" :class="{active: goalForm.repeat==='daily'}" @click="goalForm.repeat='daily'">每日</view>
            <view class="chip" :class="{active: goalForm.repeat==='weekly'}" @click="goalForm.repeat='weekly'">每周</view>
          </view>
        </view>

        <view class="form-row">
          <text class="form-label">子步骤</text>
        </view>
        <view class="sub-step-list">
          <view class="sub-step-row" v-for="(step, idx) in goalForm.subTasks" :key="idx">
            <input class="form-input-flex" v-model="step.title" placeholder="子步骤描述" />
            <view class="sub-remove" @click="goalForm.subTasks.splice(idx, 1)">✕</view>
          </view>
          <view class="sub-add" @click="goalForm.subTasks.push({title: '', completed: false})" v-if="goalForm.subTasks.length < 10">
            + 添加子步骤
          </view>
        </view>

        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showAddGoal = false">取消</view>
          <view class="modal-btn confirm" @click="confirmAddGoal">添加</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { usePlanLogic } from '@/composables/usePlanLogic'

const { plans, createPlan: addPlan, addGoal, toggleGoal: doToggleGoal, toggleSubTask: doToggleSubTask, getPlanStreak } = usePlanLogic()

const expandedGoals = ref(new Set<string>())

// ---- Create Plan Modal ----
const showCreatePlan = ref(false)
const newPlanTitle = ref('')
const newPeriod = ref<'short' | 'medium' | 'long'>('medium')

function openCreatePlan() {
  showCreatePlan.value = true
}

function createPlan() {
  if (!newPlanTitle.value.trim()) {
    uni.showToast({ title: '请输入计划名称', icon: 'none' })
    return
  }
  addPlan({ title: newPlanTitle.value, period: newPeriod.value })
  newPlanTitle.value = ''
  showCreatePlan.value = false
  uni.showToast({ title: '计划创建成功', icon: 'success' })
}

// ---- Add Goal Modal ----
const showAddGoal = ref(false)
const editingPlanId = ref('')
const goalForm = reactive({
  title: '',
  deadline: '',
  priority: 'medium' as 'high' | 'medium' | 'low',
  repeat: 'none' as 'none' | 'daily' | 'weekly',
  subTasks: [] as { title: string; completed: boolean }[],
})

function openAddGoal(planId: string) {
  editingPlanId.value = planId
  goalForm.title = ''
  goalForm.deadline = ''
  goalForm.priority = 'medium'
  goalForm.repeat = 'none'
  goalForm.subTasks = []
  showAddGoal.value = true
}

function confirmAddGoal() {
  if (!goalForm.title.trim()) {
    uni.showToast({ title: '请输入目标名称', icon: 'none' })
    return
  }
  addGoal(editingPlanId.value, {
    title: goalForm.title,
    deadline: goalForm.deadline,
    priority: goalForm.priority,
    repeat: goalForm.repeat,
    subTasks: goalForm.subTasks.filter(s => s.title.trim()),
  })
  showAddGoal.value = false
  uni.showToast({ title: '目标已添加', icon: 'success' })
}

// ---- Goal Interaction ----
function toggleGoal(planId: string, goalId: string) {
  doToggleGoal(planId, goalId)
}

function toggleGoalExpand(goalId: string) {
  if (expandedGoals.value.has(goalId)) {
    expandedGoals.value.delete(goalId)
  } else {
    expandedGoals.value.add(goalId)
  }
}

function toggleSubTask(planId: string, goalId: string, idx: number) {
  doToggleSubTask(planId, goalId, idx)
}

// ---- Labels ----
function periodLabel(p: string) {
  const map: Record<string, string> = { short: '短期', medium: '中期', long: '长期' }
  return map[p] || p
}

function priorityLabel(p: string) {
  const map: Record<string, string> = { high: '高', medium: '中', low: '低' }
  return map[p] || p
}

function repeatLabel(r: string) {
  const map: Record<string, string> = { daily: '每日', weekly: '每周' }
  return map[r] || r
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.page-plan {
  padding: 0 $spacing-md 60rpx;
  min-height: 100vh;
  background: $gradient-hero;
}

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 48rpx 8rpx 32rpx;

  .page-title {
    font-size: 42rpx;
    font-weight: $font-weight-bold;
    color: $text-primary;
    letter-spacing: $letter-spacing-title;
  }

  .add-btn {
    background: $gradient-primary;
    color: #fff;
    padding: 16rpx 32rpx;
    border-radius: $radius-full;
    font-size: 26rpx;
    font-weight: $font-weight-medium;
    box-shadow: $shadow-glow;
  }
}

.plan-card {
  position: relative;
  background: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: 20rpx;
  box-shadow: $shadow-md;
  transition: all $transition-smooth;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 6rpx;
    height: 100%;
    background: $gradient-primary;
    border-radius: 6rpx 0 0 6rpx;
  }
}

.plan-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16rpx;
}
.plan-name {
  font-size: 30rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
}

.plan-period {
  font-size: 22rpx;
  padding: 6rpx 18rpx;
  border-radius: $radius-full;
  font-weight: $font-weight-medium;

  &.short { background: $success-lightest; color: #047857; }
  &.medium { background: $warning-lightest; color: #B45309; }
  &.long { background: $primary-lightest; color: $primary-dark; }
}

.plan-progress { margin-bottom: 16rpx; }

.progress-text {
  font-size: 24rpx; color: $text-hint; display: block; margin-bottom: 10rpx;

  .streak { color: $warning-color; font-weight: $font-weight-medium; }
}

.progress-bar {
  height: 10rpx;
  background: $border-color;
  border-radius: 5rpx;
  overflow: hidden;
}

.bar-inner {
  height: 100%;
  background: $gradient-primary;
  border-radius: 5rpx;
  transition: width $transition-smooth;
}

.goal-item { margin-top: 12rpx; }

.goal-main {
  display: flex; align-items: flex-start; padding: 18rpx 16rpx;
  background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
  border-radius: $radius-sm;
  transition: background $transition-base;
}

.goal-check {
  width: 44rpx; height: 44rpx; border-radius: 50%;
  border: 3rpx solid $border-color;
  margin-right: 14rpx; display: flex; align-items: center; justify-content: center;
  font-size: 22rpx; color: #fff; flex-shrink: 0;
  transition: all $transition-base;

  &.checked { background: $success-color; border-color: $success-color; box-shadow: 0 2rpx 12rpx rgba(16, 185, 129, 0.25); }
}

.goal-info { flex: 1; min-width: 0; }

.goal-top {
  display: flex; align-items: center; gap: 8rpx; flex-wrap: wrap; margin-bottom: 4rpx;
}

.goal-priority {
  font-size: 20rpx; padding: 4rpx 12rpx; border-radius: $radius-full; font-weight: $font-weight-medium;

  &.pri-high { background: $error-lightest; color: #B91C1C; }
  &.pri-medium { background: $warning-lightest; color: #B45309; }
  &.pri-low { background: $primary-lightest; color: $primary-dark; }
}

.goal-title { font-size: 28rpx; color: $text-primary; flex: 1;
  &.done { color: $text-hint; text-decoration: line-through; }
}

.goal-repeat {
  font-size: 20rpx; background: $success-lightest; color: #047857;
  padding: 4rpx 12rpx; border-radius: $radius-full; white-space: nowrap;
  font-weight: $font-weight-medium;
}

.goal-meta { display: flex; gap: 16rpx; margin-top: 6rpx; }
.goal-deadline { font-size: 22rpx; color: $text-hint; }
.goal-streak { font-size: 22rpx; color: $warning-color; font-weight: $font-weight-medium; }

.sub-tasks {
  margin-top: 10rpx; margin-left: 56rpx;
  background: $card-bg; border-radius: $radius-sm;
  padding: 10rpx 16rpx;
  box-shadow: $shadow-sm;
}

.sub-task-item {
  display: flex; align-items: center; padding: 12rpx 0;

  &:not(:last-child) { border-bottom: 1rpx solid $border-light; }
}

.sub-check {
  width: 34rpx; height: 34rpx; border-radius: 8rpx;
  border: 2rpx solid $border-color;
  margin-right: 12rpx; display: flex; align-items: center; justify-content: center;
  font-size: 18rpx; color: #fff; flex-shrink: 0;
  transition: all $transition-base;

  &.checked { background: $success-color; border-color: $success-color; }
}

.sub-title { font-size: 24rpx; color: $text-secondary;
  &.done { color: $text-hint; text-decoration: line-through; }
}

.add-goal-btn {
  margin-top: 20rpx; text-align: center; padding: 18rpx;
  border: 2rpx dashed $primary-lighter;
  border-radius: $radius-sm;
  font-size: 26rpx; color: $primary-color;
  font-weight: $font-weight-medium;
  transition: all $transition-base;

  &:active {
    background: $primary-lightest;
  }
}

.empty-state {
  @extend .empty-state-base;

  .empty-icon { font-size: 88rpx; margin-bottom: 28rpx; }
  .empty-title {
    font-size: 32rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: 12rpx;
  }
  .empty-desc {
    font-size: 26rpx;
    color: $text-hint;
    margin-bottom: 40rpx;
  }
}

.modal-overlay {
  @extend .modal-mask;
}

.modal-content, .goal-sheet {
  background: $card-bg;
  border-radius: $radius-2xl $radius-2xl 0 0;
  padding: 44rpx $spacing-lg 60rpx;
  width: 100%;
  box-shadow: $shadow-xl;
  animation: slideUp 0.3s ease;
}

.goal-sheet {
  max-height: 80vh; overflow-y: auto;
}

.modal-title {
  font-size: 34rpx;
  font-weight: $font-weight-bold;
  color: $text-primary;
  display: block;
  margin-bottom: 28rpx;
  text-align: center;
}

.modal-input, .form-input-flex {
  background: #F8FAFC;
  border-radius: $radius-sm;
  padding: 22rpx 24rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  width: 100%;
  box-sizing: border-box;
  border: 1rpx solid $border-color;
}

.select-label { font-size: 26rpx; color: $text-secondary; display: block; margin-bottom: 16rpx; }

.period-options { display: flex; gap: 16rpx; margin-bottom: 32rpx; }

.period-opt {
  flex: 1; text-align: center; padding: 18rpx; border-radius: $radius-sm;
  background: #F8FAFC; font-size: 24rpx; color: $text-secondary;
  border: 1rpx solid $border-color;
  transition: all $transition-base;

  &.active {
    background: $primary-lightest;
    color: $primary-color;
    font-weight: $font-weight-semibold;
    border-color: $primary-lighter;
  }
}

.modal-actions { display: flex; gap: 24rpx; margin-top: 28rpx; }

.modal-btn {
  flex: 1; text-align: center; padding: 22rpx; border-radius: $radius-full;
  font-size: 28rpx; font-weight: $font-weight-medium;
  transition: all $transition-base;

  &:active { opacity: 0.85; }
}

.cancel { background: #F3F4F6; color: $text-secondary; }
.confirm { background: $gradient-primary; color: #fff; box-shadow: $shadow-glow; }

.form-row { display: flex; align-items: center; margin-bottom: 20rpx; }
.form-label { font-size: 26rpx; color: $text-secondary; width: 140rpx; flex-shrink: 0; font-weight: $font-weight-medium; }
.form-input-half {
  flex: 1;
  background: #F8FAFC;
  border: 1rpx solid $border-color;
  border-radius: $radius-sm;
  padding: 16rpx 18rpx;
  font-size: 26rpx;
}

.chip-group { display: flex; gap: 12rpx; }
.chip {
  padding: 12rpx 22rpx; border-radius: $radius-full;
  background: #F8FAFC; font-size: 24rpx;
  color: $text-secondary; border: 1rpx solid $border-color;
  transition: all $transition-base;

  &.active {
    background: $primary-lightest;
    color: $primary-dark;
    font-weight: $font-weight-semibold;
    border-color: $primary-lighter;
  }
}

.sub-step-list { margin-bottom: 16rpx; }
.sub-step-row { display: flex; align-items: center; margin-bottom: 12rpx; }
.sub-remove {
  width: 48rpx; height: 48rpx; display: flex; align-items: center; justify-content: center;
  color: $error-color; font-size: 26rpx; font-weight: $font-weight-bold;
}
.sub-add {
  font-size: 24rpx; color: $primary-color; padding: 12rpx 0;
  font-weight: $font-weight-medium;
}
</style>
