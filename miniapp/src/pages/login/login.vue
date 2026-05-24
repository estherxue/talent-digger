<template>
  <view class="page-login">
    <view class="login-container">
      <text class="app-title">Talent Digger</text>
      <text class="app-subtitle">发现天赋，规划未来</text>
      <button class="login-btn wechat-btn" open-type="getUserInfo">
        微信一键登录
      </button>
      <text class="guest-link" @click="loginAsGuest">游客模式体验</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loginAsGuest = () => {
  userStore.loginAsGuest()
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.page-login {
  min-height: 100vh;
  background: linear-gradient(180deg, $primary-color, $primary-light);
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.app-title {
  font-size: 56rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16rpx;
}

.app-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 80rpx;
}

.login-btn {
  width: 600rpx;
  border-radius: 50rpx;
  padding: 24rpx;
  font-size: 32rpx;
  margin-bottom: 40rpx;
}

.wechat-btn {
  background: #fff;
  color: $primary-color;
}

.guest-link {
  color: rgba(255, 255, 255, 0.7);
  font-size: 26rpx;
  text-decoration: underline;
}
</style>
