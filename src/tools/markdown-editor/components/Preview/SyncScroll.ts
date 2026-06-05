export class SyncScroll {
  private editorEl: HTMLElement
  private previewEl: HTMLElement
  private isEditorScrolling = false
  private isPreviewScrolling = false

  constructor(editorEl: HTMLElement, previewEl: HTMLElement) {
    this.editorEl = editorEl
    this.previewEl = previewEl
    this.init()
  }

  private init(): void {
    this.editorEl.addEventListener('scroll', () => this.onEditorScroll())
    this.previewEl.addEventListener('scroll', () => this.onPreviewScroll())
  }

  private onEditorScroll(): void {
    if (this.isEditorScrolling) return

    this.isEditorScrolling = true
    const ratio = this.editorEl.scrollTop / (this.editorEl.scrollHeight - this.editorEl.clientHeight)
    this.previewEl.scrollTop = ratio * (this.previewEl.scrollHeight - this.previewEl.clientHeight)

    setTimeout(() => {
      this.isEditorScrolling = false
    }, 100)
  }

  private onPreviewScroll(): void {
    if (this.isPreviewScrolling) return

    this.isPreviewScrolling = true
    const ratio = this.previewEl.scrollTop / (this.previewEl.scrollHeight - this.previewEl.clientHeight)
    this.editorEl.scrollTop = ratio * (this.editorEl.scrollHeight - this.editorEl.clientHeight)

    setTimeout(() => {
      this.isPreviewScrolling = false
    }, 100)
  }

  destroy(): void {
    this.editorEl.removeEventListener('scroll', () => this.onEditorScroll())
    this.previewEl.removeEventListener('scroll', () => this.onPreviewScroll())
  }
}
