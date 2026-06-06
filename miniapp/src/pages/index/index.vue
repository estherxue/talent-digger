<template>
  <view class="page-index">
    <!-- Hero -->
    <view class="hero">
      <text class="hero-title">发现你的职业方向</text>
      <text class="hero-subtitle">天赋能力 × 职业兴趣，双维精准匹配</text>
    </view>

    <!-- 步骤卡片 -->
    <view class="steps">
      <!-- ❶ 天赋罗盘 -->
      <view class="step-card" :class="{ done: talentDone }" @click="startTalent">
        <view class="step-number">❶</view>
        <view class="step-body">
          <view class="step-header">
            <text class="step-name">天赋罗盘</text>
            <text class="step-check" v-if="talentDone">✓</text>
          </view>
          <text class="step-desc">了解你天生擅长什么</text>
          <text class="step-meta">10 个维度 · 26 题 · 约 15 分钟</text>
        </view>
        <view class="step-action">
          <text v-if="!talentDone" class="btn-primary">开始测评</text>
          <text v-else class="btn-secondary">重新测评</text>
        </view>
      </view>

      <!-- 连接线 -->
      <view class="step-connector">
        <view class="connector-line"></view>
      </view>

      <!-- ❷ 霍兰德 -->
      <view class="step-card" :class="{ locked: !talentDone, done: hollandDone }" @click="startHolland">
        <view class="step-number">❷</view>
        <view class="step-body">
          <view class="step-header">
            <text class="step-name">霍兰德职业兴趣</text>
            <text class="step-check" v-if="hollandDone">✓</text>
          </view>
          <text class="step-desc">了解你真正喜欢做什么</text>
          <text class="step-meta">6 个类型 · 30 题 · 约 10 分钟</text>
        </view>
        <view class="step-action">
          <text v-if="!talentDone" class="btn-locked">完成天赋罗盘后解锁</text>
          <text v-else-if="!hollandDone" class="btn-primary">开始测评</text>
          <text v-else class="btn-secondary">重新测评</text>
        </view>
      </view>

      <!-- 连接线 -->
      <view class="step-connector">
        <view class="connector-line" :class="{ active: bothDone }"></view>
      </view>

      <!-- ❸ 综合推荐 -->
      <view class="step-card result-card" :class="{ locked: !bothDone, done: bothDone }" @click="viewResult">
        <view class="step-number result-number">🎯</view>
        <view class="step-body">
          <view class="step-header">
            <text class="step-name">查看综合职业推荐</text>
            <text class="step-check" v-if="bothDone">✓</text>
          </view>
          <text class="step-desc">基于能力 + 兴趣的双维匹配</text>
          <text class="step-meta">精准找到适合你的职业方向</text>
        </view>
        <view class="step-action">
          <text v-if="!bothDone" class="btn-locked">完成全部测评后解锁</text>
          <text v-else class="btn-primary">查看推荐</text>
        </view>
      </view>
    </view>
    </view>

    <!-- 阶段总结弹窗 -->
    <view class="stage-summary-mask" v-if="showStageSummary" @click="closeStageSummary">
      <view class="stage-summary-modal" @click.stop>
        <text class="stage-icon">🎉</text>
        <text class="stage-title">{{ stageTestName }} · 已完成</text>

        <view class="stage-scores">
          <text class="stage-scores-label">📊 你的优势维度</text>
          <view class="stage-dims">
            <text
              v-for="d in stageTopDims"
              :key="d.key"
              class="stage-dim-badge"
            >{{ d.name }} {{ d.pct }}%</text>
          </view>
        </view>

        <text class="stage-summary-text">{{ stageSummaryText }}</text>

        <view class="stage-cta" @click="goToNextTest">
          <text>{{ stageNextTestName }} →</text>
        </view>

        <text class="stage-skip" @click="closeStageSummary">跳过，以后再说</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { smartNavigate } from '@/utils'
import { computeDimensionScores, topDimensions } from '@/utils/scoring'
import { generateSummary, dimName } from '@/utils/summary'
import { mockTalentQuestions } from '@/data/mock/test'

const talentDone = ref(false)
const hollandDone = ref(false)
const bothDone = ref(false)

// ---- stage summary modal state ----
const showStageSummary = ref(false)
const stageTestId = ref('')
const stageTestName = ref('')
const stageTopDims = ref<{ key: string; name: string; pct: number }[]>([])
const stageSummaryText = ref('')
const stageNextTestId = ref('')
const stageNextTestName = ref('')

function refreshState() {
  try {
    const raw = uni.getStorageSync('completedTests') || '[]'
    const completed: string[] = JSON.parse(raw)
    talentDone.value = completed.includes('test_talent_compass')
    hollandDone.value = completed.includes('test_holland')
    bothDone.value = talentDone.value && hollandDone.value
  } catch {
    talentDone.value = false
    hollandDone.value = false
    bothDone.value = false
  }
}

