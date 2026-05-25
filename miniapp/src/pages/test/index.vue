<template>
  <view class="page-test">
    <view class="page-header">
      <text class="page-title">测评中心</text>
      <text class="page-desc">科学测评，发现你的天赋与兴趣</text>
    </view>

    <!-- 测评列表 -->
    <view class="section" v-for="section in testSections" :key="section.key">
      <view class="section-title">{{ section.title }}</view>
      <view class="test-card" v-for="item in sectionItems(section.key)" :key="item.id" @click="startTest(item.id)">
        <view class="test-card-header">
          <view class="test-icon" :class="item.id === 'test_talent_compass' ? 'talent-icon' : 'holland-icon'">{{ item.id === 'test_talent_compass' ? '🧠' : '💼' }}</view>
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
  uni.navigateTo({
    url: `/pages/test/answer?testId=${testId}`
  })
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.page-test {
  padding: 0 24rpx 40rpx;
}

.page-header {
  padding: 40rpx 8rpx 32rpx;

  .page-title {
    font-size: 40rpx;
    font-weight: 700;
    color: $text-primary;
    display: block;
    margin-bottom: 8rpx;
  }

  .page-desc {
    font-size: 26rpx;
    color: $text-hint;
  }
}

.section {
  margin-bottom: 32rpx;

  &-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 20rpx;
    padding-left: 8rpx;
  }
}

.test-card {
  background: $card-bg;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: $shadow;
  margin-bottom: 20rpx;

  &-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
  }

  .test-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    margin-right: 20rpx;
  }

  .talent-icon {
    background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
  }

  .holland-icon {
    background: linear-gradient(135deg, #FFF3E0, #FFE0B2);
  }

  .test-info {
    flex: 1;

    .test-name {
      font-size: 30rpx;
      font-weight: 600;
      color: $text-primary;
      display: block;
      margin-bottom: 6rpx;
    }

    .test-dimensions {
      font-size: 24rpx;
      color: $text-hint;
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
      color: $text-secondary;
    }
  }

  .start-btn {
    background: linear-gradient(135deg, $primary-color, $primary-light);
    color: #fff;
    font-size: 26rpx;
    padding: 14rpx 36rpx;
    border-radius: 32rpx;
    font-weight: 500;
  }
}
</style>
