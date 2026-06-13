<template>
  <div class="datetime-tool">
    <!-- 当前时间显示 -->
    <div class="current-time-section">
      <div class="section-header">
        <span class="section-title">{{ t('dt.currentTime') }}</span>
        <span class="live-badge">
          <span class="pulse"></span>
          {{ t('dt.live') }}
        </span>
      </div>
      <div class="time-display">
        <div class="main-time">{{ currentReadable }}</div>
        <div class="timestamp-list">
          <div class="timestamp-item">
            <span class="ts-label">Unix (s)</span>
            <code class="ts-value">{{ currentTimestamp }}</code>
            <button class="copy-btn" @click="copy(String(currentTimestamp), 1)" :title="t('dt.copy')">
              <svg v-if="copiedIndex !== 1" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
              </svg>
              <svg v-else viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
              </svg>
            </button>
          </div>
          <div class="timestamp-item">
            <span class="ts-label">Unix (ms)</span>
            <code class="ts-value">{{ currentTimestampMs }}</code>
            <button class="copy-btn" @click="copy(String(currentTimestampMs), 2)" :title="t('dt.copy')">
              <svg v-if="copiedIndex !== 2" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
              </svg>
              <svg v-else viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 转换器区域 -->
    <div class="converters-container">
      <!-- 时间戳转日期 -->
      <div class="converter-panel">
        <div class="panel-header">
          <span class="panel-title">{{ t('dt.stampToDate') }}</span>
        </div>
        <div class="panel-body">
          <div class="input-group">
            <input
              v-model="inputTimestamp"
              class="tool-input"
              type="text"
              :placeholder="t('dt.stampPlaceholder')"
              @input="convertTimestamp"
            />
            <div v-if="convertError" class="error-message">
              {{ convertError }}
            </div>
          </div>

          <div v-if="convertedDate && !convertError" class="results-area">
            <div v-for="(fmt, idx) in convertedFormats" :key="fmt.label" class="result-row">
              <span class="result-label">{{ fmt.label }}</span>
              <code class="result-value">{{ fmt.value }}</code>
              <button class="copy-btn" @click="copy(fmt.value, idx + 10)" :title="t('dt.copy')">
                <svg v-if="copiedIndex !== idx + 10" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                  <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                </svg>
                <svg v-else viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 日期转时间戳 + 快捷操作 -->
      <div class="converter-panel">
        <div class="panel-header">
          <span class="panel-title">{{ t('dt.dateToStamp') }}</span>
        </div>
        <div class="panel-body">
          <div class="input-group">
            <input
              v-model="inputDate"
              class="tool-input"
              type="text"
              :placeholder="t('dt.datePlaceholder')"
              @input="convertDate"
            />
            <div v-if="dateError" class="error-message">
              {{ dateError }}
            </div>
          </div>

          <div v-if="convertedStamp && !dateError" class="results-area">
            <div class="result-row">
              <span class="result-label">Unix (s)</span>
              <code class="result-value">{{ convertedStamp.s }}</code>
              <button class="copy-btn" @click="copy(String(convertedStamp.s), 20)" :title="t('dt.copy')">
                <svg v-if="copiedIndex !== 20" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                  <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                </svg>
                <svg v-else viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                </svg>
              </button>
            </div>
            <div class="result-row">
              <span class="result-label">Unix (ms)</span>
              <code class="result-value">{{ convertedStamp.ms }}</code>
              <button class="copy-btn" @click="copy(String(convertedStamp.ms), 21)" :title="t('dt.copy')">
                <svg v-if="copiedIndex !== 21" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                  <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                </svg>
                <svg v-else viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 快捷操作 -->
          <div class="shortcuts-area">
            <div class="shortcuts-header">
              <span class="shortcuts-title">{{ t('dt.shortcuts') }}</span>
            </div>
            <div class="shortcuts-grid">
              <button
                v-for="shortcut in shortcuts"
                :key="shortcut.key"
                class="shortcut-btn"
                :class="{ active: activeShortcut === shortcut.key }"
                @click="setQuick(shortcut.key)"
              >
                {{ shortcut.label }}
              </button>
            </div>

            <transition name="fade">
              <div v-if="quickResult" class="quick-results">
                <div class="results-area">
                  <div v-for="(item, idx) in quickResult" :key="item.label" class="result-row">
                    <span class="result-label">{{ item.label }}</span>
                    <code class="result-value">{{ item.value }}</code>
                    <button class="copy-btn" @click="copy(item.value, idx + 30)" :title="t('dt.copy')">
                      <svg v-if="copiedIndex !== idx + 30" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
                        <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
                      </svg>
                      <svg v-else viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 提示 -->
    <transition name="toast">
      <div v-if="toast.show" class="toast">
        ✓ {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../../i18n'

const { t, locale } = useI18n()

// Toast state
const toast = ref({ show: false, message: '' })
const copiedIndex = ref<number | null>(null)

// Current time
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => { now.value = Date.now() }, 1000)
  // 初始化时填充当前时间戳到时间戳输入框（毫秒级）
  inputTimestamp.value = String(Date.now())
  convertTimestamp()
})

