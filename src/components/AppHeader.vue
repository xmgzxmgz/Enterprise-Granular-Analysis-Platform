<template>
  <div class="header-wrap">
    <div class="left">
      <el-breadcrumb separator="/" class="crumb">
        <el-breadcrumb-item
          v-for="(c, idx) in crumbItems"
          :key="idx"
          class="crumb-item"
          @click="onCrumbClick(idx)"
        >{{ c.label }}</el-breadcrumb-item>
      </el-breadcrumb>
      <el-input v-model="keyword" class="search-input" size="large" placeholder="搜索页面/功能" clearable @keyup.enter="onSearch" />
    </div>
    <div class="right">
      <el-tag type="info">Enterprise Granular Analysis Platform</el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const keyword = ref('')

const crumbItems = computed<{ label: string; name?: string }[]>(() => {
  const matched = route.matched
  // 优先使用当前匹配链的名称，避免重复拼接 meta.breadcrumb
  const items = matched.map((m) => ({ label: String(m.name ?? m.path), name: String(m.name ?? '') }))
  return items
})

const onCrumbClick = (index: number) => {
  const rec = route.matched[index]
  if (rec?.name) router.push({ name: String(rec.name) })
}

const onSearch = () => {
  const k = keyword.value.trim()
  if (!k) return
  const mapping: Record<string, { name: string; path?: string }> = {
    '两用物项': { name: '两用物项' },
    '冷冻水产品': { name: '冷冻水产品' },
    '数频分配': { name: '数频分配' },
    '企业基本信息': { name: '企业基本信息' },
    '标签列表': { name: '标签列表' },
    '切面分析': { name: '切面分析' },
    '政策惠企': { name: '政策惠企' }
  }
  const key = Object.keys(mapping).find((x) => x.includes(k) || k.includes(x))
  if (key) router.push({ name: mapping[key].name })
}
</script>

<style scoped>
.header-wrap {
  min-height: 80px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 16px;
}
.left { color: var(--text-primary); display: flex; flex-direction: column; gap: 6px; width: 70%; }
.right { color: var(--text-secondary); display: flex; align-items: center; justify-content: flex-end; width: 30%; }
.crumb-item { cursor: pointer; }
.crumb { width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.search-input { width: 100%; }
</style>