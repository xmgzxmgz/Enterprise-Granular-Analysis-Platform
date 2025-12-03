<template>
  <div class="wrap">
    <el-card>
      <div class="title">企业基本信息搜索</div>
      <el-alert
        v-if="error"
        type="error"
        :title="'后端不可联通或错误'"
        show-icon
        closable
      />
      <div class="search-wrap">
        <el-autocomplete
          v-model="searchKeyword"
          class="search-input"
          size="large"
          :fetch-suggestions="fetchSuggestions"
          placeholder="输入企业名称进行搜索（支持联想）"
          clearable
          trigger-on-focus
          :debounce="80"
          @select="onSelectSuggestion"
          @keyup.enter="onSearch"
        />
        <div class="hint">搜索后将跳转至独立结果页并按当前排版展示企业</div>
      </div>

      <el-dialog
        v-model="detailVisible"
        title="企业信息介绍"
        width="860px"
        append-to-body
      >
        <div v-if="detailRow" class="intro-grid">
          <div class="intro-section">
            <div class="intro-title">基本属性</div>
            <el-descriptions :column="4" border>
              <el-descriptions-item label="成立日期">—</el-descriptions-item>
              <el-descriptions-item label="注册地">—</el-descriptions-item>
              <el-descriptions-item label="注册资本">—</el-descriptions-item>
              <el-descriptions-item label="实收资本">—</el-descriptions-item>
              <el-descriptions-item label="企业性质">—</el-descriptions-item>
              <el-descriptions-item label="监管机关">—</el-descriptions-item>
              <el-descriptions-item label="高管人员">—</el-descriptions-item>
              <el-descriptions-item label="法人">—</el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="intro-section">
            <div class="intro-title">行业属性</div>
            <el-descriptions :column="4" border>
              <el-descriptions-item label="生产/贸易/混合型"
                >—</el-descriptions-item
              >
              <el-descriptions-item label="产业类别">{{
                detailRow.category
              }}</el-descriptions-item>
              <el-descriptions-item label="专精特新">—</el-descriptions-item>
              <el-descriptions-item label="地区">{{
                detailRow.region
              }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        <template #footer>
          <el-button @click="detailVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  getEnterpriseBasicInfo,
  getTags,
  updateEnterpriseTags,
} from "@/services/api";
import {
  notifyError,
  notifySuccess,
  notifyInfo,
} from "@/composables/notifyBus";
const route = useRoute();
const cat = route.query.category as string | undefined;
const focusName = route.query.focusName as string | undefined;
type Row = {
  name: string;
  category: string;
  region: string;
  risk: string;
  origin?: "existing" | "model";
  isNew?: boolean;
  tags?: string[];
  manualTags?: string[];
  modelTags?: string[];
};
const rows = ref<Row[]>([]);
const error = ref(false);
const tagOptions = ref<string[]>([]);
const editTags = ref<Record<string, string[]>>({});
const visible = ref<Record<string, boolean>>({});
const addVisible = ref<Record<string, boolean>>({});
const addSelection = ref<Record<string, string[]>>({});
const showCustom = ref<Record<string, boolean>>({});
const customInput = ref<Record<string, string>>({});
const saveError = ref(false);
const saveOk = ref(false);
const router = useRouter();

// 搜索与联想
const searchKeyword = ref("");
const fetchSuggestions = async (
  q: string,
  cb: (list: { value: string }[]) => void
) => {
  const k = q.trim();
  const list = rows.value
    .map((r) => r.name)
    .filter((n) => !k || n.includes(k))
    .slice(0, 10)
    .map((n) => ({ value: n }));
  cb(list);
};
const onSelectSuggestion = (item: { value: string }) => {
  searchKeyword.value = item.value;
  onSearch();
};
const onSearch = () => {
  const q = searchKeyword.value.trim();
  if (!q) return;
  router.push({ name: "企业详情", query: { name: q } });
};

// Overflow detection
const hasOverflow = ref<Record<string, boolean>>({});
const tagRefs = ref<Record<string, HTMLElement>>({});
const observers = new Map<string, ResizeObserver>();
const expanded = ref<Record<string, boolean>>({});
const expandedKeys = ref<string[]>([]);

