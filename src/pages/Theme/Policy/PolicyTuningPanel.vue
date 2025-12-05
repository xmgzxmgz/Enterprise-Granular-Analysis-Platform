<template>
  <div class="panel">
    <div class="left-mini-sidebar">
      <el-menu
        :default-active="active"
        class="mini"
        :unique-opened="false"
        :default-openeds="defaultOpeneds"
        @select="onSelect"
      >
        <el-menu-item index="topic">切面视角</el-menu-item>
        <el-sub-menu index="params">
          <template #title>
            <div class="params-title">
              <span>参数调优</span>
              <el-button size="small" type="primary" plain @click="createNewVersion"
                >新建项目</el-button
              >
            </div>
          </template>
          <el-sub-menu index="v1" v-if="versions.v1.exists">
            <template #title><span class="v-title" @click="enableVersion('v1')">V1</span></template>
            <div class="version-actions">
              <el-button type="primary" plain size="small" @click="enableVersion('v1')"
                >启用</el-button
              >
              <el-button type="primary" plain size="small" @click="disableVersion('v1')"
                >禁用</el-button
              >
              <el-button type="primary" plain size="small" @click="deleteVersion('v1')"
                >删除</el-button
              >
            </div>
          </el-sub-menu>
          <el-sub-menu index="v2" v-if="versions.v2.exists">
            <template #title><span class="v-title" @click="enableVersion('v2')">V2</span></template>
            <div class="version-actions">
              <el-button type="primary" plain size="small" @click="enableVersion('v2')"
                >启用</el-button
              >
              <el-button type="primary" plain size="small" @click="disableVersion('v2')"
                >禁用</el-button
              >
              <el-button type="primary" plain size="small" @click="deleteVersion('v2')"
                >删除</el-button
              >
            </div>
          </el-sub-menu>
          <el-sub-menu index="v3" v-if="versions.v3.exists">
            <template #title><span class="v-title" @click="enableVersion('v3')">V3</span></template>
            <div class="version-actions">
              <el-button type="primary" plain size="small" @click="enableVersion('v3')"
                >启用</el-button
              >
              <el-button type="primary" plain size="small" @click="disableVersion('v3')"
                >禁用</el-button
              >
              <el-button type="primary" plain size="small" @click="deleteVersion('v3')"
                >删除</el-button
              >
            </div>
          </el-sub-menu>
          <el-sub-menu index="v4" v-if="versions.v4.exists">
            <template #title><span class="v-title" @click="enableVersion('v4')">V4</span></template>
            <div class="version-actions">
              <el-button type="primary" plain size="small" @click="enableVersion('v4')"
                >启用</el-button
              >
              <el-button type="primary" plain size="small" @click="disableVersion('v4')"
                >禁用</el-button
              >
              <el-button type="primary" plain size="small" @click="deleteVersion('v4')"
                >删除</el-button
              >
            </div>
          </el-sub-menu>
          <el-sub-menu index="v5" v-if="versions.v5.exists">
            <template #title><span class="v-title" @click="enableVersion('v5')">V5</span></template>
            <div class="version-actions">
              <el-button type="primary" plain size="small" @click="enableVersion('v5')"
                >启用</el-button
              >
              <el-button type="primary" plain size="small" @click="disableVersion('v5')"
                >禁用</el-button
              >
              <el-button type="primary" plain size="small" @click="deleteVersion('v5')"
                >删除</el-button
              >
            </div>
          </el-sub-menu>
        </el-sub-menu>
        <el-menu-item index="v1-filter">V1-数据筛选</el-menu-item>
        <el-menu-item index="v1-feature">V1-特征选择</el-menu-item>
        <el-menu-item index="v1-class">V1-分类值调整</el-menu-item>
        <el-menu-item index="v1-tag">V1-标签配置</el-menu-item>
        <el-menu-item index="v1-visual">V1-可视化展示</el-menu-item>
      </el-menu>
    </div>
    <div class="right-content" ref="rightContentRef">
      <div v-if="active === 'topic'" class="card">
        <div class="title">政策推送切面视角</div>
        <div class="visual-wrap">
          <div class="chart-box"><div ref="abcPieRef" class="chart" /></div>
          <div class="chart-box"><div ref="radarRef" class="chart" /></div>
        </div>
      </div>

      <div
        v-else-if="active.endsWith('filter')"
        class="card filter-card"
        :style="{ width: toolbarWidth + frameOffset + 'px' }"
        ref="filterCardRef"
      >
        <div class="title">数据筛选</div>
        <div class="toolbar toolbar-row">
          <div class="steps-fixed">
            <el-steps :active="stepIndex" align-center finish-status="success" class="steps">
              <el-step title="数据筛选" @click="goStep(0)" />
              <el-step title="特征选择" @click="goStep(1)" />
              <el-step title="分类值调整" @click="goStep(2)" />
              <el-step title="标签配置" @click="goStep(3)" />
              <el-step title="可视化展示" @click="goStep(4)" />
            </el-steps>
          </div>
          <div class="tools-fixed">
            <el-input
              v-model="filterKeyword"
              placeholder="搜索企业/字段"
              size="small"
              clearable
              style="width: 360px"
            />
            <el-button size="small" type="primary" @click="openFieldFilter">字段筛选</el-button>
          </div>
        </div>
        <div class="table-scroll" style="height: 100%">
          <el-table
            :data="tableRows"
            height="100%"
            size="small"
            border
            style="width: 100%"
            @row-click="toBasic"
            @selection-change="onSelectionChange"
          >
            <el-table-column type="selection" width="48"></el-table-column>
            <el-table-column
              v-for="col in visibleColumns"
              :key="col.key"
              :prop="col.key"
              :label="col.label"
              :width="colWidth(col.key)"
              :show-overflow-tooltip="true"
              :class-name="columnClass(col.key)"
              :label-class-name="columnClass(col.key)"
              sortable
            >
              <template #header>
                <div class="col-header">
                  <span>{{ col.label }}</span>
                  <el-icon class="filter-icon" @click.stop="openColFilter(col.key)">
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 2h12v2c0 2.5-3 4.5-6 5.5C9 8.5 6 6.5 6 4V2zm0 20v-2c0-2.5 3-4.5 6-5.5 3 1 6 3 6 5.5v2H6zm6-9c-2.7-.9-5-2.4-6-4.4V9c0 2.2 2.6 3.9 6 4.9 3.4-1 6-2.7 6-4.9V8.6c-1 2-3.3 3.5-6 4.4z"
                      />
                    </svg>
                  </el-icon>
                </div>
              </template>
              <template #default="scope">
                <div class="cell-clamp">
                  {{
                    Array.isArray(scope.row[col.key])
                      ? scope.row[col.key].join(',')
                      : String(scope.row[col.key] ?? '')
                  }}
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrap">
            <el-pagination
              :current-page="uiPage"
              :page-size="size"
              :total="totalFiltered"
              layout="prev, pager, next, total"
              @current-change="onUiPageChange"
            />
          </div>
        </div>
        <el-dialog
          v-model="columnFilterDialogVisible"
          :title="colDialogTitle"
          :width="colDialogWidth + 'px'"
          align-center
        >
          <el-input
            v-model="colDialogSearch"
            placeholder="搜索元素"
            size="small"
            clearable
            style="margin-bottom: 8px; width: 100%"
          />
          <div
            class="field-grid col-grid"
            :style="{
              gridTemplateColumns: 'repeat(' + colDialogCols + ', 1fr)',
              maxHeight: colDialogMaxHeight + 'px'
            }"
          >
            <el-checkbox-group v-model="colCheckedValues[colDialogKey]">
              <el-checkbox
                v-for="opt in colDialogOptionsSorted"
                :key="opt.value"
                :label="opt.value"
                >{{ opt.label }}</el-checkbox
              >
            </el-checkbox-group>
          </div>
          <template #footer>
            <div class="field-actions">
              <el-button @click="resetColFilter(colDialogKey)">重置</el-button>
              <el-button @click="selectAllColFilter(colDialogKey)">全选</el-button>
              <el-button @click="invertColFilter(colDialogKey)">反选</el-button>
              <el-button type="primary" @click="confirmColFilter(colDialogKey)">确认</el-button>
            </div>
          </template>
        </el-dialog>
        <el-dialog v-model="fieldFilterVisible" title="字段筛选" width="560px" align-center>
          <div class="field-grid">
            <el-checkbox-group v-model="checkedColumns">
              <el-checkbox v-for="c in allColumns" :key="c.key" :label="c.key">{{
                c.label
              }}</el-checkbox>
            </el-checkbox-group>
          </div>
          <template #footer>
            <div class="field-actions">
              <el-button @click="resetColumns">重置</el-button>
              <el-button @click="selectAllColumns">全选</el-button>
              <el-button @click="invertColumns">反选</el-button>
              <el-button type="primary" @click="fieldFilterVisible = false">确认</el-button>
            </div>
          </template>
        </el-dialog>
        <div class="footer footer-fixed floating-footer" :style="footerFixedStyle">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <div
        v-else-if="active.endsWith('feature')"
        class="card feature-card"
        :style="{ width: toolbarWidth + frameOffset + 'px' }"
      >
        <div class="title">特征选择</div>
        <div class="toolbar">
          <el-steps :active="stepIndex" align-center finish-status="success" class="steps">
            <el-step title="数据筛选" @click="goStep(0)" />
            <el-step title="特征选择" @click="goStep(1)" />
            <el-step title="分类值调整" @click="goStep(2)" />
            <el-step title="标签配置" @click="goStep(3)" />
            <el-step title="可视化展示" @click="goStep(4)" />
          </el-steps>
        </div>
        <div class="feature-wrap">
          <div class="importance-chart">
            <iframe src="/SHAP_Feature_Importance_Top_20.html" class="chart" />
          </div>
          <div class="feature-list">
            <el-checkbox-group v-model="checkedFeatures">
              <div v-for="f in featuresSorted" :key="f" class="feature-item">
                <el-checkbox :label="f" />
                <span class="fname-btn" @click="openFeature(f)">{{ f }}</span>
              </div>
            </el-checkbox-group>
          </div>
        </div>
        <div class="feature-detail">
          <div ref="featureRef" class="chart" />
          <div class="detail-values">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="左值">{{ curStats.low }}</el-descriptions-item>
              <el-descriptions-item label="中值">{{ curStats.mid }}</el-descriptions-item>
              <el-descriptions-item label="右值">{{ curStats.high }}</el-descriptions-item>
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
        <div class="footer footer-fixed floating-footer" :style="footerFixedStyle">
          <el-button @click="reset">重置</el-button>
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <div
        v-else-if="active.endsWith('class')"
        class="card class-card"
        :style="{ width: toolbarWidth + frameOffset + 'px' }"
      >
        <div class="title">分类值调整</div>
        <div class="toolbar">
          <el-steps :active="stepIndex" align-center finish-status="success" class="steps">
            <el-step title="数据筛选" @click="goStep(0)" />
            <el-step title="特征选择" @click="goStep(1)" />
            <el-step title="分类值调整" @click="goStep(2)" />
            <el-step title="标签配置" @click="goStep(3)" />
            <el-step title="可视化展示" @click="goStep(4)" />
          </el-steps>
        </div>
        <div ref="classRef" class="chart" />
        <div class="k-select-row">
          <el-radio-group v-model="checkedKSingle" class="k-checkboxes">
            <el-radio v-for="k in kOptions" :key="'rad-' + k" :label="k" />
          </el-radio-group>
          <div class="btns">
            <el-button @click="prevStep">上一步</el-button>
            <el-button type="primary" @click="nextStep">下一步</el-button>
          </div>
        </div>
      </div>

      <div
        v-else-if="active.endsWith('visual')"
        class="card visual-card"
        :style="{ width: toolbarWidth + frameOffset + 'px' }"
      >
        <div class="title">可视化展示</div>
        <div class="toolbar">
          <el-steps :active="stepIndex" align-center finish-status="success" class="steps">
            <el-step title="数据筛选" @click="goStep(0)" />
            <el-step title="特征选择" @click="goStep(1)" />
            <el-step title="分类值调整" @click="goStep(2)" />
            <el-step title="标签配置" @click="goStep(3)" />
            <el-step title="可视化展示" @click="goStep(4)" />
          </el-steps>
        </div>
        <div class="visual-wrap">
          <div class="chart-box"><div ref="abcPieRef" class="chart" /></div>
          <div class="chart-box">
            <div class="table-wrap">
              <el-table :data="companyScores" class="company-table" height="420" border stripe>
                <el-table-column prop="category" label="类别" width="160" />
                <el-table-column prop="class" label="分类" width="120" />
                <el-table-column prop="rating" label="评级" width="120" />
                <el-table-column prop="score" label="评分" width="120" />
                <el-table-column label="操作" width="140">
                  <template #default="{ row }">
                    <el-button size="small" @click="browseAll(row.category)">全数据浏览</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
        <div class="visual-bottom">
          <div class="chart-box"><div class="chart" ref="radarRef" /></div>
          <div class="chart-box">
            <div class="box-toolbar">
              <el-select
                v-model="boxMetric"
                placeholder="选择指标"
                size="small"
                style="width: 200px"
              >
                <el-option v-for="f in featuresSorted" :key="f" :label="f" :value="f" />
              </el-select>
            </div>
            <div ref="visualBoxRef" class="chart" />
          </div>
        </div>
        <div class="footer footer-fixed floating-footer" :style="footerFixedStyle">
          <el-button @click="reset">重置</el-button>
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <div v-else class="card tag-card" :style="{ width: toolbarWidth + frameOffset + 'px' }">
        <div class="title">标签配置</div>
        <div class="toolbar">
          <el-steps :active="stepIndex" align-center finish-status="success" class="steps">
            <el-step title="数据筛选" @click="goStep(0)" />
            <el-step title="特征选择" @click="goStep(1)" />
            <el-step title="分类值调整" @click="goStep(2)" />
            <el-step title="标签配置" @click="goStep(3)" />
            <el-step title="可视化展示" @click="goStep(4)" />
          </el-steps>
        </div>
        <div class="tag-layout">
          <div class="shap-compare">
            <div class="shap-placeholder">预留：SHAP 对比图（上）</div>
            <div class="shap-placeholder">预留：SHAP 对比图（下）</div>
          </div>
          <div class="tag-assign">
            <div class="title">企业标签打标</div>
            <el-table :data="companyScores" height="420">
              <el-table-column prop="category" label="类别" width="120" />
              <el-table-column prop="class" label="分类" width="120" />
              <el-table-column prop="rating" label="评级" width="120" />
              <el-table-column prop="score" label="评分" width="100" />
              <el-table-column label="标签">
                <template #default="scope">
                  <el-select
                    v-model="tagAssignments[scope.row.category]"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="选择或自定义标签"
                    style="width: 100%"
                  >
                    <el-option v-for="t in tagOptions" :key="t" :label="t" :value="t" />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="footer footer-fixed floating-footer" :style="footerFixedStyle">
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
          <div class="footer footer-fixed floating-footer" :style="footerFixedStyle">
            <el-button>取消</el-button>
            <el-button type="primary">详细结果浏览</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import { getTagDistribution, getPolicies } from '@/services/api'
