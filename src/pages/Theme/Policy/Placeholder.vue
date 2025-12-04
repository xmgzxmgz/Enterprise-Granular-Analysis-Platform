<template>
  <div class="wrap">
    <el-card>
      <div class="title">政策惠企</div>
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索政策名称/标签"
          style="max-width: 240px"
        />
        <el-select
          v-model="tag"
          placeholder="选择标签"
          style="max-width: 200px"
          clearable
        >
          <el-option v-for="t in tagOptions" :key="t" :label="t" :value="t" />
        </el-select>
      </div>
      <el-alert
        v-if="error"
        type="error"
        :title="'后端不可联通或错误'"
        show-icon
        closable
      />
      <el-empty
        v-else-if="!filtered.length"
        description="后端无数据或未匹配到结果"
      />
      <el-table v-else :data="filtered" height="420">
        <el-table-column prop="name" label="政策名称" width="240" />
        <el-table-column prop="dept" label="部门" width="160" />
        <el-table-column prop="tag" label="标签" width="120" />
        <el-table-column prop="desc" label="说明" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { getPolicies } from "@/services/api";

type PolicyRow = { name: string; dept?: string; tag?: string; desc?: string };

const keyword = ref("");
const tag = ref<string | undefined>(undefined);
const rows = ref<PolicyRow[]>([]);
const error = ref(false);

onMounted(async () => {
  try {
    const data = (await getPolicies()) as any
    rows.value = (data?.rows || data || []).map((r: any) => ({
      name: r.name || r.title || "",
      dept: r.dept || r.department || r.org || "",
      tag: r.tag || r.category || r.type || "",
      desc: r.desc || r.description || "",
    }));
  } catch {
    error.value = true;
  }
});

const tagOptions = computed(() => {
  const set = new Set<string>();
  for (const r of rows.value) if (r.tag) set.add(r.tag);
  return Array.from(set);
});

const filtered = computed(() => {
  const k = keyword.value.trim();
  return rows.value.filter(
    (r) =>
      (!tag.value || r.tag === tag.value) &&
      (!k || `${r.name} ${r.dept} ${r.tag} ${r.desc}`.includes(k))
  );
});
</script>

<style scoped>
.wrap {
  padding: 16px;
}
.title {
  font-weight: 600;
  margin-bottom: 8px;
}
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
</style>
