<template>
  <div class="page-wrap">
    <div class="top-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="建模" name="modeling" />
        <el-tab-pane label="调优" name="tuning" />
        <el-tab-pane label="发布" name="publish" />
      </el-tabs>
    </div>
    <div v-if="activeTab === 'modeling'" class="content">
      <ModelingPanel />
    </div>
    <div v-else-if="activeTab === 'tuning'" class="content">
      <TuningPanel />
    </div>
    <div v-else class="content">
      <PublishPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import ModelingPanel from "./components/ModelingPanel.vue";
import TuningPanel from "./components/TuningPanel.vue";
import PublishPanel from "./components/PublishPanel.vue";

const activeTab = ref<"modeling" | "tuning" | "publish">("modeling");
const route = useRoute();
const syncTab = () => {
  const t = String(route.query.tab || "");
  if (t === "tuning" || t === "publish" || t === "modeling") {
    activeTab.value = t as any;
  }
};
syncTab();
watch(() => route.query.tab, syncTab);
</script>

<style scoped>
.page-wrap {
  padding: 16px;
}
.top-tabs {
  margin-bottom: 12px;
}
.content {
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}
</style>
