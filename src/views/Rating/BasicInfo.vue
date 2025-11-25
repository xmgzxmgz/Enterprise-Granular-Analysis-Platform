<template>
  <div class="wrap">
    <el-card>
      <div class="title">企业基本信息与标签</div>
      <el-alert
        v-if="error"
        type="error"
        :title="'后端不可联通或错误'"
        show-icon
        closable
      />
      <el-empty v-else-if="!rows.length" description="后端无数据" />
      <el-table
        v-else
        :data="rows"
        height="520"
        :row-class-name="rowClass"
        row-key="name"
        :expand-row-keys="expandedRowKeys"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="row-tags-line">
              <div class="manual-wrap">
                <el-tag
                  v-for="t in row.manualTags || []"
                  :key="t"
                  effect="plain"
                  type="info"
                  class="tag-grey"
                  size="small"
                  >{{ t }}</el-tag
                >
              </div>
              <div class="model-wrap">
                <el-tag
                  v-for="t in row.modelTags || []"
                  :key="t"
                  type="primary"
                  class="tag-blue"
                  size="small"
                  >{{ t }}</el-tag
                >
              </div>
              <div
                v-if="
                  !(row.manualTags && row.manualTags.length) &&
                  !(row.modelTags && row.modelTags.length)
                "
                class="empty-wrap"
              >
                <el-tag type="danger" class="tag-empty" size="small"
                  >无标签</el-tag
                >
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="企业" width="180" />
        <el-table-column prop="category" label="类别" width="120" />
        <el-table-column prop="region" label="地区" width="120" />
        <el-table-column prop="risk" label="风险等级" width="120" />
        <el-table-column prop="origin" label="来源" width="120" />
        <el-table-column label="标签配置">
          <template #default="{ row }">
            <div class="tags-inline">
              <div class="tags-clip">
                <el-tag
                  v-for="t in row.manualTags || []"
                  :key="t"
                  size="small"
                  class="tag-item tag-grey"
                  effect="plain"
                  type="info"
                  >{{ t }}</el-tag
                >
                <el-tag
                  v-for="t in row.modelTags || []"
                  :key="t"
                  size="small"
                  class="tag-item tag-blue"
                  type="primary"
                  >{{ t }}</el-tag
                >
              </div>
              <el-button
                class="action-btn"
                type="primary"
                plain
                size="small"
                round
                @click="openAdd(row.name)"
                >添加标签</el-button
              >
              <el-popover
                placement="left"
                :width="360"
                trigger="click"
                v-model:visible="visible[row.name]"
              >
                <template #reference>
                  <el-button
                    class="action-btn"
                    type="primary"
                    plain
                    size="small"
                    round
                    @click="open(row.name)"
                    >展开 ▾</el-button
                  >
                </template>
                <div class="popover-content">
                  <div class="all-tags">
                    <el-tag
                      v-for="t in row.manualTags || []"
                      :key="t"
                      size="small"
                      class="tag-item tag-grey"
                      effect="plain"
                      type="info"
                      >{{ t }}</el-tag
                    >
                    <el-tag
                      v-for="t in row.modelTags || []"
                      :key="t"
                      size="small"
                      class="tag-item tag-blue"
                      type="primary"
                      >{{ t }}</el-tag
                    >
                  </div>
                </div>
              </el-popover>
              <el-dialog
                v-model="addVisible[row.name]"
                title="选择或添加标签"
                width="640px"
                append-to-body
              >
                <el-select
                  v-model="addSelection[row.name]"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="选择/添加标签"
                  style="width: 100%"
                >
                  <el-option
                    v-for="t in tagOptions"
                    :key="t"
                    :label="t"
                    :value="t"
                  />
                </el-select>
                <div class="custom-wrap">
                  <el-input
                    v-if="showCustom[row.name]"
                    v-model="customInput[row.name]"
                    placeholder="输入自定义标签"
                    style="width: 70%"
                  />
                  <el-button
                    type="primary"
                    plain
                    @click="toggleCustom(row.name)"
                    >{{
                      showCustom[row.name] ? "添加自定义" : "自定义标签"
                    }}</el-button
                  >
                  <el-button
                    v-if="showCustom[row.name]"
                    @click="addCustom(row.name)"
                    type="primary"
                    >加入选择</el-button
                  >
                </div>
                <template #footer>
                  <div class="dialog-footer">
                    <el-button @click="closeAdd(row.name)">取消</el-button>
                    <el-button type="primary" @click="confirmAdd(row)"
                      >确认添加</el-button
                    >
                  </div>
                </template>
              </el-dialog>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import {
  getEnterpriseBasicInfo,
  getTags,
  updateEnterpriseTags,
} from "@/services/api";
import { ElMessage } from "element-plus";
import {
  notifyError,
  notifySuccess,
  notifyInfo,
} from "@/composables/notifyBus";
const route = useRoute();
const cat = route.query.category as string | undefined;
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
const expandedRowKeys = ref<string[]>([]);
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
  if (rows.value.length < 50) {
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
      const total = Math.max(1, Math.floor(Math.random() * 20) + 1);
      const manualCount = Math.max(
        1,
        Math.min(total, Math.floor(Math.random() * 10) + 1)
      );
      const modelCount = total - manualCount;
      const pick = (n: number) =>
        Array.from(
          { length: n },
          () =>
            tagOptions.value[
              Math.floor(Math.random() * tagOptions.value.length)
            ]
        ).filter(Boolean);
      rows.value.push({
        name,
        category: cats[Math.floor(Math.random() * cats.length)],
        region: ["华东", "华中", "华北", "东北", "西南", "西北"][
          Math.floor(Math.random() * 6)
        ],
        risk: ["低", "中", "高", "极高"][Math.floor(Math.random() * 4)],
        origin: "existing",
        isNew: false,
        manualTags: pick(manualCount),
        modelTags: pick(modelCount),
      });
    }
  }
  rows.value.forEach(
    (r) => (editTags.value[r.name] = [...(r.manualTags || r.tags || [])])
  );
  expandedRowKeys.value = rows.value.map((r) => r.name);
});
const rowClass = ({ row }: { row: Row }) => (!row.isNew ? "row-existing" : "");
const open = (name: string) => {
  visible.value[name] = true;
};
const toggleExpand = (name: string) => {
  const set = new Set(expandedRowKeys.value);
  if (set.has(name)) set.delete(name);
  else set.add(name);
  expandedRowKeys.value = Array.from(set);
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
.row-existing :deep(.el-table__row) {
  color: #6b7280;
}
.tags-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tags-clip {
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
}
.tag-item {
  margin-right: 4px;
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
.tag-blue {
}
.tag-empty {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}
</style>
