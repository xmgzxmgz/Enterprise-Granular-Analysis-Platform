<template>
  <div class="panel">
    <div class="right-content" ref="rightContentRef">
      <div class="card filter-card" :style="{ width: '100%' }" ref="filterCardRef">
        <div class="title">数据筛选</div>
        <div class="tools-fixed">
          <el-input
            v-model="filterKeyword"
            placeholder="搜索企业/字段"
            size="small"
            clearable
            style="width: 360px"
          />
          <el-button size="small" type="primary" @click="openFieldFilter">字段筛选</el-button>
          <el-button size="small" type="success" :loading="loadingAll" @click="fetchAllData"
            >获取全部数据</el-button
          >
        </div>
        <div class="table-scroll">
          <el-table
            :data="tableRows"
            :height="tableHeight"
            size="small"
            border
            :style="{ minWidth: tableMinWidth + 'px' }"
            scrollbar-always-on
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
                  <div class="col-top">{{ col.label }}</div>
                  <div class="col-actions">
                    <button
                      class="col-btn"
                      :class="sortBtnClass(col.key)"
                      title="排序"
                      @click.stop="toggleSort(col.key)"
                    >
                      排
                    </button>
                    <button
                      class="col-btn"
                      :class="filterBtnClass(col.key)"
                      title="筛选"
                      @click.stop="openColFilter(col.key)"
                    >
                      筛
                    </button>
                  </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getPolicies } from '@/services/api'

const router = useRouter()

/**
 * 步骤索引与跳转（保留与原页面一致的外观，不改变内容）
 * @param i 步骤索引
 */
const stepIndex = ref(0)
const goStep = (i: number) => {
  stepIndex.value = i
}

/**
 * 页面宽度控制
 * @returns void
 */
const rightContentRef = ref<HTMLDivElement | null>(null)
const filterCardRef = ref<HTMLDivElement | null>(null)
const toolbarWidth = ref<number>(0)
const frameOffset = ref<number>(-12)
const updateToolbarWidth = () => {
  const w = rightContentRef.value?.clientWidth ?? 0
  toolbarWidth.value = w > 0 ? w : 0
}

/**
 * 行与列类型定义
 */
type Row = Record<string, any>
type ColumnDef = { key: string; label: string }

/**
 * 列表状态与分页
 */
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
const tableHeight = ref(560)
const calcTableDims = () => {
  const h = window.innerHeight || 800
  tableHeight.value = Math.max(360, Math.floor(h - 220))
}

/**
 * 列定义与中文标签映射
 */
const baseColumns: ColumnDef[] = [
  { key: 'etps_name', label: '企业名称' },
  { key: 'industry_phy_name', label: '行业门类' },
  { key: 'industry_code_name', label: '行业细类' },
  { key: 'area_id', label: '地区代码' },
  { key: 'exist_status', label: '存续状态' },
  { key: 'common_busi', label: '经营范围' },
  { key: 'import_ratio', label: '进口占比' },
  { key: 'main_ciq_codes', label: '主要检验检疫代码' },
  { key: 'main_parent_ciq', label: '主要检验检疫品类' },
  { key: 'top_trade_countries', label: '主要贸易国' },
  { key: 'transport_mode', label: '运输方式' },
  { key: 'total_decl_amt', label: '申报总金额' },
  { key: 'total_entry_cnt', label: '申报总票数' },
  { key: 'avg_ticket_val', label: '平均票值' },
  { key: 'aeo_rating', label: 'AEO评级' },
  { key: 'delay_rate', label: '延迟率' }
]
const toZhLabel = (key: string): string => {
  const dict: Record<string, string> = Object.fromEntries(baseColumns.map((c) => [c.key, c.label]))
  const extra: Record<string, string> = {
    etps_name: '企业名称',
    industry_phy_name: '行业门类',
    industry_code_name: '行业细类',
    area_id: '地区代码',
    exist_status: '存续状态',
    common_busi: '经营范围',
    import_ratio: '进口占比',
    main_ciq_codes: '主要检验检疫代码',
    main_parent_ciq: '主要检验检疫品类',
    top_trade_countries: '主要贸易国',
    transport_mode: '运输方式',
    total_decl_amt: '申报总金额',
    total_entry_cnt: '申报总票数',
    avg_ticket_val: '平均票值',
    aeo_rating: 'AEO评级',
    delay_rate: '延迟率'
  }
  return dict[key] || extra[key] || key
}
const allColumns = computed<ColumnDef[]>(() => {
  const keys = new Set(baseColumns.map((c) => c.key))
  for (const r of filteredRows.value) Object.keys(r).forEach((k) => keys.add(k))
  return Array.from(keys).map((k) => ({
    key: k,
    label: baseColumns.find((b) => b.key === k)?.label || toZhLabel(k)
  }))
})
const hasDataKey = (key: string) =>
  filteredRows.value.some((r) => {
    const v = (r as any)[key]
    return v !== undefined && v !== null && String(v).length > 0
  })
