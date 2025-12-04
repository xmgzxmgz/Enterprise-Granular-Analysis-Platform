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
    name: '分类主题管理',
    component: () => import('@/pages/Theme/Index.vue'),
    meta: { breadcrumb: ['分类主题管理'] },
    children: [
      {
        path: '',
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
            name: '重点物品',
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
            name: '跨境电商出口敏感指',
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
        name: '政策惠企',
        component: () => import('@/pages/Theme/Policy/Placeholder.vue'),
        meta: { breadcrumb: ['分类主题管理', '政策惠企'] }
      }
    ]
  },
  {
    path: '/rating-profile',
    name: '企业分类评级画像',
    component: () => import('@/pages/Rating/Index.vue'),
    meta: { breadcrumb: ['企业分类评级画像'] },
    children: [
      {
        path: '',
        component: () => import('@/pages/Common/RootNavigator.vue'),
        props: { basePath: '/rating-profile', title: '企业分类评级画像' }
      },
      {
        path: 'basic-info',
        name: '企业基本信息',
        component: () => import('@/pages/Rating/BasicInfo.vue'),
        meta: { breadcrumb: ['企业分类评级画像', '企业基本信息'] }
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
        path: 'search-results',
        name: '企业搜索结果',
        component: () => import('@/pages/Rating/SearchResults.vue'),
        meta: { breadcrumb: ['企业分类评级画像', '企业搜索结果'] }
      },
      {
        path: 'enterprise-detail',
        name: '企业详情',
        component: () => import('@/pages/Rating/EnterpriseDetail.vue'),
        meta: { breadcrumb: ['企业分类评级画像', '企业详情'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
