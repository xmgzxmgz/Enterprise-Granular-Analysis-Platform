<template>
  <el-config-provider namespace="el">
    <el-container class="app-container">
      <el-header class="app-header">
        <AppHeader />
      </el-header>
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import AppHeader from "@/components/AppHeader.vue";

const width = ref(window.innerWidth);
const onResize = () => (width.value = window.innerWidth);
onMounted(() => window.addEventListener("resize", onResize));
onUnmounted(() => window.removeEventListener("resize", onResize));

const isMobile = computed(() => width.value < 920);
</script>

<style scoped>
.app-container {
  height: 100vh;
}
.app-header {
  border-bottom: 1px solid var(--border-color);
  background: var(--header-bg);
  min-height: 96px;
  padding: 8px 16px;
}
.app-main {
  padding: 0;
  background: var(--main-bg);
  min-height: calc(100vh - 96px);
}
</style>