/** Check if we should show a stage summary modal */
function maybeShowSummary() {
  try {
    const rawLastTestId = uni.getStorageSync('lastTestId')
    const rawLastAnswers = uni.getStorageSync('lastAnswers')
    if (!rawLastTestId || !rawLastAnswers) return

    if (rawLastTestId !== 'test_talent_compass' && rawLastTestId !== 'test_holland') return

    // Check if we already showed the summary for this test
    const rawSeen = uni.getStorageSync('seenStageSummary') || '[]'
    const seen: string[] = JSON.parse(rawSeen)
    if (seen.includes(rawLastTestId)) return

    const answers = JSON.parse(rawLastAnswers)
    const questions = rawLastTestId === 'test_talent_compass'
      ? mockTalentQuestions
      : mockTalentQuestions // fallback: Holland scoring not yet implemented
    const rawScores = computeDimensionScores(answers, questions, { normalize: true })
    const top = topDimensions(rawScores, 3)

    stageTestId.value = rawLastTestId
    stageTestName.value = rawLastTestId === 'test_talent_compass' ? '天赋罗盘' : '霍兰德职业兴趣'
    stageTopDims.value = top.map(k => ({ key: k, name: dimName(k), pct: rawScores[k] }))
    stageSummaryText.value = generateSummary(top)

    // Set up "next test" CTA
    if (rawLastTestId === 'test_talent_compass') {
      stageNextTestId.value = 'test_holland'
      stageNextTestName.value = '开始霍兰德测试'
    } else {
      stageNextTestId.value = ''
      stageNextTestName.value = '查看综合推荐'
    }

    showStageSummary.value = true

    seen.push(rawLastTestId)
    uni.setStorageSync('seenStageSummary', JSON.stringify(seen))
  } catch {
    // Silently fail — the modal is a nice-to-have
  }
}

// 每次回到首页时刷新状态
onShow(() => {
  refreshState()
  maybeShowSummary()
})

function closeStageSummary() {
  showStageSummary.value = false
}

function goToNextTest() {
  showStageSummary.value = false
  if (stageNextTestId.value === 'test_holland') {
    smartNavigate(`/pages/test/answer?testId=${stageNextTestId.value}`)
  } else {
    smartNavigate('/pages/report/index?testId=test_holland&resultId=local')
  }
}

function startTalent() {
  smartNavigate('/pages/test/answer?testId=test_talent_compass')
}

function startHolland() {
  if (!talentDone.value) return
  smartNavigate('/pages/test/answer?testId=test_holland')
}

function viewResult() {
  if (!bothDone.value) return
  smartNavigate('/pages/report/index?testId=test_talent_compass&resultId=local')
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.page-index {
  min-height: 100vh;
  background: linear-gradient(180deg, #F0F6FF 0%, #fff 30%);
  padding-bottom: 40rpx;
}

/* Hero */
.hero {
  padding: 80rpx 40rpx 48rpx;
  text-align: center;

  &-title {
    font-size: 44rpx;
    font-weight: 700;
    color: $text-primary;
    display: block;
    margin-bottom: 16rpx;
  }

  &-subtitle {
    font-size: 28rpx;
    color: $text-hint;
    display: block;
  }
}

/* Steps Container */
.steps {
  padding: 0 32rpx;
}

/* Step Card */
.step-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s;

  &.locked {
    opacity: 0.45;
  }

  &.done {
    border: 2rpx solid $success-color;
  }
}

.step-number {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.result-number {
  background: linear-gradient(135deg, #FF9800, #FFB74D);
}

.step-body {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}

.step-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.step-check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: $success-color;
  color: #fff;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12rpx;
}

.step-desc {
  font-size: 24rpx;
  color: $text-secondary;
  display: block;
  margin-bottom: 4rpx;
}

.step-meta {
  font-size: 20rpx;
  color: $text-hint;
  display: block;
}

.step-action {
  flex-shrink: 0;
  margin-left: 16rpx;
}

.btn-primary {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
  font-size: 24rpx;
  padding: 14rpx 28rpx;
  border-radius: 32rpx;
  font-weight: 500;
  white-space: nowrap;
}

.btn-secondary {
  background: #F0F0F0;
  color: $text-secondary;
  font-size: 24rpx;
  padding: 14rpx 28rpx;
  border-radius: 32rpx;
  white-space: nowrap;
}

.btn-locked {
  color: #CCC;
  font-size: 22rpx;
  white-space: nowrap;
}

/* Connector */
.step-connector {
  display: flex;
  justify-content: center;
  padding: 8rpx 0;
}

.connector-line {
  width: 2rpx;
  height: 40rpx;
  background: #E0E0E0;
  transition: background 0.3s;

  &.active {
    background: $success-color;
  }
}

/* ---- 阶段总结弹窗 ---- */
.stage-summary-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.stage-summary-modal {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx 40rpx;
  text-align: center;
}

.stage-icon { font-size: 60rpx; display: block; margin-bottom: 16rpx; }

.stage-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  display: block;
  margin-bottom: 32rpx;
}

.stage-scores {
  background: #F0F6FF;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
}

.stage-scores-label {
  font-size: 26rpx;
  color: $primary-color;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}

.stage-dims {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.stage-dim-badge {
  background: #E3F2FD;
  color: #1565C0;
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.stage-summary-text {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.6;
  display: block;
  margin-bottom: 32rpx;
}

.stage-cta {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
  padding: 20rpx 48rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: inline-block;
}

.stage-skip {
  font-size: 24rpx;
  color: #BBB;
  display: block;
  margin-top: 20rpx;
}
</style>
