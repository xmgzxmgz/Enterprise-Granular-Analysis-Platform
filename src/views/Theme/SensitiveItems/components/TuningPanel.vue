<template>
  <div class="panel">
    <div class="left-mini-sidebar">
      <el-menu :default-active="active" class="mini" :unique-opened="true" @select="onSelect">
        <el-menu-item index="dualuse">两用物项</el-menu-item>
        <el-menu-item index="topic">主题视角</el-menu-item>
        <el-sub-menu index="params">
          <template #title>参数调优</template>
          <el-sub-menu index="v1"><template #title>V1</template>
            <el-menu-item index="v1-filter">数据筛选</el-menu-item>
            <el-menu-item index="v1-feature">特征选择</el-menu-item>
            <el-menu-item index="v1-class">分类值调整</el-menu-item>
            <el-menu-item index="v1-visual">可视化展示</el-menu-item>
            <el-menu-item index="v1-tag">标签配置</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="v2"><template #title>V2</template>
            <el-menu-item index="v2-filter">数据筛选</el-menu-item>
            <el-menu-item index="v2-feature">特征选择</el-menu-item>
            <el-menu-item index="v2-class">分类值调整</el-menu-item>
            <el-menu-item index="v2-visual">可视化展示</el-menu-item>
            <el-menu-item index="v2-tag">标签配置</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="v3"><template #title>V3</template>
            <el-menu-item index="v3-filter">数据筛选</el-menu-item>
            <el-menu-item index="v3-feature">特征选择</el-menu-item>
            <el-menu-item index="v3-class">分类值调整</el-menu-item>
            <el-menu-item index="v3-visual">可视化展示</el-menu-item>
            <el-menu-item index="v3-tag">标签配置</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="v4"><template #title>V4</template>
            <el-menu-item index="v4-filter">数据筛选</el-menu-item>
            <el-menu-item index="v4-feature">特征选择</el-menu-item>
            <el-menu-item index="v4-class">分类值调整</el-menu-item>
            <el-menu-item index="v4-visual">可视化展示</el-menu-item>
            <el-menu-item index="v4-tag">标签配置</el-menu-item>
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
            <el-alert v-if="distError" type="error" :title="'后端不可联通或错误'" show-icon closable />
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
          <el-button type="primary">下一步</el-button>
        </div>
      </div>

      <div v-else-if="active.endsWith('filter')" class="card">
        <div class="title">数据筛选</div>
        <div class="toolbar">
          <el-input v-model="filterKeyword" placeholder="搜索企业/字段" style="max-width: 240px" />
        </div>
        <el-table :data="filteredRows" height="420" style="width: 100%">
          <el-table-column prop="company" label="企业" sortable />
          <el-table-column prop="field" label="字段" sortable />
          <el-table-column prop="value" label="值" sortable />
          <el-table-column prop="date" label="日期" sortable />
        </el-table>
        <div class="footer">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary">下一步</el-button>
        </div>
      </div>

      <div v-else-if="active.endsWith('feature')" class="card">
        <div class="title">特征选择</div>
        <div class="feature-wrap">
          <div ref="featureRef" class="chart" />
          <div class="feature-list">
            <el-checkbox-group v-model="checkedFeatures">
              <el-checkbox v-for="f in features" :key="f.name" :label="f.name">{{ f.name }}</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div class="footer">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary">下一步</el-button>
        </div>
      </div>

      <div v-else-if="active.endsWith('class')" class="card">
        <div class="title">分类值调整</div>
        <div ref="classRef" class="chart" />
        <div class="footer">
          <el-checkbox-group v-model="checkedClasses">
            <el-checkbox label="低" />
            <el-checkbox label="中" />
            <el-checkbox label="高" />
            <el-checkbox label="极高" />
          </el-checkbox-group>
          <div class="spacer" />
          <el-button @click="reset">重置</el-button>
          <el-button type="primary">下一步</el-button>
        </div>
      </div>

      <div v-else-if="active.endsWith('visual')" class="card">
        <div class="title">可视化展示</div>
        <div class="visual-wrap">
          <div ref="radarRef" class="chart" />
          <div class="table-wrap">
            <el-table :data="companyScores" height="360">
              <el-table-column prop="name" label="企业" width="160" />
              <el-table-column prop="class" label="分类" width="120" />
              <el-table-column prop="rating" label="评级" width="120" />
              <el-table-column prop="score" label="评分" width="120" />
              <el-table-column label="操作" width="140">
                <template #default>
                  <el-button size="small">全数据浏览</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="footer">
          <el-button @click="reset">重置</el-button>
          <el-button type="primary">下一步</el-button>
        </div>
      </div>

      <div v-else class="card">
        <div class="title">标签配置</div>
        <el-table :data="tagRows" height="420">
          <el-table-column prop="name" label="企业" width="160" />
          <el-table-column prop="feature" label="特征" />
          <el-table-column prop="slice" label="切片" width="140" />
          <el-table-column prop="expert" label="专家评级" width="220">
            <template #default="scope">
              <el-select v-model="scope.row.expert" placeholder="选择或自定义" filterable allow-create default-first-option>
                <el-option label="两用物品价格指纹风险高" value="两用物品价格指纹风险高" />
                <el-option label="两用物品物流指纹风险低" value="两用物品物流指纹风险低" />
                <el-option label="两用物品属地指纹风险高" value="两用物品属地指纹风险高" />
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
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import { getTagDistribution } from '@/services/api'

