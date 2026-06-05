import { eventBus } from '../Common/EventBus'
import { IndexedDBAdapter } from '../Storage/IndexedDBAdapter'
import type { ImageData } from '../../types'

export class ImagePaste {
  private indexedDB: IndexedDBAdapter

  constructor() {
    this.indexedDB = new IndexedDBAdapter()
    this.indexedDB.init()
  }

  async handlePaste(event: ClipboardEvent): Promise<string | null> {
    const items = event.clipboardData?.items
    if (!items) return null

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile()
        if (!blob) continue

        const imageData = await this.saveImage(blob)
        if (imageData) {
          return `![图片](uuid://${imageData.id})`
        }
      }
    }

    return null
  }

  private async saveImage(blob: Blob): Promise<ImageData | null> {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = async () => {
        const base64 = reader.result as string
        const imageData: ImageData = {
          id: this.generateId(),
          blob,
          base64,
          createdAt: Date.now()
        }

        const success = await this.indexedDB.addImage(imageData)
        resolve(success ? imageData : null)
      }

      reader.onerror = () => {
        console.error('Failed to read image blob')
        resolve(null)
      }

      reader.readAsDataURL(blob)
    })
  }

  async loadImage(id: string): Promise<string | null> {
    const imageData = await this.indexedDB.getImage(id)
    return imageData ? imageData.base64 : null
  }

  private generateId(): string {
    return `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
