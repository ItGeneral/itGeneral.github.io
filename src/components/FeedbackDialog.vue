<template>
  <div v-if="visible" class="feedback-dialog-overlay" @click="close">
    <div class="feedback-dialog" @click.stop>
      <div class="feedback-header">
        <h3>{{ t('feedback.title') }}</h3>
        <button class="close-btn" @click="close">×</button>
      </div>

      <div class="feedback-body">
        <form @submit.prevent="submit">
          <div class="form-group">
            <label for="feedback-type">{{ t('feedback.typeLabel') }}</label>
            <select id="feedback-type" v-model="form.type" required>
              <option value="">{{ t('feedback.typePlaceholder') }}</option>
              <option value="bug">{{ t('feedback.typeBug') }}</option>
              <option value="feature">{{ t('feedback.typeFeature') }}</option>
              <option value="improvement">{{ t('feedback.typeImprovement') }}</option>
              <option value="other">{{ t('feedback.typeOther') }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="feedback-content">{{ t('feedback.contentLabel') }}</label>
            <textarea
              id="feedback-content"
              v-model="form.content"
              :placeholder="t('feedback.contentPlaceholder')"
              rows="6"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="feedback-email">{{ t('feedback.emailLabel') }}</label>
            <input
              id="feedback-email"
              v-model="form.email"
              type="email"
              :placeholder="t('feedback.emailPlaceholder')"
            />
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="close">
              {{ t('feedback.cancel') }}
            </button>
            <button type="submit" class="submit-btn" :disabled="submitting">
              {{ submitting ? t('feedback.submitting') : t('feedback.submit') }}
            </button>
          </div>
        </form>

        <div v-if="message" class="message" :class="messageType">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from '../i18n'
import { sendFeedbackEmail, isEmailJSConfigured } from '../core/email'

const { t } = useI18n()

// 检查 EmailJS 是否配置
const emailConfigured = ref(false)

onMounted(() => {
  emailConfigured.value = isEmailJSConfigured()
  if (!emailConfigured.value) {
    console.warn('EmailJS not configured, feedback form will use mailto fallback')
  }
})

const visible = ref(false)
const submitting = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const form = reactive({
  type: '',
  content: '',
  email: ''
})

const open = () => {
  visible.value = true
  message.value = ''
}

const close = () => {
  visible.value = false
  // 重置表单
  form.type = ''
  form.content = ''
  form.email = ''
}

const submit = async () => {
  submitting.value = true
  message.value = ''

  console.log('[Feedback] Submitting feedback, EmailJS configured:', emailConfigured.value)

  try {
    // 优先使用 EmailJS 发送邮件
    if (emailConfigured.value) {
      const result = await sendFeedbackEmail({
        type: form.type,
        content: form.content,
        email: form.email,
      })

      if (result.success) {
        message.value = result.message
        messageType.value = 'success'

        // 延迟关闭对话框
        setTimeout(() => {
          close()
        }, 2000)
      } else {
        message.value = result.message
        messageType.value = 'error'
      }
    } else {
      // 回退到 mailto 方案
      const subject = `[AI Tools 反馈] ${form.type} - ${new Date().toLocaleDateString()}`
      const body = `
反馈类型: ${form.type}
反馈时间: ${new Date().toLocaleString()}
联系邮箱: ${form.email || '未提供'}

反馈内容:
${form.content}
      `.trim()

      const mailtoLink = `mailto:songjiuhua91@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

      // 使用 window.open 而不是 window.location.href，避免页面跳转
      window.open(mailtoLink, '_blank')

      message.value = t('feedback.success') + ' (已打开邮件客户端)'
      messageType.value = 'success'

      // 立即关闭对话框
      setTimeout(() => {
        close()
      }, 1500)
    }
  } catch (error) {
    message.value = t('feedback.error')
    messageType.value = 'error'
    console.error('提交反馈失败:', error)
  } finally {
    submitting.value = false
  }
}

defineExpose({
  open,
  close
})
</script>

<style scoped>
.feedback-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.feedback-dialog {
  background: var(--bg-primary, #ffffff);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-width: 560px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.feedback-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color, #eaecef);
}

.feedback-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #24292e);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-secondary, #586069);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-secondary, #f6f8fa);
  color: var(--text-primary, #24292e);
}

.feedback-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #24292e);
}

.form-group select,
.form-group textarea,
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color, #eaecef);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: var(--bg-primary, #ffffff);
  color: var(--text-primary, #24292e);
  transition: all 0.2s;
}

.form-group select:focus,
.form-group textarea:focus,
.form-group input:focus {
  outline: none;
  border-color: var(--accent-color, #0366d6);
  box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn,
.submit-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.cancel-btn {
  background: var(--bg-secondary, #f6f8fa);
  color: var(--text-primary, #24292e);
  border: 1px solid var(--border-color, #eaecef);
}

.cancel-btn:hover {
  background: var(--bg-tertiary, #e1e4e8);
}

.submit-btn {
  background: var(--accent-color, #0366d6);
  color: white;
  border: 1px solid var(--accent-color, #0366d6);
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent-hover, #0255b8);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .feedback-dialog {
    width: 95%;
    max-height: 95vh;
  }

  .feedback-header,
  .feedback-body {
    padding: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>
