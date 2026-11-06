import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'

import App from './App.vue'
import { installNativeDialogScrollLock } from '@/utils/modal-scroll-lock'
import { locale, setLocale } from '@/i18n'
export function createApp() {
  // 创建 Vue 应用
  const app = createSSRApp(App)
  // 创建 Pinia
  const pinia = createPinia()
  // 使用 Pinia 持久化插件
  pinia.use(persist)
  // 使用 Pinia 插件
  app.use(pinia)
  installNativeDialogScrollLock()
  setLocale(locale.value)

  return {
    app,
  }
}
