<template>
  <view class="page-tool">
    <view class="tool-header">
      <text class="tool-title">{{ toolTitle }}</text>
      <text class="tool-desc">{{ toolDesc }}</text>
    </view>
    <view class="form-section">
      <!-- 三叶草法 -->
      <template v-if="toolType === 'clover'">
        <view class="form-group">
          <text class="form-label">你的兴趣（做什么让你快乐？）</text>
          <textarea class="form-textarea" v-model="formData.interests" placeholder="请输入，每行一个..." />
        </view>
        <view class="form-group">
          <text class="form-label">你的能力（你擅长什么？）</text>
          <textarea class="form-textarea" v-model="formData.abilities" placeholder="请输入，每行一个..." />
        </view>
        <view class="form-group">
          <text class="form-label">你的价值观（什么对你最重要？）</text>
          <textarea class="form-textarea" v-model="formData.values" placeholder="请输入，每行一个..." />
        </view>
      </template>

      <!-- 高光事件回溯 -->
      <template v-if="toolType === 'highlight'">
        <view class="form-group" v-for="(h, idx) in highlights" :key="idx">
          <view class="highlight-header">
            <text class="form-label">高光时刻 {{ idx + 1 }}</text>
            <text class="remove-btn" v-if="highlights.length > 1" @click="highlights.splice(idx,1)">删除</text>
          </view>
          <input class="form-input" v-model="h.title" placeholder="事件标题" />
          <textarea class="form-textarea" v-model="h.description" placeholder="描述这个高光时刻..." />
        </view>
        <view class="add-more-btn" @click="highlights.push({title:'',description:'',skills:[],impact:'medium'})">+ 添加更多高光时刻</view>
      </template>

      <!-- 外界反馈 -->
      <template v-if="toolType === 'feedback'">
        <view class="form-group">
          <text class="form-label">他人对你的正面评价</text>
          <textarea class="form-textarea" v-model="formData.feedback" placeholder="回想一下别人夸过你什么？每行一条..." />
        </view>
      </template>

      <!-- 理想状态倒推 -->
      <template v-if="toolType === 'ideal'">
        <view class="form-group">
          <text class="form-label">描述你理想中的职业/生活状态</text>
          <textarea class="form-textarea" v-model="formData.idealState" placeholder="5年后你希望过什么样的生活？做什么样的工作？" />
        </view>
      </template>

      <!-- 三圈法 -->
      <template v-if="toolType === 'circle'">
        <view class="form-group">
          <text class="form-label">热爱的 (Passion)</text>
          <textarea class="form-textarea" v-model="formData.passion" placeholder="做什么让你充满热情？" />
        </view>
        <view class="form-group">
          <text class="form-label">擅长的 (Talent)</text>
          <textarea class="form-textarea" v-model="formData.talent" placeholder="你的核心优势是什么？" />
        </view>
        <view class="form-group">
          <text class="form-label">被需要的 (Demand)</text>
          <textarea class="form-textarea" v-model="formData.demand" placeholder="社会上哪些技能有需求？" />
        </view>
      </template>
    </view>
    <view class="submit-area">
      <view class="submit-btn" @click="submitTool">生成分析</view>
    </view>
    <view class="result-section" v-if="result">
      <view class="result-title">分析结果</view>
      <view class="result-card">
        <text class="result-text">{{ result }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const toolType = ref('clover')
const formData = ref({
  interests: '', abilities: '', values: '',
  feedback: '', idealState: '',
  passion: '', talent: '', demand: ''
})
const highlights = ref([{title:'', description:'', skills:[], impact:'medium' as const}])
const result = ref('')

const toolMap: Record<string, {title:string, desc:string}> = {
  clover: { title:'三叶草法', desc:'识别兴趣、能力与价值观的交集' },
  highlight: { title:'高光事件回溯', desc:'回顾你的高光时刻，找到核心优势' },
  feedback: { title:'外界正向反馈', desc:'从他人的评价中认识自己' },
  ideal: { title:'理想状态倒推', desc:'从理想反推你现在该做什么' },
  circle: { title:'个人定位三圈法', desc:'找到热爱、擅长与市场需求的交集' }
}

const toolTitle = computed(() => toolMap[toolType.value]?.title || '')
const toolDesc = computed(() => toolMap[toolType.value]?.desc || '')

onLoad((options: any) => {
  if (options?.type) toolType.value = options.type
})

function submitTool() {
  uni.showLoading({ title: '分析中...' })
  setTimeout(() => {
    uni.hideLoading()
    result.value = generateResult()
    uni.showToast({ title: '分析完成', icon: 'success' })
  }, 1000)
}

function generateResult(): string {
  switch (toolType.value) {
    case 'clover':
      return `根据你的填写，你的兴趣、能力与价值观的交集指向创意与表达类职业。建议你关注内容创作、教育培训或设计相关方向。你可以进一步通过测评来验证这个定位。`
    case 'highlight':
      return `从你的高光时刻中，我们发现了你具备较好的问题解决能力和团队协作能力。你可以在日常工作中主动承担需要这些能力的任务，强化你的优势。`
    case 'feedback':
      return `他人反馈显示你在沟通和执行力方面有突出表现。这些软技能对职业发展非常重要，建议在求职和工作中重点展示这些优势。`
    case 'ideal':
      return `基于你的理想状态描述，建议你将大目标拆分为可执行的阶段性目标。从现在开始，每天朝理想状态迈出一小步。`
    case 'circle':
      return `你的三圈交集分析显示，你可以在技术+创意交叉的领域找到发展空间。建议你同时关注技术能力和创意思维的培养。`
    default: return '请选择分析工具'
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/common.scss';

.page-tool { padding-bottom: 40rpx; }

.tool-header {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  padding: 40rpx 32rpx;
  color: #fff;

  .tool-title { font-size: 40rpx; font-weight: 700; display: block; margin-bottom: 8rpx; }
  .tool-desc { font-size: 26rpx; opacity: 0.85; }
}

.form-section { padding: 32rpx 24rpx; }

.form-group { margin-bottom: 28rpx; }

.form-label {
  font-size: 28rpx; font-weight: 500; color: $text-primary;
  display: block; margin-bottom: 12rpx;
}

.form-input {
  background: #F5F5F5; border-radius: 12rpx; padding: 20rpx 24rpx;
  font-size: 28rpx; width: 100%; box-sizing: border-box; margin-bottom: 12rpx;
}

.form-textarea {
  background: #F5F5F5; border-radius: 12rpx; padding: 20rpx 24rpx;
  font-size: 28rpx; width: 100%; box-sizing: border-box; min-height: 160rpx;
}

.highlight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12rpx; }

.remove-btn { font-size: 24rpx; color: $error-color; }

.add-more-btn {
  text-align: center; padding: 20rpx; margin: 16rpx 0; font-size: 26rpx;
  color: $primary-color; border: 2rpx dashed $primary-color; border-radius: 12rpx;
}

.submit-area { padding: 0 24rpx; }

.submit-btn {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff; text-align: center; padding: 24rpx;
  border-radius: 48rpx; font-size: 30rpx; font-weight: 500;
}

.result-section { padding: 32rpx 24rpx; }
.result-title { font-size: 30rpx; font-weight: 600; margin-bottom: 16rpx; }

.result-card {
  background: #F0F7FF; border-radius: 16rpx; padding: 28rpx;
  border-left: 6rpx solid $primary-color;
}
.result-text { font-size: 28rpx; color: $text-secondary; line-height: 1.8; }
</style>
