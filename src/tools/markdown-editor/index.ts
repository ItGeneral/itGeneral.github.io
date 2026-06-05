import type { ToolDefinition } from '../../core/types'
import MarkdownEditorTool from './MarkdownEditorTool.vue'

export const markdownEditorTool: ToolDefinition = {
  id: 'markdown-editor',
  name: 'Markdown Editor',
  description: 'A powerful Markdown editor with live preview, code highlighting, and export capabilities',
  icon: '📝',
  path: '/markdown-editor',
  component: MarkdownEditorTool,
}
