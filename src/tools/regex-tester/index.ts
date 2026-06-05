import type { ToolDefinition } from '../../core/types'
import RegexTesterTool from './RegexTesterTool.vue'

export const regexTesterTool: ToolDefinition = {
  id: 'regex-tester',
  name: 'Regex Tester',
  nameKey: 'tool.regex.name',
  description: 'Regular expression tester with real-time matching, capture groups, and common patterns',
  descKey: 'tool.regex.desc',
  icon: '🎯',
  path: '/regex-tester',
  component: RegexTesterTool,
}