const checkedColumns = ref<string[]>([])
const orderKeys = (keys: string[]) => {
  const head = baseColumns.map((c) => c.key).filter((k) => keys.includes(k))
  const tail = keys.filter((k) => !head.includes(k)).sort()
  return [...head, ...tail]
}
const visibleColumns = computed(() => {
  const pool = allColumns.value.filter((c) => checkedColumns.value.includes(c.key))
  const order = new Map(orderKeys(pool.map((c) => c.key)).map((k, i) => [k, i]))
  return [...pool].sort((a, b) => (order.get(a.key) || 0) - (order.get(b.key) || 0))
})
const tableMinWidth = computed(() => {
  const sel = 56
  const sum = visibleColumns.value.reduce((acc, c) => acc + colWidth(c.key), 0)
  return sel + sum + 24
})
const colWidth = (key: string) => {
  const preset: Record<string, number> = {
    etps_name: 200,
    industry_phy_name: 140,
    industry_code_name: 160,
    area_id: 120,
    exist_status: 120,
    common_busi: 340,
    import_ratio: 120,
    main_ciq_codes: 220,
    main_parent_ciq: 240,
    top_trade_countries: 180,
    transport_mode: 120,
    total_decl_amt: 160,
    total_entry_cnt: 120,
    avg_ticket_val: 160,
    aeo_rating: 100,
    delay_rate: 100
  }
  if (preset[key]) return preset[key]
  const getLen = (v: any) => {
    if (v === null || v === undefined) return 0
    const s = Array.isArray(v) ? v.join(',') : String(v)
    return s.length
  }
  let maxLen = getLen(baseColumns.find((b) => b.key === key)?.label || key)
  for (const r of filteredRows.value) maxLen = Math.max(maxLen, getLen((r as any)[key]))
  const px = Math.max(120, Math.min(Math.ceil(maxLen * 12) + 24, 380))
  return px
}

/**
 * 字段筛选对话框
 */
const fieldFilterVisible = ref(false)
const openFieldFilter = () => (fieldFilterVisible.value = true)
const resetColumns = () =>
  (checkedColumns.value = orderKeys(
    allColumns.value.map((c) => c.key).filter((k) => hasDataKey(k))
  ))
const selectAllColumns = () =>
  (checkedColumns.value = orderKeys(
    allColumns.value.map((c) => c.key).filter((k) => hasDataKey(k))
  ))
const invertColumns = () => {
  const set = new Set(checkedColumns.value)
  checkedColumns.value = orderKeys(allColumns.value.map((c) => c.key).filter((k) => !set.has(k)))
}

/**
 * 单列筛选对话框与筛选逻辑
 */
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
const columnClass = (key: string) => {
  const hasSelection = (colCheckedValues[key] || []).length > 0
  const dialogActive = columnFilterDialogVisible.value && colDialogKey.value === key
  return hasSelection || dialogActive ? 'col-active-filter' : ''
}

/**
 * 排序
 */
const sortKey = ref('')
const sortAsc = ref(true)
const toggleSort = (key: string) => {
  if (sortKey.value === key) sortAsc.value = !sortAsc.value
  else {
    sortKey.value = key
    sortAsc.value = true
  }
  applyFilters()
}
const sortBtnClass = (key: string) => {
  if (sortKey.value !== key) return ''
  return sortAsc.value ? 'asc active' : 'desc active'
}
const filterBtnClass = (key: string) => ((colCheckedValues[key] || []).length ? 'active' : '')

/**
 * 选择与跳转
 */
const selectedEnterprises = ref<string[]>([])
const toBasic = (row: any) => {
  const name = String(row.etps_name || row.name || '')
  if (name) router.push({ name: '企业基本信息', query: { name } })
}
const onSelectionChange = (rowsSel: any[]) => {
  const names = rowsSel.map((r) => String(r.etps_name || r.name || '')).filter((s) => !!s)
  selectedEnterprises.value = Array.from(new Set(names))
}

