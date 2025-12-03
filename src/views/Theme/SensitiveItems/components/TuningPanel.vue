<template>
  <div class="panel">
    <div class="left-mini-sidebar">
      <el-menu
        :default-active="active"
        class="mini"
        :unique-opened="true"
        @select="onSelect"
      >
        <el-menu-item index="dualuse">两用物项</el-menu-item>
        <el-menu-item index="topic">主题视角</el-menu-item>
        <el-sub-menu index="params">
          <template #title>
            <div class="params-title">
              <span>参数调优</span>
              <el-button
                size="small"
                type="primary"
                plain
                @click="createNewVersion"
                >新建项目</el-button
              >
            </div>
          </template>
          <el-sub-menu index="v1" v-if="versions.v1.exists">
            <template #title>V1</template>
            <div class="version-actions">
              <el-button
                type="primary"
                plain
                size="small"
                @click="enableVersion('v1')"
                >启用</el-button
              >
              <el-button
                type="primary"
                plain
                size="small"
                @click="disableVersion('v1')"
                >禁用</el-button
              >
              <el-button
                type="primary"
                plain
                size="small"
                @click="deleteVersion('v1')"
                >删除</el-button
              >
            </div>
          </el-sub-menu>
          <el-sub-menu index="v5" v-if="versions.v5.exists">
            <template #title>V5</template>
            <div class="version-actions">
              <el-button
                type="primary"
                plain
                size="small"
                @click="enableVersion('v5')"
                >启用</el-button
              >
              <el-button
                type="primary"
                plain
                size="small"
                @click="disableVersion('v5')"
                >禁用</el-button
              >
              <el-button
                type="primary"
                plain
                size="small"
                @click="deleteVersion('v5')"
                >删除</el-button
              >
            </div>
          </el-sub-menu>
          <el-sub-menu index="v2" v-if="versions.v2.exists">
            <template #title>V2</template>
            <div class="version-actions">
              <el-button
                type="primary"
                plain
                size="small"
                @click="enableVersion('v2')"
                >启用</el-button
              >
              <el-button
                type="primary"
                plain
                size="small"
                @click="disableVersion('v2')"
                >禁用</el-button
              >
              <el-button
                type="primary"
                plain
                size="small"
                @click="deleteVersion('v2')"
                >删除</el-button
              >
            </div>
          </el-sub-menu>
          <el-sub-menu index="v3" v-if="versions.v3.exists">
            <template #title>V3</template>
            <div class="version-actions">
              <el-button
                type="primary"
                plain
                size="small"
                @click="enableVersion('v3')"
                >启用</el-button
              >
              <el-button
                type="primary"
                plain
                size="small"
                @click="disableVersion('v3')"
                >禁用</el-button
              >
              <el-button
                type="primary"
                plain
                size="small"
                @click="deleteVersion('v3')"
                >删除</el-button
              >
            </div>
          </el-sub-menu>
          <el-sub-menu index="v4" v-if="versions.v4.exists">
            <template #title>V4</template>
            <div class="version-actions">
              <el-button
                type="primary"
                plain
                size="small"
                @click="enableVersion('v4')"
                >启用</el-button
              >
              <el-button
                type="primary"
                plain
                size="small"
                @click="disableVersion('v4')"
                >禁用</el-button
              >
              <el-button
                type="primary"
                plain
                size="small"
                @click="deleteVersion('v4')"
                >删除</el-button
              >
            </div>
          </el-sub-menu>
        </el-sub-menu>
      </el-menu>
    </div>
    <div class="right-content">
      <div v-if="active === 'dualuse'" class="grid3">
        <div class="card">
          <div class="card-header">
            <div class="title">标签分布</div>
            <div class="actions">
              <el-radio-group v-model="distChartType" size="small">
                <el-radio-button label="bar">柱状</el-radio-button>
                <el-radio-button label="line">折线</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-wrap">
            <el-alert
              v-if="distError"
              type="error"
              :title="'后端不可联通或错误'"
              show-icon
              closable
            />
            <el-empty v-else-if="!tagDist.length" description="后端无数据" />
            <div v-else ref="distRef" class="chart" />
          </div>
        </div>
        <div class="card">
          <div class="title">标签历史详细</div>
          <div ref="historyRef" class="chart" />
        </div>
        <div class="card">
          <div class="title">关键指标分布</div>
          <div ref="boxRef" class="chart" />
          <div class="btns">
            <el-button type="primary" size="small">显示详细数据</el-button>
          </div>
        </div>
      </div>

      <div v-else-if="active === 'topic'" class="card">
        <div class="title">主题视角</div>
        <div class="visual-wrap">
          <div ref="topicPieRef" class="chart" />
          <div ref="topicTrendRef" class="chart" />
        </div>
        <div class="table-wrap">
          <el-table :data="topicRows" height="280">
            <el-table-column prop="tag" label="主题标签" width="160" />
            <el-table-column prop="count" label="计数" width="120" />
            <el-table-column prop="risk" label="风险" width="120" />
          </el-table>
        </div>
        <div class="footer">
          <el-button @click="reset">重置</el-button>
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <div v-else-if="active.endsWith('enable')" class="card">
        <div class="title">模型启用</div>
        <div class="visual-wrap">
          <div ref="enableRef" class="chart" />
        </div>
      </div>

      <div v-else-if="active.endsWith('disable')" class="card">
        <div class="title">模型禁用</div>
        <div class="visual-wrap">
          <div ref="disableRef" class="chart" />
        </div>
      </div>

      <div v-else-if="active.endsWith('delete')" class="card">
        <div class="title">模型删除</div>
        <div class="visual-wrap">
          <div ref="deleteRef" class="chart" />
        </div>
      </div>

      <div v-else-if="active.endsWith('filter')" class="card">
        <div class="title">数据筛选</div>
        <div class="toolbar">
          <el-steps
            :active="stepIndex"
            align-center
            finish-status="success"
            class="steps"
          >
            <el-step title="数据筛选" @click="goStep(0)" />
            <el-step title="特征选择" @click="goStep(1)" />
            <el-step title="分类值调整" @click="goStep(2)" />
            <el-step title="可视化展示" @click="goStep(3)" />
            <el-step title="标签配置" @click="goStep(4)" />
          </el-steps>
          <el-input
            v-model="filterKeyword"
            placeholder="搜索企业/字段"
            style="max-width: 240px"
          />
        </div>
        <el-table
          :data="filteredRows"
          height="420"
          style="width: 100%"
          @row-click="toBasic"
        >
          <el-table-column prop="company" label="企业" sortable />
          <el-table-column prop="field" label="字段" sortable />
          <el-table-column prop="value" label="值" sortable />
          <el-table-column prop="date" label="日期" sortable />
        </el-table>
        <div class="footer">
          <el-button @click="reset">重置</el-button>
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <div v-else-if="active.endsWith('feature')" class="card">
        <div class="title">特征选择</div>
        <div class="toolbar">
          <el-steps
            :active="stepIndex"
            align-center
            finish-status="success"
            class="steps"
          >
            <el-step title="数据筛选" @click="goStep(0)" />
            <el-step title="特征选择" @click="goStep(1)" />
            <el-step title="分类值调整" @click="goStep(2)" />
            <el-step title="可视化展示" @click="goStep(3)" />
            <el-step title="标签配置" @click="goStep(4)" />
          </el-steps>
        </div>
        <div class="feature-wrap">
          <div class="importance-chart">
            <div ref="importanceRef" class="chart" />
          </div>
          <div class="feature-list">
            <el-checkbox-group v-model="checkedFeatures">
              <div
                v-for="f in features"
                :key="f.name"
                class="feature-item"
                @click="openFeature(f)"
              >
                <span class="fname">{{ f.name }}</span>
                <el-checkbox :label="f.name" />
              </div>
            </el-checkbox-group>
          </div>
        </div>
        <div class="feature-detail">
          <div ref="featureRef" class="chart" />
          <div class="detail-values">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="左值">{{
                curStats.low
              }}</el-descriptions-item>
              <el-descriptions-item label="中值">{{
                curStats.mid
              }}</el-descriptions-item>
              <el-descriptions-item label="右值">{{
                curStats.high
              }}</el-descriptions-item>
            </el-descriptions>
            <el-slider
              v-model="curRange"
              range
              :min="curStats.min"
              :max="curStats.max"
              @change="onRangeChange"
            />
          </div>
        </div>
        <div class="footer">
          <el-button @click="reset">重置</el-button>
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <div v-else-if="active.endsWith('class')" class="card">
        <div class="title">分类值调整</div>
        <div class="toolbar">
          <el-steps
            :active="stepIndex"
            align-center
            finish-status="success"
            class="steps"
          >
            <el-step title="数据筛选" @click="goStep(0)" />
            <el-step title="特征选择" @click="goStep(1)" />
            <el-step title="分类值调整" @click="goStep(2)" />
            <el-step title="可视化展示" @click="goStep(3)" />
            <el-step title="标签配置" @click="goStep(4)" />
          </el-steps>
        </div>
        <div ref="classRef" class="chart" />
        <div class="footer">
          <el-checkbox-group v-model="checkedClassBoxes">
            <el-checkbox v-for="b in classBoxes" :key="b" :label="b" />
          </el-checkbox-group>
          <div class="spacer" />
          <el-button @click="reset">重置</el-button>
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <div v-else-if="active.endsWith('visual')" class="card">
        <div class="title">可视化展示</div>
        <div class="toolbar">
          <el-steps
            :active="stepIndex"
            align-center
            finish-status="success"
            class="steps"
          >
            <el-step title="数据筛选" @click="goStep(0)" />
            <el-step title="特征选择" @click="goStep(1)" />
            <el-step title="分类值调整" @click="goStep(2)" />
            <el-step title="可视化展示" @click="goStep(3)" />
            <el-step title="标签配置" @click="goStep(4)" />
          </el-steps>
        </div>
        <div class="visual-wrap">
          <div ref="radarRef" class="chart" />
          <div class="table-wrap">
            <el-table :data="companyScores" height="360">
              <el-table-column prop="name" label="企业" width="160" />
              <el-table-column prop="class" label="分类" width="120" />
              <el-table-column prop="rating" label="评级" width="120" />
              <el-table-column prop="score" label="评分" width="120" />
              <el-table-column label="操作" width="140">
                <template #default="{ row }">
                  <el-button size="small" @click="browseAll(row.name)"
                    >全数据浏览</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="chart-wrap"><div ref="compareRef" class="chart" /></div>
        <div class="footer">
          <el-button @click="reset">重置</el-button>
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <div v-else class="card">
        <div class="title">标签配置</div>
        <div class="toolbar">
          <el-steps
            :active="stepIndex"
            align-center
            finish-status="success"
            class="steps"
          >
            <el-step title="数据筛选" @click="goStep(0)" />
            <el-step title="特征选择" @click="goStep(1)" />
            <el-step title="分类值调整" @click="goStep(2)" />
            <el-step title="可视化展示" @click="goStep(3)" />
            <el-step title="标签配置" @click="goStep(4)" />
          </el-steps>
        </div>
        <el-table :data="tagRows" height="420">
          <el-table-column prop="name" label="企业" width="160" />
          <el-table-column prop="feature" label="特征" />
          <el-table-column prop="slice" label="切片" width="140" />
          <el-table-column prop="expert" label="专家评级" width="220">
            <template #default="scope">
              <el-select
                v-model="scope.row.expert"
                placeholder="选择或自定义"
                filterable
                allow-create
                default-first-option
              >
                <el-option
                  label="两用物品价格指纹风险高"
                  value="两用物品价格指纹风险高"
                />
                <el-option
                  label="两用物品物流指纹风险低"
                  value="两用物品物流指纹风险低"
                />
                <el-option
                  label="两用物品属地指纹风险高"
                  value="两用物品属地指纹风险高"
                />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
        <div class="footer">
          <el-button @click="reset">重置</el-button>
          <el-button type="success" @click="finish">完成</el-button>
        </div>
        <div v-if="finished" class="after">
          <div class="title">更新后的企业评级评分</div>
          <el-table :data="updatedScores" height="300">
            <el-table-column prop="name" label="企业" width="160" />
            <el-table-column prop="ratingDetail" label="专家评级详细" />
            <el-table-column prop="score" label="评分" width="120" />
          </el-table>
          <div class="footer">
            <el-button>取消</el-button>
            <el-button type="primary">详细结果浏览</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import * as echarts from "echarts";
