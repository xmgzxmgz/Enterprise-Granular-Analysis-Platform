<template>
  <div class="header-wrap">
    <div class="left">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          v-for="(c, idx) in crumbItems"
          :key="idx"
          class="crumb-item"
          @click="onCrumbClick(idx)"
        >{{ c.label }}</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="search">
        <el-input v-model="keyword" placeholder="搜索页面/功能" clearable @keyup.enter="onSearch" />
      </div>
    </div>
    <div class="right">
      <el-tag type="info">Enterprise Granular Analysis Platform</el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter, RouteLocationMatched } from 'vue-router'

const route = useRoute()
const router = useRouter()
const keyword = ref('')

const crumbItems = computed<{ label: string; name?: string }[]>(() => {
  const matched = route.matched as RouteLocationMatched[]
  if (matched.length) {
    const labels = matched.map((m) => (Array.isArray(m.meta?.breadcrumb) ? (m.meta!.breadcrumb as string[]) : [m.name as string || m.path]))
    const flat = ([] as string[]).concat(...labels)
    return flat.map((label, i) => ({ label, name: matched[i]?.name as string | undefined }))
  }
  const metaCrumbs = route.meta?.breadcrumb as string[] | undefined
  if (metaCrumbs && metaCrumbs.length) return metaCrumbs.map((l) => ({ label: l }))
  const parts = route.path.split('/').filter(Boolean).map((p) => decodeURIComponent(p))
  return parts.map((l) => ({ label: l }))
})

const onCrumbClick = (index: number) => {
  const matched = route.matched
  const rec = matched[index]
  if (rec?.name) router.push({ name: rec.name as string })
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
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
.left { color: var(--text-primary); }
.right { color: var(--text-secondary); }
.crumb-item { cursor: pointer; }
.search { margin-left: 12px; width: 300px; display: inline-block; }
</style>