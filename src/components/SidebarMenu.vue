<template>
  <div class="sidebar">
    <el-menu
      :default-active="defaultActive"
      :collapse="isMobile"
      class="el-menu-vertical-demo"
      :unique-opened="true"
      :router="true"
    >
      <el-sub-menu index="1">
        <template #title>
          <span>分类主题管理</span>
        </template>
        <el-sub-menu index="1-1">
          <template #title>
            <span>企业出口风险分类</span>
          </template>
          <el-sub-menu index="1-1-1">
            <template #title>
              <span>敏感物品管控</span>
            </template>
            <el-menu-item index="/theme-management/出口风险分类/敏感物品管控/两用物项">两用物项</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="1-1-2">
            <template #title>
              <span>重点物品</span>
            </template>
            <el-menu-item index="/theme-management/出口风险分类/重点物品/冷冻水产品">冷冻水产品</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="1-1-3">
            <template #title>
              <span>跨境电商出口敏感指标数频分配</span>
            </template>
            <el-menu-item index="/theme-management/出口风险分类/跨境电商出口敏感指标数频分配/数频分配">数频分配</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        <el-menu-item index="/theme-management/政策惠企">政策惠企</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="2">
        <template #title>
          <span>企业分类评级画像</span>
        </template>
        <el-menu-item index="/rating-profile/基本信息">企业基本信息</el-menu-item>
        <el-sub-menu index="2-2">
          <template #title>
            <span>标签管理</span>
          </template>
          <el-menu-item index="/rating-profile/标签管理/标签列表">标签列表</el-menu-item>
          <el-menu-item index="/rating-profile/标签管理/切面分析">切面分析</el-menu-item>
        </el-sub-menu>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps<{ isMobile: boolean }>()

const route = useRoute()
const defaultActive = computed(() => route.fullPath)
</script>

<style scoped>
.sidebar {
  height: 100%;
  padding: 8px 0;
}
.el-menu-vertical-demo {
  border-right: none;
  background: transparent;
  color: var(--text-primary);
}
</style>