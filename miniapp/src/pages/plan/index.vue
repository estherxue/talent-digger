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

.page-plan { padding: 0 24rpx 40rpx; min-height: 100vh; background: #F5F7FA; }

.page-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 40rpx 8rpx 32rpx;

  .page-title { font-size: 40rpx; font-weight: 700; }

  .add-btn {
    background: $primary-color; color: #fff; padding: 14rpx 28rpx;
    border-radius: 32rpx; font-size: 26rpx;
  }
}

.plan-card {
  background: $card-bg; border-radius: 16rpx; padding: 28rpx; margin-bottom: 20rpx; box-shadow: $shadow;
}

.plan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }
.plan-name { font-size: 30rpx; font-weight: 600; }

.plan-period {
  font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 20rpx;

  &.short { background: #E8F5E9; color: #4CAF50; }
  &.medium { background: #FFF3E0; color: #FF9800; }
  &.long { background: #E3F2FD; color: #2196F3; }
}

.plan-progress { margin-bottom: 16rpx; }

.progress-text {
  font-size: 24rpx; color: $text-hint; display: block; margin-bottom: 8rpx;

  .streak { color: #FF9800; font-weight: 500; }
}

.progress-bar { height: 8rpx; background: #F0F0F0; border-radius: 4rpx; overflow: hidden; }
.bar-inner { height: 100%; background: $primary-color; border-radius: 4rpx; transition: width 0.3s; }

.goal-item { margin-top: 12rpx; }

.goal-main {
  display: flex; align-items: flex-start; padding: 16rpx 12rpx;
  background: #F8F9FA; border-radius: 10rpx;
}

.goal-check {
  width: 40rpx; height: 40rpx; border-radius: 50%; border: 3rpx solid #D0D0D0;
  margin-right: 12rpx; display: flex; align-items: center; justify-content: center;
  font-size: 22rpx; color: #fff; flex-shrink: 0;

  &.checked { background: $success-color; border-color: $success-color; }
}

.goal-info { flex: 1; min-width: 0; }

.goal-top {
  display: flex; align-items: center; gap: 8rpx; flex-wrap: wrap; margin-bottom: 4rpx;
}

.goal-priority {
  font-size: 20rpx; padding: 2rpx 10rpx; border-radius: 8rpx; font-weight: 500;

  &.pri-high { background: #FFEBEE; color: #D32F2F; }
  &.pri-medium { background: #FFF3E0; color: #E65100; }
  &.pri-low { background: #E8EAF6; color: #5C6BC0; }
}

.goal-title { font-size: 28rpx; color: $text-primary; flex: 1;
  &.done { color: $text-hint; text-decoration: line-through; }
}

.goal-repeat {
  font-size: 20rpx; background: #E8F5E9; color: #388E3C;
  padding: 2rpx 10rpx; border-radius: 8rpx; white-space: nowrap;
}

.goal-meta { display: flex; gap: 16rpx; margin-top: 4rpx; }
.goal-deadline { font-size: 22rpx; color: $text-hint; }
.goal-streak { font-size: 22rpx; color: #FF9800; }

.sub-tasks {
  margin-top: 8rpx; margin-left: 52rpx;
  background: #fff; border-radius: 8rpx; padding: 8rpx 12rpx;
}

.sub-task-item {
  display: flex; align-items: center; padding: 10rpx 0;

  &:not(:last-child) { border-bottom: 1rpx solid #F0F0F0; }
}

.sub-check {
  width: 32rpx; height: 32rpx; border-radius: 6rpx; border: 2rpx solid #D0D0D0;
  margin-right: 12rpx; display: flex; align-items: center; justify-content: center;
  font-size: 18rpx; color: #fff; flex-shrink: 0;

  &.checked { background: $success-color; border-color: $success-color; }
}

.sub-title { font-size: 24rpx; color: $text-secondary;
  &.done { color: $text-hint; text-decoration: line-through; }
}

.add-goal-btn {
  margin-top: 16rpx; text-align: center; padding: 16rpx;
  border: 2rpx dashed #D0D0D0; border-radius: 10rpx;
  font-size: 26rpx; color: $primary-color;
}

.empty-state {
  display: flex; flex-direction: column; align-items: center; padding: 120rpx 40rpx;

  .empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
  .empty-title { font-size: 32rpx; font-weight: 600; margin-bottom: 12rpx; }
  .empty-desc { font-size: 26rpx; color: $text-hint; margin-bottom: 40rpx; }
}

.modal-overlay {
  position: fixed; top:0;left:0;right:0;bottom:0; z-index:100;
  background:rgba(0,0,0,0.5); display:flex; align-items:flex-end; justify-content:center;
}

.modal-content {
  background:#fff; border-radius:24rpx 24rpx 0 0; padding:40rpx 32rpx 60rpx; width:100%;
}

.goal-sheet {
  background:#fff; border-radius:24rpx 24rpx 0 0; padding:40rpx 32rpx 60rpx; width:100%;
  max-height: 80vh; overflow-y: auto;
}

.modal-title { font-size:32rpx; font-weight:600; display:block; margin-bottom:24rpx; text-align:center; }

.modal-input {
  background:#F5F5F5; border-radius:12rpx; padding:20rpx 24rpx; font-size:28rpx;
  margin-bottom: 20rpx; width: 100%; box-sizing: border-box;
}

.select-label { font-size:26rpx; color:$text-secondary; display:block; margin-bottom:16rpx; }

.period-options { display:flex; gap:16rpx; margin-bottom:32rpx; }

.period-opt {
  flex:1; text-align:center; padding:16rpx; border-radius:12rpx;
  background:#F5F5F5; font-size:24rpx; color:$text-secondary;

  &.active { background:#E3F2FD; color:$primary-color; font-weight:500; }
}

.modal-actions { display:flex; gap:24rpx; margin-top: 24rpx; }

.modal-btn {
  flex:1; text-align:center; padding:20rpx; border-radius:40rpx; font-size:28rpx;
}

.cancel { background:#F5F5F5; color:$text-secondary; }
.confirm { background:$primary-color; color:#fff; }

.form-row { display: flex; align-items: center; margin-bottom: 20rpx; }
.form-label { font-size: 26rpx; color: $text-secondary; width: 140rpx; flex-shrink: 0; }
.form-input-half { flex: 1; background: #F5F5F5; border-radius: 8rpx; padding: 14rpx 16rpx; font-size: 26rpx; }

.chip-group { display: flex; gap: 12rpx; }
.chip {
  padding: 10rpx 20rpx; border-radius: 20rpx; background: #F5F5F5;
  font-size: 24rpx; color: $text-secondary;

  &.active { background: #E3F2FD; color: $primary-color; font-weight: 500; }
}

.sub-step-list { margin-bottom: 16rpx; }
.sub-step-row { display: flex; align-items: center; margin-bottom: 10rpx; }
.form-input-flex { flex: 1; background: #F5F5F5; border-radius: 8rpx; padding: 14rpx 16rpx; font-size: 26rpx; }
.sub-remove { width: 44rpx; height: 44rpx; display: flex; align-items: center; justify-content: center; color: #D32F2F; font-size: 24rpx; }
.sub-add { font-size: 24rpx; color: $primary-color; padding: 10rpx 0; }
</style>