import { ElMessage } from 'element-plus'

const router = useRouter()
const active = ref('topic')
const defaultOpeneds = ref(['params', 'v1', 'v2', 'v3', 'v4', 'v5'])
const onSelect = (key: string) => (active.value = key)
const steps = ref<string[]>([])
const stepIndex = ref(0)
const versionOf = (k: string) => (k.includes('-') ? k.split('-')[0] : k)
const setVersionSteps = (v: string) => {
  steps.value = ['filter', 'feature', 'class', 'tag', 'visual'].map((t) => `${v}-${t}`)
}
const goStep = (i: number) => {
  stepIndex.value = i
  active.value = steps.value[i]
}

const versions = reactive<Record<string, { exists: boolean; enabled: boolean }>>({
  v1: { exists: true, enabled: false },
  v2: { exists: true, enabled: false },
  v3: { exists: true, enabled: false },
  v4: { exists: true, enabled: false },
  v5: { exists: true, enabled: false }
})
const enableVersion = (v: string) => {
  Object.keys(versions).forEach((k) => (versions[k].enabled = k === v))
  setVersionSteps(v)
  goStep(0)
}
const disableVersion = (v: string) => {
  versions[v].enabled = false
}
const deleteVersion = (v: string) => {
  versions[v].exists = false
}
const createNewVersion = () => {
  const idx = Object.keys(versions).length + 1
  const key = `v${idx}`
  ;(versions as any)[key] = { exists: true, enabled: false }
}

