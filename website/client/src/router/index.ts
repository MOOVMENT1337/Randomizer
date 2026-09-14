import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/create', name: 'create', component: () => import('@/views/CreateView.vue') },
    { path: '/history', name: 'history', component: () => import('@/views/HistoryView.vue') },
    { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/admin', name: 'admin', component: () => import('@/views/AdminView.vue'), meta: { requiresAdmin: true } },
    { path: '/auth', name: 'auth', component: () => import('@/views/AuthView.vue'), meta: { standalone: true } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin && localStorage.getItem('randomizer:admin-session') !== 'true') {
    return { path: '/auth', query: { role: 'admin', redirect: to.fullPath } }
  }
})

export default router
