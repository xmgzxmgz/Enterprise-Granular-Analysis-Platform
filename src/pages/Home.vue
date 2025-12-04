<template>
  <div class="home-wrap">
    <div class="center">
      <div class="main-title">导航中心</div>
      <div class="btn-grid">
        <el-card class="big-btn" @click="goTheme()">
          <div class="btn-title">分类主题管理</div>
          <div class="btn-desc">出口风险分类、敏感物品、跨境电商</div>
        </el-card>
        <el-card class="big-btn" @click="goRating()">
          <div class="btn-title">企业分类评级画像</div>
          <div class="btn-desc">企业基本信息、标签管理与分析</div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
const goTheme = () => router.push({ path: "/theme-management" });
const goRating = () => router.push({ path: "/rating-profile" });
</script>

<style scoped>
.home-wrap {
  height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.center {
  width: 980px;
}
.main-title {
  font-weight: 700;
  font-size: 28px;
  margin-bottom: 16px;
}
.btn-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.big-btn {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
}
.big-btn:hover {
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
}
.btn-title {
  font-weight: 700;
  font-size: 22px;
  color: var(--text-primary);
}
.btn-desc {
  margin-top: 6px;
  color: var(--text-secondary);
}
.nav-area {
  width: 1080px;
}
.selector-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}
.selector-title {
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 18px;
}
.tree-large {
  height: 560px;
  overflow: auto;
}
.tree-large :deep(.el-tree-node__content) {
  height: 42px;
  font-size: 16px;
}
.option-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
.option-item {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.option-item:hover {
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.15);
}
.opt-name {
  font-weight: 600;
  color: var(--text-primary);
}
</style>
