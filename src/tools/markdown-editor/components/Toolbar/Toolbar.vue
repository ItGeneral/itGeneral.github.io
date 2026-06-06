<template>
  <div class="toolbar">
    <div class="toolbar-groups">
      <div class="toolbar-group">
        <button class="toolbar-btn" @click="insertMarkdown('**', '**')" title="加粗 (Ctrl+B)">
          <span class="btn-icon"><strong>B</strong></span>
        </button>
        <button class="toolbar-btn" @click="insertMarkdown('*', '*')" title="斜体 (Ctrl+I)">
          <span class="btn-icon"><em>I</em></span>
        </button>
      </div>

      <div class="toolbar-group">
        <button class="toolbar-btn" @click="insertHeading" title="标题">
          <span class="btn-icon">H</span>
        </button>
        <button class="toolbar-btn" @click="insertMarkdown('> ', '')" title="引用">
          <span class="btn-icon">"</span>
        </button>
        <button class="toolbar-btn" @click="insertCodeBlock" title="代码块">
          <span class="btn-icon">&lt;/&gt;</span>
        </button>
      </div>

      <div class="toolbar-group">
        <button class="toolbar-btn" @click="insertList('- ', '')" title="无序列表">
          <span class="btn-icon">•</span>
        </button>
        <button class="toolbar-btn" @click="insertLink" title="链接 (Ctrl+K)">
          <span class="btn-icon">🔗</span>
        </button>
      </div>

      <div class="toolbar-group">
        <button class="toolbar-btn" @click="exportHTML" title="导出 HTML">
          <span class="btn-icon">🌐</span>
          <span class="btn-label">HTML</span>
        </button>
        <button class="toolbar-btn" @click="exportMarkdown" title="导出 Markdown">
          <span class="btn-icon">📝</span>
          <span class="btn-label">MD</span>
        </button>
      </div>
    </div>

    <div class="toolbar-actions">
      <button class="toolbar-btn" @click="openHelp" :title="t('common.help')">
        <span class="btn-icon">📖</span>
      </button>
      <button class="toolbar-btn" @click="toggleTheme" :title="`切换主题 (${theme === 'dark' ? '浅色' : '深色'})`">
        <span class="btn-icon">{{ theme === 'dark' ? '☀️' : '🌙' }}</span>
      </button>
      <button class="toolbar-btn" @click="togglePreviewFullscreen" title="预览全屏">
        <span class="btn-icon">⛶</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { eventBus } from '../Common/EventBus'
import { useI18n } from '../../../../i18n'

const { t } = useI18n()

const emit = defineEmits<{
  'insert': [text: string]
  'theme-change': [theme: 'light' | 'dark']
  'preview-fullscreen': []
}>()

const theme = ref<'light' | 'dark'>('light')

const insertMarkdown = (before: string, after: string) => {
  emit('insert', before + 'selected text' + after)
}

const insertHeading = () => {
  emit('insert', '## ')
}

const insertCodeBlock = () => {
  emit('insert', '```\n\n```')
}

const insertList = (prefix: string, suffix: string) => {
  emit('insert', prefix + suffix)
}

const insertLink = () => {
  emit('insert', '[链接文字](url)')
}

const exportHTML = () => {
  eventBus.emit('export-requested', { format: 'html' })
}

const exportMarkdown = () => {
  eventBus.emit('export-requested', { format: 'markdown' })
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  emit('theme-change', theme.value)
}

const togglePreviewFullscreen = () => {
  emit('preview-fullscreen')
}

const openHelp = () => {
  eventBus.emit('help-requested')
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--bg-secondary, #f6f8fa);
  border-bottom: 1px solid var(--border-color, #eaecef);
  flex-shrink: 0;
  gap: 12px;
  overflow-x: auto;
}

.toolbar-groups {
  display: flex;
  gap: 6px;
  align-items: center;
}

.toolbar-group {
  display: flex;
  gap: 2px;
  padding-right: 8px;
  border-right: 1px solid var(--border-color, #eaecef);
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary, #586069);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.toolbar-btn:hover {
  background: var(--bg-tertiary, #e1e4e8);
  color: var(--text-primary, #24292e);
}

.toolbar-btn:active {
  background: var(--border-color, #d1d5da);
}

.btn-icon {
  font-size: 13px;
  display: inline-flex;
  align-items: center;
}

.btn-label {
  font-size: 12px;
}
</style>
