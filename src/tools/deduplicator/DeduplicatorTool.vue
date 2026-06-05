<template>
  <div class="deduplicator">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-group">
        <div class="separator-select">
          <span class="sep-label">{{ t('dedup.separator') }}</span>
          <select v-model="separator" @change="onSeparatorChange" class="sep-dropdown">
            <option value="\n">{{ t('dedup.sepNewline') }}</option>
            <option value=",">{{ t('dedup.sepComma') }}</option>
            <option value=" ">{{ t('dedup.sepSpace') }}</option>
            <option value="\t">{{ t('dedup.sepTab') }}</option>
            <option value=";">{{ t('dedup.sepSemicolon') }}</option>
            <option value="custom">{{ t('dedup.sepCustom') }}</option>
          </select>
          <input
            v-if="separator === 'custom'"
            v-model="customSeparator"
            class="sep-input"
            :placeholder="t('dedup.customPlaceholder')"
            @input="handleDedup"
          />
        </div>
        <label class="option-label">
          <input type="checkbox" v-model="ignoreCase" @change="handleDedup" />
          <span>{{ t('dedup.ignoreCase') }}</span>
        </label>
        <label class="option-label">
          <input type="checkbox" v-model="trimSpaces" @change="handleDedup" />
          <span>{{ t('dedup.trimSpaces') }}</span>
        </label>
        <label class="option-label">
          <input type="checkbox" v-model="removeEmpty" @change="handleDedup" />
          <span>{{ t('dedup.removeEmpty') }}</span>
        </label>
        <label class="option-label">
          <input type="checkbox" v-model="sortResult" @change="handleDedup" />
          <span>{{ t('dedup.sortResult') }}</span>
        </label>
      </div>
      <div class="toolbar-actions">
        <button class="action-btn" @click="copyResult" :title="t('dedup.copy')">
          <span>📋</span> {{ t('dedup.copy') }}
        </button>
        <button class="action-btn" @click="clearAll" :title="t('dedup.clear')">
          <span>🗑️</span> {{ t('dedup.clear') }}
        </button>
        <button class="action-btn" @click="loadSample" :title="t('dedup.sample')">
          <span>💡</span> {{ t('dedup.sample') }}
        </button>
      </div>
    </div>

    <!-- 统计栏 -->
    <div class="stats-bar">
      <span class="stat-item">{{ t('dedup.original') }}: <strong>{{ originalLines }}</strong></span>
      <span class="stat-item">{{ t('dedup.after') }}: <strong>{{ resultLines }}</strong></span>
      <span class="stat-item highlight">{{ t('dedup.deleted') }}: <strong>{{ duplicateCount }}</strong></span>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧输入 -->
      <div class="panel" :style="{ width: panelWidth + '%' }">
        <div class="panel-header">
          <span class="panel-title">{{ t('dedup.inputTitle') }}</span>
        </div>
        <textarea
          v-model="inputText"
          class="text-area"
          :placeholder="t('dedup.inputPlaceholder')"
          spellcheck="false"
          @input="handleDedup"
        ></textarea>
      </div>

      <!-- 分割线 -->
      <div class="resizer" @mousedown="startResize"></div>

      <!-- 右侧输出 -->
      <div class="panel" :style="{ width: (100 - panelWidth) + '%' }">
        <div class="panel-header">
          <span class="panel-title">{{ t('dedup.outputTitle') }}</span>
        </div>
        <div class="output-area" v-html="highlightedOutput"></div>
      </div>
    </div>

    <!-- 重复项列表 -->
    <div v-if="duplicates.length > 0" class="duplicates-panel">
      <div class="dup-header">
        <span class="dup-title">{{ t('dedup.dupTitle') }} ({{ t('dedup.dupItems', { n: duplicates.length }) }})</span>
        <button class="action-btn" @click="copyResult">📋 {{ t('dedup.copy') }}</button>
      </div>
      <div class="dup-list">
        <span v-for="(dup, i) in duplicates" :key="i" class="dup-tag">{{ dup }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../i18n'

const { t } = useI18n()

const inputText = ref('')
const outputText = ref('')
const ignoreCase = ref(false)
const trimSpaces = ref(true)
const removeEmpty = ref(true)
const sortResult = ref(false)
const separator = ref('\\n')
const customSeparator = ref('')
const panelWidth = ref(50)
const duplicates = ref<string[]>([])

function getSeparator(): string {
  if (separator.value === 'custom') return customSeparator.value || ','
  const s = separator.value
  if (s === '\\n') return '\n'
  if (s === '\\t') return '\t'
  return s
}

function onSeparatorChange() {
  handleDedup()
}

const originalLines = computed(() => {
  if (!inputText.value) return 0
  return inputText.value.split(getSeparator()).filter(l => removeEmpty.value ? l.trim() !== '' : true).length
})

const resultLines = computed(() => {
  if (!outputText.value) return 0
  return outputText.value.split(getSeparator()).filter(l => l).length
})

const duplicateCount = computed(() => {
  return duplicates.value.length
})

const highlightedOutput = computed(() => {
  if (!outputText.value) {
    return `<span class="output-placeholder">${t('dedup.outputPlaceholder')}</span>`
  }
  const sep = getSeparator()
  const items = outputText.value.split(sep)
  const dupSet = new Set(duplicates.value)
  return items.map(item => {
    const escaped = item.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    if (dupSet.has(item)) {
      return `<span class="dup-highlight" title="${t('dedup.dupHighlight')}">${escaped}</span>`
    }
    return escaped
  }).join(sep === '\n' ? '<br>' : sep.replace(/&/g, '&amp;').replace(/</g, '&lt;'))
})

function handleDedup() {
  if (!inputText.value.trim()) {
    outputText.value = ''
    duplicates.value = []
    return
  }

  const sep = getSeparator()
  let items = inputText.value.split(sep)

  if (trimSpaces.value) {
    items = items.map(l => l.trim())
  }

  if (removeEmpty.value) {
    items = items.filter(l => l.trim() !== '')
  }

  // 去重，同时记录重复项
  const seen = new Set<string>()
  const dupItems: string[] = []
  const result: string[] = []
  for (const item of items) {
    const key = ignoreCase.value ? item.toLowerCase() : item
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    } else {
      dupItems.push(item)
    }
  }

  if (sortResult.value) {
    result.sort()
  }

  outputText.value = result.join(sep)
  // 重复项去重
  duplicates.value = [...new Set(dupItems)]
}

