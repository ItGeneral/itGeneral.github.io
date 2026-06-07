# 页面访问统计系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 AI Tools 项目中集成 Plausible Analytics，实现页面访问统计、自定义事件追踪和用户行为分析功能。

**Architecture:** 使用 Plausible Analytics 脚本注入 + Vue Router 守卫实现自动页面浏览追踪，通过 Composable 提供自定义事件追踪 API，添加 Cookie 同意横幅确保隐私合规。

**Tech Stack:** Vue 3, TypeScript, Vue Router, Plausible Analytics, localStorage

---

## 文件结构

**新创建的文件：**
- `src/core/analytics.ts` - 统计配置和核心 API
- `src/composables/useAnalytics.ts` - 统计功能的 Vue Composable
- `src/router/analyticsPlugin.ts` - Vue Router 自动追踪插件
- `src/components/CookieConsent.vue` - Cookie 同意横幅组件
- `src/pages/AnalyticsSettings.vue` - 统计设置页面

**修改的文件：**
- `index.html` - 添加 Plausible 脚本
- `src/main.ts` - 初始化统计功能
- `src/router/index.ts` - 注册路由追踪插件
- `src/App.vue` - 集成 Cookie 横幅
- `src/pages/legalContent.ts` - 更新隐私政策
- `.env` - 添加环境变量配置
- `.env.development` - 开发环境配置

---

## Task 1: 添加环境变量配置

**Files:**
- Create: `.env`
- Create: `.env.development`

- [ ] **Step 1: 创建生产环境配置文件**

创建 `.env` 文件：

```bash
# Plausible Analytics 配置
VITE_PLAUSIBLE_DOMAIN=itgeneral.github.io
VITE_PLAUSIBLE_SRC=https://plausible.io/js/script.js
VITE_PLAUSIBLE_ENABLED=true
VITE_PLAUSIBLE_DEBUG=false
```

- [ ] **Step 2: 创建开发环境配置文件**

创建 `.env.development` 文件：

```bash
# 开发环境关闭统计
VITE_PLAUSIBLE_ENABLED=false
VITE_PLAUSIBLE_DEBUG=true
```

- [ ] **Step 3: 验证配置可访问**

在控制台运行：

```bash
cd /Users/payermax/Documents/gitcode/ai-tools
node -e "console.log(import.meta.env.VITE_PLAUSIBLE_ENABLED)"
```

预期输出：配置正常加载

- [ ] **Step 4: 提交配置文件**

```bash
git add .env .env.development
git commit -m "feat: 添加 Plausible Analytics 环境变量配置"
```

---

## Task 2: 创建核心统计模块

**Files:**
- Create: `src/core/analytics.ts`

- [ ] **Step 1: 创建 analytics.ts 文件骨架**

创建 `src/core/analytics.ts`：

```typescript
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
        eventQueue.forEach(({ n, p }) => {
          window.plausible(n, { props: p })
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
```

- [ ] **Step 2: 验证 TypeScript 编译通过**

运行：

```bash
npm run build:check
```

预期输出：TypeScript 编译无错误（如果没有其他错误）

- [ ] **Step 3: 提交核心模块**

```bash
git add src/core/analytics.ts
git commit -m "feat: 创建 Plausible Analytics 核心模块"
```

---

## Task 3: 创建统计 Composable

**Files:**
- Create: `src/composables/useAnalytics.ts`

- [ ] **Step 1: 创建 Composable 文件**

创建 `src/composables/useAnalytics.ts`：