type Row = Record<string, any>
const rows: Row[] = []
const filteredRows = ref<Row[]>([])
const filterKeyword = ref('')
const uiPage = ref(1)
const size = ref(20)
const tableRows = computed(() => {
  const start = (uiPage.value - 1) * size.value
  return filteredRows.value.slice(start, start + size.value)
})
const totalFiltered = computed(() => filteredRows.value.length)
const onUiPageChange = (p: number) => (uiPage.value = p)

const baseColumns = [
  { key: 'id', label: 'ID' },
  { key: 'etps_name', label: '企业名称' },
  { key: 'industry_phy_name', label: '行业门类' },
  { key: 'industry_code_name', label: '行业细分' },
  { key: 'area_id', label: '区域代码' },
  { key: 'exist_status', label: '经营状态' },
  { key: 'common_busi', label: '常见业务' },
  { key: 'import_ratio', label: '进口占比' },
  { key: 'main_ciq_codes', label: '主要检验检疫代码' },
  { key: 'main_parent_ciq', label: '主要上级检验检疫' },
  { key: 'top_trade_countries', label: '主要贸易国家' },
  { key: 'transport_mode', label: '运输方式' },
  { key: 'total_decl_amt', label: '申报总金额' },
  { key: 'total_entry_cnt', label: '入境次数' },
  { key: 'avg_ticket_val', label: '平均票值' },
  { key: 'aeo_rating', label: 'AEO等级' },
  { key: 'delay_rate', label: '延误率' }
]
const preferredOrder = baseColumns.map((c) => c.key)
const allColumns = computed(() => {
  const keys = new Set(baseColumns.map((c) => c.key))
  for (const r of filteredRows.value) Object.keys(r).forEach((k) => keys.add(k))
  return Array.from(keys).map((k) => ({
    key: k,
    label: baseColumns.find((b) => b.key === k)?.label || k
  }))
})
const hasDataKey = (key: string) =>
  filteredRows.value.some((r) => {
    const v = (r as any)[key]
    return v !== undefined && v !== null && String(v).length > 0
  })
