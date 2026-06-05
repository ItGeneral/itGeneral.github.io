import { eventBus } from '../Common/EventBus'
import { DocumentManager } from '../Storage/DocumentManager'

export class AutoSave {
  private documentManager: DocumentManager
  private saveTimer: number | null = null
  private delay: number
  private saveStatus: 'saved' | 'saving' | 'unsaved' = 'saved'

  constructor(documentManager: DocumentManager, delay: number = 500) {
    this.documentManager = documentManager
    this.delay = delay
    this.init()
  }

  private init(): void {
    eventBus.on('content-changed', (data) => {
      this.scheduleSave(data.content)
    })
  }

  private scheduleSave(content: string): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }

    this.saveStatus = 'unsaved'
    eventBus.emit('save-status-changed', this.saveStatus)

    this.saveTimer = window.setTimeout(async () => {
      await this.performSave(content)
    }, this.delay)
  }

  private async performSave(content: string): Promise<void> {
    this.saveStatus = 'saving'
    eventBus.emit('save-status-changed', this.saveStatus)

    const success = await this.documentManager.saveDocument(content)

    this.saveStatus = success ? 'saved' : 'unsaved'
    eventBus.emit('save-status-changed', this.saveStatus)
  }

  getSaveStatus(): 'saved' | 'saving' | 'unsaved' {
    return this.saveStatus
  }

  destroy(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer)
    }
    eventBus.off('content-changed')
  }
}
