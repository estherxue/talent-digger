<template>
  <view class="page-detail" v-if="career">
    <!-- 职业头部 -->
    <view class="career-header">
      <view class="header-badge">{{ career.category }}</view>
      <text class="header-name">{{ career.name }}</text>
      <text class="header-desc">{{ career.description }}</text>
    </view>

    <!-- 职业概况卡片 -->
    <view class="info-section">
      <view class="section-label">📋 职业概况</view>
      <view class="info-grid">
        <view class="info-item">
          <text class="info-value">{{ career.educationLevel }}</text>
          <text class="info-label">学历要求</text>
        </view>
        <view class="info-item">
          <text class="info-value">{{ career.salaryRange }}</text>
          <text class="info-label">薪资范围 (月)</text>
        </view>
      </view>
      <view class="skills-row" v-if="career.requiredSkills.length">
        <text class="skills-label">核心技能</text>
        <view class="skills-tags">
          <text class="skill-tag" v-for="skill in career.requiredSkills" :key="skill">{{ skill }}</text>
        </view>
      </view>
      <view class="dimensions-row" v-if="career.dimensionTags.length">
        <text class="dim-label">关联天赋维度</text>
        <view class="dim-tags">
          <text class="dim-tag" v-for="d in career.dimensionTags" :key="d">{{ dimName(d) }}</text>
        </view>
      </view>
    </view>

    <!-- 行业佼佼者 -->
    <view class="role-models-section">
      <view class="section-label">🌟 行业佼佼者 · 职业轨迹参考</view>

      <view class="model-card" v-for="(model, idx) in roleModels" :key="idx">
        <view class="model-header">
          <text class="model-avatar">{{ model.avatar }}</text>
          <view class="model-info">
            <text class="model-name">{{ model.name }}</text>
            <text class="model-title">{{ model.title }}</text>
          </view>
        </view>
        <text class="model-desc">{{ model.description }}</text>

        <!-- 职业轨迹时间线 -->
        <view class="timeline" v-if="model.milestones.length">
          <view class="timeline-title">📅 职业轨迹</view>
          <view class="timeline-list">
            <view class="timeline-item" v-for="(m, mi) in model.milestones" :key="mi">
              <view class="timeline-dot"></view>
              <view class="timeline-content">
                <text class="timeline-year">{{ m.year }}</text>
                <text class="timeline-event">{{ m.description }}</text>
              </view>
              <view class="timeline-line" v-if="mi < model.milestones.length - 1"></view>
            </view>
          </view>
        </view>

        <!-- 名言 -->
        <view class="model-quote" v-if="model.quote">
          <text class="quote-mark">"</text>
          <text class="quote-text">{{ model.quote }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-area">
      <view class="action-btn" @click="goBack">返回</view>
    </view>
  </view>

  <!-- 加载中或未找到 -->
  <view class="empty-state" v-else>
    <text class="empty-icon">🔍</text>
    <text class="empty-text">未找到该职业的详细信息</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { CAREER_LIBRARY, type CareerEntry } from '@/utils/careerMatch'
import { getRoleModels, type RoleModel } from '@/data/careerRoleModels'
import { dimName } from '@/utils/summary'

const career = ref<CareerEntry | null>(null)
const roleModels = ref<RoleModel[]>([])

onLoad((options: any) => {
  const careerName = options?.careerName ? decodeURIComponent(options.careerName) : ''
  if (!careerName) return

  const found = CAREER_LIBRARY.find(c => c.name === careerName)
  if (found) {
    career.value = found
    roleModels.value = getRoleModels(careerName)
  }
})

function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
@use '@/styles/common.scss' as *;

.page-detail {
  min-height: 100vh;
  background: #F5F6FA;
  padding-bottom: 40rpx;
}

/* ---- 职业头部 ---- */
.career-header {
  background: linear-gradient(135deg, #2C3E7B 0%, #4A6FA5 50%, #7AB8F5 100%);
  padding: 56rpx 32rpx 40rpx;
  color: #fff;

  .header-badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.18);
    padding: 6rpx 20rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
    margin-bottom: 16rpx;
  }

  .header-name {
    font-size: 44rpx;
    font-weight: 700;
    display: block;
    margin-bottom: 12rpx;
  }

  .header-desc {
    font-size: 26rpx;
    opacity: 0.9;
    line-height: 1.5;
    display: block;
  }
}

