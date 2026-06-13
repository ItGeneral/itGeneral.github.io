<template>
  <div ref="previewContainer" :class="['preview-container', { 'fullscreen': isFullscreen }]">
    <button v-if="isFullscreen" @click="toggleFullscreen" class="close-fullscreen" title="退出全屏">✕</button>

    <div ref="previewContent" class="preview-content" v-html="renderedHtml" @click="handleClick"></div>

    <div v-if="showMermaidModal" class="mermaid-modal" @click.self="closeMermaidModal">
      <div class="mermaid-modal-content">
        <div class="mermaid-modal-toolbar">
          <button @click="zoomOut" class="modal-btn" title="缩小">➖</button>
          <input ref="zoomInput" type="number" class="zoom-input" :value="Math.round(mermaidZoom * 100)"
            @input="handleZoomInput" @keydown.enter="handleZoomEnter" min="50" max="500" step="10" title="输入缩放比例" />
          <span class="zoom-level">%</span>
          <button @click="zoomIn" class="modal-btn" title="放大">➕</button>
          <button @click="resetZoom" class="modal-btn" title="重置">↺</button>
          <button @click="closeMermaidModal" class="modal-btn close-btn" title="关闭">✕</button>
        </div>
        <div class="mermaid-modal-body" @mousedown="startPan" @mousemove="onPan" @mouseup="endPan"
          @mouseleave="endPan" @wheel.prevent="handleMermaidZoom">
          <div ref="mermaidModalSvg" class="mermaid-modal-svg" :style="{ cursor: isPanning ? 'grabbing' : 'grab' }"
            :data-scale="mermaidBaseScale * mermaidZoom"></div>
        </div>
      </div>
    </div>

    <div v-if="toc.length > 0" class="toc-sidebar" ref="tocSidebar">
      <div class="toc-title">目录</div>
      <ul class="toc-list">
        <li v-for="item in toc" :key="item.anchor" :class="getTocItemClass(item)">
          <a :href="`#${item.anchor}`" @click.prevent="scrollToAnchor(item.anchor)" :class="[isHeadingActive(item) ? 'active' : '']" :data-anchor="item.anchor">{{ item.title }}</a>
          <ul v-if="item.children.length > 0" class="toc-sublist">
            <li v-for="child in item.children" :key="child.anchor">
              <a :href="`#${child.anchor}`" @click.prevent="scrollToAnchor(child.anchor)" :class="[isHeadingActive(child) ? 'active' : '']" :data-anchor="child.anchor">{{ child.title }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { MarkdownRenderer } from './MarkdownRenderer'
import { TOCGenerator, type TOCItem } from './TOCGenerator'
import { SyncScroll } from './SyncScroll'
import { CodeHighlight } from './CodeHighlight'
import { MermaidRenderer } from './MermaidRenderer'

const props = defineProps<{
  content: string
  syncScroll?: boolean
}>()

const emit = defineEmits<{
  'fullscreen-change': [isFullscreen: boolean]
}>()

const previewContainer = ref<HTMLElement>()
const previewContent = ref<HTMLElement>()
const tocSidebar = ref<HTMLElement>()
const renderedHtml = ref('')
const toc = ref<TOCItem[]>([])
const activeHeading = ref('')
const isFullscreen = ref(false)
const showMermaidModal = ref(false)
const mermaidZoom = ref(1)
const mermaidBaseScale = ref(1)
const mermaidModalSvg = ref<HTMLElement>()
const zoomInput = ref<HTMLInputElement>()
const mermaidPan = ref({ x: 0, y: 0 })
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

const renderer = new MarkdownRenderer()
const tocGenerator = new TOCGenerator()
let syncScroll: SyncScroll | null = null
let mermaidErrorCleanupTimer: number | null = null
let intersectionObserver: IntersectionObserver | null = null

const renderContent = async () => {
  removeMermaidErrorMessages()
  const html = await renderer.render(props.content)
  const htmlWithAnchors = tocGenerator.addAnchors(html)
  renderedHtml.value = htmlWithAnchors
  toc.value = tocGenerator.generate(htmlWithAnchors)

  await nextTick()
  if (previewContent.value) {
    CodeHighlight.highlightAll(previewContent.value)
    const mermaidBlocks = previewContent.value.querySelectorAll('pre code.language-mermaid')
    await MermaidRenderer.renderCodeBlocks(mermaidBlocks)
    await nextTick()
    removeMermaidErrorMessages()
    await nextTick()
    removeMermaidErrorMessages()

    // Re-attach scroll listener and set initial active heading
    setupIntersectionObserver()
  }
}

const setupIntersectionObserver = () => {
  if (!previewContent.value) return

  // Clean up previous observer
  if (intersectionObserver) {
    intersectionObserver.disconnect()
    intersectionObserver = null
  }

  const headings = previewContent.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  if (headings.length === 0) return

  // Collect all heading IDs for lookup
  const headingIds: string[] = []
  headings.forEach(h => {
    const id = h.getAttribute('id')
    if (id) headingIds.push(id)
  })

  // Core logic: always find the last heading that has scrolled past the top threshold
  const updateActiveHeading = () => {
    if (!previewContent.value) return
    const containerRect = previewContent.value.getBoundingClientRect()
    // Use a small offset so the heading is considered "active" right as it passes under the top
    const threshold = containerRect.top + 20

    let activeId: string | null = null
    for (let i = headings.length - 1; i >= 0; i--) {
      const rect = headings[i].getBoundingClientRect()
      if (rect.top <= threshold) {
        activeId = headings[i].getAttribute('id')
        break
      }
    }

    // If no heading has passed the threshold yet, highlight the first one
    if (!activeId && headingIds.length > 0) {
      activeId = headingIds[0]
    }

    if (activeId) {
      activeHeading.value = activeId
      scrollTocToActive(activeId)
    }
  }

  // Use IntersectionObserver just as a scroll event trigger — the actual
  // active heading calculation is done by updateActiveHeading() which always
  // picks the last heading scrolled past, keeping highlight stable even when
  // we're in the middle of a section's content.
  intersectionObserver = new IntersectionObserver(
    () => updateActiveHeading(),
    {
      root: previewContent.value,
      rootMargin: '0px 0px -100% 0px',
      threshold: [0, 1]
    }
  )

  headings.forEach(h => intersectionObserver!.observe(h))

  // Set initial active heading
  updateActiveHeading()
}

// Auto-scroll the TOC sidebar to keep active item visible
const scrollTocToActive = (anchor: string) => {
  if (!tocSidebar.value) return
  const activeLink = tocSidebar.value.querySelector(`a[data-anchor="${anchor}"]`) as HTMLElement
  if (!activeLink) return
  const sidebarRect = tocSidebar.value.getBoundingClientRect()
  const linkRect = activeLink.getBoundingClientRect()
  // Only scroll if the active link is outside the visible area
  if (linkRect.top < sidebarRect.top || linkRect.bottom > sidebarRect.bottom) {
    activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
}

const removeMermaidErrorMessages = () => {
  const selectors = ['.mermaidTooltip', '[class*="mermaidTooltip"]', 'div.mermaidTooltip', 'body > .mermaidTooltip', 'body > div[id^="mermaid-diagram-"]']
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector)
    for (const element of Array.from(elements)) {
      element.remove()
    }
  }
  const bodyChildren = document.body.children
  for (const child of Array.from(bodyChildren)) {
    if (child.tagName === 'DIV') {
      const id = (child as HTMLElement).id
      const className = (child as HTMLElement).className
      const text = child.textContent?.trim() || ''
      if (id.startsWith('mermaid-diagram-') || className.includes('mermaid') || text.includes('Syntax error') || text.includes('mermaid version')) {
        child.remove()
      }
    }
  }
  if (!previewContent.value) return
  const allElements = previewContent.value.querySelectorAll('*')
  for (const element of Array.from(allElements)) {
    const text = element.textContent?.trim() || ''
    if (text.startsWith('Syntax error') && text.includes('mermaid version')) {
      element.remove()
    }
  }
  const mermaidErrorDivsInPreview = previewContent.value.querySelectorAll('.mermaid, [class*="mermaid"]')
  for (const div of Array.from(mermaidErrorDivsInPreview)) {
    if (div.textContent?.includes('Syntax error')) {
      div.remove()
    }
  }
}

