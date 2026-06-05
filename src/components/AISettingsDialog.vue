<template>
  <Teleport to="body">
    <div v-if="visible" class="ai-settings-overlay" @click="$emit('close')">
      <div class="ai-settings-dialog" @click.stop>
        <div class="dialog-header">
          <h2>{{ t('ai.settingsTitle') }}</h2>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>

        <div class="dialog-body">
          <div class="form-group">
            <label>{{ t('ai.provider') }}</label>
            <select v-model="config.provider" @change="onProviderChange" class="form-select">
              <option v-for="p in providers" :key="p.value" :value="p.value">
                {{ p.label }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>{{ t('ai.apiKey') }}</label>
            <input
              v-model="config.apiKey"
              type="password"
              class="form-input"
              :placeholder="t('ai.apiKeyPlaceholder')"
              autocomplete="off"
            />
            <div class="hint">{{ t('ai.apiKeyHint') }}</div>
          </div>

          <div class="form-group">
            <label>{{ t('ai.model') }}</label>
            <input v-model="config.model" class="form-input" :placeholder="t('ai.modelPlaceholder')" />
          </div>

          <div class="form-group">
            <label>{{ t('ai.baseUrl') }}</label>
            <input v-model="config.baseUrl" class="form-input" :placeholder="t('ai.baseUrlPlaceholder')" />
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>
          <div v-if="success" class="success-msg">{{ success }}</div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-primary" @click="testAndSave">{{ t('ai.testAndSave') }}</button>
          <button class="btn btn-secondary" @click="save">{{ t('ai.save') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from '../i18n'
import { setAIConfig, getProviderDefaults, chat, type AIProvider } from '../services/ai'

const { t } = useI18n()

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const providers = [
  { value: 'openai' as AIProvider, label: 'OpenAI' },
  { value: 'anthropic' as AIProvider, label: 'Anthropic Claude' },
  { value: 'deepseek' as AIProvider, label: 'DeepSeek' },
  { value: 'custom' as AIProvider, label: 'Custom (OpenAI-compatible)' },
]

const config = reactive({ ...getStoredConfig() })
const error = ref('')
const success = ref('')

function getStoredConfig() {
  const stored = localStorage.getItem('ai-tools-ai-config')
  if (stored) return JSON.parse(stored)
  return {
    provider: 'openai' as AIProvider,
    apiKey: '',
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
  }
}

function onProviderChange() {
  if (config.provider === 'custom') return
  const defaults = getProviderDefaults(config.provider)
  config.model = defaults.model
  config.baseUrl = defaults.baseUrl
}

async function testAndSave() {
  error.value = ''
  success.value = ''
  if (!config.apiKey) {
    error.value = t('ai.errorApiKey')
    return
  }
  setAIConfig({ ...config })
  try {
    const reply = await chat([
      { role: 'system', content: 'You are a helpful assistant. Reply with only \"OK\".' },
      { role: 'user', content: 'Hello' },
    ])
    success.value = t('ai.testSuccess') + (reply ? `: ${reply.slice(0, 50)}` : '')
  } catch (e) {
    error.value = (e as Error).message
  }
}

function save() {
  setAIConfig({ ...config })
  emit('close')
}
</script>

<style scoped>
.ai-settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.ai-settings-dialog {
  background: #fff;
  border-radius: 12px;
  width: 480px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.dialog-header h2 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  border-radius: 4px;
}

.close-btn:hover {
  background: #f0f0f0;
}

.dialog-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #555;
}

.form-input,
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4CAF50;
}

.hint {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.error-msg {
  color: #d73a49;
  font-size: 12px;
  padding: 8px 12px;
  background: #ffeaea;
  border-radius: 4px;
  margin-top: 8px;
}

.success-msg {
  color: #1a7f37;
  font-size: 12px;
  padding: 8px 12px;
  background: #e6f4ea;
  border-radius: 4px;
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #eee;
  background: #fafafa;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  font-size: 13px;
  cursor: pointer;
}

.btn-primary {
  background: #4CAF50;
  color: #fff;
}

.btn-primary:hover {
  background: #43a047;
}

.btn-secondary {
  background: #f0f0f0;
  color: #555;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>