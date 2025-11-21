import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/styles/theme.css'
import App from './App.vue'
import router from './router'
import { useAutoTheme } from './composables/useAutoTheme'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)

// 自动亮度/主题切换初始化
useAutoTheme()

app.mount('#app')