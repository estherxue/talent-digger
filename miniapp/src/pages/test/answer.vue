<template>
  <view class="page-answer">
    <!-- 测试标题 -->
    <view class="test-header">
      <text class="test-title">{{ testName }}</text>
    </view>

    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-inner" :style="{ width: progressPercent + '%' }"></view>
    </view>

    <!-- 题目区域 -->
    <view class="question-area" v-if="currentQuestion">
      <view class="question-number">
        <text class="current">{{ currentIndex + 1 }}</text>
        <text class="total">/ {{ totalQuestions }}</text>
      </view>
      
      <view class="question-content">
        <text class="question-text">{{ currentQuestion.content }}</text>
      </view>

      <!-- 选项 -->
      <view class="options-list" :key="currentQuestion.id">
        <view
          v-for="(option, idx) in currentQuestion.options"
          :key="currentQuestion.id + '-' + idx"
          class="option-item"
          :class="{ selected: selectedOption === idx }"
          @click="selectOption(idx)"
        >
          <view class="option-label">{{ option.label }}</view>
          <text class="option-text">{{ option.text }}</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <view class="action-btn prev-btn" @click="prevQuestion" v-if="currentIndex > 0">
        上一题
      </view>
      <view class="action-btn next-btn" @click="nextQuestion" v-if="currentIndex < totalQuestions - 1">
        下一题
      </view>
      <view class="action-btn submit-btn" @click="submitTest" v-if="currentIndex === totalQuestions - 1">
        提交测评
      </view>
    </view>

    <!-- 提交确认弹窗 -->
    <view class="modal-overlay" v-if="showSubmitModal">
      <view class="modal-content">
        <text class="modal-title">确认提交</text>
        <text class="modal-desc">
          已答 {{ answeredCount }} / {{ totalQuestions }} 题，
          <text class="unanswered" v-if="unansweredCount > 0">还有 {{ unansweredCount }} 题未答</text>
          <text class="all-answered" v-else>全部已答完</text>
        </text>
        <view class="modal-actions">
          <view class="modal-btn cancel-btn" @click="showSubmitModal = false">继续答题</view>
          <view class="modal-btn confirm-btn" @click="confirmSubmit">确认提交</view>
        </view>
      </view>
    </view>

    <!-- 提交中 loading -->
    <view class="loading-overlay" v-if="submitting">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在计算测评结果...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getTestQuestions, submitTestResult } from '@/api'
import { useAnswerLogic } from '@/composables/useAnswerLogic'

const testId = ref('')
const testName = ref('')
const showSubmitModal = ref(false)
const submitting = ref(false)

const {
  currentIndex,
  totalQuestions,
  questions,
  answers,
  selectedOption,
  currentQuestion,
  answeredCount,
  unansweredCount,
  selectOption,
  prevQuestion,
  nextQuestion,
  setQuestions,
} = useAnswerLogic()

const progressPercent = computed(() => ((currentIndex.value + 1) / totalQuestions.value) * 100)

onLoad((options: any) => {
  testId.value = options?.testId || ''
  testName.value = testId.value === 'test_holland' ? '霍兰德职业兴趣' : '天赋罗盘'
  console.log(`[answer] onLoad testId=${testId.value}, testName=${testName.value}`)
  loadQuestions()
})

async function loadQuestions() {
  const res = await getTestQuestions(testId.value)
  if (res.code === 0 && res.data?.questions?.length > 0) {
    const qs = res.data.questions
    console.log(`[answer] 收到 ${qs.length} 题，第一题: ${qs[0]?.content?.substring(0, 30)}...`)
    setQuestions(qs)
  } else {
    console.warn(`[answer] 未收到有效题目数据, res=`, res)
  }
}

function submitTest() {
  showSubmitModal.value = true
}

