import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initAnalytics } from './core/analytics'

const app = createApp(App)
app.use(router)
app.mount('#app')

// 初始化统计（需要检查用户同意状态）
initAnalytics()