const checkedColumns = ref<string[]>([])
const orderKeys = (keys: string[]) => {
  const set = new Set(keys)
  const head = preferredOrder.filter((k) => set.has(k))
  const tail = keys.filter((k) => !head.includes(k)).sort()
  return [...head, ...tail]
}
const visibleColumns = computed(() => {
  const pool = allColumns.value.filter((c) => checkedColumns.value.includes(c.key))
  const order = new Map(orderKeys(pool.map((c) => c.key)).map((k, i) => [k, i]))
  return [...pool].sort((a, b) => order.get(a.key)! - order.get(b.key)!)
})
const colWidth = (key: string) => {
  const getLen = (v: any) => {
    if (v === null || v === undefined) return 0
    const s = Array.isArray(v) ? v.join(',') : String(v)
    return s.length
  }
  let maxLen = getLen(baseColumns.find((b) => b.key === key)?.label || key)
  for (const r of filteredRows.value) maxLen = Math.max(maxLen, getLen((r as any)[key]))
  const charW = 10
  const units = Math.max(5, Math.min(Math.ceil(maxLen) + 2, 26))
  return units * charW
}
const fieldFilterVisible = ref(false)
const openFieldFilter = () => (fieldFilterVisible.value = true)
const resetColumns = () =>
  (checkedColumns.value = orderKeys(baseColumns.map((c) => c.key).filter((k) => hasDataKey(k))))
