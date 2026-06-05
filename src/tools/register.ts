import { toolRegistry } from '../core/toolRegistry'
import { markdownEditorTool } from './markdown-editor/index'
import { jsonConverterTool } from './json-converter/index'
import { regexTesterTool } from './regex-tester/index'
import { deduplicatorTool } from './deduplicator/index'
import { aiChatTool } from './ai-chat/index'

toolRegistry.register(markdownEditorTool)
toolRegistry.register(jsonConverterTool)
toolRegistry.register(regexTesterTool)
toolRegistry.register(deduplicatorTool)
toolRegistry.register(aiChatTool)
