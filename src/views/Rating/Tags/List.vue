<template>
  <div class="wrap">
    <el-card>
      <div class="title">标签列表</div>
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索标签"
          clearable
          style="max-width: 240px"
        />
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
      <el-table v-else :data="filtered" height="420" @row-click="onRowClick">
        <el-table-column label="标签" width="220">
          <template #default="{ row }">
            <el-tag
              v-if="row.color === 'grey'"
              size="small"
              class="tag-grey"
              effect="plain"
              type="info"
              >{{ row.name }}</el-tag
            >
            <el-tag v-else size="small" type="primary">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="说明" />
        <el-table-column prop="source" label="来源" width="120" />
        <el-table-column prop="creator" label="创建人" width="140" />
        <el-table-column prop="createdAtText" label="创建时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { getTags, getEnterpriseBasicInfo } from "@/services/api";

type TagRow = {
  name: string;
  desc?: string;
  color: "grey" | "blue";
  source: "manual" | "model" | "mixed";
  creator?: string;
  createdAt?: number;
  createdAtText?: string;
};

const router = useRouter();
const keyword = ref("");
const rows = ref<TagRow[]>([]);
const error = ref(false);

const loadMeta = () => {
  try {
    return JSON.parse(localStorage.getItem("egap_tag_meta") || "{}") || {};
  } catch {
    return {};
  }
};
const saveMeta = (meta: Record<string, any>) => {
  try {
    localStorage.setItem("egap_tag_meta", JSON.stringify(meta));
  } catch {}
};

onMounted(async () => {
  let base: TagRow[] = [];
  try {
    const data = await getTags();
    base = (data?.rows || []).map((r: any) => ({
      name: r.name,
      desc: r.desc,
      color: "blue",
      source: "model",
    }));
  } catch {
    error.value = true;
  }
  try {
    const info = await getEnterpriseBasicInfo();
    const meta = loadMeta();
    const tagMap: Record<string, TagRow> = {};
    for (const r of info?.rows || []) {
      const manuals: string[] = r.manualTags || r.tagsManual || [];
      const models: string[] = r.modelTags || r.tagsModel || [];
      for (const t of manuals) {
        const m = meta[t] || {};
        const createdAt = m.createdAt || Date.now();
        const creator = m.creator || "管理员";
        tagMap[t] = {
          name: t,
          color: "grey",
          source: tagMap[t]?.source === "model" ? "mixed" : "manual",
          creator,
          createdAt,
          createdAtText: formatTime(createdAt),
        };
        meta[t] = { creator, createdAt };
      }
      for (const t of models) {
        const prev = tagMap[t];
        tagMap[t] = {
          name: t,
          color: "blue",
          source: prev ? "mixed" : "model",
          createdAt: prev?.createdAt,
          creator: prev?.creator,
          createdAtText: prev?.createdAtText,
        };
      }
    }
    saveMeta(meta);
    const combined = Object.values(tagMap);
    // merge base list
    for (const b of base) {
      const ex = combined.find((x) => x.name === b.name);
      if (!ex) combined.push(b);
      else {
        ex.desc = ex.desc || b.desc;
        if (ex.source === "model" && ex.color !== "blue") {
          ex.color = "blue";
        }
      }
    }
    rows.value = combined;
  } catch {}
});

watch(keyword, async (k) => {
  const q = k.trim();
  if (!q) return;
  try {
    const data = await getTags(q);
    const list = (data?.rows || []).map((r: any) => ({
      name: r.name,
      desc: r.desc,
      color: "blue",
      source: "model" as const,
    }));
    rows.value = mergeTags(rows.value, list);
  } catch {
    error.value = true;
  }
});

const mergeTags = (cur: TagRow[], add: TagRow[]) => {
  const map: Record<string, TagRow> = {};
  for (const r of cur) map[r.name] = r;
  for (const r of add) {
    const ex = map[r.name];
    if (!ex) map[r.name] = r;
    else {
      ex.desc = ex.desc || r.desc;
      if (ex.source === "manual" && r.source === "model") ex.source = "mixed";
      if (r.color === "blue") ex.color = "blue";
    }
  }
  return Object.values(map);
};

const filtered = computed(() => {
  const k = keyword.value.trim();
  return rows.value.filter(
    (r) => !k || r.name.includes(k) || (r.desc || "").includes(k)
  );
});

const onRowClick = (row: TagRow) => {
  router.push({
    path: "/rating-profile/标签管理/标签企业列表",
    query: { tag: row.name },
  });
};

const formatTime = (t?: number) => {
  if (!t) return "";
  const d = new Date(t);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
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
  margin-bottom: 8px;
}
.tag-grey {
  --el-tag-bg-color: #374151;
  --el-tag-text-color: #e5e7eb;
}
</style>
