import type { ToolDefinition } from '../../core/types'
import AIChatTool from './AIChatTool.vue'

export const aiChatTool: ToolDefinition = {
  id: 'ai-chat',
  name: 'AI Chat',
  nameKey: 'tool.aichat.name',
  description: 'Chat with AI assistant',
  descKey: 'tool.aichat.desc',
  icon: '🤖',
  path: '/ai-chat',
  component: AIChatTool,
}
