import type { ToolDefinition } from '../../core/types'
import JsonConverterTool from './JsonConverterTool.vue'

export const jsonConverterTool: ToolDefinition = {
  id: 'json-converter',
  name: 'JSON Converter',
  nameKey: 'tool.json.name',
  description: 'JSON format, minify, convert to YAML/XML/CSV/TypeScript/Java/Go, generate Schema, and Path query',
  descKey: 'tool.json.desc',
  icon: '🔄',
  path: '/json-converter',
  component: JsonConverterTool,
}
