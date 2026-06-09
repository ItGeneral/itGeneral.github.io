<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppLeftSidebar from './components/layout/AppLeftSidebar.vue'
import AppTopNav from './components/layout/AppTopNav.vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import CookieConsent from './components/CookieConsent.vue'
import { initEmailJS } from './core/email'

const route = useRoute()
const currentTheme = ref<'light' | 'dark'>('light')

// 初始化 EmailJS
onMounted(() => {
  initEmailJS()
})

const isLegalPage = computed(() => route.name === 'legal')

// 判断是否显示左侧边栏（AI Chat 或 Markdown Editor）
const showLeftSidebar = computed(() => {
  return route.path === '/ai-chat' || route.path === '/markdown-editor'
})
</script>

<template>
  <div class="app-root" :data-theme="currentTheme">
    <!-- Cookie 同意横幅 -->
    <CookieConsent />

    <template v-if="isLegalPage">
      <router-view />
    </template>
    <template v-else>
      <div class="app-main">
        <AppTopNav />
        <div class="app-body">
          <AppLeftSidebar v-if="showLeftSidebar" />
          <div class="app-content-wrapper">
            <div class="app-content">
              <router-view v-slot="{ Component }">
                <keep-alive>
                  <component :is="Component" />
                </keep-alive>
              </router-view>
            </div>
          </div>
        </div>
        <AppFooter />
      </div>
    </template>
  </div>
</template>

<style>
@import './styles/themes/light.css';
@import './styles/themes/dark.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  overflow: hidden;
}

body:has(.legal-page) {
  overflow: auto;
}

.app-root:has(.legal-page) {
  display: block;
  height: auto;
  min-height: 100vh;
}

.app-root {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292e);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.app-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.app-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
</style>