const router = useRouter()
const active = ref('dualuse')
const onSelect = (key: string) => (active.value = key)

const distRef = ref<HTMLDivElement | null>(null)
const historyRef = ref<HTMLDivElement | null>(null)
const boxRef = ref<HTMLDivElement | null>(null)
const featureRef = ref<HTMLDivElement | null>(null)
const classRef = ref<HTMLDivElement | null>(null)
const radarRef = ref<HTMLDivElement | null>(null)
const topicPieRef = ref<HTMLDivElement | null>(null)
const topicTrendRef = ref<HTMLDivElement | null>(null)

const distChartType = ref<'bar' | 'line'>('bar')

const tagDist = reactive<{ name: string; value: number }[]>([])
const distError = ref(false)

const renderDist = async () => {
  if (!distRef.value) return
  const chart = echarts.init(distRef.value)
  if (!tagDist.length) {
    try { const data = await getTagDistribution(); Object.assign(tagDist, data?.rows || []) } catch { distError.value = true }
    if (!tagDist.length) return
  }
  const sorted = [...tagDist].sort((a, b) => b.value - a.value)
  const option = {
    grid: { left: 60, right: 20, top: 30, bottom: 20 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: sorted.map((i) => i.name) },
    series: [
      {
        type: distChartType.value,
        data: sorted.map((i) => i.value),
        itemStyle: { color: '#3b82f6' }
      }
    ],
    tooltip: { trigger: 'axis' }
  }
  chart.setOption(option)
  chart.on('click', (params: any) => {
    const cat = params.name
    router.push({ path: '/rating-profile/基本信息', query: { category: cat } })
  })
  const onResize = () => chart.resize()
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    chart.dispose()
  }
}

const renderHistory = () => {
  if (!historyRef.value) return
  const chart = echarts.init(historyRef.value)
  const option = {
    grid: { left: 40, right: 20, top: 30, bottom: 40 },
    xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3'] },
    yAxis: { type: 'value' },
    legend: { data: ['低', '中', '高', '极高'] },
    series: [
      { name: '低', type: 'bar', stack: 'total', data: [20, 18, 15], itemStyle: { color: '#93c5fd' } },
      { name: '中', type: 'bar', stack: 'total', data: [30, 28, 26], itemStyle: { color: '#60a5fa' } },
      { name: '高', type: 'bar', stack: 'total', data: [25, 30, 32], itemStyle: { color: '#3b82f6' } },
      { name: '极高', type: 'bar', stack: 'total', data: [25, 24, 27], itemStyle: { color: '#1d4ed8' } }
    ],
    tooltip: { trigger: 'axis' }
  }
  chart.setOption(option)
  const onResize = () => chart.resize()
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    chart.dispose()
  }
}

