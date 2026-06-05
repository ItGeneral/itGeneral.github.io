import { reactive } from 'vue'

export type AIProvider = 'openai' | 'anthropic' | 'deepseek' | 'custom'

export interface AIConfig {
  provider: AIProvider
  apiKey: string
  model: string
  baseUrl: string
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = 'ai-tools-ai-config'

const DEFAULT_CONFIGS: Record<AIProvider, { model: string; baseUrl: string; label: string }> = {
  openai: {
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
    label: 'OpenAI',
  },
  anthropic: {
    model: 'claude-3-5-sonnet-20241022',
    baseUrl: 'https://api.anthropic.com/v1',
    label: 'Anthropic Claude',
  },
  deepseek: {
    model: 'deepseek-chat',
    baseUrl: 'https://api.deepseek.com/v1',
    label: 'DeepSeek',
  },
  custom: {
    model: '',
    baseUrl: '',
    label: 'Custom',
  },
}

const state = reactive<{ config: AIConfig }>({
  config: loadConfig(),
})

function loadConfig(): AIConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  // Default to BigModel (GLM) - OpenAI-compatible
  return {
    provider: 'custom',
    apiKey: '',
    model: 'glm-4-flash',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  }
}

function saveConfig() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.config))
}

export function getAIConfig(): AIConfig {
  return state.config
}

export function setAIConfig(updates: Partial<AIConfig>) {
  Object.assign(state.config, updates)
  saveConfig()
}

export function getProviderDefaults(provider: AIProvider) {
  return DEFAULT_CONFIGS[provider]
}

export function getProviderLabel(provider: AIProvider): string {
  return DEFAULT_CONFIGS[provider].label
}

export function isAIConfigured(): boolean {
  return !!state.config.apiKey && !!state.config.model && !!state.config.baseUrl
}

export async function chat(messages: AIMessage[]): Promise<string> {
  if (!isAIConfigured()) {
    throw new Error('AI not configured. Please set API key in settings.')
  }

  const { provider, apiKey, model, baseUrl } = state.config

  if (provider === 'anthropic') {
    return chatAnthropic(messages, apiKey, model, baseUrl)
  }

  return chatOpenAICompatible(messages, apiKey, model, baseUrl)
}

async function chatOpenAICompatible(
  messages: AIMessage[],
  apiKey: string,
  model: string,
  baseUrl: string,
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AI request failed: ${res.status} ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function chatAnthropic(
  messages: AIMessage[],
  apiKey: string,
  model: string,
  baseUrl: string,
): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system')?.content || ''
  const userMsgs = messages.filter(m => m.role !== 'system')

  const res = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemMsg,
      messages: userMsgs.map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`AI request failed: ${res.status} ${err}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text || ''
}

export function useAI() {
  return {
    config: state.config,
    getAIConfig,
    setAIConfig,
    isAIConfigured,
    chat,
  }
}