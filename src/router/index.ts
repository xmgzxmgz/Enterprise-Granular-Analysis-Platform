import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: '首页',
    component: () => import('@/pages/Home.vue'),
    meta: { breadcrumb: ['首页'] }
  },
  {
    path: '/theme-management',
    component: () => import('@/pages/Theme/Index.vue'),
    meta: { breadcrumb: ['分类主题管理'] },
    children: [
      {
        path: '',
        name: '分类主题管理',
        component: () => import('@/pages/Common/RootNavigator.vue'),
        props: { basePath: '/theme-management', title: '分类主题管理' }
      },
      {
        path: 'export-risk',
        name: '企业出口风险分类',
        component: () => import('@/pages/Theme/Exports/Index.vue'),
        meta: { breadcrumb: ['分类主题管理', '企业出口风险分类'] },
        children: [
          {
            path: 'sensitive-items',
            name: '敏感物品管控',
            component: () => import('@/pages/Theme/SensitiveItems/Index.vue'),
            meta: {
              breadcrumb: ['分类主题管理', '企业出口风险分类', '敏感物品管控']
            },
            children: [
              {
                path: 'dual-use',
                name: '两用物项',
                component: () => import('@/pages/Theme/SensitiveItems/DualUse.vue'),
                meta: {
                  breadcrumb: ['分类主题管理', '企业出口风险分类', '敏感物品管控', '两用物项']
                }
              }
            ]
          },
          {
            path: 'key-items',
            name: '重点物品（规划中）',
            component: () => import('@/pages/Theme/KeyItems/Index.vue'),
            meta: {
              breadcrumb: ['分类主题管理', '企业出口风险分类', '重点物品']
            },
            children: [
              {
                path: 'frozen-fish',
                name: '冷冻水产品',
                component: () => import('@/pages/Theme/KeyItems/FrozenFish.vue'),
                meta: {
                  breadcrumb: ['分类主题管理', '企业出口风险分类', '重点物品', '冷冻水产品']
                }
              }
            ]
          },
          {
            path: 'cross-border-sensitive-distribution',
            name: '跨境电商出口敏感指数（规划中）',
            component: () => import('@/pages/Theme/CrossBorder/Index.vue'),
            meta: {
              breadcrumb: ['分类主题管理', '企业出口风险分类', '跨境电商出口敏感指标']
            },
            children: [
              {
                path: 'frequency-assign',
                name: '数频分配',
                component: () => import('@/pages/Theme/CrossBorder/FrequencyAssign.vue'),
                meta: {
                  breadcrumb: [
                    '分类主题管理',
                    '企业出口风险分类',
                    '跨境电商出口敏感指标',
                    '数频分配'
                  ]
                }
              }
            ]
          }
        ]
      },
      {
        path: 'policy-benefits',
        name: '政策推送',
        component: () => import('@/pages/Theme/Policy/Placeholder.vue'),
        meta: { breadcrumb: ['分类主题管理', '政策推送'] }
      }
    ]
  },
  {
    path: '/rating-profile',
    component: () => import('@/pages/Rating/Index.vue'),
    meta: { breadcrumb: ['企业分类评级画像'] },
    children: [
      {
        path: '',
        name: '企业分类评级画像',
        component: () => import('@/pages/Common/RootNavigator.vue'),
        props: { basePath: '/rating-profile', title: '企业分类评级画像' }
      },
      {
        path: 'tags',
        name: '标签管理',
        component: () => import('@/pages/Rating/Tags/Index.vue'),
        meta: { breadcrumb: ['企业分类评级画像', '标签管理'] },
        children: [
          {
            path: 'list',
            name: '标签列表',
            component: () => import('@/pages/Rating/Tags/List.vue'),
            meta: { breadcrumb: ['企业分类评级画像', '标签管理', '标签列表'] }
          },
          {
            path: 'aspect',
            name: '切面分析',
            component: () => import('@/pages/Rating/Tags/Aspect.vue'),
            meta: { breadcrumb: ['企业分类评级画像', '标签管理', '切面分析'] }
          },
          {
            path: 'enterprise-list',
            name: '标签企业列表',
            component: () => import('@/pages/Rating/Tags/EnterpriseList.vue'),
            meta: {
              breadcrumb: ['企业分类评级画像', '标签管理', '标签企业列表']
            }
          }
        ]
      },
      {
        path: 'enterprise-detail',
        name: '企业详情',
        component: () => import('@/pages/Rating/EnterpriseDetail.vue'),
        meta: { breadcrumb: ['企业分类评级画像', '企业详情'] }
      }
    ]
  },
  // 兼容历史代码中的中文路径跳转（别名路由）
  {
    path: '/rating-profile/标签管理/标签企业列表',
    name: '标签企业列表',
    component: () => import('@/pages/Rating/Tags/EnterpriseList.vue'),
    meta: { breadcrumb: ['企业分类评级画像', '标签管理', '标签企业列表'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