const renderBox = () => {
  if (!boxRef.value) return
  const chart = echarts.init(boxRef.value)
  const option = {
    tooltip: { trigger: 'item' },
    legend: { data: ['低', '中', '高', '极高'] },
    xAxis: { type: 'category', data: ['低', '中', '高', '极高'] },
    yAxis: { type: 'value' },
    series: [
      { name: '低', type: 'boxplot', data: [[20, 32, 40, 50, 62]] },
      { name: '中', type: 'boxplot', data: [[30, 40, 55, 68, 80]] },
      { name: '高', type: 'boxplot', data: [[50, 62, 75, 88, 100]] },
      { name: '极高', type: 'boxplot', data: [[70, 85, 92, 105, 120]] }
    ]
  }
  chart.setOption(option)
  const onResize = () => chart.resize()
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    chart.dispose()
  }
}

const filterKeyword = ref('')
const rows = reactive([
  { company: '企业A', field: '交易金额', value: 128.4, date: '2025-03-09' },
  { company: '企业B', field: '出口地区', value: '浙江', date: '2025-03-10' },
  { company: '企业C', field: '物流时长', value: 14, date: '2025-03-11' },
  { company: '企业D', field: '商品类别', value: '电子', date: '2025-03-12' }
])
const filteredRows = ref(rows)
watch(filterKeyword, () => {
  const k = filterKeyword.value.trim()
  filteredRows.value = rows.filter((r) => JSON.stringify(r).includes(k))
})

const features = reactive([
  { name: '交易金额', volume: 1200 },
  { name: '物流时长', volume: 980 },
  { name: '出口地区', volume: 760 },
  { name: '商品类别', volume: 540 }
])
const checkedFeatures = ref<string[]>(features.map((f) => f.name))
const renderFeature = () => {
  if (!featureRef.value) return
  const chart = echarts.init(featureRef.value)
  const option = {
    grid: { left: 80, right: 20, top: 30, bottom: 20 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: features.map((f) => f.name) },
    series: [{ type: 'bar', data: features.map((f) => f.volume), itemStyle: { color: '#3b82f6' } }]
  }
  chart.setOption(option)
  const onResize = () => chart.resize()
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    chart.dispose()
  }
}

const checkedClasses = ref(['低', '中', '高', '极高'])
const renderClass = () => {
  if (!classRef.value) return
  const chart = echarts.init(classRef.value)
  const option = {
    xAxis: { type: 'category', data: ['一月', '二月', '三月', '四月'] },
    yAxis: { type: 'value' },
    legend: { data: ['低', '中', '高', '极高'] },
    series: [
      { name: '低', type: 'line', data: [12, 18, 16, 20] },
      { name: '中', type: 'line', data: [22, 28, 26, 30] },
      { name: '高', type: 'line', data: [32, 38, 36, 40] },
      { name: '极高', type: 'line', data: [42, 48, 50, 52] }
    ]
  }
  chart.setOption(option)
  const onResize = () => chart.resize()
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    chart.dispose()
  }
}

const renderRadar = () => {
  if (!radarRef.value) return
  const chart = echarts.init(radarRef.value)
  const option = {
    radar: { indicator: [
      { name: '价格', max: 100 },
      { name: '物流', max: 100 },
      { name: '属地', max: 100 },
      { name: '合规', max: 100 },
      { name: '频率', max: 100 }
    ]},
    series: [{ type: 'radar', data: [
      { value: [78, 62, 80, 70, 66], name: '企业A' },
      { value: [65, 70, 60, 75, 72], name: '企业B' }
    ] }]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
  return () => {
    window.removeEventListener('resize', () => chart.resize())
    chart.dispose()
  }
}

const topicRows = ref([
  { tag: '价格异常', count: 28, risk: '高' },
  { tag: '物流延迟', count: 18, risk: '中' },
  { tag: '属地集中', count: 12, risk: '中' }
])
const renderTopicPie = () => {
  if (!topicPieRef.value) return
  const chart = echarts.init(topicPieRef.value)
  const option = {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie', radius: ['40%', '70%'],
        data: [
          { name: '价格异常', value: 28 },
          { name: '物流延迟', value: 18 },
          { name: '属地集中', value: 12 }
        ]
      }
    ]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
  return () => {
    window.removeEventListener('resize', () => chart.resize())
    chart.dispose()
  }
}
const renderTopicTrend = () => {
  if (!topicTrendRef.value) return
  const chart = echarts.init(topicTrendRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['价格异常', '物流延迟', '属地集中'] },
    xAxis: { type: 'category', data: ['Q1', 'Q2', 'Q3', 'Q4'] },
    yAxis: { type: 'value' },
    series: [
      { name: '价格异常', type: 'line', data: [22, 28, 26, 30] },
      { name: '物流延迟', type: 'line', data: [12, 18, 16, 20] },
      { name: '属地集中', type: 'line', data: [10, 12, 14, 12] }
    ]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
  return () => {
    window.removeEventListener('resize', () => chart.resize())
    chart.dispose()
  }
}

