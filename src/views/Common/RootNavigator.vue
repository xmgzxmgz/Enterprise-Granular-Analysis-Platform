<template>
  <div class="nav-root">
    <div class="hero">
      <div class="hero-title">{{ title }}</div>
      <div class="hero-sub">{{ subTitle }}</div>
    </div>
    <el-card class="panel">
      <el-tree
        v-if="treeData.length"
        :data="treeData"
        :props="{ children: 'children', label: 'label' }"
        highlight-current
        :expand-on-click-node="true"
        default-expand-all
        class="tree-large"
        style="min-height: 520px"
        @node-click="onNodeClick"
      >
        <template #default="{ data }">
          <div class="node-line">
            <span class="node-label">{{ data.label }}</span>
            <span v-if="isJumpNode(data.fullPath)" class="node-actions">
              <div class="actions-mask">
                <el-button
                  size="small"
                  type="primary"
                  plain
                  @click.stop="go(data.fullPath, 'modeling')"
                  >建模</el-button
                >
                <el-button
                  size="small"
                  type="primary"
                  plain
                  @click.stop="go(data.fullPath, 'tuning')"
                  >调优</el-button
                >
                <el-button
                  size="small"
                  type="primary"
                  plain
                  @click.stop="go(data.fullPath, 'publish')"
                  >发布</el-button
                >
              </div>
            </span>
          </div>
        </template>
      </el-tree>
      <el-empty v-else description="无子菜单" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  basePath: string;
  title: string;
  subTitle?: string;
  panelTitle?: string;
}>();

type Node = { label: string; fullPath: string; children: Record<string, Node> };
type TreeItem = { label: string; fullPath: string; children?: TreeItem[] };

const router = useRouter();

const buildTree = (base: string) => {
  const root: Node = { label: base, fullPath: base, children: {} };
  const all = router.getRoutes();
  const byPath = new Map(all.map((r) => [r.path, r]));
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
      const rec = byPath.get(curPath);
      const label = (rec?.name as string) || s;
      cur.children[s] = cur.children[s] || {
        label,
        fullPath: curPath,
        children: {},
      };
      cur = cur.children[s];
    }
  }
  return root;
};

const toArray = (n: Node): TreeItem[] => {
  const list: TreeItem[] = [];
  for (const child of Object.values(n.children)) {
    const item: TreeItem = { label: child.label, fullPath: child.fullPath };
    const sub = toArray(child);
    if (sub.length) item.children = sub;
    list.push(item);
  }
  return list;
};

const treeData = computed(() => toArray(buildTree(props.basePath)));
const subTitle = computed(() => {
  if (props.subTitle) return props.subTitle;
  return props.basePath === "/theme-management"
    ? "出口风险分类、敏感物品、跨境电商"
    : "企业基本信息、标签管理与分析";
});

const onNodeClick = (data: any) => {
  if (!data.children || !data.children.length) router.push(data.fullPath);
};

const jumpTargets = new Set([
  "/theme-management/export-risk/sensitive-items/dual-use",
  "/theme-management/export-risk/key-items/frozen-fish",
  "/theme-management/export-risk/cross-border-sensitive-distribution/frequency-assign",
]);
const isJumpNode = (p: string) => jumpTargets.has(p);
const go = (p: string, tab: "modeling" | "tuning" | "publish") => {
  router.push({ path: p, query: { tab } });
};
</script>

<style scoped>
.nav-root {
  max-width: 1280px;
  margin: 0 auto;
}
.hero {
  background: linear-gradient(135deg, #e9f2ff 0%, #f5faff 100%);
  border: 1px solid #dfe9ff;
  border-radius: 16px;
  padding: 28px 32px;
}
.hero-title {
  font-size: 28px;
  font-weight: 800;
  color: #1f2d3d;
}
.hero-sub {
  margin-top: 8px;
  color: #58627a;
  font-size: 16px;
}
.panel {
  margin-top: 18px;
}
.panel-title {
  font-size: 16px;
  color: #4b5563;
  margin-bottom: 12px;
}
.tree-large {
  font-size: 16px;
}
.node-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.node-label {
  flex: 1 1 auto;
}
.node-actions {
  flex: 0 0 auto;
  margin-left: 12px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.actions-mask {
  display: flex;
  gap: 12px;
  padding: 6px 10px;
  border: 1px solid #bfdbfe;
  background: rgba(59, 130, 246, 0.06);
  border-radius: 8px;
}
.node-actions :deep(.el-button) {
  padding: 6px 12px;
}
.panel :deep(.el-card__body) {
  padding: 20px 24px;
}
.tree-large :deep(.el-tree-node__content) {
  height: 36px;
  padding: 6px 8px;
}
.tree-large :deep(.el-tree-node__label) {
  font-size: 16px;
}
</style>
