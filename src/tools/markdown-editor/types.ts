export interface Document {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

export interface Config {
  theme: 'light' | 'dark' | 'auto'
  fontSize: number
  editorWidth: number
  autoSave: boolean
}

export interface ImageData {
  id: string
  blob: Blob
  base64: string
  createdAt: number
}

export interface EditorEvent {
  type: 'content-changed' | 'cursor-moved' | 'focus-changed'
  data: any
}

export interface ExportOptions {
  includeStyles: boolean
  inlineImages: boolean
  format: 'pdf' | 'html' | 'markdown'
}