const selectAllColumns = () =>
  (checkedColumns.value = orderKeys(allColumns.value.map((c) => c.key)))
const invertColumns = () => {
  const set = new Set(checkedColumns.value)
  checkedColumns.value = orderKeys(allColumns.value.map((c) => c.key).filter((k) => !set.has(k)))
}

const colDialogKey = ref('')
const colDialogTitle = computed(
  () => allColumns.value.find((c) => c.key === colDialogKey.value)?.label || ''
)
const colDialogSearch = ref('')
const colDialogWidth = 720
const colDialogCols = 4
const colDialogMaxHeight = 360
const columnFilterDialogVisible = ref(false)
const colCheckedValues = reactive<Record<string, string[]>>({})
const columnFilterVisible = ref(false)
const openColFilter = (key: string) => {
  colDialogKey.value = key
  columnFilterDialogVisible.value = true
}
const colDialogOptions = computed(() => {
  const set = new Set<string>()
  for (const r of filteredRows.value) {
    const v = (r as any)[colDialogKey.value]
    if (Array.isArray(v)) v.forEach((x) => set.add(String(x ?? '')))
    else set.add(String(v ?? ''))
  }
  return Array.from(set).map((s) => ({ label: s, value: s }))
})
const colDialogOptionsSorted = computed(() =>
  colDialogOptions.value.filter((o) => o.label.includes(colDialogSearch.value))
)
const resetColFilter = (key: string) => (colCheckedValues[key] = [])
const selectAllColFilter = (key: string) =>
  (colCheckedValues[key] = colDialogOptions.value.map((o) => o.value))
