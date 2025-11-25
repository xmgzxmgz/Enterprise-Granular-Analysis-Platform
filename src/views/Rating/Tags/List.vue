<template>
  <div class="wrap">
    <el-card>
      <div class="title">标签列表</div>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索标签" clearable style="max-width: 240px" />
      </div>
      <el-alert v-if="error" type="error" :title="'后端不可联通或错误'" show-icon closable />
      <el-empty v-else-if="!filtered.length" description="后端无数据或未匹配到结果" />
      <el-table v-else :data="filtered" height="420">
        <el-table-column prop="name" label="标签" width="180" />
        <el-table-column prop="desc" label="说明" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getTags } from '@/services/api'
const keyword = ref('')
const rows = ref<{ name: string; desc: string }[]>([])
const error = ref(false)
onMounted(async () => {
  try { const data = await getTags(); rows.value = data?.rows || [] } catch { error.value = true }
})
watch(keyword, async (k) => {
  const q = k.trim()
  if (!q) return
  try { const data = await getTags(q); rows.value = data?.rows || rows.value } catch { error.value = true }
})
const filtered = computed(() => {
  const k = keyword.value.trim()
  return rows.value.filter((r) => !k || r.name.includes(k) || r.desc.includes(k))
})
</script>

<style scoped>
.wrap { padding: 16px; }
.title { font-weight: 600; margin-bottom: 8px; }
.toolbar { margin-bottom: 8px; }
</style>
