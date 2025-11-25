<template>
  <div class="panel">
    <div class="left-mini-sidebar">
      <el-menu :default-active="active" class="mini" :unique-opened="true">
        <el-sub-menu index="alg">
          <template #title>算法</template>
          <el-menu-item index="alg-current">正在使用的算法</el-menu-item>
          <el-menu-item index="alg-optional">可选算法</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="prep">前期数据准备</el-menu-item>
        <el-menu-item index="train">模型训练过程</el-menu-item>
      </el-menu>
    </div>
    <div class="right-content">
      <div v-if="active === 'alg-current'" class="box">
        <el-card>
          <div class="title">正在使用的算法：XGBoost</div>
          <div class="flow-wrap">
            <vue-flow :nodes="nodes" :edges="edges" fit-view />
          </div>
          <div class="charts">
            <div class="chart-wrap">
              <el-alert
                v-if="pressureError"
                type="error"
                :title="'后端不可联通或错误'"
                show-icon
                closable
              />
              <el-empty v-else-if="pressureEmpty" description="后端无数据" />
              <div v-else ref="stressRef" class="chart" />
            </div>
            <div class="chart-wrap">
              <el-alert
                v-if="trainingError"
                type="error"
                :title="'后端不可联通或错误'"
                show-icon
                closable
              />
              <el-empty v-else-if="trainingEmpty" description="后端无数据" />
              <div v-else ref="trainMetricRef" class="chart" />
            </div>
          </div>
        </el-card>
      </div>
      <div v-else-if="active === 'alg-optional'" class="box">
        <el-card>
          <el-table :data="algOptions" style="width: 100%">
            <el-table-column prop="name" label="名称" width="160" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="desc" label="说明" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button size="small" type="primary">应用</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
      <div v-else-if="active === 'prep'" class="box">
        <el-card>
          <div class="title">前期数据准备</div>
          <el-table :data="prepData" height="360">
            <el-table-column prop="name" label="字段" width="180" sortable />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column
              prop="missing"
              label="缺失率"
              width="120"
              sortable
            />
            <el-table-column prop="desc" label="说明" />
          </el-table>
        </el-card>
      </div>
      <div v-else class="box">
        <el-card>
          <div class="title">模型训练过程</div>
          <el-steps :active="3" finish-status="success">
            <el-step title="数据分割" description="训练/验证/测试集" />
            <el-step title="特征工程" description="编码、归一化、处理缺失" />
            <el-step title="训练" description="XGBoost 100轮" />
            <el-step title="评估" description="AUC 0.87" />
          </el-steps>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { VueFlow, useVueFlow } from "@vue-flow/core";
import * as echarts from "echarts";
import { getModelPressure, getModelTraining } from "@/services/api";

const active = ref("alg-current");
const nodes = ref([
  { id: "1", position: { x: 0, y: 0 }, label: "输入" },
  { id: "2", position: { x: 180, y: 0 }, label: "特征工程" },
  { id: "3", position: { x: 360, y: 0 }, label: "XGBoost" },
  { id: "4", position: { x: 540, y: 0 }, label: "评估" },
]);
const edges = ref([
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4" },
]);

const algOptions = ref([
  { name: "LightGBM", type: "梯度提升", desc: "高效、快速" },
  { name: "RandomForest", type: "集成学习", desc: "鲁棒性强" },
  { name: "SVM", type: "监督学习", desc: "间隔最大化" },
]);

const prepData = ref([
  { name: "交易金额", type: "float", missing: "2.1%", desc: "单位：万元" },
  { name: "商品类别", type: "category", missing: "0.0%", desc: "编码映射" },
  { name: "出口地区", type: "category", missing: "1.2%", desc: "省市编码" },
  { name: "物流时长", type: "int", missing: "0.7%", desc: "单位：天" },
]);

const stressRef = ref<HTMLDivElement | null>(null);
const trainMetricRef = ref<HTMLDivElement | null>(null);
const pressureError = ref(false);
const pressureEmpty = ref(false);
const trainingError = ref(false);
const trainingEmpty = ref(false);
let disposers: (() => void)[] = [];
const renderStress = async () => {
  if (!stressRef.value) return;
  const chart = echarts.init(stressRef.value);
  let qps: number[] = [];
  let time: number[] = [];
  try {
    const data = await getModelPressure();
    if (Array.isArray(data?.qps)) qps = data.qps;
    if (Array.isArray(data?.time)) time = data.time;
  } catch {
    pressureError.value = true;
  }
  if (!qps.length || !time.length) {
    pressureEmpty.value = !pressureError.value;
    chart.dispose();
    return;
  }
  chart.setOption({
    title: { text: "算法压力测试（QPS/耗时）" },
    tooltip: { trigger: "axis" },
    legend: { data: ["QPS", "耗时(ms)"] },
    xAxis: { type: "category", data: ["XGBoost", "LightGBM", "RF", "SVM"] },
    yAxis: { type: "value" },
    series: [
      { name: "QPS", type: "bar", data: qps, itemStyle: { color: "#3b82f6" } },
      { name: "耗时(ms)", type: "line", data: time },
    ],
  });
  const onResize = () => chart.resize();
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    chart.dispose();
  };
};
const renderTrainMetric = async () => {
  if (!trainMetricRef.value) return;
  const chart = echarts.init(trainMetricRef.value);
  let auc: number[] = [];
  let loss: number[] = [];
  try {
    const data = await getModelTraining();
    if (Array.isArray(data?.auc)) auc = data.auc;
    if (Array.isArray(data?.loss)) loss = data.loss;
  } catch {
    trainingError.value = true;
  }
  if (!auc.length || !loss.length) {
    trainingEmpty.value = !trainingError.value;
    chart.dispose();
    return;
  }
  chart.setOption({
    title: { text: "训练过程指标（AUC/损失）" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: Array.from({ length: 10 }, (_, i) => `迭代${i + 1}`),
    },
    yAxis: { type: "value" },
    series: [
      { name: "AUC", type: "line", data: auc },
      { name: "Loss", type: "line", data: loss },
    ],
  });
  const onResize = () => chart.resize();
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    chart.dispose();
  };
};
onMounted(async () => {
  const d1 = await renderStress();
  if (d1) disposers.push(d1);
  const d2 = await renderTrainMetric();
  if (d2) disposers.push(d2);
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
  width: 220px;
  border-right: 1px solid var(--border-color);
  background: var(--main-bg);
}
.mini {
  border-right: none;
}
.right-content {
  flex: 1;
  padding: 12px;
}
.box {
  padding: 8px;
}
.title {
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}
.flow-wrap {
  height: 280px;
}
.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
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
</style>
