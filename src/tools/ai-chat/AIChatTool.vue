<template>
  <div class="ai-chat">
    <!-- 左侧聊天区 -->
    <div
      class="chat-main"
      @dragover.prevent="onDragOver"
      @dragenter.prevent="onDragEnter"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      :class="{ 'drag-active': isDragging }"
    >
      <!-- 顶部标题栏 -->
      <div class="chat-header">
        <div class="chat-header-left">
          <div class="ai-avatar">🤖</div>
          <div>
            <div class="chat-title">AI Assistant</div>
            <div class="chat-subtitle">{{ currentConv?.title || t('ai.chatHint') }}</div>
          </div>
        </div>
        <div class="header-actions">
          <button class="header-btn" @click="showAISettings = true" :title="t('ai.settingsTitle')">
            <span class="btn-icon">⚙</span>
            <span class="btn-text">{{ t('ai.settingsTitle') }}</span>
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="chat-messages" ref="messagesContainer">
        <!-- 空状态 -->
        <div v-if="!currentConv || currentConv.messages.length === 0" class="welcome-screen">
          <div class="welcome-icon">🤖</div>
          <h2 class="welcome-title">{{ t('ai.chatEmpty') }}</h2>
          <p class="welcome-subtitle">{{ t('ai.chatHint') }}</p>
          <div class="suggestions">
            <button class="suggestion-card" @click="useSuggestion(sugg)" v-for="sugg in suggestions" :key="sugg">
              {{ sugg }}
            </button>
          </div>
        </div>

        <!-- 消息列表 -->
        <template v-if="currentConv">
          <div v-for="(msg, idx) in currentConv.messages" :key="msg.time + '-' + idx" :class="['message', msg.role]">
            <div class="message-avatar">
              {{ msg.role === 'user' ? '👤' : '🤖' }}
            </div>
            <div class="message-content">
              <div class="bubble-text" v-html="renderMarkdown(msg.content)"></div>
              <div class="message-footer">
                <span class="message-time">{{ formatTime(msg.time) }}</span>
                <button
                  v-if="msg.role === 'assistant'"
                  class="copy-btn"
                  @click="copyMessage(msg.content, idx)"
                  :title="t('ai.copy')"
                >
                  <svg v-if="copiedIdx !== idx" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
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
        </template>

        <!-- 加载状态 -->
        <div v-if="loading" class="message ai">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <div class="typing-indicator">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区 -->
      <div class="chat-input-area">
        <!-- 附件列表 -->
        <div v-if="attachments.length > 0" class="attachments-list">
          <div v-for="(att, idx) in attachments" :key="idx" class="attachment-chip">
            <span class="att-icon">📎</span>
            <span class="att-name">{{ att.name }}</span>
            <span class="att-size">{{ formatFileSize(att.size) }}</span>
            <button class="att-remove" @click="removeAttachment(idx)">×</button>
          </div>
        </div>

        <div v-if="error" class="error-banner">
          <span>⚠️ {{ error }}</span>
          <button @click="error = ''">×</button>
        </div>

        <div class="input-row">
          <div class="input-wrapper">
            <textarea
              v-model="input"
              class="chat-input"
              :placeholder="t('ai.inputPlaceholder')"
              rows="1"
              ref="inputRef"
              @keydown.enter.exact.prevent="send"
              @input="autoResize"
            ></textarea>
            <div class="input-actions">
              <input
                type="file"
                ref="fileInputRef"
                @change="handleFileSelect"
                style="display:none"
                multiple
              />
              <button class="input-action-btn" @click="fileInputRef?.click()" title="上传文件">
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M7.5 1a.75.75 0 0 1 .75.75v5.5h5.5a.75.75 0 0 1 0 1.5h-5.5v5.5a.75.75 0 0 1-1.5 0v-5.5h-5.5a.75.75 0 0 1 0-1.5h5.5v-5.5A.75.75 0 0 1 7.5 1Z"/>
                </svg>
              </button>
            </div>
          </div>

          <button
            class="send-btn"
            @click="send"
            :disabled="!input.trim() || loading"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>

        <div class="composer-footer">
          <span class="footer-hint">Enter 发送 · Shift+Enter 换行</span>
          <span class="model-tag" v-if="config.model">{{ config.model }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧对话列表 -->
    <div class="chat-sidebar">
      <button class="new-chat-btn" @click="createNew">
        <span class="plus">+</span>
        {{ t('ai.newChat') }}
      </button>

      <div class="conv-list">
        <div
          v-for="conv in state.conversations"
          :key="conv.id"
          :class="['conv-item', { active: conv.id === state.currentId }]"
          @click="switchTo(conv.id)"
        >
          <div class="conv-info">
            <input
              v-if="renamingId === conv.id"
              class="conv-rename-input"
              v-model="renamingTitle"
              @keydown.enter="finishRename"
              @keydown.escape="cancelRename"
              @blur="finishRename"
              @click.stop
              autofocus
            />
            <div v-else class="conv-title" @dblclick.stop="startRename(conv)" :title="t('ai.dblClickRename')">
              {{ conv.title }}
            </div>
            <div class="conv-time">{{ formatConvTime(conv.updatedAt) }}</div>
          </div>
          <button
            v-if="renamingId !== conv.id"
            class="conv-rename-btn"
            @click.stop="startRename(conv)"
            :title="t('ai.rename')"
          >✎</button>
          <button
            v-if="renamingId !== conv.id"
            class="conv-delete"
            @click.stop="deleteConv(conv.id)"
            :title="t('ai.delete')"
          >×</button>
        </div>
        <div v-if="state.conversations.length === 0" class="conv-empty">
          {{ t('ai.noConversations') }}
        </div>
      </div>
    </div>

    <!-- AI 设置弹窗 -->
    <AISettingsDialog :visible="showAISettings" @close="showAISettings = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onActivated, watch } from 'vue'
import { marked } from 'marked'
import { useI18n } from '../../i18n'
import { chat, isAIConfigured, getAIConfig, type AIMessage } from '../../services/ai'
import { chatStore } from '../../store/chatStore'
import AISettingsDialog from '../../components/AISettingsDialog.vue'

const { t } = useI18n()

// Configure marked for chat
marked.setOptions({
  breaks: true,
  gfm: true,
})

const state = chatStore.state
const currentConv = computed(() => chatStore.getCurrentConversation())

const input = ref('')
const loading = ref(false)
const error = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const config = getAIConfig()
const showAISettings = ref(false)

const suggestions = [
  '💡 解释什么是闭包，并给出一个例子',
  '📝 帮我写一个正则表达式匹配邮箱',
  '🔄 JSON 和 YAML 有什么区别？',
  '🐛 我的代码有 bug，帮我分析',
]

// 初始化：如果没有对话，创建一个
onMounted(() => {
  if (state.conversations.length === 0) {
    chatStore.createConversation()
  }
  scrollToBottom()
})

// keep-alive 激活时滚动到底部
onActivated(() => {
  scrollToBottom()
})

// 切换对话时滚动到底部
watch(() => state.currentId, () => {
  scrollToBottom()
})

const createNew = () => {
  chatStore.createConversation()
  input.value = ''
  scrollToBottom(true)
}

const switchTo = (id: string) => {
  chatStore.switchTo(id)
  scrollToBottom(true)
}

const deleteConv = (id: string) => {
  if (confirm(t('ai.confirmDelete'))) {
    chatStore.deleteConversation(id)
  }
}

// 重命名
const renamingId = ref<string | null>(null)
const renamingTitle = ref('')

const startRename = (conv: { id: string; title: string }) => {
  renamingId.value = conv.id
  renamingTitle.value = conv.title
}

const finishRename = () => {
  if (renamingId.value) {
    chatStore.renameConversation(renamingId.value, renamingTitle.value)
    renamingId.value = null
  }
}

const cancelRename = () => {
  renamingId.value = null
}

// 复制消息
const copiedIdx = ref<number | null>(null)

// 附件
interface AttachedFile {
  name: string
  content: string
  size: number
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const attachments = ref<AttachedFile[]>([])

const handleFileSelect = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return

  for (const file of Array.from(files)) {
    if (file.size > 100 * 1024) {
      const ok = confirm(`文件 "${file.name}" 大于 100KB，确定要添加吗？大文件可能超出上下文限制。`)
      if (!ok) continue
    }

    try {
      const content = await readFile(file)
      attachments.value.push({ name: file.name, content, size: file.size })
    } catch {
      // skip binary files that can't be read as text
    }
  }

  // reset input so same file can be re-selected
  if (e.target) (e.target as HTMLInputElement).value = ''
}

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

const removeAttachment = (idx: number) => {
  attachments.value.splice(idx, 1)
}

// 拖拽上传
const isDragging = ref(false)
let dragCounter = 0

const onDragOver = (e: DragEvent) => {
  if (e.dataTransfer?.types.includes('Files')) {
    e.dataTransfer.dropEffect = 'copy'
  }
}

const onDragEnter = (_e: DragEvent) => {
  dragCounter++
  isDragging.value = true
}

const onDragLeave = (_e: DragEvent) => {
  dragCounter--
  if (dragCounter <= 0) {
    isDragging.value = false
    dragCounter = 0
  }
}

const onDrop = async (e: DragEvent) => {
  isDragging.value = false
  dragCounter = 0
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return

  for (const file of Array.from(files)) {
    if (file.size > 100 * 1024) {
      const ok = confirm(`文件 "${file.name}" 大于 100KB，确定要添加吗？大文件可能超出上下文限制。`)
      if (!ok) continue
    }
    try {
      const content = await readFile(file)
      attachments.value.push({ name: file.name, content, size: file.size })
    } catch {
      // skip binary files
    }
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const copyMessage = async (text: string, idx: number) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copiedIdx.value = idx
  setTimeout(() => {
    if (copiedIdx.value === idx) copiedIdx.value = null
  }, 2000)
}

const useSuggestion = (text: string) => {
  input.value = text
  inputRef.value?.focus()
}

const formatTime = (ts: number): string => {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const formatConvTime = (ts: number): string => {
  const now = Date.now()
  const diff = now - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + ' 天前'
  return new Date(ts).toLocaleDateString('zh-CN')
}

const renderMarkdown = (text: string): string => {
  try {
    return marked.parse(text) as string
  } catch {
    return text
  }
}

const scrollToBottom = (force = false) => {
  const scroll = () => {
    if (messagesContainer.value) {
      // 方法1：直接设置 scrollTop
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight

      // 方法2：使用 scrollTo
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: force ? 'auto' : 'smooth'
      })
    }
  }

  // 立即执行一次
  scroll()

  // 使用 nextTick
  nextTick(() => {
    scroll()
  })

  // 如果是强制滚动，使用更多策略
  if (force) {
    requestAnimationFrame(() => {
      scroll()
      requestAnimationFrame(scroll)
    })

    setTimeout(scroll, 50)
    setTimeout(scroll, 150)
    setTimeout(scroll, 300)
    setTimeout(scroll, 500)
  }
}

const autoResize = () => {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 120) + 'px'
  }
}

