<template>
  <view class="page-index">
    <!-- Hero Section -->
    <view class="hero">
      <view class="hero-glow hero-glow-1"></view>
      <view class="hero-glow hero-glow-2"></view>
      <view class="hero-decoration">
        <view class="deco-dot deco-dot-1"></view>
        <view class="deco-dot deco-dot-2"></view>
        <view class="deco-dot deco-dot-3"></view>
        <view class="deco-ring"></view>
      </view>
      <text class="hero-brand">TALENT DIGGER</text>
      <text class="hero-title">发现你的职业方向</text>
      <text class="hero-subtitle">天赋能力 × 职业兴趣，双维精准匹配</text>
      <view class="hero-stats" v-if="talentDone || hollandDone">
        <view class="hero-stat" v-if="talentDone">
          <text class="hero-stat-icon">🧠</text>
          <text class="hero-stat-text">天赋已测</text>
        </view>
        <view class="hero-stat" v-if="hollandDone">
          <text class="hero-stat-icon">💼</text>
          <text class="hero-stat-text">兴趣已测</text>
        </view>
      </view>
    </view>

    <!-- Step Cards -->
    <view class="steps">
      <!-- ❶ 天赋罗盘 -->
      <view class="step-card-wrapper" :class="{ done: talentDone }">
        <view class="step-card" @click="startTalent">
          <view class="step-card-glow"></view>
          <view class="step-number-area">
            <view class="step-number">
              <text class="step-num-text">01</text>
            </view>
            <view class="step-connector-line" v-if="!talentDone">
              <view class="connector-dot"></view>
            </view>
          </view>
          <view class="step-body">
            <view class="step-header">
              <text class="step-icon-label">🧠</text>
              <text class="step-name">天赋罗盘</text>
              <view class="step-badge" v-if="talentDone">已完成</view>
            </view>
            <text class="step-desc">了解你天生擅长什么，发现核心优势维度</text>
            <view class="step-meta-row">
              <text class="step-meta">10 维度</text>
              <text class="step-meta-divider">·</text>
              <text class="step-meta">26 题</text>
              <text class="step-meta-divider">·</text>
              <text class="step-meta">≈ 15 分钟</text>
            </view>
          </view>
          <view class="step-action">
            <view class="step-btn" :class="talentDone ? 'btn-outline-style' : 'btn-primary-style'">
              <text>{{ talentDone ? '重新测评' : '开始测评' }}</text>
              <text class="step-btn-arrow">→</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ❷ 霍兰德 -->
      <view class="step-card-wrapper" :class="{ locked: !talentDone, done: hollandDone }">
        <view class="step-card" @click="startHolland">
          <view class="step-card-glow accent-glow"></view>
          <view class="step-number-area">
            <view class="step-number step-number-accent">
              <text class="step-num-text">02</text>
            </view>
            <view class="step-connector-line" v-if="talentDone && !hollandDone">
              <view class="connector-dot"></view>
            </view>
          </view>
          <view class="step-body">
            <view class="step-header">
              <text class="step-icon-label">💼</text>
              <text class="step-name">霍兰德职业兴趣</text>
              <view class="step-badge badge-locked" v-if="!talentDone">🔒 待解锁</view>
              <view class="step-badge" v-else-if="hollandDone">已完成</view>
            </view>
            <text class="step-desc">了解你真正喜欢做什么，匹配职业类型</text>
            <view class="step-meta-row">
              <text class="step-meta">6 类型</text>
              <text class="step-meta-divider">·</text>
              <text class="step-meta">30 题</text>
              <text class="step-meta-divider">·</text>
              <text class="step-meta">≈ 10 分钟</text>
            </view>
          </view>
          <view class="step-action">
            <view v-if="!talentDone" class="step-btn btn-disabled-style">
              <text>🔒 待解锁</text>
            </view>
            <view v-else class="step-btn" :class="hollandDone ? 'btn-outline-style' : 'btn-primary-style'">
              <text>{{ hollandDone ? '重新测评' : '开始测评' }}</text>
              <text class="step-btn-arrow">→</text>
            </view>
          </view>
        </view>
      </view>

      <!-- ❸ 综合推荐 -->
      <view class="step-card-wrapper result-wrapper" :class="{ locked: !bothDone, done: bothDone }">
        <view class="step-card result-card-style" @click="viewResult">
          <view class="step-result-bg"></view>
          <view class="step-number-area">
            <view class="step-number step-number-result">
              <text class="step-num-text">🎯</text>
            </view>
          </view>
          <view class="step-body">
            <view class="step-header">
              <text class="step-icon-label">✨</text>
              <text class="step-name">综合职业推荐</text>
              <view class="step-badge badge-gold" v-if="!bothDone">🔒 待解锁</view>
              <view class="step-badge badge-gold" v-else>可查看</view>
            </view>
            <text class="step-desc">基于能力 + 兴趣的双维精准匹配</text>
            <view class="step-meta-row">
              <text class="step-meta">AI 智能匹配</text>
              <text class="step-meta-divider">·</text>
              <text class="step-meta">行业标杆</text>
              <text class="step-meta-divider">·</text>
              <text class="step-meta">职业轨迹</text>
            </view>
          </view>
          <view class="step-action">
            <view v-if="!bothDone" class="step-btn btn-disabled-style">
              <text>🔒 待解锁</text>
            </view>
            <view v-else class="step-btn btn-gold-style">
              <text>查看推荐</text>
              <text class="step-btn-arrow">→</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 阶段总结弹窗 -->
    <view class="stage-summary-mask" v-if="showStageSummary" @click="closeStageSummary">
      <view class="stage-summary-modal" @click.stop>
        <view class="stage-confetti">
          <text class="confetti-piece">🎉</text>
          <text class="confetti-piece">🎊</text>
          <text class="confetti-piece">✨</text>
        </view>
        <text class="stage-icon-main">🎉</text>
        <text class="stage-title">{{ stageTestName }}</text>
        <text class="stage-subtitle">测评已完成！</text>

        <view class="stage-scores">
          <text class="stage-scores-label">📊 你的优势维度</text>
          <view class="stage-dims">
            <text
              v-for="(d, i) in stageTopDims"
              :key="d.key"
              class="stage-dim-badge"
              :class="'dim-rank-' + (i + 1)"
            >{{ d.name }} {{ d.pct }}%</text>
          </view>
        </view>

        <text class="stage-summary-text">{{ stageSummaryText }}</text>

        <view class="stage-cta" @click="goToNextTest">
          <text class="stage-cta-text">{{ stageNextTestName }}</text>
          <text class="stage-cta-arrow">→</text>
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
import { mockTalentQuestions, mockHollandQuestions } from '@/data/mock/test'

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
      : mockHollandQuestions
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
    // 霍兰德完成后，直接跳转综合推荐
    smartNavigate('/pages/report/index?testId=test_combined&resultId=local')
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
  smartNavigate('/pages/report/index?testId=test_combined&resultId=local')
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.page-index {
  min-height: 100vh;
  background: $gradient-hero;
  padding-bottom: 60rpx;
  overflow: hidden;
}

