<template>
  <view class="page-report">
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
        <view class="career-item" v-for="career in careerMatches" :key="career.careerId">
          <view class="career-info">
            <text class="career-name">{{ career.careerName }}</text>
            <text class="career-reason">{{ career.reason }}</text>
          </view>
          <view class="career-match">
            <text class="match-score">{{ career.matchScore }}%</text>
            <text class="match-label">匹配度</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <view class="action-btn share-btn">分享报告</view>
      <view class="action-btn plan-btn" @click="goToPlan">制定成长计划</view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!hasData">
      <text class="empty-icon">📋</text>
      <text class="empty-title">暂无测评报告</text>
      <text class="empty-desc">完成测评后，你的报告将在这里展示</text>
      <view class="go-test-btn" @click="goToTest">去测评</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { mockTalentReport } from '@/data/mock'

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

onLoad((options: any) => {
  const testId = options?.testId || ''
  if (testId) {
    loadReport()
  }
})

onMounted(() => {
  // 没有 testId 时显示历史报告列表（暂用模拟数据演示）
  if (!testName.value) {
    loadReport()
  }
})

function loadReport() {
  // TODO: 替换为真实云函数调用
  const data = mockTalentReport
  testName.value = data.testName
  completedDate.value = data.completedDate
  dimensionScores.value = data.dimensionScores
  summary.value = data.summary
  suggestions.value = data.suggestions
  careerMatches.value = data.careerMatches
  hasData.value = true
}

function goToTest() {
  uni.switchTab({ url: '/pages/test/index' })
}

function goToPlan() {
  uni.switchTab({ url: '/pages/plan/index' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

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

  .career-match {
    text-align: center;

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
  }

  .share-btn {
    background: #F0F0F0;
    color: $text-secondary;
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