const send = async () => {
  const text = input.value.trim()
  if (!text || loading.value) return

  if (!isAIConfigured()) {
    error.value = t('ai.notConfigured')
    showAISettings.value = true
    return
  }

  if (!state.currentId) {
    chatStore.createConversation()
  }

  const convId = state.currentId!

  error.value = ''

  // 构建消息内容（包含附件）
  let messageContent = text
  if (attachments.value.length > 0) {
    const fileContents = attachments.value.map(att =>
      `\n\n---\n**📎 ${att.name}** (${formatFileSize(att.size)})\n\`\`\`\n${att.content}\n\`\`\``,
    ).join('')
    messageContent = text + fileContents
  }

  chatStore.addMessage(convId, { role: 'user', content: messageContent, time: Date.now() })
  attachments.value = []
  input.value = ''
  autoResize()
  scrollToBottom()

  loading.value = true
  try {
    const conv = chatStore.getCurrentConversation()
    const chatMessages: AIMessage[] = [
      { role: 'system', content: 'You are a helpful assistant. Be concise and clear. Use markdown formatting when appropriate.' },
      ...(conv?.messages.map(m => ({ role: m.role, content: m.content } as AIMessage)) || []),
    ]

    const reply = await chat(chatMessages)
    chatStore.addMessage(convId, { role: 'assistant', content: reply, time: Date.now() })
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.ai-chat {
  display: flex;
  height: calc(100vh - 60px);
  background: #ffffff;
}

/* ── 右侧对话列表 ── */
.chat-sidebar {
  width: 220px;
  background: #f7f7f8;
  border-left: 1px solid #e5e5e5;
  border-right: none;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.new-chat-btn {
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

.new-chat-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.plus {
  font-size: 18px;
  font-weight: 300;
  line-height: 1;
}

.conv-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
}

.conv-list::-webkit-scrollbar {
  width: 4px;
}

.conv-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.conv-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 2px;
}

.conv-item:hover {
  background: #ebedf0;
}

.conv-item.active {
  background: #e5e7eb;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-title {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}

.conv-delete {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.2s ease;
  opacity: 0;
}

.conv-item:hover .conv-delete,
.conv-item:hover .conv-rename-btn {
  opacity: 1;
}

.conv-delete:hover {
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
}

.conv-rename-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s ease;
  opacity: 0;
}

.conv-rename-btn:hover {
  background: rgba(0, 0, 0, 0.06);
  color: #666;
}

.conv-rename-input {
  width: 100%;
  padding: 2px 6px;
  border: 1px solid #10a37f;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  outline: none;
  background: #fff;
  box-sizing: border-box;
}

.conv-empty {
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
}

/* ── 右侧聊天区 ── */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.chat-main.drag-active::after {
  content: '📎 拖放文件到此处';
  position: absolute;
  inset: 0;
  background: rgba(16, 163, 127, 0.08);
  border: 2px dashed #10a37f;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #10a37f;
  pointer-events: none;
  z-index: 10;
}

/* ── 顶部标题栏 ── */
.chat-header {
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #10a37f 0%, #0d8a6a 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.2);
}

.chat-title {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
}

.chat-subtitle {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.header-btn {
  background: transparent;
  border: none;
  color: #6b7280;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 500;
}

.header-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-icon {
  font-size: 16px;
  line-height: 1;
}

.btn-text {
  white-space: nowrap;
}

/* ── 消息列表 ── */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  scroll-behavior: smooth;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

/* ── 欢迎页 ── */
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
  padding: 20px;
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 22px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px;
}

.welcome-subtitle {
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 28px;
}

.suggestions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-width: 500px;
  width: 100%;
}

.suggestion-card {
  padding: 12px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: #fff;
  color: #4b5563;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.5;
}

.suggestion-card:hover {
  border-color: #10a37f;
  background: #f0fdf9;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.1);
}

/* ── 消息 ── */
.message {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.message.ai .message-avatar {
  background: linear-gradient(135deg, #10a37f 0%, #0d8a6a 100%);
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
  font-size: 14px;
}

.message.ai .message-content {
  background: #f7f7f8;
  color: #374151;
  border-bottom-left-radius: 2px;
}

.message.user .message-content {
  background: #f7f7f8;
  color: #374151;
  border-bottom-right-radius: 2px;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
}

.message.user .message-time {
  text-align: right;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  padding: 0 4px;
  gap: 8px;
}

.message.user .message-footer {
  flex-direction: row-reverse;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: #9ca3af;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
  opacity: 0;
}

.message-content:hover .copy-btn {
  opacity: 1;
}

.copy-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
}

/* Markdown */
.bubble-text :deep(pre) {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 12px 14px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
  font-size: 13px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
}

.bubble-text :deep(code) {
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 5px;
  border-radius: 3px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 13px;
}

.bubble-text :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.bubble-text :deep(strong) {
  font-weight: 600;
}

.bubble-text :deep(h1),
.bubble-text :deep(h2),
.bubble-text :deep(h3),
.bubble-text :deep(h4) {
  margin: 12px 0 6px;
  font-weight: 600;
  line-height: 1.3;
}

.bubble-text :deep(h1) { font-size: 18px; }
.bubble-text :deep(h2) { font-size: 16px; }
.bubble-text :deep(h3) { font-size: 15px; }
.bubble-text :deep(h4) { font-size: 14px; }

.bubble-text :deep(ul),
.bubble-text :deep(ol) {
  padding-left: 20px;
  margin: 6px 0;
}

.bubble-text :deep(li) {
  margin: 3px 0;
}

.bubble-text :deep(li > ul),
.bubble-text :deep(li > ol) {
  margin: 3px 0;
}

.bubble-text :deep(blockquote) {
  border-left: 3px solid #d1d5db;
  padding-left: 12px;
  margin: 8px 0;
  color: #6b7280;
  font-style: italic;
}

.bubble-text :deep(a) {
  color: #10a37f;
  text-decoration: none;
}

.bubble-text :deep(a:hover) {
  text-decoration: underline;
}

.bubble-text :deep(table) {
  border-collapse: collapse;
  margin: 8px 0;
  width: 100%;
  font-size: 13px;
}

.bubble-text :deep(th),
.bubble-text :deep(td) {
  border: 1px solid #e5e5e5;
  padding: 6px 10px;
  text-align: left;
}

.bubble-text :deep(th) {
  background: #f9fafb;
  font-weight: 600;
}

.bubble-text :deep(hr) {
  border: none;
  border-top: 1px solid #e5e5e5;
  margin: 12px 0;
}

.bubble-text :deep(p) {
  margin: 4px 0;
}

.bubble-text :deep(p:first-child) {
  margin-top: 0;
}

.bubble-text :deep(p:last-child) {
  margin-bottom: 0;
}

/* ── 打字动画 ── */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* ── 输入区 ── */
.chat-input-area {
  background: #fff;
  border-top: 1px solid #e5e5e5;
  padding: 16px 24px 24px;
  flex-shrink: 0;
}

/* 附件列表 */
.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.attachment-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  color: #4b5563;
  max-width: 240px;
}

.att-icon {
  font-size: 12px;
  flex-shrink: 0;
}

.att-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.att-size {
  color: #9ca3af;
  font-size: 11px;
  flex-shrink: 0;
}

.att-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  font-size: 14px;
  padding: 0 2px;
  line-height: 1;
  flex-shrink: 0;
}

