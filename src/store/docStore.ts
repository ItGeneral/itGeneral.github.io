import { reactive } from 'vue'
import { DocumentManager } from '../tools/markdown-editor/components/Storage/DocumentManager'
import { useI18n } from '../i18n'

const { t } = useI18n()

export interface DocInfo {
  id: string
  title: string
  createdAt: number
}

const state = reactive({
  documents: [] as DocInfo[],
  currentDocId: null as string | null,
  currentContent: '',
  loaded: false,
})

const documentManager = new DocumentManager()

export const DEFAULT_DOC_CONTENT = `# 新文档

## 代码示例

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

## Mermaid 图表

\`\`\`mermaid
graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作A]
    B -->|否| D[执行操作B]
    C --> E[结束]
    D --> E
\`\`\`

## 表格

| 功能 | 状态 |
|------|------|
| 实时预览 | ✅ |
| 代码高亮 | ✅ |
| Mermaid 图表 | ✅ |
| 多文档管理 | ✅ |
`

export const docStore = {
  state,

  async loadAll() {
    const docs = await documentManager.getAllDocuments()
    state.documents = docs
      .map((d: { id: string; title: string; createdAt: number }) => ({ id: d.id, title: d.title, createdAt: d.createdAt }))
      .sort((a: DocInfo, b: DocInfo) => b.createdAt - a.createdAt)
    state.loaded = true
  },

  async createDocument(title?: string) {
    const baseTitle = title || this.generateUniqueName(t('doc.untitled'))
    const finalTitle = baseTitle.endsWith('.md') ? baseTitle : `${baseTitle}.md`
    const doc = await documentManager.createDocument(finalTitle)
    // loadDocument sets internal currentDocId in DocumentManager
    await documentManager.loadDocument(doc.id)
    state.currentDocId = doc.id
    state.currentContent = DEFAULT_DOC_CONTENT
    // save the default content
    await documentManager.saveDocument(DEFAULT_DOC_CONTENT, finalTitle)
    await this.loadAll()
    return doc
  },

  async switchDocument(docId: string) {
    if (state.currentDocId === docId) return
    // save current first
    if (state.currentDocId && state.currentContent !== undefined) {
      await documentManager.saveDocument(state.currentContent)
    }
    const doc = await documentManager.loadDocument(docId)
    if (doc) {
      state.currentDocId = doc.id
      state.currentContent = doc.content || ''
    }
    await this.loadAll()
  },

  async deleteDocument(docId: string) {
    await documentManager.deleteDocument(docId)
    await this.loadAll()

    if (state.currentDocId === docId) {
      if (state.documents.length > 0) {
        await this.switchDocument(state.documents[0].id)
      } else {
        await this.createDocument(t('doc.untitled'))
      }
    }
  },

  async saveCurrent(content: string, title?: string) {
    state.currentContent = content
    if (state.currentDocId) {
      await documentManager.saveDocument(content, title)
      await this.loadAll()
    }
  },

  async loadCurrent() {
    if (!state.loaded) {
      await this.loadAll()
    }
    if (state.documents.length > 0 && !state.currentDocId) {
      const doc = await documentManager.loadDocument(state.documents[0].id)
      if (doc) {
        state.currentDocId = doc.id
        state.currentContent = doc.content || ''
      }
    }
    return {
      id: state.currentDocId,
      content: state.currentContent,
    }
  },

  formatDate(ts: number): string {
    const d = new Date(ts)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  },

  async renameDocument(docId: string, newTitle: string) {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    const finalTitle = trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`
    // check uniqueness
    const existing = state.documents.find(d => d.id !== docId && d.title === finalTitle)
    if (existing) return // name already taken
    // load the doc to set internal currentDocId
    await documentManager.loadDocument(docId)
    const doc = await documentManager.loadDocument(docId)
    if (doc) {
      await documentManager.saveDocument(doc.content || '', finalTitle)
      await this.loadAll()
    }
  },

  generateUniqueName(base: string): string {
    const baseWithExt = base.endsWith('.md') ? base : `${base}.md`
    const stem = baseWithExt.replace(/\.md$/, '')
    const existingNames = new Set(state.documents.map(d => d.title))
    if (!existingNames.has(baseWithExt)) return stem
    let i = 2
    while (existingNames.has(`${stem} ${i}.md`)) i++
    return `${stem} ${i}`
  },
}
