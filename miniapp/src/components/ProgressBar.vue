<template>
  <view class="progress-bar">
    <view class="progress-inner" :style="{ width: percent + '%' }"></view>
  </view>
</template>

<script setup lang="ts">
defineProps<{ percent: number }>()
</script>

<style scoped>
.progress-bar {
  height: 6rpx;
  background: #E8E8E8;
}
.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #4A90D9, #7AB8F5);
  transition: width 0.3s ease;
  border-radius: 3rpx;
}
</style>
