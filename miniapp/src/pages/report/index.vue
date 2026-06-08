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
      <view class="section-title">🎯 职业方向推荐</view>
      <view class="career-list" v-if="careerMatches.length > 0">
        <view class="career-item" v-for="career in careerMatches" :key="career.careerId" @click="viewCareerDetail(career.careerName)">
          <view class="career-info">
            <text class="career-name">{{ career.careerName }}</text>
            <text class="career-reason">{{ career.reason }}</text>
          </view>
          <view class="career-right">
            <view class="career-match">
              <text class="match-score">{{ career.matchScore }}%</text>
              <text class="match-label">匹配</text>
            </view>
            <text class="career-arrow">›</text>
          </view>
        </view>
      </view>
      <view class="career-hint" v-if="careerMatches.length > 0">
        <text>👆 点击职业查看成功人物与职业轨迹</text>
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
  padding-bottom: 40rpx;
}

.report-header {
  background: linear-gradient(135deg, #4A90D9, #7AB8F5);
  padding: 48rpx 32rpx;
  color: #fff;

  .report-badge {
    background: rgba(255,255,255,0.2);
    display: inline-block;
    padding: 8rpx 24rpx;
    border-radius: 20rpx;
    margin-bottom: 16rpx;

    .badge-text {
      font-size: 24rpx;
    }
  }

  .report-test-name {
    font-size: 40rpx;
    font-weight: 700;
    display: block;
    margin-bottom: 8rpx;
  }

  .report-date {
    font-size: 24rpx;
    opacity: 0.8;
  }
}

.score-summary {
  background: #fff;
  margin: -24rpx 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: $shadow;
  position: relative;
  z-index: 1;

  .summary-title {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 24rpx;
  }
}

.dimension-item {
  margin-bottom: 20rpx;

  .dimension-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8rpx;
  }

  .dimension-name {
    font-size: 26rpx;
    color: $text-secondary;
  }

  .dimension-score {
    font-size: 26rpx;
    font-weight: 600;

    &.level-high { color: $success-color; }
    &.level-medium { color: $warning-color; }
    &.level-low { color: $error-color; }
  }
}

.dimension-bar {
  height: 12rpx;
  background: #F0F0F0;
  border-radius: 6rpx;
  overflow: hidden;

  .bar-inner {
    height: 100%;
    border-radius: 6rpx;
    transition: width 0.5s ease;

    &.level-high { background: $success-color; }
    &.level-medium { background: $warning-color; }
    &.level-low { background: #E0E0E0; }
  }
}

.report-section {
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: $shadow;

  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 20rpx;
  }
}

.summary-card {
  background: #F8F9FA;
  border-radius: 12rpx;
  padding: 24rpx;

  .summary-text {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.8;
  }
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;

  .suggestion-dot {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: #E3F2FD;
    color: $primary-color;
    font-size: 22rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16rpx;
    flex-shrink: 0;
  }

  .suggestion-text {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.career-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F0F0F0;

  &:last-child { border-bottom: none; }

  .career-info {
    flex: 1;
    margin-right: 20rpx;
    min-width: 0;

    .career-name {
      font-size: 28rpx;
      font-weight: 500;
      display: block;
      margin-bottom: 4rpx;
    }

    .career-reason {
      font-size: 22rpx;
      color: $text-hint;
    }
  }

  .career-right {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .career-match {
    text-align: center;
    margin-right: 12rpx;

    .match-score {
      font-size: 36rpx;
      font-weight: 700;
      color: $primary-color;
      display: block;
    }

    .match-label {
      font-size: 20rpx;
      color: $text-hint;
    }
  }

  .career-arrow {
    font-size: 40rpx;
    color: #CCC;
    font-weight: 300;
  }
}

.career-hint {
  text-align: center;
  margin-top: 24rpx;

  text {
    font-size: 22rpx;
    color: $text-hint;
  }
}

.bottom-actions {
  display: flex;
  gap: 24rpx;
  padding: 0 24rpx;

  .action-btn {
    flex: 1;
    text-align: center;
    padding: 24rpx;
    border-radius: 48rpx;
    font-size: 28rpx;
    font-weight: 500;
    line-height: 1;
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
    border: 2rpx solid $primary-color;
  }

  .plan-btn {
    background: linear-gradient(135deg, $primary-color, $primary-light);
    color: #fff;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;

  .empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }

  .empty-title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 12rpx;
  }

  .empty-desc {
    font-size: 26rpx;
    color: $text-hint;
    margin-bottom: 40rpx;
  }

  .go-test-btn {
    background: $primary-color;
    color: #fff;
    padding: 20rpx 64rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
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
