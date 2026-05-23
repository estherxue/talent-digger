<template>
  <div class="statistics-page">
    <h2>数据统计</h2>
    <el-row :gutter="20" style="margin-bottom:20px">
      <el-col :span="6" v-for="stat in summaryStats" :key="stat.label">
        <el-card shadow="hover">
          <div class="stat-card">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">{{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header><div class="card-header"><span>测评完成趋势</span><el-tag size="small">近7天</el-tag></div></template>
          <div ref="testChartRef" style="height:300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><div class="card-header"><span>用户增长趋势</span><el-tag size="small">近7天</el-tag></div></template>
          <div ref="userChartRef" style="height:300px"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12">
        <el-card>
          <template #header><div class="card-header"><span>最受欢迎测评 Top5</span></div></template>
          <div ref="pieChartRef" style="height:300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><div class="card-header"><span>用户活跃度分布</span></div></template>
          <div ref="activeChartRef" style="height:300px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const testChartRef = ref()
const userChartRef = ref()
const pieChartRef = ref()
const activeChartRef = ref()

const summaryStats = ref([
  { label:'注册用户', value:1286, trend:12.5 },
  { label:'测评完成', value:3856, trend:23.1 },
  { label:'题库数量', value:3, trend:0 },
  { label:'今日活跃', value:89, trend:-5.2 }
])

function createChart(refEl: any, option: any) {
  if (!refEl.value) return
  const chart = echarts.init(refEl.value)
  chart.setOption(option)
  return chart
}

onMounted(async () => {
  await nextTick()
  
  // 测评趋势折线图
  createChart(testChartRef, {
    tooltip: { trigger:'axis' },
    grid: { left:40, right:20, top:20, bottom:30 },
    xAxis: { type:'category', data:['5/17','5/18','5/19','5/20','5/21','5/22','5/23'] },
    yAxis: { type:'value' },
    series: [
      { name:'天赋测试', type:'line', smooth:true, data:[45,52,38,67,55,72,89], itemStyle:{color:'#4A90D9'} },
      { name:'霍兰德', type:'line', smooth:true, data:[32,41,28,54,49,63,71], itemStyle:{color:'#FF9800'} }
    ]
  })

  // 用户增长柱状图
  createChart(userChartRef, {
    tooltip: { trigger:'axis' },
    grid: { left:40, right:20, top:20, bottom:30 },
    xAxis: { type:'category', data:['5/17','5/18','5/19','5/20','5/21','5/22','5/23'] },
    yAxis: { type:'value' },
    series: [
      { name:'新用户', type:'bar', data:[23,18,31,26,42,35,48], itemStyle:{color:'#4A90D9'} }
    ]
  })

  // 测评分布饼图
  createChart(pieChartRef, {
    tooltip: { trigger:'item' },
    legend: { bottom:10 },
    series: [
      { name:'测评分布', type:'pie', radius:['40%','70%'],
        data:[
          { value:1850, name:'天赋罗盘', itemStyle:{color:'#4A90D9'} },
          { value:1450, name:'霍兰德测试', itemStyle:{color:'#FF9800'} },
          { value:556, name:'其他测试', itemStyle:{color:'#E0E0E0'} }
        ],
        emphasis: { itemStyle:{ shadowBlur:10, shadowOffsetX:0, shadowColor:'rgba(0,0,0,0.3)' } }
      }
    ]
  })

  // 活跃度分布
  createChart(activeChartRef, {
    tooltip: { trigger:'axis' },
    grid: { left:40, right:20, top:20, bottom:30 },
    xAxis: { type:'category', data:['非常活跃','比较活跃','一般','较少使用','已流失'] },
    yAxis: { type:'value' },
    series: [
      { name:'用户数', type:'bar', data:[156,342,458,210,120], itemStyle:{color:'#4A90D9'} }
    ]
  })
})
</script>

<style scoped>
.statistics-page h2 { margin:0 0 20px 0; }

.stat-card { display:flex; flex-direction:column; align-items:center; padding:16px 0; position:relative; }
.stat-value { font-size:32px; font-weight:700; color:#4A90D9; margin-bottom:8px; }
.stat-label { font-size:14px; color:#999; margin-bottom:4px; }
.stat-trend { font-size:12px; position:absolute; top:10px; right:10px; }
.stat-trend.up { color:#52C41A; }
.stat-trend.down { color:#F5222D; }

.card-header { display:flex; justify-content:space-between; align-items:center; }
</style>
