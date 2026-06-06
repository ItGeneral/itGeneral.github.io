<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toolRegistry } from '../../core/toolRegistry'
import { useI18n } from '../../i18n'

const { t, locale, setLocale } = useI18n()

const toggleLocale = () => {
  setLocale(locale.value === 'zh' ? 'en' : 'zh')
}

const route = useRoute()
const router = useRouter()

const tools = computed(() => toolRegistry.getAll())

const activeToolId = computed(() => {
  const current = tools.value.find(t => t.path === route.path)
  return current?.id ?? ''
})

// 导航
const navigate = (path: string) => {
  router.push(path)
}

// 工具图标配色
const toolColors: Record<string, string> = {
  'ai-chat': 'ai',
  'markdown-editor': 'doc',
  'json-converter': 'json',
  'regex-tester': 'regex',
  'deduplicator': 'dedup',
}

// Tooltip（保留用于未来的tooltip功能）
const tooltipVisible = computed(() => false)
const tooltipText = computed(() => '')
const tooltipStyle = computed(() => ({ top: '0px', left: '0px' }))
</script>

<template>
  <nav class="top-nav">
    <!-- 左侧：工具导航 -->
    <div class="nav-left">
      <!-- 工具导航 -->
      <div class="tool-nav">
        <div
          v-for="tool in tools"
          :key="tool.id"
          :class="['nav-item', { active: activeToolId === tool.id }]"
          @click="navigate(tool.path)"
        >
          <span class="nav-label">{{ tool.nameKey ? t(tool.nameKey) : tool.name }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧：语言切换 -->
    <div class="nav-right">
      <button class="lang-btn" @click="toggleLocale" :title="t('sidebar.language')">
        <span class="lang-icon">{{ locale === 'zh' ? '🇨🇳' : '🇺🇸' }}</span>
        <span class="lang-label">{{ locale === 'zh' ? '中文' : 'EN' }}</span>
      </button>
    </div>

    <!-- 文档名称 Tooltip -->
    <Teleport to="body">
      <div v-if="tooltipVisible" class="doc-tooltip" :style="tooltipStyle">
        {{ tooltipText }}
      </div>
    </Teleport>
  </nav>
</template>

<style scoped>
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  background: linear-gradient(to bottom, #ffffff 0%, #fafbfc 100%);
  border-bottom: 1px solid #d0d7de;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  padding: 0 20px;
  flex-shrink: 0;
}

/* 左侧区域 */
.nav-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.tool-nav {
  display: flex;
  align-items: center;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 8px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  color: #57606a;
  font-weight: 500;
}

.nav-item::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: #0969da;
  transition: width 0.25s ease;
}

.nav-item:hover {
  background: rgba(9, 105, 218, 0.08);
  color: #0969da;
  transform: translateY(-1px);
}

.nav-item:hover::before {
  width: 60%;
}

.nav-item.active {
  background: rgba(9, 105, 218, 0.12);
  color: #0969da;
  font-weight: 600;
}

.nav-item.active::before {
  width: 80%;
}

.nav-label {
  font-size: 14px;
  font-weight: inherit;
  color: inherit;
}

/* 右侧区域 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  background: #ffffff;
  color: #57606a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.lang-btn:hover {
  background: #f6f8fa;
  border-color: #0969da;
  color: #0969da;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.lang-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.lang-icon {
  font-size: 18px;
  line-height: 1;
}

.lang-label {
  font-size: 13px;
  font-weight: 600;
}

/* Tooltip */
.doc-tooltip {
  position: fixed;
  z-index: 9999;
  padding: 4px 8px;
  background: #333;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  animation: tooltip-fade-in 0.1s ease;
}

@keyframes tooltip-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>

<!-- 删除确认弹出框（非 scoped） -->
<style>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.confirm-popup {
  position: fixed;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 14px 16px;
  min-width: 200px;
  z-index: 10000;
}

.confirm-text {
  font-size: 13px;
  color: #333;
  margin-bottom: 12px;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.confirm-btn {
  padding: 5px 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.confirm-btn.cancel {
  background: #fff;
  color: #666;
}

.confirm-btn.cancel:hover {
  background: #f5f5f5;
}

.confirm-btn.ok {
  background: #d73a49;
  color: #fff;
  border-color: #d73a49;
}

.confirm-btn.ok:hover {
  background: #cb2431;
}
</style>