import { useRouter } from "vue-router";
import { getTagDistribution } from "@/services/api";

const router = useRouter();
const active = ref("dualuse");
const onSelect = (key: string) => (active.value = key);
const steps = ref<string[]>([]);
const stepIndex = ref(0);
const versionOf = (k: string) => (k.includes("-") ? k.split("-")[0] : k);
const setVersionSteps = (v: string) => {
  steps.value = ["filter", "feature", "class", "visual", "tag"].map(
    (t) => `${v}-${t}`
  );
};
const goStep = (i: number) => {
  stepIndex.value = i;
  active.value = steps.value[i];
};
const nextStep = () => {
  if (stepIndex.value < steps.value.length - 1) goStep(stepIndex.value + 1);
};
const prevStep = () => {
  if (stepIndex.value > 0) goStep(stepIndex.value - 1);
};
const browseAll = (name: string) => {
  router.push({
    path: "/rating-profile/基本信息",
    query: { focusName: name, only: "1" },
  });
};
const versions = reactive<
  Record<string, { exists: boolean; enabled: boolean }>
>({
  v1: { exists: true, enabled: false },
  v2: { exists: true, enabled: false },
  v3: { exists: true, enabled: false },
  v4: { exists: true, enabled: false },
  v5: { exists: true, enabled: false },
});
const enableVersion = (v: string) => {
  Object.keys(versions).forEach((k) => (versions[k].enabled = k === v));
  setVersionSteps(v);
  active.value = `${v}-filter`;
  stepIndex.value = 0;
  reset();
};
const disableVersion = (v: string) => {
  if (versions[v]) versions[v].enabled = false;
  if (active.value.startsWith(`${v}-`)) {
    active.value = "dualuse";
    stepIndex.value = 0;
  }
};
const deleteVersion = (v: string) => {
  if (versions[v]) versions[v].exists = false;
  if (active.value.startsWith(`${v}-`)) {
    active.value = "dualuse";
    stepIndex.value = 0;
  }
};
const createNewVersion = () => {
  const nums = Object.keys(versions)
    .map((k) => Number(k.replace("v", "")))
    .filter((n) => !Number.isNaN(n));
  const next = Math.max(...nums) + 1;
  const key = `v${next}`;
  versions[key] = { exists: true, enabled: false } as any;
  enableVersion(key);
};