async function confirmSubmit() {
  showSubmitModal.value = false
  submitting.value = true

  // 始终存储答案到本地，供报告页在云函数不可用时做本地计算
  uni.setStorageSync('lastTestId', testId.value)

  if (testId.value === 'test_holland') {
    uni.setStorageSync('lastHollandAnswers', JSON.stringify(answers.value))
    uni.setStorageSync('lastHollandTestId', testId.value)
    console.log('[answer] 已保存 lastHollandAnswers 供综合推荐使用')
  } else {
    uni.setStorageSync('lastAnswers', JSON.stringify(answers.value))
    uni.setStorageSync('lastTalentTestId', testId.value)
  }

  // 记录该测评已完成，供首页展示进度
  try {
    const raw = uni.getStorageSync('completedTests') || '[]'
    const completed: string[] = JSON.parse(raw)
    if (!completed.includes(testId.value)) {
      completed.push(testId.value)
    }
    uni.setStorageSync('completedTests', JSON.stringify(completed))
  } catch { /* ignore */ }

  try {
    const res = await submitTestResult(testId.value, answers.value)
    if (res.code === 0) {
      submitting.value = false
      // 云函数成功：返回首页。首页 onShow 通过 storage 读取 lastTestId/lastAnswers
      // 来展示阶段总结弹窗，无需 URL 传参。
      uni.switchTab({ url: '/pages/index/index' })
      return
    }
  } catch (e: any) {
    console.error('提交失败，使用本地数据跳转', e)
  } finally {
    submitting.value = false
  }

  // Fallback: 云函数不可用，仍返回首页
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.page-answer {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

/* ═══ Test Header ═══ */
.test-header {
  padding: 28rpx $spacing-lg 16rpx;
  background: #fff;

  .test-title {
    font-size: 32rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    letter-spacing: 0.01em;
  }
}

/* ═══ Progress Bar ═══ */
.progress-bar {
  height: 6rpx;
  background: #F3F4F6;
  border-radius: 3rpx;
  margin: 0 $spacing-lg;

  .progress-inner {
    height: 100%;
    background: $gradient-primary;
    border-radius: 3rpx;
    transition: width $transition-smooth;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      right: -4rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 12rpx;
      height: 12rpx;
      background: $primary-color;
      border-radius: 50%;
      box-shadow: 0 0 8rpx rgba(99, 102, 241, 0.4);
    }
  }
}

/* ═══ Question Area ═══ */
.question-area {
  flex: 1;
  padding: 44rpx $spacing-lg;
}

.question-number {
  margin-bottom: 36rpx;

  .current {
    font-size: 56rpx;
    font-weight: $font-weight-bold;
    color: $primary-color;
    letter-spacing: 0.02em;
  }

  .total {
    font-size: 28rpx;
    color: $text-hint;
    font-weight: $font-weight-normal;
  }
}

.question-content {
  margin-bottom: 52rpx;

  .question-text {
    font-size: 34rpx;
    line-height: $line-height-relaxed;
    color: $text-primary;
    font-weight: $font-weight-medium;
  }
}

/* ═══ Options ═══ */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 28rpx 24rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-md;
  transition: all $transition-base;
  background: $card-bg;
  position: relative;

  &:active {
    transform: scale(0.985);
  }

  &.selected {
    border-color: $primary-color;
    background: linear-gradient(135deg, #EEF2FF, #EDE9FE);
    box-shadow: 0 2rpx 16rpx rgba(99, 102, 241, 0.1);
  }

  .option-label {
    width: 52rpx;
    height: 52rpx;
    border-radius: $radius-sm;
    background: #F3F4F6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: $font-weight-semibold;
    color: $text-hint;
    margin-right: 20rpx;
    flex-shrink: 0;
    transition: all $transition-base;
  }

  &.selected .option-label {
    background: $gradient-primary;
    color: #fff;
    box-shadow: $shadow-glow;
  }

  .option-text {
    font-size: 28rpx;
    color: $text-primary;
    line-height: 1.55;
    flex: 1;
    min-width: 0;
  }
}

/* ═══ Bottom Actions ═══ */
.bottom-actions {
  display: flex;
  justify-content: center;
  padding: 24rpx $spacing-lg 48rpx;
  gap: 24rpx;
}

.action-btn {
  padding: 22rpx 72rpx;
  border-radius: $radius-full;
  font-size: 28rpx;
  font-weight: $font-weight-medium;
  transition: all $transition-base;
}

.prev-btn {
  background: #F3F4F6;
  color: $text-secondary;

  &:active {
    background: #E5E7EB;
  }
}

.next-btn, .submit-btn {
  background: $gradient-primary;
  color: #fff;
  box-shadow: $shadow-glow;

  &:active {
    opacity: 0.85;
  }
}

/* ═══ Confirm Modal ═══ */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: $radius-2xl;
  padding: 48rpx 44rpx;
  text-align: center;
  box-shadow: $shadow-xl;
  animation: slideUp 0.3s ease;

  .modal-title {
    font-size: 34rpx;
    font-weight: $font-weight-bold;
    display: block;
    margin-bottom: 16rpx;
    color: $text-primary;
  }

  .modal-desc {
    font-size: 28rpx;
    color: $text-secondary;
    display: block;
    margin-bottom: 40rpx;
    line-height: $line-height-relaxed;
  }

  .unanswered { color: $warning-color; font-weight: $font-weight-medium; }
  .all-answered { color: $success-color; font-weight: $font-weight-medium; }
}

.modal-actions {
  display: flex;
  gap: 24rpx;
}

.modal-btn {
  flex: 1;
  padding: 22rpx;
  border-radius: $radius-full;
  font-size: 28rpx;
  font-weight: $font-weight-medium;
}

.cancel-btn {
  background: #F3F4F6;
  color: $text-secondary;

  &:active { background: #E5E7EB; }
}

.confirm-btn {
  background: $gradient-primary;
  color: #fff;
  box-shadow: $shadow-glow;

  &:active { opacity: 0.85; }
}

/* ═══ Loading Overlay ═══ */
.loading-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.loading-content {
  text-align: center;

  .loading-spinner {
    width: 80rpx;
    height: 80rpx;
    border: 5rpx solid #E5E7EB;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 28rpx;
  }

  .loading-text {
    font-size: 28rpx;
    color: $text-secondary;
    font-weight: $font-weight-medium;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
