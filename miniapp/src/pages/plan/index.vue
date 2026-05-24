<template>
  <view class="page-plan">
    <view class="page-header">
      <text class="page-title">成长计划</text>
      <view class="add-btn" @click="showAddModal = true">+ 新建计划</view>
    </view>
    <view class="plans-list" v-if="plans.length > 0">
      <view class="plan-card" v-for="plan in plans" :key="plan.id">
        <view class="plan-header">
          <text class="plan-name">{{ plan.title }}</text>
          <text class="plan-period" :class="plan.period">{{ periodLabel(plan.period) }}</text>
        </view>
        <view class="plan-progress">
          <view class="progress-text">
            <text class="completed">{{ plan.completedTasks }}</text>
            <text class="divider">/</text>
            <text class="total">{{ plan.totalTasks }}</text>
            <text class="label">任务完成</text>
          </view>
          <view class="progress-bar">
            <view class="bar-inner" :style="{ width: plan.progress + '%' }"></view>
          </view>
        </view>
        <view class="plan-goals">
          <view class="goal-item" v-for="goal in plan.goals" :key="goal.id" @click="toggleGoal(plan.id, goal.id)">
            <view class="goal-check" :class="{ checked: goal.completed }">
              <text v-if="goal.completed">✓</text>
            </view>
            <view class="goal-info">
              <text class="goal-title" :class="{ done: goal.completed }">{{ goal.title }}</text>
              <text class="goal-date">截止: {{ goal.deadline }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="empty-state" v-else>
      <text class="empty-icon">🎯</text>
      <text class="empty-title">还没有成长计划</text>
      <text class="empty-desc">完成测评后，制定你的个人成长计划</text>
      <view class="create-btn" @click="showAddModal = true">创建计划</view>
    </view>
    <view class="add-modal" v-if="showAddModal">
      <view class="modal-mask" @click="showAddModal = false"></view>
      <view class="modal-content">
        <text class="modal-title">新建成长计划</text>
        <input class="modal-input" v-model="newPlanTitle" placeholder="计划名称，如：3个月成为前端工程师" />
        <view class="period-select">
          <text class="select-label">计划周期</text>
          <view class="period-options">
            <view class="period-opt" :class="{active: newPeriod==='short'}" @click="newPeriod='short'">短期(1月)</view>
            <view class="period-opt" :class="{active: newPeriod==='medium'}" @click="newPeriod='medium'">中期(6月)</view>
            <view class="period-opt" :class="{active: newPeriod==='long'}" @click="newPeriod='long'">长期(1年)</view>
          </view>
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showAddModal = false">取消</view>
          <view class="modal-btn confirm" @click="createPlan">创建</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Goal {
  id: string; title: string; completed: boolean; deadline: string
}

interface Plan {
  id: string; title: string; period: string; goals: Goal[]; totalTasks: number; completedTasks: number; progress: number
}

const plans = ref<Plan[]>([
  {
    id: 'p1', title: '职业技能提升', period: 'medium',
    goals: [
      { id: 'g1', title: '学习 Vue.js 并完成个人项目', completed: true, deadline: '2026-06-15' },
      { id: 'g2', title: '每天阅读技术文章30分钟', completed: false, deadline: '2026-07-01' },
      { id: 'g3', title: '参加一次技术分享会', completed: false, deadline: '2026-08-01' }
    ],
    totalTasks: 3, completedTasks: 1, progress: 33
  },
  {
    id: 'p2', title: '沟通能力训练', period: 'short',
    goals: [
      { id: 'g4', title: '每周写一篇总结文章', completed: true, deadline: '2026-05-30' },
      { id: 'g5', title: '每天练习表达3分钟', completed: true, deadline: '2026-06-01' }
    ],
    totalTasks: 2, completedTasks: 2, progress: 100
  }
])

const showAddModal = ref(false)
const newPlanTitle = ref('')
const newPeriod = ref<'short' | 'medium' | 'long'>('medium')

function periodLabel(p: string) {
  const map: Record<string, string> = { short: '短期', medium: '中期', long: '长期' }
  return map[p] || p
}

function toggleGoal(planId: string, goalId: string) {
  const plan = plans.value.find(p => p.id === planId)
  if (!plan) return
  const goal = plan.goals.find(g => g.id === goalId)
  if (!goal) return
  goal.completed = !goal.completed
  plan.completedTasks = plan.goals.filter(g => g.completed).length
  plan.progress = Math.round((plan.completedTasks / plan.totalTasks) * 100)
}

function createPlan() {
  if (!newPlanTitle.value.trim()) {
    uni.showToast({ title: '请输入计划名称', icon: 'none' })
    return
  }
  plans.value.push({
    id: 'p' + Date.now(), title: newPlanTitle.value, period: newPeriod.value,
    goals: [], totalTasks: 0, completedTasks: 0, progress: 0
  })
  newPlanTitle.value = ''
  showAddModal.value = false
  uni.showToast({ title: '计划创建成功', icon: 'success' })
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.page-plan { padding: 0 24rpx 40rpx; }

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

.plan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.plan-name { font-size: 30rpx; font-weight: 600; }

.plan-period {
  font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 20rpx;

  &.short { background: #E8F5E9; color: #4CAF50; }
  &.medium { background: #FFF3E0; color: #FF9800; }
  &.long { background: #E3F2FD; color: #2196F3; }
}

.plan-progress { margin-bottom: 24rpx; }
.progress-text { display: flex; align-items: baseline; margin-bottom: 8rpx; }
.completed { font-size: 32rpx; font-weight: 700; color: $primary-color; }
.divider { margin: 0 4rpx; color: $text-hint; }
.total { font-size: 28rpx; color: $text-hint; }
.label { margin-left: 8rpx; font-size: 22rpx; color: $text-hint; }

.progress-bar { height: 10rpx; background: #F0F0F0; border-radius: 5rpx; overflow: hidden; }
.bar-inner { height: 100%; background: $primary-color; border-radius: 5rpx; transition: width 0.3s; }

.goal-item { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #F5F5F5; }
.goal-item:last-child { border-bottom: none; }

.goal-check {
  width: 40rpx; height: 40rpx; border-radius: 50%; border: 3rpx solid #D0D0D0;
  margin-right: 16rpx; display: flex; align-items: center; justify-content: center;
  font-size: 22rpx; color: #fff; flex-shrink: 0;

  &.checked { background: $success-color; border-color: $success-color; }
}

.goal-info { flex: 1; }
.goal-title { font-size: 28rpx; color: $text-primary; display: block; margin-bottom: 4rpx; }
.goal-title.done { color: $text-hint; text-decoration: line-through; }
.goal-date { font-size: 22rpx; color: $text-hint; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; padding: 120rpx 40rpx;

  .empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
  .empty-title { font-size: 32rpx; font-weight: 600; margin-bottom: 12rpx; }
  .empty-desc { font-size: 26rpx; color: $text-hint; margin-bottom: 40rpx; }
  .create-btn {
    background: $primary-color; color: #fff; padding: 20rpx 64rpx;
    border-radius: 40rpx; font-size: 28rpx;
  }
}

.add-modal { position: fixed; top:0;left:0;right:0;bottom:0; z-index:100; }
.modal-mask { position:absolute; top:0;left:0;right:0;bottom:0; background:rgba(0,0,0,0.5); }
.modal-content {
  position:absolute; bottom:0; left:0; right:0; background:#fff;
  border-radius:24rpx 24rpx 0 0; padding:40rpx 32rpx 60rpx;
}
.modal-title { font-size:32rpx; font-weight:600; display:block; margin-bottom:32rpx; text-align:center; }
.modal-input {
  background:#F5F5F5; border-radius:12rpx; padding:20rpx 24rpx; font-size:28rpx;
  margin-bottom: 24rpx; width: 100%; box-sizing: border-box;
}
.select-label { font-size:26rpx; color:$text-secondary; display:block; margin-bottom:16rpx; }
.period-options { display:flex; gap:16rpx; margin-bottom:32rpx; }
.period-opt {
  flex:1; text-align:center; padding:16rpx; border-radius:12rpx;
  background:#F5F5F5; font-size:24rpx; color:$text-secondary;

  &.active { background:#E3F2FD; color:$primary-color; font-weight:500; }
}
.modal-actions { display:flex; gap:24rpx; }
.modal-btn { flex:1; text-align:center; padding:20rpx; border-radius:40rpx; font-size:28rpx; }
.cancel { background:#F5F5F5; color:$text-secondary; }
.confirm { background:$primary-color; color:#fff; }
</style>
