type EventCallback = (data: any) => void

class EventBus {
  private events: Map<string, EventCallback[]> = new Map()

  on(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event) || []
    callbacks.push(callback)
    this.events.set(event, callbacks)
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event)
    if (!callbacks) return
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  emit(event: string, data?: any): void {
    const callbacks = this.events.get(event) || []
    callbacks.forEach(callback => callback(data))
  }

  clear(): void {
    this.events.clear()
  }
}

export const eventBus = new EventBus()
