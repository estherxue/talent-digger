<template>
  <div class="tests-page">
    <div class="page-header">
      <h2>题库管理</h2>
      <el-button type="primary" @click="handleAdd">添加测评</el-button>
    </div>
    <el-card class="filter-card">
      <el-input v-model="searchQuery" placeholder="搜索测评名称..." style="width: 300px" clearable />
      <el-select v-model="filterCategory" placeholder="分类筛选" clearable style="width: 180px; margin-left: 16px">
        <el-option label="天赋测评" value="talent" />
        <el-option label="职业兴趣" value="interest" />
        <el-option label="性格测试" value="personality" />
      </el-select>
    </el-card>
    <el-card>
      <el-table :data="filteredTests" border stripe v-loading="loading">
        <el-table-column prop="name" label="测评名称" min-width="200" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="categoryType(row.category)">{{ categoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="questionCount" label="题目数量" width="100" />
        <el-table-column prop="estimatedMinutes" label="预估时长" width="100">
          <template #default="{ row }">{{ row.estimatedMinutes }}分钟</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">{{ row.status === 'published' ? '已发布' : '草稿' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="info" link @click="handleManageQuestions(row)">管理题目</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="测评名称" required>
          <el-input v-model="form.name" placeholder="如：天赋罗盘测试" />
        </el-form-item>
        <el-form-item label="分类" required>
          <el-select v-model="form.category" style="width:100%">
            <el-option label="天赋测评" value="talent" />
            <el-option label="职业兴趣" value="interest" />
            <el-option label="性格测试" value="personality" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="预估时长(分钟)">
          <el-input-number v-model="form.estimatedMinutes" :min="1" :max="120" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="published">已发布</el-radio>
            <el-radio value="draft">草稿</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { testApi } from '@/api'

interface TestItem {
  id: string; name: string; category: string; description: string;
  questionCount: number; estimatedMinutes: number; status: string; dimensions: any[]
}

const loading = ref(false)
const searchQuery = ref('')
const filterCategory = ref('')
const dialogVisible = ref(false)
const editingId = ref('')
const tests = ref<TestItem[]>([])
const form = ref({ name:'', category:'talent', description:'', estimatedMinutes:15, status:'draft' })

const dialogTitle = computed(() => editingId.value ? '编辑测评' : '添加测评')
const filteredTests = computed(() => {
  return tests.value.filter(t => {
    const matchSearch = !searchQuery.value || t.name.includes(searchQuery.value)
    const matchCategory = !filterCategory.value || t.category === filterCategory.value
    return matchSearch && matchCategory
  })
})

function categoryType(c: string) { return c === 'talent' ? '' : c === 'interest' ? 'warning' : 'info' }
function categoryLabel(c: string) {
  const map: Record<string,string> = { talent:'天赋测评', interest:'职业兴趣', personality:'性格测试' }
  return map[c] || c
}

onMounted(async () => {
  loading.value = true
  try {
    const res: any = await testApi.list()
    if (res?.data) tests.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function handleAdd() {
  editingId.value = ''
  form.value = { name:'', category:'talent', description:'', estimatedMinutes:15, status:'draft' }
  dialogVisible.value = true
}

function handleEdit(row: TestItem) {
  editingId.value = row.id
  form.value = { name:row.name, category:row.category, description:row.description, estimatedMinutes:row.estimatedMinutes, status:row.status }
  dialogVisible.value = true
}

function handleSave() {
  if (!form.value.name) { ElMessage.warning('请输入测评名称'); return }
  // TODO: v2 阶段对接后端 API - testApi.create() / testApi.update()
  if (editingId.value) {
    const idx = tests.value.findIndex(t => t.id === editingId.value)
    if (idx !== -1) { tests.value[idx] = { ...tests.value[idx], ...form.value }; ElMessage.success('更新成功') }
  } else {
    tests.value.push({ id:'t'+Date.now(), ...form.value, questionCount:0, dimensions:[] })
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}

function handleDelete(row: TestItem) {
  ElMessageBox.confirm(`确认删除"${row.name}"吗？`, '警告', { type:'warning' }).then(() => {
    // TODO: v2 阶段对接后端 API - testApi.delete(row.id)
    tests.value = tests.value.filter(t => t.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function handleManageQuestions(row: TestItem) {
  ElMessage.info('题目管理功能将在后续版本实现，当前可通过数据库直接管理')
}
</script>

<style scoped>
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.page-header h2 { margin:0; }
.filter-card { margin-bottom:16px; }
</style>
