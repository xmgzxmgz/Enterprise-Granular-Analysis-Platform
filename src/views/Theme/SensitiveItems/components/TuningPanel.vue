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
            <template #title
              ><span class="v-title" @click="enableVersion('v1')"
                >V1</span
              ></template
            >
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
            <template #title
              ><span class="v-title" @click="enableVersion('v5')"
                >V5</span
              ></template
            >
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
            <template #title
              ><span class="v-title" @click="enableVersion('v2')"
                >V2</span
              ></template
            >
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
            <template #title
              ><span class="v-title" @click="enableVersion('v3')"
                >V3</span
              ></template
            >
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
            <template #title
              ><span class="v-title" @click="enableVersion('v4')"
                >V4</span
              ></template
            >
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
        <div class="title">主题视角</div>
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
                <el-option
                  v-for="f in features"
                  :key="f.name"
                  :label="f.name"
                  :value="f.name"
                />
              </el-select>
            </div>
            <div ref="visualBoxRef" class="chart" />
          </div>
          <div class="table-wrap">
            <el-table :data="companyScores" height="300">
              <el-table-column prop="category" label="类别" width="160" />
              <el-table-column prop="class" label="分类" width="120" />
              <el-table-column prop="rating" label="评级" width="120" />
              <el-table-column prop="score" label="评分" width="120" />
            </el-table>
          </div>
        </div>
        <div
          class="footer footer-fixed"
          :style="{ width: toolbarWidth + 'px' }"
        >
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
          <div class="tools-fixed">
            <el-input
              v-model="filterKeyword"
              placeholder="搜索企业/字段"
              size="small"
              clearable
              style="width: 360px"
            ></el-input>
            <el-button size="small" type="primary" @click="openFieldFilter"
              >字段筛选</el-button
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
              sortable
            >
              <template #header>
                <div class="col-header">
                  <span>{{ col.label }}</span>
                  <el-icon
                    class="filter-icon"
                    @click.stop="openColFilter(col.key)"
                  >
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
                      ? scope.row[col.key].join(",")
                      : String(scope.row[col.key] ?? "")
                  }}
                </div>
              </template>
            </el-table-column>
          </el-table>
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
              maxHeight: colDialogMaxHeight + 'px',
            }"
          >
            <el-checkbox-group v-model="colCheckedValues[colDialogKey]">
              <el-checkbox
                v-for="opt in colDialogOptionsSorted"
                :key="opt"
                :label="opt"
                >{{ opt }}</el-checkbox
              >
            </el-checkbox-group>
          </div>
          <template #footer>
            <div class="field-actions">
              <el-button @click="resetColFilter(colDialogKey)">重置</el-button>
              <el-button @click="selectAllColFilter(colDialogKey)"
                >全选</el-button
              >
              <el-button @click="invertColFilter(colDialogKey)">反选</el-button>
              <el-button type="primary" @click="confirmColFilter(colDialogKey)"
                >确认</el-button
              >
            </div>
          </template>
        </el-dialog>
        <el-dialog
          v-model="fieldFilterVisible"
          title="字段筛选"
          width="560px"
          align-center
        >
          <div class="field-grid">
            <el-checkbox-group v-model="checkedColumns">
              <el-checkbox
                v-for="c in allColumns"
                :key="c.key"
                :label="c.key"
                >{{ c.label }}</el-checkbox
              >
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
        <div
          class="footer footer-fixed floating-footer"
          :style="footerFixedStyle"
        >
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
                v-for="f in featuresSorted"
                :key="f.name"
                class="feature-item"
              >
                <el-checkbox :label="f.name" />
                <span class="fname-btn" @click="openFeature(f)">{{
                  f.name
                }}</span>
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
        <div
          class="footer footer-fixed floating-footer"
          :style="footerFixedStyle"
        >
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
        <div class="k-select-row">
          <el-checkbox-group v-model="checkedK" class="k-checkboxes">
            <el-checkbox v-for="k in kOptions" :key="'chk-' + k" :label="k" />
          </el-checkbox-group>
        </div>
        <div
          class="footer footer-fixed floating-footer"
          :style="footerFixedStyle"
        >
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
          <div class="chart-box">
            <div ref="abcPieRef" class="chart" />
          </div>
          <div class="chart-box">
            <div class="table-wrap">
              <el-table
                :data="companyScores"
                class="company-table"
                height="420"
                border
                stripe
              >
                <el-table-column prop="category" label="类别" width="160" />
                <el-table-column prop="class" label="分类" width="120" />
                <el-table-column prop="rating" label="评级" width="120" />
                <el-table-column prop="score" label="评分" width="120" />
                <el-table-column label="操作" width="140">
                  <template #default="{ row }">
                    <el-button size="small" @click="browseAll(row.category)"
                      >全数据浏览</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
        <div class="visual-bottom">
          <div class="chart-box">
            <div class="chart" ref="radarRef" />
          </div>
          <div class="chart-box">
            <div class="box-toolbar">
              <el-select
                v-model="boxMetric"
                placeholder="选择指标"
                size="small"
                style="width: 200px"
              >
                <el-option
                  v-for="f in features"
                  :key="f.name"
                  :label="f.name"
                  :value="f.name"
                />
              </el-select>
            </div>
            <div ref="visualBoxRef" class="chart" />
          </div>
        </div>
        <div
          class="footer footer-fixed floating-footer"
          :style="footerFixedStyle"
        >
          <el-button @click="reset">重置</el-button>
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="nextStep">下一步</el-button>
        </div>
      </div>

      <div
        v-else
        class="card tag-card"
        :style="{ width: toolbarWidth + frameOffset + 'px' }"
      >
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
        <div
          class="footer footer-fixed floating-footer"
          :style="footerFixedStyle"
        >
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
          <div
            class="footer footer-fixed floating-footer"
            :style="footerFixedStyle"
          >
            <el-button>取消</el-button>
            <el-button type="primary">详细结果浏览</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch, computed } from "vue";
