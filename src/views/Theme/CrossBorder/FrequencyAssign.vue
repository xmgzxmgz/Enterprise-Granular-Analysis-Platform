<template>
  <div class="page-wrap">
    <div class="top-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="建模" name="modeling" />
        <el-tab-pane label="调优" name="tuning" />
        <el-tab-pane label="发布" name="publish" />
      </el-tabs>
    </div>
    <div v-if="activeTab === 'modeling'" class="content">
      <div class="title">建模：敏感指标数频分配</div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="算法">LightGBM</el-descriptions-item>
        <el-descriptions-item label="样本">8,760 条</el-descriptions-item>
        <el-descriptions-item label="AUC">0.86</el-descriptions-item>
        <el-descriptions-item label="F1">0.79</el-descriptions-item>
      </el-descriptions>
    </div>
    <div v-else-if="activeTab === 'tuning'" class="content">
      <div class="title">调优：数频分配</div>
      <div class="charts">
        <div ref="freqRef" class="chart" />
        <div ref="heatRef" class="chart" />
      </div>
      <div class="footer">
        <el-button>重置</el-button>
        <el-button type="primary">下一步</el-button>
      </div>
    </div>
    <div v-else class="content">
      <el-result icon="success" title="发布中心" sub-title="数频分配模型待发布">
        <template #extra>
          <el-button type="primary">立即发布</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
const activeTab = ref<"modeling" | "tuning" | "publish">("modeling");
const freqRef = ref<HTMLDivElement | null>(null);
const heatRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (freqRef.value) {
    const c = echarts.init(freqRef.value);
    c.setOption({
      title: { text: "频次分布" },
      xAxis: { type: "category", data: ["低", "中", "高", "极高"] },
      yAxis: { type: "value" },
      series: [
        {
          type: "bar",
          data: [24, 36, 28, 18],
          itemStyle: { color: "#3b82f6" },
        },
      ],
    });
  }
  if (heatRef.value) {
    const c = echarts.init(heatRef.value);
    const data = [] as any[];
    const x = ["A", "B", "C", "D"];
    const y = ["Q1", "Q2", "Q3", "Q4"];
    for (let i = 0; i < x.length; i++) {
      for (let j = 0; j < y.length; j++) {
        data.push([i, j, Math.round(Math.random() * 20 + 10)]);
      }
    }
    c.setOption({
      title: { text: "企业×季度 热度" },
      tooltip: {},
      xAxis: { type: "category", data: x },
      yAxis: { type: "category", data: y },
      visualMap: {
        min: 10,
        max: 30,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 0,
      },
      series: [{ type: "heatmap", data }],
    });
  }
});
</script>

<style scoped>
.page-wrap {
  padding: 16px;
}
.top-tabs {
  margin-bottom: 12px;
}
.content {
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 24px;
}
.title {
  font-weight: 600;
  margin-bottom: 12px;
}
.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.chart {
  height: 260px;
}
</style>
