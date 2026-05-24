<template>
  <view class="page-index">
    <!-- 顶部 banner -->
    <view class="banner">
      <view class="banner-content">
        <text class="banner-title">发现你的天赋</text>
        <text class="banner-subtitle">科学测评，精准规划职业方向</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-actions">
      <view class="action-card" @click="navigateTo('/pages/test/index')">
        <view class="action-icon test-icon">📋</view>
        <text class="action-title">开始测评</text>
        <text class="action-desc">天赋罗盘 / 霍兰德测试</text>
      </view>
      <view class="action-card" @click="navigateTo('/pages/career/index')">
        <view class="action-icon career-icon">🧭</view>
        <text class="action-title">职业规划</text>
        <text class="action-desc">三叶草 / 三圈法</text>
      </view>
      <view class="action-card" @click="navigateTo('/pages/plan/index')">
        <view class="action-icon plan-icon">🎯</view>
        <text class="action-title">成长计划</text>
        <text class="action-desc">设定目标与任务</text>
      </view>
      <view class="action-card" @click="navigateTo('/pages/report/index')">
        <view class="action-icon report-icon">📊</view>
        <text class="action-title">查看报告</text>
        <text class="action-desc">历史测评结果</text>
      </view>
    </view>

    <!-- 推荐测评 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">推荐测评</text>
      </view>
      <view class="test-item" @click="navigateTo('/pages/test/answer?type=talent')">
        <view class="test-info">
          <text class="test-name">天赋罗盘测试</text>
          <text class="test-meta">26 题 | 约 15 分钟 | 10 个维度</text>
        </view>
        <text class="test-badge">热门</text>
      </view>
      <view class="test-item" @click="navigateTo('/pages/test/answer?type=holland')">
        <view class="test-info">
          <text class="test-name">霍兰德职业兴趣测试</text>
          <text class="test-meta">60 题 | 约 20 分钟 | 6 个维度</text>
        </view>
        <text class="test-badge">推荐</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.page-index {
  padding-bottom: 40rpx;
}

.banner {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  padding: 60rpx 40rpx;
  margin-bottom: 32rpx;

  &-content {
    display: flex;
    flex-direction: column;
  }

  &-title {
    color: #fff;
    font-size: 44rpx;
    font-weight: 700;
    margin-bottom: 12rpx;
  }

  &-subtitle {
    color: rgba(255, 255, 255, 0.85);
    font-size: 28rpx;
  }
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  padding: 0 24rpx;
  margin-bottom: 32rpx;
}

.action-card {
  width: calc(50% - 12rpx);
  background: $card-bg;
  border-radius: $radius;
  padding: 32rpx 24rpx;
  margin: 0 6rpx 12rpx;
  box-shadow: $shadow;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .action-icon {
    font-size: 48rpx;
    margin-bottom: 16rpx;
  }

  .action-title {
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 8rpx;
  }

  .action-desc {
    font-size: 22rpx;
    color: $text-hint;
  }
}

.section {
  padding: 0 24rpx;
  margin-bottom: 32rpx;

  &-header {
    margin-bottom: 20rpx;
  }

  &-title {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-primary;
  }
}

.test-item {
  background: $card-bg;
  border-radius: $radius;
  padding: 28rpx 32rpx;
  margin-bottom: 16rpx;
  box-shadow: $shadow;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .test-info {
    display: flex;
    flex-direction: column;
  }

  .test-name {
    font-size: 28rpx;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 8rpx;
  }

  .test-meta {
    font-size: 22rpx;
    color: $text-hint;
  }

  .test-badge {
    background: #FFF3E0;
    color: #FF9800;
    font-size: 22rpx;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
  }
}
</style>
