<template>
  <div class="wrap">
    <el-card>
      <div class="title">政策惠企</div>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索政策名称/标签" style="max-width: 240px" />
        <el-select v-model="tag" placeholder="选择标签" style="max-width: 200px">
          <el-option label="税收" value="税收" />
          <el-option label="通关" value="通关" />
          <el-option label="补贴" value="补贴" />
        </el-select>
      </div>
      <el-table :data="filtered" height="420">
        <el-table-column prop="name" label="政策名称" width="240" />
        <el-table-column prop="dept" label="部门" width="160" />
        <el-table-column prop="tag" label="标签" width="120" />
        <el-table-column prop="desc" label="说明" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
const keyword = ref('')
const tag = ref<string | undefined>(undefined)
const rows = ref([
  { name: '出口退税优惠', dept: '税务局', tag: '税收', desc: '针对外贸企业的退税政策' },
  { name: '快速通关试点', dept: '海关', tag: '通关', desc: '压缩通关时间，提高效率' },
  { name: '外贸数字化补贴', dept: '发改委', tag: '补贴', desc: '支持企业数字化改造' }
])
const filtered = computed(() => {
  const k = keyword.value.trim()
  return rows.value.filter((r) => (!tag.value || r.tag === tag.value) && (!k || JSON.stringify(r).includes(k)))
})
</script>

<style scoped>
.wrap { padding: 16px; }
.title { font-weight: 600; margin-bottom: 8px; }
.toolbar { display: flex; gap: 8px; margin-bottom: 8px; }
</style>