/* ---- 概况卡片 ---- */
.info-section {
  background: #fff;
  margin: -20rpx 24rpx 24rpx;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;
}

.section-label {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 24rpx;
}

.info-grid {
  display: flex;
  gap: 24rpx;
  margin-bottom: 28rpx;
}

.info-item {
  flex: 1;
  background: #F0F4FF;
  border-radius: 14rpx;
  padding: 20rpx;
  text-align: center;

  .info-value {
    font-size: 30rpx;
    font-weight: 700;
    color: $primary-color;
    display: block;
    margin-bottom: 4rpx;
  }

  .info-label {
    font-size: 22rpx;
    color: $text-hint;
  }
}

.skills-row {
  margin-bottom: 24rpx;

  .skills-label {
    font-size: 24rpx;
    color: $text-hint;
    margin-bottom: 12rpx;
    display: block;
  }
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.skill-tag {
  background: #E8F0FE;
  color: #2C5AA0;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

.dimensions-row {
  .dim-label {
    font-size: 24rpx;
    color: $text-hint;
    margin-bottom: 12rpx;
    display: block;
  }
}

.dim-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.dim-tag {
  background: #FFF3E0;
  color: #E65100;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-weight: 500;
}

/* ---- 角色模型 ---- */
.role-models-section {
  padding: 0 24rpx;

  .section-label {
    padding: 0 8rpx;
    margin-bottom: 20rpx;
  }
}

.model-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.model-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;

  .model-avatar {
    font-size: 56rpx;
    width: 80rpx;
    height: 80rpx;
    background: #F0F4FF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    flex-shrink: 0;
  }

  .model-info {
    flex: 1;
    min-width: 0;

    .model-name {
      font-size: 30rpx;
      font-weight: 700;
      color: $text-primary;
      display: block;
      margin-bottom: 4rpx;
    }

    .model-title {
      font-size: 22rpx;
      color: $text-hint;
      line-height: 1.4;
    }
  }
}

.model-desc {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.6;
  display: block;
  margin-bottom: 24rpx;
  padding-left: 100rpx;
}

/* ---- 时间线 ---- */
.timeline {
  border-top: 1rpx solid #F0F0F0;
  padding-top: 24rpx;
}

.timeline-title {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20rpx;
}

.timeline-list {
  position: relative;
}

.timeline-item {
  position: relative;
  display: flex;
  padding-left: 32rpx;
  min-height: 72rpx;

  &:last-child {
    min-height: auto;
  }
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 8rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: $primary-color;
  border: 3rpx solid #C5D9F5;
  z-index: 2;
}

.timeline-line {
  position: absolute;
  left: 6rpx;
  top: 30rpx;
  width: 2rpx;
  height: calc(100% - 8rpx);
  background: #E0E0E0;
  z-index: 1;
}

.timeline-content {
  padding-bottom: 24rpx;

  .timeline-year {
    font-size: 24rpx;
    font-weight: 700;
    color: $primary-color;
    display: block;
    margin-bottom: 4rpx;
  }

  .timeline-event {
    font-size: 25rpx;
    color: $text-secondary;
    line-height: 1.5;
  }
}

/* ---- 名言 ---- */
.model-quote {
  margin-top: 20rpx;
  background: linear-gradient(135deg, #F0F4FF, #FAFCFF);
  border-radius: 14rpx;
  padding: 24rpx;
  border-left: 5rpx solid $primary-color;
  position: relative;

  .quote-mark {
    position: absolute;
    top: 6rpx;
    left: 16rpx;
    font-size: 56rpx;
    color: $primary-color;
    opacity: 0.15;
    font-family: Georgia, serif;
    line-height: 1;
  }

  .quote-text {
    font-size: 26rpx;
    color: $text-secondary;
    font-style: italic;
    line-height: 1.7;
    padding-left: 16rpx;
  }
}

/* ---- 底部 ---- */
.bottom-area {
  padding: 24rpx 32rpx;
}

.action-btn {
  background: #fff;
  border: 2rpx solid $primary-color;
  color: $primary-color;
  text-align: center;
  padding: 22rpx;
  border-radius: 48rpx;
  font-size: 28rpx;
  font-weight: 500;
}

/* ---- 空状态 ---- */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 40rpx;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: $text-hint;
  }
}
</style>