watch(() => props.content, () => { renderContent() }, { immediate: true })

watch([mermaidZoom, mermaidPan], () => { updateSvgViewBox() })

onMounted(async () => {
  await renderContent()
  if (props.syncScroll && previewContainer.value && previewContent.value) {
    setTimeout(() => {
      const editorEl = document.querySelector('.editor-core .cm-scroller') as HTMLElement
      if (editorEl) {
        syncScroll = new SyncScroll(editorEl, previewContent.value!)
      }
    }, 100)
  }

  mermaidErrorCleanupTimer = window.setInterval(() => { removeMermaidErrorMessages() }, 1000)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (syncScroll) { syncScroll.destroy(); syncScroll = null }
  if (mermaidErrorCleanupTimer !== null) { clearInterval(mermaidErrorCleanupTimer); mermaidErrorCleanupTimer = null }
  if (intersectionObserver) { intersectionObserver.disconnect(); intersectionObserver = null }
  document.removeEventListener('keydown', handleKeyDown)
})

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showMermaidModal.value) { closeMermaidModal() }
}


const handleClick = (event: Event) => {
  const target = event.target as HTMLElement
  const mermaidWrapper = target.closest('.mermaid-wrapper')
  if (mermaidWrapper) { openMermaidModal(mermaidWrapper as HTMLElement); event.preventDefault(); event.stopPropagation(); return }
  if (target.tagName === 'A') {
    const href = target.getAttribute('href')
    if (href?.startsWith('#')) { event.preventDefault(); scrollToAnchor(href.substring(1)) }
  }
}

