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
            <template #title>
              <span class="v-title" @click="enableVersion('v1')">{{ versionLabel('v1') }}</span>
            </template>
            <div class="version-actions">
              <el-button type="primary" plain size="small" @click="enableVersion('v1')"
                >查看</el-button
              >
              <el-button type="primary" plain size="small" @click="deleteVersion('v1')"
                >删除</el-button
              >
              <el-button type="primary" plain size="small" @click="renameVersion('v1')"
                >重命名</el-button
              >
            </div>
          </el-sub-menu>
          <el-sub-menu v-for="ver in renderVersionKeys" :key="ver" :index="ver">
            <template #title>
              <span class="v-title" @click="enableVersion(ver)">{{ versionLabel(ver) }}</span>
            </template>
            <div class="version-actions">
              <el-button type="primary" plain size="small" @click="enableVersion(ver)"
                >查看</el-button
              >
              <el-button type="primary" plain size="small" @click="deleteVersion(ver)"
                >删除</el-button
              >
              <el-button type="primary" plain size="small" @click="renameVersion(ver)"
                >重命名</el-button
              >
            </div>
          </el-sub-menu>
        </el-sub-menu>
      </el-menu>
    </div>
    <div class="right-content" ref="rightContentRef">
      <div v-if="false" class="grid3">
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
        <div class="title">切面视角</div>
        <div class="visual-wrap">
          <div ref="abcPieRef" class="chart" />
          <div ref="radarRef" class="chart" />
        </div>
        <div class="visual-bottom">
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
          <div class="table-wrap">
            <el-table :data="companyScoresView" height="300">
              <el-table-column prop="category" label="类别" width="160" />
              <el-table-column prop="class" label="分类" width="120" />
              <el-table-column prop="score" label="评分" width="120" />
            </el-table>
          </div>
        </div>
        <div class="footer footer-fixed" :style="{ width: toolbarWidth + 'px' }">
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
            ></el-input>
            <el-button size="small" type="primary" @click="openFieldFilter">字段筛选</el-button>
            <el-button size="small" type="success" :loading="loadingAll" @click="fetchAllData"
              >获取全部数据</el-button
            >
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
        <el-dialog v-model="createDialogVisible" title="新建项目" width="520px" align-center>
          <el-form label-width="100px">
            <el-form-item label="版本名字">
              <el-input v-model="createForm.name" placeholder="请输入版本名字" />
            </el-form-item>
            <el-form-item label="创建人">
              <el-input v-model="createForm.creator" placeholder="请输入创建人" />
            </el-form-item>
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="createForm.createdAt"
                type="datetime"
                placeholder="选择创建时间"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="field-actions">
              <el-button @click="createDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="confirmCreateVersion">确认</el-button>
            </div>
          </template>
        </el-dialog>
        <el-dialog v-model="renameDialogVisible" title="重命名版本" width="420px" align-center>
          <el-input v-model="renameName" placeholder="请输入新名称" />
          <template #footer>
            <div class="field-actions">
              <el-button @click="renameDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="confirmRenameVersion">确认</el-button>
            </div>
          </template>
        </el-dialog>
        <el-dialog
          v-model="deleteDialogVisible"
          :title="deleteStep === 1 ? '删除确认(1/2)' : '删除确认(2/2)'"
          width="420px"
          align-center
        >
          <div>即将删除版本：{{ versionLabel(deleteTarget) }}</div>
          <div style="margin-top: 8px">请等待 {{ deleteCountdown }} 秒后再确认</div>
          <template #footer>
            <div class="field-actions">
              <el-button @click="deleteDialogVisible = false">取消</el-button>
              <el-button :disabled="deleteCountdown > 0" type="danger" @click="confirmDeleteStep"
                >确认</el-button
              >
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
              <el-button type="primary" @click="confirmColumns">确认</el-button>
            </div>
          </template>
        </el-dialog>
        <div class="footer footer-fixed floating-footer" :style="footerFixedStyle">
          <el-button @click="reset">重置</el-button>
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
            <iframe :src="featureImportanceUrl" class="chart" />
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
        <iframe :src="modelComparisonUrl" class="chart" />
        <div class="k-select-row">
          <el-radio-group v-model="checkedKSingle" class="k-checkboxes">
            <el-radio v-for="k in kOptions" :key="'rad-' + k" :label="k" />
          </el-radio-group>
        </div>
        <div class="footer footer-fixed floating-footer" :style="footerFixedStyle">
          <el-button @click="reset">重置</el-button>
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
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
          <div class="chart-box">
            <div ref="abcPieRef" class="chart" />
          </div>
          <div class="chart-box">
            <div class="table-wrap">
              <el-table :data="companyScoresView" class="company-table" height="420" border stripe>
                <el-table-column prop="category" label="类别" width="160" />
                <el-table-column prop="class" label="分类" width="120" />
                <el-table-column prop="score" label="评分" width="120" />
                <el-table-column label="操作" width="140">
                  <template #default="{ row }">
                    <el-button size="small" @click="openCategory(row.category)"
                      >全数据浏览</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
        <div v-if="categoryView" class="category-view">
          <div class="cat-toolbar">
            <el-button size="small" @click="backCategory">返回</el-button>
            <span class="cat-tip">当前分类：{{ selectedCategory }}</span>
          </div>
          <el-table :data="categoryRows" height="420" border stripe>
            <el-table-column :prop="'Consignee Enterprise'" label="收货企业" min-width="240" />
            <el-table-column :prop="'Registration Location'" label="注册所在地" min-width="160" />
            <el-table-column :prop="'Industry Category'" label="行业类别" min-width="160" />
          </el-table>
        </div>
        <div class="visual-bottom">
          <div class="chart-box">
            <iframe :src="riskDistributionUrl" class="chart" />
          </div>
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
          <el-button type="primary" @click="backToTopic">返回切面视角</el-button>
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
            <iframe :src="shapCluster0Url" class="chart" />
            <iframe :src="shapCluster1Url" class="chart" />
          </div>
          <div class="tag-assign">
            <div class="title">企业标签配置</div>
            <el-table :data="companyScoresView" height="420">
              <el-table-column prop="category" label="类别" width="120" />
              <el-table-column prop="class" label="分类" width="120" />

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
            <el-button type="primary" @click="finishAndGoVisual">提交</el-button>
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
import {
  getTagDistribution,
  getDualUseItems,
  getTuningModels,
  cloneDualUseItemsTuned,
  updateDualUseItemTunedTag,
  getDualUseItemsTuned,
  createTuningModel,
  renameTuningModel,
  deleteTuningModel,
  getTags,
  updateEnterpriseTags
} from '@/services/api'
import { notifySuccess, notifyWarn, notifyError, notifyInfo } from '@/composables/notifyBus'
import { ElMessage } from 'element-plus'

