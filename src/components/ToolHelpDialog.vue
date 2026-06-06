<template>
  <Teleport to="body">
    <div v-if="visible" class="help-overlay" @click="close">
      <div class="help-dialog" @click.stop>
        <div class="help-header">
          <h3 class="help-title">{{ title }}</h3>
          <button class="help-close" @click="close">×</button>
        </div>
        <div class="help-content">
          <div v-html="renderedContent" class="markdown-body"></div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { marked } from 'marked'
import { useI18n } from '../i18n'

const props = defineProps<{
  visible: boolean
  content: string
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { locale } = useI18n()

// Configure marked for help content
marked.setOptions({
  breaks: true,
  gfm: true,
})

const renderedContent = computed(() => {
  try {
    return marked.parse(props.content) as string
  } catch {
    return props.content
  }
})

const close = () => {
  emit('close')
}

// Close on Escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.visible) {
    close()
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<style scoped>
.help-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.help-dialog {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-width: 900px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
  flex-shrink: 0;
}

.help-title {
  font-size: 18px;
  font-weight: 600;
  color: #24292e;
  margin: 0;
}

.help-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  line-height: 1;
}

.help-close:hover {
  background: #f3f4f6;
  color: #24292e;
}

.help-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.help-content::-webkit-scrollbar {
  width: 8px;
}

.help-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.help-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Markdown styling */
.markdown-body :deep(h1) {
  font-size: 28px;
  font-weight: 600;
  color: #24292e;
  margin: 24px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eaecef;
}

.markdown-body :deep(h2) {
  font-size: 22px;
  font-weight: 600;
  color: #24292e;
  margin: 24px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eaecef;
}

.markdown-body :deep(h3) {
  font-size: 18px;
  font-weight: 600;
  color: #24292e;
  margin: 20px 0 12px;
}

.markdown-body :deep(h4) {
  font-size: 16px;
  font-weight: 600;
  color: #24292e;
  margin: 16px 0 8px;
}

.markdown-body :deep(p) {
  margin: 8px 0;
  line-height: 1.6;
  color: #24292e;
}

.markdown-body :deep(code) {
  background: #f6f8fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  color: #24292e;
}

.markdown-body :deep(pre) {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
  border: 1px solid #eaecef;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
  border: none;
  font-size: 13px;
  line-height: 1.6;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.markdown-body :deep(li) {
  margin: 4px 0;
  line-height: 1.6;
  color: #24292e;
}

.markdown-body :deep(table) {
  border-collapse: collapse;
  margin: 16px 0;
  width: 100%;
  font-size: 14px;
}

.markdown-body :deep(th) {
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  padding: 8px 12px;
  font-weight: 600;
  text-align: left;
}

.markdown-body :deep(td) {
  border: 1px solid #d0d7de;
  padding: 8px 12px;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #d0d7de;
  padding-left: 16px;
  margin: 12px 0;
  color: #6b7280;
}

.markdown-body :deep(blockquote p) {
  margin: 4px 0;
}

.markdown-body :deep(strong) {
  font-weight: 600;
  color: #24292e;
}

.markdown-body :deep(a) {
  color: #0969da;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #eaecef;
  margin: 24px 0;
}

/* Warning boxes */
.markdown-body :deep(p:has(strong)) {
  position: relative;
  padding-left: 24px;
}

.markdown-body :deep(p:has(strong))::before {
  content: '⚠️';
  position: absolute;
  left: 0;
  top: 0;
}
</style>
