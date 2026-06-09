<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { docStore } from '../../store/docStore'
import { chatStore } from '../../store/chatStore'
import { useI18n } from '../../i18n'

const { t, locale } = useI18n()

const route = useRoute()
const router = useRouter()

const visible = ref(true)

const isAIChatActive = computed(() => route.path === '/ai-chat')
const isMarkdownActive = computed(() => route.path === '/markdown-editor')

// AI 对话相关
const conversations = computed(() => chatStore.state.conversations)
const currentConvId = computed(() => chatStore.state.currentId)

const switchToConv = (id: string) => {
  if (!isAIChatActive.value) {
    router.push('/ai-chat')
  }
  chatStore.switchTo(id)
}

const createNewConv = () => {
  if (!isAIChatActive.value) {
    router.push('/ai-chat')
  }
  chatStore.createConversation()
}

const deleteConv = (id: string) => {
  if (confirm(t('ai.confirmDelete'))) {
    chatStore.deleteConversation(id)
  }
}

// 对话重命名
const renamingConvId = ref<string | null>(null)
const renamingConvTitle = ref('')

const startRenameConv = (conv: { id: string; title: string }) => {
  renamingConvId.value = conv.id
  renamingConvTitle.value = conv.title
}

const finishRenameConv = () => {
  if (renamingConvId.value && renamingConvTitle.value.trim()) {
    chatStore.renameConversation(renamingConvId.value, renamingConvTitle.value.trim())
  }
  renamingConvId.value = null
}

const cancelRenameConv = () => {
  renamingConvId.value = null
}

// Markdown 文档相关
const documents = computed(() => docStore.state.documents)
const currentDocId = computed(() => docStore.state.currentDocId)