const companyScores = ref([
  { name: '企业A', class: '两用物项', rating: 'A级', score: 86 },
  { name: '企业B', class: '两用物项', rating: 'B级', score: 78 }
])

const tagRows = ref([
  { name: '企业A', feature: '价格指纹', slice: '北京', expert: '' },
  { name: '企业B', feature: '物流指纹', slice: '上海', expert: '' },
  { name: '企业C', feature: '属地指纹', slice: '深圳', expert: '' }
])
const finished = ref(false)
const updatedScores = ref([
  { name: '企业A', ratingDetail: '两用物品价格指纹风险高', score: 86 },
  { name: '企业B', ratingDetail: '两用物品物流指纹风险低', score: 78 }
])
const reset = () => {
  filterKeyword.value = ''
  checkedFeatures.value = features.map((f) => f.name)
  checkedClasses.value = ['低', '中', '高', '极高']
}
const finish = () => {
  finished.value = true
}

let disposers: (() => void)[] = []
const mountCharts = async () => {
  disposers.forEach((d) => d())
  disposers = []
  if (active.value === 'dualuse') {
    const d1 = await renderDist(); if (d1) disposers.push(d1)
    const d2 = renderHistory(); if (d2) disposers.push(d2)
    const d3 = renderBox(); if (d3) disposers.push(d3)
  } else if (active.value.endsWith('feature')) {
    const d = renderFeature(); if (d) disposers.push(d)
  } else if (active.value.endsWith('class')) {
    const d = renderClass(); if (d) disposers.push(d)
  } else if (active.value.endsWith('visual')) {
    const d = renderRadar(); if (d) disposers.push(d)
  } else if (active.value === 'topic') {
    const d1 = renderTopicPie(); if (d1) disposers.push(d1)
    const d2 = renderTopicTrend(); if (d2) disposers.push(d2)
  }
}

onMounted(() => {
  mountCharts()
})
watch(active, () => {
  setTimeout(mountCharts, 0)
})
watch(distChartType, () => {
  if (active.value === 'dualuse') setTimeout(mountCharts, 0)
})
onUnmounted(() => {
  disposers.forEach((d) => d())
})
</script>

<style scoped>
.panel { display: flex; }
.left-mini-sidebar { width: 240px; border-right: 1px solid var(--border-color); background: var(--main-bg); }
.mini { border-right: none; }
.chart-wrap { display: flex; align-items: center; justify-content: center; height: 240px; }
.chart { height: 100%; width: 100%; }
.right-content { flex: 1; padding: 12px; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
.card { background: var(--sidebar-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; }
.title { font-weight: 600; margin-bottom: 8px; }
.chart { height: 260px; }
.btns { display: flex; justify-content: flex-end; margin-top: 8px; }
.toolbar { margin-bottom: 8px; }
.footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.feature-wrap { display: flex; gap: 12px; }
.feature-list { width: 220px; height: 260px; overflow: auto; border: 1px dashed var(--border-color); border-radius: 8px; padding: 8px; }
.visual-wrap { display: flex; gap: 12px; }
.table-wrap { flex: 1; }
.spacer { flex: 1; }
.after { margin-top: 12px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.actions { display: flex; align-items: center; gap: 8px; }
</style>