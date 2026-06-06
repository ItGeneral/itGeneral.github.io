<template>
  <div class="regex-tester">
    <!-- 正则输入区 -->
    <div class="regex-input-area">
      <div class="regex-row">
        <span class="regex-slash">/</span>
        <input
          v-model="pattern"
          class="regex-pattern"
          :placeholder="t('regex.patternPlaceholder')"
          spellcheck="false"
          @input="handleMatch"
        />
        <span class="regex-slash">/</span>
        <input
          v-model="flags"
          class="regex-flags"
          placeholder="gi"
          spellcheck="false"
          maxlength="6"
          @input="handleMatch"
        />
      </div>
      <div v-if="regexError" class="regex-error">{{ regexError }}</div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧：测试文本 -->
      <div class="panel" :style="{ width: panelWidth + '%' }">
        <div class="panel-header">
          <span class="panel-title">{{ t('regex.testText') }}</span>
          <div class="panel-actions">
            <button class="action-btn" @click="loadSample" :title="t('regex.sample')">
              <span class="btn-icon">💡</span>
              <span class="btn-text">{{ t('regex.sample') }}</span>
            </button>
            <button class="action-btn" @click="clearText" :title="t('regex.clear')">
              <span class="btn-icon">🗑️</span>
              <span class="btn-text">{{ t('regex.clear') }}</span>
            </button>
            <button class="action-btn" @click="openHelp" :title="t('common.help')">
              <span class="btn-icon">📖</span>
              <span class="btn-text">{{ t('common.help') }}</span>
            </button>
          </div>
        </div>
        <textarea
          v-model="testText"
          class="test-textarea"
          :placeholder="t('regex.testPlaceholderFull')"
          spellcheck="false"
          @input="handleMatch"
        ></textarea>
      </div>

      <!-- 分割线 -->
      <div class="resizer" @mousedown="startResize"></div>

      <!-- 右侧：匹配结果 -->
      <div class="panel" :style="{ width: (100 - panelWidth) + '%' }">
        <div class="panel-header">
          <span class="panel-title">{{ t('regex.matchResult') }}</span>
          <span class="match-count">{{ t('regex.matchCount', { n: matchCount }) }}</span>
        </div>
        <!-- 高亮预览 -->
        <div class="match-preview" v-html="highlightedText"></div>

        <!-- 匹配详情 -->
        <div v-if="matches.length > 0" class="match-details">
          <div class="detail-title">{{ t('regex.captureGroups') }}</div>
          <div v-for="(match, i) in matches" :key="i" class="match-item">
            <div class="match-index">#{{ i + 1 }}</div>
            <div class="match-info">
              <span class="match-value">{{ match[0] }}</span>
              <span class="match-range">{{ t('regex.position') }} {{ match.index }} - {{ match.index + match[0].length }}</span>
            </div>
            <div v-if="match.groups && match.groups.length > 0" class="capture-groups">
              <div v-for="(group, gi) in match.groups" :key="gi" class="group-item">
                <span class="group-label">{{ t('regex.group', { n: gi + 1 }) }}</span>
                <span class="group-value">{{ group ?? t('regex.notCaptured') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 正则可视化（铁路图） -->
    <div class="visualize-area">
      <div class="visualize-header" @click="visualizeExpanded = !visualizeExpanded">
        <span class="visualize-title">Railroad Diagram</span>
        <span class="visualize-toggle">{{ visualizeExpanded ? '▼' : '▶' }}</span>
      </div>
      <div v-show="visualizeExpanded" class="visualize-container" ref="visualizeContainer"></div>
      <div v-show="visualizeExpanded && !pattern" class="visualize-empty">{{ t('regex.patternPlaceholder') }}</div>
    </div>

    <!-- 常用正则 -->
    <div class="common-patterns">
      <span class="patterns-label">{{ t('regex.commonPatterns') }}</span>
      <button
        v-for="p in commonPatterns"
        :key="p.name"
        class="pattern-tag"
        @click="applyPattern(p)"
        :title="p.desc"
      >{{ p.name }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from '../../i18n'
import { renderRailroad } from './railroad'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

// Help
const openHelp = () => {
  router.push('/help/regex-tester')
}

const pattern = ref('')
const flags = ref('g')
const testText = ref('')
const regexError = ref('')
const panelWidth = ref(50)
const visualizeExpanded = ref(false)
const visualizeContainer = ref<HTMLElement | null>(null)

const renderVisualize = () => {
  if (!visualizeExpanded.value || !visualizeContainer.value) return
  if (!pattern.value) return

  const container = visualizeContainer.value
  container.innerHTML = ''

  const result = renderRailroad(pattern.value)
  if (result) {
    container.innerHTML = result.svg
  } else {
    container.innerHTML = '<div style="padding:20px;color:#d73a49;text-align:center">Failed to parse regex</div>'
  }
}

// 监听 pattern/flags/expanded 变化时重新渲染

watch([pattern, flags, visualizeExpanded], () => {
  if (pattern.value && !visualizeExpanded.value) {
    visualizeExpanded.value = true
  }
  if (visualizeExpanded.value) {
    nextTick(() => renderVisualize())
  }
})

interface MatchDetail {
  0: string
  index: number
  groups: (string | undefined)[]
}

const matches = ref<MatchDetail[]>([])

const matchCount = computed(() => matches.value.length)

const commonPatterns = computed(() => [
  { name: t('regex.pattern.email'), pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g', desc: t('regex.desc.email') },
  { name: t('regex.pattern.phone'), pattern: '1[3-9]\\d{9}', flags: 'g', desc: t('regex.desc.phone') },
  { name: t('regex.pattern.url'), pattern: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[\\w\\-.,@?^=%&:/~+#]*', flags: 'g', desc: t('regex.desc.url') },
  { name: t('regex.pattern.ip'), pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', flags: 'g', desc: t('regex.desc.ip') },
  { name: t('regex.pattern.chinese'), pattern: '[\\u4e00-\\u9fa5]+', flags: 'g', desc: t('regex.desc.chinese') },
  { name: t('regex.pattern.date'), pattern: '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}', flags: 'g', desc: t('regex.desc.date') },
  { name: t('regex.pattern.idcard'), pattern: '\\d{17}[\\dXx]', flags: 'g', desc: t('regex.desc.idcard') },
  { name: t('regex.pattern.html'), pattern: '<[^>]+>', flags: 'g', desc: t('regex.desc.html') },
  { name: t('regex.pattern.zipcode'), pattern: '[1-9]\\d{5}', flags: 'g', desc: t('regex.desc.zipcode') },
  { name: t('regex.pattern.plate'), pattern: '[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]?', flags: 'g', desc: t('regex.desc.plate') },
  { name: t('regex.pattern.password'), pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$', flags: '', desc: t('regex.desc.password') },
  { name: t('regex.pattern.hex'), pattern: '#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})', flags: 'g', desc: t('regex.desc.hex') },
  { name: t('regex.pattern.mac'), pattern: '([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})', flags: 'g', desc: t('regex.desc.mac') },
  { name: t('regex.pattern.amount'), pattern: '^\\d+(\\.\\d{1,2})?$', flags: 'm', desc: t('regex.desc.amount') },
  { name: t('regex.pattern.phoneIntl'), pattern: '(\\+?\\d{1,3}[- ]?)?\\d{10}', flags: 'g', desc: t('regex.desc.phoneIntl') },
  { name: t('regex.pattern.qq'), pattern: '[1-9][0-9]{4,10}', flags: 'g', desc: t('regex.desc.qq') },
])

const highlightedText = computed(() => {
  if (!testText.value || matches.value.length === 0) {
    return escapeHtml(testText.value || `${t('regex.resultPlaceholder')}`)
  }
  let html = ''
  let lastIndex = 0
  for (const match of matches.value) {
    html += escapeHtml(testText.value.slice(lastIndex, match.index))
    html += `<mark class="match-highlight">${escapeHtml(match[0])}</mark>`
    lastIndex = match.index + match[0].length
  }
  html += escapeHtml(testText.value.slice(lastIndex))
  return html
})

function handleMatch() {
  matches.value = []
  regexError.value = ''
  if (!pattern.value || !testText.value) return

  try {
    const regex = new RegExp(pattern.value, flags.value)
    const results: MatchDetail[] = []
    if (flags.value.includes('g')) {
      let m: RegExpExecArray | null
      while ((m = regex.exec(testText.value)) !== null) {
        results.push({
          0: m[0],
          index: m.index,
          groups: m.slice(1),
        })
        if (m[0].length === 0) regex.lastIndex++
      }
    } else {
      const m = regex.exec(testText.value)
      if (m) {
        results.push({
          0: m[0],
          index: m.index,
          groups: m.slice(1),
        })
      }
    }
    matches.value = results
  } catch (e: unknown) {
    regexError.value = e instanceof Error ? e.message : String(e)
  }
}

function applyPattern(p: { pattern: string; flags: string }) {
  pattern.value = p.pattern
  flags.value = p.flags
  handleMatch()
}

function loadSample() {
  pattern.value = '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'
  flags.value = 'gi'
  testText.value = `联系我们：
邮箱：admin@example.com
技术支持：tech-support@company.cn
客服：service@my-site.org

无效地址：
abc@.com
@invalid.com

更多联系方式：
dev.team+test@gmail.com
user_name@sub.domain.co.uk`
  handleMatch()
}

function clearText() {
  testText.value = ''
  matches.value = []
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
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
.regex-tester {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary, #ffffff);
}

/* 正则输入区 */
.regex-input-area {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, #eaecef);
  background: var(--bg-secondary, #f6f8fa);
  flex-shrink: 0;
}

.regex-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.regex-slash {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent-color, #0366d6);
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.regex-pattern {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color-secondary, #dfe2e5);
  border-radius: 6px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292e);
  outline: none;
  transition: border-color 0.15s;
}

.regex-pattern:focus {
  border-color: var(--accent-color, #0366d6);
  box-shadow: 0 0 0 2px rgba(3, 102, 214, 0.15);
}

.regex-flags {
  width: 56px;
  padding: 8px 10px;
  border: 1px solid var(--border-color-secondary, #dfe2e5);
  border-radius: 6px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  text-align: center;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292e);
  outline: none;
}

.regex-flags:focus {
  border-color: var(--accent-color, #0366d6);
}

.regex-error {
  margin-top: 6px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--danger-color, #d73a49);
  background: #ffebe9;
  border-radius: 4px;
}

/* 正则可视化 */
.visualize-area {
  border-bottom: 1px solid var(--border-color, #eaecef);
  background: #fafbfc;
  flex-shrink: 0;
}

.visualize-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.visualize-header:hover {
  background: #f0f0f0;
}

.visualize-title {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.visualize-toggle {
  font-size: 10px;
  color: #999;
}

.visualize-container {
  overflow: auto;
  max-height: 300px;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #eaecef;
}

.visualize-container > svg {
  min-width: 100%;
}

.visualize-empty {
  padding: 20px;
  text-align: center;
  color: #aaa;
  font-size: 13px;
  border-top: 1px solid #eaecef;
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

.panel-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid var(--border-color-secondary, #dfe2e5);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary, #586069);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: var(--bg-tertiary, #e1e4e8);
  color: var(--text-primary, #24292e);
  border-color: var(--accent-color, #0366d6);
}

.action-btn .btn-icon {
  font-size: 13px;
}

.action-btn .btn-text {
  font-size: 12px;
}

.match-count {
  font-size: 11px;
  color: var(--accent-color, #0366d6);
  font-weight: 600;
}

.test-textarea {
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
}

.test-textarea::placeholder {
  color: var(--text-tertiary, #6a737d);
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

/* 匹配预览 */
.match-preview {
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

.match-preview :deep(.match-highlight) {
  background: #fff3bf;
  border-radius: 2px;
  padding: 1px 0;
  border-bottom: 2px solid #f59f00;
}

.match-preview :deep(.placeholder) {
  color: var(--text-tertiary, #6a737d);
}

/* 匹配详情 */
.match-details {
  border-top: 1px solid var(--border-color, #eaecef);
  max-height: 200px;
  overflow-y: auto;
  flex-shrink: 0;
}

.detail-title {
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary, #586069);
  background: var(--bg-tertiary, #e1e4e8);
}

.match-item {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-color, #eaecef);
}

.match-item:last-child {
  border-bottom: none;
}

.match-index {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  background: var(--accent-color, #0366d6);
  padding: 1px 6px;
  border-radius: 10px;
  margin-right: 8px;
}

.match-info {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.match-value {
  font-family: 'SF Mono', monospace;
  font-size: 12px;
  color: var(--text-primary, #24292e);
  font-weight: 600;
}

.match-range {
  font-size: 11px;
  color: var(--text-tertiary, #6a737d);
}

.capture-groups {
  margin-top: 6px;
  padding-left: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--bg-secondary, #f6f8fa);
  border-radius: 4px;
  font-size: 11px;
}

.group-label {
  color: var(--text-tertiary, #6a737d);
  font-weight: 600;
}

.group-value {
  font-family: 'SF Mono', monospace;
  color: var(--text-primary, #24292e);
}

/* 常用正则 */
.common-patterns {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-top: 1px solid var(--border-color, #eaecef);
  background: var(--bg-secondary, #f6f8fa);
  flex-shrink: 0;
  overflow-x: auto;
}

.patterns-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary, #6a737d);
  white-space: nowrap;
}

.pattern-tag {
  padding: 3px 10px;
  border: 1px solid var(--border-color-secondary, #dfe2e5);
  border-radius: 12px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-secondary, #586069);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.pattern-tag:hover {
  border-color: var(--accent-color, #0366d6);
  color: var(--accent-color, #0366d6);
  background: rgba(3, 102, 214, 0.05);
}
</style>