const distRef = ref<HTMLDivElement | null>(null);
const historyRef = ref<HTMLDivElement | null>(null);
const boxRef = ref<HTMLDivElement | null>(null);
const featureRef = ref<HTMLDivElement | null>(null);
const importanceRef = ref<HTMLDivElement | null>(null);
const classRef = ref<HTMLDivElement | null>(null);
const radarRef = ref<HTMLDivElement | null>(null);
const compareRef = ref<HTMLDivElement | null>(null);
const enableRef = ref<HTMLDivElement | null>(null);
const disableRef = ref<HTMLDivElement | null>(null);
const deleteRef = ref<HTMLDivElement | null>(null);
const topicPieRef = ref<HTMLDivElement | null>(null);
const topicTrendRef = ref<HTMLDivElement | null>(null);

const distChartType = ref<"bar" | "line">("bar");

const tagDist = reactive<{ name: string; value: number }[]>([]);
const distError = ref(false);

const renderDist = async () => {
  if (!distRef.value) return;
  const chart = echarts.init(distRef.value);
  if (!tagDist.length) {
    try {
      const data = await getTagDistribution();
      Object.assign(tagDist, data?.rows || []);
    } catch {
      distError.value = true;
    }
    if (!tagDist.length) return;
  }
  const sorted = [...tagDist].sort((a, b) => b.value - a.value);
  const option = {
    grid: { left: 60, right: 20, top: 30, bottom: 20 },
    xAxis: { type: "value" },
    yAxis: { type: "category", data: sorted.map((i) => i.name) },
    series: [
      {
        type: distChartType.value,
        data: sorted.map((i) => i.value),
        itemStyle: { color: "#3b82f6" },
      },
    ],
    tooltip: { trigger: "axis" },
  };
  chart.setOption(option);
  chart.on("click", (params: any) => {
    const cat = params.name;
    router.push({ path: "/rating-profile/基本信息", query: { category: cat } });
  });
  const onResize = () => chart.resize();
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    chart.dispose();
  };
};

