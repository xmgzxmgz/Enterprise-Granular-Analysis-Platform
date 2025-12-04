<template>
  <div class="search-wrap">
    <el-autocomplete
      v-model="localKeyword"
      class="search-input"
      size="large"
      :fetch-suggestions="fetchSuggestions"
      placeholder="输入企业名称进行搜索（支持联想）"
      clearable
      trigger-on-focus
      :debounce="80"
      highlight-first-item
      @select="onSelectSuggestion"
      @keyup.enter="onSearch"
    />
    <div class="hint">搜索后将跳转至独立结果页并按当前排版展示企业</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getEtpsData } from '@/services/api'

const localKeyword = ref('')
const etpsCache = ref<string[]>([])
let seq = 0
const router = useRouter()

const fetchSuggestions = async (q: string, cb: (list: { value: string }[]) => void) => {
  const id = ++seq
  const k = q.trim()
  try {
    const resp = await getEtpsData({ q: k, size: 20 })
    const rows: any[] = resp?.rows || resp || []
    let names = rows
      .map((r) =>
        String(
          (r as any).etps_name ||
            (r as any).etpsName ||
            (r as any).consignee_enterprise ||
            (r as any).name ||
            ''
        )
      )
      .filter((n) => !!n)
    if (!names.length) {
      if (!etpsCache.value.length) {
        const all = await getEtpsData({ q: '', size: 100 })
        const aRows: any[] = all?.rows || all || []
        etpsCache.value = aRows
          .map((r) =>
            String(
              (r as any).etps_name ||
                (r as any).etpsName ||
                (r as any).consignee_enterprise ||
                (r as any).name ||
                ''
            )
          )
          .filter((n) => !!n)
      }
      names = etpsCache.value.filter((n) => (!k ? true : n.includes(k)))
    }
    if (id !== seq) return
    cb(names.slice(0, 10).map((n) => ({ value: n })))
  } catch {
    const fallback = etpsCache.value
      .filter((n) => (!k ? true : n.includes(k)))
      .slice(0, 10)
      .map((n) => ({ value: n }))
    cb(fallback)
  }
}

const onSelectSuggestion = (item: { value: string }) => {
  localKeyword.value = item.value
  onSearch()
}

const onSearch = () => {
  const q = localKeyword.value.trim()
  if (!q) return
  router.push({ name: '企业详情', query: { name: q } })
}
</script>

<style scoped>
.search-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}
.search-input {
  width: 600px;
}
.hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
