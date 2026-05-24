<template>
  <view class="dimension-item">
    <view class="dimension-header">
      <text class="dimension-name">{{ name }}</text>
      <text class="dimension-score" :class="'level-' + level">
        {{ percentage }}%
      </text>
    </view>
    <view class="dimension-bar">
      <view class="bar-inner" :class="'level-' + level" :style="{ width: percentage + '%' }"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  percentage: number
  level: 'low' | 'medium' | 'high'
}>()
</script>

<style scoped>
.dimension-item {
  margin-bottom: 20rpx;
}
.dimension-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}
.dimension-name {
  font-size: 26rpx;
  color: #666;
}
.dimension-score {
  font-size: 26rpx;
  font-weight: 600;
}
.dimension-score.level-high { color: #52C41A; }
.dimension-score.level-medium { color: #FAAD14; }
.dimension-score.level-low { color: #F5222D; }
.dimension-bar {
  height: 12rpx;
  background: #F0F0F0;
  border-radius: 6rpx;
  overflow: hidden;
}
.bar-inner {
  height: 100%;
  border-radius: 6rpx;
  transition: width 0.5s ease;
}
.bar-inner.level-high { background: #52C41A; }
.bar-inner.level-medium { background: #FAAD14; }
.bar-inner.level-low { background: #E0E0E0; }
</style>
