<template>
  <div class="users-page">
    <h2>用户管理</h2>
    <el-table :data="[]" border style="width: 100%">
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="createdAt" label="注册时间" />
      <el-table-column prop="testCount" label="测评次数" />
      <el-table-column label="操作" width="200">
        <template #default>
          <el-button type="primary" link>查看详情</el-button>
          <el-button type="danger" link>禁用</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.users-page h2 {
  margin: 0 0 20px 0;
}
</style>
