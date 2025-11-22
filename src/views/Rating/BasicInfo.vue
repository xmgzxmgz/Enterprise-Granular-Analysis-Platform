<template>
  <div class="wrap">
    <el-card>
      <div class="title">企业基本信息</div>
      <el-table :data="rows" height="420">
        <el-table-column prop="name" label="企业" width="160" />
        <el-table-column prop="category" label="类别" width="120" />
        <el-table-column prop="region" label="地区" width="120" />
        <el-table-column prop="risk" label="风险等级" width="120" />
      </el-table>
    </el-card>
  </div>
 </template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const cat = route.query.category as string | undefined
const rows = ref([
  { name: '企业A', category: cat || '极高', region: '北京', risk: '极高' },
  { name: '企业B', category: cat || '高', region: '上海', risk: '高' }
])
</script>

<style scoped>
.wrap { padding: 16px; }
.title { font-weight: 600; margin-bottom: 8px; }
</style>