const renderHistory = () => {
  if (!historyRef.value) return;
  const chart = echarts.init(historyRef.value);
  const option = {
    grid: { left: 40, right: 20, top: 30, bottom: 40 },
    xAxis: { type: "category", data: ["Q1", "Q2", "Q3"] },
    yAxis: { type: "value" },
    legend: { data: ["低", "中", "高", "极高"] },
    series: [
      {
        name: "低",
        type: "bar",
        stack: "total",
        data: [20, 18, 15],
        itemStyle: { color: "#93c5fd" },
      },
      {
        name: "中",
        type: "bar",
        stack: "total",
        data: [30, 28, 26],
        itemStyle: { color: "#60a5fa" },
      },
      {
        name: "高",
        type: "bar",
        stack: "total",
        data: [25, 30, 32],
        itemStyle: { color: "#3b82f6" },
      },
      {
        name: "极高",
        type: "bar",
        stack: "total",
        data: [25, 24, 27],
        itemStyle: { color: "#1d4ed8" },
      },
    ],
    tooltip: { trigger: "axis" },
  };
  chart.setOption(option);
  const onResize = () => chart.resize();
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    chart.dispose();
  };
};

const renderBox = () => {
  if (!boxRef.value) return;
  const chart = echarts.init(boxRef.value);
  const option = {
    tooltip: { trigger: "item" },
    legend: { data: ["低", "中", "高", "极高"] },
    xAxis: { type: "category", data: ["低", "中", "高", "极高"] },
    yAxis: { type: "value" },
    series: [
      { name: "低", type: "boxplot", data: [[20, 32, 40, 50, 62]] },
      { name: "中", type: "boxplot", data: [[30, 40, 55, 68, 80]] },
      { name: "高", type: "boxplot", data: [[50, 62, 75, 88, 100]] },
      { name: "极高", type: "boxplot", data: [[70, 85, 92, 105, 120]] },
    ],
  };
  chart.setOption(option);
  const onResize = () => chart.resize();
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    chart.dispose();
  };
};

const filterKeyword = ref("");
const rows = reactive<
  { company: string; field: string; value: any; date: string }[]
>([]);
const filteredRows = ref(rows);
const selectedEnterprises = ref<string[]>([]);
const onSelectionChange = (sel: any[]) => {
  selectedEnterprises.value = Array.from(new Set(sel.map((r) => r.company)));
  generateAggStats();
};
const toBasic = (row: any) => {
  const name = row?.company;
  if (!name) return;
  router.push({ path: "/rating-profile/基本信息", query: { focusName: name } });
};
watch(filterKeyword, () => {
  const k = filterKeyword.value.trim();
  filteredRows.value = rows.filter((r) => JSON.stringify(r).includes(k));
});