/* ═══ Hero Section ═══ */
.hero {
  position: relative;
  padding: 100rpx 40rpx 56rpx;
  text-align: center;
  overflow: hidden;
  background: $gradient-primary;
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60rpx);
  opacity: 0.3;
  pointer-events: none;
}

.hero-glow-1 {
  width: 300rpx;
  height: 300rpx;
  background: rgba(139, 92, 246, 0.4);
  top: -60rpx;
  right: -40rpx;
}

.hero-glow-2 {
  width: 240rpx;
  height: 240rpx;
  background: rgba(99, 102, 241, 0.35);
  bottom: 20rpx;
  left: -50rpx;
}

.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.deco-dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.deco-dot-1 {
  width: 16rpx;
  height: 16rpx;
  top: 40rpx;
  left: 48rpx;
}

.deco-dot-2 {
  width: 12rpx;
  height: 12rpx;
  top: 80rpx;
  right: 72rpx;
}

.deco-dot-3 {
  width: 10rpx;
  height: 10rpx;
  bottom: 48rpx;
  left: 120rpx;
}

.deco-ring {
  position: absolute;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.12);
  bottom: -40rpx;
  right: -20rpx;
}

.hero-brand {
  display: block;
  font-size: 22rpx;
  font-weight: $font-weight-semibold;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 8rpx;
  text-transform: uppercase;
  margin-bottom: 20rpx;
  position: relative;
}

