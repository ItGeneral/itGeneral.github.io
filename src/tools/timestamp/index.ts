import type { ToolDefinition } from '../../core/types'
import DatetimeTool from './DatetimeTool.vue'

export const datetimeTool: ToolDefinition = {
  id: 'datetime-tool',
  name: 'Datetime Tool',
  nameKey: 'tool.datetime.name',
  description: 'Unix timestamp converter with live clock',
  descKey: 'tool.datetime.desc',
  icon: '🕐',
  path: '/datetime-tool',
  component: DatetimeTool,
}
