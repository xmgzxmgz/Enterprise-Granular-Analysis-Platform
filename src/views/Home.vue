<template>
  <div class="home-wrap">
    <div v-if="!selectedRoot" class="center">
      <div class="main-title">导航中心</div>
      <div class="btn-grid">
        <el-card class="big-btn" @click="enterRoot('/theme-management')">
          <div class="btn-title">分类主题管理</div>
          <div class="btn-desc">出口风险分类、敏感物品、跨境电商</div>
        </el-card>
        <el-card class="big-btn" @click="enterRoot('/rating-profile')">
          <div class="btn-title">企业分类评级画像</div>
          <div class="btn-desc">企业基本信息、标签管理与分析</div>
        </el-card>
      </div>
    </div>
    <div v-else class="nav-area">
      <el-card class="selector-card">
        <div class="selector-title">点击上一级展开下一级</div>
        <el-tree
          v-if="treeData.length"
          :data="treeData"
          :props="{ children: 'children', label: 'label' }"
          highlight-current
          :expand-on-click-node="true"
          default-expand-all
          class="tree-large"
          @node-click="onNodeClick"
        />
        <el-empty v-else description="无子菜单" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

type Node = { label: string; fullPath: string; children: Record<string, Node> };
type TreeItem = { label: string; fullPath: string; children?: TreeItem[] };

const router = useRouter();
const route = useRoute();
const selectedRoot = ref("");
const segments = ref<string[]>([]);
const tree = ref<Record<string, Node>>({});

const buildTree = (base: string) => {
  const root: Node = { label: base, fullPath: base, children: {} };
  const all = router.getRoutes();
  for (const r of all) {
    const p = r.path;
    if (!p.startsWith(base + "/")) continue;
    const rest = p.substring(base.length + 1);
    if (!rest) continue;
    const segs = rest.split("/").filter(Boolean);
    let cur = root;
    let curPath = base;
    for (const s of segs) {
      curPath = curPath + "/" + s;
      cur.children[s] = cur.children[s] || {
        label: s,
        fullPath: curPath,
        children: {},
      };
      cur = cur.children[s];
    }
  }
  return root;
};

const enterRoot = (base: string) => {
  selectedRoot.value = base;
  segments.value = [];
  tree.value = { [base]: buildTree(base) };
};

const currentNode = computed(() => {
  if (!selectedRoot.value) return null;
  let cur: Node | null = tree.value[selectedRoot.value];
  for (const s of segments.value) {
    if (!cur) break;
    cur = cur.children[s] || null;
  }
  return cur;
});

const toArray = (n: Node): TreeItem[] => {
  const list: TreeItem[] = [];
  for (const child of Object.values(n.children)) {
    const item: TreeItem = {
      label: child.label,
      fullPath: child.fullPath,
    };
    const sub = toArray(child);
    if (sub.length) item.children = sub;
    list.push(item);
  }
  return list;
};
const treeData = computed(() => {
  const cur = currentNode.value;
  if (!cur) return [];
  return toArray(cur);
});

const rootLabel = computed(() =>
  selectedRoot.value === "/theme-management"
    ? "分类主题管理"
    : "企业分类评级画像"
);

const onNodeClick = (data: any) => {
  if (!data.children || !data.children.length) {
    router.push(data.fullPath);
  }
};

const reset = () => {
  selectedRoot.value = "";
  segments.value = [];
  tree.value = {};
};

onMounted(() => {
  selectedRoot.value = "";
});

watch(
  () => route.path,
  (p) => {
    if (p === "/home") {
      const root = String(route.query.root || "");
      if (root === "/theme-management" || root === "/rating-profile") {
        enterRoot(root);
      } else {
        reset();
      }
    }
  },
  { immediate: true }
);
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
