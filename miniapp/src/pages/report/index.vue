<template>
  <view class="page-report">
    <!-- 空状态 -->
    <view class="empty-state" v-if="!hasData">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无测评报告</text>
      <text class="empty-hint">完成一次测评后即可查看报告</text>
    </view>

    <!-- 数据不完整提示 -->
    <view class="empty-state" v-else-if="hasData && !hasMeaningfulScores">
      <text class="empty-icon">⚠️</text>
      <text class="empty-text">测评数据不完整</text>
      <text class="empty-hint">请重新完成测评后再查看报告</text>
      <view class="go-test-btn" @click="goToTest">去测评</view>
    </view>

    <!-- 报告内容 -->
    <template v-else>
    <!-- 报告头部 -->
    <view class="report-header">
      <view class="report-badge">
        <text class="badge-text">测评报告</text>
      </view>
      <text class="report-test-name">{{ testName }}</text>
      <text class="report-date">{{ completedDate }}</text>
    </view>

    <!-- 维度得分概览 -->
    <view class="score-summary">
      <view class="summary-title">维度得分总览</view>
      <view class="dimension-list">
        <view class="dimension-item" v-for="item in dimensionScores" :key="item.key">
          <view class="dimension-header">
            <text class="dimension-name">{{ item.name }}</text>
            <text class="dimension-score" :class="'level-' + item.level">
              {{ item.percentage }}%
            </text>
          </view>
          <view class="dimension-bar">
            <view class="bar-inner" :class="'level-' + item.level" :style="{ width: item.percentage + '%' }"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 总结与建议 -->
    <view class="report-section">
      <view class="section-title">📝 测评总结</view>
      <view class="summary-card">
        <text class="summary-text">{{ summary }}</text>
      </view>
    </view>

    <view class="report-section">
      <view class="section-title">💡 发展建议</view>
      <view class="suggestion-list">
        <view class="suggestion-item" v-for="(s, idx) in suggestions" :key="idx">
          <view class="suggestion-dot">{{ idx + 1 }}</view>
          <text class="suggestion-text">{{ s }}</text>
        </view>
      </view>
    </view>

    <view class="report-section">
      <view class="section-title">
        <text>🎯 职业方向推荐</text>
        <text class="section-subtitle">点击卡片查看行业成功人物与职业轨迹</text>
      </view>
      <view class="career-list" v-if="careerMatches.length > 0">
        <view class="career-item" v-for="career in careerMatches" :key="career.careerId" @click="viewCareerDetail(career.careerName)">
          <view class="career-top">
            <view class="career-info">
              <text class="career-name">{{ career.careerName }}</text>
              <text class="career-reason">{{ career.reason }}</text>
            </view>
            <view class="career-match">
              <text class="match-score">{{ career.matchScore }}%</text>
              <text class="match-label">匹配</text>
            </view>
          </view>
          <view class="career-bottom">
            <view class="career-model-btn">
              <text class="model-btn-icon">🌟</text>
              <text class="model-btn-text">查看行业标杆</text>
              <text class="model-btn-arrow">→</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="share-wrapper" open-type="share" hover-class="none">
        <view class="action-btn share-btn">分享报告</view>
      </button>
      <view class="action-btn plan-btn" @click="goToPlan">制定成长计划</view>
    </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { generateReport } from '@/api'
import { computeDimensionScores } from '@/utils/scoring'
import { careerMatch, combineScores } from '@/utils/careerMatch'
import { generateReportSummary, generateSuggestions, dimName } from '@/utils/summary'
import { mockTalentQuestions, mockHollandQuestions, type MockQuestion } from '@/data/mock/test'

interface DimensionScoreItem {
  key: string; name: string; percentage: number; level: string
}

interface CareerMatchItem {
  careerId: string; careerName: string; matchScore: number; reason: string
}

