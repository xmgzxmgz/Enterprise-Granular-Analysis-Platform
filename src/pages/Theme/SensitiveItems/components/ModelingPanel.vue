<template>
  <div class="panel">
    <div class="left-mini-sidebar">
      <el-menu :default-active="active" class="mini" :unique-opened="true" @select="onSelect">
        <el-sub-menu index="alg">
          <template #title>算法（正在使用的算法）</template>
        </el-sub-menu>
        <el-menu-item index="prep">前期数据准备</el-menu-item>
        <el-menu-item index="train">模型训练过程</el-menu-item>
      </el-menu>
    </div>
    <div class="right-content">
      <div v-if="active === 'alg-current'" class="box">
        <el-card>
          <div class="title">两用物项算法示意图</div>
          <div class="diagram-img">
            <template v-if="!imgError">
              <img :src="modelingFlowSrc" alt="建模流程图" @error="imgError = true" />
            </template>
            <el-empty
              v-else
              description="流程图图片未找到：请放置到 public/assets/modeling-flow.jpg"
            />
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
            </div>
          </div>
        </el-card>
      </div>
      <div v-else-if="active === 'alg-optional'" class="box">
        <el-card>
          <div class="title">可选算法流程图</div>
          <div class="actions" style="margin-bottom: 8px">
            <el-radio-group v-model="selectedAlg" size="small" @change="onAlgChange">
              <el-radio-button label="LightGBM" />
              <el-radio-button label="RandomForest" />
              <el-radio-button label="SVM" />
            </el-radio-group>
          </div>
          <div class="flow-wrap">
            <VueFlow :nodes="optNodes" :edges="optEdges" fit-view />
          </div>
        </el-card>
      </div>
      <div v-else-if="active === 'prep'" class="box">
        <el-card>
          <div class="title">前期数据准备（示例数据：敏感物项调优面板前500条）</div>
          <el-alert
            v-if="prepError"
            type="error"
            :title="'后端不可联通或错误'"
            show-icon
            closable
          />
          <el-empty v-else-if="prepEmpty" description="后端无数据" />
          <el-table v-else :data="prepRows" height="100%" size="small" border style="width: 100%">
            <el-table-column type="selection" width="48"></el-table-column>
            <el-table-column
              v-for="col in prepColumns"
              :key="col"
              :prop="col"
              :label="col"
              :show-overflow-tooltip="true"
            >
              <template #default="scope">
                {{
                  Array.isArray(scope.row[col])
                    ? scope.row[col].join(',')
                    : String(scope.row[col] ?? '')
                }}
              </template>
            </el-table-column>
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
          <div class="train-sim">
            <svg viewBox="0 0 800 100" preserveAspectRatio="none">
              <polyline points="20,60 220,60 420,60 620,60" class="path" />
              <circle :cx="dot.x" :cy="dot.y" r="6" class="dot" />
            </svg>
            <div class="sim-actions">
              <el-button type="primary" @click="startSim">开始模拟训练</el-button>
              <el-button @click="stopSim">停止</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import * as echarts from 'echarts'
import { getModelPressure, getModelTraining, getEtpsData } from '@/services/api'

const route = useRoute()
const active = ref('alg-current')
const syncActive = () => {
  const p = String(route.query.panelActive || '')
  if (p) active.value = p
}
syncActive()
watch(() => route.query.panelActive, syncActive)
const imgError = ref(false)
const modelingFlowSrc = import.meta.env.BASE_URL + 'assets/modeling-flow.jpg'
const dot = ref({ x: 20, y: 60 })
const points = [
  { x: 20, y: 60 },
  { x: 220, y: 60 },
  { x: 420, y: 60 },
  { x: 620, y: 60 }
]
let simTimer: number | null = null
let seg = 0
let t = 0
const startSim = () => {
  stopSim()
  seg = 0
  t = 0
  simTimer = window.setInterval(() => {
    const a = points[seg]
    const b = points[Math.min(seg + 1, points.length - 1)]
    t += 0.02
    dot.value.x = a.x + (b.x - a.x) * t
    dot.value.y = a.y + (b.y - a.y) * t
    if (t >= 1) {
      t = 0
      seg += 1
      if (seg >= points.length - 1) {
        stopSim()
      }
    }
  }, 16)
}
const stopSim = () => {
  if (simTimer) window.clearInterval(simTimer)
  simTimer = null
}
const onSelect = (index: string) => {
  active.value = index
}
const nodes = ref([
  { id: '1', position: { x: 0, y: 0 }, label: '输入' },
  { id: '2', position: { x: 180, y: 0 }, label: '特征工程' },
  { id: '3', position: { x: 360, y: 0 }, label: 'XGBoost' },
  { id: '4', position: { x: 540, y: 0 }, label: '评估' }
])
const edges = ref([
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' }
])

const algOptions = ref([
  { name: 'LightGBM', type: '梯度提升', desc: '高效、快速' },
  { name: 'RandomForest', type: '集成学习', desc: '鲁棒性强' },
  { name: 'SVM', type: '监督学习', desc: '间隔最大化' }
])

