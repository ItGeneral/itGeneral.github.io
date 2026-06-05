import type { ToolDefinition } from './types'
import type { RouteRecordRaw } from 'vue-router'

class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map()

  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.id)) {
      console.warn(`Tool "${tool.id}" is already registered, skipping.`)
      return
    }
    this.tools.set(tool.id, tool)
  }

  unregister(id: string): boolean {
    return this.tools.delete(id)
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values())
  }

  getById(id: string): ToolDefinition | undefined {
    return this.tools.get(id)
  }

  getRoutes(): RouteRecordRaw[] {
    return this.getAll().map(tool => ({
      path: tool.path,
      name: `tool-${tool.id}`,
      component: tool.component,
    }))
  }
}

export const toolRegistry = new ToolRegistry()
