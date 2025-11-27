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
      <div class="title">建模：冷冻水产品质量风险</div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="算法">RandomForest</el-descriptions-item>
        <el-descriptions-item label="数据量">12,340 条</el-descriptions-item>
        <el-descriptions-item label="AUC">0.83</el-descriptions-item>
        <el-descriptions-item label="F1">0.78</el-descriptions-item>
      </el-descriptions>
    </div>
    <div v-else-if="activeTab === 'tuning'" class="content">
      <div class="title">调优：质量与温控指标</div>
      <div class="charts">
        <div ref="tempRef" class="chart" />
        <div ref="qualityRef" class="chart" />
      </div>
      <div class="footer">
        <el-button>重置</el-button>
        <el-button type="primary">下一步</el-button>
      </div>
    </div>
    <div v-else class="content">
      <el-result
        icon="success"
        title="发布中心"
        sub-title="冷冻水产品模型待发布"
      >
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
const tempRef = ref<HTMLDivElement | null>(null);
const qualityRef = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (tempRef.value) {
    const c = echarts.init(tempRef.value);
    c.setOption({
      title: { text: "温度控制趋势" },
      xAxis: { type: "category", data: ["一月", "二月", "三月", "四月"] },
      yAxis: { type: "value" },
      series: [{ type: "line", data: [2.1, 1.8, 2.5, 2.0] }],
    });
  }
  if (qualityRef.value) {
    const c = echarts.init(qualityRef.value);
    c.setOption({
      title: { text: "质量指标分布" },
      xAxis: { type: "category", data: ["低", "中", "高"] },
      yAxis: { type: "value" },
      series: [
        { type: "bar", data: [20, 36, 24], itemStyle: { color: "#3b82f6" } },
      ],
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