const openMermaidModal = async (wrapper: HTMLElement) => {
  const svg = wrapper.querySelector('svg')
  if (!svg) return
  showMermaidModal.value = true
  document.body.style.overflow = 'hidden'
  mermaidPan.value = { x: 0, y: 0 }
  mermaidZoom.value = 1
  mermaidBaseScale.value = 1

  await nextTick()
  if (mermaidModalSvg.value) {
    mermaidModalSvg.value.innerHTML = ''
    const clonedSvg = svg.cloneNode(true) as SVGElement
    let originalViewBox = clonedSvg.getAttribute('viewBox')
    if (!originalViewBox) {
      const width = clonedSvg.getAttribute('width')
      const height = clonedSvg.getAttribute('height')
      originalViewBox = (width && height) ? `0 0 ${width} ${height}` : '0 0 100 100'
    }
    const [, , x, y] = originalViewBox.split(' ').map(Number)
    clonedSvg.setAttribute('data-original-width', String(x))
    clonedSvg.setAttribute('data-original-height', String(y))
    clonedSvg.setAttribute('data-original-viewBox', originalViewBox)
    clonedSvg.setAttribute('shape-rendering', 'geometricPrecision')
    clonedSvg.setAttribute('text-rendering', 'geometricPrecision')
    clonedSvg.setAttribute('width', '100%')
    clonedSvg.setAttribute('height', '100%')
    clonedSvg.removeAttribute('max-width')
    clonedSvg.style.removeProperty('max-width')
    mermaidModalSvg.value.appendChild(clonedSvg)
  }
  await nextTick()
  updateSvgViewBox()
}

const closeMermaidModal = () => { showMermaidModal.value = false; document.body.style.overflow = '' }

