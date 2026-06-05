<template>
  <div class="markdown-editor-tool" :data-theme="currentTheme">
    <Toolbar
      @insert="handleInsert"
      @theme-change="handleThemeChange"
      @preview-fullscreen="handlePreviewFullscreen"
    />

    <div class="main-content">
      <div class="editor-wrapper" :style="{ width: editorWidth + '%' }">
        <EditorCore ref="editorRef" v-model="content" :theme="currentTheme" />
      </div>

      <div class="resizer" @mousedown="startResize"></div>

      <div class="preview-wrapper" :style="{ width: (100 - editorWidth) + '%' }">
        <Preview :content="content" :sync-scroll="true" ref="previewRef" />
      </div>
    </div>

    <StatsBar ref="statsBarRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import EditorCore from './components/Editor/EditorCore.vue'
import Preview from './components/Preview/Preview.vue'
import Toolbar from './components/Toolbar/Toolbar.vue'
import StatsBar from './components/Toolbar/StatsBar.vue'
import { ConfigManager } from './components/Storage/ConfigManager'
import { Exporter } from './components/Toolbar/Exporter'
import { eventBus } from './components/Common/EventBus'
import { docStore, DEFAULT_DOC_CONTENT } from '../../store/docStore'
import { useI18n } from '../../i18n'

const { t } = useI18n()

const content = ref(DEFAULT_DOC_CONTENT)
const currentTheme = ref<'light' | 'dark'>('light')
const editorWidth = ref(50)

const editorRef = ref<InstanceType<typeof EditorCore>>()
const previewRef = ref<InstanceType<typeof Preview>>()
const statsBarRef = ref<InstanceType<typeof StatsBar>>()

const configManager = new ConfigManager()
const exporter = new Exporter()

let isResizing = false
let saveTimer: number | null = null
let initialized = false

const onExportRequested = async (data: any) => {
  await handleExport(data.format)
}

// 自动保存
watch(content, () => {
  if (!initialized) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = window.setTimeout(async () => {
    if (docStore.state.currentDocId && content.value !== undefined) {
      await docStore.saveCurrent(content.value)
    }
  }, 800)
})

// 监听侧边栏切换文档
watch(() => docStore.state.currentContent, (newContent) => {
  if (!initialized) return
  if (newContent !== content.value) {
    content.value = newContent
  }
})

onMounted(async () => {
  const config = await configManager.loadConfig()
  currentTheme.value = config.theme === 'auto' ? 'light' : config.theme
  editorWidth.value = config.editorWidth

  // 加载文档
  const current = await docStore.loadCurrent()
  if (current.id && current.content !== undefined) {
    content.value = current.content
  } else if (docStore.state.documents.length === 0) {
    // 首次使用，创建欢迎文档
    await docStore.createDocument(t('doc.welcome'))
    content.value = DEFAULT_DOC_CONTENT
    await docStore.saveCurrent(DEFAULT_DOC_CONTENT, t('doc.welcome'))
  }

  initialized = true
  eventBus.on('export-requested', onExportRequested)
})

onUnmounted(() => {
  if (saveTimer) clearTimeout(saveTimer)
  eventBus.off('export-requested', onExportRequested)
})

const handleInsert = (text: string) => {
  editorRef.value?.insert(text)
}

const handleThemeChange = (theme: 'light' | 'dark') => {
  currentTheme.value = theme
  configManager.updateConfig({ theme })
}

const handlePreviewFullscreen = () => {
  previewRef.value?.toggleFullscreen()
}

const startResize = () => {
  isResizing = true
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

const onResize = (event: MouseEvent) => {
  if (!isResizing) return
  const container = document.querySelector('.main-content') as HTMLElement
  if (!container) return
  const containerRect = container.getBoundingClientRect()
  const newWidth = ((event.clientX - containerRect.left) / containerRect.width) * 100
  if (newWidth >= 20 && newWidth <= 80) {
    editorWidth.value = newWidth
    configManager.updateConfig({ editorWidth: newWidth })
  }
}

const stopResize = () => {
  isResizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

const handleExport = async (format: 'html' | 'markdown') => {
  switch (format) {
    case 'html':
      exporter.exportHTML(content.value, getStyles(), 'document.html')
      break
    case 'markdown':
      exporter.exportMarkdown(content.value, 'document.md')
      break
  }
}

const getStyles = () => {
  return `
    .preview-content {
      max-width: 800px; margin: 0 auto; padding: 40px 20px;
      font-size: 15px; line-height: 1.8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    }
    .preview-content h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
    .preview-content h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; margin-top: 24px; margin-bottom: 16px; font-weight: 600; }
    .preview-content pre { padding: 16px; overflow: auto; background: #f6f8fa; border: 1px solid #eaecef; border-radius: 6px; margin: 16px 0; }
    .preview-content code { padding: 0.2em 0.4em; font-size: 0.9em; background-color: rgba(175,184,193,0.2); border-radius: 3px; font-family: monospace; }
    .preview-content blockquote { padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; margin: 16px 0; }
    .preview-content img { max-width: 100%; height: auto; }
    .preview-content table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    .preview-content table th, .preview-content table td { padding: 6px 13px; border: 1px solid #dfe2e5; }
    .preview-content a { color: #0366d6; text-decoration: none; }
  `
}
</script>

<style scoped>
.markdown-editor-tool {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-wrapper, .preview-wrapper {
  overflow: hidden;
  height: 100%;
}

.resizer {
  width: 4px;
  background: var(--border-color, #eaecef);
  cursor: col-resize;
  flex-shrink: 0;
}

.resizer:hover, .resizer:active {
  background: var(--accent-color, #0366d6);
}

@media (max-width: 768px) {
  .main-content { flex-direction: column; }
  .resizer { width: 100%; height: 4px; cursor: row-resize; }
}
</style>
