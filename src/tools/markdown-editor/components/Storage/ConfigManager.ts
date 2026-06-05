import type { Config } from '../../types'
import { IndexedDBAdapter } from './IndexedDBAdapter'

const DEFAULT_CONFIG: Config = {
  theme: 'light',
  fontSize: 14,
  editorWidth: 50,
  autoSave: true
}

export class ConfigManager {
  private indexedDB: IndexedDBAdapter
  private currentConfig: Config = DEFAULT_CONFIG

  constructor() {
    this.indexedDB = new IndexedDBAdapter()
    this.indexedDB.init()
  }

  async loadConfig(): Promise<Config> {
    const stored = await this.indexedDB.getConfig('user-config')
    this.currentConfig = stored || { ...DEFAULT_CONFIG }
    return this.currentConfig
  }

  async updateConfig(updates: Partial<Config>): Promise<Config> {
    this.currentConfig = { ...this.currentConfig, ...updates }
    await this.indexedDB.setConfig('user-config', this.currentConfig)
    return this.currentConfig
  }

  getConfig(): Config {
    return this.currentConfig
  }

  async resetConfig(): Promise<Config> {
    this.currentConfig = { ...DEFAULT_CONFIG }
    await this.indexedDB.setConfig('user-config', this.currentConfig)
    return this.currentConfig
  }
}
