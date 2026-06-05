import { ref, computed } from 'vue'
import { getMessages, type Locale, type I18nMessages } from './messages'

const STORAGE_KEY = 'ai-tools-locale'

function getStoredLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'zh' || stored === 'en') return stored
  return navigator.language.startsWith('zh') ? 'zh' : 'en'
}

export const locale = ref<Locale>(getStoredLocale())
const messages = ref<I18nMessages>(getMessages(locale.value))

function setLocale(l: Locale) {
  locale.value = l
  messages.value = getMessages(l)
  localStorage.setItem(STORAGE_KEY, l)
}

function t(key: string, params?: Record<string, string | number>): string {
  let msg = messages.value[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      msg = msg.replace(`{${k}}`, String(v))
    }
  }
  return msg
}

export function useI18n() {
  return {
    locale: computed(() => locale.value),
    t,
    setLocale,
  }
}