const testName = ref('')
const completedDate = ref('')
const dimensionScores = ref<DimensionScoreItem[]>([])
const summary = ref('')
const suggestions = ref<string[]>([])
const careerMatches = ref<CareerMatchItem[]>([])
const hasData = ref(false)

const hasMeaningfulScores = computed(() => {
  return dimensionScores.value.length > 0 && dimensionScores.value.some(d => d.percentage > 0)
})

const testId = ref('')
const resultId = ref('')

onLoad((options: any) => {
  testId.value = options?.testId || ''
  resultId.value = options?.resultId || ''
  if (testId.value) {
    loadReport()
  }
})

function applyReportData(data: {
  testName: string
  completedDate: string
  dimensionScores: DimensionScoreItem[]
  summary: string
  suggestions: string[]
  careerMatches: CareerMatchItem[]
}) {
  testName.value = data.testName
  completedDate.value = data.completedDate
  dimensionScores.value = data.dimensionScores
  summary.value = data.summary
  suggestions.value = data.suggestions
  careerMatches.value = data.careerMatches
  hasData.value = true
}

/** 根据 testId 获取题目集 */
function getQuestionsForTest(testIdVal: string): MockQuestion[] {
  if (testIdVal === 'test_holland') return mockHollandQuestions
  return mockTalentQuestions
}

/** Determine test type string for careerMatch */
function getTestType(testIdVal: string): 'talent' | 'holland' | 'combined' {
  if (testIdVal === 'test_holland') return 'holland'
  if (testIdVal === 'test_combined') return 'combined'
  return 'talent'
}

/**
 * Offline pipeline: compute real scores + matches + summary from stored answers.
 * Returns null if no answers are available.
 */
function computeOfflineReport(testIdVal: string): {
  dimensionScores: DimensionScoreItem[]
  summary: string
  suggestions: string[]
  careerMatches: CareerMatchItem[]
} | null {
  try {
    if (testIdVal === 'test_combined') {
      // Combined mode: read both talent and holland answers
      const rawTalentAnswers = uni.getStorageSync('lastAnswers')
      const rawTalentTestId = uni.getStorageSync('lastTalentTestId') || uni.getStorageSync('lastTestId')
      const rawHollandAnswers = uni.getStorageSync('lastHollandAnswers')
      const rawHollandTestId = uni.getStorageSync('lastHollandTestId')

      if (!rawTalentAnswers || !rawHollandAnswers) return null

      const talentAnswers = JSON.parse(rawTalentAnswers)
      const hollandAnswers = JSON.parse(rawHollandAnswers)
      const talentQs = getQuestionsForTest(rawTalentTestId || 'test_talent_compass')
      const hollandQs = getQuestionsForTest(rawHollandTestId || 'test_holland')

      const talentScores = computeDimensionScores(talentAnswers, talentQs, { normalize: true })
      const hollandScores = computeDimensionScores(hollandAnswers, hollandQs, { normalize: true })
      const combined = combineScores(talentScores, hollandScores)

      // Defensive: check if all scores are zero, which indicates a data mismatch
      const allZero = Object.values(combined).every(v => v === 0)
      if (allZero) {
        console.error('[report] 综合评分全为零！可能原因：')
        console.error('  - talentAnswers keys:', JSON.stringify(Object.keys(talentAnswers).slice(0, 5)))
        console.error('  - talentQs IDs:', JSON.stringify(talentQs.slice(0, 3).map(q => q.id)))
        console.error('  - hollandAnswers keys:', JSON.stringify(Object.keys(hollandAnswers).slice(0, 5)))
        console.error('  - hollandQs IDs:', JSON.stringify(hollandQs.slice(0, 3).map(q => q.id)))
        console.error('  - talentScores:', JSON.stringify(talentScores))
        console.error('  - hollandScores:', JSON.stringify(hollandScores))
      }

      const matches = careerMatch(combined, 'combined', 5)
      const dimList = buildDimensionList(combined)
      const summary = generateReportSummary(combined, matches)
      const suggestions = generateSuggestions(combined, matches)

      return { dimensionScores: dimList, summary, suggestions, careerMatches: matches }
    }

    // Single test mode: read answers from storage
    const rawAnswers = uni.getStorageSync('lastAnswers')
    const storedTestId = uni.getStorageSync('lastTestId')
    if (!rawAnswers || storedTestId !== testIdVal) return null

    const answers = JSON.parse(rawAnswers)
    const questions = getQuestionsForTest(testIdVal)
    const scores = computeDimensionScores(answers, questions, { normalize: true })
    const testType = getTestType(testIdVal)

    console.log('[report] testIdVal=', testIdVal, 'testType=', testType)
    console.log('[report] computed scores:', JSON.stringify(scores))

    // Defensive: check if all scores are zero
    const allZero = Object.values(scores).every(v => v === 0)
    if (allZero) {
      console.error('[report] 单测评分全为零！可能原因：')
      console.error('  - answers keys:', JSON.stringify(Object.keys(answers).slice(0, 5)))
      console.error('  - questions IDs:', JSON.stringify(questions.slice(0, 3).map(q => q.id)))
    }

    const matches = careerMatch(scores, testType, 5)
    const dimList = buildDimensionList(scores)
    const summary = generateReportSummary(scores, matches)
    const suggestions = generateSuggestions(scores, matches)

    return { dimensionScores: dimList, summary, suggestions, careerMatches: matches }
  } catch (e) {
    console.error('离线报告计算失败', e)
    return null
  }
}

