<template>
  <view class="page-test">
    <view class="page-header">
      <text class="page-title">测评中心</text>
      <text class="page-desc">科学测评，发现你的天赋与兴趣</text>
    </view>

    <!-- 测评分类 -->
    <view class="section">
      <view class="section-title">天赋测评</view>
      <view class="test-card" @click="startTest('test_talent_compass')">
        <view class="test-card-header">
          <view class="test-icon talent-icon">🧠</view>
          <view class="test-info">
            <text class="test-name">天赋罗盘测试</text>
            <text class="test-dimensions">10 个维度 · 逻辑/创造/记忆/沟通等</text>
          </view>
        </view>
        <view class="test-card-footer">
          <view class="test-meta">
            <text class="meta-item">📝 26 题</text>
            <text class="meta-item">⏱ 约15分钟</text>
            <text class="meta-item">👥 1.2万人测过</text>
          </view>
          <view class="start-btn">开始测试</view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">职业兴趣</view>
      <view class="test-card" @click="startTest('test_holland')">
        <view class="test-card-header">
          <view class="test-icon holland-icon">💼</view>
          <view class="test-info">
            <text class="test-name">霍兰德职业兴趣测试</text>
            <text class="test-dimensions">6 个维度 · RIASEC 模型</text>
          </view>
        </view>
        <view class="test-card-footer">
          <view class="test-meta">
            <text class="meta-item">📝 60 题</text>
            <text class="meta-item">⏱ 约20分钟</text>
            <text class="meta-item">👥 2.5万人测过</text>
          </view>
          <view class="start-btn">开始测试</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const startTest = (testId: string) => {
  uni.navigateTo({
    url: `/pages/test/answer?testId=${testId}`
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

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