const features = reactive(
  Array.from({ length: 20 }, (_, i) => {
    const names = [
      "出口量",
      "出口频次",
      "交易金额",
      "物流时长",
      "商品类别",
      "目的地区",
      "退货率",
      "异常记录次数",
      "合规事件数",
      "供应商数量",
      "买家数量",
      "订单均值",
      "发票均值",
      "清关耗时",
      "申报差异",
      "运费均值",
      "温控偏差",
      "破损率",
      "库存周转",
      "历史违规",
    ];
    const name =
      names[i % names.length] +
      (i >= names.length ? `-${i - names.length + 1}` : "");
    const min = Math.floor(10 + Math.random() * 50);
    const max = min + Math.floor(50 + Math.random() * 200);
    const low = Math.floor(min + (max - min) * 0.25);
    const mid = Math.floor(min + (max - min) * 0.5);
    const high = Math.floor(min + (max - min) * 0.8);
    return { name, min, max, low, mid, high };
  })
);
const checkedFeatures = ref<string[]>([]);
const activeFeature = ref<string>(features[0].name);
const curStats = ref(features[0]);
const curRange = ref<[number, number]>([
  curStats.value.min,
  curStats.value.max,
]);
const featureAggStats = ref<
  Record<
    string,
    { min: number; max: number; low: number; mid: number; high: number }
  >
>({});
const hash = (s: string) =>
  s.split("").reduce((a, c) => (a * 131 + c.charCodeAt(0)) % 9973, 7);
const generateAggStats = () => {
  const map: Record<
    string,
    { min: number; max: number; low: number; mid: number; high: number }
  > = {};
  for (const f of features) {
    let mins: number[] = [];
    let maxs: number[] = [];
    let meds: number[] = [];
    const names = selectedEnterprises.value.length
      ? selectedEnterprises.value
      : ["华北电力集团", "北京首钢集团", "上海电气股份有限公司"];
    for (const n of names) {
      const seed = hash(n + f.name);
      const min = f.min + (seed % 20);
      const max = f.max - (seed % 15);
      const mid = Math.floor((min + max) / 2);
      mins.push(min);
      maxs.push(max);
      meds.push(mid);
    }
    const min = Math.min(...mins);
    const max = Math.max(...maxs);
    const mid = Math.floor(meds.reduce((a, b) => a + b, 0) / meds.length);
    const low = Math.floor(min + (mid - min) * 0.5);
    const high = Math.floor(mid + (max - mid) * 0.6);
    map[f.name] = { min, max, low, mid, high };
  }
  featureAggStats.value = map;
};
const openFeature = (f: any) => {
  activeFeature.value = f.name;
  const s = featureAggStats.value[f.name] || f;
  curStats.value = {
    name: f.name,
    min: s.min,
    max: s.max,
    low: s.low,
    mid: s.mid,
    high: s.high,
  } as any;
  curRange.value = [s.min, s.max];
  setTimeout(() => {
    const d = renderFeature();
    if (d) disposers.push(d);
  }, 0);
};
const onRangeChange = () => {
  const left = curRange.value[0];
  const right = curRange.value[1];
  const mid = Math.floor((left + right) / 2);
  curStats.value = {
    name: curStats.value.name,
    min: Math.min(curStats.value.min, left),
    max: Math.max(curStats.value.max, right),
    low: left,
    mid,
    high: right,
  } as any;
  setTimeout(() => {
    const d = renderFeature();
    if (d) disposers.push(d);
  }, 0);
};
const renderFeature = () => {
  if (!featureRef.value) return;
  const chart = echarts.init(featureRef.value);
  const s = curStats.value;
  const bins = 20;
  const step = (s.max - s.min) / bins;
  const xs = Array.from({ length: bins }, (_, i) =>
    Math.round(s.min + step * i)
  );
  const data = xs.map((x) => {
    const center = s.mid;
    const dist = Math.abs(x - center) / (s.max - s.min);
    return Math.max(2, Math.round(20 * Math.exp(-6 * dist)));
  });
  const inRange = (x: number) =>
    x >= curRange.value[0] && x <= curRange.value[1];
  const option = {
    title: { text: `${activeFeature.value} 分布与筛选`, left: "center" },
    grid: { left: 40, right: 20, top: 50, bottom: 40 },
    xAxis: { type: "category", data: xs },
    yAxis: { type: "value" },
    series: [
      {
        type: "bar",
        data: data,
        itemStyle: {
          color: (p: any) => (inRange(xs[p.dataIndex]) ? "#3b82f6" : "#93c5fd"),
        },
      },
      {
        type: "scatter",
        data: [s.low, s.mid, s.high].map((v) => [v, Math.max(...data) * 0.9]),
        symbolSize: 10,
        itemStyle: { color: "#1d4ed8" },
      },
    ],
    tooltip: { trigger: "axis" },
  };
  chart.setOption(option);
  const onResize = () => chart.resize();
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    chart.dispose();
  };
};