/** Build dimension score items list from a score map. */
function buildDimensionList(scores: Record<string, number>): DimensionScoreItem[] {
  return Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, pct]) => {
      let level = 'low'
      if (pct >= 70) level = 'high'
      else if (pct >= 40) level = 'medium'
      return { key, name: dimName(key), percentage: Math.round(pct), level }
    })
}

async function loadReport() {
  // 尝试从云端加载报告
  try {
    const res = await generateReport(resultId.value)
    if (res.code === 0 && res.data) {
      applyReportData({
        testName: res.data.testName,
        completedDate: new Date(res.data.completedAt || Date.now()).toLocaleDateString('zh-CN'),
        dimensionScores: res.data.scores || [],
        summary: res.data.summary || '',
        suggestions: res.data.suggestions || [],
        careerMatches: res.data.careerMatches || [],
      })
      return
    }
  } catch (e) {
    console.error('加载报告失败，使用离线计算', e)
  }

  // 离线 fallback：根据存储的答案实时计算
  const offline = computeOfflineReport(testId.value)
  if (offline) {
    const testNameMap: Record<string, string> = {
      test_talent_compass: '天赋罗盘测试',
      test_holland: '霍兰德职业兴趣测试',
      test_combined: '综合职业推荐',
    }
    applyReportData({
      testName: testNameMap[testId.value] || '测评报告',
      completedDate: new Date().toLocaleDateString('zh-CN'),
      dimensionScores: offline.dimensionScores,
      summary: offline.summary,
      suggestions: offline.suggestions,
      careerMatches: offline.careerMatches,
    })
  }
}

function goToTest() {
  uni.switchTab({ url: '/pages/test/index' })
}

function viewCareerDetail(careerName: string) {
  uni.navigateTo({ url: `/pages/career/detail?careerName=${encodeURIComponent(careerName)}` })
}

function goToPlan() {
  uni.switchTab({ url: '/pages/plan/index' })
}

// 微信小程序分享配置
onShareAppMessage(() => {
  return {
    title: `我的${testName.value}测评报告`,
    path: `/pages/report/index?testId=${testId.value}&resultId=${resultId.value}`,
  }
})
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.page-report {
  padding-bottom: 60rpx;
  min-height: 100vh;
  background: $gradient-hero;
}

