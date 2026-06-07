/**
 * Vue Router 统计插件
 * 自动追踪页面浏览事件
 */

import type { Router } from 'vue-router'
import { trackPageView } from '../core/analytics'

/**
 * 创建统计插件
 */
export function createAnalyticsPlugin() {
  return {
    install(router: Router) {
      router.afterEach((to, from) => {
        // 跳过首次加载（由 Plausible 自动追踪）
        if (!from) {
          return
        }

        // 获取页面标题
        const title = to.meta.title as string | undefined

        // 追踪页面浏览
        trackPageView(to.path, title)
      })
    },
  }
}
