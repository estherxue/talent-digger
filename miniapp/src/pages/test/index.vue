<template>
  <view class="page-test">
    <view class="page-header">
      <text class="page-title">测评中心</text>
      <text class="page-desc">科学测评，发现你的天赋与兴趣</text>
    </view>

    <!-- 测评列表 -->
    <view class="section" v-for="section in testSections" :key="section.key">
      <view class="section-title">{{ section.title }}</view>
      <view class="test-card" v-for="item in sectionItems(section.key)" :key="item.testId" @click="startTest(item.testId)">
        <view class="test-card-header">
          <view class="test-icon" :class="item.testId === 'test_talent_compass' ? 'talent-icon' : 'holland-icon'">{{ item.testId === 'test_talent_compass' ? '🧠' : '💼' }}</view>
          <view class="test-info">
            <text class="test-name">{{ item.name }}</text>
            <text class="test-dimensions">{{ item.description }}</text>
          </view>
        </view>
        <view class="test-card-footer">
          <view class="test-meta">
            <text class="meta-item">📝 {{ item.questionCount }} 题</text>
            <text class="meta-item">⏱ 约{{ item.estimatedMin }}分钟</text>
          </view>
          <view class="start-btn">开始测试</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getTestList } from '@/api'
import { smartNavigate } from '@/utils'
import type { TestDefinition } from '@shared/types/test'

const testList = ref<TestDefinition[]>([])
const loading = ref(true)

const testSections = [
  { key: 'talent', title: '天赋测评' },
  { key: 'interest', title: '职业兴趣' },
]

const sectionItems = computed(() => (sectionKey: string) => {
  if (sectionKey === 'talent') {
    return testList.value.filter(t => t.category === 'talent')
  }
  return testList.value.filter(t => t.category === 'interest')
})

onMounted(async () => {
  try {
    const res = await getTestList()
    if (res.code === 0) {
      testList.value = res.data
    }
  } catch (e) {
    console.error('加载测评列表失败', e)
  } finally {
    loading.value = false
  }
})

const startTest = (testId: string) => {
  smartNavigate(`/pages/test/answer?testId=${testId}`)
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.page-test {
  padding: 0 $spacing-md 60rpx;
  min-height: 100vh;
  background: $gradient-hero;
}

/* Page Header */
.page-header {
  padding: 48rpx 8rpx 36rpx;

  .page-title {
    font-size: 42rpx;
    font-weight: $font-weight-bold;
    color: $text-primary;
    display: block;
    margin-bottom: 10rpx;
    letter-spacing: $letter-spacing-title;
  }

  .page-desc {
    font-size: 26rpx;
    color: $text-hint;
    line-height: $line-height-relaxed;
  }
}

/* Section */
.section {
  margin-bottom: 36rpx;

  &-title {
    font-size: 30rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: 20rpx;
    padding-left: 12rpx;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6rpx;
      height: 28rpx;
      background: $gradient-primary;
      border-radius: 3rpx;
    }
  }
}

/* Test Card */
.test-card {
  position: relative;
  background: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-md;
  margin-bottom: 20rpx;
  transition: all $transition-smooth;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: $gradient-primary;
    border-radius: $radius-lg $radius-lg 0 0;
    opacity: 0;
    transition: opacity $transition-base;
  }

  &:active {
    transform: scale(0.985);
    box-shadow: $shadow-sm;
  }

  &:active::after {
    opacity: 1;
  }

  &-header {
    display: flex;
    align-items: center;
    margin-bottom: 28rpx;
  }

  .test-icon {
    width: 88rpx;
    height: 88rpx;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44rpx;
    margin-right: 24rpx;
    box-shadow: $shadow-sm;
  }

  .talent-icon {
    background: $gradient-primary-soft;
  }

  .holland-icon {
    background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  }

  .test-info {
    flex: 1;
    min-width: 0;

    .test-name {
      font-size: 30rpx;
      font-weight: $font-weight-semibold;
      color: $text-primary;
      display: block;
      margin-bottom: 6rpx;
    }

    .test-dimensions {
      font-size: 24rpx;
      color: $text-hint;
      line-height: $line-height-relaxed;
    }
  }

  &-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .test-meta {
    display: flex;
    gap: 24rpx;

    .meta-item {
      font-size: 22rpx;
      color: $text-hint;
    }
  }

  .start-btn {
    background: $gradient-primary;
    color: #fff;
    font-size: 26rpx;
    padding: 16rpx 40rpx;
    border-radius: $radius-full;
    font-weight: $font-weight-medium;
    box-shadow: $shadow-glow;
    transition: all $transition-base;

    &:active {
      opacity: 0.85;
    }
  }
}
</style>
