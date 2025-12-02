<template>
  <div class="wrap">
    <el-card>
      <div class="title">标签企业列表：{{ tagName }}</div>
      <el-alert v-if="error" type="error" :title="'后端不可联通或错误'" show-icon closable />
      <el-empty v-else-if="!rows.length" description="无企业拥有该标签或后端无数据" />
      <el-table v-else :data="rows" height="520">
        <el-table-column prop="name" label="企业" width="200" />
        <el-table-column prop="category" label="类别" width="120" />
        <el-table-column prop="region" label="地区" width="120" />
        <el-table-column prop="risk" label="风险等级" width="120" />
        <el-table-column label="标签" min-width="420">
          <template #default="{ row }">
            <div class="tags-inline">
              <el-tag
                v-for="(t, i) in row.displayTags"
                :key="row.name + '-' + i"
                size="small"
                :class="t.color === 'grey' ? 'tag-grey' : ''"
                :type="t.color === 'grey' ? 'info' : 'primary'"
                :effect="t.color === 'grey' ? 'plain' : undefined"
              >{{ t.name }}</el-tag>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
  
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getEnterpriseBasicInfo } from '@/services/api'

type Row = { name: string; category: string; region: string; risk: string; manualTags?: string[]; modelTags?: string[]; displayTags: { name: string; color: 'grey' | 'blue' }[] }

const route = useRoute()
const tagName = ref(String(route.query.tag || ''))
const rows = ref<Row[]>([])
const error = ref(false)

onMounted(async () => {
  try {
    const data = await getEnterpriseBasicInfo()
    const list: Row[] = []
    for (const r of data?.rows || []) {
      const manuals: string[] = r.manualTags || r.tagsManual || []
      const models: string[] = r.modelTags || r.tagsModel || []
      const owns = new Set([...(manuals || []), ...(models || [])])
      if (!tagName.value || !owns.has(tagName.value)) continue
      const disp: { name: string; color: 'grey' | 'blue' }[] = []
      if (manuals.includes(tagName.value)) disp.push({ name: tagName.value, color: 'grey' })
      else if (models.includes(tagName.value)) disp.push({ name: tagName.value, color: 'blue' })
      for (const t of manuals) if (t !== tagName.value) disp.push({ name: t, color: 'grey' })
      for (const t of models) if (t !== tagName.value) disp.push({ name: t, color: 'blue' })
      list.push({ name: r.name, category: r.category, region: r.region, risk: r.risk, manualTags: manuals, modelTags: models, displayTags: disp })
    }
    rows.value = list
  } catch { error.value = true }
})
</script>

<style scoped>
.wrap { padding: 16px; }
.title { font-weight: 600; margin-bottom: 8px; }
.tags-inline { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.tag-grey { --el-tag-bg-color: #374151; --el-tag-text-color: #e5e7eb; }
</style>

