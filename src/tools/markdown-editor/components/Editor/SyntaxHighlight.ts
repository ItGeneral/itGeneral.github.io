import { markdown } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { oneDark } from '@codemirror/theme-one-dark'
import { Extension } from '@codemirror/state'
import { lineNumbers } from '@codemirror/view'
import { yaml } from '@codemirror/lang-yaml'

const customLanguages = [
  ...languages,
  {
    name: 'mermaid',
    support: yaml(),
    alias: ['mermaid'],
  }
]

export function createMarkdownExtensions(isDark: boolean = false): Extension[] {
  const extensions: Extension[] = [
    lineNumbers(),
    markdown({ codeLanguages: customLanguages }),
  ]

  if (isDark) {
    extensions.push(oneDark)
  }

  return extensions
}
