import { computed } from 'vue'
import { useI18n } from '../i18n'

// 动态加载所有工具的使用说明文档
const helpModules = import.meta.glob<{ default: string }>('/src/tools/*/GUIDE.*.md', {
  query: '?raw',
  import: 'default',
})

export interface ToolKnowledge {
  toolId: string
  name: string
  content: string
}

/**
 * 工具知识库 Composable
 * 用于加载所有工具的使用说明文档，作为AI回答的知识库
 */
export function useToolKnowledge() {
  const { locale } = useI18n()

  /**
   * 获取所有工具的知识库内容
   */
  const allKnowledge = computed<ToolKnowledge[]>(() => {
    const knowledge: ToolKnowledge[] = []
    const lang = locale.value === 'zh' ? 'zh-CN' : 'en-US'

    for (const [path, module] of Object.entries(helpModules)) {
      // 匹配路径格式: /src/tools/{toolId}/GUIDE.{lang}.md
      const match = path.match(/\/src\/tools\/([^/]+)\/GUIDE\.([^/]+)\.md/)
      if (match) {
        const [, toolId, fileLang] = match
        // 只加载当前语言的文档
        if (fileLang === lang) {
          const content = (module as any).default || ''
          // 提取工具名称（从文档的第一行或文件名）
          const name = extractToolName(content, toolId)
          knowledge.push({ toolId, name, content })
        }
      }
    }

    return knowledge
  })

  /**
   * 从文档内容中提取工具名称
   */
  function extractToolName(content: string, toolId: string): string {
    // 尝试从 markdown 的第一个 # 标题提取
    const titleMatch = content.match(/^#\s+(.+)$/m)
    if (titleMatch) {
      return titleMatch[1].trim()
    }
    // 如果没有找到标题，使用 toolId
    return toolId
  }

  /**
   * 构建AI系统提示词，包含工具知识库信息
   */
  const buildSystemPrompt = (userQuestion: string): string => {
    const lang = locale.value
    const isZh = lang === 'zh'

    let systemPrompt = isZh
      ? `你是一个AI工具助手的助手。你的职责是回答用户关于AI Tools工具箱中各个工具的使用问题。

以下是本工具箱中所有工具的使用说明：

`
      : `You are an assistant for an AI Tools toolkit. Your responsibility is to answer user questions about how to use various tools in the toolkit.

Below is the user guide for all tools in this toolkit:

`

    // 添加所有工具的知识库内容
    for (const knowledge of allKnowledge.value) {
      systemPrompt += `\n---\n\n## ${knowledge.name}\n\n${knowledge.content}\n\n`
    }

    systemPrompt += isZh
      ? `\n---
请基于上述工具说明回答用户的问题。如果问题涉及某个具体工具，请详细说明该工具的使用方法。
如果用户的问题不涉及任何工具，可以告知用户你只能回答工具使用相关的问题。`
      : `\n---
Please answer user questions based on the tool documentation above. If the question relates to a specific tool, please explain in detail how to use that tool.
If the user's question does not relate to any tool, you can inform the user that you can only answer tool usage related questions.`

    return systemPrompt
  }

  /**
   * 检测用户问题是否与工具使用相关
   */
  const isToolRelatedQuestion = (question: string): boolean => {
    const keywords = locale.value === 'zh'
      ? ['怎么用', '如何', '使用', '说明', '帮助', '工具', '功能', '操作', '用法', '使用方法', '怎么做']
      : ['how to', 'how do i', 'use', 'usage', 'help', 'tool', 'feature', 'operation', 'guide', 'instruction']

    const lowerQuestion = question.toLowerCase()
    return keywords.some(keyword => lowerQuestion.includes(keyword))
  }

  return {
    allKnowledge,
    buildSystemPrompt,
    isToolRelatedQuestion,
  }
}
