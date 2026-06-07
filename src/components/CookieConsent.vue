<template>
  <div v-if="showBanner" class="cookie-consent-banner">
    <div class="cookie-consent-content">
      <div class="cookie-consent-text">
        <span class="cookie-icon">🍪</span>
        <div class="cookie-message">
          <p>{{ t('cookieConsent.message') }}</p>
          <p class="cookie-privacy-link">
            <a @click="showPrivacy">{{ t('cookieConsent.privacyLink') }}</a>
          </p>
        </div>
      </div>
      <div class="cookie-consent-actions">
        <button @click="handleReject" class="cookie-btn cookie-btn-reject">
          {{ t('cookieConsent.reject') }}
        </button>
        <button @click="handleAccept" class="cookie-btn cookie-btn-accept">
          {{ t('cookieConsent.accept') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../i18n'
import { useRouter } from 'vue-router'
import { enableAnalytics, disableAnalytics } from '../core/analytics'

const { t } = useI18n()
const router = useRouter()

// 检查是否已显示过
const consent = localStorage.getItem('cookie-consent')
const showBanner = computed(() => !consent)

// 接受统计
const handleAccept = () => {
  enableAnalytics()
}

// 拒绝统计
const handleReject = () => {
  disableAnalytics()
}

// 显示隐私政策
const showPrivacy = () => {
  router.push('/page/privacy')
}
</script>

<style scoped>
.cookie-consent-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-secondary, #f5f5f5);
  border-top: 1px solid var(--border-color, #e1e4e8);
  padding: 16px 24px;
  z-index: 1000;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.cookie-consent-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.cookie-consent-text {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.cookie-icon {
  font-size: 24px;
  line-height: 1;
}

.cookie-message p {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary, #24292e);
  line-height: 1.5;
}

.cookie-message p:not(:last-child) {
  margin-bottom: 4px;
}

.cookie-privacy-link a {
  color: var(--link-color, #0969da);
  cursor: pointer;
  text-decoration: underline;
}

.cookie-privacy-link a:hover {
  color: var(--link-hover-color, #0550ae);
}

.cookie-consent-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.cookie-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color, #e1e4e8);
  border-radius: 6px;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292e);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cookie-btn:hover {
  background: var(--bg-hover, #f3f4f6);
}

.cookie-btn-accept {
  background: var(--primary-color, #0969da);
  color: white;
  border-color: var(--primary-color, #0969da);
}

.cookie-btn-accept:hover {
  background: var(--primary-hover-color, #0550ae);
}

@media (max-width: 768px) {
  .cookie-consent-content {
    flex-direction: column;
    gap: 16px;
  }

  .cookie-consent-text {
    width: 100%;
  }

  .cookie-consent-actions {
    width: 100%;
    justify-content: stretch;
  }

  .cookie-btn {
    flex: 1;
  }
}
</style>