.att-remove:hover {
  color: #dc2626;
}

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
  margin-bottom: 8px;
}

.error-banner button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #dc2626;
  padding: 0 4px;
}

.input-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.chat-input {
  width: 100%;
  padding: 11px 40px 11px 16px;
  background: #f7f7f8;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  outline: none;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;
  line-height: 1.5;
  transition: all 0.2s;
  box-sizing: border-box;
  display: block;
}

.chat-input::placeholder {
  color: #9ca3af;
}

.chat-input:focus {
  background: #fff;
  border-color: #d1d5db;
  box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.1);
}

.input-actions {
  position: absolute;
  right: 6px;
  bottom: 8px;
  display: flex;
  gap: 2px;
}

.input-action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
}

.input-action-btn:hover {
  background: #e5e5e5;
  color: #374151;
}

.send-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #10a37f 0%, #0d8a6a 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(16, 163, 127, 0.2);
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 163, 127, 0.3);
}

.send-btn:disabled {
  background: #e5e5e5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.footer-hint {
  font-size: 11px;
  color: #9ca3af;
}

.model-tag {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
  font-family: monospace;
}

/* ── 响应式 ── */
@media (max-width: 768px) {
  .chat-sidebar {
    width: 200px;
  }
  .suggestions {
    grid-template-columns: 1fr;
  }
  .message-content {
    max-width: 80%;
  }
}
</style>