const updateSvgViewBox = () => {
  if (!mermaidModalSvg.value) return
  const svg = mermaidModalSvg.value.querySelector('svg') as SVGElement
  if (!svg) return
  const originalViewBox = svg.getAttribute('data-original-viewBox')
  if (!originalViewBox) return
  const [, , origWidth, origHeight] = originalViewBox.split(' ').map(Number)
  const scale = mermaidBaseScale.value * mermaidZoom.value
  const newWidth = origWidth / scale
  const newHeight = origHeight / scale
  const panX = -mermaidPan.value.x / scale
  const panY = -mermaidPan.value.y / scale
  const newX = (origWidth - newWidth) / 2 + panX
  const newY = (origHeight - newHeight) / 2 + panY
  svg.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`)
}

const zoomIn = () => { mermaidZoom.value = Math.min(mermaidZoom.value + 0.1, 5) }
const zoomOut = () => { mermaidZoom.value = Math.max(mermaidZoom.value - 0.1, 0.5) }
const resetZoom = () => { mermaidZoom.value = 1; mermaidPan.value = { x: 0, y: 0 } }
const handleZoomInput = (event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value)
  if (isNaN(value)) return
  mermaidZoom.value = Math.max(50, Math.min(500, value)) / 100
}
const handleZoomEnter = () => { zoomInput.value?.blur() }
const startPan = (event: MouseEvent) => { isPanning.value = true; panStart.value = { x: event.clientX - mermaidPan.value.x, y: event.clientY - mermaidPan.value.y } }
const onPan = (event: MouseEvent) => { if (!isPanning.value) return; mermaidPan.value = { x: event.clientX - panStart.value.x, y: event.clientY - panStart.value.y } }
const endPan = () => { isPanning.value = false }
const handleMermaidZoom = (event: WheelEvent) => { event.deltaY < 0 ? zoomIn() : zoomOut() }
const scrollToAnchor = (anchor: string) => { previewContent.value?.querySelector(`#${anchor}`)?.scrollIntoView({ behavior: 'smooth' }) }
const getTocItemClass = (item: TOCItem) => `toc-item toc-level-${item.level}`

// Collect all anchors that are directly rendered in the TOC (top-level items + their direct children)
const visibleTocAnchors = computed(() => {
  const anchors = new Set<string>()
  for (const item of toc.value) {
    anchors.add(item.anchor)
    for (const child of item.children) {
      anchors.add(child.anchor)
    }
  }
  return anchors
})

// Check if a heading or any of its descendants is the active heading
const isHeadingActive = (item: TOCItem): boolean => {
  if (activeHeading.value === item.anchor) return true
  // Only highlight parent if the active heading is NOT itself shown in the TOC
  if (visibleTocAnchors.value.has(activeHeading.value)) return false
  // Active heading is deeper than what TOC shows — check descendants
  const checkChildren = (children: TOCItem[]): boolean => {
    for (const child of children) {
      if (activeHeading.value === child.anchor) return true
      if (child.children.length > 0 && checkChildren(child.children)) return true
    }
    return false
  }
  return checkChildren(item.children)
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  emit('fullscreen-change', isFullscreen.value)
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen().catch(err => console.error('Failed to enter fullscreen:', err))
  } else {
    if (document.fullscreenElement) document.exitFullscreen().catch(err => console.error('Failed to exit fullscreen:', err))
  }
}

defineExpose({ toggleFullscreen })
</script>

