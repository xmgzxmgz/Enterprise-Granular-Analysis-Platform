<template>
  <div class="header-wrap">
    <div class="left">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, idx) in crumbs" :key="idx">{{ item }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="right">
      <el-tag type="info">Enterprise Granular Analysis Platform</el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const crumbs = computed<string[]>(() => {
  const metaCrumbs = route.meta?.breadcrumb as string[] | undefined
  if (metaCrumbs && metaCrumbs.length) return metaCrumbs
  const parts = route.fullPath.split('/').filter(Boolean)
  return parts
})
</script>

<style scoped>
.header-wrap {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
.left { color: var(--text-primary); }
.right { color: var(--text-secondary); }
</style>