import { ref, computed } from 'vue'
import { useI18n } from '../i18n'

// Dynamic imports for help content
const helpModules = import.meta.glob<{ default: string }>('/src/tools/*/GUIDE.*.md', {
  query: '?raw',
  import: 'default',
})

export function useToolHelp(toolId: string) {
  const { locale } = useI18n()
  const error = ref('')

  const helpContent = computed(() => {
    const lang = locale.value === 'zh' ? 'zh-CN' : 'en-US'
    const modulePath = `/src/tools/${toolId}/GUIDE.${lang}.md`

    // Find the module in the imported modules
    for (const [path, module] of Object.entries(helpModules)) {
      if (path.endsWith(`GUIDE.${lang}.md`) && path.includes(`/${toolId}/`)) {
        return (module as any).default || ''
      }
    }

    return ''
  })

  return {
    helpContent,
    error
  }
}
