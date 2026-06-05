<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toolRegistry } from '../../core/toolRegistry'
import { docStore } from '../../store/docStore'
import { useI18n } from '../../i18n'

const { t, locale, setLocale } = useI18n()

const toggleLocale = () => {
  setLocale(locale.value === 'zh' ? 'en' : 'zh')
}

const route = useRoute()
const router = useRouter()

defineProps<{
  collapsed?: boolean
}>()

const emit = defineEmits<{
  'toggle': []
}>()

const tools = computed(() => toolRegistry.getAll())

const activeToolId = computed(() => {
  const current = tools.value.find(t => t.path === route.path)
  return current?.id ?? ''
})

const isMarkdownActive = computed(() => route.path === '/markdown-editor')

const documents = computed(() => docStore.state.documents)
const currentDocId = computed(() => docStore.state.currentDocId)

// 导航
const navigate = (path: string) => {
  router.push(path)
}

// Tooltip
const tooltipVisible = ref(false)
const tooltipText = ref('')
const tooltipStyle = reactive({ top: '0px', left: '0px' })

const showTooltip = (e: MouseEvent, text: string) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  tooltipText.value = text
  tooltipStyle.top = rect.top + rect.height + 4 + 'px'
  tooltipStyle.left = rect.left + 'px'
  tooltipVisible.value = true
}

const hideTooltip = () => {
  tooltipVisible.value = false
}

const switchDoc = async (docId: string) => {
  if (!isMarkdownActive.value) {
    await router.push('/markdown-editor')
  }
  await docStore.switchDocument(docId)
}

const createDoc = async () => {
  if (!isMarkdownActive.value) {
    await router.push('/markdown-editor')
  }
  await docStore.createDocument()
}

// 删除确认
const confirmDocId = ref<string | null>(null)
const confirmDocTitle = ref('')
const confirmStyle = ref({ top: '0px' })

const requestDelete = (docId: string, docTitle: string, event: Event) => {
  const btn = event.target as HTMLElement
  const rect = btn.getBoundingClientRect()
  confirmStyle.value = { top: `${rect.top}px` }
  confirmDocId.value = docId
  confirmDocTitle.value = docTitle
}

const confirmDelete = async () => {
  if (confirmDocId.value) {
    await docStore.deleteDocument(confirmDocId.value)
  }
  confirmDocId.value = null
}

const cancelDelete = () => {
  confirmDocId.value = null
}

// 重命名
const renamingDocId = ref<string | null>(null)
const renamingTitle = ref('')

const startRename = (doc: { id: string; title: string }) => {
  renamingDocId.value = doc.id
  renamingTitle.value = doc.title || t('doc.untitled')
}

const finishRename = async () => {
  if (renamingDocId.value && renamingTitle.value.trim()) {
    await docStore.renameDocument(renamingDocId.value, renamingTitle.value.trim())
  }
  renamingDocId.value = null
}

const cancelRename = () => {
  renamingDocId.value = null
}

// 工具图标配色
const toolColors: Record<string, string> = {
  'markdown-editor': 'doc',
  'json-converter': 'json',
  'regex-tester': 'regex',
  'deduplicator': 'dedup',
}

