<template>
  <div class="legal-page">
    <div class="legal-container">
      <h1>{{ pageData?.title || '404' }}</h1>
      <div v-if="pageData" class="legal-content" v-html="pageData.html"></div>
      <div v-else class="legal-content">
        <p>Page not found.</p>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getLegalPage } from './legalContent'
import { locale } from '../i18n'
import AppFooter from '../components/layout/AppFooter.vue'

const route = useRoute()

const pageData = computed(() => {
  const key = route.params.page as string
  return getLegalPage(key, locale.value as 'zh' | 'en')
})
</script>

<style scoped>
.legal-page {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.legal-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 24px;
  flex: 1;
}

.legal-container h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e5e5;
}

.legal-content {
  font-size: 15px;
  line-height: 1.8;
  color: #374151;
}

.legal-content :deep(h2) {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 32px 0 12px;
}

.legal-content :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 20px 0 8px;
}

.legal-content :deep(p) {
  margin: 8px 0;
}

.legal-content :deep(ul) {
  padding-left: 20px;
  margin: 8px 0;
}

.legal-content :deep(li) {
  margin: 4px 0;
}

.legal-content :deep(a) {
  color: #10a37f;
  text-decoration: none;
}

.legal-content :deep(a:hover) {
  text-decoration: underline;
}

.legal-content :deep(strong) {
  font-weight: 600;
}

@media (max-width: 640px) {
  .legal-container {
    padding: 40px 16px;
  }
  .legal-container h1 {
    font-size: 22px;
  }
}
</style>
