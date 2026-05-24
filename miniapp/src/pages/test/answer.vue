<template>
  <view class="page-answer">
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
      <view class="options-list">
        <view
          v-for="(option, idx) in currentQuestion.options"
          :key="idx"
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
import type { Question } from '@shared/types/test'

const testId = ref('')
const currentIndex = ref(0)
const totalQuestions = ref(0)
const questions = ref<Question[]>([])
const answers = ref<Record<string, number>>({})
const selectedOption = ref<number | null>(null)
const showSubmitModal = ref(false)
const submitting = ref(false)

const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
const progressPercent = computed(() => ((currentIndex.value + 1) / totalQuestions.value) * 100)
const answeredCount = computed(() => Object.keys(answers.value).length)
const unansweredCount = computed(() => totalQuestions.value - answeredCount.value)

onLoad((options: any) => {
  testId.value = options?.testId || ''
  loadQuestions()
})

async function loadQuestions() {
  try {
    const res = await getTestQuestions(testId.value)
    if (res.code === 0) {
      questions.value = res.data.questions
      totalQuestions.value = questions.value.length
      if (questions.value.length > 0) {
        selectedOption.value = answers.value[questions.value[0].id] ?? null
      }
    }
  } catch (e) {
    console.error('加载题目失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

function selectOption(idx: number) {
  if (!currentQuestion.value) return
  answers.value[currentQuestion.value.id] = idx
  selectedOption.value = idx
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    const qid = questions.value[currentIndex.value].id
    selectedOption.value = answers.value[qid] ?? null
  }
}

function nextQuestion() {
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value++
    const qid = questions.value[currentIndex.value].id
    selectedOption.value = answers.value[qid] ?? null
  }
}

function submitTest() {
  showSubmitModal.value = true
}

async function confirmSubmit() {
  showSubmitModal.value = false
  submitting.value = true

  try {
    const res = await submitTestResult(testId.value, answers.value)
    if (res.code === 0) {
      uni.redirectTo({
        url: `/pages/report/index?testId=${testId.value}&resultId=${res.data.resultId}`
      })
    } else {
      uni.showToast({ title: res.message || '提交失败', icon: 'none' })
    }
  } catch (e: any) {
    uni.showToast({ title: e?.message || '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
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

.progress-bar {
  height: 6rpx;
  background: #E8E8E8;

  .progress-inner {
    height: 100%;
    background: linear-gradient(90deg, $primary-color, $primary-light);
    transition: width 0.3s ease;
  }
}

.question-area {
  flex: 1;
  padding: 40rpx 32rpx;
}

.question-number {
  margin-bottom: 32rpx;

  .current {
    font-size: 48rpx;
    font-weight: 700;
    color: $primary-color;
  }

  .total {
    font-size: 28rpx;
    color: $text-hint;
  }
}

.question-content {
  margin-bottom: 48rpx;

  .question-text {
    font-size: 34rpx;
    line-height: 1.6;
    color: $text-primary;
    font-weight: 500;
  }
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 28rpx 24rpx;
  border: 2rpx solid $border-color;
  border-radius: 12rpx;
  transition: all 0.2s;

  &.selected {
    border-color: $primary-color;
    background: #F0F7FF;
  }

  .option-label {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background: #F0F0F0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
    color: $text-secondary;
    margin-right: 20rpx;
    flex-shrink: 0;
  }

  &.selected .option-label {
    background: $primary-color;
    color: #fff;
  }

  .option-text {
    font-size: 28rpx;
    color: $text-primary;
    line-height: 1.5;
  }
}

.bottom-actions {
  display: flex;
  justify-content: center;
  padding: 24rpx 32rpx 48rpx;
  gap: 24rpx;
}

.action-btn {
  padding: 20rpx 64rpx;
  border-radius: 48rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.prev-btn {
  background: #F0F0F0;
  color: $text-secondary;
}

.next-btn, .submit-btn {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
}

/* 提交确认弹窗 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 48rpx 40rpx;
  text-align: center;

  .modal-title {
    font-size: 34rpx;
    font-weight: 600;
    display: block;
    margin-bottom: 16rpx;
  }

  .modal-desc {
    font-size: 28rpx;
    color: $text-secondary;
    display: block;
    margin-bottom: 40rpx;
  }

  .unanswered { color: $warning-color; }
  .all-answered { color: $success-color; }
}

.modal-actions {
  display: flex;
  gap: 24rpx;
}

.modal-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.cancel-btn {
  background: #F0F0F0;
  color: $text-secondary;
}

.confirm-btn {
  background: $primary-color;
  color: #fff;
}

/* Loading */
.loading-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.9);
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
    border: 6rpx solid #E8E8E8;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 24rpx;
  }

  .loading-text {
    font-size: 28rpx;
    color: $text-secondary;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