.hero-title {
  display: block;
  font-size: 52rpx;
  font-weight: $font-weight-bold;
  color: #fff;
  margin-bottom: 16rpx;
  letter-spacing: $letter-spacing-title;
  line-height: $line-height-tight;
  position: relative;
}

.hero-subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.78);
  line-height: $line-height-relaxed;
  position: relative;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: $spacing-lg;
  margin-top: 32rpx;
  position: relative;
}

.hero-stat {
  @include glass-dark;
  border-radius: $radius-xl;
  padding: 16rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.hero-stat-icon {
  font-size: 28rpx;
}

.hero-stat-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: $font-weight-medium;
}

/* ═══ Steps Container ═══ */
.steps {
  padding: 0 $spacing-lg;
  margin-top: -20rpx;
  position: relative;
  z-index: 1;
}

.step-card-wrapper {
  margin-bottom: 20rpx;
}

/* Step Card */
.step-card {
  position: relative;
  background: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  display: flex;
  align-items: center;
  box-shadow: $shadow-lg;
  transition: all $transition-smooth;
  overflow: hidden;

  &:active {
    transform: scale(0.985);
    box-shadow: $shadow-md;
  }
}

.step-card-glow {
  position: absolute;
  top: -20rpx;
  right: -20rpx;
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
  pointer-events: none;
}

.accent-glow {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%);
}

.step-card-wrapper.locked .step-card {
  opacity: 0.5;
  filter: grayscale(20%);
}

.step-card-wrapper.done .step-card {
  border: 2rpx solid $success-light;
}

.result-wrapper .step-card {
  background: linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 50%, #FFF7ED 100%);
}

.result-wrapper.locked .step-card {
  background: #fff;
  opacity: 0.5;
}

.step-result-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(239, 68, 68, 0.04) 0%, transparent 50%);
  pointer-events: none;
}

/* Number Area */
.step-number-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: $spacing-md;
  flex-shrink: 0;
}

.step-number {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-lg;
  background: $gradient-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-glow;
}

.step-number-accent {
  background: $gradient-primary-soft;
}

.step-number-result {
  background: $gradient-warm;
  box-shadow: 0 4rpx 24rpx rgba(244, 63, 94, 0.2);
}

.step-num-text {
  font-size: 28rpx;
  font-weight: $font-weight-bold;
  color: #fff;
}

.step-connector-line {
  width: 2rpx;
  flex: 1;
  min-height: 28rpx;
  background: linear-gradient(180deg, $primary-lighter 0%, transparent 100%);
  position: relative;
  margin: 4rpx 0;
}

.connector-dot {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: $primary-light;
}

/* Step Body */
.step-body {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 6rpx;
}

.step-icon-label {
  font-size: 28rpx;
  flex-shrink: 0;
}

.step-name {
  font-size: 30rpx;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  letter-spacing: 0.01em;
}

