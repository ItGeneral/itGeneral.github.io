<template>
  <div class="stats-bar">
    <div class="stats-left">
      <span class="stat-item">{{ t('md.words') }}: {{ wordCount }}</span>
      <span class="stat-item">{{ t('md.chars') }}: {{ charCount }}</span>
      <span class="stat-item">{{ t('md.lines') }}: {{ lineCount }}</span>
      <span class="stat-item">{{ t('md.readTime') }}: {{ readTime }} {{ t('md.minutes') }}</span>
    </div>

    <div class="stats-right">
      <span class="stat-item">{{ t('md.cursor') }}: {{ cursorPosition.line }}:{{ cursorPosition.column }}</span>
      <span class="stat-item save-status" :class="saveStatusClass">
        {{ saveStatusText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { eventBus } from '../Common/EventBus'
import { useI18n } from '../../../../i18n'

const { t } = useI18n()

const wordCount = ref(0)
const charCount = ref(0)
const lineCount = ref(0)
const cursorPosition = ref({ line: 1, column: 1 })
const saveStatus = ref<'saved' | 'saving' | 'unsaved'>('saved')

const readTime = computed(() => {
  return Math.max(1, Math.ceil(wordCount.value / 200))
})

const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case 'saved': return t('md.saved')
    case 'saving': return t('md.saving')
    case 'unsaved': return t('md.unsaved')
  }
})

const saveStatusClass = computed(() => {
  return `status-${saveStatus.value}`
})

const updateStats = (content: string) => {
  const text = content.trim()
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length
  wordCount.value = chineseChars + englishWords
  charCount.value = text.length
  lineCount.value = text.split('\n').length
}

onMounted(() => {
  eventBus.on('content-changed', (data) => {
    updateStats(data.content)
  })

  eventBus.on('cursor-moved', (data) => {
    cursorPosition.value = { line: data.line, column: data.column }
  })

  eventBus.on('save-status-changed', (status) => {
    saveStatus.value = status
  })
})

defineExpose({ updateStats })
</script>

<style scoped>
.stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 16px;
  background: var(--bg-secondary, #f6f8fa);
  border-top: 1px solid var(--border-color, #eaecef);
  height: 30px;
  font-size: 12px;
  color: var(--text-secondary, #586069);
}

.stats-left, .stats-right {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: inline-block;
}

.save-status { font-weight: 500; }
.save-status.status-saved { color: var(--success-color, #28a745); }
.save-status.status-saving { color: var(--accent-color, #0366d6); }
.save-status.status-unsaved { color: var(--danger-color, #d73a49); }
</style>
