<template>
  <div class="panel">
    <el-result icon="success" title="发布中心" sub-title="暂未发布，可在完成标签配置后进行发布">
      <template #extra>
        <el-button type="primary">立即发布</el-button>
        <el-button>查看草稿</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.panel { padding: 24px; }
</style>