/* ═══ Empty State ═══ */
.empty-state {
  @extend .empty-state-base;

  .empty-icon { font-size: 96rpx; margin-bottom: 28rpx; }
  .empty-text {
    font-size: 32rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    display: block;
    margin-bottom: 12rpx;
  }
  .empty-hint {
    font-size: 26rpx;
    color: $text-hint;
    display: block;
    margin-bottom: 44rpx;
  }
  .empty-title {
    font-size: 32rpx;
    font-weight: $font-weight-semibold;
    margin-bottom: 12rpx;
  }
  .empty-desc {
    font-size: 26rpx;
    color: $text-hint;
    margin-bottom: 40rpx;
  }

  .go-test-btn {
    background: $gradient-primary;
    color: #fff;
    padding: 22rpx 72rpx;
    border-radius: $radius-full;
    font-size: 28rpx;
    font-weight: $font-weight-medium;
    box-shadow: $shadow-glow;
  }
}

/* ═══ Report Header ═══ */
.report-header {
  background: $gradient-primary;
  padding: 52rpx $spacing-lg 44rpx;
  color: #fff;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -40rpx;
    right: -40rpx;
    width: 200rpx;
    height: 200rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    pointer-events: none;
  }

  .report-badge {
    @include glass-dark;
    display: inline-block;
    padding: 8rpx 24rpx;
    border-radius: $radius-full;
    margin-bottom: 16rpx;

    .badge-text {
      font-size: 24rpx;
      font-weight: $font-weight-medium;
    }
  }

  .report-test-name {
    font-size: 42rpx;
    font-weight: $font-weight-bold;
    display: block;
    margin-bottom: 8rpx;
    letter-spacing: 0.01em;
    position: relative;
  }

  .report-date {
    font-size: 24rpx;
    opacity: 0.8;
    position: relative;
  }
}

/* ═══ Score Summary ═══ */
.score-summary {
  @include glass;
  margin: -28rpx $spacing-md $spacing-md;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-lg;
  position: relative;
  z-index: 1;

  .summary-title {
    font-size: 30rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: 28rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;

    &::before {
      content: '📊';
      font-size: 28rpx;
    }
  }
}

