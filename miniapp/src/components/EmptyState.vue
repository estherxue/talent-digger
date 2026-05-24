<template>
  <view class="empty-state">
    <text class="empty-icon">{{ icon }}</text>
    <text class="empty-title">{{ title }}</text>
    <text class="empty-desc">{{ description }}</text>
    <view class="empty-action" v-if="actionText" @click="$emit('action')">
      {{ actionText }}
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title?: string
  description?: string
  actionText?: string
}>(), {
  icon: '📋',
  title: '暂无数据',
  description: ''
})

defineEmits<{
  (e: 'action'): void
}>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
}
.empty-icon { font-size: 80rpx; margin-bottom: 24rpx; }
.empty-title { font-size: 32rpx; font-weight: 600; margin-bottom: 12rpx; color: #333; }
.empty-desc { font-size: 26rpx; color: #999; margin-bottom: 40rpx; text-align: center; }
.empty-action {
  background: #4A90D9;
  color: #fff;
  padding: 20rpx 64rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}
</style>