onUnmounted(() => {
  clearInterval(timer)
})

const currentTimestamp = computed(() => Math.floor(now.value / 1000))
const currentTimestampMs = computed(() => now.value)
const currentReadable = computed(() => formatDate(new Date(now.value)))

// Timestamp to Date
const inputTimestamp = ref('')
const convertError = ref('')
const convertedDate = ref<Date | null>(null)

const convertedFormats = computed(() => {
  if (!convertedDate.value) return []
  const d = convertedDate.value
  return [
    { label: 'ISO 8601', value: d.toISOString() },
    { label: t('dt.readable'), value: formatDate(d) },
    { label: t('dt.dateOnly'), value: formatDateOnly(d) },
    { label: t('dt.timeOnly'), value: formatTimeOnly(d) },
    { label: 'UTC', value: d.toUTCString() },
  ]
})

function convertTimestamp() {
  convertError.value = ''
  convertedDate.value = null
  // 收起快捷操作结果
  quickResult.value = null
  activeShortcut.value = null

  const raw = inputTimestamp.value.trim()
  if (!raw) return

  const num = Number(raw)
  if (isNaN(num) || num <= 0) {
    convertError.value = t('dt.invalidTimestamp')
    return
  }

  // 自动识别：长度 <= 10 则为秒，否则为毫秒
  const ms = raw.length <= 10 ? num * 1000 : num

  if (ms > 1e15) {
    convertError.value = t('dt.invalidTimestamp')
    return
  }

  convertedDate.value = new Date(ms)
}

// Date to Timestamp
const inputDate = ref('')
const convertedStamp = ref<{ s: number; ms: number } | null>(null)
const dateError = ref('')

function convertDate() {
  convertedStamp.value = null
  dateError.value = ''
  // 收起快捷操作结果
  quickResult.value = null
  activeShortcut.value = null

  if (!inputDate.value.trim()) return

  const d = new Date(inputDate.value.trim())
  if (isNaN(d.getTime())) {
    dateError.value = t('dt.invalidTimestamp')
    return
  }

  convertedStamp.value = {
    s: Math.floor(d.getTime() / 1000),
    ms: d.getTime()
  }
}

// Shortcuts
const activeShortcut = ref<string | null>(null)
const quickResult = ref<{ label: string; value: string }[] | null>(null)

const shortcuts = computed(() => [
  { key: 'today', label: t('dt.today') },
  { key: 'yesterday', label: t('dt.yesterday') },
  { key: 'week', label: t('dt.thisWeek') },
  { key: 'month', label: t('dt.thisMonth') },
  { key: 'year', label: t('dt.thisYear') },
])

function setQuick(type: string) {
  activeShortcut.value = type
  const d = new Date()
  let start: Date, end: Date

  if (type === 'today') {
    start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  } else if (type === 'yesterday') {
    start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)
    end = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 23, 59, 59, 999)
  } else if (type === 'week') {
    const day = d.getDay() || 7
    start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day + 1)
    end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  } else if (type === 'month') {
    start = new Date(d.getFullYear(), d.getMonth(), 1)
    end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  } else {
    start = new Date(d.getFullYear(), 0, 1)
    end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
  }

  quickResult.value = [
    { label: t('dt.start'), value: String(Math.floor(start.getTime() / 1000)) },
    { label: t('dt.end'), value: String(Math.floor(end.getTime() / 1000)) },
    { label: t('dt.startReadable'), value: formatDate(start) },
    { label: t('dt.endReadable'), value: formatDate(end) },
  ]
}

// Format functions
function formatDate(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${mo}-${da} ${h}:${mi}:${s}`
}

function formatDateOnly(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${da}`
}