const renderImportance = () => {
  if (!importanceRef.value) return;
  const chart = echarts.init(importanceRef.value);
  const cats = features.map((f) => f.name);
  const data = features.map((f, i) =>
    Number((0.15 * Math.exp(-i / 6)).toFixed(3))
  );
  const option = {
    title: { text: "SHAP Feature Importance (Top 20 Feat)", left: "center" },
    grid: { left: 180, right: 20, top: 40, bottom: 30 },
    xAxis: { type: "value" },
    yAxis: { type: "category", data: cats },
    series: [{ type: "bar", data, itemStyle: { color: "#3b82f6" } }],
    tooltip: { trigger: "axis" },
  };
  chart.setOption(option);
  const onResize = () => chart.resize();
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    chart.dispose();
  };
};

const classBoxes = ref<string[]>([]);
const checkedClassBoxes = ref<string[]>([]);
const renderClass = () => {
  if (!classRef.value) return;
  const chart = echarts.init(classRef.value);
  const ks = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const base = [0.095, 0.072, 0.063, 0.062, 0.058, 0.057, 0.061, 0.053, 0.05];
  const factor = 1 + Math.min(checkedClassBoxes.value.length, 60) * 0.003;
  const silhouette = base.map((v) => Number((v * factor).toFixed(3)));
  const option = {
    title: { text: "Silhouette Scores vs. Number of Clusters", left: "center" },
    grid: { left: 50, right: 20, top: 50, bottom: 40 },
    xAxis: { type: "category", name: "Number of Clusters (k)", data: ks },
    yAxis: { type: "value", name: "Silhouette Score", min: 0, max: 0.12 },
    series: [
      {
        name: "Silhouette",
        type: "line",
        data: silhouette,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { width: 3, color: "#3b82f6" },
        itemStyle: { color: "#3b82f6" },
      },
    ],
    tooltip: { trigger: "axis" },
  };
  chart.setOption(option);
  const onResize = () => chart.resize();
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    chart.dispose();
  };
};

const renderRadar = () => {
  if (!radarRef.value) return;
  const chart = echarts.init(radarRef.value);
  const names = selectedEnterprises.value.length
    ? selectedEnterprises.value
    : ["华北电力集团", "北京首钢集团", "上海电气股份有限公司"];
  const classes = ["低", "中", "高", "极高"];
  const data = classes.map((c, i) => ({ name: c, value: (i + 1) * 10 }));
  const option = {
    title: { text: "分类分布（饼图）", left: "center" },
    tooltip: { trigger: "item" },
    series: [{ type: "pie", radius: ["40%", "70%"], data: data }],
  };
  chart.setOption(option);
  chart.on("click", (p: any) => {
    const t = String(p?.name || "").trim();
    if (t)
      router.push({
        path: "/rating-profile/标签管理/标签企业列表",
        query: { tag: t },
      });
  });
  window.addEventListener("resize", () => chart.resize());
  return () => {
    window.removeEventListener("resize", () => chart.resize());
    chart.dispose();
  };
};

const renderEnable = () => {
  if (!enableRef.value) return;
  const chart = echarts.init(enableRef.value);
  const option = {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { name: "已启用", value: 36 },
          { name: "未启用", value: 14 },
        ],
      },
    ],
  };
  chart.setOption(option);
  window.addEventListener("resize", () => chart.resize());
  return () => {
    window.removeEventListener("resize", () => chart.resize());
    chart.dispose();
  };
};

const renderDisable = () => {
  if (!disableRef.value) return;
  const chart = echarts.init(disableRef.value);
  const option = {
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: ["一月", "二月", "三月", "四月"] },
    yAxis: { type: "value" },
    series: [
      { type: "line", data: [4, 6, 5, 7], itemStyle: { color: "#3b82f6" } },
    ],
  };
  chart.setOption(option);
  window.addEventListener("resize", () => chart.resize());
  return () => {
    window.removeEventListener("resize", () => chart.resize());
    chart.dispose();
  };
};

const renderDelete = () => {
  if (!deleteRef.value) return;
  const chart = echarts.init(deleteRef.value);
  const option = {
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: ["过期", "重复", "异常", "手动"] },
    yAxis: { type: "value" },
    series: [
      { type: "bar", data: [3, 5, 2, 1], itemStyle: { color: "#3b82f6" } },
    ],
  };
  chart.setOption(option);
  window.addEventListener("resize", () => chart.resize());
  return () => {
    window.removeEventListener("resize", () => chart.resize());
    chart.dispose();
  };
};

