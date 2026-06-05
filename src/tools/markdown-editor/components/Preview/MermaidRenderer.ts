import mermaid from 'mermaid'

export class MermaidRenderer {
  private static initialized = false

  private static async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      await mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif'
      })
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize Mermaid:', error)
    }
  }

  static async renderCodeBlocks(codeBlocks: NodeListOf<Element>): Promise<void> {
    await this.initialize()

    for (const codeBlock of codeBlocks) {
      const element = codeBlock as HTMLElement

      const parent = element.parentElement
      if (parent && parent.classList.contains('mermaid-wrapper')) {
        continue
      }

      const code = element.textContent || ''
      const id = `mermaid-diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      try {
        const result = await mermaid.render(id, code)

        if (result.svg.includes('Syntax error') || result.svg.includes('Parse error')) {
          const preElement = element.parentElement
          if (preElement) {
            const errorDiv = document.createElement('div')
            errorDiv.className = 'mermaid-error'
            errorDiv.textContent = 'Mermaid 语法错误，请检查图表代码'
            preElement.replaceWith(errorDiv)
          }
          continue
        }

        const preElement = element.parentElement
        if (!preElement) continue

        const mermaidContainer = document.createElement('div')
        mermaidContainer.className = 'mermaid-wrapper'
        mermaidContainer.innerHTML = result.svg

        preElement.replaceWith(mermaidContainer)

        if (result.bindFunctions) {
          requestAnimationFrame(() => {
            result.bindFunctions(mermaidContainer)
          })
        }
      } catch (error) {
        console.error('Mermaid rendering error:', error)
        const preElement = element.parentElement
        if (preElement) {
          const errorDiv = document.createElement('div')
          errorDiv.className = 'mermaid-error'
          errorDiv.textContent = `Mermaid 图表渲染失败`
          preElement.replaceWith(errorDiv)
        }
      }
    }
  }
}
