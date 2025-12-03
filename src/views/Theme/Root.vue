<template>
  <div class="root-wrap">
    <div class="main-title">分类主题管理</div>
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
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

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

const treeData = computed(() => toArray(buildTree("/theme-management")));

const onNodeClick = (data: any) => {
  if (!data.children || !data.children.length) router.push(data.fullPath);
};
</script>

<style scoped>
.root-wrap {
  max-width: 1080px;
  margin: 0 auto;
}
.main-title {
  font-size: 20px;
  font-weight: 600;
  margin: 20px 0 10px;
}
.selector-card {
  margin-top: 10px;
}
.selector-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}
.tree-large {
  font-size: 14px;
}
</style>
