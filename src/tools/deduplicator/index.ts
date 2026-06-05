import type { ToolDefinition } from '../../core/types'
import DeduplicatorTool from './DeduplicatorTool.vue'

export const deduplicatorTool: ToolDefinition = {
  id: 'deduplicator',
  name: 'Deduplicator',
  nameKey: 'tool.dedup.name',
  description: 'Remove duplicate lines from text with options for case sensitivity, trimming, and sorting',
  descKey: 'tool.dedup.desc',
  icon: '🧹',
  path: '/deduplicator',
  component: DeduplicatorTool,
}
