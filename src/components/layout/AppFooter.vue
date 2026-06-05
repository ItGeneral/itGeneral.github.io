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
  padding: 12px 16px;
  flex-shrink: 0;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-links a {
  color: #6b7280;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.footer-links a:hover {
  color: #10a37f;
  background: #f0fdf9;
}

.divider {
  color: #d1d5db;
  font-size: 14px;
  user-select: none;
}

.footer-copy {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .app-footer {
    padding: 16px 12px;
  }

  .footer-inner {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .footer-links {
    gap: 6px;
  }

  .footer-links a {
    font-size: 12px;
    padding: 3px 6px;
  }
}
</style>