const selectionSummary = () => {
  const names = new Set(checkedFeatures.value);
  const selected = features.filter((f) => names.has(f.name));
  const count = selected.length || 1;
  const widths = selected.map(
    (f) => (curRange.value[1] - curRange.value[0]) / (f.max - f.min)
  );
  const avgWidth = widths.length
    ? widths.reduce((a, b) => a + b, 0) / widths.length
    : 1;
  return { count, avgWidth };
};

const renderCompare = () => {
  if (!compareRef.value) return;
  const chart = echarts.init(compareRef.value);
  const { count, avgWidth } = selectionSummary();
  const names = selectedEnterprises.value.length
    ? selectedEnterprises.value
    : ["华北电力集团", "北京首钢集团", "上海电气股份有限公司"];
  const base = 60;
  const scores = names.map((_, i) =>
    Math.round(base + 5 * (i + 1) + 8 * count * (1 - avgWidth))
  );
  const option = {
    title: { text: "企业对比（评分）", left: "center" },
    xAxis: { type: "category", data: names },
    yAxis: { type: "value" },
    series: [{ type: "bar", data: scores, itemStyle: { color: "#3b82f6" } }],
    tooltip: { trigger: "axis" },
  };
  chart.setOption(option);
  window.addEventListener("resize", () => chart.resize());
  return () => {
    window.removeEventListener("resize", () => chart.resize());
    chart.dispose();
  };
};

const topicRows = ref([
  { tag: "价格异常", count: 28, risk: "高" },
  { tag: "物流延迟", count: 18, risk: "中" },
  { tag: "属地集中", count: 12, risk: "中" },
]);
const renderTopicPie = () => {
  if (!topicPieRef.value) return;
  const chart = echarts.init(topicPieRef.value);
  const option = {
    tooltip: { trigger: "item" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        data: [
          { name: "价格异常", value: 28 },
          { name: "物流延迟", value: 18 },
          { name: "属地集中", value: 12 },
        ],
      },
    ],
  };
  chart.setOption(option);
  chart.on("click", (p: any) => {
    const t = String(p?.name || "").trim();
    if (t)
      router.push({
        path: "/rating-profile/标签管理/标签企业列表",
        query: { tag: t },
      });
  });
  window.addEventListener("resize", () => chart.resize());
  return () => {
    window.removeEventListener("resize", () => chart.resize());
    chart.dispose();
  };
};
const renderTopicTrend = () => {
  if (!topicTrendRef.value) return;
  const chart = echarts.init(topicTrendRef.value);
  const option = {
    tooltip: { trigger: "axis" },
    legend: { data: ["价格异常", "物流延迟", "属地集中"] },
    xAxis: { type: "category", data: ["Q1", "Q2", "Q3", "Q4"] },
    yAxis: { type: "value" },
    series: [
      { name: "价格异常", type: "line", data: [22, 28, 26, 30] },
      { name: "物流延迟", type: "line", data: [12, 18, 16, 20] },
      { name: "属地集中", type: "line", data: [10, 12, 14, 12] },
    ],
  };
  chart.setOption(option);
  chart.on("click", (p: any) => {
    const t = String(p?.seriesName || "").trim();
    if (t)
      router.push({
        path: "/rating-profile/标签管理/标签企业列表",
        query: { tag: t },
      });
  });
  window.addEventListener("resize", () => chart.resize());
  return () => {
    window.removeEventListener("resize", () => chart.resize());
    chart.dispose();
  };
};

const companyScores = ref(
  ["华北电力集团", "北京首钢集团", "上海电气股份有限公司"].map((n, i) => ({
    name: n,
    class: "两用物项",
    rating: ["A级", "B级", "A-级"][i % 3],
    score: 80 + i * 3,
  }))
);

const tagRows = ref<
  { name: string; feature: string; slice: string; expert?: string }[]
>([]);
const refreshTagRows = () => {
  const names = selectedEnterprises.value.length
    ? selectedEnterprises.value
    : ["华北电力集团", "北京首钢集团", "上海电气股份有限公司"];
  const feats = checkedFeatures.value.length
    ? checkedFeatures.value.slice(0, 3)
    : ["价格指纹", "物流指纹", "属地指纹"];
  tagRows.value = names.map((n, i) => ({
    name: n,
    feature: feats[i % feats.length],
    slice: ["北京", "上海", "深圳", "天津"][i % 4],
  }));
};
const finished = ref(false);
const updatedScores = ref([
  { name: "华北电力集团", ratingDetail: "两用物品价格指纹风险高", score: 88 },
  { name: "北京首钢集团", ratingDetail: "两用物品物流指纹风险低", score: 82 },
]);
const reset = () => {
  filterKeyword.value = "";
  checkedFeatures.value = features.map((f) => f.name);
  classBoxes.value = checkedFeatures.value.flatMap((n) => [
    `${n}-左值`,
    `${n}-中值`,
    `${n}-右值`,
  ]);
  checkedClassBoxes.value = [...classBoxes.value];
};
const finish = () => {
  finished.value = true;
};

