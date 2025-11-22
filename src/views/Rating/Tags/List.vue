<template>
  <div class="wrap">
    <el-card>
      <div class="title">标签列表</div>
      <el-table :data="rows" height="420">
        <el-table-column prop="name" label="标签" width="180" />
        <el-table-column prop="desc" label="说明" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const rows = ref([
  { name: '价格指纹风险高', desc: '价格波动异常，风险较高' },
  { name: '物流指纹风险低', desc: '物流稳定，风险较低' }
])
</script>

<style scoped>
.wrap { padding: 16px; }
.title { font-weight: 600; margin-bottom: 8px; }
</style>