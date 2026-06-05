<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/layout/AppSidebar.vue'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

const route = useRoute()
const currentTheme = ref<'light' | 'dark'>('light')
const sidebarCollapsed = ref(false)

const isLegalPage = computed(() => route.name === 'legal')
</script>

<template>
  <div class="app-root" :data-theme="currentTheme">
    <template v-if="isLegalPage">
      <router-view />
    </template>
    <template v-else>
      <AppSidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
      <div class="app-main">
        <AppHeader />
        <div class="app-content">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
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

.app-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
</style>