<style scoped>
.preview-container { position: relative; height: 100%; overflow: hidden; }
.preview-container.fullscreen { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; background: white; display: flex; }
.preview-container.fullscreen .preview-content { flex: 1; margin-right: 250px; overflow-y: auto; }
.close-fullscreen { position: absolute; top: 10px; right: 10px; z-index: 10000; width: 36px; height: 36px; border: none; background: rgba(0,0,0,0.1); border-radius: 4px; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.close-fullscreen:hover { background: rgba(0,0,0,0.2); }
.preview-content { height: 100%; overflow: auto; padding: 20px 40px; font-size: 15px; line-height: 1.8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; }
.preview-container:not(.fullscreen) .preview-content { margin-right: 200px; }
.preview-container.fullscreen .preview-content { padding: 40px 40px 40px 60px; margin-right: 250px; }
.preview-content :deep(h1), .preview-content :deep(h2), .preview-content :deep(h3), .preview-content :deep(h4), .preview-content :deep(h5), .preview-content :deep(h6) { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; }
.preview-content :deep(h1) { font-size: 2em; border-bottom: 1px solid var(--border-color, #eaecef); padding-bottom: 0.3em; }
.preview-content :deep(h2) { font-size: 1.5em; border-bottom: 1px solid var(--border-color, #eaecef); padding-bottom: 0.3em; }
.preview-content :deep(h3) { font-size: 1.25em; }
.preview-content :deep(code) { padding: 0.2em 0.4em; margin: 0; font-size: 0.9em; background-color: transparent; border-radius: 3px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace; }
.preview-content :deep(pre) { padding: 16px; overflow: auto; font-size: 0.9em; line-height: 1.6; background-color: var(--bg-secondary, #f6f8fa); border: 1px solid var(--border-color, #eaecef); border-radius: 6px; margin: 16px 0; }
.preview-content :deep(pre code) { background-color: transparent; padding: 0; border: none; }
.preview-content :deep(.hljs) { display: block; overflow-x: auto; padding: 0; background: transparent; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'Courier New', monospace; }
.preview-content :deep(.hljs-comment), .preview-content :deep(.hljs-quote) { color: #6a737d; font-style: italic; }
.preview-content :deep(.hljs-keyword), .preview-content :deep(.hljs-selector-tag), .preview-content :deep(.hljs-subst) { color: #d73a49; font-weight: 600; }
.preview-content :deep(.hljs-number), .preview-content :deep(.hljs-literal) { color: #005cc5; font-weight: 600; }
.preview-content :deep(.hljs-string), .preview-content :deep(.hljs-attr) { color: #032f62; }
.preview-content :deep(.hljs-title), .preview-content :deep(.hljs-function) { color: #6f42c1; font-weight: 600; }
.preview-content :deep(.hljs-params) { color: var(--text-primary, #24292e); }
.preview-content :deep(.hljs-built_in), .preview-content :deep(.hljs-class) { color: #e36209; font-weight: 600; }
.preview-content :deep(.hljs-tag) { color: #22863a; }
.preview-content :deep(.hljs-name) { color: #6f42c1; font-weight: 600; }
.preview-content :deep(.hljs-symbol) { color: #005cc5; }
.preview-content :deep(.hljs-regexp) { color: #ea580c; }
.preview-content :deep(.hljs-link) { color: #0366d6; text-decoration: underline; }
.preview-content :deep(.hljs-operator), .preview-content :deep(.hljs-variable) { color: #d73a49; }
.preview-content :deep(.hljs-property) { color: #005cc5; }
.preview-content :deep(blockquote) { padding: 0 1em; color: var(--text-tertiary, #6a737d); border-left: 0.25em solid var(--border-color, #dfe2e5); margin: 16px 0; }
.preview-content :deep(img) { max-width: 100%; height: auto; display: block; margin: 16px 0; }
.preview-content :deep(table) { border-collapse: collapse; width: 100%; margin: 16px 0; }
.preview-content :deep(table th), .preview-content :deep(table td) { padding: 6px 13px; border: 1px solid var(--border-color, #dfe2e5); }
.preview-content :deep(table tr:nth-child(2n)) { background-color: var(--bg-secondary, #f6f8fa); }
.preview-content :deep(.mermaid-wrapper) { margin: 20px 0; padding: 20px; background: var(--bg-primary, #ffffff); border: 1px solid var(--border-color, #eaecef); border-radius: 6px; overflow-x: auto; text-align: center; cursor: pointer; transition: all 0.2s; }
.preview-content :deep(.mermaid-wrapper:hover) { border-color: var(--accent-color, #0366d6); box-shadow: 0 2px 8px rgba(3,102,214,0.1); }
.preview-content :deep(.mermaid-wrapper svg) { max-width: 100%; height: auto; display: block; margin: 0 auto; shape-rendering: geometricPrecision; text-rendering: geometricPrecision; }
.preview-content :deep(.mermaid-wrapper .node) { cursor: pointer; shape-rendering: geometricPrecision; }
.preview-content :deep(.mermaid-wrapper .edgePath path) { stroke: #333; stroke-width: 1.5px; }
.preview-content :deep(.mermaid-wrapper .edgeLabel) { background-color: white; }
.preview-content :deep(.mermaid-error) { padding: 16px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; color: #856404; text-align: center; }
.mermaid-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 0; }
.mermaid-modal-content { background: white; width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
.mermaid-modal-toolbar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--bg-secondary, #f6f8fa); border-bottom: 1px solid var(--border-color, #eaecef); flex-shrink: 0; position: sticky; top: 0; z-index: 10; }
.modal-btn { padding: 6px 12px; border: 1px solid #d1d5da; background: white; border-radius: 4px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; min-width: 36px; height: 36px; transition: all 0.2s; }
.modal-btn:hover { background: #f3f4f6; border-color: #0366d6; }
.modal-btn.close-btn { margin-left: auto; color: #d73a49; }
.zoom-level { font-size: 14px; font-weight: 600; color: var(--text-primary, #24292e); text-align: center; margin-left: -4px; }
.zoom-input { width: 60px; padding: 4px 8px; border: 1px solid #d1d5da; border-radius: 4px; font-size: 14px; font-weight: 600; color: var(--text-primary, #24292e); text-align: center; transition: all 0.2s; }
.zoom-input:focus { outline: none; border-color: #0366d6; box-shadow: 0 0 0 3px rgba(3,102,214,0.1); }
.mermaid-modal-body { flex: 1; overflow: hidden; position: relative; background: #ffffff; }
.mermaid-modal-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.mermaid-modal-svg svg { display: block; pointer-events: none; max-width: 100%; max-height: 100%; shape-rendering: geometricPrecision; text-rendering: geometricPrecision; }
.toc-sidebar { position: absolute; top: 0; right: 0; width: 250px; height: 100%; background: var(--bg-secondary, #f9f9f9); border-left: 2px solid var(--border-color, #eaecef); padding: 40px 20px; overflow-y: auto; font-size: 13px; z-index: 10; transition: transform 0.3s ease; box-shadow: -2px 0 8px rgba(0,0,0,0.05); }
.preview-container:not(.fullscreen) .toc-sidebar { padding: 20px; width: 200px; border-left: 1px solid var(--border-color, #eaecef); box-shadow: none; }
.toc-title { font-weight: 600; margin-bottom: 16px; font-size: 14px; color: var(--text-primary, #24292e); }
.toc-list { list-style: none; padding-left: 0; margin: 0; }
.toc-item { margin: 6px 0; }
.toc-item a { color: var(--accent-color, #0366d6); text-decoration: none; display: block; padding: 6px 10px; border-radius: 4px; transition: background-color 0.2s, color 0.2s, border-left-color 0.2s; line-height: 1.4; border-left: 3px solid transparent; }
.toc-item a:hover { background-color: var(--bg-tertiary, #e1e4e8); }
.toc-item a.active { background-color: var(--accent-color, #0366d6) !important; color: white !important; font-weight: 600 !important; border-left-color: var(--accent-color, #0366d6) !important; box-shadow: 0 2px 4px rgba(3,102,214,0.2) !important; }
.toc-sublist { list-style: none; padding-left: 16px; margin: 6px 0; }
.toc-level-1 { font-weight: 600; }
.toc-level-2 { font-size: 0.95em; font-weight: 500; }
.toc-level-3 { font-size: 0.9em; }
</style>
