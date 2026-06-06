<template>
  <div class="help-page">
    <div class="help-header">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
        <span class="back-text">{{ t('common.back') }}</span>
      </button>
      <h1 class="help-title">{{ toolName }}</h1>
    </div>
    <div class="help-content" ref="contentRef">
      <div v-if="renderedContent" v-html="renderedContent" class="markdown-body"></div>
      <div v-else class="loading-text">{{ t('common.loading') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '../i18n'
import { marked } from 'marked'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const toolId = ref(route.params.toolId as string)
const content = ref('')
const contentRef = ref<HTMLElement | null>(null)

const toolName = computed(() => {
  const toolNames: Record<string, string> = {
    'ai-chat': t('tool.aichat.name'),
    'json-converter': t('tool.json.name'),
    'regex-tester': t('tool.regex.name'),
    'deduplicator': t('tool.dedup.name'),
    'markdown-editor': t('tool.markdown.name')
  }
  return toolNames[toolId.value] || t('common.userGuide')
})

const renderedContent = computed(() => {
  if (!content.value) return ''
  return marked(content.value)
})

const goBack = () => {
  router.back()
}

const loadContent = async () => {
  const lang = locale.value === 'zh' ? 'zh-CN' : 'en-US'
  try {
    const module = await import(`../tools/${toolId.value}/GUIDE.${lang}.md?raw`)
    content.value = module.default
    // Scroll to top after content loads
    await nextTick()
    if (contentRef.value) {
      contentRef.value.scrollTop = 0
    }
  } catch (e) {
    console.error('Failed to load help content:', e)
    content.value = `# Help content not found\n\nCould not load help documentation for ${toolId.value}`
  }
}

// Watch for toolId changes
watch(() => route.params.toolId, (newToolId) => {
  toolId.value = newToolId as string
  loadContent()
})

// Watch for locale changes
watch(locale, () => {
  loadContent()
})

onMounted(() => {
  loadContent()
})
</script>

<style scoped>
.help-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary, #ffffff);
}

.help-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-color, #eaecef);
  background: var(--bg-secondary, #f6f8fa);
  gap: 16px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--border-color, #d0d7de);
  border-radius: 8px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292f);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.back-btn:hover {
  background: var(--bg-tertiary, #e1e4e8);
  border-color: var(--accent-color, #0366d6);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.back-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.back-icon {
  font-size: 16px;
  font-weight: bold;
}

.back-text {
  font-size: 14px;
}

.help-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #24292f);
  margin: 0;
  flex: 1;
}

.help-content {
  flex: 1;
  min-height: 0;
  padding: 24px;
  padding-bottom: 80px;
  overflow-y: auto;
  overflow-x: hidden;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.help-content::-webkit-scrollbar {
  width: 10px;
}

.help-content::-webkit-scrollbar-track {
  background: transparent;
}

.help-content::-webkit-scrollbar-thumb {
  background: #d0d7de;
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.help-content::-webkit-scrollbar-thumb:hover {
  background: #aeb8c1;
  background-clip: content-box;
}

.markdown-body {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary, #24292f);
}

.markdown-body :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid var(--border-color, #eaecef);
  padding-bottom: 0.3em;
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
}

.markdown-body :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid var(--border-color, #eaecef);
  padding-bottom: 0.3em;
  margin-top: 32px;
  margin-bottom: 16px;
  font-weight: 600;
}

.markdown-body :deep(h3) {
  font-size: 1.25em;
  margin-top: 24px;
  margin-bottom: 12px;
  font-weight: 600;
}

.markdown-body :deep(p) {
  margin: 0 0 16px 0;
}

.markdown-body :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 3px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}

.markdown-body :deep(pre) {
  padding: 16px;
  overflow-x: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: var(--bg-secondary, #f6f8fa);
  border-radius: 6px;
  margin: 16px 0;
  border: 1px solid var(--border-color, #eaecef);
}

.markdown-body :deep(pre code) {
  background-color: transparent;
  padding: 0;
  border: none;
}

.markdown-body :deep(blockquote) {
  padding: 0 1em;
  color: var(--text-secondary, #586069);
  border-left: 0.25em solid var(--border-color, #dfe2e5);
  margin: 16px 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 2em;
  margin: 0 0 16px 0;
}

.markdown-body :deep(li) {
  margin: 0.5em 0;
}

.markdown-body :deep(li > p) {
  margin: 0.5em 0;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  overflow-x: auto;
  display: block;
}

.markdown-body :deep(table th),
.markdown-body :deep(table td) {
  padding: 8px 13px;
  border: 1px solid var(--border-color, #dfe2e5);
}

.markdown-body :deep(table th) {
  font-weight: 600;
  background-color: var(--bg-secondary, #f6f8fa);
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 16px 0;
}

.markdown-body :deep(a) {
  color: var(--accent-color, #0366d6);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.loading-text {
  text-align: center;
  color: var(--text-secondary, #586069);
  padding: 40px;
  font-size: 14px;
}
</style>