```typescript
/**
 * 统计功能的 Vue Composable
 * 提供便捷的统计 API 用于组件中
 */

import { trackEvent, trackPageView, isAnalyticsEnabled } from '@/core/analytics'

/**
 * 统计 Composable
 */
export function useAnalytics() {
  /**
   * 追踪页面浏览
   */
  const trackPage = (path: string, title?: string) => {
    trackPageView(path, title)
  }

  /**
   * 追踪自定义事件
   */
  const track = (name: string, props?: Record<string, any>) => {
    trackEvent(name, props)
  }

  /**
   * 追踪工具使用
   */
  const trackToolUsed = (toolId: string, toolName: string) => {
    trackEvent('tool_used', {
      tool_id: toolId,
      tool_name: toolName,
    })
  }

  /**
   * 追踪 AI 调用
   */
  const trackAICall = (provider: string, model: string, messageLength?: number) => {
    trackEvent('ai_call', {
      provider,
      model,
      message_length: messageLength,
    })
  }

  /**
   * 追踪 Markdown 导出
   */
  const trackMarkdownExport = (format: 'html' | 'md') => {
    trackEvent('markdown_export', { format })
  }

  /**
   * 追踪 JSON 转换
   */
  const trackJSONConvert = (targetFormat: string) => {
    trackEvent('json_convert', { target_format: targetFormat })
  }

  /**
   * 追踪正则测试
   */
  const trackRegexTest = () => {
    trackEvent('regex_test')
  }

  /**
   * 检查统计是否启用
   */
  const enabled = isAnalyticsEnabled()

  return {
    trackPage,
    track,
    trackToolUsed,
    trackAICall,
    trackMarkdownExport,
    trackJSONConvert,
    trackRegexTest,
    enabled,
  }
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

运行：

```bash
npm run build:check
```

预期输出：TypeScript 编译无错误

- [ ] **Step 3: 提交 Composable**

```bash
git add src/composables/useAnalytics.ts
git commit -m "feat: 创建统计功能 Composable"
```

---

## Task 4: 创建路由追踪插件

**Files:**
- Create: `src/router/analyticsPlugin.ts`

- [ ] **Step 1: 创建路由插件文件**

创建 `src/router/analyticsPlugin.ts`：

```typescript
/**
 * Vue Router 统计插件
 * 自动追踪页面浏览事件
 */

import type { Router } from 'vue-router'
import { trackPageView } from '@/core/analytics'

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
```

- [ ] **Step 2: 修改 router/index.ts 注册插件**

修改 `src/router/index.ts`，在文件末尾添加插件注册：

```typescript
import { createRouter, createWebHashHistory } from 'vue-router'
import './tools/register'
import { toolRegistry } from './core/toolRegistry'
import LegalPage from './pages/LegalPage.vue'
import HelpPage from './pages/HelpPage.vue'
import { createAnalyticsPlugin } from './router/analyticsPlugin'  // 新增

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

// 新增：注册统计插件
router.use(createAnalyticsPlugin())

