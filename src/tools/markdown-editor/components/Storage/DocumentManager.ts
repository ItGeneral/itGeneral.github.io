import type { Document } from '../../types'
import { IndexedDBAdapter } from './IndexedDBAdapter'
import { eventBus } from '../Common/EventBus'

export class DocumentManager {
  private indexedDB: IndexedDBAdapter
  private currentDocId: string | null = null
  private autoSaveTimer: number | null = null

  constructor() {
    this.indexedDB = new IndexedDBAdapter()
    this.indexedDB.init()
  }

  async createDocument(title: string = ''): Promise<Document> {
    const doc: Document = {
      id: this.generateId(),
      title,
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    await this.indexedDB.addDocument(doc)
    eventBus.emit('document-created', doc)
    return doc
  }

  async loadDocument(id: string): Promise<Document | null> {
    const doc = await this.indexedDB.getDocument(id)
    if (doc) {
      this.currentDocId = id
      eventBus.emit('document-loaded', doc)
    }
    return doc
  }

  async saveDocument(content: string, title?: string): Promise<boolean> {
    if (!this.currentDocId) return false

    const existingDoc = await this.indexedDB.getDocument(this.currentDocId)
    if (!existingDoc) return false

    const updatedDoc: Document = {
      ...existingDoc,
      content,
      title: title || existingDoc.title,
      updatedAt: Date.now()
    }

    const success = await this.indexedDB.addDocument(updatedDoc)
    if (success) {
      eventBus.emit('document-saved', updatedDoc)
    }
    return success
  }

  async getAllDocuments(): Promise<Document[]> {
    return await this.indexedDB.getAllDocuments()
  }

  async deleteDocument(id: string): Promise<boolean> {
    const success = await this.indexedDB.deleteDocument(id)
    if (success) {
      eventBus.emit('document-deleted', { id })
    }
    return success
  }

  async searchDocuments(query: string): Promise<Document[]> {
    const docs = await this.getAllDocuments()
    const lowerQuery = query.toLowerCase()

    return docs.filter(doc =>
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.content.toLowerCase().includes(lowerQuery)
    )
  }

  enableAutoSave(callback: () => void, delay: number = 500): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer)
    }

    this.autoSaveTimer = window.setTimeout(() => {
      callback()
    }, delay)
  }

  disableAutoSave(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = null
    }
  }

  getCurrentDocumentId(): string | null {
    return this.currentDocId
  }

  private generateId(): string {
    return `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
