<template>
  <div class="dashboard">
    <h2>数据概览</h2>
    <el-row :gutter="20">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="hover">
          <div class="stat-card">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { statsApi } from '@/api'

const stats = ref([
  { label: '注册用户', value: 0 },
  { label: '测评完成', value: 0 },
  { label: '题库数量', value: 0 },
  { label: '职业条目', value: 0 }
])
const loading = ref(true)

onMounted(async () => {
  try {
    const res: any = await statsApi.overview()
    if (res?.data) {
      stats.value = [
        { label: '注册用户', value: res.data.totalUsers || 0 },
        { label: '测评完成', value: res.data.totalResults || 0 },
        { label: '题库数量', value: res.data.totalTests || 0 },
        { label: '职业条目', value: res.data.totalCareers || 0 }
      ]
    }
  } catch (e) {
    console.error('加载统计数据失败', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard h2 {
  margin: 0 0 20px 0;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
}
.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #4A90D9;
  margin-bottom: 8px;
}
.stat-label {
  font-size: 14px;
  color: #999;
}
</style>