import * as echarts from "echarts";
import { useRouter } from "vue-router";
import { getTagDistribution, getEtpsData } from "@/services/api";
import { ElMessage } from "element-plus";

const router = useRouter();
const active = ref("topic");
const defaultOpeneds = ref(["params", "v1", "v2", "v3", "v4", "v5"]);
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
const browseAll = (category: string) => {
  router.push({ name: "企业基本信息", query: { category } });
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
const abcPieRef = ref<HTMLDivElement | null>(null);
const visualBoxRef = ref<HTMLDivElement | null>(null);
const enableRef = ref<HTMLDivElement | null>(null);
const disableRef = ref<HTMLDivElement | null>(null);
const deleteRef = ref<HTMLDivElement | null>(null);
const topicPieRef = ref<HTMLDivElement | null>(null);
const topicTrendRef = ref<HTMLDivElement | null>(null);

const rightContentRef = ref<HTMLDivElement | null>(null);
const toolbarWidth = ref<number>(0);
const updateToolbarWidth = () => {
  const w = rightContentRef.value?.clientWidth ?? 0;
  toolbarWidth.value = w > 0 ? w : 0;
};
const frameOffset = ref<number>(-12);
const filterCardRef = ref<HTMLDivElement | null>(null);
const footerFixedStyle = ref<Record<string, string>>({});
const updateFloatingFooter = () => {
  const rect = filterCardRef.value?.getBoundingClientRect();
  const left =
    rect?.left ?? rightContentRef.value?.getBoundingClientRect()?.left ?? 0;
  const width = toolbarWidth.value + frameOffset.value;
  footerFixedStyle.value = {
    left: `${Math.max(0, Math.round(left))}px`,
    width: `${Math.max(0, Math.round(width))}px`,
  };
};

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
    router.push({ name: "企业基本信息", query: { category: cat } });
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
const rows = reactive<Record<string, any>[]>([]);
const filteredRows = ref(rows);
const columnFilterVisible = reactive<Record<string, boolean>>({});
const colCheckedValues = reactive<Record<string, string[]>>({});
const colFilterOptions = reactive<Record<string, string[]>>({});
const columnFilterDialogVisible = ref(false);
const colDialogKey = ref<string>("");
const colDialogTitle = computed(() => {
  const key = colDialogKey.value;
  const label = allColumns.value.find((c) => c.key === key)?.label || key;
  return `字段筛选 - ${label}`;
});
const colDialogSearch = ref("");
const colDialogOptionsSorted = computed(() => {
  const key = colDialogKey.value;
  const opts = colFilterOptions[key] || [];
  const q = colDialogSearch.value.trim().toLowerCase();
  const filtered = q
    ? opts.filter((o) => String(o).toLowerCase().includes(q))
    : opts;
  return [...filtered].sort(
    (a, b) =>
      String(a).length - String(b).length || String(a).localeCompare(String(b))
  );
});
const colDialogCols = computed(() => {
  const n = colDialogOptionsSorted.value.length;
  return n > 160 ? 6 : n > 100 ? 5 : n > 60 ? 4 : n > 36 ? 3 : n > 18 ? 2 : 1;
});
const colDialogWidth = computed(() => {
  const maxW = Math.max(320, toolbarWidth.value + frameOffset.value - 24);
  const base = 560;
  const perCol = 220;
  const w = base + perCol * (colDialogCols.value - 1);
  return Math.min(Math.max(base, w), maxW);
});
const colDialogMaxHeight = computed(() => {
  const vh = window.innerHeight || 800;
  return Math.max(360, Math.floor(vh - 220));
});
const tableRows = computed(() => {
  const base = filteredRows.value as any[];
  const keys = Object.keys(colCheckedValues).filter(
    (k) => (colCheckedValues[k] || []).length
  );
  if (!keys.length) return base;
  return base.filter((r) => {
    for (const k of keys) {
      const sel = colCheckedValues[k];
      const val = Array.isArray((r as any)[k])
        ? (r as any)[k].map((x: any) => String(x ?? ""))
        : [String((r as any)[k] ?? "")];
      if (!val.some((v: string) => sel.includes(v))) return false;
    }
    return true;
  });
});
const openColFilter = (key: string) => {
  const set = new Set<string>();
  for (const r of filteredRows.value) {
    const v = (r as any)[key];
    if (Array.isArray(v)) v.forEach((x) => set.add(String(x ?? "")));
    else set.add(String(v ?? ""));
  }
  colFilterOptions[key] = Array.from(set)
    .filter((s) => s !== "")
    .sort();
  colDialogKey.value = key;
  columnFilterDialogVisible.value = true;
  if (!colCheckedValues[key]) colCheckedValues[key] = [];
};
const resetColFilter = (key: string) => {
  colCheckedValues[key] = [];
  columnFilterDialogVisible.value = false;
};
const confirmColFilter = (key: string) => {
  columnFilterDialogVisible.value = false;
};
const selectAllColFilter = (key: string) => {
  colCheckedValues[key] = [...(colFilterOptions[key] || [])];
};
const invertColFilter = (key: string) => {
  const opts = new Set(colFilterOptions[key] || []);
  const sel = new Set(colCheckedValues[key] || []);
  colCheckedValues[key] = Array.from(opts).filter((o) => !sel.has(o));
};
const selectedEnterprises = ref<string[]>([]);
const onSelectionChange = (sel: any[]) => {
  selectedEnterprises.value = Array.from(new Set(sel.map((r) => r.etps_name)));
  generateAggStats();
};
const toBasic = (row: any) => {
  const name = row?.etps_name;
  if (!name) return;
  router.push({ name: "企业基本信息", query: { focusName: name } });
};
// 后端数据接入
const page = ref(0);
const size = ref(20);
const total = ref(0);
const loadEtps = async () => {
  const q = filterKeyword.value.trim();
  try {
    const resp = await getEtpsData({ q, page: page.value, size: size.value });
    const list: any[] = resp?.rows || resp || [];
    rows.splice(0, rows.length, ...list);
    filteredRows.value = rows;
    total.value = Number(resp?.total || list.length || 0);
    checkedColumns.value = orderKeys(
      allColumns.value.map((c: ColumnDef) => c.key)
    );
    ElMessage.success("获取企业信息成功");
  } catch (e) {
    filteredRows.value = [] as any;
    ElMessage.error("后端无数据或未联通");
  }
};
watch(filterKeyword, () => {
  loadEtps();
});

// 字段列管理与筛选
type ColumnDef = { key: string; label: string };
const baseColumns: ColumnDef[] = [
  { key: "etps_name", label: "企业名称" },
  { key: "industry_phy_name", label: "行业门类" },
  { key: "industry_code_name", label: "行业细分" },
  { key: "area_id", label: "区域代码" },
  { key: "aeo_rating", label: "AEO等级" },
  { key: "total_decl_amt", label: "申报金额" },
  { key: "total_entry_cnt", label: "申报票数" },
  { key: "avg_ticket_val", label: "平均票值" },
  { key: "delay_rate", label: "延误率" },
  { key: "common_busi", label: "业务概述" },
];
const preferredOrder = [
  "id",
  "etps_name",
  "industry_phy_name",
  "industry_code_name",
  "area_id",
  "exist_status",
  "common_busi",
  "import_ratio",
  "main_ciq_codes",
  "main_parent_ciq",
  "top_trade_countries",
  "transport_mode",
  "total_decl_amt",
  "total_entry_cnt",
  "avg_ticket_val",
  "aeo_rating",
  "delay_rate",
];
const allColumns = computed<ColumnDef[]>(() => {
  const keys = new Set(baseColumns.map((c) => c.key));
  for (const r of filteredRows.value) {
    Object.keys(r).forEach((k) => keys.add(k));
  }
  return Array.from(keys).map((k) => ({
    key: k,
    label:
      baseColumns.find((b) => b.key === k)?.label ||
      (
        {
          exist_status: "存在状态",
          import_ratio: "进口比率",
          main_ciq_codes: "主要检验检疫代码",
          main_parent_ciq: "主要上级检验检疫",
          top_trade_countries: "主要贸易国家",
          transport_mode: "运输方式",
        } as Record<string, string>
      )[k] ||
      k,
  }));
});
const checkedColumns = ref<string[]>([]);
const orderKeys = (keys: string[]) => {
  const set = new Set(keys);
  const head = preferredOrder.filter((k) => set.has(k));
  const tail = keys.filter((k) => !head.includes(k)).sort();
  return [...head, ...tail];
};
const visibleColumns = computed(() => {
  const pool = allColumns.value.filter((c) =>
    checkedColumns.value.includes(c.key)
  );
  const order = new Map(
    orderKeys(pool.map((c) => c.key)).map((k, i) => [k, i])
  );
  return [...pool].sort((a, b) => order.get(a.key)! - order.get(b.key)!);
});
const colWidth = (key: string) => {
  const getLen = (v: any) => {
    if (v === null || v === undefined) return 0;
    const s = Array.isArray(v) ? v.join(",") : String(v);
    return s.length;
  };
  let maxLen = getLen(baseColumns.find((b) => b.key === key)?.label || key);
  for (const r of filteredRows.value) {
    maxLen = Math.max(maxLen, getLen((r as any)[key]));
  }
  const charW = 10;
  const units = Math.max(5, Math.min(Math.ceil(maxLen) + 2, 26));
  return units * charW;
};
const fieldFilterVisible = ref(false);
const openFieldFilter = () => (fieldFilterVisible.value = true);
const resetColumns = () =>
  (checkedColumns.value = orderKeys(baseColumns.map((c) => c.key)));
const selectAllColumns = () =>
  (checkedColumns.value = orderKeys(
    allColumns.value.map((c: ColumnDef) => c.key)
  ));
const invertColumns = () => {
  const all = new Set<string>(allColumns.value.map((c: ColumnDef) => c.key));
  const cur = new Set<string>(checkedColumns.value);
  checkedColumns.value = Array.from(all).filter((k: string) => !cur.has(k));
};
const confirmColumns = () => (fieldFilterVisible.value = false);

onMounted(() => {
  loadEtps();
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
const featuresSorted = computed(() => {
  return [...features].sort(
    (a, b) =>
      String(b.name).length - String(a.name).length ||
      String(a.name).localeCompare(String(b.name))
  );
});
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

const kOptions = [1, 2, 3, 4, 5];
const checkedK = ref<number[]>([1, 2, 3, 4, 5]);
const renderClass = () => {
  if (!classRef.value) return;
  const chart = echarts.init(classRef.value);
  const ks = [1, 2, 3, 4, 5];
  const base = [0.72, 0.78, 0.83, 0.81, 0.76];
  const factor = 1 + Math.min(checkedK.value.length, 5) * 0.02;
  const scores = base.map((v) => Number((v * factor).toFixed(3)));
  const option = {
    title: { text: "分类数量与评分(1-5)", left: "center" },
    grid: { left: 50, right: 20, top: 50, bottom: 40 },
    xAxis: { type: "category", name: "分类数", data: ks },
    yAxis: { type: "value", name: "评分", min: 0.5, max: 1.0 },
    series: [
      {
        name: "Score",
        type: "line",
        data: scores,
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
  const feats = checkedFeatures.value.length
    ? checkedFeatures.value
    : features.slice(0, 6).map((f) => f.name);
  const indicators = feats.map((n) => ({ name: n, max: 100 }));
  const makeVals = (seed: number) =>
    indicators.map((_, i) =>
      Math.max(30, Math.min(95, Math.round(60 + 15 * Math.sin(seed + i))))
    );
  const option = {
    title: { text: "ABC类企业指标雷达图", left: "center", top: 8 },
    legend: { data: ["A类", "B类", "C类"], top: 40 },
    radar: {
      indicator: indicators,
      top: 80,
      center: ["50%", "55%"],
      radius: "70%",
    },
    series: [
      {
        type: "radar",
        data: [
          { name: "A类", value: makeVals(1) },
          { name: "B类", value: makeVals(2) },
          { name: "C类", value: makeVals(3) },
        ],
      },
    ],
    tooltip: { trigger: "item" },
  };
  chart.setOption(option);
  const onResize = () => chart.resize();
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
    chart.dispose();
  };
};

const boxMetric = ref<string>("");
const renderVisualBox = () => {
  if (!visualBoxRef.value) return;
  const chart = echarts.init(visualBoxRef.value);
  const metric = boxMetric.value || "指标";
  const seed = Array.from(metric).reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const mk = (base: number) => {
    const r = (seed % 11) - 5; // -5..5
    const arr = [
      base - 15 + r,
      base - 5 + r,
      base + r,
      base + 10 + r,
      base + 20 + r,
    ];
    return [Math.max(0, arr[0]), Math.max(0, arr[1]), arr[2], arr[3], arr[4]];
  };
  const option = {
    title: { text: `箱线图：${metric}`, left: "center", top: 8 },
    tooltip: { trigger: "item" },
    legend: { data: ["A类", "B类", "C类"], top: 40 },
    grid: { top: 72, left: 40, right: 20, bottom: 40 },
    xAxis: { type: "category", data: ["A类", "B类", "C类"] },
    yAxis: { type: "value" },
    series: [
      { name: "A类", type: "boxplot", data: [mk(50)] },
      { name: "B类", type: "boxplot", data: [mk(60)] },
      { name: "C类", type: "boxplot", data: [mk(70)] },
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

const renderABCPie = () => {
  if (!abcPieRef.value) return;
  const chart = echarts.init(abcPieRef.value);
  const dist = { A: 40, B: 35, C: 25 } as Record<string, number>;
  const total = dist.A + dist.B + dist.C;
  const data = [
    { name: "A类", value: dist.A },
    { name: "B类", value: dist.B },
    { name: "C类", value: dist.C },
  ];
  const option = {
    title: { text: "ABC类别占比（饼图）", left: "center" },
    tooltip: {
      trigger: "item",
      formatter: (p: any) =>
        `${p.name}: ${p.value} (${Math.round((p.value / total) * 100)}%)`,
    },
    series: [{ type: "pie", radius: ["40%", "70%"], data }],
  };
  chart.setOption(option);
  const onResize = () => chart.resize();
  window.addEventListener("resize", onResize);
  return () => {
    window.removeEventListener("resize", onResize);
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

// 删除旧的对比柱状图，改为雷达+箱线图

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
    if (t) router.push({ name: "标签企业列表", query: { tag: t } });
  });
  window.addEventListener("resize", () => chart.resize());
  return () => {
    window.removeEventListener("resize", () => chart.resize());
    chart.dispose();
  };
};

const companyScores = ref([
  { category: "A类", class: "两用物项", rating: "A级", score: 88 },
  { category: "B类", class: "两用物项", rating: "B级", score: 80 },
  { category: "C类", class: "两用物项", rating: "C级", score: 74 },
]);

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
  checkedK.value = [1, 2, 3, 4, 5];
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
    const p = renderABCPie();
    if (p) disposers.push(p);
    const r = renderRadar();
    if (r) disposers.push(r);
    const b = renderVisualBox();
    if (b) disposers.push(b);
  } else if (active.value === "topic") {
    const p = renderABCPie();
    if (p) disposers.push(p);
    const r = renderRadar();
    if (r) disposers.push(r);
    const b = renderVisualBox();
    if (b) disposers.push(b);
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

onMounted(async () => {
  await loadEtps();
  boxMetric.value = features[0]?.name || "";
  mountCharts();
  updateToolbarWidth();
  updateFloatingFooter();
  const onResize = () => {
    updateToolbarWidth();
    updateFloatingFooter();
  };
  const onScroll = () => updateFloatingFooter();
  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", onScroll, { passive: true });
  (window as any)._tuningResize = onResize;
  (window as any)._tuningScroll = onScroll;
});
watch(active, () => {
  if (active.value.includes("-")) {
    setVersionSteps(versionOf(active.value));
  }
  if (active.value.endsWith("class")) {
    // 分类数勾选在 checkedK 中维护，无需生成旧的 classBoxes
  }
  if (active.value.endsWith("tag")) {
    refreshTagRows();
  }
  setTimeout(mountCharts, 0);
});
watch(checkedK, () => {
  if (active.value.endsWith("class")) setTimeout(mountCharts, 0);
});
watch(distChartType, () => {
  if (active.value === "dualuse") setTimeout(mountCharts, 0);
});
watch(boxMetric, () => {
  if (active.value.endsWith("visual") || active.value === "topic") {
    setTimeout(mountCharts, 0);
  }
});
onUnmounted(() => {
  disposers.forEach((d) => d());
  const r = (window as any)._tuningResize;
  const s = (window as any)._tuningScroll;
  if (r) window.removeEventListener("resize", r);
  if (s) window.removeEventListener("scroll", s as any);
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
