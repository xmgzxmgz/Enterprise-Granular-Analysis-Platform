<template>
  <div class="sidebar">
    <el-menu
      :default-active="defaultActive"
      :default-openeds="openeds"
      :collapse="isMobile"
      class="el-menu-vertical-demo"
      :unique-opened="false"
      :router="true"
    >
      <el-menu-item index="/home" class="home-btn">
        <el-icon><HomeFilled /></el-icon>
        <span>返回主页面</span>
      </el-menu-item>
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
            <el-menu-item
              index="/theme-management/出口风险分类/敏感物品管控/两用物项"
              >两用物项</el-menu-item
            >
          </el-sub-menu>
          <el-sub-menu index="1-1-2">
            <template #title>
              <span>重点物品</span>
            </template>
            <el-menu-item
              index="/theme-management/出口风险分类/重点物品/冷冻水产品"
              >冷冻水产品</el-menu-item
            >
          </el-sub-menu>
          <el-sub-menu index="1-1-3">
            <template #title>
              <span>跨境电商出口敏感指标数频分配</span>
            </template>
            <el-menu-item
              index="/theme-management/出口风险分类/跨境电商出口敏感指标数频分配/数频分配"
              >数频分配</el-menu-item
            >
          </el-sub-menu>
        </el-sub-menu>
        <el-menu-item index="/theme-management/政策惠企">政策惠企</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="2">
        <template #title>
          <span>企业分类评级画像</span>
        </template>
        <el-menu-item index="/rating-profile/基本信息"
          >企业基本信息</el-menu-item
        >
        <el-sub-menu index="2-2">
          <template #title>
            <span>标签管理</span>
          </template>
          <el-menu-item index="/rating-profile/标签管理/标签列表"
            >标签列表</el-menu-item
          >
          <el-menu-item index="/rating-profile/标签管理/切面分析"
            >切面分析</el-menu-item
          >
        </el-sub-menu>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import { HomeFilled } from "@element-plus/icons-vue";

defineProps<{ isMobile: boolean }>();

const route = useRoute();
const defaultActive = computed(() => route.fullPath);
const height = ref(window.innerHeight);
const onResize = () => (height.value = window.innerHeight);
onMounted(() => window.addEventListener("resize", onResize));
onUnmounted(() => window.removeEventListener("resize", onResize));
const openeds = computed(() => {
  if (height.value > 780)
    return ["1", "1-1", "1-1-1", "1-1-2", "1-1-3", "2", "2-2"];
  if (height.value > 640) return ["1", "1-1", "2"];
  return ["1"];
});
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
  --el-menu-level-indent: 18px;
}
.el-sub-menu__title,
.el-menu-item {
  border-radius: 8px;
  margin: 2px 8px;
}
.el-menu-item.is-active {
  border-left: 3px solid var(--accent);
}
.el-sub-menu__title:hover,
.el-menu-item:hover {
  background: linear-gradient(
    90deg,
    rgba(59, 130, 246, 0.08),
    rgba(59, 130, 246, 0)
  );
}
.el-menu-vertical-demo .el-menu-item {
  line-height: 40px;
}
.home-btn {
  background: linear-gradient(180deg, #60a5fa, #3b82f6);
  color: #fff;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.35);
}
.home-btn :deep(.el-icon),
.home-btn :deep(span) {
  color: #fff;
}
</style>
