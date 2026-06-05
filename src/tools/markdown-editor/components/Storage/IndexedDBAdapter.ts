const DB_NAME = 'MarkdownEditorDB'
const DB_VERSION = 1
const STORE_DOCUMENTS = 'documents'
const STORE_IMAGES = 'images'
const STORE_CONFIG = 'config'

export class IndexedDBAdapter {
  private db: IDBDatabase | null = null

  async init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('IndexedDB open failed:', request.error)
        reject(false)
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve(true)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(STORE_DOCUMENTS)) {
          const docStore = db.createObjectStore(STORE_DOCUMENTS, { keyPath: 'id' })
          docStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORE_IMAGES)) {
          const imgStore = db.createObjectStore(STORE_IMAGES, { keyPath: 'id' })
          imgStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORE_CONFIG)) {
          db.createObjectStore(STORE_CONFIG, { keyPath: 'key' })
        }
      }
    })
  }

  async addDocument(doc: any): Promise<boolean> {
    if (!this.db) await this.init()
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_DOCUMENTS], 'readwrite')
      const store = transaction.objectStore(STORE_DOCUMENTS)
      const request = store.put(doc)

      request.onsuccess = () => resolve(true)
      request.onerror = () => {
        console.error('IndexedDB addDocument failed:', request.error)
        resolve(false)
      }
    })
  }

  async getDocument(id: string): Promise<any | null> {
    if (!this.db) await this.init()
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_DOCUMENTS], 'readonly')
      const store = transaction.objectStore(STORE_DOCUMENTS)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => {
        console.error('IndexedDB getDocument failed:', request.error)
        resolve(null)
      }
    })
  }

  async getAllDocuments(): Promise<any[]> {
    if (!this.db) await this.init()
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_DOCUMENTS], 'readonly')
      const store = transaction.objectStore(STORE_DOCUMENTS)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => {
        console.error('IndexedDB getAllDocuments failed:', request.error)
        resolve([])
      }
    })
  }

  async deleteDocument(id: string): Promise<boolean> {
    if (!this.db) await this.init()
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_DOCUMENTS], 'readwrite')
      const store = transaction.objectStore(STORE_DOCUMENTS)
      const request = store.delete(id)

      request.onsuccess = () => resolve(true)
      request.onerror = () => {
        console.error('IndexedDB deleteDocument failed:', request.error)
        resolve(false)
      }
    })
  }

  async addImage(image: any): Promise<boolean> {
    if (!this.db) await this.init()
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_IMAGES], 'readwrite')
      const store = transaction.objectStore(STORE_IMAGES)
      const request = store.put(image)

      request.onsuccess = () => resolve(true)
      request.onerror = () => {
        console.error('IndexedDB addImage failed:', request.error)
        resolve(false)
      }
    })
  }

  async getImage(id: string): Promise<any | null> {
    if (!this.db) await this.init()
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_IMAGES], 'readonly')
      const store = transaction.objectStore(STORE_IMAGES)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => {
        console.error('IndexedDB getImage failed:', request.error)
        resolve(null)
      }
    })
  }

  async setConfig(key: string, value: any): Promise<boolean> {
    if (!this.db) await this.init()
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_CONFIG], 'readwrite')
      const store = transaction.objectStore(STORE_CONFIG)
      const request = store.put({ key, value })

      request.onsuccess = () => resolve(true)
      request.onerror = () => {
        console.error('IndexedDB setConfig failed:', request.error)
        resolve(false)
      }
    })
  }

  async getConfig(key: string): Promise<any | null> {
    if (!this.db) await this.init()
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_CONFIG], 'readonly')
      const store = transaction.objectStore(STORE_CONFIG)
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.value : null)
      }
      request.onerror = () => {
        console.error('IndexedDB getConfig failed:', request.error)
        resolve(null)
      }
    })
  }
}