/**
 * 过滤与排序应用
 */
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
  if (sortKey.value) {
    const key = sortKey.value
    const asc = sortAsc.value
    data.sort((a, b) => {
      const av = String((a as any)[key] ?? '')
      const bv = String((b as any)[key] ?? '')
      return asc ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }
  filteredRows.value = data
  uiPage.value = 1
}

/**
 * 字段别名归一化，保持中文标签映射一致
 */
const canonicalMap: Record<string, string> = {
  regulatory_authority: 'Regulatory Authority',
  registration_location: 'Registration Location',
  enterprise_type_nature: 'Enterprise Type (Nature)',
  enterprise_type_industry: 'Enterprise Type (Industry)',
  industry_category: 'Industry Category',
  customs_broker: 'Customs Broker',
  consignee_enterprise: 'Consignee Enterprise',
  number_of_associated_enterprises: 'Number of Associated Enterprises',
  specialized_refined_unique_new: 'Specialized, Refined, Unique, New',
  registered_capital: 'Registered Capital (10k CNY)',
  paid_in_capital: 'Paid-in Capital (10k CNY)',
  legal_person_risk: 'Legal Person Risk',
  current_year_import_export_amt: 'Current Year Import/Export Amount (10k CNY)',
  past_three_years_import_export_amt: 'Past Three Years Import/Export Amount (10k CNY)',
  current_year_import_export_growth_rate: 'Current Year Import/Export Growth Rate',
  current_year_tax_amt: 'Current Year Tax Amount (10k CNY)',
  past_three_years_tax_amt: 'Past Three Years Tax Amount (10k CNY)',
  supervision_current_year_import_export_amt:
    'Supervision_Current Year Import/Export Amount (10k CNY)',
  supervision_past_three_years_import_export_amt:
    'Supervision_Past Three Years Import/Export Amount (10k CNY)',
  supervision_current_year_import_export_growth_rate:
    'Supervision_Current Year Import/Export Growth Rate',
  settlement_exchange_rate: 'Settlement Exchange Rate',
  current_year_customs_enforcement_count: 'Current Year Customs Enforcement Count',
  previous_year_customs_enforcement_count: 'Previous Year Customs Enforcement Count',
  current_year_anomaly_count: 'Current Year Anomaly Count',
  past_three_years_anomaly_count: 'Past Three Years Anomaly Count'
}
const normalizeRow = (row: any) => {
  const out: any = { ...row }
  Object.entries(canonicalMap).forEach(([alias, raw]) => {
    const v = out[alias]
    const cur = out[raw]
    if (v !== undefined && v !== null && (cur === undefined || cur === null)) out[raw] = v
    delete out[alias]
  })
  return out
}

/**
 * 加载政策数据
 */
const loadingAll = ref(false)
const loadPolicies = async (page = 0, pageSize = 500, q = '') => {
  const resp = await getPolicies({ all: true })
  const list = Array.isArray((resp as any)?.rows)
    ? (resp as any).rows
    : Array.isArray(resp)
      ? (resp as any)
      : Array.isArray((resp as any)?.data)
        ? (resp as any).data
        : []
  const norm = (list || []).map((r: any) => normalizeRow(r))
  rows.splice(0, rows.length, ...norm)
  filteredRows.value = rows
  checkedColumns.value = orderKeys(allColumns.value.map((c) => c.key).filter((k) => hasDataKey(k)))
  applyFilters()
}
const fetchAllData = async () => {
  loadingAll.value = true
  try {
    await loadPolicies(0, 1000, '')
  } finally {
    loadingAll.value = false
  }
}

onMounted(async () => {
  await loadPolicies()
  updateToolbarWidth()
  calcTableDims()
  window.addEventListener('resize', () => {
    updateToolbarWidth()
    calcTableDims()
  })
})
</script>

<style scoped>
.panel {
  display: flex;
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
  width: 560px;
  max-width: 100%;
}
.steps-fixed {
  flex: 0 0 auto;
  width: 260px;
}
.tools-fixed {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}
.table-scroll {
  overflow: auto;
  max-width: 100%;
}
.col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.col-top {
  font-weight: 500;
}
.col-actions {
  display: flex;
  gap: 6px;
}
.col-btn {
  padding: 2px 6px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--main-bg);
  cursor: pointer;
}
.col-btn.active {
  background: #93c5fd;
  border-color: #60a5fa;
}
.col-btn.asc.active::after {
  content: '↑';
  margin-left: 4px;
}
.col-btn.desc.active::after {
  content: '↓';
  margin-left: 4px;
}
.table-wrap :deep(.el-table__header th.col-active-filter) {
  background: rgba(147, 197, 253, 0.35) !important;
}
.table-wrap :deep(.el-table__body td.col-active-filter) {
  background: rgba(147, 197, 253, 0.15);
}
.cell-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
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
.pagination-wrap {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}
</style>
