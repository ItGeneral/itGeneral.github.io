# 页面访问统计系统设计文档

**创建日期：** 2025-06-07
**项目：** AI Tools
**功能：** 使用 Plausible Analytics 实现页面访问统计和用户行为分析

---

## 1. 概述

### 1.1 目标

在 AI Tools 项目中集成 Plausible Analytics，实现以下功能：
- 统计每个页面的访问人数（PV/UV）
- 分析用户访问路径和行为
- 按时间维度统计访问趋势
- 生成可视化统计报告

### 1.2 设计原则

- **隐私友好**：使用 Plausible Analytics，符合 GDPR/CCPA 要求
- **非侵入性**：最小化对现有代码的影响
- **可配置**：支持开发/生产环境切换
- **用户可控**：用户可选择接受/拒绝统计

---

## 2. 技术方案

### 2.1 分析服务选择

**选择：Plausible Analytics**

**理由：**
- 隐私优先，不使用 Cookie，符合项目定位
- 轻量级（脚本 < 1KB），不影响性能
- 界面简洁，易于理解
- 在中国访问稳定
- 免费版足够个人使用（10,000 页面浏览/月）

### 2.2 集成架构

采用 **Script Injection + Vue Router Hook** 方式：

```
应用启动
  ↓
加载 Plausible 脚本（异步）
  ↓
Vue Router 守卫拦截
  ↓
自动发送页面浏览事件
  ↓
自定义事件追踪（可选）
```

---

## 3. 系统设计

### 3.1 核心模块

#### 3.1.1 统计配置模块 (`src/core/analytics.ts`)

**职责：**
- 管理 Plausible 配置（域名、数据源）
- 提供统一的统计 API
- 处理环境变量和调试模式

**核心 API：**
```typescript
// 初始化统计
initAnalytics(): void

// 追踪页面浏览
trackPageView(path: string, title?: string): void

// 追踪自定义事件
trackEvent(name: string, props?: Record<string, any>): void

// 检查统计是否启用
isEnabled(): boolean
```

#### 3.1.2 路由追踪插件 (`src/router/analyticsPlugin.ts`)

**职责：**
- 监听 Vue Router 路由变化
- 自动发送页面浏览事件
- 追踪用户停留时长

**实现方式：**
```typescript
// 注册路由 afterEach 钩子
router.afterEach((to, from) => {
  trackPageView(to.path, to.meta.title)
})
```

#### 3.1.3 自定义事件追踪 (`src/composables/useAnalytics.ts`)

**职责：**
- 提供便捷的 Vue Composable
- 封装常用事件追踪逻辑

**使用示例：**
```vue
<script setup>
import { useAnalytics } from '@/composables/useAnalytics'

const { trackEvent } = useAnalytics()

// 追踪工具使用
trackEvent('tool_used', { tool_id: 'ai-chat' })
</script>
```

---

### 3.2 数据追踪策略

#### 3.2.1 页面浏览追踪（自动）

**追踪内容：**
- 页面路径（如 `/ai-chat`、`/markdown-editor`）
- 页面标题（从路由 meta 获取）
- 访问时间戳
- 来源页面（Referrer）

**实现方式：**
通过 Vue Router afterEach 钩子自动追踪，无需手动调用。

#### 3.2.2 自定义事件追踪（手动）

**追踪事件列表：**

| 事件名称 | 触发条件 | 属性 | 优先级 |
|---------|---------|------|--------|
| `tool_used` | 用户访问工具页面 | `tool_id`, `tool_name` | 高 |
| `ai_call` | 用户发送 AI 消息 | `provider`, `model` | 中 |
| `markdown_export` | 用户导出 Markdown | `format` (html/md) | 低 |
| `json_convert` | 用户执行 JSON 转换 | `target_format` | 低 |
| `regex_test` | 用户测试正则表达式 | - | 低 |

**实现方式：**
在关键业务逻辑中使用 `useAnalytics()` 调用。

#### 3.2.3 用户路径分析（自动）

通过页面浏览事件，Plausible 自动生成：
- 用户访问路径图
- 跳出率
- 会话时长
- 页面停留时间

