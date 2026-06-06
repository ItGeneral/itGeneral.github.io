import { createRouter, createWebHashHistory } from 'vue-router'
import './tools/register'
import { toolRegistry } from './core/toolRegistry'
import LegalPage from './pages/LegalPage.vue'
import HelpPage from './pages/HelpPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/markdown-editor',
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

export default router