const switchToDoc = async (docId: string) => {
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

const confirmDocId = ref<string | null>(null)
const confirmDocTitle = ref('')

const requestDeleteDoc = (docId: string, docTitle: string) => {
  confirmDocId.value = docId
  confirmDocTitle.value = docTitle
}

const confirmDeleteDoc = async () => {
  if (confirmDocId.value) {
    await docStore.deleteDocument(confirmDocId.value)
  }
  confirmDocId.value = null
}

const cancelDeleteDoc = () => {
  confirmDocId.value = null
}

// 文档重命名
const renamingDocId = ref<string | null>(null)
const renamingDocTitle = ref('')

const startRenameDoc = (doc: { id: string; title: string }) => {
  renamingDocId.value = doc.id
  renamingDocTitle.value = doc.title || t('doc.untitled')
}

const finishRenameDoc = async () => {
  if (renamingDocId.value && renamingDocTitle.value.trim()) {
    await docStore.renameDocument(renamingDocId.value, renamingDocTitle.value.trim())
  }
  renamingDocId.value = null
}

const cancelRenameDoc = () => {
  renamingDocId.value = null
}

// 时间格式化
const formatConvTime = (ts: number): string => {
  const now = Date.now()
  const diff = now - ts
  if (diff < 60000) return t('date.justNow')
  if (diff < 3600000) return t('date.minutesAgo', { n: Math.floor(diff / 60000) })
  if (diff < 86400000) return t('date.hoursAgo', { n: Math.floor(diff / 3600000) })
  if (diff < 604800000) return t('date.daysAgo', { n: Math.floor(diff / 86400000) })
  return new Date(ts).toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US')
}

const formatDocTime = (ts: number): string => {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return t('date.justNow')
  if (diff < 3600000) return t('date.minutesAgo', { n: Math.floor(diff / 60000) })
  if (diff < 86400000) return t('date.hoursAgo', { n: Math.floor(diff / 3600000) })
  if (d.toDateString() === now.toDateString()) return `${t('date.today')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return t('date.yesterday')
  return d.toLocaleDateString(locale.value === 'zh' ? 'zh-CN' : 'en-US')
}

onMounted(async () => {
  await docStore.loadAll()
  // 如果没有文档，自动创建一个
  if (docStore.state.documents.length === 0) {
    await docStore.createDocument()
  }
  // 如果没有对话，自动创建一个
  if (chatStore.state.conversations.length === 0) {
    chatStore.createConversation()
  }
})
</script>

<template>
  <div class="left-sidebar-wrapper">
    <transition name="sidebar-slide">
      <aside v-if="visible" class="left-sidebar">
        <!-- 收起按钮 -->
        <div class="sidebar-collapse-bar">
          <button class="collapse-btn" @click="visible = false" :title="t('sidebar.collapse')">
            ◀
          </button>
        </div>

      <!-- AI 对话列表 -->
      <div v-if="isAIChatActive" class="sidebar-section">
        <button class="section-action-btn" @click.stop="createNewConv">
          <span class="plus">+</span>
          {{ t('ai.newChat') }}
        </button>
        <div class="item-list">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          :class="['list-item', { active: conv.id === currentConvId }]"
          @click="switchToConv(conv.id)"
        >
          <div class="item-info">
            <input
              v-if="renamingConvId === conv.id"
              class="rename-input"
              v-model="renamingConvTitle"
              @keydown.enter="finishRenameConv"
              @keydown.escape="cancelRenameConv"
              @blur="finishRenameConv"
              @click.stop
              autofocus
            />
            <div v-else class="item-title-row">
              <div class="item-icon">💬</div>
              <div class="item-title">{{ conv.title }}</div>
            </div>
            <div class="item-time">{{ formatConvTime(conv.updatedAt) }}</div>
          </div>
          <div v-if="renamingConvId !== conv.id" class="item-actions">
            <button class="action-btn" @click.stop="startRenameConv(conv)" :title="t('ai.rename')">✎</button>
            <button class="action-btn delete" @click.stop="deleteConv(conv.id)" :title="t('ai.delete')">×</button>
          </div>
        </div>
        <div v-if="conversations.length === 0" class="empty-state">
          {{ t('ai.noConversations') }}
        </div>
      </div>
    </div>

    <!-- Markdown 文档列表 -->
    <div v-if="isMarkdownActive" class="sidebar-section">
      <button class="section-action-btn" @click.stop="createDoc">
        <span class="plus">+</span>
        {{ t('sidebar.newDoc') }}
      </button>

      <div class="item-list">
        <div
          v-for="doc in documents"
          :key="doc.id"
          :class="['list-item', { active: currentDocId === doc.id }]"
          @click="switchToDoc(doc.id)"
        >
          <div class="item-info">
            <input
              v-if="renamingDocId === doc.id"
              class="rename-input"
              v-model="renamingDocTitle"
              @keydown.enter="finishRenameDoc"
              @keydown.escape="cancelRenameDoc"
              @blur="finishRenameDoc"
              @click.stop
              autofocus
            />
            <div v-else class="item-title-row">
              <div class="item-icon">📄</div>
              <div class="item-title">{{ doc.title || t('doc.untitled') }}</div>
            </div>
            <div class="item-time">{{ formatDocTime(doc.createdAt) }}</div>
          </div>
          <div v-if="renamingDocId !== doc.id" class="item-actions">
            <button class="action-btn" @click.stop="startRenameDoc(doc)" :title="t('sidebar.rename')">✎</button>
            <button class="action-btn delete" @click.stop="requestDeleteDoc(doc.id, doc.title)" :title="t('sidebar.delete')">×</button>
          </div>
        </div>
        <div v-if="documents.length === 0" class="empty-state">
          {{ t('doc.emptyDocs') }}
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <Teleport to="body">
      <div v-if="confirmDocId" class="confirm-overlay" @click="cancelDeleteDoc">
        <div class="confirm-popup" @click.stop>
          <div class="confirm-text">{{ t('sidebar.deleteConfirm', { name: confirmDocTitle }) }}</div>
          <div class="confirm-actions">
            <button class="confirm-btn cancel" @click="cancelDeleteDoc">{{ t('sidebar.cancel') }}</button>
            <button class="confirm-btn ok" @click="confirmDeleteDoc">{{ t('sidebar.delete') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </aside>
  </transition>

  <!-- 展开按钮 -->
  <button v-if="!visible" class="sidebar-expand-btn" @click="visible = true" :title="t('sidebar.expand')">
    ▶
  </button>
  </div>
</template>

<style scoped>
.left-sidebar-wrapper {
  display: flex;
  flex-shrink: 0;
}

.left-sidebar {
  width: 260px;
  background: #f7f7f8;
  border-right: 1px solid #e5e5e5;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.sidebar-collapse-bar {
  display: flex;
  justify-content: flex-end;
  padding: 6px 10px;
  border-bottom: 1px solid #e5e5e5;
}

.collapse-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.sidebar-expand-btn {
  width: 28px;
  height: 48px;
  border: none;
  background: #f7f7f8;
  border-right: 1px solid #e5e5e5;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.sidebar-expand-btn:hover {
  background: #ebedf0;
  color: #374151;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: all 0.2s ease;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  width: 0;
  opacity: 0;
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.section-action-btn {
  margin: 16px;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.section-action-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.plus {
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
}

.item-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
}

.item-list::-webkit-scrollbar {
  width: 4px;
}

.item-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 2px;
}

.list-item:hover {
  background: #ebedf0;
}

.list-item.active {
  background: #e5e7eb;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.item-title {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
  padding-left: 22px;
}

.item-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
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

.rename-input {
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

.empty-state {
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
}
</style>

<style>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.1);
}

.confirm-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
