<template>
  <view class="loading-overlay" v-if="visible">
    <view class="loading-content">
      <view class="loading-spinner"></view>
      <text class="loading-text">{{ text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  visible: boolean
  text?: string
}>(), {
  text: '加载中...'
})
</script>

<style scoped>
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
}
.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid #E8E8E8;
  border-top-color: #4A90D9;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 24rpx;
}
.loading-text {
  font-size: 28rpx;
  color: #666;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
