<template>
  <el-config-provider namespace="el">
    <el-container class="app-container">
      <el-aside :width="asideWidth" class="app-aside" :class="{ collapsed: isMobile }">
        <SidebarMenu :is-mobile="isMobile" />
      </el-aside>
      <el-container>
        <el-header class="app-header">
          <AppHeader />
        </el-header>
        <el-main class="app-main">
          <router-view />
          <div class="placeholder">
            <el-empty description="右侧内容留白，后续按页面需求填充" />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import AppHeader from '@/components/AppHeader.vue'

const width = ref(window.innerWidth)
const onResize = () => (width.value = window.innerWidth)
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const isMobile = computed(() => width.value < 920)
const asideWidth = computed(() => (isMobile.value ? '64px' : '260px'))
</script>

<style scoped>
.app-container {
  height: 100vh;
}
.app-aside {
  border-right: 1px solid var(--border-color);
  background: var(--sidebar-bg);
}
.app-aside.collapsed {
  overflow: hidden;
}
.app-header {
  border-bottom: 1px solid var(--border-color);
  background: var(--header-bg);
}
.app-main {
  padding: 0;
  background: var(--main-bg);
}
.placeholder {
  padding: 24px;
}
</style>