<template>
  <view class="page-mine">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar-wrapper">
        <image class="avatar" :src="userAvatar" mode="aspectFill" />
      </view>
      <view class="user-info">
        <text class="nickname">{{ userStore.nickname || '游客用户' }}</text>
        <text class="user-id" v-if="!userStore.isGuest">ID: {{ userStore.userId }}</text>
        <text class="guest-tag" v-else>游客模式</text>
      </view>
      <view class="edit-btn" @click="editProfile">编辑</view>
    </view>

    <!-- 数据统计 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-num">{{ testCount }}</text>
        <text class="stat-label">完成测评</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ planCount }}</text>
        <text class="stat-label">成长计划</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ streak }}</text>
        <text class="stat-label">连续天数</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-title">我的内容</view>
      <view class="menu-item" @click="navigateTo('/pages/report/index')">
        <text class="menu-text">测评报告</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/career/index')">
        <text class="menu-text">职业规划</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/plan/index')">
        <text class="menu-text">成长计划</text>
        <text class="menu-arrow">></text>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-title">设置</view>
      <view class="menu-item" @click="showAbout = true">
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="showPrivacy = true">
        <text class="menu-text">隐私政策</text>
        <text class="menu-arrow">></text>
      </view>
      <view class="menu-item" @click="clearCache">
        <text class="menu-text">清除缓存</text>
        <text class="menu-arrow">></text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-area">
      <view class="logout-btn" @click="handleLogout" v-if="!userStore.isGuest">
        退出登录
      </view>
      <view class="logout-btn login-btn-style" v-else @click="navigateTo('/pages/login/login')">
        登录 / 注册
      </view>
    </view>

    <!-- 关于弹窗 -->
    <view class="modal-overlay" v-if="showAbout" @click="showAbout = false">
      <view class="modal-card" @click.stop>
        <text class="modal-close" @click="showAbout = false">x</text>
        <text class="about-title">Talent Digger</text>
        <text class="about-version">版本 1.0.0</text>
        <text class="about-desc">帮助用户发现天赋、兴趣和价值观，为职业选择提供科学参考。测评结果仅供参考，请结合自身实际情况综合判断。</text>
      </view>
    </view>

    <!-- 隐私政策弹窗 -->
    <view class="modal-overlay" v-if="showPrivacy" @click="showPrivacy = false">
      <view class="modal-card" @click.stop>
        <text class="modal-close" @click="showPrivacy = false">x</text>
        <text class="privacy-title">隐私政策</text>
        <scroll-view class="privacy-content" scroll-y>
          <text class="privacy-text">
            1. 信息收集：我们仅在您授权后收集微信昵称和头像信息。\n\n
            2. 信息使用：您的测评数据仅用于生成个人报告和职业建议。\n\n
            3. 信息存储：所有数据存储在腾讯云云端，采用加密传输和存储。\n\n
            4. 信息共享：我们不会将您的个人信息分享给任何第三方。\n\n
            5. 测评结果说明：测评报告仅供个人参考，不构成任何形式的诊断或评估。请在做出重要决策时结合多方面信息综合判断。\n\n
            6. 联系我们：如有任何问题，请联系 cindyxue1122@gmail.com
          </text>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userAvatar = ref('https://img0.baidu.com/it/u=1642736288,3966862278&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500')
const testCount = ref(3)
const planCount = ref(2)
const streak = ref(5)
const showAbout = ref(false)
const showPrivacy = ref(false)

const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}

const editProfile = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

const clearCache = () => {
  uni.showModal({
    title: '确认清除',
    content: '将清除本地缓存数据，不会影响云端数据',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        uni.showToast({ title: '缓存已清除', icon: 'success' })
      }
    }
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出', icon: 'success' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.page-mine { padding-bottom: 40rpx; }

.user-card {
  background: linear-gradient(135deg, #4A90D9, #7AB8F5);
  padding: 60rpx 32rpx 40rpx;
  display: flex;
  align-items: center;

  .avatar-wrapper {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid rgba(255,255,255,0.4);
    overflow: hidden;
    margin-right: 24rpx;

    .avatar {
      width: 100%;
      height: 100%;
    }
  }

  .user-info {
    flex: 1;

    .nickname {
      color: #fff;
      font-size: 36rpx;
      font-weight: 600;
      display: block;
      margin-bottom: 6rpx;
    }

    .user-id {
      color: rgba(255,255,255,0.7);
      font-size: 24rpx;
    }

    .guest-tag {
      background: rgba(255,255,255,0.2);
      color: #fff;
      font-size: 22rpx;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
    }
  }

  .edit-btn {
    color: #fff;
    font-size: 26rpx;
    padding: 10rpx 24rpx;
    border: 2rpx solid rgba(255,255,255,0.5);
    border-radius: 32rpx;
  }
}

.stats-card {
  background: #fff;
  margin: -24rpx 24rpx 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: $shadow;
  display: flex;
  position: relative;
  z-index: 1;

  .stat-item {
    flex: 1;
    text-align: center;

    .stat-num {
      font-size: 40rpx;
      font-weight: 700;
      color: $primary-color;
      display: block;
      margin-bottom: 4rpx;
    }

    .stat-label {
      font-size: 24rpx;
      color: $text-hint;
    }
  }

  .stat-divider {
    width: 2rpx;
    background: #F0F0F0;
    margin: 8rpx 0;
  }
}

.menu-section {
  background: #fff;
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  box-shadow: $shadow;
  overflow: hidden;

  .menu-title {
    font-size: 24rpx;
    color: $text-hint;
    padding: 20rpx 32rpx 12rpx;
  }

  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28rpx 32rpx;
    border-top: 1rpx solid #F5F5F5;

    .menu-text {
      font-size: 28rpx;
      color: $text-primary;
    }

    .menu-arrow {
      font-size: 28rpx;
      color: #CCC;
    }
  }
}

.logout-area {
  padding: 40rpx 24rpx 0;

  .logout-btn {
    text-align: center;
    background: #fff;
    padding: 24rpx;
    border-radius: 48rpx;
    font-size: 30rpx;
    color: $error-color;
  }

  .login-btn-style {
    color: $primary-color;
  }
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 40rpx;
}

.modal-card {
  width: 100%;
  max-width: 640rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 48rpx 40rpx;
  position: relative;
  max-height: 70vh;
  overflow: hidden;

  .modal-close {
    position: absolute;
    top: 16rpx;
    right: 24rpx;
    font-size: 40rpx;
    color: #999;
  }

  .about-title {
    font-size: 36rpx;
    font-weight: 700;
    display: block;
    text-align: center;
    margin-bottom: 8rpx;
  }

  .about-version {
    font-size: 24rpx;
    color: $text-hint;
    display: block;
    text-align: center;
    margin-bottom: 24rpx;
  }

  .about-desc {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.8;
  }

  .privacy-title {
    font-size: 32rpx;
    font-weight: 600;
    display: block;
    text-align: center;
    margin-bottom: 24rpx;
  }

  .privacy-content {
    max-height: 500rpx;
  }

  .privacy-text {
    font-size: 26rpx;
    color: $text-secondary;
    line-height: 2;
    white-space: pre-wrap;
  }
}
</style>
