import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import c from 'highlight.js/lib/languages/c'
import css from 'highlight.js/lib/languages/css'
import html from 'highlight.js/lib/languages/xml'
import xml from 'highlight.js/lib/languages/xml'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import php from 'highlight.js/lib/languages/php'
import ruby from 'highlight.js/lib/languages/ruby'
import swift from 'highlight.js/lib/languages/swift'
import kotlin from 'highlight.js/lib/languages/kotlin'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c', c)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', html)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('php', php)
hljs.registerLanguage('ruby', ruby)
hljs.registerLanguage('swift', swift)
hljs.registerLanguage('kotlin', kotlin)

export class CodeHighlight {
  static highlightAll(container: HTMLElement): void {
    const codeBlocks = container.querySelectorAll('pre code')
    codeBlocks.forEach((block) => {
      const codeElement = block as HTMLElement
      const language = this.detectLanguage(codeElement)

      if (language && language !== 'plaintext') {
        try {
          const result = hljs.highlight(codeElement.textContent || '', { language })
          codeElement.innerHTML = result.value
          codeElement.classList.add('hljs')
          codeElement.classList.add(`language-${language}`)
        } catch (error) {
          console.error('Highlight.js error:', error)
        }
      }
    })
  }

  private static detectLanguage(codeElement: HTMLElement): string {
    const classes = codeElement.className.split(' ')

    for (const cls of classes) {
      if (cls.startsWith('language-')) {
        const lang = cls.replace('language-', '')
        if (hljs.getLanguage(lang)) {
          return lang
        }
      }
    }

    const code = codeElement.textContent || ''
    if (code.trim()) {
      const result = hljs.highlightAuto(code)
      return result.language || 'plaintext'
    }

    return 'plaintext'
  }
}
