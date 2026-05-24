<template>
  <view class="modal-overlay" v-if="visible" @click="handleCancel">
    <view class="modal-content" @click.stop>
      <text class="modal-title">{{ title }}</text>
      <text class="modal-desc">{{ description }}</text>
      <view class="modal-actions">
        <view class="modal-btn cancel-btn" @click="handleCancel">
          {{ cancelText }}
        </view>
        <view class="modal-btn confirm-btn" @click="handleConfirm">
          {{ confirmText }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  description?: string
  cancelText?: string
  confirmText?: string
}>(), {
  title: '提示',
  description: '',
  cancelText: '取消',
  confirmText: '确认'
})

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

function handleConfirm() {
  emit('confirm')
  emit('update:visible', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 48rpx 40rpx;
  text-align: center;
}
.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  display: block;
  margin-bottom: 16rpx;
}
.modal-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 40rpx;
  line-height: 1.5;
}
.modal-actions {
  display: flex;
  gap: 24rpx;
}
.modal-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}
.cancel-btn {
  background: #F0F0F0;
  color: #666;
}
.confirm-btn {
  background: linear-gradient(135deg, #4A90D9, #7AB8F5);
  color: #fff;
}
</style>
