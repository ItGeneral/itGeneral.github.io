<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-links">
        <router-link to="/page/privacy">{{ t('footer.privacy') }}</router-link>
        <span class="divider">·</span>
        <router-link to="/page/terms">{{ t('footer.terms') }}</router-link>
        <span class="divider">·</span>
        <router-link to="/page/about">{{ t('footer.about') }}</router-link>
        <span class="divider">·</span>
        <router-link to="/page/contact">{{ t('footer.contact') }}</router-link>
      </div>
      <div class="footer-copy">
        © {{ new Date().getFullYear() }} AI Tools · {{ t('footer.allRightsReserved') }}
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useI18n } from '../../i18n'

const { t } = useI18n()
</script>

<style scoped>
.app-footer {
  background: #fff;
  border-top: 1px solid #e5e5e5;
  padding: 8px 16px;
  flex-shrink: 0;
  height: 36px;
  display: flex;
  align-items: center;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-links a {
  color: #6b7280;
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.footer-links a:hover {
  color: #10a37f;
  background: #f0fdf9;
}

.divider {
  color: #d1d5db;
  font-size: 12px;
  user-select: none;
}

.footer-copy {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .app-footer {
    padding: 6px 12px;
    height: auto;
  }

  .footer-inner {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .footer-links {
    gap: 4px;
  }

  .footer-links a {
    font-size: 11px;
    padding: 2px 4px;
  }
}
</style>
