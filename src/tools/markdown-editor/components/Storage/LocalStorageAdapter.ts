export class LocalStorageAdapter {
  private prefix = 'markdown-editor-'

  setItem(key: string, value: any): boolean {
    try {
      const data = JSON.stringify(value)
      localStorage.setItem(this.prefix + key, data)
      return true
    } catch (error) {
      console.error('LocalStorage setItem failed:', error)
      return false
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(this.prefix + key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('LocalStorage getItem failed:', error)
      return null
    }
  }

  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key)
      return true
    } catch (error) {
      console.error('LocalStorage removeItem failed:', error)
      return false
    }
  }

  clear(): boolean {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key))
      return true
    } catch (error) {
      console.error('LocalStorage clear failed:', error)
      return false
    }
  }

  getUsedSpace(): number {
    let total = 0
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => {
        total += localStorage.getItem(key)?.length || 0
      })
    return total
  }

  getMaxSpace(): number {
    return 5 * 1024 * 1024
  }
}