function formatTimeOnly(d: Date): string {
  return d.toLocaleTimeString(locale.value === 'zh' ? 'zh-CN' : 'en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
}

// Copy function
async function copy(text: string, index?: number) {
  try {
    await navigator.clipboard.writeText(text)
    if (index !== undefined) {
      copiedIndex.value = index
      setTimeout(() => {
        copiedIndex.value = null
      }, 2000)
    }
    showToast(t('dt.copied'))
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    if (index !== undefined) {
      copiedIndex.value = index
      setTimeout(() => {
        copiedIndex.value = null
      }, 2000)
    }
    showToast(t('dt.copied'))
  }
}

function showToast(message: string) {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 2000)
}
</script>

<style scoped>
.datetime-tool {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, #ffffff);
}

/* 当前时间区域 */
.current-time-section {
  border-bottom: 1px solid var(--border-color, #eaecef);
  background: var(--bg-secondary, #f6f8fa);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid var(--border-color, #eaecef);
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary, #586069);
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 12px;
  font-size: 11px;
  color: #155724;
}

.pulse {
  width: 6px;
  height: 6px;
  background: #28a745;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.time-display {
  padding: 12px;
  text-align: center;
}

.main-time {
  font-size: 24px;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  color: var(--text-primary, #24292e);
  margin-bottom: 12px;
}

.timestamp-list {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.timestamp-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #eaecef);
  border-radius: 6px;
}

.ts-label {
  font-size: 10px;
  color: var(--text-secondary, #586069);
}

.ts-value {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 12px;
  color: var(--text-primary, #24292e);
}

.copy-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.copy-icon:hover {
  opacity: 1;
}

/* 转换器容器 */
.converters-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border-color, #eaecef);
  flex: 1;
  overflow: hidden;
}

.converter-panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, #ffffff);
  overflow: hidden;
}

.panel-header {
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-color, #eaecef);
  background: var(--bg-secondary, #f6f8fa);
}

.panel-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #586069);
}

.panel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 16px;
}

/* 输入组 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.tool-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #eaecef);
  border-radius: 6px;
  font-size: 13px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292e);
  outline: none;
  transition: all 0.15s;
}

.tool-input:focus {
  border-color: var(--accent-color, #0366d6);
  box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
}

.unit-toggle {
  display: flex;
  gap: 4px;
  background: var(--bg-secondary, #f6f8fa);
  padding: 4px;
  border-radius: 6px;
}

.unit-btn {
  flex: 1;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-secondary, #586069);
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.unit-btn:hover {
  color: var(--text-primary, #24292e);
}

.unit-btn.active {
  background: var(--bg-primary, #ffffff);
  color: var(--accent-color, #0366d6);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.error-message {
  padding: 8px 12px;
  background: #ffeef0;
  border: 1px solid #fdc1c5;
  border-radius: 6px;
  color: #d73a49;
  font-size: 12px;
}

/* 结果区域 */
.results-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary, #f6f8fa);
  border: 1px solid var(--border-color, #eaecef);
  border-radius: 6px;
}

.result-label {
  font-size: 11px;
  color: var(--text-secondary, #586069);
  min-width: 60px;
  font-weight: 500;
}

.result-value {
  flex: 1;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 12px;
  color: var(--text-primary, #24292e);
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.copy-btn:hover {
  opacity: 1;
}

/* 快捷操作区域 */
.shortcuts-area {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color, #eaecef);
}

.shortcuts-header {
  margin-bottom: 12px;
}

.shortcuts-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #586069);
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 6px;
}

.shortcut-btn {
  padding: 6px 10px;
  font-size: 12px;
  color: var(--text-secondary, #586069);
  background: var(--bg-secondary, #f6f8fa);
  border: 1px solid var(--border-color, #eaecef);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.shortcut-btn:hover {
  background: var(--bg-tertiary, #e1e4e8);
  color: var(--text-primary, #24292e);
}

.shortcut-btn.active {
  background: var(--accent-color, #0366d6);
  color: #ffffff;
  border-color: var(--accent-color, #0366d6);
}

.quick-results {
  margin-top: 12px;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background: #28a745;
  color: #ffffff;
  border-radius: 6px;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

/* 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .converters-container {
    grid-template-columns: 1fr;
  }

  .timestamp-list {
    flex-direction: column;
  }

  .main-time {
    font-size: 24px;
  }
}
</style>