const invertColFilter = (key: string) => {
  const set = new Set(colCheckedValues[key] || [])
  colCheckedValues[key] = colDialogOptions.value.map((o) => o.value).filter((v) => !set.has(v))
}
const confirmColFilter = (key: string) => {
  columnFilterDialogVisible.value = false
  applyFilters()
}
const columnFilterDialogVisibleRef = columnFilterDialogVisible
const columnClass = (key: string) => {
  const hasSelection = (colCheckedValues[key] || []).length > 0
  const dialogActive = columnFilterDialogVisibleRef.value && colDialogKey.value === key
  return hasSelection || dialogActive ? 'col-active-filter' : ''
}

const selectedEnterprises = ref<string[]>([])
const toBasic = (row: any) => {
  router.push({ name: '企业基本信息', query: { name: String(row.etps_name || row.name || '') } })
}
const onSelectionChange = (rowsSel: any[]) => {
  const names = rowsSel.map((r) => String(r.etps_name || r.name || '')).filter((s) => !!s)
  selectedEnterprises.value = Array.from(new Set(names))
}

const featureRef = ref<HTMLDivElement | null>(null)
const kOptions = [2, 3, 4, 5]
const checkedKSingle = ref(2)
const classRef = ref<HTMLDivElement | null>(null)
const distRef = ref<HTMLDivElement | null>(null)
const radarRef = ref<HTMLDivElement | null>(null)
const visualBoxRef = ref<HTMLDivElement | null>(null)
const abcPieRef = ref<HTMLDivElement | null>(null)

const checkedFeatures = ref<string[]>([])
const featuresSorted = computed(() => orderKeys(allColumns.value.map((c) => c.key)))
const curFeature = ref('')
const openFeature = (f: string) => {
  curFeature.value = f
}
const curRange = ref<[number, number]>([0, 100])
const curStats = ref({ min: 0, max: 100, low: 20, mid: 50, high: 80 })
const onRangeChange = () => {}

const companyScores = ref([
  { category: 'A类', class: '政策推送', rating: 'A级', score: 88 },
  { category: 'B类', class: '政策推送', rating: 'B级', score: 80 },
  { category: 'C类', class: '政策推送', rating: 'C级', score: 74 }
])
const tagOptions = ['价格指纹风险高', '物流指纹风险低', '属地指纹风险高']
const tagAssignments = reactive<Record<string, string[]>>({})
const finished = ref(false)
const updatedScores = ref<any[]>([])
const reset = () => {
  filterKeyword.value = ''
  checkedFeatures.value = [...featuresSorted.value]
  checkedKSingle.value = 2
}
const finish = () => {
  if (!filteredRows.value.length) {
    ElMessage.error('后端无数据或未联通')
    return
  }
  updatedScores.value = filteredRows.value.slice(0, 10).map((r: any, i: number) => ({
    name: r.etps_name || r.name || `企业-${i + 1}`,
    ratingDetail: '数据来源：后端',
    score: Number((80 + Math.random() * 10).toFixed(0))
  }))
  finished.value = true
}

let disposers: (() => void)[] = []
const mountCharts = async () => {
  disposers.forEach((d) => d())
  disposers = []
  if (active.value === 'topic') {
    const p = renderABCPie()
    if (p) disposers.push(p)
    const r = renderRadar()
    if (r) disposers.push(r)
    const b = renderVisualBox()
    if (b) disposers.push(b)
  } else if (active.value.endsWith('feature')) {
    const d = renderFeatureCounts()
    if (d) disposers.push(d)
  } else if (active.value.endsWith('class')) {
    const d = renderClass()
    if (d) disposers.push(d)
  } else if (active.value.endsWith('visual')) {
    const p = renderABCPie()
    if (p) disposers.push(p)
    const r = renderRadar()
    if (r) disposers.push(r)
    const b = renderVisualBox()
    if (b) disposers.push(b)
  }
}

