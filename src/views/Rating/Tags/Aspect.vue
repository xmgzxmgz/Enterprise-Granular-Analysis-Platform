<template>
  <div class="wrap">
    <el-card>
      <div class="title">切面分析</div>
      <el-descriptions title="样例切面" :column="2" border>
        <el-descriptions-item label="价格">波动指数 78</el-descriptions-item>
        <el-descriptions-item label="物流">时效指数 62</el-descriptions-item>
        <el-descriptions-item label="属地">集中度 0.6</el-descriptions-item>
        <el-descriptions-item label="合规">记录 2 次</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.wrap { padding: 16px; }
.title { font-weight: 600; margin-bottom: 8px; }
</style>