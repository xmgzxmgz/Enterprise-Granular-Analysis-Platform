<template>
  <div class="wrap">
    <el-card>
      <div class="title">企业基本信息搜索</div>
      <el-alert v-if="error" type="error" title="后端不可联通或错误" show-icon closable />

      <EnterpriseSearch />

      <EnterpriseDetailModal v-model="detailVisible" :detail-row="detailRow" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getEnterpriseBasicInfo, getTags } from '@/services/api'
import { notifyError } from '@/composables/notifyBus'
import type { EnterpriseRow } from '@/types'
import EnterpriseSearch from '@/components/BasicInfo/EnterpriseSearch.vue'
import EnterpriseDetailModal from '@/components/BasicInfo/EnterpriseDetailModal.vue'

const route = useRoute()
const cat = route.query.category as string | undefined
const focusName = route.query.focusName as string | undefined

const rows = ref<EnterpriseRow[]>([])
const error = ref(false)
const tagOptions = ref<string[]>([])
const detailVisible = ref(false)
const detailRow = ref<EnterpriseRow | null>(null)

// Keep loading logic but simplify template
onMounted(async () => {
  try {
    const data = await getEnterpriseBasicInfo(cat)
    rows.value = (data?.rows || []).map((r) => ({
      ...r,
      isNew: r.isNew ?? r.origin === 'model',
      tags: r.tags ?? [],
      manualTags: r.manualTags ?? r.tagsManual ?? r.tags ?? [],
      modelTags: r.modelTags ?? r.tagsModel ?? []
    }))

    if (focusName) {
      const idx = rows.value.findIndex((x) => x.name === focusName)
      if (idx > 0) {
        const [item] = rows.value.splice(idx, 1)
        rows.value.unshift(item)
      }
    }
  } catch (e: any) {
    error.value = true
    notifyError('后端不可联通或错误', String(e?.message ?? '网络错误'))
  }

  try {
    const t = await getTags()
    tagOptions.value = (t?.rows || []).map((x) => x.name ?? x.name)
  } catch {
    /* ignore */
  }
})
</script>

<style scoped>
.wrap {
  padding: 16px;
}
.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
</style>
