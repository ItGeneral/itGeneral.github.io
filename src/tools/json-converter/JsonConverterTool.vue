<template>
  <div class="json-converter">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-groups">
        <div v-for="group in groups" :key="group" class="toolbar-group">
          <button
            v-for="action in getActionsByGroup(group)"
            :key="action.mode"
            :class="['toolbar-btn', { active: currentMode === action.mode }]"
            @click="handleConvert(action.mode)"
            :title="t(action.label)"
          >
            <span class="btn-icon">{{ action.icon }}</span>
            <span class="btn-label">{{ t(action.label) }}</span>
          </button>
        </div>
      </div>
      <div class="toolbar-actions">
        <button class="toolbar-btn" @click="copyOutput" :title="t('json.copy')">
          <span class="btn-icon">📋</span>
          <span class="btn-label">{{ t('json.copy') }}</span>
        </button>
        <button class="toolbar-btn" @click="clearAll" :title="t('json.clear')">
          <span class="btn-icon">🗑️</span>
          <span class="btn-label">{{ t('json.clear') }}</span>
        </button>
        <button class="toolbar-btn" @click="loadSample" :title="t('json.sample')">
          <span class="btn-icon">💡</span>
          <span class="btn-label">{{ t('json.sample') }}</span>
        </button>
        <button class="toolbar-btn" @click="openHelp" :title="t('common.help')">
          <span class="btn-icon">📖</span>
          <span class="btn-label">{{ t('common.help') }}</span>
        </button>
      </div>
    </div>

    <!-- Path 查询输入 -->
    <div v-if="currentMode === 'path'" class="path-bar">
      <span class="path-label">{{ t('json.pathLabel') }}</span>
      <input
        v-model="pathQuery"
        class="path-input"
        placeholder="$.key.nested[0]"
        @input="handlePathQuery"
      />
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧输入 -->
      <div class="panel input-panel" :style="{ width: panelWidth + '%' }">
        <div class="panel-header">
          <span class="panel-title">{{ t('json.input') }}</span>
          <span :class="['validity-badge', isValid ? 'valid' : 'invalid']">
            {{ isValid ? '✓ ' + t('json.valid') : '✗ ' + t('json.invalid') }}
          </span>
        </div>
        <textarea
          ref="inputRef"
          v-model="inputJson"
          class="json-textarea"
          :placeholder="t('json.inputPlaceholder')"
          spellcheck="false"
          @input="handleInput"
        ></textarea>
      </div>

      <!-- 拖拽分割线 -->
      <div class="resizer" @mousedown="startResize"></div>

      <!-- 右侧输出 -->
      <div class="panel output-panel" :style="{ width: (100 - panelWidth) + '%' }">
        <div class="panel-header">
          <span class="panel-title">{{ t('json.output') }} ({{ outputLabel }})</span>
          <span v-if="error" class="error-badge">{{ error }}</span>
        </div>
        <pre v-if="outputText" class="output-pre"><code ref="outputCodeRef" :class="outputLangClass" v-html="highlightedOutput"></code></pre>
        <div v-else class="output-placeholder">{{ t('json.outputPlaceholder') }}</div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <span class="status-item">{{ t('json.chars') }}: {{ inputJson.length }}</span>
      <span class="status-item">{{ t('json.lines') }}: {{ lineCount }}</span>
      <span class="status-item" v-if="outputText.length">{{ t('json.outputChars') }}: {{ outputText.length }} {{ t('json.chars') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

// Help
const openHelp = () => {
  router.push('/help/json-converter')
}

import { convert, CONVERT_ACTIONS, type ConvertMode } from './converters'
import hljs from 'highlight.js/lib/core'
import 'highlight.js/styles/github.css'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import xml from 'highlight.js/lib/languages/xml'
import typescript from 'highlight.js/lib/languages/typescript'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'
import plaintext from 'highlight.js/lib/languages/plaintext'

hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('java', java)
hljs.registerLanguage('go', go)
hljs.registerLanguage('plaintext', plaintext)

const inputJson = ref('')
const outputText = ref('')
const currentMode = ref<ConvertMode>('format')
const pathQuery = ref('$')
const panelWidth = ref(50)
const error = ref('')
const isValid = ref(true)
const inputRef = ref<HTMLTextAreaElement | null>(null)

const groups = ['format', 'convert', 'code', 'analyze'] as const

const modeToLang: Record<ConvertMode, string> = {
  format: 'json',
  minify: 'json',
  yaml: 'yaml',
  xml: 'xml',
  csv: 'plaintext',
  typescript: 'typescript',
  java: 'java',
  go: 'go',
  schema: 'json',
  path: 'json',
}

const outputLangClass = computed(() => `language-${modeToLang[currentMode.value]}`)

const highlightedOutput = computed(() => {
  if (!outputText.value) return ''
  const lang = modeToLang[currentMode.value]
  try {
    return hljs.highlight(outputText.value, { language: lang }).value
  } catch {
    return outputText.value
  }
})

const outputLabel = computed(() => {
  const action = CONVERT_ACTIONS.find(a => a.mode === currentMode.value)
  return action ? t(action.label) : 'JSON'
})

const lineCount = computed(() => {
  if (!inputJson.value) return 0
  return inputJson.value.split('\n').length
})

function getActionsByGroup(group: string) {
  return CONVERT_ACTIONS.filter(a => a.group === group)
}

function handleInput() {
  validateJson()
  if (currentMode.value !== 'path') {
    doConvert()
  }
}

function validateJson() {
  if (!inputJson.value.trim()) {
    isValid.value = true
    error.value = ''
    return
  }
  try {
    JSON.parse(inputJson.value)
    isValid.value = true
    error.value = ''
  } catch (e) {
    isValid.value = false
    error.value = ''
  }
}

function handleConvert(mode: ConvertMode) {
  currentMode.value = mode
  doConvert()
}

function handlePathQuery() {
  doConvert()
}

function doConvert() {
  if (!inputJson.value.trim()) {
    outputText.value = ''
    error.value = ''
    return
  }
  try {
    error.value = ''
    outputText.value = convert(inputJson.value, currentMode.value, pathQuery.value)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : String(e)
    outputText.value = ''
  }
}

function copyOutput() {
  if (!outputText.value) return
  navigator.clipboard.writeText(outputText.value)
}

function clearAll() {
  inputJson.value = ''
  outputText.value = ''
  error.value = ''
  isValid.value = true
}

function loadSample() {
  inputJson.value = JSON.stringify({
    name: "张三",
    age: 25,
    email: "zhangsan@example.com",
    isActive: true,
    address: {
      city: "北京",
      district: "海淀区",
      zipCode: "100080"
    },
    tags: ["developer", "vue", "typescript"],
    projects: [
      { id: 1, name: "AI Tools", status: "active" },
      { id: 2, name: "JSON Converter", status: "pending" }
    ]
  }, null, 2)
  handleInput()
}

// 拖拽调整面板宽度
function startResize(e: MouseEvent) {
  e.preventDefault()
  const startX = e.clientX
  const startWidth = panelWidth.value

  const onMouseMove = (ev: MouseEvent) => {
    const container = (ev.target as HTMLElement).closest('.main-content')
    const totalWidth = container?.getBoundingClientRect().width ?? window.innerWidth - 220
    const delta = ev.clientX - startX
    const newWidth = startWidth + (delta / totalWidth) * 100
    panelWidth.value = Math.min(70, Math.max(30, newWidth))
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
.json-converter {
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

.toolbar-btn.active {
  background: var(--accent-color, #0366d6);
  color: #ffffff;
  border-color: var(--accent-color, #0366d6);
}

.btn-icon {
  font-size: 13px;
}

.btn-label {
  font-size: 12px;
}

/* Path 查询栏 */
.path-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 8px;
  border-bottom: 1px solid var(--border-color, #eaecef);
  background: var(--bg-secondary, #f6f8fa);
}

.path-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #586069);
  white-space: nowrap;
}

.path-input {
  flex: 1;
  padding: 4px 10px;
  border: 1px solid var(--border-color-secondary, #dfe2e5);
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292e);
  outline: none;
}

.path-input:focus {
  border-color: var(--accent-color, #0366d6);
  box-shadow: 0 0 0 2px rgba(3, 102, 214, 0.15);
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

.validity-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.validity-badge.valid {
  background: #dcffe4;
  color: #1a7f37;
}

.validity-badge.invalid {
  background: #ffebe9;
  color: #cf222e;
}

.error-badge {
  font-size: 11px;
  color: var(--danger-color, #d73a49);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.json-textarea {
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

.json-textarea::placeholder {
  color: var(--text-tertiary, #6a737d);
}

/* 输出高亮区域 */
.output-pre {
  flex: 1;
  margin: 0;
  padding: 12px;
  overflow: auto;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  background: var(--bg-secondary, #f6f8fa);
  color: var(--text-primary, #24292e);
  tab-size: 2;
}

.output-pre code {
  font-family: inherit;
  font-size: inherit;
  background: transparent !important;
  padding: 0 !important;
}

.output-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  color: var(--text-tertiary, #6a737d);
  background: var(--bg-secondary, #f6f8fa);
}

/* 分割线 */
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

/* 状态栏 */
.status-bar {
  display: flex;
  align-items: center;
  padding: 4px 16px;
  gap: 16px;
  border-top: 1px solid var(--border-color, #eaecef);
  background: var(--bg-secondary, #f6f8fa);
  flex-shrink: 0;
}

.status-item {
  font-size: 11px;
  color: var(--text-tertiary, #6a737d);
}
</style>
