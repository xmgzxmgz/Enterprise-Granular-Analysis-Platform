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
      <el-autocomplete
        v-model="keyword"
        class="search-input"
        size="large"
        :fetch-suggestions="querySearch"
        placeholder="搜索页面/功能（支持拼音/首字母）"
        clearable
        trigger-on-focus
        :debounce="80"
        @select="onSelectSuggestion"
        @keyup.enter="onSearch"
      />
    </div>
    <div class="right">
      <el-tag type="info" size="large">福州海关EGAP系统</el-tag>
      <el-popover placement="bottom-end" width="420" trigger="click">
        <template #reference>
          <el-badge :value="notifications.length" :max="99">
            <el-button size="large" type="primary" plain>消息</el-button>
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

type Crumb = { label: string; to: { name?: string; path?: string } };
const crumbItems = computed<Crumb[]>(() => {
  const items: Crumb[] = [{ label: "首页", to: { path: "/home" } }];
  const matched = route.matched;
  const themeContainers = new Set([
    "分类主题管理",
    "企业出口风险分类",
    "敏感物品管控",
    "重点物品",
    "跨境电商出口敏感指标数频分配",
  ]);
  const ratingContainers = new Set(["企业分类评级画像", "标签管理"]);
  for (const m of matched) {
    const nm = String(m.name ?? "");
    if (!nm) continue;
    if (nm === "首页") continue;
    if (themeContainers.has(nm)) {
      items.push({ label: nm, to: { path: "/theme-management" } });
      continue;
    }
    if (ratingContainers.has(nm)) {
      items.push({ label: nm, to: { path: "/rating-profile" } });
      continue;
    }
    items.push({
      label: nm || String(m.path),
      to: nm ? { name: nm } : { path: m.path },
    });
  }
  return items;
});

const onCrumbClick = (index: number) => {
  const c = crumbItems.value[index];
  if (c?.to) router.push(c.to as any);
};

const onSearch = () => {
  const k = keyword.value.trim();
  if (!k) return;
  const rec = fuzzyMatch(k);
  if (rec) {
    if (rec.route?.name || rec.route?.path) router.push(rec.route as any);
    else router.push({ name: rec.name });
  }
};

type DictItem = {
  name: string;
  aliases: string[];
  route?: { name?: string; path?: string; query?: Record<string, any> };
};
const dictionary: DictItem[] = [
  {
    name: "两用物项",
    aliases: ["lywx", "lianyongwuxiang", "liangyongwuxiang"],
    route: { name: "两用物项" },
  },
  {
    name: "冷冻水产品",
    aliases: ["ldscp", "lengdongshuichanpin"],
    route: { name: "冷冻水产品" },
  },
  {
    name: "数频分配",
    aliases: ["spfp", "shupinfenpei"],
    route: { name: "数频分配" },
  },
  {
    name: "企业基本信息",
    aliases: ["qybxxx", "qiyebasexinxi", "qiyebijiaoxinxi", "qiyebasics"],
    route: { name: "企业基本信息" },
  },
  {
    name: "标签列表",
    aliases: ["bqlb", "biaoqianliebiao"],
    route: { name: "标签列表" },
  },
  {
    name: "切面分析",
    aliases: ["qmfx", "qiemianfenxi"],
    route: { name: "切面分析" },
  },
  {
    name: "政策惠企",
    aliases: ["zchk", "zhengcehuiqi"],
    route: { name: "政策惠企" },
  },
  // 建模面板子功能
  {
    name: "正在使用的算法",
    aliases: ["zzyssdsl", "xgboost", "current-alg"],
    route: {
      name: "两用物项",
      query: { tab: "modeling", panelActive: "alg-current" },
    },
  },
  {
    name: "可选算法",
    aliases: ["kxsfa", "optional-alg", "lightgbm"],
    route: {
      name: "两用物项",
      query: { tab: "modeling", panelActive: "alg-optional" },
    },
  },
  {
    name: "前期数据准备",
    aliases: ["qqsjzb", "prep"],
    route: {
      name: "两用物项",
      query: { tab: "modeling", panelActive: "prep" },
    },
  },
  {
    name: "模型训练过程",
    aliases: ["mxxlgc", "train"],
    route: {
      name: "两用物项",
      query: { tab: "modeling", panelActive: "train" },
    },
  },
  // 调优面板概览
  {
    name: "参数调优",
    aliases: ["csty", "tuning", "params"],
    route: { name: "两用物项", query: { tab: "tuning" } },
  },
];

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, "");
const fuzzyMatch = (k: string): DictItem | null => {
  const q = normalize(k);
  return (
    dictionary.find(
      (d) =>
        normalize(d.name).includes(q) ||
        q.includes(normalize(d.name)) ||
        d.aliases.some(
          (a) => normalize(a).includes(q) || q.includes(normalize(a))
        )
    ) || null
  );
};

const querySearch = (q: string, cb: (list: { value: string }[]) => void) => {
  const qn = normalize(q);
  const rec = dictionary.filter(
    (d) =>
      normalize(d.name).includes(qn) ||
      qn.includes(normalize(d.name)) ||
      d.aliases.some(
        (a) => normalize(a).includes(qn) || qn.includes(normalize(a))
      )
  );
  cb(rec.map((d) => ({ value: d.name })));
};
const onSelectSuggestion = (item: { value: string }) => {
  const rec = dictionary.find((d) => d.name === item.value);
  if (rec) {
    if (rec.route?.name || rec.route?.path) router.push(rec.route as any);
    else router.push({ name: rec.name });
  }
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
  align-items: center;
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
  gap: 8px;
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
.search-input :deep(.el-input__wrapper) {
  height: 44px;
}
.right :deep(.el-tag) {
  height: 44px;
  line-height: 44px;
  padding: 0 12px;
  font-size: 14px;
}
.right :deep(.el-button) {
  height: 44px;
}
.right :deep(.el-badge) {
  display: flex;
  align-items: center;
}
</style>