---

### 3.3 隐私合规设计

#### 3.3.1 Cookie 同意横幅 (`src/components/CookieConsent.vue`)

**功能：**
- 首次访问时显示横幅
- 提供"接受"和"拒绝"按钮
- 用户选择保存在 localStorage
- 拒绝时禁用统计

**UI 设计：**
```
┌─────────────────────────────────────┐
│ 🍪 我们使用 Plausible 统计访问数据   │
│ 帮助我们改进工具。您可以随时拒绝。   │
│                                     │
│ [拒绝]        [接受统计]            │
└─────────────────────────────────────┘
```

#### 3.3.2 隐私政策更新

在 `src/pages/legalContent.ts` 中添加说明：

```typescript
export const privacyPolicyContent = {
  analytics: {
    title: "统计分析",
    content: `
      我们使用 Plausible Analytics 统计网站访问数据，用于：
      • 了解工具使用情况
      • 优化用户体验
      • 生成统计报告

      Plausible Analytics 是隐私友好的分析工具：
      • 不使用 Cookie
      • 不收集个人信息
      • 数据仅用于统计分析

      您可以选择拒绝统计，不影响使用任何功能。
    `
  }
}
```

#### 3.3.3 退出机制

提供设置页面（`src/pages/AnalyticsSettings.vue`），允许用户：
- 随时启用/禁用统计
- 查看统计状态
- 清除同意设置

---

### 3.4 文件结构

```
src/
├── core/
│   └── analytics.ts                    # 统计配置和 API
├── composables/
│   └── useAnalytics.ts                 # 统计 Composable
├── router/
│   ├── analyticsPlugin.ts              # 路由追踪插件
│   └── index.ts                        # 修改：注册插件
├── components/
│   ├── CookieConsent.vue              # Cookie 同意横幅
│   └── layout/
│       └── AppFooter.vue              # 修改：添加设置链接
├── pages/
│   ├── AnalyticsSettings.vue          # 统计设置页面
│   └── legalContent.ts                # 修改：添加隐私说明
├── App.vue                             # 修改：加载 Cookie 横幅
└── main.ts                             # 修改：初始化统计
```

---

### 3.5 环境变量配置

在项目根目录创建 `.env` 文件：

```env
# Plausible Analytics 配置
VITE_PLAUSIBLE_DOMAIN=itgeneral.github.io
VITE_PLAUSIBLE_SRC=https://plausible.io/js/script.js
VITE_PLAUSIBLE_ENABLED=true
```

开发环境配置（`.env.development`）：

```env
VITE_PLAUSIBLE_ENABLED=false
```

---

### 3.6 性能优化

**措施：**
1. **异步加载**：Plausible 脚本异步加载，不阻塞页面渲染
2. **延迟发送**：非关键事件使用 `requestIdleCallback` 延迟发送
3. **批量处理**：多个事件合并为单个请求（Plausible 自动处理）

**实现代码：**
```typescript
// 延迟追踪
function trackEventDeferred(name: string, props?: Record<string, any>) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => trackEvent(name, props))
  } else {
    trackEvent(name, props)
  }
}
```

---

## 4. 实现细节

### 4.1 初始化流程

**在 `src/main.ts` 中：**

```typescript
import { initAnalytics } from './core/analytics'

// 仅在用户同意统计后初始化
const consent = localStorage.getItem('cookie-consent')
if (consent === 'accepted') {
  initAnalytics()
}
```

### 4.2 路由追踪插件

**在 `src/router/index.ts` 中注册：**

```typescript
import { createAnalyticsPlugin } from './router/analyticsPlugin'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 注册统计插件
router.use(createAnalyticsPlugin())
```

### 4.3 自定义事件使用示例

**AI Chat 工具：**
```typescript
// src/tools/ai-chat/index.ts
import { useAnalytics } from '@/composables/useAnalytics'

export function useAIChat() {
  const { trackEvent } = useAnalytics()

  async function sendMessage(message: string) {
    const response = await callAI(message)

    // 追踪 AI 调用
    trackEvent('ai_call', {
      provider: 'openai',
      model: 'gpt-4',
      message_length: message.length
    })

    return response
  }
}
```

