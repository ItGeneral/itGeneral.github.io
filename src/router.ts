import { createRouter, createWebHashHistory } from 'vue-router'
import './tools/register'
import { toolRegistry } from './core/toolRegistry'
import LegalPage from './pages/LegalPage.vue'
import HelpPage from './pages/HelpPage.vue'
import { createAnalyticsPlugin } from './router/analyticsPlugin'

const routes = [
  {
    path: '/',
    redirect: '/ai-chat',
  },
  ...toolRegistry.getRoutes(),
  {
    path: '/page/:page',
    name: 'legal',
    component: LegalPage,
  },
  {
    path: '/help/:toolId',
    name: 'help',
    component: HelpPage,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 注册统计插件
createAnalyticsPlugin().install(router)

export default router
