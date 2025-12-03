<template>
  <div class="wrap">
    <el-card>
      <div class="title">企业信息：{{ name }}</div>
      <el-alert v-if="error" type="error" :title="'后端不可联通或错误'" show-icon closable />
      <el-empty v-else-if="!row" description="未找到对应企业" />
      <div v-else class="detail-grid">
        <div class="grid">
          <div class="col">
            <div class="label">企业名称</div>
            <div class="value">{{ row.name }}</div>
          </div>
          <div class="col">
            <div class="label">类别</div>
            <div class="value">{{ row.category }}</div>
          </div>
          <div class="col">
            <div class="label">地区</div>
            <div class="value">{{ row.region }}</div>
          </div>
          <div class="col">
            <div class="label">风险等级</div>
            <div class="value">{{ row.risk }}</div>
          </div>
        </div>
        <div class="tags-inline">
          <div class="tags-clip" :class="{ expanded }" ref="tagClip">
            <el-tag v-for="(t, i) in row.manualTags || []" :key="row.name + '-m-' + i" size="small" class="tag-item tag-grey" effect="plain" type="info">{{ t }}</el-tag>
            <el-tag v-for="(t, i) in row.modelTags || []" :key="row.name + '-b-' + i" size="small" class="tag-item tag-blue" type="primary">{{ t }}</el-tag>
            <el-tag v-if="hasOverflow && !expanded" class="tag-item ellipsis-tag">···</el-tag>
          </div>
          <el-button v-if="hasOverflow || expanded" class="action-btn expand-btn" type="primary" plain size="small" round @click="expanded = !expanded">{{ expanded ? '收起 ▴' : '展开 ▾' }}</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getEnterpriseBasicInfo } from '@/services/api'

type Row = { name: string; category: string; region: string; risk: string; origin?: 'existing' | 'model'; isNew?: boolean; manualTags?: string[]; modelTags?: string[] }

const route = useRoute()
const name = ref(String(route.query.name || '').trim())
const row = ref<Row | null>(null)
const error = ref(false)
const tagClip = ref<HTMLElement | null>(null)
const hasOverflow = ref(false)
const expanded = ref(false)

onMounted(async () => {
  try {
    const data = await getEnterpriseBasicInfo()
    const all: Row[] = (data?.rows || []).map((r: any) => ({
      name: r.name,
      category: r.category,
      region: r.region,
      risk: r.risk,
      origin: r.origin,
      isNew: r.isNew ?? r.origin === 'model',
      manualTags: r.manualTags ?? r.tagsManual ?? r.tags ?? [],
      modelTags: r.modelTags ?? r.tagsModel ?? [],
    }))
    row.value = all.find((r) => r.name === name.value) || null
    setTimeout(() => {
      const el = tagClip.value
      if (el) hasOverflow.value = el.scrollHeight > el.clientHeight + 2
    }, 0)
  } catch { error.value = true }
})
</script>

<style scoped>
.wrap { padding: 16px; }
.title { font-weight: 600; margin-bottom: 8px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.col .label { color: var(--text-secondary); font-size: 12px; }
.col .value { font-weight: 600; }
.tags-inline { display: flex; align-items: flex-start; gap: 8px; width: 100%; border-top: 1px dashed var(--border-color); padding-top: 8px; margin-top: 8px; }
.tags-clip { flex: 1; display: flex; flex-wrap: wrap; gap: 4px; overflow: hidden; --tag-height: 26px; --row-gap: 4px; max-height: calc(var(--tag-height) * 3 + var(--row-gap) * 2); position: relative; }
.tags-clip.expanded { max-height: none; }
.ellipsis-tag { position: absolute; right: 0; bottom: 0; height: var(--tag-height); line-height: var(--tag-height); border: 1px solid #ef4444; color: #111827; background: #fff; }
.action-btn { height: 28px; }
.expand-btn { margin-left: 4px; }
.tag-grey { --el-tag-bg-color: #374151; --el-tag-text-color: #e5e7eb; }
</style>
