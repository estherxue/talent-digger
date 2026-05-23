<template>
  <view class="page-career">
    <view class="page-header">
      <text class="page-title">职业规划</text>
      <text class="page-desc">运用科学方法，找到你的职业方向</text>
    </view>
    <view class="tools-grid">
      <view class="tool-card" @click="navigateTo('/pages/career/tool?type=clover')">
        <view class="tool-icon clover-icon">🍀</view>
        <text class="tool-name">三叶草法</text>
        <text class="tool-desc">识别兴趣、能力与价值观的交集</text>
      </view>
      <view class="tool-card" @click="navigateTo('/pages/career/tool?type=highlight')">
        <view class="tool-icon highlight-icon">✨</view>
        <text class="tool-name">高光事件回溯</text>
        <text class="tool-desc">回顾成就，发现核心优势</text>
      </view>
      <view class="tool-card" @click="navigateTo('/pages/career/tool?type=feedback')">
        <view class="tool-icon feedback-icon">💬</view>
        <text class="tool-name">外界正向反馈</text>
        <text class="tool-desc">从他人的评价中认识自己</text>
      </view>
      <view class="tool-card" @click="navigateTo('/pages/career/tool?type=ideal')">
        <view class="tool-icon ideal-icon">🚀</view>
        <text class="tool-name">理想状态倒推</text>
        <text class="tool-desc">从目标反推行动路径</text>
      </view>
      <view class="tool-card" @click="navigateTo('/pages/career/tool?type=circle')">
        <view class="tool-icon circle-icon">⭕</view>
        <text class="tool-name">个人定位三圈法</text>
        <text class="tool-desc">热爱、擅长与被需要的交集</text>
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
@import '@/styles/common.scss';

.page-career {
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

.tools-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.tool-card {
  width: calc(50% - 10rpx);
  background: $card-bg;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  box-shadow: $shadow;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .tool-icon {
    font-size: 52rpx;
    margin-bottom: 16rpx;
  }

  .tool-name {
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 8rpx;
  }

  .tool-desc {
    font-size: 22rpx;
    color: $text-hint;
    line-height: 1.4;
  }
}
</style>
