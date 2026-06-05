import { reactive, watch } from 'vue'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  time: number
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = 'ai-tools-conversations'
const CURRENT_KEY = 'ai-tools-current-conversation'

function loadConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

function saveConversations(conversations: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
}

function loadCurrentId(): string | null {
  return localStorage.getItem(CURRENT_KEY)
}

function saveCurrentId(id: string | null) {
  if (id) localStorage.setItem(CURRENT_KEY, id)
  else localStorage.removeItem(CURRENT_KEY)
}

const state = reactive({
  conversations: loadConversations() as Conversation[],
  currentId: loadCurrentId() as string | null,
})

// Auto-save on change
watch(
  () => state.conversations,
  () => saveConversations(state.conversations),
  { deep: true },
)

watch(
  () => state.currentId,
  () => saveCurrentId(state.currentId),
)

function generateId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function createConversation(title?: string): Conversation {
  const conv: Conversation = {
    id: generateId(),
    title: title || '新对话',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  state.conversations.unshift(conv)
  state.currentId = conv.id
  return conv
}

function deleteConversation(id: string) {
  const idx = state.conversations.findIndex(c => c.id === id)
  if (idx === -1) return
  state.conversations.splice(idx, 1)
  if (state.currentId === id) {
    state.currentId = state.conversations[0]?.id || null
  }
}

function switchTo(id: string) {
  state.currentId = id
}

function addMessage(convId: string, msg: ChatMessage) {
  const conv = state.conversations.find(c => c.id === convId)
  if (!conv) return
  conv.messages.push(msg)
  conv.updatedAt = Date.now()
  // Auto-title from first user message
  if (conv.title === '新对话' && msg.role === 'user') {
    conv.title = msg.content.slice(0, 30) + (msg.content.length > 30 ? '...' : '')
  }
}

function renameConversation(id: string, title: string) {
  const conv = state.conversations.find(c => c.id === id)
  if (!conv) return
  conv.title = title.trim() || '新对话'
  conv.updatedAt = Date.now()
}

function clearMessages(convId: string) {
  const conv = state.conversations.find(c => c.id === convId)
  if (!conv) return
  conv.messages = []
  conv.updatedAt = Date.now()
}

function getCurrentConversation(): Conversation | null {
  if (!state.currentId) return null
  return state.conversations.find(c => c.id === state.currentId) || null
}

export const chatStore = {
  state,
  createConversation,
  deleteConversation,
  switchTo,
  renameConversation,
  addMessage,
  clearMessages,
  getCurrentConversation,
}
