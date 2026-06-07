/**
 * Plausible Analytics 核心模块
 * 负责统计配置和提供统一的 API
 */

// Plausible 全局类型声明
declare global {
  interface Window {
    plausible?: PlausibleInstance
    plausibleQueue?: PlausibleEvent[]
  }

  type PlausibleInstance = (
    event: string,
    options?: { props?: Record<string, any>; callback?: () => void }
  ) => void

  type PlausibleEvent = {
    n: string
    p?: Record<string, any>
  }
}

// 配置
const CONFIG = {
  domain: import.meta.env.VITE_PLAUSIBLE_DOMAIN || '',
  src: import.meta.env.VITE_PLAUSIBLE_SRC || '',
  enabled: import.meta.env.VITE_PLAUSIBLE_ENABLED === 'true',
  debug: import.meta.env.VITE_PLAUSIBLE_DEBUG === 'true',
}

// 队列用于脚本加载前的事件
let eventQueue: PlausibleEvent[] = []
let isInitialized = false

/**
 * 初始化 Plausible Analytics
 */
export function initAnalytics(): void {
  if (isInitialized) {
    return
  }

  // 检查是否启用
  if (!CONFIG.enabled) {
    if (CONFIG.debug) {
      console.log('[Analytics] 统计功能已禁用')
    }
    return
  }

  // 检查用户是否同意
  const consent = localStorage.getItem('cookie-consent')
  if (consent !== 'accepted') {
    if (CONFIG.debug) {
      console.log('[Analytics] 用户未同意统计')
    }
    return
  }

  try {
    // 加载 Plausible 脚本
    const script = document.createElement('script')
    script.async = true
    script.defer = true
    script.src = CONFIG.src
    script.dataset.domain = CONFIG.domain

    script.onload = () => {
      isInitialized = true

      // 处理队列中的事件
      if (window.plausible && eventQueue.length > 0) {
        const plausible = window.plausible
        eventQueue.forEach(({ n, p }) => {
          plausible(n, { props: p })
        })
        eventQueue = []

        if (CONFIG.debug) {
          console.log('[Analytics] 初始化成功，已处理队列中的事件')
        }
      }
    }

    script.onerror = () => {
      console.error('[Analytics] 脚本加载失败')
    }

    document.head.appendChild(script)

    if (CONFIG.debug) {
      console.log('[Analytics] 开始加载脚本', CONFIG)
    }
  } catch (error) {
    console.error('[Analytics] 初始化失败', error)
  }
}

/**
 * 追踪页面浏览
 */
export function trackPageView(path: string, title?: string): void {
  if (!CONFIG.enabled) {
    if (CONFIG.debug) {
      console.log('[Analytics] 页面浏览（已禁用）:', path)
    }
    return
  }

  const consent = localStorage.getItem('cookie-consent')
  if (consent !== 'accepted') {
    return
  }

  const eventData: Record<string, any> = {
    pathname: path,
  }

  if (title) {
    eventData.title = title
  }

  sendEvent('pageview', eventData)
}

/**
 * 追踪自定义事件
 */
export function trackEvent(name: string, props?: Record<string, any>): void {
  if (!CONFIG.enabled) {
    if (CONFIG.debug) {
      console.log('[Analytics] 自定义事件（已禁用）:', name, props)
    }
    return
  }

  const consent = localStorage.getItem('cookie-consent')
  if (consent !== 'accepted') {
    return
  }

  sendEvent(name, props)
}

/**
 * 发送事件到 Plausible
 */
function sendEvent(name: string, props?: Record<string, any>): void {
  if (CONFIG.debug) {
    console.log('[Analytics] 发送事件:', name, props)
  }

  // 如果脚本已加载，直接发送
  if (window.plausible && isInitialized) {
    window.plausible(name, { props })
    return
  }

  // 否则加入队列
  eventQueue.push({ n: name, p: props })

  if (CONFIG.debug) {
    console.log('[Analytics] 事件已加入队列:', name)
  }
}

/**
 * 检查统计是否启用
 */
export function isAnalyticsEnabled(): boolean {
  if (!CONFIG.enabled) {
    return false
  }

  const consent = localStorage.getItem('cookie-consent')
  return consent === 'accepted'
}

/**
 * 启用统计
 */
export function enableAnalytics(): void {
  localStorage.setItem('cookie-consent', 'accepted')
  initAnalytics()
}

/**
 * 禁用统计
 */
export function disableAnalytics(): void {
  localStorage.setItem('cookie-consent', 'rejected')
}

/**
 * 获取用户同意状态
 */
export function getConsentStatus(): 'accepted' | 'rejected' | null {
  return localStorage.getItem('cookie-consent') as 'accepted' | 'rejected' | null
}