export default router
```

- [ ] **Step 3: 验证 TypeScript 编译**

运行：

```bash
npm run build:check
```

预期输出：TypeScript 编译无错误

- [ ] **Step 4: 提交路由插件**

```bash
git add src/router/analyticsPlugin.ts src/router/index.ts
git commit -m "feat: 创建路由自动追踪插件"
```

---

## Task 5: 创建 Cookie 同意横幅组件

**Files:**
- Create: `src/components/CookieConsent.vue`

- [ ] **Step 1: 创建 Cookie 横幅组件**

创建 `src/components/CookieConsent.vue`：

```vue
<template>
  <div v-if="showBanner" class="cookie-consent-banner">
    <div class="cookie-consent-content">
      <div class="cookie-consent-text">
        <span class="cookie-icon">🍪</span>
        <div class="cookie-message">
          <p>{{ t('cookieConsent.message') }}</p>
          <p class="cookie-privacy-link">
            <a @click="showPrivacy">{{ t('cookieConsent.privacyLink') }}</a>
          </p>
        </div>
      </div>
      <div class="cookie-consent-actions">
        <button @click="handleReject" class="cookie-btn cookie-btn-reject">
          {{ t('cookieConsent.reject') }}
        </button>
        <button @click="handleAccept" class="cookie-btn cookie-btn-accept">
          {{ t('cookieConsent.accept') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@/i18n'
import { useRouter } from 'vue-router'
import { enableAnalytics, disableAnalytics } from '@/core/analytics'

const { t } = useI18n()
const router = useRouter()

// 检查是否已显示过
const consent = localStorage.getItem('cookie-consent')
const showBanner = computed(() => !consent)

// 接受统计
const handleAccept = () => {
  enableAnalytics()
  showBanner.value = false
}

// 拒绝统计
const handleReject = () => {
  disableAnalytics()
  showBanner.value = false
}

// 显示隐私政策
const showPrivacy = () => {
  router.push('/page/privacy')
}
</script>

<style scoped>
.cookie-consent-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-secondary, #f5f5f5);
  border-top: 1px solid var(--border-color, #e1e4e8);
  padding: 16px 24px;
  z-index: 1000;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.cookie-consent-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.cookie-consent-text {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.cookie-icon {
  font-size: 24px;
  line-height: 1;
}

.cookie-message p {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary, #24292e);
  line-height: 1.5;
}

.cookie-message p:not(:last-child) {
  margin-bottom: 4px;
}

.cookie-privacy-link a {
  color: var(--link-color, #0969da);
  cursor: pointer;
  text-decoration: underline;
}

.cookie-privacy-link a:hover {
  color: var(--link-hover-color, #0550ae);
}

.cookie-consent-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.cookie-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color, #e1e4e8);
  border-radius: 6px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292e);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cookie-btn:hover {
  background: var(--bg-hover, #f3f4f6);
}

.cookie-btn-accept {
  background: var(--primary-color, #0969da);
  color: white;
  border-color: var(--primary-color, #0969da);
}

.cookie-btn-accept:hover {
  background: var(--primary-hover-color, #0550ae);
}

@media (max-width: 768px) {
  .cookie-consent-content {
    flex-direction: column;
    gap: 16px;
  }

  .cookie-consent-text {
    width: 100%;
  }

  .cookie-consent-actions {
    width: 100%;
    justify-content: stretch;
  }

  .cookie-btn {
    flex: 1;
  }
}
</style>
```

- [ ] **Step 2: 添加国际化文本**

修改 `src/i18n/messages.ts`，在适当位置添加：

```typescript
export const messages = {
  // ... 其他文本

  cookieConsent: {
    message: '我们使用 Plausible 统计访问数据，帮助我们改进工具。您可以随时拒绝。',
    privacyLink: '查看隐私政策',
    reject: '拒绝',
    accept: '接受统计'
  }
}
```

注意：需要根据实际的国际化文件结构调整。

- [ ] **Step 3: 在 App.vue 中集成**

修改 `src/App.vue`，在模板中添加横幅组件：

```vue
<template>
  <div class="app-root" :data-theme="currentTheme">
    <!-- Cookie 同意横幅 -->
    <CookieConsent />

    <template v-if="isLegalPage">
      <router-view />
    </template>
    <template v-else>
      <div class="app-main">
        <AppTopNav />
        <div class="app-body">
          <AppLeftSidebar v-if="showLeftSidebar" />
          <div class="app-content-wrapper">
            <div class="app-content">
              <router-view v-slot="{ Component }">
                <keep-alive>
                  <component :is="Component" />
                </keep-alive>
              </router-view>
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLeftSidebar from './components/layout/AppLeftSidebar.vue'
import AppTopNav from './components/layout/AppTopNav.vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import CookieConsent from './components/CookieConsent.vue'  // 新增

const route = useRoute()
const currentTheme = ref<'light' | 'dark'>('light')

const isLegalPage = computed(() => route.name === 'legal')

const showLeftSidebar = computed(() => {
  return route.path === '/ai-chat' || route.path === '/markdown-editor'
})
</script>
```

- [ ] **Step 4: 验证编译**

运行：

```bash
npm run build:check
```

预期输出：TypeScript 编译无错误

- [ ] **Step 5: 提交 Cookie 横幅**

```bash
git add src/components/CookieConsent.vue src/i18n/messages.ts src/App.vue
git commit -m "feat: 添加 Cookie 同意横幅组件"
```

---

## Task 6: 在 index.html 中添加 Plausible 脚本

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 在 index.html 中添加 Plausible 脚本**

修改 `index.html`，在 `</head>` 之前添加：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Tools - Free Online Developer Utilities</title>

    <!-- Plausible Analytics -->
    <script defer data-domain="itgeneral.github.io" src="https://plausible.io/js/script.js"></script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 2: 验证 HTML 语法**

运行：

```bash
npm run dev
```

预期输出：开发服务器正常启动，页面可正常访问

- [ ] **Step 3: 提交 index.html**

```bash
git add index.html
git commit -m "feat: 添加 Plausible Analytics 脚本"
```

---

## Task 7: 初始化统计功能

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: 在 main.ts 中初始化统计**

修改 `src/main.ts`，添加统计初始化：

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import { initAnalytics } from './core/analytics'  // 新增

const app = createApp(App)

app.use(router)

app.mount('#app')

// 新增：初始化统计（需要检查用户同意状态）
initAnalytics()
```

- [ ] **Step 2: 验证应用正常启动**

运行：

```bash
npm run dev
```

预期输出：应用正常启动，控制台无错误

- [ ] **Step 3: 提交 main.ts**

```bash
git add src/main.ts
git commit -m "feat: 初始化 Plausible Analytics"
```

---

## Task 8: 更新隐私政策

**Files:**
- Modify: `src/pages/legalContent.ts`

- [ ] **Step 1: 在隐私政策中添加统计说明**

修改 `src/pages/legalContent.ts`，在隐私政策内容中添加统计分析部分：

根据现有的 `legalContent.ts` 结构，在适当位置添加：

```typescript
export const privacyPolicySections = [
  // ... 现有章节

  {
    type: 'section',
    id: 'analytics',
    title: '统计分析',
    content: `
      <h2>统计分析</h2>
      <p>我们使用 Plausible Analytics 统计网站访问数据，用于：</p>
      <ul>
        <li>了解工具使用情况</li>
        <li>优化用户体验</li>
        <li>生成统计报告</li>
      </ul>

      <h3>Plausible Analytics 特点</h3>
      <p>Plausible Analytics 是隐私友好的网站分析工具：</p>
      <ul>
        <li>不使用 Cookie 追踪用户</li>
        <li>不收集个人信息</li>
        <li>数据仅用于统计分析</li>
        <li>数据存储在欧盟境内服务器</li>
        <li>符合 GDPR 和 CCPA 要求</li>
      </ul>

      <h3>收集的数据</h3>
      <p>我们收集以下统计数据：</p>
      <ul>
        <li>页面访问次数和访问人数</li>
        <li>用户访问路径和页面停留时间</li>
        <li>浏览器类型和设备信息</li>
        <li>访问来源（搜索引擎、直接访问等）</li>
      </ul>

      <h3>您的选择</h3>
      <p>您可以随时：</p>
      <ul>
        <li>通过 Cookie 横幅接受或拒绝统计</li>
        <li>在设置中启用或禁用统计</li>
        <li>拒绝统计不影响使用任何功能</li>
      </ul>

      <p>如需了解更多，请访问 <a href="https://plausible.io/privacy-policy" target="_blank" rel="noopener">Plausible 隐私政策</a>。</p>
    `
  }
]
```

注意：需要根据实际的 `legalContent.ts` 结构进行调整。

- [ ] **Step 2: 验证隐私政策页面显示**

运行：

```bash
npm run dev
```

访问 `/page/privacy`，确认隐私政策包含统计说明

预期输出：隐私政策页面正常显示，包含统计分析章节

- [ ] **Step 3: 提交隐私政策更新**

```bash
git add src/pages/legalContent.ts
git commit -m "feat: 更新隐私政策添加统计分析说明"
```

---

## Task 9: 创建统计设置页面（可选）

**Files:**
- Create: `src/pages/AnalyticsSettings.vue`

- [ ] **Step 1: 创建设置页面组件**

创建 `src/pages/AnalyticsSettings.vue`：

```vue
<template>
  <div class="analytics-settings">
    <h1>{{ t('analyticsSettings.title') }}</h1>

    <div class="settings-card">
      <div class="settings-header">
        <h2>{{ t('analyticsSettings.analyticsStatus') }}</h2>
        <div :class="['status-badge', statusClass]">
          {{ statusText }}
        </div>
      </div>

      <div class="settings-description">
        <p>{{ t('analyticsSettings.description') }}</p>
      </div>

      <div class="settings-actions">
        <button
          v-if="consentStatus !== 'accepted'"
          @click="handleEnable"
          class="settings-btn settings-btn-primary"
        >
          {{ t('analyticsSettings.enable') }}
        </button>
        <button
          v-if="consentStatus !== 'rejected'"
          @click="handleDisable"
          class="settings-btn settings-btn-secondary"
        >
          {{ t('analyticsSettings.disable') }}
        </button>
      </div>
    </div>

    <div class="settings-info">
      <h3>{{ t('analyticsSettings.aboutPlausible') }}</h3>
      <p>{{ t('analyticsSettings.plausibleInfo') }}</p>
      <a
        href="https://plausible.io"
        target="_blank"
        rel="noopener"
        class="external-link"
      >
        {{ t('analyticsSettings.visitPlausible') }}
        <ExternalLinkIcon />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'
import { getConsentStatus, enableAnalytics, disableAnalytics } from '@/core/analytics'

const { t } = useI18n()

const consentStatus = computed(() => getConsentStatus())

const statusText = computed(() => {
  if (consentStatus.value === 'accepted') {
    return t('analyticsSettings.enabled')
  } else if (consentStatus.value === 'rejected') {
    return t('analyticsSettings.disabled')
  } else {
    return t('analyticsSettings.notSet')
  }
})

const statusClass = computed(() => {
  if (consentStatus.value === 'accepted') {
    return 'status-enabled'
  } else if (consentStatus.value === 'rejected') {
    return 'status-disabled'
  } else {
    return 'status-notset'
  }
})

const handleEnable = () => {
  enableAnalytics()
  location.reload()
}

const handleDisable = () => {
  disableAnalytics()
  location.reload()
}

// ExternalLinkIcon 简单组件
const ExternalLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M10.5 8.5a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-4.5v8h8v-4.5a.5.5 0 0 1 1 0z"/>
    <path d="M12.5 4.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-1.293l-4.146 4.147a.5.5 0 0 1-.708-.708L12.293 5H11a.5.5 0 0 1 0-1h1.5z"/>
  </svg>
)
</script>

<style scoped>
.analytics-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
}

h1 {
  font-size: 32px;
  margin-bottom: 24px;
  color: var(--text-primary, #24292e);
}

.settings-card {
  background: var(--bg-secondary, #f5f5f5);
  border: 1px solid var(--border-color, #e1e4e8);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.settings-header h2 {
  font-size: 20px;
  margin: 0;
  color: var(--text-primary, #24292e);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.status-enabled {
  background: #dafbe1;
  color: #1a7f37;
}

.status-disabled {
  background: #ffe3e3;
  color: #cf222e;
}

.status-notset {
  background: #fff8c5;
  color: #9a6700;
}

.settings-description {
  margin-bottom: 24px;
}

.settings-description p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary, #57606a);
  line-height: 1.6;
}

.settings-actions {
  display: flex;
  gap: 12px;
}

.settings-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color, #e1e4e8);
  border-radius: 6px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292e);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.settings-btn:hover {
  background: var(--bg-hover, #f3f4f6);
}

.settings-btn-primary {
  background: var(--primary-color, #0969da);
  color: white;
  border-color: var(--primary-color, #0969da);
}

.settings-btn-primary:hover {
  background: var(--primary-hover-color, #0550ae);
}

.settings-info {
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e1e4e8);
  border-radius: 8px;
  padding: 24px;
}

.settings-info h3 {
  font-size: 18px;
  margin: 0 0 12px 0;
  color: var(--text-primary, #24292e);
}

.settings-info p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--text-secondary, #57606a);
  line-height: 1.6;
}

.external-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--link-color, #0969da);
  text-decoration: none;
  font-size: 14px;
}

.external-link:hover {
  color: var(--link-hover-color, #0550ae);
  text-decoration: underline;
}
</style>
```

- [ ] **Step 2: 添加国际化文本**

修改 `src/i18n/messages.ts`，添加设置页面文本：

```typescript
export const messages = {
  // ... 其他文本

  analyticsSettings: {
    title: '统计设置',
    analyticsStatus: '统计状态',
    enabled: '已启用',
    disabled: '已禁用',
    notSet: '未设置',
    description: '您可以选择启用或禁用网站访问统计。禁用统计不影响使用任何功能。',
    enable: '启用统计',
    disable: '禁用统计',
    aboutPlausible: '关于 Plausible Analytics',
    plausibleInfo: 'Plausible 是一个隐私友好的网站分析工具，不使用 Cookie 且不收集个人信息。',
    visitPlausible: '访问 Plausible 网站'
  }
}
```

- [ ] **Step 3: 在路由中添加设置页面**

修改 `src/router/index.ts`，添加设置页面路由：

```typescript
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
    path: '/settings/analytics',  // 新增
    name: 'analytics-settings',
    component: () => import('./pages/AnalyticsSettings.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]
```

- [ ] **Step 4: 在 Footer 中添加设置链接**

修改 `src/components/layout/AppFooter.vue`，添加设置链接：

```vue
<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p class="footer-links">
        <a @click="navigateTo('/page/privacy')">{{ t('footer.privacy') }}</a>
        <span class="footer-separator">•</span>
        <a @click="navigateTo('/page/terms')">{{ t('footer.terms') }}</a>
        <span class="footer-separator">•</span>
        <a @click="navigateTo('/page/about')">{{ t('footer.about') }}</a>
        <span class="footer-separator">•</span>
        <a @click="navigateTo('/settings/analytics')">{{ t('footer.analyticsSettings') }}</a>
      </p>
      <p class="footer-copyright">
        © {{ currentYear }} AI Tools. {{ t('footer.rights') }}
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '@/i18n'

const { t } = useI18n()
const router = useRouter()

const currentYear = computed(() => new Date().getFullYear())

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<!-- 其他代码保持不变 -->
```

在 `src/i18n/messages.ts` 中添加：

```typescript
footer: {
  // ... 现有文本
  analyticsSettings: '统计设置'
}
```

- [ ] **Step 5: 验证设置页面**

运行：

```bash
npm run dev
```

访问 `/settings/analytics`，确认设置页面正常显示

预期输出：设置页面正常显示，可以启用/禁用统计

- [ ] **Step 6: 提交设置页面**

```bash
git add src/pages/AnalyticsSettings.vue src/i18n/messages.ts src/router/index.ts src/components/layout/AppFooter.vue
git commit -m "feat: 添加统计设置页面"
```

---

## Task 10: 添加自定义事件追踪示例

**Files:**
- Modify: `src/tools/ai-chat/index.ts`

- [ ] **Step 1: 在 AI Chat 中添加事件追踪**

修改 `src/tools/ai-chat/index.ts`，添加 AI 调用追踪：

根据实际的 AI Chat 代码结构，在发送消息的函数中添加追踪：

```typescript
import { useAnalytics } from '@/composables/useAnalytics'

// 在发送消息的函数中
export function useAIChat() {
  const { trackAICall } = useAnalytics()

  async function sendMessage(message: string) {
    try {
      const response = await callAI(message)

      // 追踪 AI 调用
      trackAICall('openai', 'gpt-4', message.length)

      return response
    } catch (error) {
      console.error('发送消息失败:', error)
      throw error
    }
  }

  return {
    sendMessage,
    // ... 其他返回值
  }
}
```

注意：需要根据实际的 AI Chat 代码结构调整。

- [ ] **Step 2: 在 Markdown Editor 中添加事件追踪**

修改 `src/tools/markdown-editor/components/Toolbar/Exporter.ts`，添加导出追踪：

```typescript
import { useAnalytics } from '@/composables/useAnalytics'

export function useExporter() {
  const { trackMarkdownExport } = useAnalytics()

  function exportToHTML() {
    const content = generateHTML()
    downloadFile(content, 'document.html')

    // 追踪导出事件
    trackMarkdownExport('html')
  }

  function exportToMarkdown() {
    const content = generateMarkdown()
    downloadFile(content, 'document.md')

    // 追踪导出事件
    trackMarkdownExport('md')
  }

  return {
    exportToHTML,
    exportToMarkdown,
  }
}
```

- [ ] **Step 3: 在工具页面添加工具使用追踪**

修改各个工具的 `index.ts`，在 `onMounted` 中添加追踪：

```typescript
import { onMounted } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { toolRegistry } from '@/core/toolRegistry'

export function useTool(toolId: string) {
  const { trackToolUsed } = useAnalytics()
  const tool = toolRegistry.getById(toolId)

  onMounted(() => {
    if (tool) {
      trackToolUsed(tool.id, tool.name)
    }
  })

  return {
    tool,
    // ... 其他返回值
  }
}
```

- [ ] **Step 4: 提交事件追踪代码**

```bash
git add src/tools/ai-chat/index.ts src/tools/markdown-editor/components/Toolbar/Exporter.ts
git commit -m "feat: 添加自定义事件追踪"
```

---

## Task 11: 测试和验证

**Files:**
- None (testing only)

- [ ] **Step 1: 启动开发服务器**

运行：

```bash
npm run dev
```

预期输出：开发服务器正常启动

- [ ] **Step 2: 测试 Cookie 横幅**

访问 `http://localhost:5173`，验证：
- 首次访问显示 Cookie 横幅
- 点击"接受"后横幅消失，localStorage 保存 'accepted'
- 点击"拒绝"后横幅消失，localStorage 保存 'rejected'

预期输出：Cookie 横幅正常工作

- [ ] **Step 3: 测试页面浏览追踪**

打开浏览器开发者工具 -> Network，过滤 XHR 请求：
- 访问不同页面（AI Chat、Markdown Editor 等）
- 检查是否发送请求到 `https://plausible.io/api/event`

预期输出：每个页面访问都发送请求到 Plausible

- [ ] **Step 4: 测试自定义事件追踪**

在浏览器控制台查看：
- 使用 AI Chat 发送消息
- 导出 Markdown 文档
- 执行 JSON 转换

检查 Network 面板是否有对应的自定义事件请求

预期输出：自定义事件正常追踪

- [ ] **Step 5: 测试统计设置页面**

访问 `/settings/analytics`：
- 验证统计状态正确显示
- 点击"启用统计"后刷新页面，状态变为"已启用"
- 点击"禁用统计"后刷新页面，状态变为"已禁用"

预期输出：设置页面功能正常

- [ ] **Step 6: 测试隐私政策**

访问 `/page/privacy`：
- 验证隐私政策包含"统计分析"章节
- 验证链接可正常跳转

预期输出：隐私政策正确显示统计说明

- [ ] **Step 7: 测试响应式设计**

调整浏览器窗口大小：
- 在移动端视图下验证 Cookie 横幅布局
- 在不同屏幕尺寸下验证设置页面布局

预期输出：所有页面响应式正常

- [ ] **Step 8: 验证环境变量**

在 `.env.development` 中禁用统计：

```bash
VITE_PLAUSIBLE_ENABLED=false
```

重启开发服务器，验证统计不启用

预期输出：开发环境统计已禁用

- [ ] **Step 9: 运行构建测试**

运行：

```bash
npm run build
```

预期输出：构建成功，无错误

- [ ] **Step 10: 提交测试完成**

```bash
git add .
git commit -m "test: 完成功能测试和验证"
```

---

## Task 12: 文档更新

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 在 README 中添加统计说明**

在 `README.md` 的"隐私与安全"章节添加：

```markdown
### 网站统计分析

我们使用 Plausible Analytics 进行网站访问统计：

- **数据收集**：页面访问次数、用户路径、浏览器类型
- **隐私保护**：不使用 Cookie，不收集个人信息
- **用户控制**：可随时启用或禁用统计
- **数据用途**：用于了解工具使用情况和优化用户体验

详细信息请查看我们的[隐私政策](https://itgeneral.github.io/ai-tools/page/privacy)。
```

- [ ] **Step 2: 提交文档更新**

```bash
git add README.md
git commit -m "docs: 更新 README 添加统计分析说明"
```

---

## Task 13: 最终检查和部署准备

**Files:**
- None (verification only)

- [ ] **Step 1: 运行完整构建测试**

运行：

```bash
npm run build:check
```

预期输出：TypeScript 编译和构建全部通过

- [ ] **Step 2: 检查 Git 状态**

运行：

```bash
git status
```

确认所有更改已提交

预期输出：工作区干净，无未提交的更改

- [ ] **Step 3: 查看提交历史**

运行：

```bash
git log --oneline -15
```

验证所有功能提交都在历史中

预期输出：显示所有功能提交

- [ ] **Step 4: 创建最终提交**

运行：

```bash
git add .
git commit -m "feat: 完成 Plausible Analytics 集成

- 添加环境变量配置
- 创建核心统计模块和 Composable
- 实现路由自动追踪插件
- 添加 Cookie 同意横幅
- 创建统计设置页面
- 更新隐私政策
- 添加自定义事件追踪示例
- 完成功能测试和验证

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- [ ] **Step 5: 检查构建产物**

运行：

```bash
npm run build
ls -la dist/
```

验证构建产物包含所有必要的文件

预期输出：构建成功，dist 目录包含所有文件

---

## 完成标准

所有任务完成后，应满足以下标准：

- ✅ Cookie 同意横幅正常显示和工作
- ✅ 页面浏览自动追踪
- ✅ 自定义事件正确发送
- ✅ 统计设置页面功能完整
- ✅ 隐私政策更新完成
- ✅ 开发环境统计可禁用
- ✅ 生产环境统计正常工作
- ✅ 所有测试通过
- ✅ 构建成功无错误
- ✅ 文档更新完整

---

## 后续步骤

实施完成后：

1. **注册 Plausible 账号**
   - 访问 https://plausible.io
   - 创建站点，输入域名：`itgeneral.github.io`

2. **部署到生产环境**
   - 推送代码到 GitHub
   - GitHub Pages 自动构建和部署

3. **验证数据接收**
   - 访问网站
   - 在 Plausible 后台查看统计数据

4. **优化追踪**（可选）
   - 根据需要添加更多自定义事件
   - 调整统计维度和属性
