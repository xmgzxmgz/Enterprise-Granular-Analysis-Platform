<template>
  <div class="wrap">
    <el-card>
      <div class="title">切面分析</div>
      <div class="toolbar">
        <el-select
          v-model="selected"
          multiple
          placeholder="选择企业"
          style="min-width: 300px"
        >
          <el-option
            v-for="n in enterpriseNames"
            :key="n"
            :label="n"
            :value="n"
          />
        </el-select>
        <el-radio-group v-model="direction">
          <el-radio-button label="价格优势" />
          <el-radio-button label="物流优势" />
        </el-radio-group>
        <el-button @click="compare">对比分析</el-button>
      </div>
      <div class="charts">
        <div ref="chartRef" class="chart" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as echarts from "echarts";
import { getEnterpriseBasicInfo } from "@/services/api";

const enterpriseNames = ref<string[]>([]);
const selected = ref<string[]>([]);
const direction = ref<"价格优势" | "物流优势">("价格优势");
const chartRef = ref<HTMLDivElement | null>(null);

const hash = (s: string) =>
  s.split("").reduce((a, c) => (a * 131 + c.charCodeAt(0)) % 9973, 7);
const genScore = (name: string, dir: string) => {
  const base = hash(name + dir);
  const score = 60 + (base % 30);
  const price = 50 + (base % 40);
  const logistics = 50 + ((base * 3) % 40);
  return { score, price, logistics };
};

const compare = () => {
  if (!chartRef.value) return;
  const c = echarts.init(chartRef.value);
  const names = selected.value.length
    ? selected.value
    : enterpriseNames.value.slice(0, 3);
  const data = names.map((n) => genScore(n, direction.value));
  const cats =
    direction.value === "价格优势"
      ? ["价格指数", "综合得分"]
      : ["物流指数", "综合得分"];
  const s1 =
    direction.value === "价格优势"
      ? data.map((d) => d.price)
      : data.map((d) => d.logistics);
  const s2 = data.map((d) => d.score);
  c.setOption({
    title: { text: `企业${direction.value}对比`, left: "center" },
    tooltip: { trigger: "axis" },
    legend: { data: cats },
    xAxis: { type: "category", data: names },
    yAxis: { type: "value" },
    series: [
      { name: cats[0], type: "bar", data: s1, itemStyle: { color: "#3b82f6" } },
      { name: cats[1], type: "line", data: s2 },
    ],
  });
};

onMounted(async () => {
  try {
    const data = await getEnterpriseBasicInfo();
    enterpriseNames.value = (data?.rows || []).map((r: any) => r.name);
  } catch {}
  compare();
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
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.charts {
  display: flex;
}
.chart {
  height: 360px;
  width: 100%;
}
</style>