const checkOneOverflow = (name: string) => {
  const el = tagRefs.value[name];
  if (!el) return;
  // Use a small tolerance
  hasOverflow.value[name] = el.scrollHeight > el.clientHeight + 2;
};

const setTagRef = (el: any, name: string) => {
  if (el) {
    tagRefs.value[name] = el as HTMLElement;
    if (!observers.has(name)) {
      const ro = new ResizeObserver(() => checkOneOverflow(name));
      ro.observe(el);
      observers.set(name, ro);
    }
    // Check immediately
    checkOneOverflow(name);
  } else {
    const ro = observers.get(name);
    if (ro) {
      ro.disconnect();
      observers.delete(name);
    }
    delete tagRefs.value[name];
  }
};
const toggleExpand = (name: string) => {
  expanded.value[name] = !expanded.value[name];
};
const detailVisible = ref(false);
const detailRow = ref<Row | null>(null);
const openDetail = (row: Row) => {
  detailRow.value = row;
  detailVisible.value = true;
};
onMounted(async () => {
  try {
    const data = await getEnterpriseBasicInfo(cat);
    rows.value = (data?.rows || []).map((r: any) => ({
      ...r,
      isNew: r.isNew ?? r.origin === "model",
      tags: r.tags ?? [],
      manualTags: r.manualTags ?? r.tagsManual ?? r.tags ?? [],
      modelTags: r.modelTags ?? r.tagsModel ?? [],
    }));
    if (focusName) {
      const idx = rows.value.findIndex((x) => x.name === focusName);
      if (idx > 0) {
        const [item] = rows.value.splice(idx, 1);
        rows.value.unshift(item);
      }
    }
  } catch (e: any) {
    error.value = true;
    notifyError("后端不可联通或错误", String(e?.message ?? "网络错误"));
  }
  try {
    const t = await getTags();
    tagOptions.value = (t?.rows || []).map((x: any) => x.name ?? x);
  } catch {}
  const defaults = [
    "价格指纹",
    "物流指纹",
    "属地指纹",
    "两用物项",
    "高风险",
    "中风险",
    "低风险",
    "极高风险",
    "合规预警",
    "异常金额",
    "频率异常",
    "出口波动",
    "违规记录",
    "监管关注",
    "供应链异常",
    "黑名单接触",
  ];
  tagOptions.value = Array.from(new Set([...tagOptions.value, ...defaults]));
  const only = route.query.only as string | undefined;
  if (focusName && only === "1") {
    rows.value = rows.value.filter((r) => r.name === focusName);
  }
  if (rows.value.length < 50 && !(focusName && only === "1")) {
    const need = 50 - rows.value.length;
    const cats = [
      "制造业",
      "医药",
      "材料",
      "能源",
      "电子",
      "物流",
      "金融",
      "服务",
    ];
    for (let i = 0; i < need; i++) {
      const name = `样例企业-${String(rows.value.length + i + 1).padStart(
        2,
        "0"
      )}`;
      const manualCount = Math.max(1, Math.floor(Math.random() * 60) + 20);
      const cappedManual = Math.min(manualCount, 99);
      const modelCount = 100 - cappedManual;
      const pickTagged = (n: number, prefix: string) =>
        Array.from({ length: n }, (_, k) => {
          const base =
            tagOptions.value[
              Math.floor(Math.random() * tagOptions.value.length)
            ];
          return `${base}-${prefix}${String(k + 1).padStart(3, "0")}`;
        }).filter(Boolean);
      rows.value.push({
        name,
        category: cats[Math.floor(Math.random() * cats.length)],
        region: ["华东", "华中", "华北", "东北", "西南", "西北"][
          Math.floor(Math.random() * 6)
        ],
        risk: ["低", "中", "高", "极高"][Math.floor(Math.random() * 4)],
        origin: "existing",
        isNew: false,
        manualTags: pickTagged(cappedManual, "M"),
        modelTags: pickTagged(modelCount, "B"),
      });
    }
  }
  const pool = tagOptions.value.length ? tagOptions.value : defaults;
  rows.value.forEach((r) => {
    const manual = r.manualTags || [];
    const model = r.modelTags || [];
    const total = manual.length + model.length;
    if (total < 100) {
      const need = 100 - total;
      for (let k = 0; k < need; k++) {
        const base = pool[Math.floor(Math.random() * pool.length)];
        model.push(`${base}-B${String(k + 1).padStart(3, "0")}`);
      }
    }
    r.manualTags = manual;
    r.modelTags = model;
  });
  rows.value.forEach(
    (r) => (editTags.value[r.name] = [...(r.manualTags || r.tags || [])])
  );
  expandedKeys.value = rows.value.map((r) => r.name);
});
const rowClass = ({ row }: { row: Row }) => {
  if (focusName && row.name === focusName) return "row-focus";
  return !row.isNew ? "row-existing" : "";
};
const open = (name: string) => {
  visible.value[name] = true;
};
const openAdd = (name: string) => {
  addVisible.value[name] = true;
};
const closeAdd = (name: string) => {
  addVisible.value[name] = false;
};
const toggleCustom = (name: string) => {
  showCustom.value[name] = !showCustom.value[name];
};
const addCustom = (name: string) => {
  const v = (customInput.value[name] || "").trim();
  if (!v) return;
  if (!tagOptions.value.includes(v)) tagOptions.value.push(v);
  const cur = new Set(addSelection.value[name] || []);
  cur.add(v);
  addSelection.value[name] = Array.from(cur);
  notifyInfo("已加入自定义标签", v, { name });
};
const confirmAdd = async (row: Row) => {
  const name = row.name;
  const adds = addSelection.value[name] || [];
  editTags.value[name] = Array.from(
    new Set([...(editTags.value[name] || []), ...adds])
  );
  addSelection.value[name] = [];
  addVisible.value[name] = false;
  await saveRowTags(row);
};
const saveRowTags = async (row: Row) => {
  saveError.value = false;
  saveOk.value = false;
  try {
    await updateEnterpriseTags({
      name: row.name,
      tags: editTags.value[row.name] || [],
      source: "manual",
    });
    row.manualTags = [...(editTags.value[row.name] || [])];
    try {
      const meta =
        JSON.parse(localStorage.getItem("egap_tag_meta") || "{}") || {};
      const now = Date.now();
      for (const t of row.manualTags || []) {
        if (!meta[t]) meta[t] = { creator: "管理员", createdAt: now };
      }
      localStorage.setItem("egap_tag_meta", JSON.stringify(meta));
    } catch {}
    saveOk.value = true;
    notifySuccess(
      "标签保存成功",
      `企业：${row.name}，新增标签数：${row.manualTags.length}`
    );
  } catch (e: any) {
    saveError.value = true;
    notifyError(
      "标签保存失败或后端不可联通",
      String(e?.message ?? "网络错误"),
      { name: row.name }
    );
  }
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
.search-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-input {
  width: 520px;
}
.hint {
  color: var(--text-secondary);
}
.row-existing :deep(.el-table__row) {
  color: #6b7280;
}
.row-focus :deep(.el-table__row) {
  background-color: #e0f2fe;
}
.tags-inline {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  border-top: 1px dashed var(--border-color);
  padding-top: 8px;
  margin-top: 8px;
}
.tags-clip {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  overflow: hidden;
  --tag-height: 26px;
  --row-gap: 4px;
  max-height: calc(var(--tag-height) * 3 + var(--row-gap) * 2);
  position: relative;
}
.tags-clip.expanded {
  max-height: none;
}
.ellipsis-tag {
  position: absolute;
  right: 0;
  bottom: 0;
  height: var(--tag-height);
  line-height: var(--tag-height);
  border: 1px solid #ef4444;
  color: #111827;
  background: #fff;
}
.action-btn {
  height: 28px;
}
.expand-btn {
  margin-left: 4px;
}
.popover-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.all-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.row-tags-line {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
}
.tag-grey {
  --el-tag-bg-color: #374151;
  --el-tag-text-color: #e5e7eb;
}
.tag-empty {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}
.intro-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.intro-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.intro-title {
  font-weight: 600;
}
</style>
