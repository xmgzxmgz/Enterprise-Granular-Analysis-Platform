import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/theme-management'
  },
  {
    path: '/theme-management',
    name: '分类主题管理',
    meta: { breadcrumb: ['分类主题管理'] },
    children: [
      {
        path: '出口风险分类',
        name: '企业出口风险分类',
        meta: { breadcrumb: ['分类主题管理', '企业出口风险分类'] },
        children: [
          {
            path: '敏感物品管控',
            name: '敏感物品管控',
            meta: { breadcrumb: ['分类主题管理', '企业出口风险分类', '敏感物品管控'] },
            children: [
              {
                path: '两用物项',
                name: '两用物项',
                meta: { breadcrumb: ['分类主题管理', '企业出口风险分类', '敏感物品管控', '两用物项'] }
              },
              {
                path: '冷冻水产品',
                name: '冷冻水产品',
                meta: { breadcrumb: ['分类主题管理', '企业出口风险分类', '敏感物品管控', '冷冻水产品'] }
              }
            ]
          },
          {
            path: '跨境电商出口敏感指标数频分配',
            name: '跨境电商出口敏感指标数频分配',
            meta: { breadcrumb: ['分类主题管理', '企业出口风险分类', '跨境电商出口敏感指标数频分配'] }
          }
        ]
      },
      {
        path: '政策惠企',
        name: '政策惠企',
        meta: { breadcrumb: ['分类主题管理', '政策惠企'] }
      }
    ]
  },
  {
    path: '/rating-profile',
    name: '企业分类评级画像',
    meta: { breadcrumb: ['企业分类评级画像'] },
    children: [
      {
        path: '基本信息',
        name: '企业基本信息',
        meta: { breadcrumb: ['企业分类评级画像', '企业基本信息'] }
      },
      {
        path: '标签管理',
        name: '标签管理',
        meta: { breadcrumb: ['企业分类评级画像', '标签管理'] },
        children: [
          {
            path: '标签列表',
            name: '标签列表',
            meta: { breadcrumb: ['企业分类评级画像', '标签管理', '标签列表'] }
          },
          {
            path: '切面分析',
            name: '切面分析',
            meta: { breadcrumb: ['企业分类评级画像', '标签管理', '切面分析'] }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router