const selectedAlg = ref('LightGBM')
const optNodes = ref<any[]>([
  { id: 'o1', position: { x: 0, y: 40 }, label: '输入' },
  { id: 'o2', position: { x: 220, y: 40 }, label: '特征工程' },
  { id: 'o3', position: { x: 440, y: 40 }, label: selectedAlg.value },
  { id: 'o4', position: { x: 660, y: 40 }, label: '评估' }
])
const optEdges = ref<any[]>([
  { id: 'oe1-2', source: 'o1', target: 'o2' },
  { id: 'oe2-3', source: 'o2', target: 'o3' },
  { id: 'oe3-4', source: 'o3', target: 'o4' }
])
const onAlgChange = () => {
  optNodes.value = [
    { id: 'o1', position: { x: 0, y: 40 }, label: '输入' },
    { id: 'o2', position: { x: 220, y: 40 }, label: '特征工程' },
    { id: 'o3', position: { x: 440, y: 40 }, label: selectedAlg.value },
    { id: 'o4', position: { x: 660, y: 40 }, label: '评估' }
  ]
}

const prepRows = ref<any[]>([])
const prepColumns = computed(() => {
  const set = new Set<string>()
  for (const r of prepRows.value.slice(0, 10)) Object.keys(r || {}).forEach((k) => set.add(k))
  return Array.from(set)
})
const prepError = ref(false)
const prepEmpty = ref(false)

const stressRef = ref<HTMLDivElement | null>(null)
const trainMetricRef = ref<HTMLDivElement | null>(null)
const pressureError = ref(false)
const pressureEmpty = ref(false)
const trainingError = ref(false)
const trainingEmpty = ref(false)
const disposers: (() => void)[] = []
const renderStress = async () => {
  if (!stressRef.value) return
  const chart = echarts.init(stressRef.value)
  let qps: number[] = []
  let time: number[] = []
  try {
    const data = await getModelPressure()
    if (Array.isArray(data?.qps)) qps = data.qps
    if (Array.isArray(data?.time)) time = data.time
  } catch {
    pressureError.value = true
  }
  if (!qps.length || !time.length) {
    pressureEmpty.value = !pressureError.value
    chart.dispose()
    return
  }
  chart.setOption({
    title: { text: '算法压力测试（QPS/耗时）' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['QPS', '耗时(ms)'] },
    xAxis: { type: 'category', data: ['XGBoost', 'LightGBM', 'RF', 'SVM'] },
    yAxis: { type: 'value' },
    series: [
      { name: 'QPS', type: 'bar', data: qps, itemStyle: { color: '#3b82f6' } },
      { name: '耗时(ms)', type: 'line', data: time }
    ]
  })
  const onResize = () => chart.resize()
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    chart.dispose()
  }
}
const renderTrainMetric = async () => {
  if (!trainMetricRef.value) return
  const chart = echarts.init(trainMetricRef.value)
  let auc: number[] = []
  let loss: number[] = []
  try {
    const data = await getModelTraining()
    if (Array.isArray(data?.auc)) auc = data.auc
    if (Array.isArray(data?.loss)) loss = data.loss
  } catch {
    trainingError.value = true
  }
  if (!auc.length || !loss.length) {
    trainingEmpty.value = !trainingError.value
    chart.dispose()
    return
  }
  chart.setOption({
    title: { text: '训练过程指标（AUC/损失）' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 10 }, (_, i) => `迭代${i + 1}`)
    },
    yAxis: { type: 'value' },
    series: [
      { name: 'AUC', type: 'line', data: auc },
      { name: 'Loss', type: 'line', data: loss }
    ]
  })
  const onResize = () => chart.resize()
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    chart.dispose()
  }
}
onMounted(async () => {
  try {
    const r: any = await getEtpsData({ q: '', page: 0, size: 500 })
    const list = Array.isArray(r?.rows) ? r.rows : Array.isArray(r) ? r : []
    prepRows.value = list.slice(0, 500)
    prepEmpty.value = !prepRows.value.length
  } catch {
    prepError.value = true
  }
  const d1 = await renderStress()
  if (d1) disposers.push(d1)
  const d2 = await renderTrainMetric()
  if (d2) disposers.push(d2)
})
onUnmounted(() => {
  disposers.forEach((d) => d())
})
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
.diagram {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  padding: 12px;
}
.diagram-img {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}
.diagram-img img {
  max-width: 100%;
  height: auto;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--sidebar-bg);
}
.node {
  padding: 8px 16px;
  border-radius: 10px;
  background: linear-gradient(180deg, #60a5fa, #3b82f6);
  color: #fff;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.35);
}
.arrow {
  color: #3b82f6;
  font-weight: 700;
}
.sim {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 120px;
  pointer-events: none;
}
.path {
  fill: none;
  stroke: rgba(59, 130, 246, 0.35);
  stroke-width: 3;
}
.dot {
  fill: #3b82f6;
}
.sim-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.hover-tip {
  color: #0b1e42;
  background: #e0f2fe;
  padding: 4px 8px;
  border-radius: 6px;
}
.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}
.train-sim {
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
