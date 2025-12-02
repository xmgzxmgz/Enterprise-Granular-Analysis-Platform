import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "首页",
    component: () => import("@/views/Home.vue"),
    meta: { breadcrumb: ["首页"] },
  },
  {
    path: "/theme-management",
    name: "分类主题管理",
    meta: { breadcrumb: ["分类主题管理"] },
    children: [
      {
        path: "出口风险分类",
        name: "企业出口风险分类",
        meta: { breadcrumb: ["分类主题管理", "企业出口风险分类"] },
        children: [
          {
            path: "敏感物品管控",
            name: "敏感物品管控",
            component: () => import("@/views/Theme/SensitiveItems/Index.vue"),
            meta: {
              breadcrumb: ["分类主题管理", "企业出口风险分类", "敏感物品管控"],
            },
            children: [
              {
                path: "两用物项",
                name: "两用物项",
                component: () =>
                  import("@/views/Theme/SensitiveItems/DualUse.vue"),
                meta: {
                  breadcrumb: [
                    "分类主题管理",
                    "企业出口风险分类",
                    "敏感物品管控",
                    "两用物项",
                  ],
                },
              },
            ],
          },
          {
            path: "重点物品",
            name: "重点物品",
            component: () => import("@/views/Theme/KeyItems/Index.vue"),
            meta: {
              breadcrumb: ["分类主题管理", "企业出口风险分类", "重点物品"],
            },
            children: [
              {
                path: "冷冻水产品",
                name: "冷冻水产品",
                component: () =>
                  import("@/views/Theme/KeyItems/FrozenFish.vue"),
                meta: {
                  breadcrumb: [
                    "分类主题管理",
                    "企业出口风险分类",
                    "重点物品",
                    "冷冻水产品",
                  ],
                },
              },
            ],
          },
          {
            path: "跨境电商出口敏感指标数频分配",
            name: "跨境电商出口敏感指标数频分配",
            component: () => import("@/views/Theme/CrossBorder/Index.vue"),
            meta: {
              breadcrumb: [
                "分类主题管理",
                "企业出口风险分类",
                "跨境电商出口敏感指标数频分配",
              ],
            },
            children: [
              {
                path: "数频分配",
                name: "数频分配",
                component: () =>
                  import("@/views/Theme/CrossBorder/FrequencyAssign.vue"),
                meta: {
                  breadcrumb: [
                    "分类主题管理",
                    "企业出口风险分类",
                    "跨境电商出口敏感指标数频分配",
                    "数频分配",
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        path: "政策惠企",
        name: "政策惠企",
        component: () => import("@/views/Theme/Policy/Placeholder.vue"),
        meta: { breadcrumb: ["分类主题管理", "政策惠企"] },
      },
    ],
  },
  {
    path: "/rating-profile",
    name: "企业分类评级画像",
    meta: { breadcrumb: ["企业分类评级画像"] },
    children: [
      {
        path: "基本信息",
        name: "企业基本信息",
        component: () => import("@/views/Rating/BasicInfo.vue"),
        meta: { breadcrumb: ["企业分类评级画像", "企业基本信息"] },
      },
      {
        path: "标签管理",
        name: "标签管理",
        meta: { breadcrumb: ["企业分类评级画像", "标签管理"] },
        children: [
          {
            path: "标签列表",
            name: "标签列表",
            component: () => import("@/views/Rating/Tags/List.vue"),
            meta: { breadcrumb: ["企业分类评级画像", "标签管理", "标签列表"] },
          },
          {
            path: "切面分析",
            name: "切面分析",
            component: () => import("@/views/Rating/Tags/Aspect.vue"),
            meta: { breadcrumb: ["企业分类评级画像", "标签管理", "切面分析"] },
          },
          {
            path: "标签企业列表",
            name: "标签企业列表",
            component: () => import("@/views/Rating/Tags/EnterpriseList.vue"),
            meta: {
              breadcrumb: ["企业分类评级画像", "标签管理", "标签企业列表"],
            },
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
