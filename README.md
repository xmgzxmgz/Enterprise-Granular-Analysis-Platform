# EGAP 企业颗粒度分析平台（前端）

> Enterprise Granular Analysis Platform Frontend

## 项目介绍

- 核心功能与价值定位
  - 提供企业分类主题管理与评级画像的统一工作台：面包屑导航、全局搜索、响应式布局、自动亮度切换。
  - 敏感物品与两用物项的建模/调优/发布全链路可视化，含压力测试与训练曲线。
  - 以技术蓝色系主题打造现代化数据分析体验，首页支持苹果风入场动画强化产品识别度。
- 适用用户与场景
  - 风险控制分析师、业务运营、数据工程师、监管与研究人员。
  - 企业出口风险分类研判、标签画像分析、算法建模与调优演示、主题管理配置与展示。
- 技术栈与主要依赖
  - 框架：Vue 3 + TypeScript + Vite
  - 组件：Element Plus（UI）、Vue Router（路由）、ECharts（图表）、Vue Flow（流程图）
  - 版本参考（见 `package.json`）：Vue ^3.5.0、Element Plus ^2.8.4、ECharts ^5.5.0、Vue Router ^4.4.0、Vite ^5.4.0

## 使用指南

- 环境要求

  - Node.js >= 18，npm >= 9
  - macOS（本项目开发环境）

- 安装与启动

  ```bash
  # 安装依赖
  npm install

  # 开发启动（默认端口 5173）
  npm run dev

  # 类型检查
  npm run typecheck

  # 生产构建
  npm run build

  # 本地预览
  npm run preview
  ```

- 项目结构（关键目录）

  ```text
  src/
    components/         # 通用组件（SidebarMenu、AppHeader、HeroAnimation 等）
    layouts/            # 布局（MainLayout）
    router/             # 路由配置
    views/              # 页面视图（Theme、Rating、Home 等）
    styles/             # 全局主题与样式
    composables/        # 组合式函数（useAutoTheme 等）
  ```

- 路由与页面

  - 首页：`/home`
  - 分类主题管理：`/theme-management`
    - 企业出口风险分类/敏感物品管控/两用物项：`/theme-management/出口风险分类/敏感物品管控/两用物项`
  - 企业分类评级画像：`/rating-profile`
    - 基本信息：`/rating-profile/基本信息`
    - 标签管理/标签列表：`/rating-profile/标签管理/标签列表`
    - 标签管理/切面分析：`/rating-profile/标签管理/切面分析`

- 全局搜索与导航

  - 全局搜索框位于面包屑正下方，支持回车跳转到匹配页面。
  - 面包屑基于 `route.matched` 生成，可点击任意级返回对应页面；超长时单行省略。
  - 侧边栏顶部提供“返回主页面”按钮，一键回到 `/home`。

- 主题与亮度

  - 自动亮度切换：根据系统偏好与时间段自动设置浅/深色（`useAutoTheme`）。
  - 蓝色科技主题：统一色板与阴影，保证观感一致。

- 图表与流程
  - ECharts：压力测试（QPS/耗时）、训练曲线（AUC/损失）等图表，随窗口变化自动自适应。
  - Vue Flow：用于建模流程图的渲染与交互。

### API 文档与使用示例（前端接口）

- 组合式函数：`useAutoTheme`

  ```ts
  import { useAutoTheme } from "@/composables/useAutoTheme";
  // 在应用入口初始化，自动根据系统与时段切换主题
  useAutoTheme();
  ```

- 搜索与导航交互

  ```vue
  <!-- AppHeader 中的搜索框支持回车触发页面跳转或聚合搜索逻辑 -->
  <el-input v-model="keyword" @keyup.enter="onSearch" />
  ```

- 路由懒加载示例
  ```ts
  const routes = [
    { path: "/home", component: () => import("@/views/Home.vue") },
    {
      path: "/rating-profile/基本信息",
      component: () => import("@/views/Rating/BasicInfo.vue"),
    },
  ];
  ```

### 常见问题与故障排除

- 面包屑显示重复或乱码
  - 使用 `route.matched` 生成链路并避免重复拼接 `meta.breadcrumb`；必要时使用 `decodeURIComponent` 处理中文路径。
- 搜索框错位或尺寸不协调
  - 保证搜索容器与面包屑处于同一左侧列，采用纵向堆叠并设置 `width: 100%`。
- 图表在窗口缩放后不自适应
  - 为每个图表使用命名的 `onResize` 引用进行事件绑定与释放：`addEventListener('resize', onResize)` 与 `removeEventListener('resize', onResize)`。
- 端口占用或启动失败
  - 修改 `vite` 端口或关闭占用进程；确保 Node.js 版本满足要求。
- 中文路径访问异常
  - 路由使用命名路由与 `name` 进行跳转，避免直接依赖编码后的 `path`。

## 未来规划

- 短期路线图（1–2 迭代）

  - 全局搜索增强：下拉建议、模糊匹配与拼音支持。
  - 路由面包屑滚动优化：长链路横向滚动替代省略。
  - 图表主题统一：浅/深色图表主题适配与动画优化。
  - 构建性能：按需分包与 `manualChunks` 优化，降低体积提示。

- 长期路线图（3+ 迭代）

  - 数据源接入：后端 API 对接与真实数据驱动。
  - 权限与审计：角色权限、操作日志与安全合规。
  - 国际化与可访问性：i18n 支持与无障碍优化。
  - PWA 与离线能力：提升在弱网环境下的可用性。
  - 测试与质量保障：单元测试、端到端测试与 CI。

- 新功能与改进点

  - 首页动画可配置化与品牌主题扩展。
  - 标签体系增强：组合筛选、权重设定与可视化矩阵。
  - 建模流程：参数面板、训练任务管理与结果归档。

- 社区参与与贡献指南
  - 分支约定：`main`（稳定）、`feature/*`（特性）、`fix/*`（修复）。
  - 提交信息：遵循 `feat|fix|docs|refactor|style|test|chore: 描述`。
  - PR 流程：fork -> feature 分支 -> 提交 PR -> Review -> 合并。

## 许可证

- 本项目采用 MIT 许可证，详见 `LICENSE`（如未包含，请按需新增）。

## 联系方式与支持

- 问题反馈：提交 GitHub Issues 或通过企业内部协作平台。
- 支持渠道：项目维护组（请在企业协同工具中搜索项目名）。

## 相关资源与参考

- Vue 3: https://vuejs.org/
- Element Plus: https://element-plus.org/
- Vue Router: https://router.vuejs.org/
- ECharts: https://echarts.apache.org/
- Vue Flow: https://vue-flow.org/
- Vite: https://vitejs.dev/

---

如需进一步完善文档（例如补充后端 API 字段说明、演示数据结构、界面截图等），请提出具体要求，我将同步更新 README 并完善相应章节。
