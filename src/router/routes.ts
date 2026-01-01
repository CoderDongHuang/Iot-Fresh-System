import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/',
    component: () => import('@/components/layout/Index.vue'),
    redirect: '/dashboard',
    meta: { title: '首页', icon: 'home' },
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/index.vue'), meta: { title: '仪表盘', icon: 'dashboard', affix: true } },
      { path: 'device', name: 'Device', redirect: '/device/list', meta: { title: '设备管理', icon: 'device' }, children: [
        { path: 'list', name: 'DeviceList', component: () => import('@/views/device/list.vue'), meta: { title: '设备列表', icon: 'list' } },
        { path: 'detail/:vid', name: 'DeviceDetail', component: () => import('@/views/device/detail.vue'), meta: { title: '设备详情', hidden: true } },
      ] },
      { path: 'monitor', name: 'Monitor', component: () => import('@/views/monitor/index.vue'), meta: { title: '实时监控', icon: 'monitor' } },
      { path: 'control', name: 'Control', component: () => import('@/views/control/index.vue'), meta: { title: '设备控制', icon: 'control' } },
      { path: 'alarm', name: 'Alarm', component: () => import('@/views/alarm/index.vue'), meta: { title: '报警管理', icon: 'alarm', badge: 'new' } },
      { path: 'data', name: 'Data', redirect: '/data/history', meta: { title: '数据查询', icon: 'data' }, children: [
        { path: 'history', name: 'DataHistory', component: () => import('@/views/data/history.vue'), meta: { title: '历史数据', icon: 'history' } },
        { path: 'statistics', name: 'DataStatistics', component: () => import('@/views/data/statistics.vue'), meta: { title: '数据统计', icon: 'statistics' } },
      ] },
      { path: 'settings', name: 'Settings', redirect: '/settings/profile', meta: { title: '系统设置', icon: 'settings' }, children: [
        { path: 'profile', name: 'Profile', component: () => import('@/views/settings/profile.vue'), meta: { title: '个人设置', icon: 'user' } },
        { path: 'system', name: 'System', component: () => import('@/views/settings/system.vue'), meta: { title: '系统设置', icon: 'system', roles: ['admin'] } },
      ] },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/error/404.vue'), meta: { title: '404', hidden: true } },
]

export default routes