**Markdown Editor 工具：**
```typescript
// src/tools/markdown-editor/components/Toolbar/Exporter.ts
import { useAnalytics } from '@/composables/useAnalytics'

export function exportDocument(format: 'html' | 'md') {
  const { trackEvent } = useAnalytics()

  // 执行导出
  const content = generateContent(format)

  // 追踪导出事件
  trackEvent('markdown_export', { format })
}
```

---

## 5. 测试计划

### 5.1 功能测试

- [ ] Cookie 同意横幅正确显示
- [ ] 接受/拒绝选择正确保存
- [ ] 页面浏览事件正确发送
- [ ] 自定义事件正确追踪
- [ ] 路由切换时自动追踪
- [ ] 环境变量正确控制统计开关

### 5.2 隐私测试

- [ ] 拒绝统计后不发送任何事件
- [ ] localStorage 正确保存用户选择
- [ ] 隐私政策正确显示统计说明

### 5.3 性能测试

- [ ] Plausible 脚本加载不阻塞页面
- [ ] 统计发送不影响业务逻辑
- [ ] 页面加载时间无明显增加

### 5.4 浏览器兼容性

- [ ] Chrome/Firefox/Safari 正常工作
- [ ] 移动端浏览器正常工作

---

## 6. 部署计划

### 6.1 Plausible 账号设置

1. 注册 Plausible 账号（https://plausible.io）
2. 创建新站点，输入域名：`itgeneral.github.io`
3. 获取统计脚本链接
4. 配置共享链接（可选）

### 6.2 环境变量配置

1. 在 GitHub 仓库设置中添加环境变量（Repository Secrets）
2. 或在本地创建 `.env` 文件（不提交到 git）

### 6.3 部署步骤

1. 更新代码并测试
2. 构建项目：`npm run build`
3. 部署到 GitHub Pages
4. 在 Plausible 后台验证数据接收

---

## 7. 维护和监控

### 7.1 日常维护

- 定期查看 Plausible 报表
- 检查统计数据是否正常
- 根据需要调整追踪事件

### 7.2 调试模式

开发环境启用调试模式：

```typescript
// .env.development
VITE_PLAUSIBLE_DEBUG=true
```

调试模式下，所有统计事件会在控制台输出。

### 7.3 数据导出

Plausible 支持数据导出：
- 导出为 CSV/JSON
- 通过 API 访问原始数据
- 生成自定义报表

---

## 8. 风险和限制

### 8.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Plausible 服务宕机 | 统计中断 | 服务端自动重试，不影响业务 |
| 脚本加载失败 | 无法统计 | 添加错误处理，静默失败 |
| 用户拒绝率过高 | 数据不完整 | 优化横幅文案，降低拒绝率 |

### 8.2 功能限制

- 免费版限制 10,000 页面浏览/月
- 无实时数据（数据延迟约 30 秒）
- 自定义属性数量有限制（建议不超过 5 个）

---

## 9. 成功标准

### 9.1 技术指标

- 统计功能对页面性能影响 < 50ms
- 统计脚本加载成功率 > 99%
- 用户同意率 > 50%

### 9.2 业务指标

- 能够准确统计每个工具的访问量
- 能够生成用户访问路径报告
- 能够查看时间趋势分析

---

## 10. 后续优化

### 10.1 短期（1-3 个月）

- [ ] 添加更多自定义事件追踪
- [ ] 优化 Cookie 横幅设计
- [ ] 添加统计设置页面

### 10.2 长期（3-6 个月）

- [ ] 集成 A/B 测试功能
- [ ] 添加热力图分析
- [ ] 自动生成月度报告

---

## 11. 参考资料

- [Plausible 官方文档](https://plausible.io/docs)
- [Plausible 事件追踪 API](https://plausible.io/docs/event-tracking)
- [Vue Router 守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [GDPR 合规指南](https://plausible.io/privacy-friendly-analytics)

---

**文档版本：** 1.0
**最后更新：** 2025-06-07
**作者：** Claude Code