function copyResult() {
  if (!outputText.value) return
  navigator.clipboard.writeText(outputText.value)
}

function clearAll() {
  inputText.value = ''
  outputText.value = ''
}

function loadSample() {
  inputText.value = `apple
banana
Apple
cherry
banana
date
cherry
elderberry
APPLE
fig
grape
date
honeydew
banana
kiwi
elderberry
fig
lemon`
  handleDedup()
}

function startResize(e: MouseEvent) {
  e.preventDefault()
  const startX = e.clientX
  const startWidth = panelWidth.value
  const onMouseMove = (ev: MouseEvent) => {
    const container = (ev.target as HTMLElement).closest('.main-content')
    const totalWidth = container?.getBoundingClientRect().width ?? window.innerWidth - 220
    const delta = ev.clientX - startX
    panelWidth.value = Math.min(70, Math.max(30, startWidth + (delta / totalWidth) * 100))
  }
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<style scoped>
.deduplicator {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary, #ffffff);
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-color, #eaecef);
  background: var(--bg-secondary, #f6f8fa);
  flex-shrink: 0;
  gap: 12px;
}

.toolbar-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.separator-select {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sep-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #586069);
  white-space: nowrap;
}

.sep-dropdown {
  padding: 3px 6px;
  border: 1px solid var(--border-color-secondary, #dfe2e5);
  border-radius: 4px;
  font-size: 12px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292e);
  outline: none;
  cursor: pointer;
}

.sep-dropdown:focus {
  border-color: var(--accent-color, #0366d6);
}

.sep-input {
  width: 100px;
  padding: 3px 8px;
  border: 1px solid var(--border-color-secondary, #dfe2e5);
  border-radius: 4px;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292e);
  outline: none;
}

.sep-input:focus {
  border-color: var(--accent-color, #0366d6);
}

.option-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary, #586069);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
}

.option-label input[type="checkbox"] {
  accent-color: var(--accent-color, #0366d6);
  cursor: pointer;
}

.toolbar-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
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

.action-btn:hover {
  background: var(--bg-tertiary, #e1e4e8);
  color: var(--text-primary, #24292e);
}

/* 统计栏 */
.stats-bar {
  display: flex;
  align-items: center;
  padding: 6px 16px;
  gap: 20px;
  border-bottom: 1px solid var(--border-color, #eaecef);
  background: var(--bg-secondary, #f6f8fa);
  flex-shrink: 0;
}

.stat-item {
  font-size: 12px;
  color: var(--text-secondary, #586069);
}

.stat-item strong {
  color: var(--text-primary, #24292e);
}

.stat-item.highlight strong {
  color: var(--danger-color, #d73a49);
}

/* 主内容区 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border-color, #eaecef);
  background: var(--bg-secondary, #f6f8fa);
  flex-shrink: 0;
}

.panel-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #586069);
}

.text-area {
  flex: 1;
  width: 100%;
  padding: 12px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292e);
  tab-size: 2;
}

.text-area.output {
  background: var(--bg-secondary, #f6f8fa);
}

.text-area::placeholder {
  color: var(--text-tertiary, #6a737d);
}

/* 输出高亮区域 */
.output-area {
  flex: 1;
  padding: 12px;
  overflow: auto;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: var(--bg-secondary, #f6f8fa);
  color: var(--text-primary, #24292e);
  white-space: pre-wrap;
  word-break: break-all;
}

.output-area :deep(.output-placeholder) {
  color: var(--text-tertiary, #6a737d);
}

.output-area :deep(.dup-highlight) {
  background: #fff3bf;
  border-radius: 2px;
  border-bottom: 2px solid #f59f00;
  padding: 0 2px;
}

/* 重复项面板 */
.duplicates-panel {
  border-top: 1px solid var(--border-color, #eaecef);
  max-height: 150px;
  overflow-y: auto;
  flex-shrink: 0;
  background: var(--bg-secondary, #f6f8fa);
}

.dup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border-color, #eaecef);
  background: var(--bg-tertiary, #e1e4e8);
}

.dup-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--danger-color, #d73a49);
}

.dup-list {
  padding: 8px 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.dup-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #ffebe9;
  color: #cf222e;
  border: 1px solid #ffa8a8;
  border-radius: 4px;
  font-family: 'SF Mono', monospace;
  font-size: 11px;
  line-height: 1.4;
}

.resizer {
  width: 4px;
  cursor: col-resize;
  background: var(--border-color, #eaecef);
  flex-shrink: 0;
  transition: background 0.15s;
}

.resizer:hover {
  background: var(--accent-color, #0366d6);
}
</style>
