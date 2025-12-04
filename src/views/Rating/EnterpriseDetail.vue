<template>
  <div class="wrap">
    <el-card class="search-card">
      <div class="title">企业搜索</div>
      <div class="search-row">
        <el-autocomplete
          v-model="keyword"
          :fetch-suggestions="suggestEnterprises"
          placeholder="输入企业名称进行搜索（支持模糊匹配与联想）"
          style="width: 520px"
          @select="onSelectSuggestion"
          @keyup.enter.native="onSearch"
          clearable
        />
        <el-button type="primary" @click="onSearch">搜索</el-button>
      </div>
      <el-alert
        v-if="error"
        type="error"
        :title="'后端不可联通或错误'"
        show-icon
        closable
      />
      <div v-else class="result-wrap">
        <div class="subtitle">匹配结果（部分基础信息）</div>
        <el-table
          :data="results"
          height="360"
          border
          stripe
          @row-click="openDetail"
        >
          <el-table-column prop="etps_name" label="企业名称" min-width="240" />
          <el-table-column
            prop="industry_phy_name"
            label="行业门类"
            min-width="160"
          />
          <el-table-column
            prop="industry_code_name"
            label="行业细分"
            min-width="160"
          />
          <el-table-column prop="area_id" label="区域代码" width="120" />
          <el-table-column prop="aeo_rating" label="AEO等级" width="120" />
        </el-table>
      </div>
    </el-card>

    <el-card v-if="detail" class="detail-card">
      <div class="title">企业信息：{{ detail.etps_name || detail.name }}</div>
      <div class="detail-rows">
        <div class="row" v-for="it in detailList" :key="it.key">
          <div class="col-left">
            <div class="label-cn">{{ it.labelCn }}</div>
            <div class="label-en">{{ it.key }}</div>
          </div>
          <div class="col-right">
            <div class="value">{{ formatVal(it.value) }}</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getEtpsData } from "@/services/api";

type Row = Record<string, any>;

const route = useRoute();
const router = useRouter();
const keyword = ref(String(route.query.name || "").trim());
const error = ref(false);
const results = ref<Row[]>([]);
const detail = ref<Row | null>(null);

const suggestEnterprises = async (
  q: string,
  cb: (items: Array<{ value: string; item: Row }>) => void
) => {
  try {
    const resp = await getEtpsData({ q, size: 10 });
    const list: Row[] = resp?.rows || resp || [];
    cb(
      list.map((r: any) => ({
        value: String(r.etps_name || r.name || ""),
        item: r,
      }))
    );
  } catch {
    cb([]);
  }
};
const onSelectSuggestion = (item: { value: string; item: Row }) => {
  keyword.value = item.value;
  detail.value = item.item;
  router.replace({
    name: route.name as string,
    query: { name: keyword.value },
  });
};
const onSearch = async () => {
  try {
    const resp = await getEtpsData({ q: keyword.value, size: 50 });
    results.value = resp?.rows || resp || [];
    error.value = false;
  } catch {
    results.value = [];
    error.value = true;
  }
};
const openDetail = (row: Row) => {
  detail.value = row;
  router.replace({
    name: route.name as string,
    query: { name: String(row.etps_name || row.name || "") },
  });
};
const fieldLabelMap: Record<string, string> = {
  etps_name: "企业名称",
  industry_phy_name: "行业门类",
  industry_code_name: "行业细分",
  area_id: "区域代码",
  aeo_rating: "AEO等级",
  total_decl_amt: "申报金额",
  total_entry_cnt: "申报票数",
  avg_ticket_val: "平均票值",
  delay_rate: "延误率",
  common_busi: "业务概述",
};
const autoLabelCn = (key: string) => {
  const k = key.toLowerCase();
  if (fieldLabelMap[key]) return fieldLabelMap[key];
  if (/[\u4e00-\u9fa5]/.test(key)) return key; // 已是中文
  if (k.includes("name")) return "名称";
  if (k.includes("industry")) return "行业";
  if (k.includes("region") || k.includes("area")) return "地区";
  if (k.includes("rating")) return "评级";
  if (k.includes("category")) return "类别";
  if (k.includes("class")) return "分类";
  if (k.includes("score")) return "评分";
  if (k.includes("addr")) return "地址";
  if (k.includes("contact") || k.includes("phone") || k.includes("tel"))
    return "联系方式";
  if (k.includes("email")) return "邮箱";
  if (k.endsWith("id") || k.includes("code")) return "代码";
  if (k.includes("date")) return "日期";
  if (k.includes("amount") || k.includes("amt")) return "金额";
  if (k.includes("count") || k.includes("cnt") || k.includes("num"))
    return "数量";
  if (k.includes("avg") || k.includes("mean")) return "平均值";
  if (k.includes("min")) return "最小值";
  if (k.includes("max")) return "最大值";
  if (k.includes("rate")) return "比率";
  if (k.includes("desc") || k.includes("remark")) return "说明";
  if (k.includes("status")) return "状态";
  return key;
};
const detailList = computed(() => {
  const d = detail.value || {};
  // 保持后端字段顺序
  return Object.entries(d).map(([key, value]) => ({
    key,
    value,
    labelCn: autoLabelCn(key),
  }));
});
const formatVal = (v: any) =>
  Array.isArray(v) ? v.join(", ") : String(v ?? "");

onMounted(() => {
  if (keyword.value) onSearch();
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
.subtitle {
  margin: 8px 0;
  font-weight: 600;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.result-wrap {
  margin-top: 8px;
}
.detail-card {
  margin-top: 12px;
}
.detail-rows {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px dashed var(--border-color);
  gap: 8px;
}
.col-left {
  width: 32%;
  border: 1px solid #93c5fd;
  background: #e5f0ff;
  border-radius: 6px;
  padding: 6px 8px;
}
.label-cn {
  font-weight: 600;
}
.label-en {
  color: var(--text-secondary);
  font-size: 12px;
}
.col-right {
  flex: 1;
}
.value {
  word-break: break-word;
}
</style>