let disposers: (() => void)[] = [];
const mountCharts = async () => {
  disposers.forEach((d) => d());
  disposers = [];
  if (active.value === "dualuse") {
    const d1 = await renderDist();
    if (d1) disposers.push(d1);
    const d2 = renderHistory();
    if (d2) disposers.push(d2);
    const d3 = renderBox();
    if (d3) disposers.push(d3);
  } else if (active.value.endsWith("feature")) {
    const d1 = renderImportance();
    if (d1) disposers.push(d1);
    const d2 = renderFeature();
    if (d2) disposers.push(d2);
  } else if (active.value.endsWith("class")) {
    const d = renderClass();
    if (d) disposers.push(d);
  } else if (active.value.endsWith("visual")) {
    const d = renderRadar();
    if (d) disposers.push(d);
    const c = renderCompare();
    if (c) disposers.push(c);
  } else if (active.value === "topic") {
    const d1 = renderTopicPie();
    if (d1) disposers.push(d1);
    const d2 = renderTopicTrend();
    if (d2) disposers.push(d2);
  } else if (active.value.endsWith("enable")) {
    const d = renderEnable();
    if (d) disposers.push(d);
  } else if (active.value.endsWith("disable")) {
    const d = renderDisable();
    if (d) disposers.push(d);
  } else if (active.value.endsWith("delete")) {
    const d = renderDelete();
    if (d) disposers.push(d);
  }
};

import { getEnterpriseBasicInfo } from "@/services/api";
onMounted(async () => {
  try {
    const data = await getEnterpriseBasicInfo(undefined);
    const list = (data?.rows || []).map((r: any) => ({
      name: r.name,
      category: r.category,
      region: r.region,
      risk: r.risk,
    }));
    const today = new Date().toISOString().slice(0, 10);
    list.forEach((r: any) => {
      rows.push({
        company: r.name,
        field: "类别",
        value: r.category,
        date: today,
      });
      rows.push({
        company: r.name,
        field: "地区",
        value: r.region,
        date: today,
      });
      rows.push({
        company: r.name,
        field: "风险等级",
        value: r.risk,
        date: today,
      });
    });
    filteredRows.value = rows;
  } catch {}
  mountCharts();
});
watch(active, () => {
  if (active.value.includes("-")) {
    setVersionSteps(versionOf(active.value));
  }
  if (active.value.endsWith("class")) {
    classBoxes.value = (checkedFeatures.value || []).flatMap((n) => [
      `${n}-左值`,
      `${n}-中值`,
      `${n}-右值`,
    ]);
    checkedClassBoxes.value = [...classBoxes.value];
  }
  if (active.value.endsWith("tag")) {
    refreshTagRows();
  }
  setTimeout(mountCharts, 0);
});
watch(checkedClassBoxes, () => {
  if (active.value.endsWith("class")) setTimeout(mountCharts, 0);
});
watch(distChartType, () => {
  if (active.value === "dualuse") setTimeout(mountCharts, 0);
});
onUnmounted(() => {
  disposers.forEach((d) => d());
});
</script>

<style scoped>
.panel {
  display: flex;
}
.left-mini-sidebar {
  width: 240px;
  border-right: 1px solid var(--border-color);
  background: var(--main-bg);
}
.mini {
  border-right: none;
}
.version-actions {
  display: flex;
  gap: 8px;
  padding: 8px 12px 12px;
}
.version-actions :deep(.el-button) {
  background: linear-gradient(180deg, #60a5fa, #3b82f6);
  border: none;
  color: #fff;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.35);
}
.version-actions :deep(.el-button.is-plain) {
  background: linear-gradient(180deg, #93c5fd, #60a5fa);
  color: #0b1e42;
}
.params-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.chart-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 240px;
}
.chart {
  height: 100%;
  width: 100%;
}
.right-content {
  flex: 1;
  padding: 12px;
}
.grid3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
.card {
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
}
.title {
  font-weight: 600;
  margin-bottom: 8px;
}
.chart {
  height: 260px;
}
.btns {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
.toolbar {
  margin-bottom: 8px;
}
.footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.feature-wrap {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 12px;
}
.feature-list {
  width: 100%;
  height: 320px;
  overflow: auto;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  padding: 8px;
}
.importance-chart {
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
}
.feature-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
}
.feature-item:hover {
  background: rgba(59, 130, 246, 0.06);
  border-radius: 6px;
  cursor: pointer;
}
.fname {
  color: var(--text-primary);
}
.feature-detail {
  display: grid;
  grid-template-rows: 260px auto;
  gap: 8px;
  margin-top: 12px;
}
.detail-values {
  display: flex;
  align-items: center;
  gap: 12px;
}
.visual-wrap {
  display: flex;
  gap: 12px;
}
.table-wrap {
  flex: 1;
}
.spacer {
  flex: 1;
}
.after {
  margin-top: 12px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
