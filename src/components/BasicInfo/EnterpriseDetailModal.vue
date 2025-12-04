<template>
  <el-dialog v-model="visible" title="企业信息介绍" width="860px" append-to-body>
    <div v-if="detailRow" class="intro-grid">
      <div class="intro-section">
        <div class="intro-title">基本属性</div>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="成立日期">—</el-descriptions-item>
          <el-descriptions-item label="注册地">—</el-descriptions-item>
          <el-descriptions-item label="注册资本">—</el-descriptions-item>
          <el-descriptions-item label="实收资本">—</el-descriptions-item>
          <el-descriptions-item label="企业性质">—</el-descriptions-item>
          <el-descriptions-item label="监管机关">—</el-descriptions-item>
          <el-descriptions-item label="高管人员">—</el-descriptions-item>
          <el-descriptions-item label="法人">—</el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="intro-section">
        <div class="intro-title">行业属性</div>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="生产/贸易/混合型">—</el-descriptions-item>
          <el-descriptions-item label="产业类别">{{ detailRow.category }}</el-descriptions-item>
          <el-descriptions-item label="专精特新">—</el-descriptions-item>
          <el-descriptions-item label="地区">{{ detailRow.region }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EnterpriseRow } from '@/types'

const props = defineProps<{
  modelValue: boolean
  detailRow: EnterpriseRow | null
}>()

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<style scoped>
.intro-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.intro-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
  border-left: 4px solid #409eff;
  padding-left: 8px;
}
</style>
