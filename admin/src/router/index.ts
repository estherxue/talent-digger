import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/pages/dashboard/index.vue'),
          meta: { title: '数据概览' }
        },
        {
          path: 'tests',
          name: 'Tests',
          component: () => import('@/pages/tests/index.vue'),
          meta: { title: '题库管理' }
        },
        {
          path: 'careers',
          name: 'Careers',
          component: () => import('@/pages/careers/index.vue'),
          meta: { title: '职业库管理' }
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/pages/users/index.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: 'statistics',
          name: 'Statistics',
          component: () => import('@/pages/statistics/index.vue'),
          meta: { title: '数据统计' }
        }
      ]
    }
  ]
})

export default router
