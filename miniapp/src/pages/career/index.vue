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
@use '@/styles/common.scss' as *;

.page-career {
  padding: 0 $spacing-md 60rpx;
  min-height: 100vh;
  background: $gradient-hero;
}

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

.tools-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.tool-card {
  width: calc(50% - 10rpx);
  background: $card-bg;
  border-radius: $radius-lg;
  padding: 36rpx 24rpx;
  box-shadow: $shadow-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all $transition-smooth;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5rpx;
    border-radius: $radius-lg $radius-lg 0 0;
    opacity: 0.6;
  }

  &:nth-child(1)::before { background: $gradient-primary-soft; }
  &:nth-child(2)::before { background: $gradient-cool; }
  &:nth-child(3)::before { background: $gradient-warm; }
  &:nth-child(4)::before { background: $gradient-success; }
  &:nth-child(5)::before { background: $gradient-warning; }

  &:active {
    transform: translateY(-4rpx);
    box-shadow: $shadow-lg;
  }

  .tool-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 44rpx;
    margin-bottom: 18rpx;
  }

  .clover-icon {
    background: linear-gradient(135deg, #EDE9FE, #E0E7FF);
  }
  .highlight-icon {
    background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  }
  .feedback-icon {
    background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
  }
  .ideal-icon {
    background: linear-gradient(135deg, #FEE2E2, #FECACA);
  }
  .circle-icon {
    background: linear-gradient(135deg, #E0E7FF, #C7D2FE);
  }

  .tool-name {
    font-size: 28rpx;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin-bottom: 8rpx;
  }

  .tool-desc {
    font-size: 22rpx;
    color: $text-hint;
    line-height: 1.5;
  }
}
</style>