/* ═══ Dimension Item ═══ */
.dimension-item {
  margin-bottom: 22rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .dimension-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 10rpx;
  }

  .dimension-name {
    font-size: 26rpx;
    color: $text-secondary;
    font-weight: $font-weight-medium;
  }

  .dimension-score {
    font-size: 26rpx;
    font-weight: $font-weight-bold;
    letter-spacing: 0.02em;

    &.level-high { color: #059669; }
    &.level-medium { color: #D97706; }
    &.level-low { color: #DC2626; }
  }
}

.dimension-bar {
  height: 14rpx;
  background: #F3F4F6;
  border-radius: 7rpx;
  overflow: hidden;

  .bar-inner {
    height: 100%;
    border-radius: 7rpx;
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;

    &.level-high {
      background: $gradient-success;
      box-shadow: 0 2rpx 8rpx rgba(16, 185, 129, 0.3);
    }
    &.level-medium {
      background: $gradient-warning;
      box-shadow: 0 2rpx 8rpx rgba(245, 158, 11, 0.3);
    }
    &.level-low {
      background: linear-gradient(90deg, #D1D5DB, #9CA3AF);
    }
  }
}

/* ═══ Report Section ═══ */
.report-section {
  background: $card-bg;
  margin: 0 $spacing-md $spacing-md;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-md;

  .section-title {
    font-size: 30rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: 10rpx;
    display: flex;
    flex-direction: column;
    letter-spacing: 0.01em;
  }

  .section-subtitle {
    font-size: 22rpx;
    color: $primary-color;
    font-weight: $font-weight-normal;
    margin-top: 4rpx;
    margin-bottom: 20rpx;
  }
}

/* ═══ Summary Card ═══ */
.summary-card {
  background: linear-gradient(135deg, #F0F4FF, #EDE9FE);
  border-radius: $radius-md;
  padding: 28rpx;
  border-left: 4rpx solid $primary-color;

  .summary-text {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: $line-height-relaxed;
  }
}

/* ═══ Suggestions ═══ */
.suggestion-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 18rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .suggestion-dot {
    width: 44rpx;
    height: 44rpx;
    border-radius: $radius-sm;
    background: $gradient-primary-soft;
    color: #fff;
    font-size: 22rpx;
    font-weight: $font-weight-bold;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 18rpx;
    flex-shrink: 0;
    box-shadow: $shadow-glow;
  }

  .suggestion-text {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: $line-height-relaxed;
    flex: 1;
    min-width: 0;
  }
}

/* ═══ Career List ═══ */
.career-item {
  background: linear-gradient(135deg, #FAFBFF, #F5F3FF);
  border-radius: $radius-md;
  padding: 26rpx;
  margin-bottom: 16rpx;
  border: 1rpx solid #E8ECF8;
  transition: all $transition-base;

  &:last-child { margin-bottom: 0; }

  &:active {
    border-color: $primary-lighter;
    box-shadow: $shadow-glow;
    transform: scale(0.985);
  }

  .career-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 18rpx;
  }

  .career-info {
    flex: 1;
    margin-right: 24rpx;
    min-width: 0;

    .career-name {
      font-size: 28rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      display: block;
      margin-bottom: 4rpx;
    }

    .career-reason {
      font-size: 22rpx;
      color: $text-hint;
      line-height: 1.5;
    }
  }

  .career-match {
    text-align: center;
    flex-shrink: 0;

    .match-score {
      font-size: 36rpx;
      font-weight: $font-weight-bold;
      background: $gradient-primary;
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      display: block;
    }

    .match-label {
      font-size: 20rpx;
      color: $text-hint;
    }
  }

  .career-bottom {
    display: flex;
    justify-content: flex-end;
    padding-top: 16rpx;
    border-top: 1rpx dashed #DDE4F0;
  }

  .career-model-btn {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #FEF9C3, #FEF3C7);
    border: 1rpx solid #FCD34D;
    border-radius: $radius-full;
    padding: 10rpx 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(251, 191, 36, 0.12);

    .model-btn-icon {
      font-size: 24rpx;
      margin-right: 6rpx;
    }

    .model-btn-text {
      font-size: 24rpx;
      color: #B45309;
      font-weight: $font-weight-medium;
    }

    .model-btn-arrow {
      font-size: 22rpx;
      color: #D97706;
      margin-left: 6rpx;
    }
  }
}

/* ═══ Bottom Actions ═══ */
.bottom-actions {
  display: flex;
  gap: 24rpx;
  padding: 0 $spacing-md;

  .action-btn {
    flex: 1;
    text-align: center;
    padding: 24rpx;
    border-radius: $radius-full;
    font-size: 28rpx;
    font-weight: $font-weight-medium;
    line-height: 1;
    transition: all $transition-base;

    &:active {
      transform: scale(0.97);
    }
  }

  .action-btn::after {
    border: none;
  }

  .share-wrapper {
    flex: 1;
    padding: 0;
    margin: 0;
    background: transparent;
    border: none;
    line-height: 1;
    font-size: inherit;
    border-radius: 0;
    display: block;
  }

  .share-wrapper::after {
    border: none;
  }

  .share-btn {
    background: #fff;
    color: $primary-color;
    border: 2rpx solid $primary-lighter;

    &:active {
      background: $primary-lightest;
    }
  }

  .plan-btn {
    background: $gradient-primary;
    color: #fff;
    box-shadow: $shadow-glow;

    &:active {
      opacity: 0.85;
    }
  }
}
</style>

<!-- 非 scoped：重置微信 button 默认样式 -->
<style>
.share-wrapper {
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  line-height: 1 !important;
  min-height: auto !important;
  border-radius: 0 !important;
  text-align: left !important;
}

.share-wrapper::after {
  border: none !important;
  display: none !important;
}

.share-wrapper .share-btn {
  display: block;
  width: 100%;
}
</style>
