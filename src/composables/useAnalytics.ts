/**
 * 统计功能的 Vue Composable
 * 提供便捷的统计 API 用于组件中
 */

import { trackEvent, trackPageView, isAnalyticsEnabled } from '../core/analytics'

/**
 * 统计 Composable
 */
export function useAnalytics() {
  /**
   * 追踪页面浏览
   */
  const trackPage = (path: string, title?: string) => {
    trackPageView(path, title)
  }

  /**
   * 追踪自定义事件
   */
  const track = (name: string, props?: Record<string, any>) => {
    trackEvent(name, props)
  }

  /**
   * 追踪工具使用
   */
  const trackToolUsed = (toolId: string, toolName: string) => {
    trackEvent('tool_used', {
      tool_id: toolId,
      tool_name: toolName,
    })
  }

  /**
   * 追踪 AI 调用
   */
  const trackAICall = (provider: string, model: string, messageLength?: number) => {
    trackEvent('ai_call', {
      provider,
      model,
      message_length: messageLength,
    })
  }

  /**
   * 追踪 Markdown 导出
   */
  const trackMarkdownExport = (format: 'html' | 'md') => {
    trackEvent('markdown_export', { format })
  }

  /**
   * 追踪 JSON 转换
   */
  const trackJSONConvert = (targetFormat: string) => {
    trackEvent('json_convert', { target_format: targetFormat })
  }

  /**
   * 追踪正则测试
   */
  const trackRegexTest = () => {
    trackEvent('regex_test')
  }

  /**
   * 检查统计是否启用
   */
  const enabled = isAnalyticsEnabled()

  return {
    trackPage,
    track,
    trackToolUsed,
    trackAICall,
    trackMarkdownExport,
    trackJSONConvert,
    trackRegexTest,
    enabled,
  }
}
