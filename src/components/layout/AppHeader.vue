<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { toolRegistry } from '../../core/toolRegistry'
import { useI18n } from '../../i18n'

const route = useRoute()
const { t } = useI18n()

const currentTool = computed(() => {
  return toolRegistry.getAll().find(t => t.path === route.path)
})
</script>

<template>
  <header class="app-header" v-if="currentTool">
    <span class="header-icon">{{ currentTool.icon }}</span>
    <h1 class="header-title">{{ currentTool.nameKey ? t(currentTool.nameKey) : currentTool.name }}</h1>
    <span class="header-desc">{{ currentTool.descKey ? t(currentTool.descKey) : currentTool.description }}</span>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px;
  height: 48px;
  background: var(--header-bg, #ffffff);
  border-bottom: 1px solid var(--border-color, #eaecef);
  flex-shrink: 0;
}

.header-icon {
  font-size: 20px;
}

.header-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #24292e);
}

.header-desc {
  font-size: 12px;
  color: var(--text-secondary, #586069);
  margin-left: auto;
}
</style>