const renderFeatureCounts = () => {
  if (!featureRef.value) return
  const chart = echarts.init(featureRef.value)
  const cats = featuresSorted.value
  const data = cats.map(
    (k) => filteredRows.value.filter((r) => String((r as any)[k] ?? '').length > 0).length
  )
  const option = {
    title: { text: '选中字段的唯一值数量分布', left: 'center' },
    grid: { left: 100, right: 20, top: 40, bottom: 40 },
    xAxis: { type: 'category', data: cats },
    yAxis: { type: 'value', name: '数量' },
    series: [{ type: 'bar', data, itemStyle: { color: '#3b82f6' } }],
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
const renderClass = () => {
  if (!classRef.value) return
  const chart = echarts.init(classRef.value)
  const option = {
    title: { text: '分类数选择' },
    xAxis: { type: 'category', data: ['K=2', 'K=3', 'K=4', 'K=5'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [2, 3, 4, 5], itemStyle: { color: '#3b82f6' } }]
  }
  chart.setOption(option)
  const onResize = () => chart.resize()
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    chart.dispose()
  }
}
const renderABCPie = () => {
  if (!abcPieRef.value) return
  const chart = echarts.init(abcPieRef.value)
  const dist = { A: 40, B: 35, C: 25 }
  const total = dist.A + dist.B + dist.C
  const data = [
    { name: 'A类', value: dist.A },
    { name: 'B类', value: dist.B },
    { name: 'C类', value: dist.C }
  ]
  const option = {
    title: { text: 'ABC类别占比（饼图）', left: 'center' },
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.name}: ${p.value} (${Math.round((p.value / total) * 100)}%)`
    },
    series: [{ type: 'pie', radius: ['40%', '70%'], data }]
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
    tooltip: {},
    radar: { indicator: featuresSorted.value.slice(0, 6).map((f) => ({ name: f, max: 100 })) },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: featuresSorted.value.slice(0, 6).map(() => Math.round(50 + Math.random() * 50)),
            name: '示例'
          }
        ]
      }
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
const boxMetric = ref('')
const renderVisualBox = () => {
  if (!visualBoxRef.value) return
  const chart = echarts.init(visualBoxRef.value)
  const cats = Array.from({ length: 10 }, (_, i) => `样本${i + 1}`)
  const option = {
    title: { text: '箱线图（示例）' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: cats },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'boxplot',
        data: cats.map(() => [
          Math.random() * 10,
          Math.random() * 30,
          Math.random() * 50,
          Math.random() * 70,
          Math.random() * 90
        ])
      }
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

const rightContentRef = ref<HTMLDivElement | null>(null)
const toolbarWidth = ref<number>(0)
const frameOffset = ref<number>(-12)
const filterCardRef = ref<HTMLDivElement | null>(null)
const footerFixedStyle = ref<Record<string, string>>({})
const updateToolbarWidth = () => {
  const w = rightContentRef.value?.clientWidth ?? 0
  toolbarWidth.value = w > 0 ? w : 0
}
const updateFloatingFooter = () => {
  const rect = filterCardRef.value?.getBoundingClientRect()
  const left = rect?.left ?? rightContentRef.value?.getBoundingClientRect()?.left ?? 0
  const width = toolbarWidth.value + frameOffset.value
  footerFixedStyle.value = {
    left: `${Math.max(0, Math.round(left))}px`,
    width: `${Math.max(0, Math.round(width))}px`
  }
}

const applyFilters = () => {
  let data = [...rows]
  Object.entries(colCheckedValues).forEach(([k, vals]) => {
    const set = new Set(vals || [])
    if (set.size) data = data.filter((r) => set.has(String((r as any)[k] ?? '')))
  })
  const kw = filterKeyword.value.trim()
  if (kw) {
    const lower = kw.toLowerCase()
    data = data.filter((r) => {
      return checkedColumns.value.some((k) =>
        String((r as any)[k] ?? '')
          .toLowerCase()
          .includes(lower)
      )
    })
  }
  filteredRows.value = data
  uiPage.value = 1
}

const loadPolicies = async () => {
  try {
    const list = await getPolicies()
    rows.splice(0, rows.length, ...list)
    filteredRows.value = rows
    resetColumns()
    checkedFeatures.value = [...featuresSorted.value]
    const names = Array.from(
      new Set(rows.map((r: any) => String(r.etps_name || r.name || '')).filter((s) => !!s))
    )
    selectedEnterprises.value = names
  } catch {
    filteredRows.value = []
    ElMessage.error('后端无数据或未联通')
  }
}

const nextStep = () => {
  if (stepIndex.value === 0) {
    const snap = Object.fromEntries(
      Object.entries(colCheckedValues)
        .filter(([, v]) => (v || []).length)
        .map(([k, v]) => [k, [...(v || [])]])
    )
    if (!selectedEnterprises.value.length) {
      const names = Array.from(
        new Set(
          filteredRows.value.map((r: any) => String(r.etps_name || r.name || '')).filter((s) => !!s)
        )
      )
      selectedEnterprises.value = names
    }
  }
  if (stepIndex.value < steps.value.length - 1) goStep(stepIndex.value + 1)
}
const prevStep = () => {
  if (stepIndex.value > 0) goStep(stepIndex.value - 1)
}
const browseAll = (category: string) => {
  router.push({ name: '企业基本信息', query: { category } })
}

onMounted(async () => {
  await loadPolicies()
  boxMetric.value = featuresSorted.value[0] || ''
  mountCharts()
  updateToolbarWidth()
  updateFloatingFooter()
  const onResize = () => {
    updateToolbarWidth()
    updateFloatingFooter()
  }
  const onScroll = () => updateFloatingFooter()
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onScroll, { passive: true })
  ;(window as any)._policyResize = onResize
  ;(window as any)._policyScroll = onScroll
})
watch(active, () => {
  if (active.value.includes('-')) setVersionSteps(versionOf(active.value))
  setTimeout(mountCharts, 0)
})
watch(checkedKSingle, () => {
  if (active.value.endsWith('class')) setTimeout(mountCharts, 0)
})
watch(checkedFeatures, () => {
  if (active.value.endsWith('feature')) setTimeout(mountCharts, 0)
})
watch(boxMetric, () => {
  if (active.value.endsWith('visual') || active.value === 'topic') setTimeout(mountCharts, 0)
})
onUnmounted(() => {
  disposers.forEach((d) => d())
  const r = (window as any)._policyResize
  const s = (window as any)._policyScroll
  if (r) window.removeEventListener('resize', r)
  if (s) window.removeEventListener('scroll', s as any)
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
  min-height: calc(100vh - 96px);
  max-width: 100%;
  overflow-x: hidden;
}
.filter-card {
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  min-height: calc(100vh - 96px - 24px);
}
.card {
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
}
.title {
  font-weight: 600;
  margin-bottom: 8px;
}
.toolbar {
  margin-bottom: 8px;
}
.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--main-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
}
.steps {
  width: 720px;
  max-width: 100%;
}
.steps-fixed {
  flex: 0 0 auto;
}
.tools-fixed {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}
.table-scroll {
  height: 100%;
}
.table-wrap :deep(.el-table__header th.col-active-filter) {
  background: rgba(147, 197, 253, 0.35) !important;
}
.table-wrap :deep(.el-table__body td.col-active-filter) {
  background: rgba(147, 197, 253, 0.15);
}
.field-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  max-height: 320px;
  overflow: auto;
}
.col-grid {
  align-items: start;
}
.col-header {
  display: flex;
  align-items: center;
  gap: 6px;
}
.filter-icon {
  cursor: pointer;
}
.cell-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
}
.visual-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.chart-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 240px;
}
.chart {
  height: 100%;
  width: 100%;
}
.visual-bottom .chart {
  height: 420px;
}
.tag-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}
.shap-compare {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 12px;
}
.shap-placeholder {
  background: var(--sidebar-bg);
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}
.tag-assign {
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
}
.btns {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
.footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.footer-fixed {
  background: var(--main-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
}
.floating-footer {
  position: fixed;
  bottom: 12px;
  z-index: 1000;
}
</style>