const router = useRouter()
const featureImportanceUrl = new URL(
  '../../../../results_output/visualizations/feature_importance.html',
  import.meta.url
).href
const modelComparisonUrl = new URL(
  '../../../../results_output/visualizations/model_comparison.html',
  import.meta.url
).href
const riskDistributionUrl = new URL(
  '../../../../results_output/visualizations/risk_distribution.html',
  import.meta.url
).href
const shapCluster0Url = new URL(
  '../../../../results_output/visualizations/shap_cluster_0_importance.html',
  import.meta.url
).href
const shapCluster1Url = new URL(
  '../../../../results_output/visualizations/shap_cluster_1_importance.html',
  import.meta.url
).href
const active = ref('topic')
const defaultOpeneds = ref(['params', 'v1'])
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
const passedFilterValues = ref<Record<string, string[]>>({})
const passedFilterRows = ref<any[]>([])
const passedFieldKeys = ref<string[]>([])
const nextStep = () => {
  if (stepIndex.value === 0) {
    const snap = Object.fromEntries(
      Object.entries(colCheckedValues)
        .filter(([, v]) => (v || []).length)
        .map(([k, v]) => [k, [...(v || [])]])
    )
    passedFilterValues.value = snap
    passedFilterRows.value = [...(tableRows.value as any[])]
    passedFieldKeys.value = [...checkedColumns.value]
    if (!selectedEnterprises.value.length) {
      const names = Array.from(
        new Set(
          passedFilterRows.value
            .map((r: any) =>
              String(
                (r as any)['Consignee Enterprise'] ?? (r as any).etps_name ?? (r as any).name ?? ''
              )
            )
            .filter((s: string) => !!s)
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
const categoryView = ref(false)
const selectedCategory = ref('')
const openCategory = (category: string) => {
  selectedCategory.value = category
  categoryView.value = true
  setTimeout(async () => {
    if (currentModelId.value) await loadTunedRows(currentModelId.value)
  }, 0)
}
const backCategory = () => {
  categoryView.value = false
}
const versions = reactive<
  Record<
    string,
    {
      exists: boolean
      enabled: boolean
      name?: string
      creator?: string
      createdAt?: number
      id?: string
    }
  >
>({
  v1: { exists: true, enabled: false, name: 'V1' }
})
const versionLabel = (v: string) => versions[v]?.name || v.toUpperCase()
const versionKeys = computed(() => Object.keys(versions))
const otherVersionKeys = computed(() => versionKeys.value.filter((k) => k !== 'v1'))
const renderVersionKeys = computed(() => otherVersionKeys.value.filter((k) => versions[k].exists))
const enableVersion = (v: string) => {
  Object.keys(versions).forEach((k) => (versions[k].enabled = k === v))
  setVersionSteps(v)
  active.value = `${v}-filter`
  stepIndex.value = 0
  reset()
  setTimeout(async () => {
    try {
      await ensureModelList()
      const id = await resolveModelId(v)
      if (id) {
        currentModelId.value = id
        await ensureClone(id)
      }
    } catch {
      /* ignore */
    }
  }, 0)
}
const disableVersion = (v: string) => {
  if (versions[v]) versions[v].enabled = false
  if (active.value.startsWith(`${v}-`)) {
    active.value = 'dualuse'
    stepIndex.value = 0
  }
}
const deleteTarget = ref('')
const deleteStep = ref(1)
const deleteDialogVisible = ref(false)
const deleteCountdown = ref(5)
let deleteTimer: number | null = null
const startDeleteCountdown = () => {
  if (deleteTimer) window.clearInterval(deleteTimer)
  deleteCountdown.value = 5
  deleteTimer = window.setInterval(() => {
    deleteCountdown.value -= 1
    if (deleteCountdown.value <= 0 && deleteTimer) {
      window.clearInterval(deleteTimer)
      deleteTimer = null
    }
  }, 1000)
}
const deleteVersion = (v: string) => {
  deleteTarget.value = v
  deleteStep.value = 1
  deleteDialogVisible.value = true
  startDeleteCountdown()
}
const confirmDeleteStep = () => {
  if (deleteCountdown.value > 0) return
  if (deleteStep.value === 1) {
    deleteStep.value = 2
    startDeleteCountdown()
    return
  }
  const v = deleteTarget.value
  if (versions[v]) versions[v].exists = false
  if (active.value.startsWith(`${v}-`)) {
    active.value = 'dualuse'
    stepIndex.value = 0
  }
  try {
    const id = versions[v]?.id || v
    deleteTuningModel(id)
  } catch (e) {
    notifyError('删除失败')
  }
  deleteDialogVisible.value = false
}
const createDialogVisible = ref(false)
const createForm = reactive<{ name: string; creator: string; createdAt: number | null }>({
  name: '',
  creator: '',
  createdAt: null
})
const createNewVersion = () => {
  createForm.name = ''
  createForm.creator = ''
  createForm.createdAt = Date.now()
  createDialogVisible.value = true
}
const confirmCreateVersion = async () => {
  if (!createForm.name || !createForm.creator || !createForm.createdAt) return
  const nums = Object.keys(versions)
    .map((k) => Number(k.replace('v', '')))
    .filter((n) => !Number.isNaN(n))
  const next = Math.max(...nums) + 1
  const key = `v${next}`
  versions[key] = {
    exists: true,
    enabled: false,
    name: createForm.name,
    creator: createForm.creator,
    createdAt: Number(createForm.createdAt)
  } as any
  try {
    const resp: any = await createTuningModel({
      name: createForm.name,
      creator: createForm.creator,
      createdAt: Number(createForm.createdAt)
    })
    if (resp?.id) versions[key].id = String(resp.id)
  } catch (e) {
    notifyError('创建失败')
  }
  createDialogVisible.value = false
  enableVersion(key)
}
const renameDialogVisible = ref(false)
const renameTarget = ref('')
const renameName = ref('')
const renameVersion = (v: string) => {
  renameTarget.value = v
  renameName.value = versions[v]?.name || v.toUpperCase()
  renameDialogVisible.value = true
}
const confirmRenameVersion = () => {
  const v = renameTarget.value
  if (versions[v]) versions[v].name = renameName.value
  try {
    const id = versions[v]?.id || v
    renameTuningModel(id, { name: renameName.value })
  } catch (e) {
    notifyError('重命名失败')
  }
  renameDialogVisible.value = false
}

const distRef = ref<HTMLDivElement | null>(null)
const historyRef = ref<HTMLDivElement | null>(null)
const boxRef = ref<HTMLDivElement | null>(null)
const featureRef = ref<HTMLDivElement | null>(null)
const importanceRef = ref<HTMLDivElement | null>(null)
const classRef = ref<HTMLDivElement | null>(null)
const radarRef = ref<HTMLDivElement | null>(null)
const abcPieRef = ref<HTMLDivElement | null>(null)
const visualBoxRef = ref<HTMLDivElement | null>(null)
const enableRef = ref<HTMLDivElement | null>(null)
const disableRef = ref<HTMLDivElement | null>(null)
const deleteRef = ref<HTMLDivElement | null>(null)
const topicPieRef = ref<HTMLDivElement | null>(null)
const topicTrendRef = ref<HTMLDivElement | null>(null)

const rightContentRef = ref<HTMLDivElement | null>(null)
const toolbarWidth = ref<number>(0)
const updateToolbarWidth = () => {
  const w = rightContentRef.value?.clientWidth ?? 0
  toolbarWidth.value = w > 0 ? w : 0
}
const frameOffset = ref<number>(-12)
const filterCardRef = ref<HTMLDivElement | null>(null)
const footerFixedStyle = ref<Record<string, string>>({})
const updateFloatingFooter = () => {
  const rect = filterCardRef.value?.getBoundingClientRect()
  const left = rect?.left ?? rightContentRef.value?.getBoundingClientRect()?.left ?? 0
  const width = toolbarWidth.value + frameOffset.value
  footerFixedStyle.value = {
    left: `${Math.max(0, Math.round(left))}px`,
    width: `${Math.max(0, Math.round(width))}px`
  }
}

const distChartType = ref<'bar' | 'line'>('bar')

const tagDist = reactive<{ name: string; value: number }[]>([])
const distError = ref(false)

const renderDist = async () => {
  if (!distRef.value) return
  const chart = echarts.init(distRef.value)
  if (!tagDist.length) {
    try {
      const data = await getTagDistribution()
      Object.assign(tagDist, data?.rows || [])
    } catch {
      distError.value = true
    }
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
    router.push({ name: '企业基本信息', query: { category: cat } })
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
      {
        name: '低',
        type: 'bar',
        stack: 'total',
        data: [20, 18, 15],
        itemStyle: { color: '#93c5fd' }
      },
      {
        name: '中',
        type: 'bar',
        stack: 'total',
        data: [30, 28, 26],
        itemStyle: { color: '#60a5fa' }
      },
      {
        name: '高',
        type: 'bar',
        stack: 'total',
        data: [25, 30, 32],
        itemStyle: { color: '#3b82f6' }
      },
      {
        name: '极高',
        type: 'bar',
        stack: 'total',
        data: [25, 24, 27],
        itemStyle: { color: '#1d4ed8' }
      }
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
const rows = reactive<Record<string, any>[]>([])
const filteredRows = ref(rows)
const uiPage = ref(1)
const onUiPageChange = (p: number) => (uiPage.value = p)
const loadingAll = ref(false)
const colCheckedValues = reactive<Record<string, string[]>>({})
const colFilterOptions = reactive<Record<string, string[]>>({})
const colFilterCounts = reactive<Record<string, Record<string, number>>>({})
const columnFilterDialogVisible = ref(false)
const colDialogKey = ref<string>('')
const colDialogTitle = computed(() => {
  const key = colDialogKey.value
  const label = allColumns.value.find((c) => c.key === key)?.label || key
  return `字段筛选 - ${label}`
})
const colDialogSearch = ref('')
const colDialogOptionsSorted = computed(() => {
  const key = colDialogKey.value
  const q = colDialogSearch.value.trim().toLowerCase()
  const counts = colFilterCounts[key] || {}
  const opts = Object.keys(counts)
  const filtered = q ? opts.filter((o) => String(o).toLowerCase().includes(q)) : opts
  return filtered
    .map((v) => ({
      value: v,
      count: counts[v] || 0,
      label: `${v}${counts[v] ? ` [${counts[v]}]` : ''}`
    }))
    .sort(
      (a, b) =>
        b.count - a.count || a.value.length - b.value.length || a.value.localeCompare(b.value)
    )
})
const colDialogCols = computed(() => {
  const n = colDialogOptionsSorted.value.length
  return n > 160 ? 6 : n > 100 ? 5 : n > 60 ? 4 : n > 36 ? 3 : n > 18 ? 2 : 1
})
const colDialogWidth = computed(() => {
  const maxW = Math.max(320, toolbarWidth.value + frameOffset.value - 24)
  const base = 560
  const perCol = 220
  const w = base + perCol * (colDialogCols.value - 1)
  return Math.min(Math.max(base, w), maxW)
})
const colDialogMaxHeight = computed(() => {
  const vh = window.innerHeight || 800
  return Math.max(360, Math.floor(vh - 220))
})
const filteredAll = computed(() => {
  const base = filteredRows.value as any[]
  const keys = Object.keys(colCheckedValues).filter((k) => (colCheckedValues[k] || []).length)
  const keyword = filterKeyword.value.trim().toLowerCase()
  const visibleKeys = new Set(visibleColumns.value.map((c) => c.key))
  const byFilter = !keys.length
    ? base
    : base.filter((r) => {
        for (const k of keys) {
          const sel = colCheckedValues[k]
          const val = Array.isArray((r as any)[k])
            ? (r as any)[k].map((x: any) => String(x ?? ''))
            : [String((r as any)[k] ?? '')]
          if (!val.some((v: string) => sel.includes(v))) return false
        }
        return true
      })
  if (!keyword) return byFilter
  return byFilter.filter((r) => {
    for (const k of Object.keys(r)) {
      if (!visibleKeys.has(k)) continue
      const v = (r as any)[k]
      const s = Array.isArray(v) ? v.join(',') : String(v ?? '')
      if (s.toLowerCase().includes(keyword)) return true
    }
    return false
  })
})
const totalFiltered = computed(() => filteredAll.value.length)
const sortKey = ref<string>('')
const sortOrder = ref<'asc' | 'desc' | ''>('')
const sortedAll = computed(() => {
  const arr = [...filteredAll.value]
  const key = sortKey.value
  const order = sortOrder.value
  if (!key || !order) return arr
  const get = (r: any) => {
    const v = (r as any)[key]
    if (Array.isArray(v)) return v.join(',')
    return v
  }
  const asNum = (v: any) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  arr.sort((a: any, b: any) => {
    const va = get(a)
    const vb = get(b)
    const na = asNum(va)
    const nb = asNum(vb)
    let cmp = 0
    if (na !== null && nb !== null) cmp = na - nb
    else cmp = String(va ?? '').localeCompare(String(vb ?? ''))
    return order === 'asc' ? cmp : -cmp
  })
  return arr
})
const tableRows = computed(() => {
  const start = (uiPage.value - 1) * size.value
  const end = start + size.value
  return sortedAll.value.slice(start, end)
})
const columnClass = (key: string) => {
  const hasSelection = (colCheckedValues[key] || []).length > 0
  const dialogActive = columnFilterDialogVisible.value && colDialogKey.value === key
  const filterActive = hasSelection || dialogActive
  const sortActive = sortKey.value === key && !!sortOrder.value
  return `${filterActive ? 'col-active-filter' : ''} ${sortActive ? 'col-active-sort' : ''}`.trim()
}
const toggleSort = (key: string) => {
  if (sortKey.value !== key) {
    sortKey.value = key
    sortOrder.value = 'asc'
  } else {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : sortOrder.value === 'desc' ? '' : 'asc'
  }
}
const sortBtnClass = (key: string) => (sortKey.value === key && sortOrder.value ? 'active' : '')
const filterBtnClass = (key: string) => ((colCheckedValues[key] || []).length > 0 ? 'active' : '')
const openColFilter = async (key: string) => {
  await ensureAllDataLoaded()
  const counts: Record<string, number> = {}
  for (const r of filteredRows.value) {
    const v = (r as any)[key]
    if (Array.isArray(v)) {
      for (const x of v) {
        const s = String(x ?? '')
        if (!s) continue
        counts[s] = (counts[s] || 0) + 1
      }
    } else {
      const s = String(v ?? '')
      if (s) counts[s] = (counts[s] || 0) + 1
    }
  }
  colFilterCounts[key] = counts
  colFilterOptions[key] = Object.keys(counts)
    .filter((s) => s !== '')
    .sort(
      (a, b) => (counts[b] || 0) - (counts[a] || 0) || a.length - b.length || a.localeCompare(b)
    )
  colDialogKey.value = key
  columnFilterDialogVisible.value = true
  if (!colCheckedValues[key]) colCheckedValues[key] = []
}
const resetColFilter = (key: string) => {
  colCheckedValues[key] = []
  columnFilterDialogVisible.value = false
}
const confirmColFilter = (key: string) => {
  columnFilterDialogVisible.value = false
  uiPage.value = 1
}
const selectAllColFilter = (key: string) => {
  colCheckedValues[key] = [...(colFilterOptions[key] || [])]
}
const invertColFilter = (key: string) => {
  const opts = new Set(colFilterOptions[key] || [])
  const sel = new Set(colCheckedValues[key] || [])
  colCheckedValues[key] = Array.from(opts).filter((o) => !sel.has(o))
}
const selectedEnterprises = ref<string[]>([])
const onSelectionChange = (sel: any[]) => {
  selectedEnterprises.value = Array.from(new Set(sel.map((r) => r.etps_name)))
  generateAggStats()
}
const toBasic = (row: any) => {
  const name = (row as any)['Consignee Enterprise']
  if (!name) return
  router.push({ name: '企业基本信息', query: { focusName: name } })
}
const currentModelId = ref<number | null>(null)
const ensureModelList = async () => {
  try {
    const resp: any = await getTuningModels()
    const list: any[] = Array.isArray(resp?.rows) ? resp.rows : Array.isArray(resp) ? resp : []
    for (const m of list) {
      const key = String(m?.name || '').trim()
      if (!key) continue
      if (!versions[key]) versions[key] = { exists: true, enabled: false } as any
      versions[key].exists = true
      versions[key].name = key
      versions[key].id = String(m?.id)
    }
  } catch {
    /* ignore */
  }
}
const resolveModelId = async (v: string) => {
  const id = versions[v]?.id
  if (id) return Number(id)
  await ensureModelList()
  return Number(versions[v]?.id || NaN)
}
const ensureClone = async (modelId: number) => {
  try {
    await cloneDualUseItemsTuned({ modelId })
  } catch {
    /* ignore */
  }
}
// 后端数据接入
const page = ref(0)
const size = ref(100)
const total = ref(0)
const loadedPages = ref<Set<number>>(new Set<number>())
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
  // 将旧的蛇形别名回填到原始列名（严格大小写与空格）
  Object.entries(canonicalMap).forEach(([alias, raw]) => {
    const v = out[alias]
    const cur = out[raw]
    if (v !== undefined && v !== null && (cur === undefined || cur === null)) {
      out[raw] = v
    }
    delete out[alias]
  })
  return out
}
const loadEtps = async () => {
  const q0 = ''
  const pages = [page.value, 0, 1]
  const queries = [q0, '', undefined]
  const pickList = (r: any): any[] =>
    Array.isArray(r)
      ? r
      : Array.isArray(r?.rows)
        ? r.rows
        : Array.isArray(r?.data)
          ? r.data
          : Array.isArray(r?.content)
            ? r.content
            : Array.isArray(r?.list)
              ? r.list
              : []
  const pickTotal = (r: any, list: any[]) =>
    Number(
      (r && (r.total ?? r.count ?? r.totalElements ?? r.total_count)) ??
        (Array.isArray(r?.rows) ? r.rows.length : 0) ??
        (Array.isArray(r?.data) ? r.data.length : 0) ??
        (Array.isArray(r?.content) ? r.content.length : 0) ??
        (Array.isArray(r?.list) ? r.list.length : 0) ??
        (Array.isArray(list) ? list.length : 0)
    )
  try {
    loadedPages.value.clear()
    let resp: any = null
    let list: any[] = []
    outer: for (const p of pages) {
      for (const q of queries) {
        resp = await getDualUseItems({ q, page: p, size: size.value })
        list = pickList(resp)
        if (list && list.length) {
          page.value = p
          loadedPages.value.add(p)
          break outer
        }
      }
    }
    const norm = (list || []).map((r: any) => normalizeRow(r))
    rows.splice(0, rows.length, ...norm)
    filteredRows.value = rows
    total.value = pickTotal(resp, list)
    checkedColumns.value = orderKeys(
      allColumns.value.map((c: ColumnDef) => c.key).filter((k) => hasDataKey(k))
    )
    if (norm.length) notifySuccess('已获取企业信息', `共 ${norm.length} 条`)
    else notifyWarn('后端返回空数据')
  } catch (e) {
    if (!rows.length) filteredRows.value = [] as any
    notifyError('后端无数据或未联通')
  }
}

const ensureAllDataLoaded = async () => {
  const totalCount = total.value || 0
  const pagesCount = Math.ceil(totalCount / size.value)
  if (!pagesCount || rows.length >= totalCount) return
  const q = ''
  const need: number[] = []
  for (let p = 0; p < pagesCount; p++) {
    if (!loadedPages.value.has(p)) need.push(p)
  }
  if (!need.length) return
  try {
    const add: any[] = []
    const CONCURRENCY = 8
    for (let i = 0; i < need.length; i += CONCURRENCY) {
      const batch = need.slice(i, i + CONCURRENCY)
      const resps = await Promise.all(
        batch.map((p) => getDualUseItems({ q, page: p, size: size.value }))
      )
      for (const r of resps) {
        const list = Array.isArray((r as any)?.rows) ? (r as any).rows : Array.isArray(r) ? r : []
        for (const it of list) add.push(normalizeRow(it))
      }
    }
    const byId: Record<string, any> = {}
    for (const it of [...rows, ...add]) {
      const id = String((it as any).item_id ?? '')
      if (id) byId[id] = it
    }
    const merged = Object.values(byId)
    rows.splice(0, rows.length, ...merged)
    filteredRows.value = rows
    need.forEach((p) => loadedPages.value.add(p))
  } catch {
    /* ignore */
  }
}

const fetchAllData = async () => {
  if (!total.value) await loadEtps()
  loadingAll.value = true
  try {
    await ensureAllDataLoaded()
    uiPage.value = 1
    notifySuccess('已获取全部数据', `共 ${rows.length} 条`)
  } catch {
    notifyError('获取全部数据失败')
  } finally {
    loadingAll.value = false
  }
}
watch(filterKeyword, () => {
  uiPage.value = 1
})

// 字段列管理与筛选
type ColumnDef = { key: string; label: string }
const baseColumns: ColumnDef[] = [
  { key: 'item_id', label: 'ID' },
  { key: 'Regulatory Authority', label: '监管部门' },
  { key: 'Registration Location', label: '注册所在地' },
  { key: 'Enterprise Type (Nature)', label: '企业类型（性质）' },
  { key: 'Enterprise Type (Industry)', label: '企业类型（行业）' },
  { key: 'Industry Category', label: '行业类别' },
  { key: 'Customs Broker', label: '报关行' },
  { key: 'Consignee Enterprise', label: '收货企业' },
  { key: 'Number of Associated Enterprises', label: '关联企业数量' },
  { key: 'Specialized, Refined, Unique, New', label: '专精特新' },
  { key: 'Registered Capital (10k CNY)', label: '注册资本（万元）' },
  { key: 'Paid-in Capital (10k CNY)', label: '实缴资本（万元）' },
  { key: 'Legal Person Risk', label: '法人风险' },
  { key: 'Current Year Import/Export Amount (10k CNY)', label: '当年进出口额（万元）' },
  { key: 'Past Three Years Import/Export Amount (10k CNY)', label: '近三年进出口额（万元）' },
  { key: 'Current Year Import/Export Growth Rate', label: '当年进出口增长率' },
  { key: 'Current Year Tax Amount (10k CNY)', label: '当年税额（万元）' },
  { key: 'Past Three Years Tax Amount (10k CNY)', label: '近三年税额（万元）' },
  {
    key: 'Supervision_Current Year Import/Export Amount (10k CNY)',
    label: '监管-当年进出口额（万元）'
  },
  {
    key: 'Supervision_Past Three Years Import/Export Amount (10k CNY)',
    label: '监管-近三年进出口额（万元）'
  },
  { key: 'Supervision_Current Year Import/Export Growth Rate', label: '监管-当年进出口增长率' },
  { key: 'Settlement Exchange Rate', label: '结算汇率' },
  { key: 'Current Year Customs Enforcement Count', label: '当年海关执法次数' },
  { key: 'Previous Year Customs Enforcement Count', label: '上年海关执法次数' },
  { key: 'Current Year Anomaly Count', label: '当年异常次数' },
  { key: 'Past Three Years Anomaly Count', label: '近三年异常次数' }
]
const preferredOrder = [
  'item_id',
  'Regulatory Authority',
  'Registration Location',
  'Enterprise Type (Nature)',
  'Enterprise Type (Industry)',
  'Industry Category',
  'Customs Broker',
  'Consignee Enterprise',
  'Number of Associated Enterprises',
  'Specialized, Refined, Unique, New',
  'Registered Capital (10k CNY)',
  'Paid-in Capital (10k CNY)',
  'Legal Person Risk',
  'Current Year Import/Export Amount (10k CNY)',
  'Past Three Years Import/Export Amount (10k CNY)',
  'Current Year Import/Export Growth Rate',
  'Current Year Tax Amount (10k CNY)',
  'Past Three Years Tax Amount (10k CNY)',
  'Supervision_Current Year Import/Export Amount (10k CNY)',
  'Supervision_Past Three Years Import/Export Amount (10k CNY)',
  'Supervision_Current Year Import/Export Growth Rate',
  'Settlement Exchange Rate',
  'Current Year Customs Enforcement Count',
  'Previous Year Customs Enforcement Count',
  'Current Year Anomaly Count',
  'Past Three Years Anomaly Count'
]
const allColumns = computed<ColumnDef[]>(() => {
  const keys = new Set(baseColumns.map((c) => c.key))
  for (const r of filteredRows.value) {
    Object.keys(r).forEach((k) => keys.add(k))
  }
  return Array.from(keys).map((k) => ({
    key: k,
    label:
      baseColumns.find((b) => b.key === k)?.label ||
      (
        {
          item_id: 'ID',
          'Regulatory Authority': '监管部门',
          'Registration Location': '注册所在地',
          'Enterprise Type (Nature)': '企业类型（性质）',
          'Enterprise Type (Industry)': '企业类型（行业）',
          'Industry Category': '行业类别',
          'Customs Broker': '报关行',
          'Consignee Enterprise': '收货企业',
          'Number of Associated Enterprises': '关联企业数量',
          'Specialized, Refined, Unique, New': '专精特新',
          'Registered Capital (10k CNY)': '注册资本（万元）',
          'Paid-in Capital (10k CNY)': '实缴资本（万元）',
          'Legal Person Risk': '法人风险',
          'Current Year Import/Export Amount (10k CNY)': '当年进出口额（万元）',
          'Past Three Years Import/Export Amount (10k CNY)': '近三年进出口额（万元）',
          'Current Year Import/Export Growth Rate': '当年进出口增长率',
          'Current Year Tax Amount (10k CNY)': '当年税额（万元）',
          'Past Three Years Tax Amount (10k CNY)': '近三年税额（万元）',
          'Supervision_Current Year Import/Export Amount (10k CNY)': '监管-当年进出口额（万元）',
          'Supervision_Past Three Years Import/Export Amount (10k CNY)':
            '监管-近三年进出口额（万元）',
          'Supervision_Current Year Import/Export Growth Rate': '监管-当年进出口增长率',
          'Settlement Exchange Rate': '结算汇率',
          'Current Year Customs Enforcement Count': '当年海关执法次数',
          'Previous Year Customs Enforcement Count': '上年海关执法次数',
          'Current Year Anomaly Count': '当年异常次数',
          'Past Three Years Anomaly Count': '近三年异常次数'
        } as Record<string, string>
      )[k] ||
      k
  }))
})
const hasDataKey = (key: string) =>
  filteredRows.value.some((r: any) => {
    const v = r[key]
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
  for (const r of filteredRows.value) {
    maxLen = Math.max(maxLen, getLen((r as any)[key]))
  }
  const charW = 10
  const units = Math.max(5, Math.min(Math.ceil(maxLen) + 2, 26))
  return units * charW
}
const fieldFilterVisible = ref(false)
const openFieldFilter = () => (fieldFilterVisible.value = true)
const resetColumns = () =>
  (checkedColumns.value = orderKeys(baseColumns.map((c) => c.key).filter((k) => hasDataKey(k))))
const selectAllColumns = () =>
  (checkedColumns.value = orderKeys(
    allColumns.value.map((c: ColumnDef) => c.key).filter((k) => hasDataKey(k))
  ))
const invertColumns = () => {
  const all = new Set<string>(allColumns.value.map((c: ColumnDef) => c.key))
  const cur = new Set<string>(checkedColumns.value)
  checkedColumns.value = Array.from(all).filter((k: string) => !cur.has(k))
}
const confirmColumns = () => (fieldFilterVisible.value = false)

onMounted(() => {
  enableVersion('v1')
  loadEtps()
})

const checkedFeatures = ref<string[]>([])
const selectedFields = computed(() => {
  const keys = passedFieldKeys.value.length
    ? passedFieldKeys.value
    : Object.keys(passedFilterValues.value).filter(
        (k) => (passedFilterValues.value[k] || []).length
      )
  return keys
})
const featuresSorted = computed(() => {
  const counts = passedFilterValues.value
  return [...selectedFields.value].sort(
    (a, b) => (counts[b]?.length || 0) - (counts[a]?.length || 0) || a.localeCompare(b)
  )
})
const activeFeature = ref<string>('')
const curStats = ref<any>({ name: '', min: 0, max: 0, low: 0, mid: 0, high: 0 })
const curRange = ref<[number, number]>([0, 0])
const featureCounts = computed(() => {
  const data = (
    passedFilterRows.value && passedFilterRows.value.length
      ? passedFilterRows.value
      : filteredRows.value
  ) as any[]
  const keys = checkedFeatures.value.length ? checkedFeatures.value : selectedFields.value
  const result: { name: string; count: number }[] = []
  for (const k of keys) {
    const set = new Set<string>()
    for (const r of data) {
      const v = (r as any)[k]
      if (Array.isArray(v)) v.forEach((x) => set.add(String(x ?? '')))
      else set.add(String(v ?? ''))
    }
    const cnt = Array.from(set).filter((s) => s !== '').length
    result.push({ name: k, count: cnt })
  }
  return result.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})
const renderFeatureCounts = () => {
  if (!featureRef.value) return
  const chart = echarts.init(featureRef.value)
  const cats = featureCounts.value.map((i) => i.name)
  const data = featureCounts.value.map((i) => i.count)
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
const featureAggStats = ref<
  Record<string, { min: number; max: number; low: number; mid: number; high: number }>
>({})
const hash = (s: string) => s.split('').reduce((a, c) => (a * 131 + c.charCodeAt(0)) % 9973, 7)
const generateAggStats = () => {
  const map: Record<string, { min: number; max: number; low: number; mid: number; high: number }> =
    {}
  for (const key of selectedFields.value) {
    const vals = passedFilterRows.value
      .map((r: any) => Number((r as any)[key]))
      .filter((v) => !Number.isNaN(v))
    if (!vals.length) continue
    const sorted = [...vals].sort((a, b) => a - b)
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const mid = sorted[Math.floor(sorted.length / 2)]
    const low = sorted[Math.floor(sorted.length * 0.25)]
    const high = sorted[Math.floor(sorted.length * 0.75)]
    map[key] = { min, max, low, mid, high }
  }
  featureAggStats.value = map
}
const openFeature = (f: string) => {
  activeFeature.value = f
  const s = featureAggStats.value[f] || { name: f, min: 0, max: 0, low: 0, mid: 0, high: 0 }
  curStats.value = {
    name: f,
    min: s.min,
    max: s.max,
    low: s.low,
    mid: s.mid,
    high: s.high
  } as any
  curRange.value = [s.min, s.max]
  setTimeout(() => {
    // 已将特征图替换为表格，此处无需再渲染图表
  }, 0)
}
const onRangeChange = () => {
  const left = curRange.value[0]
  const right = curRange.value[1]
  const mid = Math.floor((left + right) / 2)
  curStats.value = {
    name: curStats.value.name,
    min: Math.min(curStats.value.min, left),
    max: Math.max(curStats.value.max, right),
    low: left,
    mid,
    high: right
  } as any
  setTimeout(() => {
    // 特征图已替换为表格，不再渲染图表
  }, 0)
}

const kOptions = [2, 3, 4, 5]
const checkedKSingle = ref<number>(2)
const checkedK = computed<number[]>(() => [checkedKSingle.value])
const renderClass = () => {
  if (!classRef.value) return
  const chart = echarts.init(classRef.value)
  const ks = [1, 2, 3, 4, 5]
  const base = [0.72, 0.78, 0.83, 0.81, 0.76]
  const factor = 1 + Math.min(checkedK.value.length, 5) * 0.02
  const scores = base.map((v) => Number((v * factor).toFixed(3)))
  const option = {
    title: { text: '分类数量与评分(1-5)', left: 'center' },
    grid: { left: 50, right: 20, top: 50, bottom: 40 },
    xAxis: { type: 'category', name: '分类数', data: ks },
    yAxis: { type: 'value', name: '评分', min: 0.5, max: 1.0 },
    series: [
      {
        name: 'Score',
        type: 'line',
        data: scores,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#3b82f6' },
        itemStyle: { color: '#3b82f6' }
      }
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

const renderRadar = () => {
  if (!radarRef.value) return
  const chart = echarts.init(radarRef.value)
  const feats = checkedFeatures.value.length
    ? checkedFeatures.value
    : featuresSorted.value.slice(0, 6)
  const indicators = feats.map((n) => ({ name: n, max: 100 }))
  const makeVals = (seed: number) =>
    indicators.map((_, i) => Math.max(30, Math.min(95, Math.round(60 + 15 * Math.sin(seed + i)))))
  const option = {
    title: { text: 'ABC类企业指标雷达图', left: 'center', top: 8 },
    legend: { data: ['A类', 'B类', 'C类'], top: 40 },
    radar: {
      indicator: indicators,
      top: 80,
      center: ['50%', '55%'],
      radius: '70%'
    },
    series: [
      {
        type: 'radar',
        data: [
          { name: 'A类', value: makeVals(1) },
          { name: 'B类', value: makeVals(2) },
          { name: 'C类', value: makeVals(3) }
        ]
      }
    ],
    tooltip: { trigger: 'item' }
  }
  chart.setOption(option)
  const onResize = () => chart.resize()
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    chart.dispose()
  }
}

const boxMetric = ref<string>('')
const renderVisualBox = () => {
  if (!visualBoxRef.value) return
  const chart = echarts.init(visualBoxRef.value)
  const metric = boxMetric.value || '指标'
  const seed = Array.from(metric).reduce((s, ch) => s + ch.charCodeAt(0), 0)
  const mk = (base: number) => {
    const r = (seed % 11) - 5 // -5..5
    const arr = [base - 15 + r, base - 5 + r, base + r, base + 10 + r, base + 20 + r]
    return [Math.max(0, arr[0]), Math.max(0, arr[1]), arr[2], arr[3], arr[4]]
  }
  const option = {
    title: { text: `箱线图：${metric}`, left: 'center', top: 8 },
    tooltip: { trigger: 'item' },
    legend: { data: ['A类', 'B类', 'C类'], top: 40 },
    grid: { top: 72, left: 40, right: 20, bottom: 40 },
    xAxis: { type: 'category', data: ['A类', 'B类', 'C类'] },
    yAxis: { type: 'value' },
    series: [
      { name: 'A类', type: 'boxplot', data: [mk(50)] },
      { name: 'B类', type: 'boxplot', data: [mk(60)] },
      { name: 'C类', type: 'boxplot', data: [mk(70)] }
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

const categoryNamesByK = (k: number): string[] => ['A类', 'B类', 'C类', 'D类', 'E类'].slice(0, k)
const renderABCPie = () => {
  if (!abcPieRef.value) return
  const chart = echarts.init(abcPieRef.value)
  const base: Record<string, number> = { A类: 40, B类: 35, C类: 25, D类: 20, E类: 15 }
  const cats = categoryNamesByK(checkedKSingle.value)
  const data = cats.map((c) => ({ name: c, value: base[c] || 10 }))
  const total = data.reduce((s, d) => s + d.value, 0)
  const option = {
    title: { text: `${cats.join(' / ')} 类别占比（饼图）`, left: 'center' },
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => `${p.name}: ${p.value} (${Math.round((p.value / total) * 100)}%)`
    },
    series: [{ type: 'pie', radius: ['40%', '70%'], data }]
  }
  chart.setOption(option)
  chart.on('click', (p: any) => {
    const name = String(p?.name || '')
    if (name) openCategory(name)
  })
  const onResize = () => chart.resize()
  window.addEventListener('resize', onResize)
  return () => {
    window.removeEventListener('resize', onResize)
    chart.dispose()
  }
}

const renderEnable = () => {
  if (!enableRef.value) return
  const chart = echarts.init(enableRef.value)
  const option = {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { name: '已启用', value: 36 },
          { name: '未启用', value: 14 }
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

const renderDisable = () => {
  if (!disableRef.value) return
  const chart = echarts.init(disableRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['一月', '二月', '三月', '四月'] },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: [4, 6, 5, 7], itemStyle: { color: '#3b82f6' } }]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
  return () => {
    window.removeEventListener('resize', () => chart.resize())
    chart.dispose()
  }
}

const renderDelete = () => {
  if (!deleteRef.value) return
  const chart = echarts.init(deleteRef.value)
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['过期', '重复', '异常', '手动'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [3, 5, 2, 1], itemStyle: { color: '#3b82f6' } }]
  }
  chart.setOption(option)
  window.addEventListener('resize', () => chart.resize())
  return () => {
    window.removeEventListener('resize', () => chart.resize())
    chart.dispose()
  }
}

// 删除旧的对比柱状图，改为雷达+箱线图

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
        type: 'pie',
        radius: ['40%', '70%'],
        data: [
          { name: '价格异常', value: 28 },
          { name: '物流延迟', value: 18 },
          { name: '属地集中', value: 12 }
        ]
      }
    ]
  }
  chart.setOption(option)
  chart.on('click', (p: any) => {
    const t = String(p?.name || '').trim()
    if (t)
      router.push({
        path: '/rating-profile/标签管理/标签企业列表',
        query: { tag: t }
      })
  })
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
  chart.on('click', (p: any) => {
    const t = String(p?.seriesName || '').trim()
    if (t) router.push({ name: '标签企业列表', query: { tag: t } })
  })
  window.addEventListener('resize', () => chart.resize())
  return () => {
    window.removeEventListener('resize', () => chart.resize())
    chart.dispose()
  }
}

const companyScoresBase = ref([
  { category: 'A类', class: '两用物项', score: 88 },
  { category: 'B类', class: '两用物项', score: 80 },
  { category: 'C类', class: '两用物项', score: 74 },
  { category: 'D类', class: '两用物项', score: 70 },
  { category: 'E类', class: '两用物项', score: 66 }
])
const companyScoresView = computed(() => {
  const cats = new Set(categoryNamesByK(checkedKSingle.value))
  return companyScoresBase.value.filter((r) => cats.has(r.category))
})
const tunedRows = ref<any[]>([])
const loadTunedRows = async (modelId: number) => {
  try {
    const resp: any = await getDualUseItemsTuned({ modelId, page: 0, size: size.value })
    const list: any[] = Array.isArray(resp?.rows) ? resp.rows : Array.isArray(resp) ? resp : []
    tunedRows.value = list
  } catch {
    tunedRows.value = []
  }
}
const categoryRows = computed(() => {
  if (!categoryView.value || !selectedCategory.value) return []
  if (currentModelId.value && tunedRows.value.length) {
    return tunedRows.value.filter((r: any) => {
      const meta = (r as any).tuned_meta || {}
      return String((meta as any).category_tag || '') === selectedCategory.value
    })
  }
  const k = checkedKSingle.value
  const cats = categoryNamesByK(k)
  const computeCategory = (r: any) => {
    const id = Number((r as any).item_id)
    const seed = Number.isFinite(id) ? id : hash(String((r as any)['Consignee Enterprise'] || ''))
    const idx = Math.abs(seed) % k
    return cats[idx]
  }
  return (filteredRows.value as any[]).filter((r) => computeCategory(r) === selectedCategory.value)
})

const tagOptions = ref<string[]>([])
const tagAssignments = reactive<Record<string, string[]>>({})

const tagRows = ref<{ name: string; feature: string; slice: string; expert?: string }[]>([])
const refreshTagRows = () => {
  let names = selectedEnterprises.value.length ? selectedEnterprises.value : []
  if (!names.length) {
    names = Array.from(
      new Set(
        (filteredRows.value as any[])
          .map((r: any) =>
            String(
              (r as any)['Consignee Enterprise'] ?? (r as any).etps_name ?? (r as any).name ?? ''
            )
          )
          .filter((s: string) => !!s)
      )
    )
    selectedEnterprises.value = names
  }
  if (!names.length) {
    notifyError('后端无数据或未联通')
    return
  }
  const feats = checkedFeatures.value.length
    ? checkedFeatures.value.slice(0, 3)
    : ['价格指纹', '物流指纹', '属地指纹']
  tagRows.value = names.map((n, i) => ({
    name: n,
    feature: feats[i % feats.length],
    slice: ['北京', '上海', '深圳', '天津'][i % 4]
  }))
}
const finished = ref(false)
const updatedScores = ref<any[]>([])
const reset = () => {
  filterKeyword.value = ''
  checkedFeatures.value = [...featuresSorted.value]
  checkedKSingle.value = 2
}
const finish = () => {
  if (!filteredRows.value.length) {
    notifyError('后端无数据或未联通')
    return
  }
  updatedScores.value = filteredRows.value.slice(0, 10).map((r: any, i: number) => ({
    name: r.etps_name || r.name || `企业-${i + 1}`,
    ratingDetail: '数据来源：后端',
    score: Number((80 + Math.random() * 10).toFixed(0))
  }))
  setTimeout(async () => {
    try {
      if (currentModelId.value) {
        const k = checkedKSingle.value
        const cats = categoryNamesByK(k)
        const computeCategory = (r: any) => {
          const id = Number((r as any).item_id)
          const seed = Number.isFinite(id)
            ? id
            : hash(String((r as any)['Consignee Enterprise'] || ''))
          const idx = Math.abs(seed) % k
          return cats[idx]
        }
        const rowsAll = filteredRows.value as any[]
        for (const r of rowsAll) {
          const cat = computeCategory(r)
          const itemId = Number((r as any).item_id)
          if (!Number.isFinite(itemId)) continue
          await updateDualUseItemTunedTag(itemId, {
            modelId: currentModelId.value,
            key: 'category_tag',
            value: cat
          })
          const labels = (tagAssignments as any)[cat] || []
          await updateDualUseItemTunedTag(itemId, {
            modelId: currentModelId.value,
            key: 'category_labels',
            value: labels
          })
          const name = String(
            (r as any)['Consignee Enterprise'] ?? (r as any).etps_name ?? (r as any).name ?? ''
          )
          if (name && labels.length) {
            await updateEnterpriseTags({ name, tags: labels, source: 'manual' }).catch(() => null)
          }
        }
        await loadTunedRows(currentModelId.value)
        notifySuccess('标签写入成功', `已写入 ${rowsAll.length} 条`)
      }
    } catch {
      /* ignore */
    }
  }, 0)
  finished.value = true
}

const finishAndGoVisual = async () => {
  const reqCats = categoryNamesByK(checkedKSingle.value)
  const missing = reqCats.filter(
    (c) => !Array.isArray(tagAssignments[c]) || !(tagAssignments[c] || []).length
  )
  if (missing.length) {
    notifyWarn('标签未完成', `请为以下类别配置标签：${missing.join('、')}`)
    return
  }
  if (!finished.value) await Promise.resolve(finish())
  const v = versionOf(active.value)
  setVersionSteps(v)
  goStep(4)
}

const backToTopic = () => {
  active.value = 'topic'
}

let disposers: (() => void)[] = []
const mountCharts = async () => {
  disposers.forEach((d) => d())
  disposers = []
  if (active.value === 'dualuse') {
    const d1 = await renderDist()
    if (d1) disposers.push(d1)
    const d2 = renderHistory()
    if (d2) disposers.push(d2)
    const d3 = renderBox()
    if (d3) disposers.push(d3)
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
  } else if (active.value === 'topic') {
    const p = renderABCPie()
    if (p) disposers.push(p)
    const r = renderRadar()
    if (r) disposers.push(r)
    const b = renderVisualBox()
    if (b) disposers.push(b)
  } else if (active.value.endsWith('enable')) {
    const d = renderEnable()
    if (d) disposers.push(d)
  } else if (active.value.endsWith('disable')) {
    const d = renderDisable()
    if (d) disposers.push(d)
  } else if (active.value.endsWith('delete')) {
    const d = renderDelete()
    if (d) disposers.push(d)
  }
}

onMounted(async () => {
  await loadEtps()
  await fetchAllData()
  try {
    const t: any = await getTags()
    const list = Array.isArray(t?.rows) ? t.rows : []
    tagOptions.value = list
      .map((x: any) => String(x?.name || ''))
      .filter((s: string) => s && s.length)
  } catch {
    tagOptions.value = []
  }
  if (!selectedEnterprises.value.length && (rows.length || (filteredRows.value as any[]).length)) {
    const src = rows.length ? rows : (filteredRows.value as any[])
    const names = Array.from(
      new Set(
        src
          .map((r: any) =>
            String(
              (r as any)['Consignee Enterprise'] ?? (r as any).etps_name ?? (r as any).name ?? ''
            )
          )
          .filter((s: string) => !!s)
      )
    )
    selectedEnterprises.value = names
  }
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
  ;(window as any)._tuningResize = onResize
  ;(window as any)._tuningScroll = onScroll
})
watch(active, () => {
  if (active.value.includes('-')) {
    setVersionSteps(versionOf(active.value))
  }
  if (active.value.endsWith('class')) {
    // 分类数勾选在 checkedK 中维护，无需生成旧的 classBoxes
  }
  if (active.value.endsWith('tag')) {
    refreshTagRows()
  }
  setTimeout(mountCharts, 0)
})
watch(checkedKSingle, () => {
  if (active.value.endsWith('class') || active.value.endsWith('visual') || active.value === 'topic')
    setTimeout(mountCharts, 0)
})
watch(checkedFeatures, () => {
  if (active.value.endsWith('feature')) setTimeout(mountCharts, 0)
})
watch(distChartType, () => {
  if (active.value === 'dualuse') setTimeout(mountCharts, 0)
})
watch(boxMetric, () => {
  if (active.value.endsWith('visual') || active.value === 'topic') {
    setTimeout(mountCharts, 0)
  }
})
onUnmounted(() => {
  disposers.forEach((d) => d())
  const r = (window as any)._tuningResize
  const s = (window as any)._tuningScroll
  if (r) window.removeEventListener('resize', r)
  if (s) window.removeEventListener('scroll', s as any)
})
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
.v-title {
  cursor: pointer;
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
  min-height: calc(100vh - 96px);
  max-width: 100%;
  overflow-x: hidden;
}
.filter-card {
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  min-height: calc(100vh - 96px - 24px);
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
  box-sizing: border-box;
}
.title {
  font-weight: 600;
  margin-bottom: 8px;
}
.chart {
  height: 320px;
}
.visual-bottom .chart {
  height: 420px;
}
.visual-wrap .chart {
  height: 360px;
}
.btns {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
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
.importance-chart .chart {
  height: 630px;
  width: 950px;
}
.feature-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 6px 8px;
}
.feature-item:hover {
  background: rgba(59, 130, 246, 0.06);
  border-radius: 6px;
  cursor: pointer;
}
.fname-btn {
  display: inline-block;
  color: var(--text-primary);
  border: 1px solid #93c5fd;
  border-radius: 6px;
  padding: 4px 12px;
  background: #e5f0ff;
  text-align: center;
  min-width: 120px;
}
.feature-detail {
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 8px;
  margin-top: 12px;
  min-height: 360px;
  overflow: auto;
}
.detail-values {
  display: flex;
  align-items: center;
  gap: 12px;
}
.visual-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: start;
  gap: 16px;
}
.visual-bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}
.chart-box {
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
}
.chart-box .chart {
  margin-top: 8px;
}
.box-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
.table-wrap {
  flex: 1;
}
.table-scroll {
  overflow-x: auto;
  width: 100%;
}
.table-scroll :deep(.el-table) {
  min-width: 1200px;
}
.table-wrap :deep(.el-table .cell) {
  padding: 3px 6px;
  line-height: 1.25;
}
.company-table :deep(.el-table__header th) {
  background: var(--main-bg);
  font-weight: 600;
}
.company-table :deep(.el-table .cell) {
  padding: 8px 10px;
  font-size: 14px;
}
.company-table :deep(.el-table__body tr:hover > td) {
  background: rgba(59, 130, 246, 0.06);
}
.table-wrap :deep(.el-table th .cell) {
  padding: 3px 6px;
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
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
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
.col-top {
  font-weight: 600;
}
.col-actions {
  display: flex;
  gap: 6px;
}
.col-btn {
  width: 26px;
  height: 26px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--main-bg);
  color: var(--text-primary);
  font-size: 12px;
  line-height: 24px;
  text-align: center;
  cursor: pointer;
}
.col-btn.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.caret-icons {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 2px;
}
.caret-icon {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  cursor: pointer;
}
.caret-icon.up {
  border-bottom: 8px solid #9ca3af;
  margin-bottom: 2px;
}
.caret-icon.down {
  border-top: 8px solid #9ca3af;
}
.caret-icon:hover {
  filter: brightness(1.1);
}
.table-wrap :deep(.caret-wrapper) {
  display: none !important;
}
.table-wrap :deep(.el-table__header th.col-active-sort) {
  background: rgba(59, 130, 246, 0.2) !important;
}
.table-wrap :deep(.el-table__body td.col-active-sort) {
  background: rgba(59, 130, 246, 0.08);
}
.filter-icon {
  cursor: pointer;
}
.table-wrap :deep(.el-table) {
  font-size: 13px;
}
.table-wrap :deep(.el-table__header th),
.table-wrap :deep(.el-table__body td) {
  border-right: 1px solid var(--border-color);
}
.table-wrap :deep(.el-table__header th:last-child),
.table-wrap :deep(.el-table__body td:last-child) {
  border-right: none;
}
.cell-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
}
.spacer {
  flex: 1;
}
.k-select-row {
  display: grid;
  grid-template-rows: auto;
  gap: 6px;
  justify-items: stretch;
  margin-top: 8px;
}
.k-checkboxes {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.tag-layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  gap: 12px;
  margin-top: 12px;
}
.shap-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
/* 放大对比区图表高度并横向填充 */
.tag-card .shap-compare .chart {
  height: 440px;
  width: 100%;
}
.category-view {
  margin-top: 12px;
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
}
.cat-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.cat-tip {
  color: var(--text-secondary);
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
