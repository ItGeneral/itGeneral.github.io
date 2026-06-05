import type { Component } from 'vue'

export interface ToolDefinition {
  id: string
  name: string
  description: string
  nameKey?: string
  descKey?: string
  icon: string
  path: string
  component: Component
}
