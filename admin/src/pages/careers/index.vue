<template>
  <div class="careers-page">
    <div class="page-header">
      <h2>职业库管理</h2>
      <el-button type="primary" @click="handleAdd">添加职业</el-button>
    </div>
    <el-card class="filter-card">
      <el-input v-model="searchQuery" placeholder="搜索职业名称或标签..." style="width: 320px" clearable />
      <el-button style="margin-left: 16px" type="success" @click="handleImport">批量导入</el-button>
    </el-card>
    <el-card>
      <el-table :data="filteredCareers" border stripe v-loading="loading">
        <el-table-column prop="name" label="职业名称" min-width="160" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联维度" min-width="200">
          <template #default="{ row }">
            <el-tag v-for="tag in row.dimensionTags" :key="tag" size="small" style="margin: 2px">{{ tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="educationLevel" label="学历要求" width="100" />
        <el-table-column prop="salaryRange" label="薪资范围" width="120" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="职业名称" required><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="form.category" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="关联维度">
          <el-input v-model="tagsInput" placeholder="用逗号分隔，如: logic,creativity" />
        </el-form-item>
        <el-form-item label="所需技能"><el-input v-model="skillsInput" placeholder="用逗号分隔" /></el-form-item>
        <el-form-item label="学历要求"><el-input v-model="form.educationLevel" /></el-form-item>
        <el-form-item label="薪资范围"><el-input v-model="form.salaryRange" /></el-form-item>
        <el-form-item label="职业建议"><el-input v-model="form.suggestions" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface CareerItem {
  id: string; name: string; category: string; description: string;
  dimensionTags: string[]; requiredSkills: string[]; educationLevel: string;
  salaryRange: string; suggestions: string
}

const loading = ref(false)
const searchQuery = ref('')
const dialogVisible = ref(false)
const editingId = ref('')
const tagsInput = ref('')
const skillsInput = ref('')

const careers = ref<CareerItem[]>([
  { id:'c1', name:'数据分析师', category:'技术', description:'负责收集处理和分析数据', dimensionTags:['logic','observation'], requiredSkills:['SQL','Python','统计学'], educationLevel:'本科', salaryRange:'15-35K', suggestions:'逻辑推理能力突出，适合数据分析' },
  { id:'c2', name:'产品经理', category:'产品', description:'规划产品方向并推动落地', dimensionTags:['logic','communication','execution'], requiredSkills:['需求分析','项目管理','沟通'], educationLevel:'本科', salaryRange:'20-40K', suggestions:'分析能力和执行力兼备' }
])

const dialogTitle = computed(() => editingId.value ? '编辑职业' : '添加职业')
const filteredCareers = computed(() => {
  if (!searchQuery.value) return careers.value
  const q = searchQuery.value.toLowerCase()
  return careers.value.filter(c => c.name.includes(q) || c.dimensionTags.some(t => t.includes(q)) || c.category.includes(q))
})

function handleAdd() {
  editingId.value = ''
  form.value = { name:'', category:'', description:'', educationLevel:'', salaryRange:'', suggestions:'' }
  tagsInput.value = ''
  skillsInput.value = ''
  dialogVisible.value = true
}

function handleEdit(row: CareerItem) {
  editingId.value = row.id
  form.value = { name:row.name, category:row.category, description:row.description, educationLevel:row.educationLevel, salaryRange:row.salaryRange, suggestions:row.suggestions }
  tagsInput.value = row.dimensionTags.join(',')
  skillsInput.value = row.requiredSkills.join(',')
  dialogVisible.value = true
}

function handleSave() {
  if (!form.value.name) { ElMessage.warning('请输入职业名称'); return }
  const entry = {
    ...form.value,
    dimensionTags: tagsInput.value.split(',').map(s=>s.trim()).filter(Boolean),
    requiredSkills: skillsInput.value.split(',').map(s=>s.trim()).filter(Boolean)
  }
  if (editingId.value) {
    const idx = careers.value.findIndex(c => c.id === editingId.value)
    if (idx !== -1) { careers.value[idx] = { ...careers.value[idx], ...entry }; ElMessage.success('更新成功') }
  } else {
    careers.value.unshift({ id:'c'+Date.now(), ...entry } as CareerItem)
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}

function handleDelete(row: CareerItem) {
  ElMessageBox.confirm(`确认删除"${row.name}"吗？`,'警告',{type:'warning'}).then(() => {
    careers.value = careers.value.filter(c => c.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(()=>{})
}

function handleImport() {
  ElMessage.info('批量导入功能开发中')
}

const form = ref({ name:'', category:'', description:'', educationLevel:'', salaryRange:'', suggestions:'' })
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.page-header h2 { margin:0; }
.filter-card { margin-bottom:16px; }
</style>
