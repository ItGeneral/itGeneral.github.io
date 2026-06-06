import { toolRegistry } from '../core/toolRegistry'
import { aiChatTool } from './ai-chat/index'
import { markdownEditorTool } from './markdown-editor/index'
import { jsonConverterTool } from './json-converter/index'
import { regexTesterTool } from './regex-tester/index'
import { deduplicatorTool } from './deduplicator/index'

toolRegistry.register(aiChatTool)
toolRegistry.register(markdownEditorTool)
toolRegistry.register(jsonConverterTool)
toolRegistry.register(regexTesterTool)
toolRegistry.register(deduplicatorTool)
