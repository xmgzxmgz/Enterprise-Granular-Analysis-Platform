<template>
  <div class="header-wrap">
    <div class="left">
      <el-breadcrumb separator="/" class="crumb">
        <el-breadcrumb-item
          v-for="(c, idx) in crumbItems"
          :key="idx"
          class="crumb-item"
          @click="onCrumbClick(idx)"
          >{{ c.label }}</el-breadcrumb-item
        >
      </el-breadcrumb>
      <el-input
        v-model="keyword"
        class="search-input"
        size="large"
        placeholder="搜索页面/功能"
        clearable
        @keyup.enter="onSearch"
      />
    </div>
    <div class="right">
      <el-tag type="info">Enterprise Granular Analysis Platform</el-tag>
      <el-popover placement="bottom-end" width="420" trigger="click">
        <template #reference>
          <el-badge :value="notifications.length" :max="99">
            <el-button size="small" type="primary" plain>消息</el-button>
          </el-badge>
        </template>
        <div class="notify-list">
          <div class="notify-header">
            <span>消息通知</span>
            <el-button link size="small" @click="clearNotifications"
              >清空</el-button
            >
          </div>
          <div v-if="!notifications.length" class="notify-empty">暂无消息</div>
          <div v-else class="notify-items">
            <div v-for="n in notifications" :key="n.id" class="notify-item">
              <el-tag
                :type="
                  n.type === 'error'
                    ? 'danger'
                    : n.type === 'success'
                    ? 'success'
                    : n.type === 'warning'
                    ? 'warning'
                    : 'info'
                "
                size="small"
                >{{ n.type }}</el-tag
              >
              <div class="notify-content">
                <div class="notify-title">{{ n.title }}</div>
                <div class="notify-message" v-if="n.message">
                  {{ n.message }}
                </div>
                <div class="notify-time">{{ formatTime(n.time) }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { notifications, clearNotifications } from "@/composables/notifyBus";

const route = useRoute();
const router = useRouter();
const keyword = ref("");

const crumbItems = computed<{ label: string; name?: string }[]>(() => {
  const matched = route.matched;
  // 优先使用当前匹配链的名称，避免重复拼接 meta.breadcrumb
  const items = matched.map((m) => ({
    label: String(m.name ?? m.path),
    name: String(m.name ?? ""),
  }));
  return items;
});

const onCrumbClick = (index: number) => {
  const rec = route.matched[index];
  if (rec?.name) router.push({ name: String(rec.name) });
};

const onSearch = () => {
  const k = keyword.value.trim();
  if (!k) return;
  const mapping: Record<string, { name: string; path?: string }> = {
    两用物项: { name: "两用物项" },
    冷冻水产品: { name: "冷冻水产品" },
    数频分配: { name: "数频分配" },
    企业基本信息: { name: "企业基本信息" },
    标签列表: { name: "标签列表" },
    切面分析: { name: "切面分析" },
    政策惠企: { name: "政策惠企" },
  };
  const key = Object.keys(mapping).find((x) => x.includes(k) || k.includes(x));
  if (key) router.push({ name: mapping[key].name });
};

const formatTime = (t: number) => {
  const d = new Date(t);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
</script>

<style scoped>
.header-wrap {
  min-height: 80px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 16px;
}
.left {
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 70%;
}
.right {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 30%;
}
.notify-list {
  max-height: 420px;
  overflow: auto;
}
.notify-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.notify-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.notify-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 6px;
}
.notify-content {
  flex: 1;
}
.notify-title {
  font-weight: 600;
}
.notify-message {
  color: var(--text-secondary);
}
.notify-time {
  font-size: 12px;
  color: var(--text-secondary);
}
.notify-empty {
  color: var(--text-secondary);
}
.crumb-item {
  cursor: pointer;
}
.crumb {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.search-input {
  width: 100%;
}
</style>