const formatDate = (ts: number) => {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return t('date.justNow')
  if (diff < 3600000) return t('date.minutesAgo', { n: Math.floor(diff / 60000) })
  if (d.toDateString() === now.toDateString()) return `${t('date.today')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return t('date.yesterday')
  return t('date.daysAgo', { n: d.getMonth() + 1 })
}

onMounted(async () => {
  await docStore.loadAll()
  // 如果没有文档，自动创建一个
  if (docStore.state.documents.length === 0) {
    await docStore.createDocument()
  }
})
</script>

<template>
  <aside :class="['app-sidebar', { collapsed }]">
    <!-- 头部 -->
    <div class="sidebar-header">
      <div class="logo-section">
        <div class="logo-icon">🛠</div>
        <span v-if="!collapsed" class="app-title">AI Tools</span>
      </div>
      <button class="toggle-btn" @click="emit('toggle')" :title="collapsed ? t('sidebar.expand') : t('sidebar.collapse')">
        <span v-if="!collapsed">◀</span>
        <span v-else>▶</span>
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="sidebar-content">
      <!-- 工具列表 -->
      <div class="group-content">
        <div
          v-for="tool in tools.filter(t => t.id !== 'markdown-editor')"
          :key="tool.id"
          :class="['list-item', { active: activeToolId === tool.id }]"
          @click="navigate(tool.path)"
          :title="collapsed ? (tool.nameKey ? t(tool.nameKey) : tool.name) : ''"
        >
          <div :class="['item-icon', toolColors[tool.id] || 'doc']">{{ tool.icon }}</div>
          <div v-if="!collapsed" class="item-content">
            <div class="item-title">{{ tool.nameKey ? t(tool.nameKey) : tool.name }}</div>
          </div>
        </div>
      </div>

      <!-- Markdown Docs 区域 -->
      <!-- 新建文档按钮 -->
      <div v-if="!collapsed" class="new-doc-bar">
        <button class="group-add-btn" @click="createDoc" :title="t('sidebar.newDoc')">+</button>
        <span class="new-doc-label">{{ t('sidebar.newDoc') }}</span>
      </div>

      <!-- 文档列表 -->
      <div v-if="!collapsed" class="group-content">
        <div
          v-for="doc in documents"
          :key="doc.id"
          :class="['list-item', { active: isMarkdownActive && currentDocId === doc.id }]"
          @click="switchDoc(doc.id)"
        >
          <div class="item-icon doc">📄</div>
          <div class="item-content">
            <input
              v-if="renamingDocId === doc.id"
              class="doc-rename-input"
              v-model="renamingTitle"
              @keydown.enter="finishRename"
              @keydown.escape="cancelRename"
              @blur="finishRename"
              @click.stop
              autofocus
            />
            <div
              v-else
              class="item-title has-tooltip"
              @mouseenter="showTooltip($event, doc.title || t('doc.untitled'))"
              @mouseleave="hideTooltip"
              @dblclick.stop="startRename(doc)"
            >
              {{ doc.title || t('doc.untitled') }}
            </div>
            <div class="item-meta">
              <span>{{ formatDate(doc.createdAt) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button v-if="renamingDocId !== doc.id" class="action-btn" @click.stop="startRename(doc)" :title="t('sidebar.rename')">✎</button>
            <button class="action-btn delete" @click.stop="requestDelete(doc.id, doc.title, $event)" :title="t('sidebar.delete')">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 语言切换 -->
    <div v-if="!collapsed" class="sidebar-footer">
      <button class="footer-btn" @click="toggleLocale" :title="t('sidebar.language')">
        <span class="footer-icon">{{ locale === 'zh' ? '🇨🇳' : '🇺🇸' }}</span>
        <span class="footer-label">{{ locale === 'zh' ? '中文' : 'EN' }}</span>
      </button>
    </div>
    <div v-else class="sidebar-footer collapsed-footer">
      <button class="footer-icon-btn" @click="toggleLocale" :title="t('sidebar.language')">
        {{ locale === 'zh' ? '🇨🇳' : '🇺🇸' }}
      </button>
    </div>

    <!-- 文档名称 Tooltip -->
    <Teleport to="body">
      <div v-if="tooltipVisible" class="doc-tooltip" :style="tooltipStyle">
        {{ tooltipText }}
      </div>
    </Teleport>

    <!-- 删除确认弹出框 -->
    <Teleport to="body">
      <div v-if="confirmDocId" class="confirm-overlay" @click="cancelDelete">
        <div class="confirm-popup" :style="{ top: confirmStyle.top, left: '240px' }" @click.stop>
          <div class="confirm-text">{{ t('sidebar.deleteConfirm', { name: confirmDocTitle }) }}</div>
          <div class="confirm-actions">
            <button class="confirm-btn cancel" @click="cancelDelete">{{ t('sidebar.cancel') }}</button>
            <button class="confirm-btn ok" @click="confirmDelete">{{ t('sidebar.delete') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 220px;
  height: 100vh;
  background: #ffffff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-sidebar.collapsed {
  width: 60px;
}

/* 头部 */
.sidebar-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e8e8e8;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  min-height: 64px;
}

.collapsed .sidebar-header {
  padding: 16px 8px;
}

.collapsed .sidebar-header .logo-section {
  display: none;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.app-title {
  color: #333;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.toggle-btn {
  background: #e9ecef;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #dee2e6;
}

/* 搜索栏 */
.search-section {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding: 9px 14px 9px 36px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 13px;
  background: #f9f9f9;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #4CAF50;
  background: white;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

/* 内容区域 */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}

.sidebar-content::-webkit-scrollbar {
  width: 5px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: #b0b0b0;
}

/* 分组 */
.group {
  margin-bottom: 4px;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
  user-select: none;
}

.group-header.hidden {
  display: none;
}

/* 新建文档按钮栏 */
.new-doc-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  margin-bottom: 4px;
}

.new-doc-label {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.group-header:hover {
  background: #f5f5f5;
}

.group-arrow {
  margin-right: 8px;
  color: #999;
  font-size: 10px;
  transition: transform 0.3s ease;
  display: inline-block;
}

.group-arrow.collapsed {
  transform: rotate(-90deg);
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #555;
  flex: 1;
}

.group-count {
  background: #e8e8e8;
  color: #888;
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.group-add-btn {
  width: 22px;
  height: 22px;
  background: #4CAF50;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  line-height: 1;
}

.group-add-btn:hover {
  background: #388E3C;
  transform: rotate(90deg);
}

/* 列表项 */
.group-content {
  padding: 2px 0;
}

.list-item {
  padding: 10px 12px;
  margin: 3px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  animation: slideIn 0.25s ease;
}

.list-item:hover {
  background: #f5f5f5;
  transform: translateX(2px);
}

.list-item.active {
  background: linear-gradient(135deg, #E8F5E9 0%, #F1F8F4 100%);
  border-left: 3px solid #4CAF50;
  padding-left: 9px;
}

.collapsed .list-item {
  justify-content: center;
  padding: 6px 0;
}

.collapsed .list-item.active {
  padding: 6px 0;
  border-left: none;
  background: transparent;
}

.collapsed .list-item.active .item-icon {
  border: 2px solid #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.item-icon.doc {
  background: linear-gradient(135deg, #42A5F5 0%, #64B5F6 100%);
}

.item-icon.json {
  background: linear-gradient(135deg, #FF7043 0%, #FF8A65 100%);
}

.item-icon.regex {
  background: linear-gradient(135deg, #AB47BC 0%, #BA68C8 100%);
}

.item-icon.dedup {
  background: linear-gradient(135deg, #8D6E63 0%, #A1887F 100%);
}

/* 非 emoji 图标用白色 */
.item-icon:not(.doc):not(.json):not(.regex):not(.dedup) {
  background: linear-gradient(135deg, #78909C 0%, #90A4AE 100%);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.item-meta {
  font-size: 11px;
  color: #aaa;
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.list-item:hover .item-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #666;
}

.action-btn.delete:hover {
  color: #d73a49;
}

/* 重命名输入框 */
.doc-rename-input {
  width: 100%;
  padding: 2px 6px;
  border: 1px solid #4CAF50;
  border-radius: 4px;
  font-size: 13px;
  background: white;
  color: #333;
  outline: none;
  font-family: inherit;
  margin-bottom: 2px;
}

/* 空状态 */
/* 文档名称 Tooltip */
.doc-tooltip {
  position: fixed;
  z-index: 9999;
  padding: 4px 8px;
  background: #333;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  animation: tooltip-fade-in 0.1s ease;
}

@keyframes tooltip-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.empty-state {
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #bbb;
}

/* 底部语言切换 */
.sidebar-footer {
  padding: 10px 12px;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}

.sidebar-footer.collapsed-footer {
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
  justify-content: center;
  white-space: nowrap;
}

.footer-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.footer-btn.ai-footer-btn {
  flex: 0 0 36px;
  padding: 7px;
}

.footer-icon {
  font-size: 14px;
}

.footer-label {
  font-size: 12px;
  font-weight: 500;
}

.footer-icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.footer-icon-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

/* 动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.collapse-enter-active, .collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.collapse-enter-from, .collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to, .collapse-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>

<!-- 删除确认弹出框（非 scoped） -->
<style>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.confirm-popup {
  position: fixed;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 14px 16px;
  min-width: 200px;
  z-index: 10000;
}

.confirm-text {
  font-size: 13px;
  color: #333;
  margin-bottom: 12px;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.confirm-btn {
  padding: 5px 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.confirm-btn.cancel {
  background: #fff;
  color: #666;
}

.confirm-btn.cancel:hover {
  background: #f5f5f5;
}

.confirm-btn.ok {
  background: #d73a49;
  color: #fff;
  border-color: #d73a49;
}

.confirm-btn.ok:hover {
  background: #cb2431;
}
</style>