.step-badge {
  @include badge($success-lightest, #047857);
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  margin-left: auto;
}

.badge-locked {
  @include badge(#F3F4F6, #6B7280);
}

.badge-gold {
  @include badge($warning-lightest, #B45309);
}

.step-desc {
  font-size: 24rpx;
  color: $text-secondary;
  display: block;
  margin-bottom: 8rpx;
  line-height: $line-height-relaxed;
}

.step-meta-row {
  display: flex;
  align-items: center;
}

.step-meta {
  font-size: 22rpx;
  color: $text-hint;
  font-weight: $font-weight-normal;
}

.step-meta-divider {
  font-size: 20rpx;
  color: $text-disabled;
  margin: 0 8rpx;
}

/* Step Action */
.step-action {
  flex-shrink: 0;
  margin-left: $spacing-sm;
}

.step-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 14rpx 28rpx;
  border-radius: $radius-full;
  font-size: 24rpx;
  font-weight: $font-weight-medium;
  white-space: nowrap;
  transition: all $transition-base;
}

.step-btn-arrow {
  font-size: 22rpx;
  transition: transform $transition-base;
}

.step-btn:active .step-btn-arrow {
  transform: translateX(4rpx);
}

.btn-primary-style {
  background: $gradient-primary;
  color: #fff;
  box-shadow: $shadow-glow;

  &:active {
    opacity: 0.85;
  }
}

.btn-outline-style {
  background: $primary-lightest;
  color: $primary-color;
}

.btn-disabled-style {
  background: #F3F4F6;
  color: $text-disabled;
}

.btn-gold-style {
  background: $gradient-warm;
  color: #fff;
  box-shadow: 0 4rpx 20rpx rgba(244, 63, 94, 0.2);

  &:active {
    opacity: 0.85;
  }
}

/* ═══ Stage Summary Modal ═══ */
.stage-summary-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.25s ease;
}

.stage-summary-modal {
  width: 620rpx;
  background: #fff;
  border-radius: $radius-2xl;
  padding: $spacing-xl 44rpx 44rpx;
  text-align: center;
  box-shadow: $shadow-xl;
  animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.stage-confetti {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-bottom: 8rpx;
}

.confetti-piece {
  font-size: 40rpx;
  animation: float 2s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.3s;
  }
  &:nth-child(3) {
    animation-delay: 0.6s;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8rpx) rotate(8deg); }
}

.stage-icon-main {
  font-size: 72rpx;
  display: block;
  margin-bottom: 12rpx;
}

.stage-title {
  font-size: 36rpx;
  font-weight: $font-weight-bold;
  color: $text-primary;
  display: block;
  margin-bottom: 4rpx;
}

.stage-subtitle {
  font-size: 26rpx;
  color: $success-color;
  font-weight: $font-weight-medium;
  display: block;
  margin-bottom: $spacing-lg;
}

.stage-scores {
  background: linear-gradient(135deg, #F0F4FF, #EDE9FE);
  border-radius: $radius-md;
  padding: 24rpx;
  margin-bottom: $spacing-md;
}

.stage-scores-label {
  font-size: 26rpx;
  color: $primary-color;
  font-weight: $font-weight-semibold;
  display: block;
  margin-bottom: 18rpx;
}

.stage-dims {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.stage-dim-badge {
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  border-radius: $radius-full;
  font-weight: $font-weight-medium;

  &.dim-rank-1 {
    background: $gradient-primary;
    color: #fff;
  }
  &.dim-rank-2 {
    background: $primary-lightest;
    color: $primary-dark;
  }
  &.dim-rank-3 {
    background: $accent-lightest;
    color: $accent-color;
  }
}

.stage-summary-text {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: $line-height-relaxed;
  display: block;
  margin-bottom: $spacing-lg;
}

.stage-cta {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  background: $gradient-primary;
  color: #fff;
  padding: 22rpx 56rpx;
  border-radius: $radius-full;
  box-shadow: $shadow-glow;
  transition: all $transition-base;
}

.stage-cta-text {
  font-size: 28rpx;
  font-weight: $font-weight-medium;
}

.stage-cta-arrow {
  font-size: 26rpx;
  transition: transform $transition-base;
}

.stage-cta:active {
  opacity: 0.85;
}

.stage-cta:active .stage-cta-arrow {
  transform: translateX(4rpx);
}

.stage-skip {
  font-size: 24rpx;
  color: $text-hint;
  display: block;
  margin-top: 24rpx;
  padding: 8rpx;
}

/* Global keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40rpx) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
